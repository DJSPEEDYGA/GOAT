#include "PluginProcessor.h"
#include "GoatDSP.h"

namespace { goat::SVF kickShape, kickBoost, kickLP; goat::TapeSaturator kickSat; goat::Compressor kickComp; }

BrickSquadKickProcessor::BrickSquadKickProcessor()
  : juce::AudioProcessor(BusesProperties()
      .withInput("Input", juce::AudioChannelSet::stereo(), true)
      .withOutput("Output", juce::AudioChannelSet::stereo(), true)),
    apvts(*this, nullptr, "PARAMS", makeLayout())
{}

juce::AudioProcessorValueTreeState::ParameterLayout BrickSquadKickProcessor::makeLayout()
{
    using P = juce::AudioParameterFloat;
    std::vector<std::unique_ptr<juce::RangedAudioParameter>> p;
    p.push_back(std::make_unique<P>(juce::ParameterID{"boom",1},    "Boom (dB)",    juce::NormalisableRange<float>(0.f,12.f,0.1f), 4.f));
    p.push_back(std::make_unique<P>(juce::ParameterID{"boomFreq",1},"Boom Freq",    juce::NormalisableRange<float>(40.f,120.f,0.1f,0.5f), 60.f));
    p.push_back(std::make_unique<P>(juce::ParameterID{"body",1},    "Body (dB)",    juce::NormalisableRange<float>(-6.f,9.f,0.1f), 2.f));
    p.push_back(std::make_unique<P>(juce::ParameterID{"bodyFreq",1},"Body Freq",    juce::NormalisableRange<float>(150.f,600.f,0.1f,0.5f), 250.f));
    p.push_back(std::make_unique<P>(juce::ParameterID{"punch",1},   "Punch (dB)",   juce::NormalisableRange<float>(0.f,9.f,0.1f), 3.f));
    p.push_back(std::make_unique<P>(juce::ParameterID{"click",1},   "Click (dB)",   juce::NormalisableRange<float>(0.f,12.f,0.1f), 2.f));
    p.push_back(std::make_unique<P>(juce::ParameterID{"clickFreq",1},"Click Freq",  juce::NormalisableRange<float>(1000.f,8000.f,1.f,0.3f), 3500.f));
    p.push_back(std::make_unique<P>(juce::ParameterID{"glue",1},    "Glue",         juce::NormalisableRange<float>(0.f,1.f), 0.3f));
    p.push_back(std::make_unique<P>(juce::ParameterID{"sat",1},     "Saturation",   juce::NormalisableRange<float>(0.f,1.f), 0.25f));
    p.push_back(std::make_unique<P>(juce::ParameterID{"output",1},  "Output",       juce::NormalisableRange<float>(-24.f,12.f,0.1f), 0.f));
    return { p.begin(), p.end() };
}

void BrickSquadKickProcessor::prepareToPlay(double sampleRate, int spb)
{
    juce::ignoreUnused(spb);
    sr = sampleRate;
    kickShape.reset(); kickBoost.reset(); kickLP.reset();
    kickSat.reset(); kickComp.reset();
}

bool BrickSquadKickProcessor::isBusesLayoutSupported(const BusesLayout& layouts) const
{
    return layouts.getMainInputChannelSet() == layouts.getMainOutputChannelSet();
}

void BrickSquadKickProcessor::processBlock(juce::AudioBuffer<float>& buffer, juce::MidiBuffer&)
{
    juce::ScopedNoDenormals nd;
    const float boom = apvts.getRawParameterValue("boom")->load();
    const float boomF= apvts.getRawParameterValue("boomFreq")->load();
    const float body = apvts.getRawParameterValue("body")->load();
    const float bodyF= apvts.getRawParameterValue("bodyFreq")->load();
    const float punch= apvts.getRawParameterValue("punch")->load();
    const float click= apvts.getRawParameterValue("click")->load();
    const float clickF=apvts.getRawParameterValue("clickFreq")->load();
    const float glue = apvts.getRawParameterValue("glue")->load();
    const float sat  = apvts.getRawParameterValue("sat")->load();
    const float outDb= apvts.getRawParameterValue("output")->load();

    kickShape.set(sr, boomF, 0.8f, goat::SVF::LowShelf, boom);
    kickBoost.set(sr, bodyF, 0.7f, goat::SVF::Peak, body);
    kickLP.set(sr, clickF, 0.6f, goat::SVF::HighShelf, click);
    kickSat.set(0.3f + sat*0.7f, 12000.f);
    kickComp.set(-12.f - punch*0.5f, 3.5f, 0.002f, 0.08f, 4.f, 1.f);

    const int N = buffer.getNumSamples();
    const int ch = buffer.getNumChannels();
    const float outG = juce::Decibels::decibelsToGain(outDb);

    for (int c=0;c<ch;++c) {
        auto* d = buffer.getWritePointer(c);
        for (int i=0;i<N;++i) {
            float x = d[i];
            x = kickShape.process(x);
            x = kickBoost.process(x);
            x = kickLP.process(x);
            if (glue > 0.05f) x = kickComp.process(x);
            if (sat > 0.05f)  x = kickSat.process(x);
            d[i] = x * outG;
        }
    }
}

void BrickSquadKickProcessor::getStateInformation(juce::MemoryBlock& destData)
{ if (auto xml = apvts.copyState().createXml()) copyXmlToBinary(*xml, destData); }
void BrickSquadKickProcessor::setStateInformation(const void* data, int sizeInBytes)
{ if (auto xml = getXmlFromBinary(data, sizeInBytes)) apvts.replaceState(juce::ValueTree::fromXml(*xml)); }

juce::AudioProcessor* JUCE_CALLTYPE createPluginFilter() { return new BrickSquadKickProcessor(); }
