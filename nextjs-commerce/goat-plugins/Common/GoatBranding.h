/*
  ==============================================================================
    GoatBranding.h
    Unified visual identity for the GOAT Plugin Suite
  ==============================================================================
*/
#pragma once

#include <juce_gui_basics/juce_gui_basics.h>

namespace goat {

// ---- Color palette ----
namespace colors {
    inline const juce::Colour gold       { 0xFFFFA500 };
    inline const juce::Colour goldBright { 0xFFFFCC33 };
    inline const juce::Colour bg         { 0xFF0A0A0A };
    inline const juce::Colour panel      { 0xFF1A1A1A };
    inline const juce::Colour panelHi    { 0xFF2A2A2A };
    inline const juce::Colour border     { 0xFF3A3A3A };
    inline const juce::Colour red        { 0xFFFF3030 };
    inline const juce::Colour green      { 0xFF00FF66 };
    inline const juce::Colour brick      { 0xFFD64545 };
    inline const juce::Colour text       { 0xFFE0E0E0 };
    inline const juce::Colour textDim    { 0xFF888888 };
}

// ---- Custom LookAndFeel ----
class GoatLookAndFeel : public juce::LookAndFeel_V4 {
public:
    GoatLookAndFeel() {
        setColour(juce::Slider::thumbColourId, colors::gold);
        setColour(juce::Slider::trackColourId, colors::panelHi);
        setColour(juce::Slider::backgroundColourId, colors::bg);
        setColour(juce::Slider::rotarySliderFillColourId, colors::gold);
        setColour(juce::Slider::rotarySliderOutlineColourId, colors::border);
        setColour(juce::Slider::textBoxTextColourId, colors::gold);
        setColour(juce::Slider::textBoxOutlineColourId, juce::Colours::transparentBlack);
        setColour(juce::Label::textColourId, colors::text);
        setColour(juce::TextButton::buttonColourId, colors::panel);
        setColour(juce::TextButton::buttonOnColourId, colors::gold);
        setColour(juce::TextButton::textColourOnId, juce::Colours::black);
        setColour(juce::TextButton::textColourOffId, colors::text);
        setColour(juce::ComboBox::backgroundColourId, colors::panel);
        setColour(juce::ComboBox::textColourId, colors::gold);
        setColour(juce::ComboBox::outlineColourId, colors::border);
    }

    void drawRotarySlider(juce::Graphics& g, int x, int y, int w, int h,
                          float pos, float startAng, float endAng,
                          juce::Slider& s) override
    {
        const auto bounds = juce::Rectangle<int>(x, y, w, h).toFloat().reduced(6.0f);
        const auto radius = std::min(bounds.getWidth(), bounds.getHeight()) / 2.0f;
        const auto centre = bounds.getCentre();
        const float angle = startAng + pos * (endAng - startAng);

        // Outer ring
        g.setColour(colors::border);
        g.fillEllipse(bounds);

        // Body (metallic gradient)
        juce::ColourGradient grad(colors::panelHi, centre.x - radius * 0.5f, centre.y - radius * 0.5f,
                                   colors::bg, centre.x + radius * 0.5f, centre.y + radius * 0.5f, false);
        g.setGradientFill(grad);
        g.fillEllipse(bounds.reduced(2.0f));

        // Arc
        juce::Path arc;
        arc.addCentredArc(centre.x, centre.y, radius - 4.0f, radius - 4.0f,
                          0.0f, startAng, angle, true);
        g.setColour(colors::gold);
        g.strokePath(arc, juce::PathStrokeType(2.5f, juce::PathStrokeType::curved,
                                                juce::PathStrokeType::rounded));

        // Indicator line
        juce::Path ind;
        ind.addRectangle(-1.5f, -radius + 4.0f, 3.0f, radius * 0.4f);
        g.setColour(colors::goldBright);
        g.fillPath(ind, juce::AffineTransform::rotation(angle).translated(centre));
    }

    juce::Font getLabelFont(juce::Label&) override {
        return juce::Font(juce::FontOptions("Helvetica Neue", 11.0f, juce::Font::plain));
    }
};

// ---- Header banner that reads "GOAT FORCE | <Plugin Name>" ----
class GoatHeader : public juce::Component {
public:
    GoatHeader(const juce::String& name) : pluginName(name) {}
    void paint(juce::Graphics& g) override {
        juce::ColourGradient grad(juce::Colour(0xFF1a1a1a), 0, 0,
                                   juce::Colour(0xFF0a0a0a), 0, (float)getHeight(), false);
        g.setGradientFill(grad);
        g.fillAll();

        g.setColour(colors::gold);
        g.drawHorizontalLine(getHeight() - 1, 0.0f, (float)getWidth());

        g.setFont(juce::Font(juce::FontOptions("Arial Black", 18.0f, juce::Font::bold)));
        g.setColour(colors::gold);
        g.drawText("GOAT FORCE", 12, 4, 200, getHeight() - 8,
                   juce::Justification::centredLeft);

        g.setFont(juce::Font(juce::FontOptions("Helvetica Neue", 14.0f, juce::Font::plain)));
        g.setColour(colors::text);
        g.drawText(pluginName, 0, 0, getWidth() - 12, getHeight(),
                   juce::Justification::centredRight);
    }
private:
    juce::String pluginName;
};

} // namespace goat