# Aux selection and translation custom contracts

This proposal completes the shared Agent custom-surface identities after the existing capture transform. It reuses supplied DOM constructors and interaction code; it introduces no component, layout, color, dimension or timing changes.

## Integration

Call `applyAuxSelectionContractIdentity({component,path,text,original})` after `applyAuxCaptureContractIdentity` and the normal native UI identity transform. `original` must be the unmodified pinned supplied input. The helper returns `{text,anchors}` for normal exact replay. Add this module and `inputs.json` to staging input provenance. No native registration or daemon change is required.

Inputs are exactly Agent `content/content.js` and `background.js`. There are five content anchors matching fifteen occurrences (one constructor, ten selection prefix uses, two capture exclusion readers, one completion event and one ordering comment) and two background anchors matching four occurrences. Other files pass through unchanged. Raw source hashes and all counts are in `inputs.json`.

The capture helper remains unchanged. The new constructor anchor specifically requires its prior conditional output. Applying this helper before capture, twice, against mixed names or with a changed original source refuses.

## Creator and reader inventory

- Shared `Zn` custom-element constructor is used by direct `capture-backdrop`/`capture-shrink` callers and through `Fe` for `capture-toolbar`, `capture-result`, `capture-anchor`, `selection-handle`, `selection-popup`, `translate-status`. These are all eight call-site suffixes in the pinned input. Capture already emitted Aux; the three remaining surfaces now do too. The constructor becomes `document.createElement(`aux-${e}`)`.
- The ten `aside-selection-*` occurrences include bootstrap/response element tag constants and UUID IDs, lasso and interaction-guard direct creators, highlight creator, and `pm()` prefix/closest selectors. All become the matching Aux identifiers together. No ordinary HTML `aside` element is changed.
- `Fp()` generates the react-grab completion event name and sends it in the bootstrap request used by the bridge; its event listeners and cleanup reuse that same local name. The prefix becomes `aux:react-grab:complete:`. The bridge does not hard-code the old completion prefix. Its target data attribute is already paired as `data-aux-react-grab-target` in both content and `react-grab-bridge.js` by the existing native UI transform.
- `Af()` and `pm()` had two remaining `startsWith("aside-capture-")` exclusions after capture tags became Aux. These two exact readers now recognize Aux capture surfaces. This fixes a concrete exclusion mismatch and prevents selecting the browser's own capture UI.
- Translation reorder placeholders use a single comment label; it becomes `aux-translate-order` without changing reorder logic. Background translation selection/page context-menu IDs each have a constant/create path and a literal click-dispatch check. Both occurrences of each ID change together. The existing startup/install refresh rebuilds context-menu definitions; no browser state is modified by this helper.
- Selection user-select, webkit-user-select and webkit-user-drag dataset keys already change through the existing native UI transform in both save/restore functions. Google Docs selection events and dataset bridge keys are also already paired by existing transforms. They remain outside this helper to avoid duplicate migration.

The source inventory across Agent JS/CSS found additional Google Docs bridge code in `content/google-docs-selection-bridge.js` and react-grab attribute code in `react-grab-bridge.js`; neither needs a new edit for this scope. Five standalone stylesheet files contain none of the custom selection/translation identifiers and remain byte-identical. Injected style declaration text is also unchanged; only custom identifiers in creator/selector strings change.

## Verification

Four focused tests pass against the actual frozen source. They VM-evaluate the real shared element expression for all eight suffixes and the actual surface-exclusion functions, verify bootstrap/response/selection and menu pairs, compare every directly assigned injected style/template declaration body before/after, replay exact anchors, and reject drift/mixed/wrong-order input. A separate read-only in-memory probe applied the helper to actual `out/provided-reuse-aux-parallel-identity` content/background files (five and two anchors).

No app launch, user browser operation, profile read, process operation, provider request, standalone stylesheet edit, native checkout edit or root adapter/staging change occurred. Runtime interaction acceptance remains the integrator's bounded next-stage check.
