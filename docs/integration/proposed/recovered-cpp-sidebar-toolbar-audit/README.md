# Recovered C++ bounded sidebar/address-bar audit

Compared the owner-supplied recovered-cpp export with the applied native composition 558. This is a source-pinned audit, not a native patch; no build, signing or runtime/profile access was performed.

## What this export adds

The reconstructed files contain address-labelled decompiler bodies, not original compilable C++. `reconstruct.py` assembles Ghidra output and attributes functions using anchors and spans. Headers are inventories. Group names such as `VerticalTabs_ExpandOnHover_Show` include neighboring helpers and must not be mistaken for verified individual method names. Undefined types, indirect calls and recovered prototypes still require translation into Chromium 155 APIs.

It materially improves traceability and coverage: complete neighboring function bodies are now searchable without another decompiler job. It does not establish that the current screen becomes exact by copying these files into Chromium.

## Concrete comparisons

* Sidebar presentation helper `FUN_0464a8c0`, source line 26808, requests metric 0x3d (61) and 0x3f (63). The metric61 inset was already decoded as8 and integrated by native-sidebar-alignment-pass1. This export corroborates that owner; it supplies no evidence for a second extra inset.
* Compact presentation helper `FUN_04650d00`, line30719, compares actual/animated width against0x97 (151). Current `aux_profile_preview_admission.cc::UseExpandedPresentation` already uses151 and clamps animated width to actual width. No threshold correction is needed.
* Retained monitor `FUN_046509a4`, line30556, checks retained state, both pointer flags, pointer-region test and positive lock count before clearing retention. Exit callback `FUN_046508b4`, line30518, likewise honors that lock count. Current admission has retained100ms checks and KeepExpandedLocked protection; the pin-menu lock fixes use that protection. No new lock correction follows from these bodies.
* Location-bar refresh is more sophisticated than a one-shot redraw: `FUN_04170ec0`, line861, initializes six retries; `FUN_041712c0`, line1083, decrements and reschedules with50000 microseconds, calling the refresh owner each time. This is concrete additional lifecycle evidence. Current readonly host/title adapter recomputes text in Layout, without this named retry mechanism. That is a coverage difference, not proof of a visible stale-title bug: Chromium155 event invalidation may already cover it, and the original predicate `FUN_04170ffc` remains partially indirect. Do not add a blanket poll/timer until a late-title/navigation refresh failure is observed or the gate is resolved.

## Decision

No new native change justified in this bounded pass. The existing sidebar geometry and retention values examined are already source-backed; the new export strengthens that evidence. The useful next targeted acceptance check is a page whose title changes after navigation: resting host/title must update without clicking, while focused URL editing remains untouched. If it fails, port the recovered bounded refresh owner rather than introducing permanent polling. Main/window/sidebar corner geometry is handled separately by the geometry lane.
