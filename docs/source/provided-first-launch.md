# Supplied local first-launch flow

Static audit only, using pinned Agent/Vault `1.26.1016.1852` and the exact supplied daemon embedded-code SHA-256 `5e35dfa1eb76d4614246f954b652fd505e271a0b3f1ac3168132fb8bc03814f5`. No accounts, owner state, Keychain, live daemon, requests, browser or supplied executable was accessed/executed. `provided-first-launch-inputs.json` records31 exact source anchors with file/code hashes and byte offsets. It is evidence for source behavior, not packaged acceptance.

## Result

**The supplied implementation supports an anonymous local account configuring an independent provider and using local chat without hosted product login.** A real initialized/unlocked Vault and actual native/daemon account binding are prerequisites for Aux's native gate. No cloud session, subscription, onboarding timestamp or successful service reply needs to be fabricated. Built-in hosted plan models remain sign-in/service dependent and unavailable in the local-only build.

The bare router root is a trap for this flow: Agent `main.html#/` deliberately redirects to `/auth/sign-in` (except sidepanel/minipopup entry detection). Native local bootstrap must enter the original Vault setup/unlock actors, then allow the actual newtab, rather than treating the cloud sign-in splash as a local setup wizard.

## Account identity and zero

The daemon's `createDefaultAccountRegistry` creates account0 with `provider:'anonymous'`, `mode:'local'`, `authStatus:'active'`, no user/session/onboarding completion. The UI's native profile schema accepts a nonnegative `boundAccountId`, and both Agent and Vault resolvers test `undefined`, sentinel-1 and null explicitly; zero is valid.

Agent `queries` functions `pe`/`de`/`Dr` recognize bindingVersion>=1 and the physical Chromium ID. `Dr` returns sentinel-1 for `localOnly` or absent bound user. `Kt` then calls actual `accounts.ensureProfileAccount` with native profile identity. It rejects a returned cloud/user-bearing account on this local branch. `Me`/`q` retain the actual result; daemon-current fallback is used only when a native profile cannot be resolved. Native must supply the real profile rather than rely on that fallback.

Vault's `index.esm` functions `j0`/`Vl`/`H0`, `rb`/`sb` perform the corresponding checks. `jd` accepts account0 with `e!==null`; its final fallback constant is0, but that fallback is **not** authority to invent a profile binding. Standalone mode is selected only by an explicit Chrome-storage mode value. The integrated build must not stamp standalone/cloud state to alter source flow.

The daemon `ensureProfileAccount` v1 local branch resolves using `chromiumProfileId ?? profileId`, real path/index and `localOnly:true`, then runs actual account bootstrap. `resolveProfileAccount` persists `profileAccountBindings`; it reuses/mints according to actual registered identity and available slots. The first profile with index0 can reuse the real anonymous slot0. Other profiles must use their actual returned ID; **do not hardcode0**.

## Reachable local routes after real readiness

- Standalone `newtab.html` loads the original newtab island. `Ne` queries actual profile resolution, sets account context, and renders account-dependent content only when account ID is non-null. Its placeholder `accountId:t??0` is not a readiness signal. Account0 skips a prefetch/event-subscription optimization (`t>0`), but the actual model inventory hook accepts0 and requests inventory using the actual account.
- Newtab's Settings link resolves to `main.html#/u/<actualId>/settings`. Direct model configuration is `main.html#/u/<actualId>/settings/model`.
- Task list/new chat are `main.html#/u/<actualId>/tasks` and `main.html#/u/<actualId>/tasks/new`. Existing chat is `/u/<actualId>/tasks/<sessionId>`.
- The settings/profile parent route guard calls `F`, which resolves the actual native-bound account and rewrites a mismatched numeric route. It does not require a cloud account. Cross-profile handoff uses real profile list/path identities and unlocked profile checks.
- `_types` function `K(account)` returns null for absent/local/paused accounts. Only an active cloud account with explicit null `onboardingCompletedAt` routes to `/onboarding/import-browser`. Undefined cloud completion is refreshed from real auth first. Local accounts do not need a fake completion timestamp.
- The splash component is an email/Google sign-up/sign-in screen. Its guard redirects already active cloud accounts appropriately; it offers no anonymous local continuation. Additional profile-index branches can route to sign-up. It must not be used as the local Vault setup entry.

## Provider configuration and chat

`model-BrFuJM2w.js` displays a sign-in row for the **built-in hosted provider** on local/paused accounts; it does not block the independent provider list. `provider-context` obtains `models.listSettingsInventory({accountId})`. `connect-dialog` submits a genuine manual credential with `models.setCredential({providerId,credential:{type:'api_key',key},accountId})`; custom providers use their actual configuration procedures. No provider request was sent in this audit.

The daemon's `accountProcedure` requires an existing numeric account and adds its context, without a cloud-session/plan requirement. `models.setCredential` and `listSettingsInventory` use that procedure. Credential connection rewrites routing selections to available models. Actual inventory, credentials, provider availability and selection must work; none may be replaced by synthetic catalog/plan data.

The composer shows a sign-in nudge when its actual available-model array is empty for local/paused accounts. Connecting a real independent provider supplies its actual model inventory; the source model-selection/default rewrite then supports it. A stale built-in default is not evidence that local providers are prohibited. `sessions.create`/`createAndPrompt` are account procedures, and createSession reads actual selected/default model. They are not globally plan-gated. Provider-specific authorization and real runtime/native dependencies still apply.

## Genuine Vault setup/unlock journey

All app-side PWM calls intentionally omit `profileId`, selecting **`app-account:<numericId>`**. This differs from the Chromium profile ID used for AccountRegistry binding. Supplying a Chromium hash as PWM profileId would select a different Vault connection scope.

`passwordManager.accounts.list({accountId})` returns `currentPwmAccountId` (actual UUID) and connected account rows. Each row's `authStatus` is obtained from actual `passwordManager.getAuthStatus`, with unavailable rows null and session-key loss forcing locked status. Native must select the matching current UUID, not an arbitrary unlocked account or a guessed UUID.

Vault popup `Z2` accepts app-account0 and queries that real list. Its ordinary ready/setup/authentication routing follows actual `isInitialized` and `isLocked`, with settings/expiry checks. The integrated setup-required component `Lx` avoids the standalone email-login branch for a local anonymous account. `Sx` then uses its actual selected UUID to open:

`chrome-extension://<AuxVaultId>/popup.html#/setup?pwmAccountId=<actualUUID>`

The `Jo` setup loader requires a UUID, looks it up in the real account list, validates its actual status and app account, and allows a local-owner/uninitialized account without calling cloud connectCurrent. Unresolved or signed-in-user ownership takes the original connectCurrent path; do not bypass it.

The original `Ar`/`P5` setup actor creates recovery entropy, validates password/confirmation, and calls actual `passwordManager.auth.setup({accountId,pwmAccountId,password,recoveryEntropyB64})`. The daemon sets up encryption and creates Personal Vault. **That method returns initialized/unlocked before the UI's recovery save+ack stage finishes.** Actor completion requires both successful recovery-file save and acknowledgment. The page then displays the original `Ow` ready screen; its Open Vault action selects the real current PWM account, invalidates queries and navigates to `/popup/vault`.

Therefore native must not close this setup WebView merely because an intermediate status poll becomes unlocked. It must retain the source recovery journey for the same bound app account/PWM UUID until the page's actual committed ready navigation, then recheck real status. This is view lifecycle preservation, not a persisted/fake onboarding flag.

For an already initialized locked local Vault, enter original:

`chrome-extension://<AuxVaultId>/popup.html#/popup/authentication`

The source actor calls actual password unlock or eligible biometric unlock, rejects still-locked/empty unlock results and routes to `/popup/vault` only after real success. No native password field, plaintext bridge or synthetic unlock is added.

`requiresPasswordVerification` is **not** a source-wide lock bit. The original popup uses it to suppress biometric alternatives in the unlock actor. If native turns an otherwise unlocked status into locked solely for this field, `/popup/authentication` immediately redirects to `/popup/vault`, creating an unresolved loop. Root approved following source behavior: native lock is `!isInitialized || isLocked`; retain the verification field for actual sensitive-action/biometric policy.

## Native argument/result contract

Native `getProfileContext` must return the real registered profileId/chromiumProfileId, exact path, actual index, bindingVersion1, truthful localOnly, and actual boundAccountId including0. Local profiles omit boundUserId/asideUserId; do not synthesize a user. Existing cloud bindings retain actual bound user/account and localOnly=false. Extra native lock/onboarding/browserMode fields do not replace the daemon's real status.

`signDaemonAuthChallenge` is called with a base64 challenge and returns `{signedChallenge}`; native/daemon signing isolation remains root-owned. `getProfiles` rows need chromiumProfileId/path/accountId/isLocked. Original `openProfileRoute` supplies both IDs, exact path, sourceUrl and URL. Native proposal already accepts these fields and allows Vault popup bootstrap paths.

`setProfileAccount` and `onProfileContextChanged` are optional source detectors/subscriptions. Local cold-start does not need fake implementations. Real cloud sign-in binding calls require the former; real profile changes require accurate cache invalidation/event delivery or an explicit reload boundary. A no-op success would be wrong.

**Existing startup issue, separate follow-up:** native ProfileGate::Bind currently forces localOnly=true even for an existing cloud binding. Supplied ensureProfileAccount then intentionally removes/replaces its cloud binding. Root requested a subsequent narrow correction deriving localOnly from actual existing registry metadata; this route proposal leaves Bind unchanged and makes no cloud-compatible startup claim until that follow-up lands.

## Concrete native proposal

`docs/integration/proposed/local-vault-bootstrap/` contains a three-file follow-up patch plus full proposed files and exact baseline/output hashes. Baseline is root's combined provided profile-security + entrypoints tree, already using `newtab.html` and `main.html#/`. It is **unapplied and uncompiled**.

- Add actual current PWM UUID and informational password-verification field to ProfileSecurityState.
- Query authenticated real `passwordManager.accounts.list` instead of auth.status; select the current validated UUID's actual authStatus. The list internally calls the same real status method. Preserve registered-profile metadata reread, authorization checks, loopback-only request behavior and failure-closed status.
- Require Agent/Vault components loaded. For genuinely bound local-anonymous accounts, select original Vault setup or authentication route. Other/cloud bootstrap route and cloud onboarding criteria remain unchanged.
- Track only the bootstrap WebContents weak pointer and its actual bound app-account identity. Retain an in-progress original setup while its committed URL has not reached Vault `/popup/vault`, including temporary status failures, and release only when fresh real status also permits browsing. Rebinding to a different app account or known current PWM UUID invalidates the old view scope. No database/onboarding/auth field is stamped.
- After real completion, close bootstrap, warm actual newtab and reveal the existing browser as before. Explicit native task/model links must use the actual account route above, never bare main root.

Exact three-file `git apply --check`, replay and output-hash equality passed against root's combined proposal in a disposable directory. Source anchors and native APIs (`WebContents::GetWeakPtr`, `base::Uuid::ParseLowercase`) were checked statically. No shared Chromium checkout was edited; no native compile/link or packaged bootstrap observation was performed. Root must compose, compile and observe actual setup (including recovery save/ack), lock/unlock, account0/manual-provider navigation and cloud-binding preservation before accepting this flow.
