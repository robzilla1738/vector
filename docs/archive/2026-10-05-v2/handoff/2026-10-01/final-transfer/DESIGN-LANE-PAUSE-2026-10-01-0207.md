# Design lane pause checkpoint

Paused at the owner's explicit request. No implementation, review, capture, native execution or background work continues after this checkpoint. Both owned worktrees were clean before this document. No reviewer-owned running process was found; the only matching process-list entries were the completed inspection command and its search. There is no reviewer process to terminate. Builder/root processes are outside this lane's ownership.

## Frozen work and pins

- Review worktree: `/tmp/aux-browser-runtime-design`, prior HEAD `f068547419d6c7f73e293d0b9cfbd4945a171dac`.
- Source worktree: `/tmp/aux-browser-runtime-root-polish`, HEAD `9cbfb088252a1230fd0a1b4e10ce27aed27caa63`.
- Immutable 0198 packet: `chromium/patches/aux/runtime/0198-native-performance-observer.patch`, SHA256 `eb1310c0be7ff6519f1d9bc51626a6e9d0ae79029348b8750967f67945bc71c1`.
- Immutable 0201 packet: `chromium/patches/aux/runtime/0201-native-pip-appearance-registry.patch`, SHA256 `a7ea1693aa0fb5294a6cbc9a2adaaacb01b96f098042d3711ee388e63b3c6546`.
- New-only 0207 packet: `chromium/patches/aux/runtime/0207-native-guest-presentation-owner.patch`, SHA256 `624c898a759c377753b9fe2a06901659745ba97010992f729692c53ce921f8b1`.

0198/0201 are unchanged, unadopted and uncompiled. 0207's five new files contain actual native guest ownership readout and same-Display-group inclusion receipt/defined synthetic tests. Export/apply/reverse/result-byte checks pass; native compilation and synthetic native tests have not run. This is source infrastructure, not measured performance evidence.

## Review outcome

`root-3210-capture-review.json` (SHA256 `1df54194a37b778a3ccb7ab53f66259522dbceee2a988bc01887b4b0a3eb068c`) records three manifest identities and all five original capture paths, hashes, bytes, window IDs and actual pixels. The native/runtime product is clean `32106f84ec843cc0e453dc7c7b68f5d576cc7325`.

Both split fixture panes actually paint in the new capture. The prior blank-pane observation is not reproduced in this particular state; there is no drop-to-paint measurement, restart closure or full appearance approval. PiP image bytes match the earlier main-window capture and do not prove separate child-window appearance. Three command captures prove the depicted empty/committed/background states only. CmdL's AX-value assertion failed; later modes were not reached.

P2 DR008: the focused command input has a rectangular inner outline protruding above/below the rounded field and duplicating the outer focus contour. Exact minimal unapplied request: `DR008-command-field-focus.request.patch`, SHA256 `7cf2d605987b203584f7f0f570d0a2757c07d1e55e7bd13ad199c6ff4c22c01b`; baseline/result hashes are in its adjacent baseline JSON. It moves the shared 2px focus token onto the rounded outer command field, removes only its inner input outline, and retains button focus outlines. Parent owns the actual CSS adoption. Native closure remains pending.

DR001–008 and full F21 L/D/LR/DR, actual RT/RM provenance, narrow layouts, long labels, hover/press/focus/motion and owner signoff remain open. No qualification, native performance pass or synthesized appearance evidence is claimed.

## Unapplied shared requests

All live under `docs/design-reviews/` in the review worktree; each has an exact baseline/result-byte manifest and isolated apply/reverse checks.

| Request | SHA256 | Status |
|---|---|---|
| `0207-viz-inclusion-hooks-INCOMPLETE.request.patch` | `0699fb2e150229ce977c7aeed625bf462192f4de8920221dae15eb163954984e` | Four aggregation/Display paths; exact will-draw SurfaceId/token and actual emitted visible geometry paired with the same hardware presentation group; not adopted |
| `0207-private-display-route-INCOMPLETE.request.patch` | `a2e353879c507aa64ac0f59a6b97d10ce8b3528dd9a58cf77ad33ea6b6cc4ec6` | Six private compositor/Mojo/root-sink paths including truthful unsupported in-process fake; not adopted |
| `0207-viz-GN.request.patch` | `823c0f59be2bdcc51fc46d09f24e47c2b2f2997669b779c9f3063445e252e6b0` | Service/unit-test source wiring only; root-owned Aux GN integration still needed |

Do not adopt the incomplete requests as a finished producer. `0207-guest-inclusion-source-investigation.json` and `0207-split-blank-and-inclusion.md` preserve the exact source investigation and frozen dependencies.

## Next work after an explicit resume

1. Implement the actual private browser fixture/session caller, current trusted Aux RFH/Profile/native-window/document fences and lifecycle cancellation. No public debugger/RPC/foreign selector or caller-provided authority.
2. Pair the original native pointer release/drag or keyboard timestamp with an actual selected-stage semantic mutation, then the exact post-mutation shell frame token. Existing command-only 0198 witness cannot silently substitute for this stage witness. Expected guest SurfaceIds must come from actual post-remount/geometry owner state, not assumed prior IDs.
3. Bind that owner scope to its actual private compositor route and revalidate selected pages/documents/widget/sinks before and after the hardware result. Reused child tokens are valid only when exact child SurfaceIds were actually included and emitted in the same new presentation group. Never infer parent/child token equality or count references/AX metadata as paint.
4. Complete actual implementing fake/mock inventory, coherent shared hooks and GN dependencies, parent review and sole-builder codegen/native compilation/tests. Keep every original budget and ≥20 AC trials; missing causal evidence refuses measurement.

Last read-only facts: native `setStageVisible` resolves up to four actual owned pages through TabCatalog, rejects protected/foreign/duplicate pages, then calls `SetStageVisible`. Stage visibility commits native bits before notifications. Its existing owner hook is a candidate selection producer, but does not by itself prove the rendered semantic mutation. `AuxShellEdgeMonitor` polls cursor position on a timer and is unsuitable as the original native input endpoint. AppKit content-view mouse dispatch exists; no new pointer observation hook or source edit was implemented. Exact owned native event routing must still be reviewed before authoring shared requests.

The earlier Settings search focus request remains withdrawn: actual leaf `:focus-within` styling already supplies the token ring. The prior clamped long-task concern remains recorded in the earlier pause checkpoint; root now owns the conservative organization witness draft requiring actual coverage and no overlapping long task. This lane has not independently compiled or qualified that producer.
