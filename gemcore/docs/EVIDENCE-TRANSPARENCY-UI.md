# GemCore Evidence Transparency UI Contract

## Click-through chain
Final grade -> category -> defect marker -> source capture -> alternate evidence -> AI confidence -> human reviewer disposition.

## Inspection views
- Original front/back
- Annotation overlay with adjustable opacity
- Raking-light
- Macro/telescope
- Microscope
- UV
- IR
- 3D/spatial evidence when captured

Unavailable evidence modes must display "not captured" rather than a simulated image.

## Observation marker
Each marker displays category, defect type, side, severity, confidence, source capture, reviewer disposition and notes. Selecting a marker opens its source evidence without modifying the original.

## Measurements
Centering front/back, physical dimensions and calibration provenance appear beside condition categories. Alteration/authenticity remains a separate lane.

## Grade explanation
The UI must show the versioned rubric and category contributions plus any major-defect guardrail. Market information appears in a separate panel and never contributes to the condition score.

## QC
Reviewer can confirm, reject or modify a machine observation. Modification requires reason and attribution. Seal Grade remains disabled until QC and authenticity gates pass.
