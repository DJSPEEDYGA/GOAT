#include "PluginProcessor.h"

GoatReverbProcessor::GoatReverbProcessor()
  : juce::AudioProcessor(BusesProperties()
      .withInput("Input", juce::AudioChannelSet::stereo(), true)
      .withOutput("Output", juce::AudioChannelSet::stereo(), true)),
    apvts(*this, nullptr, "PARAMS", makeLayout())
{}

juce::AudioProcessorValueTreeState::ParameterLayout GoatReverbProcessor::makeLayout()
{
    using P = juce::AudioParameterFloat;
    using C = juce::AudioParameterChoice;
    std::vector<std::unique_ptr<juce::RangedAudioParameter>> p;
    p.push_back(std::make_unique<C>(juce::ParameterID{"mode",1}, "Mode",
        juce::StringArray{"Plate","Hall","Studio","GOAT"}, 0));
    p.push_back(std::make_unique<P>(juce::ParameterID{"size",1},   "Size",       juce::NormalisableRange<float>(0.f,1.f), 0.6f));
    p.push_back(std::make_unique<P>(juce::ParameterID{"damp",1},   "Damping",    juce::NormalisableRange<float>(0.f,1.f), 0.5f));
    p.push_back(std::make_unique<P>(juce::ParameterID{"width",1},  "Width",      juce::NormalisableRange<float>(0.f,1.f), 1.0f));
    p.push_back(std::make_unique<P>(juce::ParameterID{"predelay",1},"Pre-delay", juce::NormalisableRange<float>(0.f,200.f,0.1f,0.5f), 20.f));
    p.push_back(std::make_unique<P>(juce::ParameterID{"mix",1},    "Mix",        juce::NormalisableRange<float>(0.f,1.f), 0.25f));
    p.push_back(std::make_unique<P>(juce::ParameterID{"output",1}, "Output",     juce::NormalisableRange<float>(-24.f,12.f,0.1f), 0.f));
    return { p.begin(), p.end() };
}

void GoatReverbProcessor::prepareToPlay(double sampleRate, int samplesPerBlock)
{
    juce::ignoreUnused(samplesPerBlock);
    reverbA.setSampleRate(sampleRate);
    reverbB.setSampleRate(sampleRate);
}

bool GoatReverbProcessor::isBusesLayoutSupported(const BusesLayout& layouts) const
{
    auto in = layouts.getMainInputChannelSet();
    auto out = layouts.getMainOutputChannelSet();
    return (in == juce::AudioChannelSet::stereo() || in == juce::AudioChannelSet::mono())
        && (out == juce::AudioChannelSet::stereo() || out == juce::AudioChannelSet::mono());
}

void GoatReverbProcessor::processBlock(juce::AudioBuffer<float>& buffer, juce::MidiBuffer&)
{
    juce::ScopedNoDenormals nd;

    const float size   = apvts.getRawParameterValue("size")->load();
    const float damp   = apvts.getRawParameterValue("damp")->load();
    const float width  = apvts.getRawParameterValue("width")->load();
    const float mix    = apvts.getRawParameterValue("mix")->load();
    const float outDb  = apvts.getRawParameterValue("output")->load();

    juce::dsp::Reverb::Parameters params;
    params.roomSize   = size;
    params.damping    = damp;
    params.width      = width;
    params.wetLevel   = mix;
    params.dryLevel   = 1.f - mix;
    params.freezeMode = 0.f;
    reverbA.setParameters(params);
    reverbB.setParameters(params);

    const int numCh = buffer.getNumChannels();
    const int numSamples = buffer.getNumSamples();

    if (numCh >= 2)
        reverbA.processStereo(buffer.getWritePointer(0), buffer.getWritePointer(1), numSamples);
    else if (numCh == 1)
        reverbA.processMono(buffer.getWritePointer(0), numSamples);

    // Output gain
    buffer.applyGain(juce::Decibels::decibelsToGain(outDb));
}

void GoatReverbProcessor::getStateInformation(juce::MemoryBlock& destData)
{
    if (auto xml = apvts.copyState().createXml())
        copyXmlToBinary(*xml, destData);
}

void GoatReverbProcessor::setStateInformation(const void* data, int sizeInBytes)
{
    if (auto xml = getXmlFromBinary(data, sizeInBytes))
        apvts.replaceState(juce::ValueTree::fromXml(*xml));
}

juce::AudioProcessor* JUCE_CALLTYPE createPluginFilter() { return new GoatReverbProcessor(); }