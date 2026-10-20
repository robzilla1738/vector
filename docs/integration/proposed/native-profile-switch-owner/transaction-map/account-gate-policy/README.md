# Supplied bootstrap gate policy and actual-state invalidation

Source-only incremental followup to `4673344f4` (popup), requiring `003e27761` (actual accounts evaluator). Two source files, baselines pinned to the popup output. Do not apply this delta directly to the old independent gate. Root owns native/GN/pref registration and build serialization.

## Admission is actual supplied bootstrap policy

Removes native `accounts.ensureProfileAccount` startup mutations, `FetchProfileSecurity`/Vault initialized/unlocked admission and500ms polling. The actual Agent continues performing its own actual supplied account resolution/authentication. Native bootstrap state comes from the original accounts JSON evaluator, actual profile prefs and actual global onboarding pref:

- OTR and real omitted ephemeral profiles skip this bootstrap gate, matching `0x417b2a0`/`0x417b7a0`; this grants no private API/Vault authorization.
- Actual global `aside.onboarding_completed` or actual `aside.automatic_password_gate_suppressed` skips automatic bootstrap; no field is inferred from anonymous/local mode or missing auth.
- Actual complete accounts result grants admission and persists the original global completion pref (`0x4103b7c`, `0x417cb38`). A false readable result remains incomplete. Only an **absent** result falls back to actual profile `aside.bootstrap_complete` and schedules1s refresh.
- Missing profile `aside.profile_id` receives the real random UUID using current155 `base::Uuid` and persists it, as `0x410347c` does. Existing IDs are preserved. `aside.account_user_id` remains an actual preference, never a fabricated cloud identity.
- For a genuinely new profile, suppression clears only if a different registered nonomitted profile exists (`0x417a8d8`). Original equality helper returns false for different paths; that branch is preserved.
- Popup requires the real Agent extension, not an unrelated native Vault-unlock predicate. Actual Agent registry availability is reflected in original `aside.account_password_extension_available` (`0x417aad0`). Supplied app-popup/splash flow remains from the preceding patch.

The original global pending/browser slot (`0xed43b00` region in `0x417bb1c`/`0x417c368`) prevents duplicate popup creation across profiles. This adaptation keeps that process-lifetime creation guard and actual weak popup reference. Only the exact gate-owned current-profile popup bypasses this bootstrap window-visibility guard; app-name spoofing cannot. Cached workspaces remain hidden.

Original `OnBrowserRemoved` (`0x417e330`) suppresses automatic resurrection after the actual popup is closed. The port observes the actual expired owned browser and retains dismissal until `RequestProfileBootstrap(Profile*)`, the native user-action continuation corresponding to `0x417c4ec`. This is not a new extension method or an authentication success. Its actual AppController/new-window caller integration remains required; do not replace it with unconditional default calls or app-wide exit.

## Real state invalidation, not fake polling success

The original `AsideProfileAttributesUpdater::StartWatchingAccountsState` (`0x415fec0`) watches the actual accounts path, and `RefreshAccountsState` (`0x415ebd0`) coalesces off-thread actual JSON reads. This adaptation places a real current155 `FilePathWatcher` on a dedicated sequence, watching only `<Aux StateHome>/accounts.json`, and posts weak UI invalidation. Pref/global/extension changes and file changes re-read the actual state; unknown state retries1s. No owner path fallback, mock backend, synthetic event/result or credential-bearing message is introduced. The new read is coalesced and checks current actual profile/user preference identity before accepting a result.

The full original updater also reconciles account/avatar/sync profile preferences (`0x4160ce0`). This gate watches and evaluates the genuine file directly as the bounded155 admission adaptation. The complete updater/getProfileContext producer alignment is the next integration slice; it is **not** replaced by an invented `setProfileAccount` API/event. Pinned Agent/Vault only feature-detect that optional method and optional-chain its event; original153 IDL has neither. Current native hash context remains a separate producer mismatch to audit, though the evaluator's real path match preserves actual matching file evidence during this incremental port.

## Exact root hooks

1. Add `account_bootstrap_state.cc/.h` from `003e27761` to existing Aux native target (unittest source only to a real test target).
2. Include `chrome/browser/aux/profile_gate.h` in the appropriate existing `ENABLE_AUX_BROWSER` pref registration block. Call `aux::RegisterProfileGateLocalStatePrefs(registry)` from `RegisterLocalState` and `aux::RegisterProfileGateProfilePrefs(registry)` from desktop `RegisterProfilePrefs`. Keys retain original `aside.*` spellings inside isolated Aux prefs, not owner Aside state.
3. Popup patch's actual `BrowserView::Show`/`ShowInactive` uses `CanShowBrowser(BrowserWindowInterface*, initializer)`; preserve this actual browser identity contract.
4. Wire `RequestProfileBootstrap(actual_selected_profile)` only into the recovered original native explicit user action corresponding to force-bootstrap, after source review. No renderer caller can supply an arbitrary allowed state.

Two-file disposable patch replay and all baseline/output SHA checks pass. Source fixtures from the reader remain uncompiled/unexecuted; this gate has not compiled or run. Watch-start failure, actual file event delivery, bootstrap close/reopen and actual supplied getProfileContext producer continuation need integrator verification. Full original popup browser-chrome marker consumers and updater/avatar behavior remain explicit fidelity gaps; this source checkpoint does not claim complete launch/visual parity. No shared native writes, build, target execution, account/profile read, OS grant or authority operation occurred.
