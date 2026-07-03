/*
  BrickSquad 808 — Custom Editor with SSL-style knobs
*/
#pragma once
#include <juce_audio_processors/juce_audio_processors.h>
#include "PluginProcessor.h"
#include "../../Common/GoatBranding.h"

class BrickSquad808Editor : public juce::AudioProcessorEditor, private juce::Timer {
public:
    explicit BrickSquad808Editor(BrickSquad808Processor&);
    ~BrickSquad808Editor() override = default;
    void paint(juce::Graphics&) override;
    void resized() override;
private:
    void timerCallback() override;
    void makeKnob(juce::Slider&, juce::Label&, const juce::String&);

    BrickSquad808Processor& proc;
    goat::GoatLookAndFeel laf;
    goat::GoatHeader header { "BRICKSQUAD 808" };

    juce::Slider subKnob, subFreqKnob, clickKnob, driveKnob, glueKnob, outKnob, mixKnob;
    juce::Label  subLbl, subFreqLbl, clickLbl, driveLbl, glueLbl, outLbl, mixLbl;

    std::unique_ptr<juce::AudioProcessorValueTreeState::SliderAttachment>
        a_sub, a_subFreq, a_click, a_drive, a_glue, a_out, a_mix;

    JUCE_DECLARE_NON_COPYABLE_WITH_LEAK_DETECTOR(BrickSquad808Editor)
};