/*
  Waka Vocal Chain — PluginProcessor.cpp
  HPF → 3-Band EQ → Comp → De-Esser → Saturator → Reverb Send
*/
#include "PluginProcessor.h"

WakaVocalChainProcessor::WakaVocalChainProcessor()
    : AudioProcessor(BusesProperties()
          .withInput("Input",  juce::AudioChannelSet::stereo(), true)
          .withOutput("Output",juce::AudioChannelSet::stereo(), true)),
      apvts(*this, nullptr, "PARAMS", layout())
{}

juce::AudioProcessorValueTreeState::ParameterLayout WakaVocalChainProcessor::layout()
{
    using P = juce::AudioParameterFloat;
    using C = juce::AudioParameterChoice;
    std::vector<std::unique_ptr<juce::RangedAudioParameter>> p;

    // HPF
    p.push_back(std::make_unique<P>(juce::ParameterID{"hpf",1}, "HPF (Hz)",
        juce::NormalisableRange<float>(20.0f, 300.0f, 1.0f, 0.5f), 100.0f));

    // 3-Band EQ
    p.push_back(std::make_unique<P>(juce::ParameterID{"loFreq",1}, "Lo Freq",
        juce::NormalisableRange<float>(40.0f, 500.0f, 1.0f, 0.5f), 150.0f));
    p.push_back(std::make_unique<P>(juce::ParameterID{"loGain",1}, "Lo Gain",
        juce::NormalisableRange<float>(-15.0f, 15.0f, 0.1f), 0.0f));
    p.push_back(std::make_unique<P>(juce::ParameterID{"midFreq",1}, "Mid Freq",
        juce::NormalisableRange<float>(200.0f, 5000.0f, 1.0f, 0.3f), 2000.0f));
    p.push_back(std::make_unique<P>(juce::ParameterID{"midGain",1}, "Mid Gain",
        juce::NormalisableRange<float>(-15.0f, 15.0f, 0.1f), 0.0f));
    p.push_back(std::make_unique<P>(juce::ParameterID{"hiFreq",1}, "Hi Freq",
        juce::NormalisableRange<float>(3000.0f, 16000.0f, 1.0f, 0.3f), 10000.0f));
    p.push_back(std::make_unique<P>(juce::ParameterID{"hiGain",1}, "Hi Gain",
        juce::NormalisableRange<float>(-15.0f, 15.0f, 0.1f), 2.0f));

    // Compressor
    p.push_back(std::make_unique<P>(juce::ParameterID{"compThresh",1}, "Comp Threshold",
        juce::NormalisableRange<float>(-40.0f, 0.0f, 0.1f), -18.0f));
    p.push_back(std::make_unique<P>(juce::ParameterID{"compRatio",1}, "Comp Ratio",
        juce::NormalisableRange<float>(1.0f, 20.0f, 0.1f), 4.0f));
    p.push_back(std::make_unique<P>(juce::ParameterID{"compAttack",1}, "Comp Attack (ms)",
        juce::NormalisableRange<float>(0.1f, 100.0f, 0.1f, 0.4f), 5.0f));
    p.push_back(std::make_unique<P>(juce::ParameterID{"compRelease",1}, "Comp Release (ms)",
        juce::NormalisableRange<float>(10.0f, 1000.0f, 0.1f, 0.4f), 100.0f));

    // De-Esser
    p.push_back(std::make_unique<P>(juce::ParameterID{"deEssFreq",1}, "De-Ess Freq",
        juce::NormalisableRange<float>(3000.0f, 10000.0f, 1.0f), 6000.0f));
    p.push_back(std::make_unique<P>(juce::ParameterID{"deEssAmt",1}, "De-Ess Amount",
        juce::NormalisableRange<float>(0.0f, 1.0f, 0.001f), 0.3f));

    // Saturator
    p.push_back(std::make_unique<P>(juce::ParameterID{"satDrive",1}, "Sat Drive",
        juce::NormalisableRange<float>(0.0f, 1.0f, 0.001f), 0.15f));

    // Reverb
    p.push_back(std::make_unique<P>(juce::ParameterID{"verbSize",1}, "Verb Size",
        juce::NormalisableRange<float>(0.0f, 1.0f, 0.001f), 0.4f));
    p.push_back(std::make_unique<P>(juce::ParameterID{"verbDamp",1}, "Verb Damp",
        juce::NormalisableRange<float>(0.0f, 1.0f, 0.001f), 0.5f));
    p.push_back(std::make_unique<P>(juce::ParameterID{"verbMix",1}, "Verb Mix",
        juce::NormalisableRange<float>(0.0f, 1.0f, 0.001f), 0.15f));

    // Master
    p.push_back(std::make_unique<P>(juce::ParameterID{"output",1}, "Output (dB)",
        juce::NormalisableRange<float>(-24.0f, 12.0f, 0.1f), 0.0f));

    // Presets
    p.push_back(std::make_unique<C>(juce::ParameterID{"preset",1}, "Preset",
        juce::StringArray{"Custom", "Waka Lead", "Speedy Verse", "BGV Stack", "Rap Tight", "Pop Air", "Broadcast"}, 1));

    return { p.begin(), p.end() };
}

void WakaVocalChainProcessor::prepareToPlay(double sr, int)
{
    for (int c = 0; c < 2; ++c) {
        hpf[c].prepare(sr);   hpf[c].setType(goat::SVF::HighPass);   hpf[c].setQ(0.707f);
        eqLo[c].prepare(sr);  eqLo[c].setType(goat::SVF::LowShelf);
        eqMid[c].prepare(sr); eqMid[c].setType(goat::SVF::Peak);     eqMid[c].setQ(1.0f);
        eqHi[c].prepare(sr);  eqHi[c].setType(goat::SVF::HighShelf);
        deEss[c].prepare(sr); deEss[c].setType(goat::SVF::Peak);     deEss[c].setQ(4.0f);
        comp[c].prepare(sr);
        sat[c].setHiCut(14000.0f, sr);
    }

    juce::dsp::ProcessSpec spec { sr, 512, 2 };
    verb.prepare(spec);

    for (auto& s : sm) s.prepare(sr, 30.0f);
}

bool WakaVocalChainProcessor::isBusesLayoutSupported(const BusesLayout& l) const
{
    const auto& in  = l.getMainInputChannelSet();
    const auto& out = l.getMainOutputChannelSet();
    if (in.isDisabled() || out.isDisabled()) return false;
    if (in != out) return false;
    return in == juce::AudioChannelSet::mono() || in == juce::AudioChannelSet::stereo();
}

void WakaVocalChainProcessor::processBlock(juce::AudioBuffer<float>& buf, juce::MidiBuffer&)
{
    juce::ScopedNoDenormals nd;
    const int numCh = buf.getNumChannels();
    const int N     = buf.getNumSamples();

    // Pull params
    const float hpfHz   = sm[0].process(apvts.getRawParameterValue("hpf")->load());
    const float loFreq  = apvts.getRawParameterValue("loFreq")->load();
    const float loGain  = sm[1].process(apvts.getRawParameterValue("loGain")->load());
    const float midFreq = apvts.getRawParameterValue("midFreq")->load();
    const float midGain = sm[2].process(apvts.getRawParameterValue("midGain")->load());
    const float hiFreq  = apvts.getRawParameterValue("hiFreq")->load();
    const float hiGain  = sm[3].process(apvts.getRawParameterValue("hiGain")->load());

    const float cT  = apvts.getRawParameterValue("compThresh")->load();
    const float cR  = apvts.getRawParameterValue("compRatio")->load();
    const float cA  = apvts.getRawParameterValue("compAttack")->load();
    const float cRl = apvts.getRawParameterValue("compRelease")->load();

    const float deF = apvts.getRawParameterValue("deEssFreq")->load();
    const float deA = sm[4].process(apvts.getRawParameterValue("deEssAmt")->load());

    const float satDrv = sm[5].process(apvts.getRawParameterValue("satDrive")->load());

    const float vSize = apvts.getRawParameterValue("verbSize")->load();
    const float vDamp = apvts.getRawParameterValue("verbDamp")->load();
    const float vMix  = sm[6].process(apvts.getRawParameterValue("verbMix")->load());

    const float outGain = goat::dbToGain(sm[7].process(apvts.getRawParameterValue("output")->load()));

    // Configure
    for (int c = 0; c < numCh && c < 2; ++c) {
        hpf[c].setFreq(hpfHz);
        eqLo[c].setFreq(loFreq);   eqLo[c].setGainDb(loGain);
        eqMid[c].setFreq(midFreq); eqMid[c].setGainDb(midGain);
        eqHi[c].setFreq(hiFreq);   eqHi[c].setGainDb(hiGain);
        deEss[c].setFreq(deF);     deEss[c].setGainDb(-deA * 18.0f);
        comp[c].setThreshold(cT);  comp[c].setRatio(cR);
        comp[c].setAttack(cA);     comp[c].setRelease(cRl);
        comp[c].setMakeup(deA * 2.0f);
        sat[c].setDrive(satDrv);
    }

    juce::dsp::Reverb::Parameters vp;
    vp.roomSize = vSize; vp.damping = vDamp; vp.wetLevel = vMix;
    vp.dryLevel = 1.0f - vMix * 0.2f; vp.width = 1.0f;
    verb.setParameters(vp);

    // Process DSP chain (per-sample)
    for (int c = 0; c < numCh && c < 2; ++c) {
        auto* d = buf.getWritePointer(c);
        for (int i = 0; i < N; ++i) {
            float x = d[i];
            x = hpf[c].process(x);
            x = eqLo[c].process(x);
            x = eqMid[c].process(x);
            x = eqHi[c].process(x);
            x = deEss[c].process(x);
            x = comp[c].process(x);
            x = sat[c].process(x);
            d[i] = x;
        }
    }

    // Reverb (processes block as stereo)
    juce::dsp::AudioBlock<float> block(buf);
    juce::dsp::ProcessContextReplacing<float> ctx(block);
    verb.process(ctx);

    // Output gain
    buf.applyGain(outGain);
}

juce::AudioProcessor* JUCE_CALLTYPE createPluginFilter() {
    return new WakaVocalChainProcessor();
}