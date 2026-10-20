# Canonical supplied profile identity and immediate account context

Source-only incremental proposal. Apply after `account-gate-continuation` (9550545b1): only `profile_gate.cc` uses that staged output as its baseline; the other existing files are pinned to the frozen native checkout. Fifteen file outputs independently replay exactly. Native compilation and runtime verification have **not** run.

The supplied `asideAccount.getProfileContext` native Run at `0x4274bb4` immediately returns the original calling Profile's saved `aside.profile_id`, actual path, optional display-order index, nonempty `aside.account_user_id`, and nonnegative `aside.account_id`. Its helper `0x410347c` retains an existing nonempty ID and generates/persists a UUID only when absent. It does not call the daemon, infer Vault state, or require an account binding before exposing this profile context. Exact supplied decompiles and hashes are included under `evidence/` and `source-evidence.json`.

The current independent native code instead used `aux-profile:<SHA256(path)>` and required authenticated Vault discovery before returning context. Changing only the context API would split the real extension/daemon binding from native private checks. This proposal changes the complete currently active native ID graph together:

- New UI-sequence `aux::GetProfileId(Profile*)` is the one loaded-profile helper. `GetLoadedProfileIdForPath(path)` only queries an already loaded profile; it never loads another profile or reads a Preferences file. Existing original preference keys remain inside the isolated Aux profile.
- `getProfileContext` returns the original immediate object, retaining the existing real private-extension API allowlist. It does not add `setProfileAccount`, events, `localOnly`, `bindingVersion`, inferred cloud identity, or a fabricated unlocked result.
- Account route/list authorization, MiniPopup, task feed, private passkey scope and gate use the same saved identity. Worker metadata/signing operations receive an explicit captured ID; they cannot call `ProfileManager` or derive a replacement ID. Passkey request validation rejects a changed actual saved ID. The actual auth client rechecks loaded identity before replying.
- Blocking account-registry validation retains its owner-only/no-follow file checks, exact registered ID/path match, account classification, real authenticated Vault query, token scheme, and in-flight registry revalidation. A previous path-hash binding is not silently migrated or treated as the UUID's binding. It fails closed and requires explicit repair. No registry account binding is manufactured here.
- The active supplied daemon first calls `Browser.ensureChromiumProfile`, then on exactly `-32601` invokes `Browser.ensureProfile` with its own binding's stored display index. Current native registers only that actual fallback. The proposal keeps that authenticated fallback, resolves its explicitly requested registered profile through the existing real loader before reading its canonical ID, then performs the same real account/Vault checks before opening any window. Loading metadata is not accepted as permission to open. The actual current display-order helper is used consistently. The retired JS CDP shim is untouched.

Root integration: add `chrome/browser/aux/profile_identity.{h,cc}` to the existing Aux native target. Preserve the preceding gate preference registration hooks: `aside.profile_id`, `aside.account_user_id`, plus the new original `aside.account_id` integer default `-1`. No new extension schema or permission is needed (`getProfileContext` already returns its original extensible JSON object).

Signature delta, all actual shared callers updated together:

```cpp
ReadProfileSecurity(home, profile_path, const std::string& profile_id);
FetchProfileSecurity(home, profile_path, std::string profile_id,
                     factory, port, authorization, done);
```

Any separately staged new private caller must pass `GetProfileId(actual_profile)` on UI before dispatch. Do not restore a path-hash overload. The disposable existing `profile_state_probe.cc` source now supplies an explicit fixture identity and includes wrong/missing-ID checks; it was not compiled or executed here.

Limits: the original internal profile-attributes/account-state updater (including its real preference reconciliation/notifications) is a separate remaining port; absence of its currently optional extension API/event remains preserved. Existing `getProfiles` and `openProfileRoute` authentication behavior is retained pending their complete original-body audit. Unloaded profile snapshot rows have no manufactured ID and remain locked for private operations. This is not a claim of completed first-launch or authentication acceptance.
