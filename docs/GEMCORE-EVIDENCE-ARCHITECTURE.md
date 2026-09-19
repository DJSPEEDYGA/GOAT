# GemCore Evidence-First Grading Architecture

## Benchmark findings
GemCore's design is informed by public grading workflows and standards while remaining an original implementation.

### Evidence capture
- Front/back raw captures preserved unchanged.
- Multi-angle / raking-light capture set for surface topology.
- UV/IR/microscope evidence slots where hardware is available.
- Physical width/height measurement and expected-size comparison.
- Capture provenance: device, lens, lighting mode, timestamp, operator, calibration ID and checksum.

### Condition model
Each side is evaluated independently before aggregation:
- Centering: left/right and top/bottom ratios.
- Corners: each corner individually localized.
- Edges: top/right/bottom/left segments.
- Surface: scratches, print defects, dents/indentations, stains, creases, residue and other visible anomalies.
- Dimensions: measured height/width and alteration flags.
- Authenticity: separate decision lane; never inferred solely from condition score.

### Evidence Map
Every detected observation stores:
- category/type
- front/back
- normalized x/y coordinates and optional polygon
- severity
- confidence
- source capture ID
- reviewer disposition
- notes

The UI can overlay these observations on the untouched source image with an opacity slider. Presentation overlays never modify the original capture.

### Scoring
- Public-facing 1–10 grade.
- Internal high-resolution condition index for differentiation within a grade.
- Front/back category breakdown.
- A low-category/major-defect guardrail prevents strong categories from hiding a severe defect.
- Every score must be reproducible from a versioned rubric.
- Algorithm/rubric version stored with every result.

### Human QC
No certified grade may be sealed from an automated result alone.
- machine analysis -> reviewer verification -> authenticity gate -> grade finalization -> slab/label QA
- false positives can be rejected with reviewer reason
- manual additions require evidence and reviewer attribution
- all changes append to an audit log

### Evidence Passport
Public certificate should include:
- cert number and QR/deep link
- card identity and variation
- grade and category breakdown
- front/back centering measurements
- dimensions
- interactive defect map
- raw and presentation images
- population by grade
- chronology
- rank where statistically meaningful
- grading date and rubric version
- verification state and slab images

### GemCore differentiators
- Microscope evidence lane tied directly to defect markers.
- Telescope/macro navigation for fast whole-card-to-micro inspection.
- Spatial 3D/4D evidence viewer with touch rotation.
- Multi-spectrum evidence tabs (visible/raking/UV/IR when captured).
- Confidence + reviewer agreement indicators.
- Calibration health and capture-quality score.
- Evidence export package for owner/audit use.
- Privacy-safe share mode that excludes owner/order information.
- Regrade comparison view showing evidence deltas between grading events.

## Safety / integrity rules
- Never fabricate a defect, measurement, population count, sale, or certified grade.
- Demo/synthetic results must be visibly marked.
- Original evidence is immutable; annotations are separate layers.
- Market value never changes the condition grade.
- Authentication and condition grading remain separate decisions.
