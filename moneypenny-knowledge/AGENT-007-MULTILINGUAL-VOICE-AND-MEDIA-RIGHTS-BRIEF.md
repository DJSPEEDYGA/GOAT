# AGENT-007 Multilingual Voice And Media Rights Brief

Owner request: make AGENT-007, Money Penny, Lexi, and the GOAT team speak broadly across languages, use uploaded audio/video safely, support approved voice identity workflows, and fingerprint media for tracking.

## Capability Targets

- Multilingual speech-to-text: use Granite Speech, browser speech recognition, Whisper/WhisperX, MMS, SeamlessM4T, or other configured engines for audio/video transcription and translation.
- Multilingual text-to-speech: use local/browser voices today, then add stronger local/cloud engines when configured. Do not claim a language is supported until a real voice engine is installed and tested.
- Voice profiles: store owner-approved voice direction such as accent, pace, firmness, warmth, pronunciation notes, and language coverage.
- Consent-locked voice cloning: clone or imitate only the owner, team members, clients, or performers who gave permission for that use. For public figures or unapproved private people, create a legally distinct inspired voice instead.
- Media fingerprints: generate file SHA-256, normalized audio SHA-256, sampled video SHA-256, ffprobe metadata, transcript text, timestamps, and chain-of-custody notes for owner-approved media.
- Rights tracking: connect fingerprints to GOAT Royalty metadata such as artist, title, ISRC, UPC, ISWC, PRO, publisher, split sheet, release, platform, client, and license state.

## Local Implementation Notes

- AGENT-007's upload route now returns media fingerprints inside the Granite transcription response when audio/video is attached.
- `fileSha256` identifies the exact file bytes.
- `audioContentSha256` hashes normalized 16 kHz mono PCM audio so container metadata changes are less likely to break matching.
- `videoSampleSha256` hashes sampled grayscale video frames for lightweight duplicate tracking.
- These are local tracking fingerprints, not a global Content ID system by themselves.
- Use ffmpeg and ffprobe when available for stronger metadata and normalized fingerprints.

## Safety Rules

1. Do not impersonate a real person without permission.
2. Do not present cloned speech as authentic recorded speech.
3. Label synthetic or cloned voices when used in client/public work.
4. Keep private client media local unless the owner approves upload or sharing.
5. Use fingerprints for owned/approved media, duplicate checks, takedowns, rights logs, royalty evidence, and archive integrity.

## Thor Upgrade Path

- Add faster ASR with timestamps and speaker labels.
- Add a consent registry for approved voices.
- Add voice-profile storage with sample provenance and license terms.
- Add perceptual audio fingerprinting such as Chromaprint/AcoustID-style matching.
- Add video perceptual hashing and scene/shot fingerprints.
- Add searchable media vault tables for GOAT Royalty and Accord/The Terminal.
