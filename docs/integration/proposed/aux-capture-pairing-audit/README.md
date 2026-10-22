# Actual capture pair audit

The actual `out/provided-reuse-aux-identity-continuation` daemon and Agent have no demonstrated cross-process capture attribute mismatch. Exact source hashes, token contexts and five standalone CSS hashes are recorded in `source-evidence.json`.

The daemon has two custom data attributes: `data-aside-stitch-fixed` and `data-aside-viewport-popover-open`. Neither original nor Aux spellings occur in any staged Agent JS file. Their setters/readers/cleanup are injected by the daemon and reference shared constants (`STITCH_FIXED_ATTR`: six occurrences; `POPOVER_OPEN_ATTR`: five). They currently agree internally.

The Agent creates custom `aside-${name}` elements and both Agent and daemon recognize `aside-capture-toolbar`, `aside-capture-backdrop`, `aside-capture-anchor`. The Agent's existing native UI adapter changes `data-aside-*` attributes, including react-grab targets, to Aux. The daemon does not read those react-grab attributes. A blanket statement that all capture is broken by that adapter is unsupported.

The new capture identity proposal is an owner-required paired identity migration, not a repair of a demonstrated current mismatch. It keeps selection/translate names outside its scope. No rendered UI or process execution occurred in this audit.
