#!/usr/bin/env python3
"""
GOAT Force Loudness Analyzer
Dr. Devin (Agent 007) — Pro Tools Automation Bridge

Analyzes audio files for:
- Integrated LUFS (loudness)
- True Peak (dBTP)
- Dynamic Range
- Sample Rate / Bit Depth
- DSP streaming target compliance (Spotify, Apple Music, YouTube, etc.)
"""

import sys
import os
import json
import subprocess
import tempfile
import argparse
from datetime import datetime

try:
    import pyloudnorm as pyln
    import soundfile as sf
    import numpy as np
    HAS_PYLOUDNORM = True
except ImportError:
    HAS_PYLOUDNORM = False

# DSP Loudness Targets
DSP_TARGETS = {
    "Spotify":        {"lufs": -14.0, "true_peak": -1.0},
    "Apple Music":    {"lufs": -16.0, "true_peak": -1.0},
    "YouTube":        {"lufs": -14.0, "true_peak": -1.0},
    "Amazon Music":   {"lufs": -14.0, "true_peak": -2.0},
    "Tidal":          {"lufs": -14.0, "true_peak": -1.0},
    "SoundCloud":     {"lufs": -14.0, "true_peak": -1.0},
    "Radio (EBU R128)": {"lufs": -23.0, "true_peak": -1.0},
    "CD Master":      {"lufs": -9.0,  "true_peak": -0.1},
}

def get_ffprobe_info(filepath):
    """Get audio file info via ffprobe."""
    cmd = [
        "ffprobe", "-v", "quiet", "-print_format", "json",
        "-show_format", "-show_streams", filepath
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        return None
    return json.loads(result.stdout)

def get_ffmpeg_lufs(filepath):
    """Use ffmpeg ebur128 filter for LUFS measurement (fallback)."""
    cmd = [
        "ffmpeg", "-i", filepath,
        "-af", "ebur128=peak=true:framelog=verbose",
        "-f", "null", "-"
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    output = result.stderr

    lufs = None
    true_peak = None

    for line in output.splitlines():
        if "I:" in line and "LUFS" in line:
            try:
                lufs = float(line.strip().split("I:")[1].split("LUFS")[0].strip())
            except Exception:
                pass
        if "Peak:" in line and "dBFS" in line:
            try:
                peak_str = line.strip().split("Peak:")[1].split("dBFS")[0].strip()
                val = float(peak_str)
                if true_peak is None or val > true_peak:
                    true_peak = val
            except Exception:
                pass

    return lufs, true_peak

def analyze_file(filepath):
    """Full loudness and technical analysis of an audio file."""
    if not os.path.exists(filepath):
        return {"error": f"File not found: {filepath}"}

    result = {
        "file": os.path.basename(filepath),
        "path": filepath,
        "analyzed_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
    }

    # Get technical info from ffprobe
    probe = get_ffprobe_info(filepath)
    if probe:
        for stream in probe.get("streams", []):
            if stream.get("codec_type") == "audio":
                result["sample_rate"] = stream.get("sample_rate", "unknown")
                result["channels"] = stream.get("channels", "unknown")
                result["codec"] = stream.get("codec_name", "unknown")
                result["bit_depth"] = stream.get("bits_per_sample", stream.get("bits_per_raw_sample", "unknown"))
                break
        fmt = probe.get("format", {})
        duration = float(fmt.get("duration", 0))
        result["duration_sec"] = round(duration, 2)
        result["duration_str"] = f"{int(duration//60)}:{int(duration%60):02d}"
        result["file_size_mb"] = round(float(fmt.get("size", 0)) / 1024 / 1024, 2)

    # Loudness analysis
    if HAS_PYLOUDNORM:
        try:
            # Convert to WAV temp file if needed for pyloudnorm
            ext = os.path.splitext(filepath)[1].lower()
            work_path = filepath

            if ext not in [".wav", ".aiff", ".aif"]:
                tmp = tempfile.NamedTemporaryFile(suffix=".wav", delete=False)
                tmp.close()
                subprocess.run(
                    ["ffmpeg", "-y", "-i", filepath, "-ar", "44100", tmp.name],
                    capture_output=True
                )
                work_path = tmp.name

            data, rate = sf.read(work_path)
            if data.ndim == 1:
                data = data.reshape(-1, 1)

            meter = pyln.Meter(rate)
            loudness = meter.integrated_loudness(data)

            # True peak via ffmpeg (more accurate)
            _, true_peak = get_ffmpeg_lufs(filepath)

            # Dynamic range estimate (peak vs loudness)
            peak_linear = np.max(np.abs(data))
            peak_dbfs = 20 * np.log10(peak_linear) if peak_linear > 0 else -96.0

            result["integrated_lufs"] = round(loudness, 2)
            result["true_peak_dbtp"] = round(true_peak, 2) if true_peak else round(peak_dbfs, 2)
            result["peak_dbfs"] = round(peak_dbfs, 2)
            result["dynamic_range_db"] = round(abs(loudness - peak_dbfs), 2)

            if work_path != filepath:
                os.unlink(work_path)

        except Exception as e:
            # Fallback to ffmpeg only
            lufs, tp = get_ffmpeg_lufs(filepath)
            result["integrated_lufs"] = round(lufs, 2) if lufs else None
            result["true_peak_dbtp"] = round(tp, 2) if tp else None
            result["analysis_note"] = f"pyloudnorm fallback: {str(e)}"
    else:
        lufs, tp = get_ffmpeg_lufs(filepath)
        result["integrated_lufs"] = round(lufs, 2) if lufs else None
        result["true_peak_dbtp"] = round(tp, 2) if tp else None

    # DSP compliance check
    lufs_val = result.get("integrated_lufs")
    tp_val = result.get("true_peak_dbtp")

    if lufs_val is not None:
        compliance = {}
        for platform, targets in DSP_TARGETS.items():
            target_lufs = targets["lufs"]
            target_tp = targets["true_peak"]
            lufs_ok = lufs_val <= target_lufs + 1.0  # within 1 LU
            tp_ok = tp_val is None or tp_val <= target_tp
            diff = round(lufs_val - target_lufs, 2)
            compliance[platform] = {
                "target_lufs": target_lufs,
                "diff_lufs": diff,
                "lufs_ok": lufs_ok,
                "tp_ok": tp_ok,
                "ready": lufs_ok and tp_ok,
                "action": "Good to go" if (lufs_ok and tp_ok) else (
                    f"Reduce by {abs(diff):.1f} LU" if diff > 1.0 else f"Raise by {abs(diff):.1f} LU"
                )
            }
        result["dsp_compliance"] = compliance

    return result

def print_report(result):
    """Print a formatted mastering report."""
    print("\n" + "="*60)
    print("  GOAT FORCE MASTERING REPORT — Dr. Devin (Agent 007)")
    print("="*60)
    print(f"  File:       {result.get('file', 'Unknown')}")
    print(f"  Analyzed:   {result.get('analyzed_at', '')}")
    print(f"  Duration:   {result.get('duration_str', 'N/A')}  ({result.get('duration_sec', 'N/A')}s)")
    print(f"  Size:       {result.get('file_size_mb', 'N/A')} MB")
    print(f"  Sample Rate:{result.get('sample_rate', 'N/A')} Hz")
    print(f"  Channels:   {result.get('channels', 'N/A')}")
    print(f"  Bit Depth:  {result.get('bit_depth', 'N/A')}")
    print(f"  Codec:      {result.get('codec', 'N/A')}")
    print("-"*60)
    print("  LOUDNESS MEASUREMENTS")
    print(f"  Integrated LUFS:  {result.get('integrated_lufs', 'N/A')} LUFS")
    print(f"  True Peak:        {result.get('true_peak_dbtp', 'N/A')} dBTP")
    print(f"  Peak (dBFS):      {result.get('peak_dbfs', 'N/A')} dBFS")
    print(f"  Dynamic Range:    {result.get('dynamic_range_db', 'N/A')} dB")
    print("-"*60)
    print("  DSP PLATFORM COMPLIANCE")
    compliance = result.get("dsp_compliance", {})
    for platform, info in compliance.items():
        status = "READY" if info["ready"] else "ADJUST"
        diff_str = f"{info['diff_lufs']:+.1f} LU" if info['diff_lufs'] != 0 else "on target"
        print(f"  {'[OK]' if info['ready'] else '[--]'} {platform:<22} target: {info['target_lufs']} LUFS  diff: {diff_str}  → {info['action']}")
    print("="*60 + "\n")

def main():
    parser = argparse.ArgumentParser(description="GOAT Force Loudness Analyzer")
    parser.add_argument("files", nargs="+", help="Audio file(s) to analyze")
    parser.add_argument("--json", action="store_true", help="Output as JSON")
    parser.add_argument("--out", help="Save JSON report to file")
    args = parser.parse_args()

    results = []
    for f in args.files:
        r = analyze_file(f)
        results.append(r)
        if not args.json:
            print_report(r)

    if args.json or args.out:
        output = json.dumps(results, indent=2)
        if args.out:
            with open(args.out, "w") as f:
                f.write(output)
            print(f"Report saved to: {args.out}")
        else:
            print(output)

if __name__ == "__main__":
    main()
