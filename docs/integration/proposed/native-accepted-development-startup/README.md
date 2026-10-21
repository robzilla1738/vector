# Explicit existing-scope Finder startup — reviewable native proposal

This local development adapter consumes an **externally accepted private record**, not ordinary bundle metadata. No actual record, installer directory, app, profile, home or Keychain item was created or changed by this proposal. No signing, helper execution or launch was performed. The only accepted scope is the existing `dbca8cbbce80cb5eb3f2f89043330556fdbf2350f3c057a69d6e10e6b3d11476`; a future home needs a separately reviewed implementation rather than silently reusing authority.

## Current verified input schema

Public schema inspected: `out/current-local-authority-pass2-v566-reuse/reuse-receipt.json` and `launch-handoff.json`. Current handoff receipt SHA256 is `bd050e0bca5da39b75efa9a1f44f619d349054b79d4a9793a0d45c4474e10084`, status signed-and-verified, authorityProofInherited true, exact retained app `/Users/rcourson/Documents/Vibe/web/out/provided-candidate-local-browser-pass/Aux.app`, exact existing home `/private/var/folders/98/j36zgdnd0h507whjl16gxl780000gp/T/aux-provided-dp-approval-mqbKLj`, userDataDir its `preview-profile-local-browser-pass`, selected profile `Default`. These are evidence, NOT final hashes for a descendant containing this patch. Final installer must use its actual verified descendant receipt. A relocation needs a new exact final-path review/receipt.

## Record and explicit installer action

Location: real UID account home (getpwuid, never inherited HOME) + `Library/Application Support/Aux/DevelopmentStartup/accepted.json`. Directory0700, record0600, single-link regular file, matching current UID, no symlink resolution. Ancestor directories must belong to this UID or root and forbid group/other writes. Reading uses O_NOFOLLOW and a512KiB bound. The record is an owner-controlled development capability, like the already accepted environment; it does not defend against arbitrary code running as the same owner.

Exact fields:

- version:1, kind:"aux-existing-development-scope", accepted:true. **Only an explicit reviewed installer acceptance action may produce accepted:true**. Packaging or finding a receipt never does.
- app: canonical exact final .app path; must match the running Contents/MacOS/Aux.
- home, userDataDir, profileDirectory, scope: exact existing approved values. Home's SHA256 must equal the fixed scope. Home, user data and selected existing profile must be canonical private owned directories. Profile is one directory component beneath userDataDir; no creation, migration, selection heuristics or fallback.
- receiptJson: exact original UTF-8 final reuse receipt bytes, embedded as a JSON string; receiptSha256: their SHA256. Runtime checks status, inherited-authority flag, scope and final packageRoot/Aux.app. Runtime never opens a repository receipt path.
- codeDirectoryHashes: exactly seven keys, values actual lowercase CDHashes after final package verification: empty string for outerapp; `Contents/Frameworks/Aux Framework.framework`; `Contents/Resources/aux/apps/daemon/Aux Daemon.app`; `Contents/Resources/aux/apps/cli/Aux CLI.app`; `Contents/Resources/aux/native/Aux Native Carrier.app`; `Contents/Resources/aux/native/libaux-native-boundary.dylib`; `Contents/Resources/aux/apps/computer-use/Aux Computer Use.app`.
- resourceSealSha256: exactly three keys: `Contents/_CodeSignature/CodeResources`, `Contents/Frameworks/Aux Framework.framework/Versions/Current/_CodeSignature/CodeResources`, `Contents/Resources/aux/bundle.json`. Values SHA256 of final accepted bytes.

Root's explicit writer must first run the existing full final package/resource/authority-reuse validation, ensure receipt/hash/current app match, obtain these actual post-seal CDHashes and small hashes, then atomically create the private record with exclusive no-follow semantics. It must not overwrite an existing acceptance silently or mark a mere package signed/verified. No private keys, credentials, live profile JSON, bearer tokens or Keychain material belong in this record. Record removal/revocation makes future ordinary launches fall back to existing behavior; it does not revoke an already running process.

## Native behavior and limits

Call runs in BasicStartupComplete before InitializeUserDataDir and StateHome use, only non-official macOS Aux browser process. Existing explicit AUX_HOME launch is unchanged; subprocesses are unchanged. Missing record leaves ordinary startup/auth behavior unchanged. A present invalid record refuses startup before storage selection rather than falling back into the owner's default profile.

Actual code verification uses Security.framework, pinned CDHashes, strict/all-architecture validation and no network. Small helper bundles validate their resources. Outerapp/framework validate executable code and match their pinned resource-seal bytes; they do not enumerate10k runtime leaves at each launch. The explicit installer retains full-inventory verification responsibility. This does not claim that matching resource-seal files alone detects every later UI/runtime leaf alteration; full package verification remains the acceptance/reseal boundary.

After all checks, set only HOME/CFFIXED_USER_HOME/AUX_HOME, exact scope and existing native-carrier acceptance; remove the same five probe/inbox-keychain variables as the accepted handoff. Append only existing user-data-dir and profile-directory. Conflicting profile/scope flags fail. No arbitrary environment map, external command, endpoint override, new keychain operation, mock-key authority substitution or approval inferred from bundle presence.

No native compile performed. Integrator must register the new header in relevant chrome target(s), ensure //crypto and Security.framework are available to the mac browser target, compile chrome_main_delegate.cc, and run a bounded clean-environment launch only after explicit record installation. The source is a two-file pinned proposal; root owns GN/manifest changes and final receipt production. Validation here: isolated patch apply, preimage/output hashes, static comparison of public APIs, whitespace check. The first real compile/launch remains pending.
