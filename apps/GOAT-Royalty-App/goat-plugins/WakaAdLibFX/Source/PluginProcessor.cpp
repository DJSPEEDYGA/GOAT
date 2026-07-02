#include "PluginProcessor.h"
#include "GoatDSP.h"

namespace {
    goat::DelayLine adDelay;
    juce::dsp::Reverb adRev;
    goat::SVF adHPF, adLPF;
    float modPhase = 0.f;
}

WakaAdLibFXProcessor::WakaAdLibFXProcessor()
  : juce::AudioProcessor(BusesProperties()
      .withInput("Input", juce::AudioChannelSet::stereo(), true)
      .withOutput("Output", juce::AudioChannelSet::stereo(), true)),
    apvts(*this, nullptr, "PARAMS", makeLayout())
{}

juce::AudioProcessorValueTreeState::ParameterLayout WakaAdLibFXProcessor::makeLayout()
{
    using P = juce::AudioParameterFloat;
    using C = juce::AudioParameterChoice;
    std::vector<std::unique_ptr<juce::RangedAudioParameter>> p;
    p.push_back(std::make_unique<C>(juce::ParameterID{"mode",1}, "Mode",
        juce::StringArray{"Standard","Ghost","Throwback","Robot","Tunnel","Church","Club"}, 0));
    p.push_back(std::make_unique<P>(juce::ParameterID{"delay",1},  "Delay (ms)",  juce::NormalisableRange<float>(1.f,1000.f,0.1f,0.3f), 180.f));
    p.push_back(std::make_unique<P>(juce::ParameterID{"fb",1},     "Feedback",    juce::NormalisableRange<float>(0.f,0.9f), 0.35f));
    p.push_back(std::make_unique<P>(juce::ParameterID{"reverb",1}, "Reverb",      juce::NormalisableRange<float>(0.f,1.f), 0.4f));
    p.push_back(std::make_unique<P>(juce::ParameterID{"mod",1},    "Modulation",  juce::NormalisableRange<float>(0.f,1.f), 0.f));
    p.push_back(std::make_unique<P>(juce::ParameterID{"pitch",1},  "Pitch Shift (st)", juce::NormalisableRange<float>(-12.f,12.f,0.1f), 0.f));
    p.push_back(std::make_unique<P>(juce::ParameterID{"gate",1},   "Gate",        juce::NormalisableRange<float>(0.f,1.f), 0.f));
    p.push_back(std::make_unique<P>(juce::ParameterID{"mix",1},    "Mix",         juce::NormalisableRange<float>(0.f,1.f), 0.5f));
    p.push_back(std::make_unique<P>(juce::ParameterID{"output",1}, "Output",      juce::NormalisableRange<float>(-24.f,12.f,0.1f), 0.f));
    return { p.begin(), p.end() };
}

void WakaAdLibFXProcessor::prepareToPlay(double sampleRate, int spb)
{
    sr = sampleRate;
    adDelay.prepare(sampleRate, 2.0);
    adHPF.reset(); adLPF.reset();
    adRev.setSampleRate(sampleRate);
    modPhase = 0.f;
    juce::ignoreUnused(spb);
}

bool WakaAdLibFXProcessor::isBusesLayoutSupported(const BusesLayout& layouts) const
{
    return layouts.getMainInputChannelSet() == layouts.getMainOutputChannelSet();
}

void WakaAdLibFXProcessor::processBlock(juce::AudioBuffer<float>& buffer, juce::MidiBuffer&)
{
    juce::ScopedNoDenormals nd;
    const int mode = (int) apvts.getRawParameterValue("mode")->load();
    const float delayMs = apvts.getRawParameterValue("delay")->load();
    const float fb      = apvts.getRawParameterValue("fb")->load();
    const float rev     = apvts.getRawParameterValue("reverb")->load();
    const float mod     = apvts.getRawParameterValue("mod")->load();
    const float mix     = apvts.getRawParameterValue("mix")->load();
    const float outDb   = apvts.getRawParameterValue("output")->load();

    // Mode presets tint
    float hiCut = 12000.f, loCut = 150.f, revSize = 0.5f;
    switch (mode) {
        case 1: hiCut=6000.f; revSize=0.9f; break;   // Ghost
        case 2: hiCut=4000.f; loCut=300.f; break;    // Throwback
        case 3: hiCut=3500.f; break;                  // Robot
        case 4: hiCut=5000.f; revSize=0.95f; break;  // Tunnel
        case 5: revSize=0.99f; break;                 // Church
        case 6: revSize=0.3f;  break;                 // Club
    }

    adLPF.set(sr, hiCut, 0.707f, goat::SVF::LP);
    adHPF.set(sr, loCut, 0.707f, goat::SVF::HP);

    juce::dsp::Reverb::Parameters rp;
    rp.roomSize = revSize;
    rp.damping  = 0.5f;
    rp.width    = 1.f;
    rp.wetLevel = rev;
    rp.dryLevel = 1.f - rev;
    rp.freezeMode = 0.f;
    adRev.setParameters(rp);

    const int N = buffer.getNumSamples();
    const double delaySamp = delayMs * 0.001 * sr;
    auto* L = buffer.getWritePointer(0);
    auto* R = buffer.getNumChannels() > 1 ? buffer.getWritePointer(1) : L;

    static float fbSt = 0.f;
    for (int i=0;i<N;++i) {
        const float drySum = (L[i] + R[i]) * 0.5f;
        const float d = adDelay.read(delaySamp + std::sin(modPhase) * mod * 20.f);
        const float filtered = adHPF.process(adLPF.process(d));
        fbSt = drySum + filtered * fb;
        adDelay.write(fbSt);
        modPhase += (float)(2.0 * juce::MathConstants<double>::pi * 0.5 / sr); // 0.5 Hz
        if (modPhase > 2.f * juce::MathConstants<float>::pi) modPhase -= 2.f * juce::MathConstants<float>::pi;

        L[i] = L[i] * (1.f - mix) + filtered * mix;
        R[i] = R[i] * (1.f - mix) + filtered * mix;
    }
    if (buffer.getNumChannels() >= 2)
        adRev.processStereo(L, R, N);
    else
        adRev.processMono(L, N);
    buffer.applyGain(juce::Decibels::decibelsToGain(outDb));
}

void WakaAdLibFXProcessor::getStateInformation(juce::MemoryBlock& destData)
{ if (auto xml = apvts.copyState().createXml()) copyXmlToBinary(*xml, destData); }
void WakaAdLibFXProcessor::setStateInformation(const void* data, int sizeInBytes)
{ if (auto xml = getXmlFromBinary(data, sizeInBytes)) apvts.replaceState(juce::ValueTree::fromXml(*xml)); }

juce::AudioProcessor* JUCE_CALLTYPE createPluginFilter() { return new WakaAdLibFXProcessor(); }
