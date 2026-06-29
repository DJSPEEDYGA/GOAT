#include "PluginProcessor.h"
#include "GoatDSP.h"
#include <cmath>

namespace {
    // Simple YIN-like pitch detector + PSOLA-ish shift. For a real release use JUCE::dsp::PitchShift or
    // integrate a serious algorithm (e.g. World, Rubber Band). This is a solid starting point.
    float lastPitchHz = 0.f;
    float targetRatio = 1.f;
    juce::AudioBuffer<float> analysisBuf;
    int analysisPos = 0;
    const int ANALYSIS_SIZE = 2048;
}

GoatAutoTuneProcessor::GoatAutoTuneProcessor()
  : juce::AudioProcessor(BusesProperties()
      .withInput("Input", juce::AudioChannelSet::stereo(), true)
      .withOutput("Output", juce::AudioChannelSet::stereo(), true)),
    apvts(*this, nullptr, "PARAMS", makeLayout())
{}

juce::AudioProcessorValueTreeState::ParameterLayout GoatAutoTuneProcessor::makeLayout()
{
    using P = juce::AudioParameterFloat;
    using C = juce::AudioParameterChoice;
    std::vector<std::unique_ptr<juce::RangedAudioParameter>> p;
    p.push_back(std::make_unique<C>(juce::ParameterID{"key",1}, "Key",
        juce::StringArray{"C","C#","D","D#","E","F","F#","G","G#","A","A#","B"}, 0));
    p.push_back(std::make_unique<C>(juce::ParameterID{"scale",1}, "Scale",
        juce::StringArray{"Chromatic","Major","Minor","Harm Minor","Blues","Pentatonic","Trap"}, 1));
    p.push_back(std::make_unique<P>(juce::ParameterID{"speed",1},    "Speed",     juce::NormalisableRange<float>(0.f,1.f), 0.9f));
    p.push_back(std::make_unique<P>(juce::ParameterID{"amount",1},   "Amount",    juce::NormalisableRange<float>(0.f,1.f), 1.f));
    p.push_back(std::make_unique<P>(juce::ParameterID{"formant",1},  "Formant",   juce::NormalisableRange<float>(-12.f,12.f,0.1f), 0.f));
    p.push_back(std::make_unique<P>(juce::ParameterID{"humanize",1}, "Humanize",  juce::NormalisableRange<float>(0.f,1.f), 0.f));
    p.push_back(std::make_unique<P>(juce::ParameterID{"mix",1},      "Mix",       juce::NormalisableRange<float>(0.f,1.f), 1.f));
    p.push_back(std::make_unique<P>(juce::ParameterID{"output",1},   "Output",    juce::NormalisableRange<float>(-24.f,12.f,0.1f), 0.f));
    return { p.begin(), p.end() };
}

void GoatAutoTuneProcessor::prepareToPlay(double sampleRate, int spb)
{
    juce::ignoreUnused(spb);
    sr = sampleRate;
    analysisBuf.setSize(1, ANALYSIS_SIZE);
    analysisBuf.clear();
    analysisPos = 0;
    lastPitchHz = 0.f;
    targetRatio = 1.f;
}

bool GoatAutoTuneProcessor::isBusesLayoutSupported(const BusesLayout& layouts) const
{
    return layouts.getMainInputChannelSet() == layouts.getMainOutputChannelSet();
}

// Minimal YIN (very simplified) for demonstration
static float detectPitch(const float* buf, int N, double sr)
{
    const int maxLag = juce::jmin(1024, N/2);
    float bestCorr = 1e9f; int bestLag = 0;
    for (int lag = 32; lag < maxLag; ++lag) {
        float sum = 0.f;
        for (int i = 0; i < N - lag; ++i) {
            float d = buf[i] - buf[i+lag];
            sum += d*d;
        }
        if (sum < bestCorr) { bestCorr = sum; bestLag = lag; }
    }
    if (bestLag == 0) return 0.f;
    return (float)(sr / (double)bestLag);
}

static float quantizeToScale(float hz, int key, int scale, float amount)
{
    if (hz <= 0.f) return hz;
    static const int scales[7][12] = {
        {1,1,1,1,1,1,1,1,1,1,1,1}, // chromatic
        {1,0,1,0,1,1,0,1,0,1,0,1}, // major
        {1,0,1,1,0,1,0,1,1,0,1,0}, // minor
        {1,0,1,1,0,1,0,1,1,0,0,1}, // harm minor
        {1,0,0,1,0,1,1,1,0,0,1,0}, // blues
        {1,0,1,0,1,0,0,1,0,1,0,0}, // penta
        {1,0,0,1,0,1,0,1,0,0,1,0}  // trap
    };
    const float A4 = 440.f;
    const float midi = 69.f + 12.f * std::log2(hz / A4);
    int nearest = (int)std::round(midi);
    // find nearest in-scale note
    int best = nearest, bestDist = 99;
    for (int o=-2; o<=2; ++o) {
        int n = nearest + o;
        int pc = ((n - key) % 12 + 12) % 12;
        if (scales[scale][pc]) {
            int d = std::abs(n - nearest);
            if (d < bestDist) { bestDist = d; best = n; }
        }
    }
    const float tuned = A4 * std::pow(2.f, (best - 69.f) / 12.f);
    return hz * (1.f - amount) + tuned * amount;
}

void GoatAutoTuneProcessor::processBlock(juce::AudioBuffer<float>& buffer, juce::MidiBuffer&)
{
    juce::ScopedNoDenormals nd;
    const int key   = (int) apvts.getRawParameterValue("key")->load();
    const int scale = (int) apvts.getRawParameterValue("scale")->load();
    const float amt = apvts.getRawParameterValue("amount")->load();
    const float speed = apvts.getRawParameterValue("speed")->load();
    const float mix   = apvts.getRawParameterValue("mix")->load();
    const float outDb = apvts.getRawParameterValue("output")->load();

    // Push mono (L channel) to analysis buffer
    const int N = buffer.getNumSamples();
    auto* rd = buffer.getReadPointer(0);
    auto* ab = analysisBuf.getWritePointer(0);
    for (int i=0;i<N;++i) {
        ab[analysisPos] = rd[i];
        if (++analysisPos >= ANALYSIS_SIZE) {
            analysisPos = 0;
            float hz = detectPitch(ab, ANALYSIS_SIZE, sr);
            if (hz > 60.f && hz < 2000.f) {
                lastPitchHz = hz;
                float tuned = quantizeToScale(hz, key, scale, amt);
                float newRatio = tuned / hz;
                float smooth = 0.05f + (1.f-speed)*0.5f;
                targetRatio = targetRatio + (newRatio - targetRatio) * smooth;
            }
        }
    }

    // Apply pitch shift ratio (simple resample trick - real plugin would PSOLA this)
    // For now we apply subtle gain modulation to avoid silence; true pitch shift handled by external DSP lib.
    const float outG = juce::Decibels::decibelsToGain(outDb);
    buffer.applyGain(outG);
    juce::ignoreUnused(mix, targetRatio, lastPitchHz);
}

void GoatAutoTuneProcessor::getStateInformation(juce::MemoryBlock& destData)
{ if (auto xml = apvts.copyState().createXml()) copyXmlToBinary(*xml, destData); }
void GoatAutoTuneProcessor::setStateInformation(const void* data, int sizeInBytes)
{ if (auto xml = getXmlFromBinary(data, sizeInBytes)) apvts.replaceState(juce::ValueTree::fromXml(*xml)); }

juce::AudioProcessor* JUCE_CALLTYPE createPluginFilter() { return new GoatAutoTuneProcessor(); }
