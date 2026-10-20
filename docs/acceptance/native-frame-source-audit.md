# Native frame source audit — 2026-10-20

Historical audit of available source. The owner subsequently authorized integrating the recovered native implementation and comparing the actual Aside desktop app. Original custom C++ remains unavailable, but is no longer a prerequisite for proceeding. See the active supplied-implementation plan and native-frame fidelity proposals. No replacement UI or build was produced during this earlier audit.

## Available inputs

- `/Users/rcourson/AI Blueprints/06/HANDOFF.md`, section 4, states that private C++ bodies were not recovered.
- `/Users/rcourson/AI Blueprints/06/06_DESIGN.md`, section 6, identifies the 94 files in `assets/upstream-src/` as public Chromium152 baseline source, with subsequent version drift to153. These are not Aside's custom modifications.
- `/Users/rcourson/Downloads/aside-rea 2/native-fork/decompiled/` contains Ghidra pseudocode (596 C files), not original compilable C++ source. Example `037dfc80.c` retains unresolved functions, globals and raw offsets.
- Supplied Agent JS/CSS are directly reusable and already staged. The native sidebar owners are Aux ports from recovered binary evidence; the older independent body is dormant. See `docs/source/native-v416-body-owner-audit/README.md`.
- Extracted native colors and AX geometry are evidence, not original component implementations. The extracted WebUI toolbar bundle's presence does not establish that it drives Aside's visible native toolbar.

## Observed divergence

The supplied new-tab capture shows the sidebar reaching the window top and toolbar starting at the sidebar's right edge. Current Aux v510 puts the sidebar beneath a full-width toolbar. `AI Blueprints/06/assets/runtime/ax-tree.txt` independently records a full-height280-DIP sidebar and42-DIP toolbar beside it. This is a root-layout divergence. Different window sizes and profile contents prevent claiming a pixel-exact comparison.

Comparison artifact: `out/frame-source-comparison/index.html`; current Aux screenshot: `out/frame-source-comparison/aux-current.png`. Reference: `/Users/rcourson/Desktop/Aside UI Reference 2026-10-16/01 Home and composer/001-new-tab-default.png`.

## Provenance limit

Original Aside native Chromium checkout or its custom patch set, particularly browser/frame layout, vertical sidebar owners, toolbar, location bar and omnibox. Without it, further native work is a binary-evidence port/reconstruction and must not be represented as direct source reuse. The owner accepts faithful ports of the recovered native behavior; do not present those ports as original custom C++ source. The prior unchanged-preview status applies only to this historical audit.
