/*
  ==============================================================================
    GOAT Saturator — PluginEditor.h
  ==============================================================================
*/
#pragma once

#include <juce_audio_processors/juce_audio_processors.h>
#include "PluginProcessor.h"
#include "../../Common/GoatBranding.h"

class GoatSaturatorEditor : public juce::AudioProcessorEditor,
                            private juce::Timer
{
public:
    explicit GoatSaturatorEditor(GoatSaturatorProcessor&);
    ~GoatSaturatorEditor() override = default;

    void paint(juce::Graphics&) override;
    void resized() override;

private:
    void timerCallback() override;

    GoatSaturatorProcessor& proc;
    goat::GoatLookAndFeel    laf;
    goat::GoatHeader         header { "SATURATOR" };

    // Knobs
    juce::Slider driveKnob, biasKnob, toneKnob, airKnob, mixKnob, outKnob;
    juce::Label  driveLbl, biasLbl, toneLbl, airLbl, mixLbl, outLbl;

    // Mode selector
    juce::ComboBox modeBox;

    // Oversample toggle
    juce::ToggleButton osButton { "OVERSAMPLE" };

    // Attachments
    std::unique_ptr<juce::AudioProcessorValueTreeState::SliderAttachment>   a_drive, a_bias, a_tone, a_air, a_mix, a_out;
    std::unique_ptr<juce::AudioProcessorValueTreeState::ComboBoxAttachment> a_mode;
    std::unique_ptr<juce::AudioProcessorValueTreeState::ButtonAttachment>   a_os;

    float meterInLvl = 0.0f, meterOutLvl = 0.0f;

    void makeKnob(juce::Slider& s, juce::Label& l, const juce::String& name);

    JUCE_DECLARE_NON_COPYABLE_WITH_LEAK_DETECTOR(GoatSaturatorEditor)
};