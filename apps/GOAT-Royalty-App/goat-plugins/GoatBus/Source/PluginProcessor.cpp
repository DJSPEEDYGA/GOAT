/*
  GOAT Bus — Master Bus Processor
*/
#include "PluginProcessor.h"

GoatBusProcessor::GoatBusProcessor()
    : AudioProcessor(BusesProperties()
          .withInput("Input",  juce::AudioChannelSet::stereo(), true)
          .withOutput("Output",juce::AudioChannelSet::stereo(), true)),
      apvts(*this, nullptr, "PARAMS", layout())
{}

juce::AudioProcessorValueTreeState::ParameterLayout GoatBusProcessor::layout()
{
    using P = juce::AudioParameterFloat;
    using C = juce::AudioParameterChoice;
    std::vector<std::unique_ptr<juce::RangedAudioParameter>> p;

    p.push_back(std::make_unique<P>(juce::ParameterID{"glueAmt",1},   "Glue Amount",
        juce::NormalisableRange<float>(0.0f, 1.0f, 0.001f), 0.4f));
    p.push_back(std::make_unique<P>(juce::ParameterID{"glueRatio",1}, "Glue Ratio",
        juce::NormalisableRange<float>(1.5f, 10.0f, 0.1f), 2.0f));
    p.push_back(std::make_unique<P>(juce::ParameterID{"tilt",1},      "Tilt EQ",
        juce::NormalisableRange<float>(-6.0f, 6.0f, 0.1f), 0.0f));
    p.push_back(std::make_unique<P>(juce::ParameterID{"clipCeiling",1}, "Soft Clip Ceiling (dB)",
        juce::NormalisableRange<float>(-6.0f, 0.0f, 0.1f), -0.3f));
    p.push_back(std::make_unique<P>(juce::ParameterID{"width",1},     "Stereo Width",
        juce::NormalisableRange<float>(0.0f, 2.0f, 0.01f), 1.0f));
    p.push_back(std::make_unique<P>(juce::ParameterID{"output",1},    "Output (dB)",
        juce::NormalisableRange<float>(-12.0f, 12.0f, 0.1f), 0.0f));
    p.push_back(std::make_unique<C>(juce::ParameterID{"mode",1},      "Mode",
        juce::StringArray{"Transparent", "Warm", "Punchy", "GOAT"}, 1));
    p.push_back(std::make_unique<P>(juce::ParameterID{"mix",1},       "Mix",
        juce::NormalisableRange<float>(0.0f, 1.0f, 0.001f), 1.0f));

    return { p.begin(), p.end() };
}

void GoatBusProcessor::prepareToPlay(double sr, int)
{
    for (int c = 0; c < 2; ++c) {
        glue[c].prepare(sr);
        glue[c].setAttack(30.0f);
        glue[c].setRelease(100.0f);
        glue[c].setKnee(8.0f);
        tiltLo[c].prepare(sr); tiltLo[c].setType(goat::SVF::LowShelf);  tiltLo[c].setFreq(250.0f);  tiltLo[c].setQ(0.707f);
        tiltHi[c].prepare(sr); tiltHi[c].setType(goat::SVF::HighShelf); tiltHi[c].setFreq(4000.0f); tiltHi[c].setQ(0.707f);
    }
    for (auto& s : sm) s.prepare(sr, 30.0f);
    lufsAccum = 0.0f; lufsCount = 0;
}

bool GoatBusProcessor::isBusesLayoutSupported(const BusesLayout& l) const
{
    return l.getMainInputChannelSet() == juce::AudioChannelSet::stereo() &&
           l.getMainOutputChannelSet() == juce::AudioChannelSet::stereo();
}

void GoatBusProcessor::processBlock(juce::AudioBuffer<float>& buf, juce::MidiBuffer&)
{
    juce::ScopedNoDenormals nd;
    const int N = buf.getNumSamples();
    if (buf.getNumChannels() < 2) return;

    const float glueAmt   = sm[0].process(apvts.getRawParameterValue("glueAmt")->load());
    const float glueRatio = apvts.getRawParameterValue("glueRatio")->load();
    const float tilt      = sm[1].process(apvts.getRawParameterValue("tilt")->load());
    const float ceilDb    = apvts.getRawParameterValue("clipCeiling")->load();
    const float width     = sm[2].process(apvts.getRawParameterValue("width")->load());
    const float outGain   = goat::dbToGain(sm[3].process(apvts.getRawParameterValue("output")->load()));
    const int   mode      = (int) apvts.getRawParameterValue("mode")->load();
    const float mix       = sm[4].process(apvts.getRawParameterValue("mix")->load());

    // Mode tuning
    float threshold = -14.0f, attack = 30.0f, release = 100.0f;
    switch (mode) {
        case 0: threshold = -10.0f; attack = 30.0f;  release = 150.0f; break; // Transparent
        case 1: threshold = -14.0f; attack = 30.0f;  release = 100.0f; break; // Warm
        case 2: threshold = -18.0f; attack = 10.0f;  release = 80.0f;  break; // Punchy
        case 3: threshold = -22.0f; attack = 3.0f;   release = 50.0f;  break; // GOAT
    }

    const float ceil = goat::dbToGain(ceilDb);

    auto* L = buf.getWritePointer(0);
    auto* R = buf.getWritePointer(1);

    float pL = 0.0f, pR = 0.0f;
    float rmsSum = 0.0f;

    for (int c = 0; c < 2; ++c) {
        glue[c].setThreshold(threshold);
        glue[c].setRatio(glueRatio);
        glue[c].setAttack(attack);
        glue[c].setRelease(release);
        glue[c].setMakeup(glueAmt * 3.0f);
        tiltLo[c].setGainDb(-tilt);
        tiltHi[c].setGainDb(tilt);
    }

    for (int i = 0; i < N; ++i) {
        float l = L[i], r = R[i];
        const float dryL = l, dryR = r;

        // Glue comp
        float cL = glue[0].process(l);
        float cR = glue[1].process(r);
        l = (1.0f - glueAmt) * l + glueAmt * cL;
        r = (1.0f - glueAmt) * r + glueAmt * cR;

        // Tilt EQ
        l = tiltLo[0].process(l); l = tiltHi[0].process(l);
        r = tiltLo[1].process(r); r = tiltHi[1].process(r);

        // Stereo width (M/S)
        const float M = (l + r) * 0.5f;
        const float S = (l - r) * 0.5f * width;
        l = M + S;
        r = M - S;

        // Soft clip
        l = goat::softClip(l / ceil) * ceil;
        r = goat::softClip(r / ceil) * ceil;

        // Mix
        l = (1.0f - mix) * dryL + mix * l;
        r = (1.0f - mix) * dryR + mix * r;

        // Output
        l *= outGain; r *= outGain;
        L[i] = l; R[i] = r;

        // Metering
        pL = std::max(pL, std::abs(l));
        pR = std::max(pR, std::abs(r));
        rmsSum += (l * l + r * r) * 0.5f;
    }

    peakL.store(pL);
    peakR.store(pR);

    // Rough LUFS integrated (simplified, no K-weighting for brevity)
    lufsAccum += rmsSum;
    lufsCount += N;
    if (lufsCount > 48000) {
        const float rms = std::sqrt(lufsAccum / lufsCount);
        lufsIntegrated.store(goat::gainToDb(rms) - 3.0f); // rough LUFS proxy
        lufsAccum = 0.0f; lufsCount = 0;
    }
}

juce::AudioProcessor* JUCE_CALLTYPE createPluginFilter() {
    return new GoatBusProcessor();
}