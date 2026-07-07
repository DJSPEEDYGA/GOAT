/*
  BrickSquad 808 — 808 Bass Enhancer
  Sub boost, click layer, distortion, glide, sidechain input
*/
#pragma once
#include <juce_audio_processors/juce_audio_processors.h>
#include "../../Common/GoatDSP.h"

class BrickSquad808Processor : public juce::AudioProcessor {
public:
    BrickSquad808Processor();
    ~BrickSquad808Processor() override = default;

    void prepareToPlay(double, int) override;
    void releaseResources() override {}
    bool isBusesLayoutSupported(const BusesLayout&) const override;
    void processBlock(juce::AudioBuffer<float>&, juce::MidiBuffer&) override;

    juce::AudioProcessorEditor* createEditor() override;
    bool hasEditor() const override { return true; }

    const juce::String getName() const override { return "BrickSquad 808"; }
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

private:
    goat::SVF subLP, clickHP, toneHP;
    goat::TapeSaturator drive;
    goat::Compressor glueComp;
    goat::OnePole sm[8];

    JUCE_DECLARE_NON_COPYABLE_WITH_LEAK_DETECTOR(BrickSquad808Processor)
};