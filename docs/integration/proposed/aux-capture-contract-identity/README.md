# Paired Aux capture custom identifiers

`applyAuxCaptureContractIdentity({component,path,text,original})` is a pure exact-source-pinned transform for the daemon SEA entry code and Agent `content/content.js`. Run after existing reviewed transformations, passing the unmodified supplied source as `original`. Replay returned anchors and include this module and `inputs.json` in stage provenance. Other paths pass through unchanged.

This changes five Agent capture tag selectors, its shared dynamic capture element producer, capture-hole mask ID, three daemon capture selectors in both injected CSS and selector constants, daemon stitch style ID and its shared stitch/popover data-attribute constants. Setters, readers and cleanup continue to reference the same shared constants. There are seven Agent anchors and six daemon anchors (nine daemon matched occurrences).

The shared Agent constructor has exactly eight statically inventoried suffixes: capture-backdrop, capture-shrink, capture-toolbar, capture-result, capture-anchor, selection-handle, selection-popup, translate-status. The new prefix is conditional on `capture-`; the three noncapture suffixes retain their previous contracts. No broader selection/translate rename is included.

There is no standalone CSS input or output in this proposal. Injected CSS changes only custom tag/attribute selectors, preserving declaration text, dimensions, geometry, timing and colors. Standard HTML `aside` remains unchanged. Download filename prefixes, selection events, translation classes and unrelated DOM identifiers remain separate inventory items.

Three focused actual-source tests pass: VM-evaluated real dynamic element expression across all eight suffixes, producer/selector agreement, shared attribute consumers and injected CSS declaration equality, exact anchor replay and drift/mixed/source refusal. No actual browser capture, provider request, owner state or process operation was performed. The current app does not contain this proposal until the integrator restages and packages it.
