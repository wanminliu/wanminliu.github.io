# Verification for this release

Completed using Node.js and Python, September 2026:

- JavaScript syntax checks for app.js, sequence.js and music.js.
- All 535 precomputed curve paths have finite coordinate data.
- Logarithmic paths stay on x > h; tangent branches are separated.
- All five transitions in the W-shaped derivative chain were checked algebraically.
- 360 seeded session configurations were checked across both durations, all level
  presets and acceleration on/off: no gaps, no overlaps, no truncated derivative
  chains, and an exact fixed ten-second ending.
- Both generated audio buffers were checked for correct duration, finite samples,
  nonzero energy and maximum amplitude below clipping.
- Local asset links were checked; the deployed page has no external file dependency.
- The app controller was exercised with a minimal DOM/audio adapter through the
  welcome, preparation, 3–2–1, start, pause/resume, final graphs and numbers, zero,
  completion and restart.

The last check is a state-machine test, not an actual browser rendering or speaker
playback test. Cross-device voice availability, audible speech timing, fullscreen
behavior and projector contrast have not been verified on the recipient's hardware.
The local English speech API remains optional and is not sample-accurate.

Run:

```sh
node tests/verify.cjs
node tests/session.cjs
```
