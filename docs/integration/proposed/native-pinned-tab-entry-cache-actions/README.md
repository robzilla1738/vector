# Saved-entry favicon database and action audit

Incremental after hover/colour86328066a; only the same two leaf files. Root's subsequent309 spelling-only fixes (explicit BubbleAnchor construction and drag iterator names) are not reimplemented or reverted by this patch; root rebases its baseline/output metadata during composition.

## Concrete missing behavior ported

The original does not depend on a live tab to populate a saved-entry favicon. `460588c..46059d4` consults cache378 and pending390, gets the current profile's FaviconService (`2a5f654`, argument0=EXPLICIT_ACCESS), inserts the actual URL into pending, then calls page-image query`2a5f790` with the leaf-owned tracker3c0 and weak callback`460a3e0`. That callback removes pending, caches a nonempty real image and refreshes the actual entries. Empty results do not trigger a retry loop; they can be retried on a later genuine refresh. The port uses actual155 `GetFaviconImageForPageURL`, not network fetches, generated images or a substitute cache backend.

The full URL spec is the actual cache key: `66ca88` returns the GURL's leading string reference unchanged for valid URLs. There is no host-only rewrite. Live favicon caching now only accepts real image data; vector/empty placeholders preserve the last genuine cached favicon, matching4605d2c..4605df4. Pending tasks are canceled and cleared before old-profile weak callbacks are invalidated on profile switch.

The original entry update explicitly sets accessibility role9 and the displayed title; current155 uses the semantic `ax::mojom::Role::kButton`, preserving the name. Unpin clears the transient captured menu URL before synchronous pref notification, so a callback can destroy the owner without a later member write.

## Bounded visible/action audit

| Path | Original source | Current leaf conclusion |
| --- | --- | --- |
| Display title |4609668 then46078c0|Saved title, else host/spec; real nonempty live title supersedes. Preserved.|
| Favicon |4607648,460588c,4605d2c,460a3e0|Actual URL cache, database request and live-image cache now implemented.|
| Placeholder |4607a2c..7a6c|Actual16-unit globe and active/inactive original role colours preserved.|
| Accessibility |4607964..7998|Button role added; actual displayed name retained.|
| Keyboard |460d1c4|Space/Return invokes actual activation; other keys returnfalse. Preserved.|
| Tooltip |460d20c|Empty for local/parent drag; actual displayed title otherwise. Prior hover slice suppresses/restores actual tooltip.|
| Context menu with live tab |460ac00..ac48|Genuine current tab context controller; no replacement command model. Preserved.|
| Context menu saved-only |460ac4c..ae90|Only Unpin command1, actual localized label and real pref removal. Preserved.|
| Hover/paint |Previous86328066a pins|Real current controller/TabData and original separate paint passes. No new approximation.|

No extra context actions, fake live association or fabricated empty icon success is added. Source-specific associated-tab matching and actual Agent-group exclusion remain root's real identity helper work.

## Remaining leaf/integration limits

Root still owns genuine region drag update/finish/cleanup callbacks and their presentation. Current155's stable dragged-child adaptation defers full pref/model refresh while the owned child is being dragged; this proposal records any such actual favicon/model refresh and schedules it after release instead of dropping it. The original full rebuild's identity-preserving behavior during active drag has not yet been established equivalent. That is an explicit leaf fidelity limit, not a completed-parity claim.

`python3 verify.py` passes independent two-file replay plus twelve bounded original binary pins. No native build/runtime/profile data was used. Native focused compile and disposable real icon/menu/accessibility observation remain necessary. Existing UI target already depends on `//chrome/browser/favicon` and `//components/keyed_service/core`; root owns any actual GN check correction, not this proposal.
