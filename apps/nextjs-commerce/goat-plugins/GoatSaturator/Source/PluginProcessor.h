/*
  ==============================================================================
    GOAT Saturator — PluginProcessor.h
    Analog tape saturation + harmonic exciter
    (c) DJ Speedy / GOAT Force / BrickSquad
  ==============================================================================
*/
#pragma once

#include <juce_audio_processors/juce_audio_processors.h>
#include "../../Common/GoatDSP.h"

class GoatSaturatorProcessor : public juce::AudioProcessor {
public:
    GoatSaturatorProcessor();
    ~GoatSaturatorProcessor() override = default;

    // AudioProcessor overrides
    void prepareToPlay(double sampleRate, int samplesPerBlock) override;
    void releaseResources() override {}
    bool isBusesLayoutSupported(const BusesLayout& layouts) const override;
    void processBlock(juce::AudioBuffer<float>&, juce::MidiBuffer&) override;

    juce::AudioProcessorEditor* createEditor() override;
    bool hasEditor() const override { return true; }

    const juce::String getName() const override { return "GOAT Saturator"; }
    bool acceptsMidi() const override { return false; }
    bool producesMidi() const override { return false; }
    bool isMidiEffect() const override { return false; }
    double getTailLengthSeconds() const override { return 0.0; }

    int getNumPrograms() override { return 1; }
    int getCurrentProgram() override { return 0; }
    void setCurrentProgram(int) override {}
    const juce::String getProgramName(int) override { return {}; }
    void changeProgramName(int, const juce::String&) override {}

    void getStateInformation(juce::MemoryBlock&) override;
    void setStateInformation(const void*, int) override;

    // Parameter tree
    juce::AudioProcessorValueTreeState apvts;
    static juce::AudioProcessorValueTreeState::ParameterLayout createLayout();

    // Meter readouts (for editor)
    std::atomic<float> meterIn  { 0.0f };
    std::atomic<float> meterOut { 0.0f };

private:
    std::array<goat::TapeSaturator, 2> tape;       // per-channel
    std::array<goat::SVF, 2>           airBand;    // high-shelf for "air"
    std::array<goat::SVF, 2>           dcBlocker;
    std::array<goat::OnePole, 6>       smoothers;

    JUCE_DECLARE_NON_COPYABLE_WITH_LEAK_DETECTOR(GoatSaturatorProcessor)
};