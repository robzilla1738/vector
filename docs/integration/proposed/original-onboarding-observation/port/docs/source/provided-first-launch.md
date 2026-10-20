# Supplied first launch and local-account observation

Current source audit: pinned Agent/Vault `1.26.1016.1852`, resources `out/provided-reuse-v241-brand`, and native v257 while its full build runs. Static inspection only; no browser/daemon/helper execution, requests, profile/home access, credentials, Keychain, signing, provisioning or OS changes occurred. [Current source hashes and bounded anchors](provided-first-launch-current-inputs.json) support these findings. Packaged observation remains integrator work.

**The earlier independent local Vault setup/unlock wrapper recommendation is retired.** Original `AsideAccountPasswordGate` reader/admission and the real Agent splash now win. The earlier 31-anchor `provided-first-launch-inputs.json` remains historical evidence for individual APIs, not authority to restore that independent policy. `docs/integration/proposed/local-vault-bootstrap/` is historical and must not be applied as the current startup route.

## Fresh original launch

The actual native gate reads genuine canonical profile/account prefs and accounts bootstrap state. While incomplete, it hides normal same-profile browser windows and opens a real app-popup Browser at `main.html#/onboarding/splash`: **900×560**, centered in the selected display's work area and adjusted to fit. It uses supplied Agent content and real native tab creation, not a 1040×760 replacement Widget or Vault `/popup/setup`/`/popup/authentication` wrapper.

Admission accepts genuine global onboarding completion, real automatic-gate suppression, original omitted/OTR-profile behavior or parsed original account/bootstrap completion. An unavailable account file falls back to the actual saved profile bootstrap flag and retries after one second. These are source criteria, **not** instructions to stamp preferences or forge completion. Vault lock state and daemon authorization are separate from original browsing admission; private API/auth checks remain intact.

Closing the popup is dismissal, not completion: the gate suppresses automatically reopening it, while an incomplete normal browser remains disallowed. A healthy daemon, loaded extension asset or closed window does not prove onboarding.

## Actual controls and guarded route

The splash retains its supplied 45.5% login/54.5% animated hero split, “Sign in to Aux” section, headline, Email field, **Continue** and **Sign in with Google**. Compact Email is an accessible visually hidden label; its placeholder is `e.g. john@example.com`. There is no anonymous/local/skip-signup control.

The parent route checks actual native profile context. Splash then resolves the actual account and reads `accounts.get`. An active cloud account redirects to the genuine onboarding/task destination; native profile index>=1 redirects to `/auth/sign-up`. A fresh local account stays on splash. Bare `main.html#/` separately redirects to `/auth/sign-in`, except actual sidepanel/minipopup entry detection. Do not invent `/unlock` or substitute a new page.

Email Continue validates the original schema before `accounts.auth.startEmailAuth`; valid submission prepares a real profile sign-in attempt and invokes hosted email-start. Google uses actual `accounts.auth.startGoogleOAuth` and popup/status/exchange/callback flow. Blank invalid email reaches only local validation. Valid email submission/Google are genuine authentication actions, not local continuations.

## Local daemon authorization precedes account resolution

`chrome.auxAccount.getProfileContext()` immediately returns actual persisted UUID/path/index and optional saved user/account ID. It does not invent `bindingVersion`, `localOnly`, a binding or unlocked status. The UI handles that original shape through real `accounts.ensureProfileAccount`, with `resolveProfileAccountByProfile` fallback only if the procedure is missing, and uses the actual returned account ID. Zero is valid; do not hardcode it as resolution success.

These RPCs request `/auth/daemon/challenge?clientKind=agent-manager-extension`, sign through `chrome.auxAccount.signDaemonAuthChallenge` (or actual background relay), exchange `/auth/daemon/session`, then send `AsideDaemonSessionToken`. Native signing reports actual failure when its installation boundary cannot sign. Unsigned browser status and daemon health do not establish authorization or cloud sign-in.

Therefore genuine authorization/account-resolution failure can produce the supplied loading/error UI before the login component renders. Observe the actual result; do not insert a test token, successful API stub, acceptance flag or fabricated registry data. This source audit does not establish successful unsigned installation authorization.

## Fresh anonymous completion is not a local success path

The real default registry has account 0 (`anonymous`, `local`, active), no session and empty local bootstrap/cloud/local binding maps. Its default account omits `onboardingCompletedAt`. Real `ensureProfileAccount` can resolve/persist the account and initialize real account services; that service bootstrap does not mark user onboarding complete.

The native completion reader permits legacy fallback only if the selected account's onboarding property is absent. Explicit null/empty/wrong type is known false; fresh empty legacy bootstrap data is also incomplete. The pinned daemon's only `isComplete:true` writer found by full-text/source-chain inspection is guarded by a real cloud account, genuine nonempty user and completed timestamp. This is a bounded source fact, not authority to fabricate those values.

The done page's **Get started** calls `accounts.auth.completeOnboarding`. The daemon makes a real authenticated hosted `/auth/onboarding/complete` POST, validates `{onboardingCompletedAt:string,saved:true}`, then updates the actual account. Only after success does the UI open `newtab.html?mode=search` (or actual settings-account destination), run completion cleanup and close onboarding. The staged hosted API default is the honest unavailable boundary `http://127.0.0.1:9/aux-unavailable/api`, not signup/completion success. Do not override it or directly navigate to done as a completion mechanism.

Done defaults actual default-browser, Dock, task-running and analytics options true. These are real effects. Import pages invoke real import actors. Neither is needed for the initial splash/error observation, and none was exercised here.

## Practical disposable observation

1. After the integrator's build/package is ready, launch only the already-authorized fixed disposable home/profile and actual candidate, retaining existing Aux-only ports/state scope. This document itself authorizes no launch or private-state operation.
2. Record actual window count, normal-browser visibility, popup 900×560 placement, real URL, and supplied splash/loading/error surface. Record actual visible errors instead of assuming an error wrapper or claiming successful account access.
3. If splash renders, compare its complete Aux logo, split geometry, typography, media and Email/Continue/Google controls against pinned source. Optional blank-email submission exercises local validation. Do not supply real email/Google login, import data, provider credentials or OS-setting actions for this observation.
4. Stop at the actual auth/signup boundary. Closing is dismissal. Missing anonymous continuation is original behavior, not a reason to add a local wrapper. If signing/account resolution fails, retain that precise result; root decides any needed user input after actual observation.
5. Normal-browser/newtab acceptance requires genuine original completion/admission and actual local authorization. Those prerequisites are not established by this fresh local-only/unavailable-hosted boundary. No completed state or auth result is fabricated here.

Given genuine admission/resolution, local/paused accounts have no cloud-onboarding redirect in the original account helper. Real local newtab/tasks and independent-provider settings can use their actual numeric account without a hosted plan. Routes remain `newtab.html`, `main.html#/u/<actualId>/tasks`, `/u/<actualId>/tasks/new` and `/u/<actualId>/settings/model`; inventory/credential APIs accept 0. This is a reachable-state source fact, not proof that fresh startup reaches it or permission for manual registry/pref edits.

Remaining boundaries are actual packaged native/daemon authorization; real startup popup/error observation; faithful original signup/onboarding availability and any owner-authorized input; then normal-browser/newtab behavior. This audit preserves failures and interactions. It does not make signing, new auth infrastructure or replacement setup UI the next development task.
