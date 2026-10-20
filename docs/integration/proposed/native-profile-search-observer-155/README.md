# Chromium155 search observer lifecycle correction

One-file patch against exact actual254 `aux_tab_search_bubble.cc` (38f4d032f output). Chromium155 explicitly disallows ScopedObservation for TabStripModelObserver; its native observer tracks models itself. The actual242 retention adaptation already demonstrates the matching supported lifecycle.

Search now stores the exact observed model pointer, null-guards it before AddObserver, and uses TabStripModelObserver::StopObservingAll on real hide, Widget retirement and owner teardown. OnTabStripModelChanged accepts only that actual pointer. The exact model-destroy callback clears that pointer before hiding; Chromium's base has already erased the destroyed source from its registry. No fake callback, inactive-model inference, or change to the original visible search behavior is introduced.

Pinned actual public observer/retention sources and independent single-output replay are verified by verify.py. No native/shared edits, build, runtime, owner state, network or signing occurred. Root owns actual compilation and integration.
