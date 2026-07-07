/*
  ==============================================================================
    GoatDSP.h
    Shared DSP primitives for the GOAT Plugin Suite
    (c) DJ Speedy / GOAT Force / BrickSquad
  ==============================================================================
*/
#pragma once

#include <cmath>
#include <algorithm>
#include <array>

namespace goat {

// ---- Fast math helpers ----
inline float fastTanh(float x) noexcept {
    const float x2 = x * x;
    return x * (27.0f + x2) / (27.0f + 9.0f * x2);
}

inline float softClip(float x, float drive = 1.0f) noexcept {
    return fastTanh(x * drive) / fastTanh(drive);
}

inline float dbToGain(float db) noexcept { return std::pow(10.0f, db * 0.05f); }
inline float gainToDb(float g)   noexcept { return 20.0f * std::log10(std::max(g, 1.0e-9f)); }

// ---- One-pole smoother for parameter changes ----
class OnePole {
public:
    void prepare(double sampleRate, float timeMs = 20.0f) {
        const float tau = timeMs * 0.001f;
        coef = std::exp(-1.0f / (static_cast<float>(sampleRate) * tau));
    }
    float process(float target) noexcept {
        state = target + coef * (state - target);
        return state;
    }
    void reset(float value = 0.0f) { state = value; }
private:
    float state = 0.0f;
    float coef  = 0.99f;
};

// ---- TPT State Variable Filter (Zavalishin) ----
class SVF {
public:
    enum Type { LowPass, HighPass, BandPass, Notch, Peak, LowShelf, HighShelf };

    void prepare(double sr) { sampleRate = sr; reset(); update(); }
    void reset() { s1 = s2 = 0.0f; }
    void setFreq(float hz)   { freq = hz;   update(); }
    void setQ(float q)       { Q    = q;    update(); }
    void setGainDb(float db) { gainDb = db; update(); }
    void setType(Type t)     { type = t;    update(); }

    float process(float x) noexcept {
        const float hp = (x - (2.0f * R + g) * s1 - s2) / (1.0f + 2.0f * R * g + g * g);
        const float bp = g * hp + s1;
        const float lp = g * bp + s2;
        s1 = g * hp + bp;
        s2 = g * bp + lp;
        switch (type) {
            case LowPass:   return lp;
            case HighPass:  return hp;
            case BandPass:  return bp;
            case Notch:     return lp + hp;
            case Peak:      return lp - hp;
            case LowShelf:  return x + A * lp;
            case HighShelf: return x + A * hp;
        }
        return x;
    }
private:
    void update() {
        const float wd = 2.0f * 3.14159265f * freq;
        const float T  = 1.0f / static_cast<float>(sampleRate);
        const float wa = (2.0f / T) * std::tan(wd * T * 0.5f);
        g  = wa * T * 0.5f;
        R  = 1.0f / (2.0f * Q);
        A  = dbToGain(gainDb) - 1.0f;
    }
    double sampleRate = 44100.0;
    float  freq = 1000.0f, Q = 0.707f, gainDb = 0.0f;
    float  s1 = 0.0f, s2 = 0.0f, g = 0.1f, R = 0.707f, A = 0.0f;
    Type   type = LowPass;
};

// ---- Feed-forward compressor with soft knee ----
class Compressor {
public:
    void prepare(double sr) { sampleRate = sr; env = 0.0f; }
    void setThreshold(float db) { thresholdDb = db; }
    void setRatio(float r)      { ratio = std::max(1.0f, r); }
    void setAttack(float ms)    { attackCoef  = std::exp(-1.0f / (0.001f * ms * static_cast<float>(sampleRate))); }
    void setRelease(float ms)   { releaseCoef = std::exp(-1.0f / (0.001f * ms * static_cast<float>(sampleRate))); }
    void setKnee(float db)      { kneeDb = db; }
    void setMakeup(float db)    { makeupDb = db; }

    float process(float x) noexcept {
        const float absX = std::abs(x);
        const float coef = (absX > env) ? attackCoef : releaseCoef;
        env = absX + coef * (env - absX);
        const float envDb = gainToDb(env);

        float overshoot = envDb - thresholdDb;
        float reductionDb = 0.0f;
        if (overshoot > kneeDb * 0.5f) {
            reductionDb = overshoot * (1.0f - 1.0f / ratio);
        } else if (overshoot > -kneeDb * 0.5f) {
            const float k = overshoot + kneeDb * 0.5f;
            reductionDb = (k * k / (2.0f * kneeDb)) * (1.0f - 1.0f / ratio);
        }
        lastReduction = reductionDb;
        return x * dbToGain(-reductionDb + makeupDb);
    }
    float getGainReductionDb() const { return lastReduction; }
private:
    double sampleRate = 44100.0;
    float thresholdDb = -12.0f, ratio = 4.0f, kneeDb = 6.0f, makeupDb = 0.0f;
    float attackCoef = 0.99f, releaseCoef = 0.999f;
    float env = 0.0f, lastReduction = 0.0f;
};

// ---- Tape-style saturation (asymmetric harmonic generator) ----
class TapeSaturator {
public:
    void setDrive(float d)    { drive = d; }      // 0..1
    void setBias(float b)     { bias = b; }       // -0.5..0.5 (asymmetry)
    void setHiCut(float hz, double sr) { lpf.prepare(sr); lpf.setType(SVF::LowPass); lpf.setFreq(hz); lpf.setQ(0.707f); }

    float process(float x) noexcept {
        const float biased = x + bias * 0.1f;
        const float driven = biased * (1.0f + drive * 6.0f);
        // Asymmetric tanh (different curves for positive/negative)
        const float sat = (driven >= 0.0f)
            ? fastTanh(driven)
            : fastTanh(driven * 0.85f);
        const float mix = (1.0f - drive) * x + drive * sat * 0.9f;
        return lpf.process(mix);
    }
private:
    float drive = 0.3f, bias = 0.0f;
    SVF lpf;
};

// ---- Delay line (for reverb/chorus primitives) ----
class DelayLine {
public:
    void prepare(double sr, float maxDelayMs) {
        size = static_cast<int>(sr * maxDelayMs * 0.001f) + 4;
        buffer.assign(size, 0.0f);
        writeIdx = 0;
    }
    void write(float x) { buffer[writeIdx] = x; writeIdx = (writeIdx + 1) % size; }
    float read(float delaySamples) const {
        const float idx = static_cast<float>(writeIdx) - delaySamples;
        int i0 = static_cast<int>(std::floor(idx));
        while (i0 < 0) i0 += size;
        const int i1 = (i0 + 1) % size;
        const float frac = idx - std::floor(idx);
        return buffer[i0 % size] * (1.0f - frac) + buffer[i1] * frac;
    }
private:
    std::vector<float> buffer;
    int writeIdx = 0, size = 0;
};

} // namespace goat