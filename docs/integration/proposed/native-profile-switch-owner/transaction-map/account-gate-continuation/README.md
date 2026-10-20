# Actual post-profile-setup bootstrap continuation

Incremental source-only followup to `de300bd5d`; two gate files use that output as baseline, `profile_customization_util.cc` uses actual read-only native190. Root owns registration/GN/apply/build. Independent disposable replay and all three input/output hashes pass; no compile/runtime/shared source writes.

## Correction to prior hook wording

The preceding gate policy README proposed locating a generic AppController/new-window force-bootstrap caller. Bounded actual caller recovery proves a narrower original entrypoint: `0x4179eb8` is **FinalizeNewProfileSetup**, string-pinned by `0xdad72d9` and source path `0xdad72f1`. It posts the actual weak Profile at `0x417a01c..0x417a0cc` only after a previously omitted profile is unomitted and ephemeral handling finishes. An already nonomitted profile returns before that post. Callback `0x417a144` gets the real gate service and requests `0x417c4ec` only when actual `aside.automatic_password_gate_suppressed` is false. This patch mounts that real continuation at the corresponding current155 function end, preserving its existing early return and stock checks.

A second callback `0x4252038` (bound by `0x4251eac`) belongs to the supplied **aside_importer_ui.cc** continuation and applies the same suppression guard. Its original importer-specific workflow remains a separate integration gap; no generic new-window or extension invocation is invented to stand in for it. The public C++ helper is a native service continuation, not an exposed optional `setProfileAccount` method/event.

## Owner availability

Original gate `0x417c5c4` calls `0x417f590`, which sets presence only when an actual same-profile Browser exists. The service may be created by profile finalization before that Browser. `RequestProfileBootstrap` therefore creates the actual gate owner when needed but no popup is created without a real same-profile Browser. The actual later `BrowserView::Show` path invalidates/re-reads that owner; it does not manufacture a profile, a browser record or an allowed state. User-close dismissal remains until the genuine post-profile-setup/importer continuation requests it. All private Vault/auth decisions remain their own actual mechanisms.

The C++ current155 mount uses a real weak Profile callback posted to the UI sequence, matching original lifetime semantics. It keeps the current stock `FinalizeNewProfileSetup` implementation and inserts only the recovered continuation under `ENABLE_AUX_BROWSER`. Root should confirm the profiles target's actual dependency on the existing Aux gate target if GN visibility requires an explicit edge; no shared GN file was changed here.

This closes one actual owner caller gap in the gate proposal, not all original profile attributes updater/getProfileContext/importer/popup chrome behavior. No signing, OS authority, supplied target execution, account/profile reads or owner state occurred.
