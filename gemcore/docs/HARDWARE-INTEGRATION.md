# GemCore Hardware Integration

GemCore capture is adapter-based so server Codex can add exact hardware without rewriting the grading UI.

## Implemented browser capture
- Web camera permission and live preview via MediaDevices/getUserMedia
- rear/environment camera preference
- 4K ideal constraint request
- device capability discovery
- applyConstraints hook for supported exposure/focus/zoom controls
- front/back capture state
- visible, raking, macro, microscope, UV and IR evidence modes
- frame capture with timestamp and evidence ID
- local pre-active evidence cache

## Hardware adapters to implement when exact devices are known
1. UVC/USB digital microscope
2. DSLR/mirrorless or machine-vision camera
3. macro/telescope camera
4. motorized XY/rotation stage
5. raking-light controller
6. UV illumination controller
7. IR illumination/camera
8. calibration target and dimensional reference
9. optional polarizers

Each adapter must report device identity, calibration ID, capture settings and failure state. Never claim a spectrum/measurement was captured if the physical device is absent.

## Server bridge contract
For hardware not controllable through browser APIs, expose a local authenticated capture service with:
- GET /devices
- POST /devices/:id/open
- POST /devices/:id/settings
- POST /capture
- POST /stage/move
- POST /light
- GET /calibration
- POST /calibration

Evidence returned by the bridge must include a checksum and source device metadata.
