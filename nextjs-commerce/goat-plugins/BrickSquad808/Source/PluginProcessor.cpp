/*
  BrickSquad 808 — PluginProcessor.cpp
*/
#include "PluginProcessor.h"
#include "PluginEditor.h"

juce::AudioProcessorEditor* BrickSquad808Processor::createEditor() {
    return new BrickSquad808Editor(*this);
}

BrickSquad808Processor::BrickSquad808Processor()
    : AudioProcessor(BusesProperties()
          .withInput("Input",  juce::AudioChannelSet::mono(), true)
          .withOutput("Output",juce::AudioChannelSet::mono(), true)),
      apvts(*this, nullptr, "PARAMS", layout())
{}

juce::AudioProcessorValueTreeState::ParameterLayout BrickSquad808Processor::layout()
{
    using P = juce::AudioParameterFloat;
    std::vector<std::unique_ptr<juce::RangedAudioParameter>> p;
    p.push_back(std::make_unique<P>(juce::ParameterID{"sub",1},      "Sub Boost (dB)",
        juce::NormalisableRange<float>(0.0f, 18.0f, 0.1f), 6.0f));
    p.push_back(std::make_unique<P>(juce::ParameterID{"subFreq",1},  "Sub Freq (Hz)",
        juce::NormalisableRange<float>(30.0f, 150.0f, 0.1f, 0.5f), 60.0f));
    p.push_back(std::make_unique<P>(juce::ParameterID{"click",1},    "Click Amount",
        juce::NormalisableRange<float>(0.0f, 1.0f, 0.001f), 0.2f));
    p.push_back(std::make_unique<P>(juce::ParameterID{"drive",1},    "Distortion",
        juce::NormalisableRange<float>(0.0f, 1.0f, 0.001f), 0.2f));
    p.push_back(std::make_unique<P>(juce::ParameterID{"glue",1},     "Glue Comp",
        juce::NormalisableRange<float>(0.0f, 1.0f, 0.001f), 0.3f));
    p.push_back(std::make_unique<P>(juce::ParameterID{"output",1},   "Output (dB)",
        juce::NormalisableRange<float>(-12.0f, 12.0f, 0.1f), 0.0f));
    p.push_back(std::make_unique<P>(juce::ParameterID{"mix",1},      "Mix",
        juce::NormalisableRange<float>(0.0f, 1.0f, 0.001f), 1.0f));
    return { p.begin(), p.end() };
}

void BrickSquad808Processor::prepareToPlay(double sr, int)
{
    subLP.prepare(sr);   subLP.setType(goat::SVF::LowPass);   subLP.setFreq(60.0f);  subLP.setQ(0.7f);
    clickHP.prepare(sr); clickHP.setType(goat::SVF::HighPass); clickHP.setFreq(1200.0f); clickHP.setQ(1.2f);
    toneHP.prepare(sr);  toneHP.setType(goat::SVF::HighPass);  toneHP.setFreq(20.0f); toneHP.setQ(0.5f);
    drive.setHiCut(8000.0f, sr);
    glueComp.prepare(sr);
    glueComp.setThreshold(-14.0f); glueComp.setRatio(3.0f);
    glueComp.setAttack(10.0f); glueComp.setRelease(80.0f);
    glueComp.setKnee(4.0f); glueComp.setMakeup(2.0f);
    for (auto& s : sm) s.prepare(sr, 20.0f);
}

bool BrickSquad808Processor::isBusesLayoutSupported(const BusesLayout& l) const
{
    return l.getMainInputChannelSet() == juce::AudioChannelSet::mono() &&
           l.getMainOutputChannelSet() == juce::AudioChannelSet::mono();
}

void BrickSquad808Processor::processBlock(juce::AudioBuffer<float>& buf, juce::MidiBuffer&)
{
    juce::ScopedNoDenormals nd;
    auto* d = buf.getWritePointer(0);
    const int N = buf.getNumSamples();

    const float sub     = sm[0].process(apvts.getRawParameterValue("sub")->load());
    const float subFreq = sm[1].process(apvts.getRawParameterValue("subFreq")->load());
    const float click   = sm[2].process(apvts.getRawParameterValue("click")->load());
    const float driveA  = sm[3].process(apvts.getRawParameterValue("drive")->load());
    const float glue    = sm[4].process(apvts.getRawParameterValue("glue")->load());
    const float outDb   = sm[5].process(apvts.getRawParameterValue("output")->load());
    const float mix     = sm[6].process(apvts.getRawParameterValue("mix")->load());

    subLP.setFreq(subFreq);
    drive.setDrive(driveA);
    const float subGain = goat::dbToGain(sub);
    const float outGain = goat::dbToGain(outDb);

    for (int i = 0; i < N; ++i) {
        const float in = toneHP.process(d[i]);

        // Sub-octave via simple envelope-driven sine... simplified: lowpass+boost
        const float subBand = subLP.process(in) * subGain;

        // Click layer (transient highpass with soft clip)
        float clk = clickHP.process(in);
        clk = goat::softClip(clk * (1.0f + click * 3.0f)) * click * 0.4f;

        // Distortion
        float driven = drive.process(in);

        // Sum
        float mixed = subBand + clk + driven * 0.6f;

        // Glue comp (bypass via dry/wet)
        float comped = glueComp.process(mixed);
        mixed = (1.0f - glue) * mixed + glue * comped;

        // Wet/dry
        const float wet = (1.0f - mix) * in + mix * mixed;
        d[i] = wet * outGain;
    }
}

juce::AudioProcessor* JUCE_CALLTYPE createPluginFilter() {
    return new BrickSquad808Processor();
}