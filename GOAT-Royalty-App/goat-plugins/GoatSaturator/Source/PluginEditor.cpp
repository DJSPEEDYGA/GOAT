/*
  ==============================================================================
    GOAT Saturator — PluginEditor.cpp
  ==============================================================================
*/
#include "PluginEditor.h"

GoatSaturatorEditor::GoatSaturatorEditor(GoatSaturatorProcessor& p)
    : AudioProcessorEditor(&p), proc(p)
{
    setLookAndFeel(&laf);
    addAndMakeVisible(header);

    makeKnob(driveKnob, driveLbl, "DRIVE");
    makeKnob(biasKnob,  biasLbl,  "BIAS");
    makeKnob(toneKnob,  toneLbl,  "TONE");
    makeKnob(airKnob,   airLbl,   "AIR");
    makeKnob(mixKnob,   mixLbl,   "MIX");
    makeKnob(outKnob,   outLbl,   "OUT");

    modeBox.addItem("TAPE", 1);
    modeBox.addItem("TUBE", 2);
    modeBox.addItem("TRANSFORMER", 3);
    modeBox.addItem("GOAT", 4);
    addAndMakeVisible(modeBox);
    addAndMakeVisible(osButton);

    auto& v = proc.apvts;
    a_drive = std::make_unique<juce::AudioProcessorValueTreeState::SliderAttachment>(v, "drive", driveKnob);
    a_bias  = std::make_unique<juce::AudioProcessorValueTreeState::SliderAttachment>(v, "bias",  biasKnob);
    a_tone  = std::make_unique<juce::AudioProcessorValueTreeState::SliderAttachment>(v, "tone",  toneKnob);
    a_air   = std::make_unique<juce::AudioProcessorValueTreeState::SliderAttachment>(v, "air",   airKnob);
    a_mix   = std::make_unique<juce::AudioProcessorValueTreeState::SliderAttachment>(v, "mix",   mixKnob);
    a_out   = std::make_unique<juce::AudioProcessorValueTreeState::SliderAttachment>(v, "output",outKnob);
    a_mode  = std::make_unique<juce::AudioProcessorValueTreeState::ComboBoxAttachment>(v, "mode", modeBox);
    a_os    = std::make_unique<juce::AudioProcessorValueTreeState::ButtonAttachment>(v, "oversample", osButton);

    setSize(640, 360);
    startTimerHz(30);
}

void GoatSaturatorEditor::makeKnob(juce::Slider& s, juce::Label& l, const juce::String& name)
{
    s.setSliderStyle(juce::Slider::RotaryHorizontalVerticalDrag);
    s.setTextBoxStyle(juce::Slider::TextBoxBelow, false, 72, 18);
    addAndMakeVisible(s);
    l.setText(name, juce::dontSendNotification);
    l.setJustificationType(juce::Justification::centred);
    l.setFont(juce::Font(juce::FontOptions("Helvetica Neue", 10.0f, juce::Font::bold)));
    l.setColour(juce::Label::textColourId, goat::colors::gold);
    addAndMakeVisible(l);
}

void GoatSaturatorEditor::paint(juce::Graphics& g)
{
    // Background
    juce::ColourGradient bg(goat::colors::bg, 0, 0,
                             juce::Colour(0xFF151515), 0, (float)getHeight(), false);
    g.setGradientFill(bg);
    g.fillAll();

    // Vignette
    g.setColour(juce::Colours::black.withAlpha(0.3f));
    g.fillRect(getLocalBounds().removeFromTop(40));

    // Meter bars (in/out)
    const auto meterArea = juce::Rectangle<int>(20, getHeight() - 40, getWidth() - 40, 20);
    g.setColour(goat::colors::panel);
    g.fillRect(meterArea);

    const int halfW = meterArea.getWidth() / 2 - 4;
    const int inW   = juce::jlimit(0, halfW, (int)(meterInLvl  * halfW * 1.5f));
    const int outW  = juce::jlimit(0, halfW, (int)(meterOutLvl * halfW * 1.5f));

    g.setColour(goat::colors::green);
    g.fillRect(meterArea.getX() + 2, meterArea.getY() + 2, inW, meterArea.getHeight() - 4);
    g.setColour(goat::colors::gold);
    g.fillRect(meterArea.getX() + halfW + 4, meterArea.getY() + 2, outW, meterArea.getHeight() - 4);

    g.setColour(goat::colors::textDim);
    g.setFont(juce::Font(juce::FontOptions(8.0f)));
    g.drawText("IN",  meterArea.getX() + 4, meterArea.getY() - 10, 20, 10, juce::Justification::left);
    g.drawText("OUT", meterArea.getX() + halfW + 6, meterArea.getY() - 10, 30, 10, juce::Justification::left);
}

void GoatSaturatorEditor::resized()
{
    auto b = getLocalBounds();
    header.setBounds(b.removeFromTop(40));

    const int knobSize = 80;
    const int rowY = 70;
    const int gap = 16;
    const int startX = 20;

    auto placeKnob = [&](juce::Slider& s, juce::Label& l, int i) {
        const int x = startX + i * (knobSize + gap);
        l.setBounds(x, rowY - 14, knobSize, 12);
        s.setBounds(x, rowY, knobSize, knobSize + 20);
    };
    placeKnob(driveKnob, driveLbl, 0);
    placeKnob(biasKnob,  biasLbl,  1);
    placeKnob(toneKnob,  toneLbl,  2);
    placeKnob(airKnob,   airLbl,   3);
    placeKnob(mixKnob,   mixLbl,   4);
    placeKnob(outKnob,   outLbl,   5);

    modeBox.setBounds(20, 200, 180, 24);
    osButton.setBounds(220, 200, 120, 24);
}

void GoatSaturatorEditor::timerCallback()
{
    const float ti = proc.meterIn.load();
    const float to = proc.meterOut.load();
    meterInLvl  = meterInLvl  * 0.7f + ti * 0.3f;
    meterOutLvl = meterOutLvl * 0.7f + to * 0.3f;
    repaint(getLocalBounds().removeFromBottom(50));
}