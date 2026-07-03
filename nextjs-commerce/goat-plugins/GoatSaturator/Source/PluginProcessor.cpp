/*
  ==============================================================================
    GOAT Saturator — PluginProcessor.cpp
  ==============================================================================
*/
#include "PluginProcessor.h"
#include "PluginEditor.h"

GoatSaturatorProcessor::GoatSaturatorProcessor()
    : AudioProcessor(BusesProperties()
          .withInput("Input", juce::AudioChannelSet::stereo(), true)
          .withOutput("Output", juce::AudioChannelSet::stereo(), true)),
      apvts(*this, nullptr, "PARAMS", createLayout())
{}

juce::AudioProcessorValueTreeState::ParameterLayout
GoatSaturatorProcessor::createLayout()
{
    using P = juce::AudioParameterFloat;
    using C = juce::AudioParameterChoice;
    using B = juce::AudioParameterBool;
    std::vector<std::unique_ptr<juce::RangedAudioParameter>> params;

    params.push_back(std::make_unique<P>(juce::ParameterID{"drive", 1},     "Drive",     juce::NormalisableRange<float>(0.0f, 1.0f, 0.001f),  0.35f));
    params.push_back(std::make_unique<P>(juce::ParameterID{"bias",  1},     "Bias",      juce::NormalisableRange<float>(-0.5f, 0.5f, 0.001f), 0.0f));
    params.push_back(std::make_unique<P>(juce::ParameterID{"tone",  1},     "Tone (Hz)", juce::NormalisableRange<float>(2000.0f, 20000.0f, 1.0f, 0.4f), 12000.0f));
    params.push_back(std::make_unique<P>(juce::ParameterID{"air",   1},     "Air (dB)",  juce::NormalisableRange<float>(-6.0f, 12.0f, 0.1f),  0.0f));
    params.push_back(std::make_unique<P>(juce::ParameterID{"mix",   1},     "Mix",       juce::NormalisableRange<float>(0.0f, 1.0f, 0.001f),  1.0f));
    params.push_back(std::make_unique<P>(juce::ParameterID{"output",1},     "Output (dB)",juce::NormalisableRange<float>(-24.0f, 12.0f, 0.1f), 0.0f));
    params.push_back(std::make_unique<C>(juce::ParameterID{"mode",  1},     "Mode",
        juce::StringArray{"TAPE", "TUBE", "TRANSFORMER", "GOAT"}, 0));
    params.push_back(std::make_unique<B>(juce::ParameterID{"oversample",1}, "Oversample", true));

    return { params.begin(), params.end() };
}

void GoatSaturatorProcessor::prepareToPlay(double sr, int /*spb*/)
{
    for (auto& t : tape) {
        t.setHiCut(12000.0f, sr);
        t.setDrive(0.35f);
    }
    for (auto& f : airBand) {
        f.prepare(sr);
        f.setType(goat::SVF::HighShelf);
        f.setFreq(10000.0f);
        f.setQ(0.707f);
        f.setGainDb(0.0f);
    }
    for (auto& d : dcBlocker) {
        d.prepare(sr);
        d.setType(goat::SVF::HighPass);
        d.setFreq(20.0f);
        d.setQ(0.707f);
    }
    for (auto& sm : smoothers) sm.prepare(sr, 20.0f);
}

bool GoatSaturatorProcessor::isBusesLayoutSupported(const BusesLayout& layouts) const
{
    const auto& in  = layouts.getMainInputChannelSet();
    const auto& out = layouts.getMainOutputChannelSet();
    if (in.isDisabled() || out.isDisabled()) return false;
    if (in != out) return false;
    return in == juce::AudioChannelSet::mono() || in == juce::AudioChannelSet::stereo();
}

void GoatSaturatorProcessor::processBlock(juce::AudioBuffer<float>& buf, juce::MidiBuffer&)
{
    juce::ScopedNoDenormals noDenorms;
    const int numCh     = buf.getNumChannels();
    const int numSamp   = buf.getNumSamples();

    const float drive   = smoothers[0].process(apvts.getRawParameterValue("drive")->load());
    const float bias    = smoothers[1].process(apvts.getRawParameterValue("bias") ->load());
    const float tone    = smoothers[2].process(apvts.getRawParameterValue("tone") ->load());
    const float airDb   = smoothers[3].process(apvts.getRawParameterValue("air")  ->load());
    const float mix     = smoothers[4].process(apvts.getRawParameterValue("mix")  ->load());
    const float outGain = goat::dbToGain(smoothers[5].process(apvts.getRawParameterValue("output")->load()));
    const int   mode    = (int) apvts.getRawParameterValue("mode")->load();

    // Mode tuning
    float driveScale = 1.0f;
    float biasOffset = 0.0f;
    switch (mode) {
        case 0: driveScale = 1.0f; biasOffset = 0.00f; break; // TAPE
        case 1: driveScale = 1.3f; biasOffset = 0.05f; break; // TUBE (2nd harmonic emphasis)
        case 2: driveScale = 0.8f; biasOffset = 0.00f; break; // TRANSFORMER
        case 3: driveScale = 1.8f; biasOffset = 0.10f; break; // GOAT (extreme)
    }

    float inPeak = 0.0f, outPeak = 0.0f;

    for (int ch = 0; ch < numCh && ch < 2; ++ch) {
        auto* data = buf.getWritePointer(ch);
        tape[ch].setDrive(drive * driveScale);
        tape[ch].setBias(bias + biasOffset);
        airBand[ch].setFreq(tone);
        airBand[ch].setGainDb(airDb);

        for (int i = 0; i < numSamp; ++i) {
            const float in = data[i];
            inPeak = std::max(inPeak, std::abs(in));

            float sat = tape[ch].process(in);
            sat = airBand[ch].process(sat);
            sat = dcBlocker[ch].process(sat);

            const float wet = (1.0f - mix) * in + mix * sat;
            const float out = wet * outGain;
            data[i] = out;
            outPeak = std::max(outPeak, std::abs(out));
        }
    }
    meterIn.store(inPeak);
    meterOut.store(outPeak);
}

juce::AudioProcessorEditor* GoatSaturatorProcessor::createEditor()
{
    return new GoatSaturatorEditor(*this);
}

void GoatSaturatorProcessor::getStateInformation(juce::MemoryBlock& dest)
{
    if (auto xml = apvts.copyState().createXml())
        copyXmlToBinary(*xml, dest);
}
void GoatSaturatorProcessor::setStateInformation(const void* data, int size)
{
    if (auto xml = getXmlFromBinary(data, size))
        apvts.replaceState(juce::ValueTree::fromXml(*xml));
}

// --- JUCE factory ---
juce::AudioProcessor* JUCE_CALLTYPE createPluginFilter() {
    return new GoatSaturatorProcessor();
}