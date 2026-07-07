/*
  GOAT Bus — Master Bus Processor
  Glue Comp + Tilt EQ + Soft Clip + Stereo Width + K-Meter
*/
#pragma once
#include <juce_audio_processors/juce_audio_processors.h>
#include "../../Common/GoatDSP.h"

class GoatBusProcessor : public juce::AudioProcessor {
public:
    GoatBusProcessor();
    ~GoatBusProcessor() override = default;

    void prepareToPlay(double, int) override;
    void releaseResources() override {}
    bool isBusesLayoutSupported(const BusesLayout&) const override;
    void processBlock(juce::AudioBuffer<float>&, juce::MidiBuffer&) override;

    juce::AudioProcessorEditor* createEditor() override { return new juce::GenericAudioProcessorEditor(*this); }
    bool hasEditor() const override { return true; }
    const juce::String getName() const override { return "GOAT Bus"; }
    bool acceptsMidi() const override { return false; }
    bool producesMidi() const override { return false; }
    bool isMidiEffect() const override { return false; }
    double getTailLengthSeconds() const override { return 0.0; }
    int getNumPrograms() override { return 1; }
    int getCurrentProgram() override { return 0; }
    void setCurrentProgram(int) override {}
    const juce::String getProgramName(int) override { return {}; }
    void changeProgramName(int, const juce::String&) override {}
    void getStateInformation(juce::MemoryBlock& d) override {
        if (auto x = apvts.copyState().createXml()) copyXmlToBinary(*x, d);
    }
    void setStateInformation(const void* d, int s) override {
        if (auto x = getXmlFromBinary(d, s)) apvts.replaceState(juce::ValueTree::fromXml(*x));
    }

    juce::AudioProcessorValueTreeState apvts;
    static juce::AudioProcessorValueTreeState::ParameterLayout layout();

    std::atomic<float> lufsIntegrated { -23.0f };
    std::atomic<float> peakL { 0.0f }, peakR { 0.0f };

private:
    std::array<goat::Compressor, 2> glue;
    std::array<goat::SVF, 2> tiltLo, tiltHi;
    goat::OnePole sm[8];
    float lufsAccum = 0.0f;
    int   lufsCount = 0;
    JUCE_DECLARE_NON_COPYABLE_WITH_LEAK_DETECTOR(GoatBusProcessor)
};