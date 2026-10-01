# L1 71eb advisory and pass-through review — October 1, 2026

Outcome: new narrow native proof of advisory dismissal on the first successful website handoff. DR-006 remains open for remaining closure states and full F21 coverage. DR-001 through DR-007 remain open; no new visual finding, full F1 qualification or final visual sign-off.

Both original images were inspected directly and both hashes/byte counts independently checked against the manifest. Manifest SHA256 73eeba493894a40bc8cc379d96d8cdb088b20d100a9549ec57097c39fbe98637; independent audit SHA256 cfda8181dfda73c38f26d97e55301ed4ff06866bca03494ea67b0879aad987fd. Product source, evidence and native operations were untouched; only reviewer docs authored.

Evidence root: `/Users/rcourson/Code/web/release/test-artifacts/l1-71ebf39d-shortcut-registry-core/`. Clean product/harness 71ebf39d7628e54d67fd167f707662426cb9f654; tree 619f30d1090bfd5ab61ed795134b864caea08f8e; shell digest 629ffe7abbdc67a8452eabf6eeaa9b0de818bcd471a6d9aa8f29c720dfb21b16; native manifest de283406805e7e5d28c8b20ddb35aad1b71037b719e9ab77a7df702589ca4fe9. AX window 1200×949 at 22,56; original images 2624×2122. Resized preview pixels are not native-point geometry.

| Capture | SHA256 | Bytes | Window ID |
|---|---|---|---|
| shortcut-single-advisory.png | 752a87fefd73d60ffbb28e8a0f8205b9f3fa2be0462d31c7c5ff1467e2dbb98a | 601568 | 10632 |
| shortcut-website-pass-through.png | 38acf11df6e3b533cce1fc603d0cff9cae3f65e6f402e674e91e2a3589c7e543 | 630207 | 10632 |

DR-006, L1: single-advisory image shows one readable toast with separated dismiss action. Pass-through image shows no advisory. The first double-press step passes; its recorded DOM observation reports Website shortcuts: 1, Website releases: 1, Meta=true with other modifiers false, and Website editor focused=true. The actual capture likewise shows counters and focused input. These establish successful first handoff and subsequent advisory absence in this state, advancing the earlier idle-coalescing-only evidence.

This does not close DR-006 fully. Real dismiss-action interaction, distinct feedback preservation, applicable hover/focus and four appearance cells remain pending. Later autorepeat setup fails Expected one element; found 0, and subsequent held/refusal states are unreached. Full core failure and F1 qualification limits remain intact; successful first handoff does not waive them.

DR-007, integrator/L2: both images still show the page-side opaque sidebar control covering the upper leading portion of Shortcut target. In the pass-through state the sidebar is open and the page is displaced right, but the control remains over the page heading. Avoid native page-content occlusion while preserving discoverability/input routing. DR-005 contrast retains only narrow white-page idle improvement. DR-001–004 have no new evidence.

Actual Reduce Motion=false and Reduce Transparency=false are established for this run by trusted evidence supplied with the candidate; forced appearance remains unproven. Chrome visibly dark. This is the default preference state, not four-cell closure. Motion/timing, exact token geometry, native material, narrow windows, long labels, relevant keyboard focus and owner final sign-off remain mandatory under RUBRIC.md. Native fixture input focus is not Aux toast focus-ring evidence. No performance result is inferred from these images.

Index appends both real states with this separate candidate identity and preference metadata. Root receives the precise partial progress and remaining obligations.
