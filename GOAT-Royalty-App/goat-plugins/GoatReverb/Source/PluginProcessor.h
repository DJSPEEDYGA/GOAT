#pragma once
#include <JuceHeader.h>

class GoatReverbProcessor : public juce::AudioProcessor
{
public:
    GoatReverbProcessor();
    ~GoatReverbProcessor() override = default;

    void prepareToPlay(double sampleRate, int samplesPerBlock) override;
    void releaseResources() override {}
    bool isBusesLayoutSupported(const BusesLayout& layouts) const override;
    void processBlock(juce::AudioBuffer<float>&, juce::MidiBuffer&) override;

    juce::AudioProcessorEditor* createEditor() override { return new juce::GenericAudioProcessorEditor(*this); }
    bool hasEditor() const override { return true; }

    const juce::String getName() const override { return "GOAT Reverb"; }
    bool acceptsMidi() const override { return false; }
    bool producesMidi() const override { return false; }
    double getTailLengthSeconds() const override { return 8.0; }

    int getNumPrograms() override { return 1; }
    int getCurrentProgram() override { return 0; }
    void setCurrentProgram(int) override {}
    const juce::String getProgramName(int) override { return {}; }
    void changeProgramName(int, const juce::String&) override {}

    void getStateInformation(juce::MemoryBlock& destData) override;
    void setStateInformation(const void* data, int sizeInBytes) override;

    juce::AudioProcessorValueTreeState apvts;

private:
    juce::dsp::Reverb reverbA, reverbB;
    juce::AudioProcessorValueTreeState::ParameterLayout makeLayout();

    JUCE_DECLARE_NON_COPYABLE_WITH_LEAK_DETECTOR(GoatReverbProcessor)
};