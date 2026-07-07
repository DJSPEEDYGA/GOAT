/*
  BrickSquad 808 — Custom Editor impl
*/
#include "PluginEditor.h"

BrickSquad808Editor::BrickSquad808Editor(BrickSquad808Processor& p)
    : AudioProcessorEditor(&p), proc(p)
{
    setLookAndFeel(&laf);
    addAndMakeVisible(header);
    makeKnob(subKnob,     subLbl,     "SUB");
    makeKnob(subFreqKnob, subFreqLbl, "FREQ");
    makeKnob(clickKnob,   clickLbl,   "CLICK");
    makeKnob(driveKnob,   driveLbl,   "DRIVE");
    makeKnob(glueKnob,    glueLbl,    "GLUE");
    makeKnob(outKnob,     outLbl,     "OUT");
    makeKnob(mixKnob,     mixLbl,     "MIX");

    auto& v = proc.apvts;
    using SA = juce::AudioProcessorValueTreeState::SliderAttachment;
    a_sub     = std::make_unique<SA>(v, "sub",     subKnob);
    a_subFreq = std::make_unique<SA>(v, "subFreq", subFreqKnob);
    a_click   = std::make_unique<SA>(v, "click",   clickKnob);
    a_drive   = std::make_unique<SA>(v, "drive",   driveKnob);
    a_glue    = std::make_unique<SA>(v, "glue",    glueKnob);
    a_out     = std::make_unique<SA>(v, "output",  outKnob);
    a_mix     = std::make_unique<SA>(v, "mix",     mixKnob);

    setSize(620, 320);
    startTimerHz(30);
}

void BrickSquad808Editor::makeKnob(juce::Slider& s, juce::Label& l, const juce::String& name) {
    s.setSliderStyle(juce::Slider::RotaryHorizontalVerticalDrag);
    s.setTextBoxStyle(juce::Slider::TextBoxBelow, false, 72, 18);
    addAndMakeVisible(s);
    l.setText(name, juce::dontSendNotification);
    l.setJustificationType(juce::Justification::centred);
    l.setFont(juce::Font(juce::FontOptions("Helvetica Neue", 10.0f, juce::Font::bold)));
    l.setColour(juce::Label::textColourId, goat::colors::gold);
    addAndMakeVisible(l);
}

void BrickSquad808Editor::paint(juce::Graphics& g) {
    juce::ColourGradient bg(juce::Colour(0xFF140000), 0, 0,
                             juce::Colour(0xFF0a0a0a), 0, (float)getHeight(), false);
    g.setGradientFill(bg);
    g.fillAll();

    // Brick wall pattern hint
    g.setColour(juce::Colour(0xFF1a0505));
    for (int y = 50; y < getHeight() - 40; y += 20) {
        for (int x = ((y/20)%2)*15; x < getWidth(); x += 30) {
            g.fillRect(x, y, 28, 18);
        }
    }
    // Brand stamp
    g.setColour(goat::colors::gold.withAlpha(0.15f));
    g.setFont(juce::Font(juce::FontOptions("Arial Black", 80.0f, juce::Font::bold)));
    g.drawText("808", getWidth() - 180, getHeight() - 130, 160, 100, juce::Justification::centredRight);
}

void BrickSquad808Editor::resized() {
    auto b = getLocalBounds();
    header.setBounds(b.removeFromTop(40));

    const int knobSize = 78;
    const int gap = 8;
    const int rowY = 80;
    const int startX = 14;
    juce::Slider* knobs[] = { &subKnob, &subFreqKnob, &clickKnob, &driveKnob, &glueKnob, &outKnob, &mixKnob };
    juce::Label*  labels[] = { &subLbl, &subFreqLbl, &clickLbl, &driveLbl, &glueLbl, &outLbl, &mixLbl };
    for (int i = 0; i < 7; ++i) {
        const int x = startX + i * (knobSize + gap);
        labels[i]->setBounds(x, rowY - 14, knobSize, 12);
        knobs[i]->setBounds(x, rowY, knobSize, knobSize + 22);
    }
}
void BrickSquad808Editor::timerCallback() { repaint(); }