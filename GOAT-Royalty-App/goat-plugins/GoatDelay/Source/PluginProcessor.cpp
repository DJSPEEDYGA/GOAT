#include "PluginProcessor.h"
#include "GoatDSP.h"

namespace { goat::DelayLine delayL, delayR; goat::SVF hpfL, hpfR, lpfL, lpfR; float fbL=0.f, fbR=0.f; }

GoatDelayProcessor::GoatDelayProcessor()
  : juce::AudioProcessor(BusesProperties()
      .withInput("Input", juce::AudioChannelSet::stereo(), true)
      .withOutput("Output", juce::AudioChannelSet::stereo(), true)),
    apvts(*this, nullptr, "PARAMS", makeLayout())
{}

juce::AudioProcessorValueTreeState::ParameterLayout GoatDelayProcessor::makeLayout()
{
    using P = juce::AudioParameterFloat;
    using B = juce::AudioParameterBool;
    using C = juce::AudioParameterChoice;
    std::vector<std::unique_ptr<juce::RangedAudioParameter>> p;
    p.push_back(std::make_unique<C>(juce::ParameterID{"sync",1}, "Sync", juce::StringArray{"Free","1/4","1/8","1/8T","1/16","1/16T","1/4D","1/8D"}, 0));
    p.push_back(std::make_unique<P>(juce::ParameterID{"timeL",1},  "Time L (ms)", juce::NormalisableRange<float>(1.f,2000.f,0.1f,0.3f), 375.f));
    p.push_back(std::make_unique<P>(juce::ParameterID{"timeR",1},  "Time R (ms)", juce::NormalisableRange<float>(1.f,2000.f,0.1f,0.3f), 500.f));
    p.push_back(std::make_unique<P>(juce::ParameterID{"feedback",1},"Feedback",   juce::NormalisableRange<float>(0.f,0.95f), 0.45f));
    p.push_back(std::make_unique<P>(juce::ParameterID{"hicut",1},  "Hi Cut",      juce::NormalisableRange<float>(1000.f,20000.f,1.f,0.3f), 8000.f));
    p.push_back(std::make_unique<P>(juce::ParameterID{"locut",1},  "Lo Cut",      juce::NormalisableRange<float>(20.f,1000.f,1.f,0.3f), 120.f));
    p.push_back(std::make_unique<P>(juce::ParameterID{"width",1},  "Ping-Pong",   juce::NormalisableRange<float>(0.f,1.f), 0.5f));
    p.push_back(std::make_unique<P>(juce::ParameterID{"mix",1},    "Mix",         juce::NormalisableRange<float>(0.f,1.f), 0.3f));
    p.push_back(std::make_unique<P>(juce::ParameterID{"output",1}, "Output",      juce::NormalisableRange<float>(-24.f,12.f,0.1f), 0.f));
    return { p.begin(), p.end() };
}

void GoatDelayProcessor::prepareToPlay(double sampleRate, int spb)
{
    juce::ignoreUnused(spb);
    sr = sampleRate;
    delayL.prepare(sampleRate, 2.5);
    delayR.prepare(sampleRate, 2.5);
    hpfL.reset(); hpfR.reset(); lpfL.reset(); lpfR.reset();
    fbL = fbR = 0.f;
}

bool GoatDelayProcessor::isBusesLayoutSupported(const BusesLayout& layouts) const
{
    auto in = layouts.getMainInputChannelSet();
    auto out = layouts.getMainOutputChannelSet();
    return (in == juce::AudioChannelSet::stereo()) && (out == juce::AudioChannelSet::stereo());
}

void GoatDelayProcessor::processBlock(juce::AudioBuffer<float>& buffer, juce::MidiBuffer&)
{
    juce::ScopedNoDenormals nd;
    const float tL   = apvts.getRawParameterValue("timeL")->load();
    const float tR   = apvts.getRawParameterValue("timeR")->load();
    const float fb   = apvts.getRawParameterValue("feedback")->load();
    const float hc   = apvts.getRawParameterValue("hicut")->load();
    const float lc   = apvts.getRawParameterValue("locut")->load();
    const float pp   = apvts.getRawParameterValue("width")->load();
    const float mix  = apvts.getRawParameterValue("mix")->load();
    const float outDb= apvts.getRawParameterValue("output")->load();

    lpfL.set(sr, hc, 0.707f, goat::SVF::LP);  lpfR.set(sr, hc, 0.707f, goat::SVF::LP);
    hpfL.set(sr, lc, 0.707f, goat::SVF::HP);  hpfR.set(sr, lc, 0.707f, goat::SVF::HP);

    const double sampL = tL * 0.001 * sr;
    const double sampR = tR * 0.001 * sr;
    const int N = buffer.getNumSamples();
    auto* L = buffer.getWritePointer(0);
    auto* R = buffer.getWritePointer(1);

    const float outG = juce::Decibels::decibelsToGain(outDb);

    for (int i=0;i<N;++i) {
        const float inL = L[i], inR = R[i];
        const float dL = delayL.read(sampL);
        const float dR = delayR.read(sampR);
        // Ping-pong: feedback from opposite channel
        float ppL = dL*(1.f-pp) + dR*pp;
        float ppR = dR*(1.f-pp) + dL*pp;
        // Filter the feedback path
        ppL = lpfL.process(ppL); ppL = hpfL.process(ppL);
        ppR = lpfR.process(ppR); ppR = hpfR.process(ppR);
        fbL = juce::jlimit(-2.f, 2.f, inL + ppL * fb);
        fbR = juce::jlimit(-2.f, 2.f, inR + ppR * fb);
        delayL.write(fbL);
        delayR.write(fbR);
        L[i] = (inL*(1.f-mix) + dL*mix) * outG;
        R[i] = (inR*(1.f-mix) + dR*mix) * outG;
    }
}

void GoatDelayProcessor::getStateInformation(juce::MemoryBlock& destData)
{ if (auto xml = apvts.copyState().createXml()) copyXmlToBinary(*xml, destData); }
void GoatDelayProcessor::setStateInformation(const void* data, int sizeInBytes)
{ if (auto xml = getXmlFromBinary(data, sizeInBytes)) apvts.replaceState(juce::ValueTree::fromXml(*xml)); }

juce::AudioProcessor* JUCE_CALLTYPE createPluginFilter() { return new GoatDelayProcessor(); }
