/*
  Waka Vocal Chain — HPF + 3-Band EQ + Comp + De-Ess + Saturator + Reverb Send
*/
#pragma once
#include <juce_audio_processors/juce_audio_processors.h>
#include "../../Common/GoatDSP.h"

class WakaVocalChainProcessor : public juce::AudioProcessor {
public:
    WakaVocalChainProcessor();
    ~WakaVocalChainProcessor() override = default;

    void prepareToPlay(double, int) override;
    void releaseResources() override {}
    bool isBusesLayoutSupported(const BusesLayout&) const override;
    void processBlock(juce::AudioBuffer<float>&, juce::MidiBuffer&) override;

    juce::AudioProcessorEditor* createEditor() override { return new juce::GenericAudioProcessorEditor(*this); }
    bool hasEditor() const override { return true; }
    const juce::String getName() const override { return "Waka Vocal Chain"; }
    bool acceptsMidi() const override { return false; }
    bool producesMidi() const override { return false; }
    bool isMidiEffect() const override { return false; }
    double getTailLengthSeconds() const override { return 2.0; } // reverb tail
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

private:
    std::array<goat::SVF, 2> hpf, eqLo, eqMid, eqHi, deEss;
    std::array<goat::Compressor, 2> comp;
    std::array<goat::TapeSaturator, 2> sat;
    juce::dsp::Reverb verb;
    goat::OnePole sm[10];
    JUCE_DECLARE_NON_COPYABLE_WITH_LEAK_DETECTOR(WakaVocalChainProcessor)
};