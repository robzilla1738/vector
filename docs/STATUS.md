# Aux rebuild status

Updated 2026-10-19. The accepted clean-room plan replaces the former reference-vendoring architecture. Feature parity is not yet achieved.

## Phase 0

- Complete: clean-room `AGENTS.md`, spec-team/build-team boundary, naming policy and spec templates committed to local main.
- In progress: three spec agents working in isolated worktrees (`lane/sp1`, `lane/sp2`, `lane/sp3`) for daemon/agent/CLI, UI/Vault, and native APIs/browser behavior.
- Complete: fresh extension identities generated. Public keys are in `docs/design/extension-identities.json`; private keys are gitignored under `out/keys/`.
- Complete: indexed 36,339 reference files (25,515 distinct hashes) under gitignored `out/reference/`. The baseline scan reports 13 legacy native-patch findings, saved in `out/reference/cleanroom-baseline.txt`. Manual provenance audit remains required.
- Complete: serialized native command wrapper `scripts/native-build.py` uses an OS advisory lock at `/tmp/aux-build.lock`.
- Complete: historical test browser PID 62797 no longer exists; removed the remaining credential file found under disposable `/tmp/aux-run[0-9]*/u/` homes. No owner profile touched.
- Complete: pnpm TypeScript workspace and tooling installed; esbuild install script explicitly allowed. Independent development launcher authored from platform/core specs; runtime verification awaits daemon and extension builds.

## Implementation lanes

| Lane | State | Evidence / remaining work |
| --- | --- | --- |
| L1 daemon/contracts | Core/auth and agent specs integrated | Implementation pending fresh-agent spec review |
| L2 agent engine | Waiting for contracts and SP1 | Not implemented |
| L3 memory/context | Waiting for contracts and SP1 | Not implemented |
| L4 UI/core | Waiting for ready SP2 sections | Not implemented |
| L5 secondary UI | Waiting for UI system/SP2 | Not implemented |
| L6 vault | Waiting for contracts/SP1/SP2 | Not implemented |
| L7 CLI/skills/runtime | Waiting for contracts/SP1 | Not implemented |
| L8 helpers | Waiting for SP1/SP3 | Not implemented |
| N-A platform | Platform/core API specs integrated | Further native specs in progress |
| N-B native APIs | Platform/core API specs integrated | Further native specs in progress |
| N-C native UI | Waiting for SP3 | Existing Aux-owned native work is retained; new parity work pending |

## Existing native state

The Chromium checkout contains substantial staged, unstaged and untracked prior work. It must be preserved; no reset, blanket deletion or replacement is authorized. Existing patch series ends at 0085. The old component build and vendored runtime are legacy evidence only and do not prove clean-room acceptance.

## Acceptance outstanding

All plan gates remain outstanding: independently built daemon/CLI/extensions/helpers/runtime/memory, native API and lifecycle integration, self-contained non-component local app, removal of reference-derived shipped artifacts and names, visual evidence for every surface in both themes, functional checklist, 20 real tasks using the required contributor model, coexistence check, and fresh-agent provenance audit. Nothing has been pushed, released or developer-signed.

## L4/L5 UI first functional slice — 2026-10-19

- Implemented independent React/TanStack Router extension and shared measured light/dark tokens, original Aux mark, Lucide glyphs and independently acquired OFL fonts with licenses. Build emits `apps/extension/dist/manifest.json` with the generated public identity.
- Native account signing is required for daemon auth; no HTTP signing-key fallback. Authenticated background bridge registers account/profile/mode and permits explicit browser/page commands only. Page actions reject stale documents/element refs; password fields are excluded.
- Added native autocomplete newtab, Tiptap per-account/task draft composer, authoritative transcript polling, model/access/effort controls, approval/question cards, queue removal/steer/interrupt, task filters/archive controls, credential/appearance/access settings, project/routine creation, memory editing, inbox and model-deferred local onboarding.
- Verification: extension/shared UI TypeScript passed; Biome source check passed; Vite production build and manifest entrypoint checks passed. Disposable upstream Chrome smoke preserved input across Find/Do, exposed actionable missing-native account state, and captured light/dark/390px newtab views with no page errors. The smoke found and fixed a first-input handoff race. Screenshots are disposable `/tmp/aux-l4-newtab-{light,dark,narrow}.png` artifacts, not parity evidence.
- Remaining: rebuilt-native/live-daemon end-to-end validation; native permission registration confirmation; streaming event reconciliation; attachment/context uploads; rich queue edit/reorder; math/artifacts; full secondary settings editors; tab search/mini popup/selection/capture/translation overlays; import/recovery; comprehensive light/dark screenshots. Diagnostic server/skill/privacy panels are expressly incomplete. Pixel parity is unverified. Clean-room hash check requires integrator-owned reference hash index and was not completed in this isolated build lane.

### L4/L5 follow-up

- Added native-host routes for tab search and mini popup. Tab search queries real tabs/closed sessions/tasks/bookmarks/history, debounces 80ms, suppresses stale responses, supports wraparound keyboard activation and restores/focuses targets. Private mode omits personal history/task groups. Enabled-extension group remains outstanding.
- Added versioned queue edit/reorder controls, stable submission retry identities, confirmation-kind responses, provider-advertised effort choices and extended-browsing runtime preference. Native account/profile integration remains the gate for a live session observation.
- Additional disposable Chrome boundary smoke used explicit mocked daemon/native responses: failed create retained composer text; allow-once targeted the exact suspension with `always:false`; no page errors. This is UI boundary evidence, not native/daemon integration acceptance.
- Added UI React type dependency for workspace compilation and replaced owned HTML sidebar vocabulary flagged by lexical scan. Built React still contains two conventional HTML vocabulary tokens from the independently licensed dependency; scanner attribution requires integrator handling rather than corrupting upstream semantics.

## Integrated implementation evidence (2026-10-19)

- All three spec lanes delivered original build-facing specs. Fresh foundation review is `docs/spec/review-foundation.md`; unresolved measurements and schemas remain explicit. Provenance ledgers were consolidated outside build-facing documents.
- L1 core is integrated: independent Hono/tRPC daemon, installation P-256/HS256 authentication, loopback Host/Origin validation, SQLite account/settings persistence and route-scoped WebSocket bridge. Disposable integrated core smoke passed, including native transport auth replay rejection and shutdown. Three focused core suites pass.
- L2 engine is integrated: durable streamed session/turn events, explicit tool suspensions, steering/queue/branch/compaction, provider credentials, projects, routine scheduling/idempotent event claims, bounded child tasks and browser/file tools. SDK7/provider4 upgrade integrated. Actual mandated Muse Spark contributor tasks passed through the CLI and daemon before and after that SDK upgrade. OAuth/channels/attachment breadth remains incomplete.
- L4/L5 first UI slice is integrated: actual React/Tiptap/TanStack extension, token system/fonts with licenses, newtab/chat/settings/onboarding/projects/routines/memories/inbox/task views, tab search and popup host routes. Disposable Chrome captures from the UI lane are interface smoke evidence only, not reference parity. Real rebuilt native APIs are still needed.
- L7 CLI supports local authentication, tasks/interactive conversations, session commands, model/effort/policy flags, memory/skill calls and JSON-RPC MCP stdio. MCP initialization/tool listing passed without a daemon. Independent 51-playbook skill inventory and safe metadata/discovery loader are authored; skills are guides and do not imply missing helper capabilities exist. REPL service and self-contained runtime/SEA packaging remain in progress.
- N-A patch0086 is integrated in the series. Enabled startup/component/CDP call sites and native helpers compiled; actual Node↔C++ signing, CDP replay/Host/Origin/token tests passed with disposable state. `docs/acceptance/native-platform-0086.md` lists remaining runtime/profile/CDP scope. Non-component full build and packaged browser observation remain outstanding.
- Current independently built apps/packages pass the artifact scan (170 files). The complete scan still rejects retained legacy native patch names/IDs. The owner clarified standard HTML tokens are permitted; two narrow independently licensed vocabulary patterns are documented in provenance, with no exemption for reference product identities.
- Active lanes: N-B native extension APIs; L3 ONNX memory/context/inbox; L6 encrypted vault/import/autofill. Integrator owns REPL, runtime/packaging, shared native registration and wiring.

The earlier implementation table above is a foundation snapshot; this evidence supersedes its waiting states. No final parity, vault, memory, packaged-app or 20-task acceptance is claimed.
## L6 Vault crypto and daemon slice — 2026-10-19

- Implemented an independently versioned local Vault envelope with libsodium XChaCha20-Poly1305 and Argon2id (64 MiB, three operations), password/recovery key wrapping, atomic owner-only storage, authenticated account/record/revision binding, encrypted metadata/URLs and encrypted item history. Design and limits are documented in `docs/design/vault-envelope.md`.
- Added `VaultService` lifecycle cleanup, setup/unlock/lock/recovery/password change, item/vault CRUD, optimistic revisions, locked ciphertext facade, cryptographic password generation, CSV/unencrypted Bitwarden JSON import preview/commit and encrypted import deduplication. Auth routes remain usable before onboarding completes. Native public security summaries are atomically published without secrets on startup/transitions/close.
- Exported `createVaultRouters(services, vaultService)` for integrator wiring; root owns lifecycle registration and no-store transport headers. Agent credential payload is restricted to the Vault actuator and an exact unconsumed persisted human approval bound to item, page and profile/mode. It must never be returned through a model transcript.
- Verification: whole daemon TypeScript passed against integrated independent dependencies; owned source lint passed. Three focused disposable-home crypto tests passed: wrong-password/lock and no plaintext at rest/history; ciphertext and cross-account AAD tampering; recovery/old-key invalidation/password rotation. Tests also check stale item revisions and preservation of omitted fields in patch schemas.
- Remaining: integrate router/lifecycle into running daemon and observe live HTTP flow; build Vault React popup and exact URL/frame-bound manual content actor; native Touch ID/passkey/credential-exchange and encrypted provider export formats; per-item reprompt (enabling it is rejected); visual acceptance. Current file rollback cannot be detected without independent trusted state. No existing owner Vault/profile has been read or changed.

### L6 original Vault popup and manual fill actor

- Built the independently authored `apps/vault` React popup at the measured 600×432 size with the generated Vault identity. Added native-signed password-extension auth via a shared client factory, setup/unlock/recovery saved-key verification, masked reveal/copy, item editors for logins/cards/notes/identities, tags/favorites, password generation, encrypted history viewing, password change, logical-vault creation and explicit warned JSON export. Plain CSV/Bitwarden/Aux JSON import provides real preview/errors/commit and retry deduplication.
- Separate Vault actor binds a fresh single-use context token to the actual Chrome document ID/frame, full URL and selected connected visible form fields. Background validates current profile account, tab browsing mode/top URL, origin match and unlocked state before minimal fill. It never submits, logs or persists credentials and does not enable generic-agent password input.
- Verification: extension, Vault and daemon TypeScript passed; owned source lint passed; production Vault build and manifest entrypoints passed. A disposable real daemon/P-256 test-signing shim drove setup/recovery verification/create/lock/wrong-password/unlock through actual HTTP storage, with no page errors and encrypted-at-rest checks. Public security-state summary was version1/mode0600. This does not prove real native namespace integration. Light/dark popup captures are `/tmp/aux-l6-vault-{light,dark}.png` and contain only fixture content with masked secrets.
- Separate disposable DOM actor observation passed selected-field-only fill, no form submit, consumed-token rejection, stale URL rejection, detached-node rejection and foreign sender rejection. Import smoke preserved unknown CSV fields, rejected duplicate headers and round-tripped Aux JSON. Fixed a setup-state polling race that could dismiss an unverified recovery key, preserved imported nonstandard card/identity fields during edits, and preserved full browser-binding metadata when consuming an agent approval.
- Still outstanding: native biometric helper integration, real native-profile popup flow, passkeys/TOTP, post-submit save/update suggestions, card/identity autofill, history restore and full vault-management/auto-lock controls, encrypted provider exports/native credential exchange, and pixel parity. Remaining features are explicitly listed in `apps/vault/README.md`; no success stubs stand in for them.

### L6 native biometry adapter boundary

- Added optional `VaultBiometryAdapter` injection to `VaultService`, matching the independently built private helper adapter from L8. Enrollment verifies the current Vault password before sending the 32-byte key to the private parent pipe. Biometric unlock validates key encoding and authenticates a current Vault record before retaining it. Locks invalidate pending unlock/enrollment generations; destructive clear/account deletion remove the OS key.
- Popup shows Touch ID only from real helper availability/enrollment status and invokes enrollment/removal only on explicit user action. Missing helper remains an actionable unavailable state; password setup/unlock continue independently.
- Whole Vault/daemon TypeScript and owned lint passed. Existing focused tamper test now also rejects a fake helper's wrong master key and verifies wrong-password enrollment never calls the helper. All three crypto tests passed. No device enrollment, Touch ID prompt or owner Keychain item was invoked; actual hardware/helper integration acceptance remains outstanding.

## Integrator runtime and wiring — 2026-10-19

- Added a persistent QuickJS WASM REPL with bounded memory/stack/deadlines, validated browser bridge calls and account/profile ownership. A disposable public-RPC smoke verified async bindings, absence of Node host globals/imports, interrupted runaway execution and account deletion cleanup. CLI MCP invalidates lost/expired bindings and passes profile selection.
- Integrated ONNX memory/history, context ledger, durable inbox deliveries and encrypted Vault routers into the running daemon. The upgraded SDK7 daemon/CLI completed an actual required contributor-model smoke. Helper injection and private Vault biometry transport are wired when the native browser supplies `AUX_HELPER_PATH`; no actual biometric prompt was triggered.
- Independent daemon and CLI Node SEA executables now build from pinned upstream Node and deployed production dependencies. CLI version and disposable daemon owned-health readiness passed without launching a system Node process. This does not yet establish complete standalone packaged app acceptance.
- Bundled pinned upstream Node, Python and ripgrep were downloaded, SHA-256 verified and staged. Poppler bottle closure relocation is in progress. The production assembler requires a non-component native build with the retired shell disabled; the development launcher now lets the native browser own daemon startup.
- Retained native patches still produce 18 name/identity findings; native UI replacement and API integration remain active. Full browser link, full feature/visual parity, packaged provenance and 20 real browser tasks remain outstanding.
