# Verification for this release

Completed using Node.js and Python, September 2026:

- JavaScript syntax checks for app.js, sequence.js and music.js.
- All 1087 precomputed curve paths have finite coordinate data.
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
node tests/scenes.cjs
```

Revision checks: every selected type appears in all 360 default-preset test sessions; ordinary horizontal scenes occupy under 25% of the random section; all 12 line slopes are present; all MathML expressions parse as XML. Music and the complete start/pause/finish state-machine checks still pass.


2026-09-24 transformation update:
- 13 scene families validated against existing graph identifiers and enabled types.
- Sampled curve coordinates checked for absolute-value, vertex, root, folding and sine transformations.
- Identical paths verified for the absolute-value sign identity and all three equivalent quadratic formulas.
- 200 additional seeded sessions verified: every scene family is reachable, whole scenes stay consecutive, and none overlaps the fixed ending.
- The transformation switch and individual function exclusions were verified.
- A local browser renderer was unavailable; visual rendering has not been newly verified in a real browser for this update.
