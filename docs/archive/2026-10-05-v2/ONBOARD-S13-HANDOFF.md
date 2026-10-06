# S13: replayable setup to the first useful chat

Original source batch, 2026-09-28, integrated as `c48e4f11`; IMPORT recovery was integrated as `76b26403`. **S13 remains open.** Shared App mounting and General replay wiring are now present on integration `18007dbd`. The subsequent [setup review/replay batch](ONBOARD-REVIEW-S13-HANDOFF.md) adds receipt review and recovery/source admission checks. Neither source batch establishes the native first-run journey or changes `qualification.json`. The original implementation and acceptance contract below remain useful context.

## Delivered outcome and contract

`packages/contracts/src/onboarding.ts`, `apps/runtime/src/services/onboarding.ts`, and `apps/shell/src/onboarding/**` connect seven optional steps: welcome/recovery, reviewed browser import, model disclosure/setup, live personalization, default-browser choice, permissions, and a three-question postcard that opens its actual first chat.

- `onboarding.get {}` reads Profile-owned progress and reconciles an existing first-run receipt. It does not discover import sources, open a page, retry a task, or call a model.
- `onboarding.update {revision, action, step?}` supports visit, skip, finish later, replay, disclosure acknowledgement, default prompt reservation, and completion. Stale windows fail with a recoverable conflict. Every step is reachable on replay; replay preserves imports, settings, disclosure, prompt cooldown and first-chat identity.
- `onboarding.start {revision, postcardId, page}` accepts an exact reviewed live HTTP(S) source (`pageId`, URL, document epoch, session). It requires disclosure and a configured model. Prompts and run/chat identities are server-owned. No caller-chosen prompt, run ID, task scope, grant or source authority is accepted. All three methods have `aux-webui` authorization and explicit external-client refusal.
- A pending receipt is persisted before dispatch through existing `RunService.start` with its internal stable `deliveryRunId`. Concurrent requests reuse the pending promise. A lost response is reconciled against that exact run. Restart with no run marks the receipt interrupted, with **no automatic dispatch**; an explicit retry reuses the identity. Deleted first chats are never recreated by replay. An unexpected adapter run identity is refused without a second delivery. The first task uses at most eight model calls and respects a smaller configured limit; ordinary spending/approval gates remain in RunService.
- Protected Repo KV key `onboarding.state.v1` contains bounded step metadata, revision, disclosure/cooldown and run/chat IDs. It contains no source URL, title, prompt, credential, imported data or grant. Malformed state fails closed instead of silently resetting and repeating effects.

## UI behavior and reused surfaces

- Welcome supports ⌘↩ and Escape to save Finish later. Modal focus uses the shared Dialog implementation and moves to the new step heading. Settings replay opens saved progress. Startup/utility/private guards belong to the host integration below.
- Import reuses `ImportDataSetting`: Chrome, Arc, Safari and Firefox previews stay opt-in; existing durable receipt recovery works on remount. Entering the step only reads `import.status {}`. Leaving does not silently cancel an active import. Keychain copy distinguishes bookmarks/history from separate saved-password transfers and Aux's own protected storage.
- Disclosure appears **before** mounting `ModelsSettings`. Gateway/BYOK, paid testing, selected-source data use, Contributor data use and OS credential storage are explained. Acknowledging disclosure does not issue a model call. Existing model settings/probe/recovery behavior is reused.
- Theme, layout and current Space color call existing settings/Space operations; the App applies their normal live updates. Both layout miniatures remain available. There is no new animation or licensed asset.
- Default-browser status is measured through the existing native bridge. Only an explicit action requests the OS change, with a persisted seven-day setup cooldown reserved first. Replay cannot reset that cooldown. The ordinary Settings control remains available.
- Recovery reuses `RecoveryPackage`: phrase, authenticated review, explicit staging and restart guidance. Reading native restore status is side-effect-free; staged recovery disables starting the postcard, and the runtime checks pending restore again before dispatch. This is a setup entry point, not new recovery protocol or recovery qualification.
- Postcards preview the exact server-owned prompts. Tools use shared badges. Calendar/MCP pills appear only when the current Space's catalog reports an active/approved connection and explicitly say separate task/tool approval is required. Setup never creates those grants.
- The user chooses an existing available HTTP(S) source or explicitly opens a URL for review. Embedded credentials and non-HTTP URLs are refused. Source review is invalidated on identity/navigation change. No source is auto-selected. A View selected page action saves progress, activates the actual tab and closes setup for reading before returning. Browser control then follows the integrated isolated-task-page implementation; **native source-copy/partition behavior is not proven by these source tests**.

## Assembly contract (already integrated; shared files remain integrator-owned)

1. In `apps/shell/src/App.tsx`, add a deferred surface beside the other declarations:

   ```tsx
   const Onboarding = deferSurface(() => import("./onboarding/OnboardingHost"), "Setup", true, true);
   ```

   Mount `<Onboarding />` once in the normal App return near `<Toasts />`. Keep it below the existing Quick Ask early return. The host itself guards native host, connected state and private mode; pass `enabled={false}` for any other utility-window route. It reads progress only after runtime connection. A Profile without progress opens Welcome; later/complete Profiles do not reopen automatically.

2. In `apps/shell/src/settings/sections/General.tsx`, import `requestOnboardingReplay` from `../../onboarding/replay` and add an indexed field, for example:

   ```tsx
   <IndexedField label="Set up Aux" hint="Replay import, model setup and your first chat. Saved work is kept.">
     <button className="btn sm" onClick={requestOnboardingReplay}>Replay setup</button>
   </IndexedField>
   ```

   Keep the Settings surface mounted under the shared modal so closing setup can restore its trigger focus. Opening the actual first chat uses the store's existing conversation transition.

3. Regenerate host bindings after integration, then compile runtime dist. Local generated outputs were used only for verification and are excluded from this commit. No new native method, native patch, main.ts service construction or EGRESS contract change is required: the onboarding API lazily owns one service per existing Services object.

4. Run one integrated Chromium-target shell build and measure its bundle/CSS ceiling before staging the next serial native build. A build of this isolated tree would omit the not-yet-wired host; this lane does not report such a build as onboarding bundle evidence.

## Focused source evidence

Commands:

```sh
node scripts/gen-host-bindings.mjs
npx tsc -b
npx tsc -p apps/shell/tsconfig.json
npx vitest run --project unit tests/unit/onboarding.test.ts apps/shell/src/onboarding/OnboardingFlow.test.tsx tests/unit/method-registry.test.ts
npm run lint
npm run format:check
git diff --check
```

Results: 21/21 tests across three files; workspace compile and renderer typecheck passed; lint and format ratchet passed. Generated files are restored before commit. Source hashes and exact check counts are in `docs/evidence/onboarding-source-2026-09-28.json`.

Coverage: persistent skips/replay and Profile isolation; stale window conflicts; cooldown survives replay; model disclosure/configuration; exact source identity and URL refusal; duplicate click/restart/lost-response first-task reconciliation; configured lower call budget; removed-chat refusal; no raw source/secret in setup receipt; native Dialog focus/⌘↩/Escape; four unchecked importer previews with no automatic discovery/write; staged recovery blocks first task at UI and runtime; unexpected run identity and external-handler refusal; private/disabled host exclusion and explicit replay.

## Required native acceptance, one coherent journey

Use one disposable Profile and synthetic `AUX_IMPORT_SOURCE_HOME`, the supported fixture Chrome importer, and a local mock provider. Do not configure or call an owner model account. After the integrator's single build:

1. Launch a fresh ordinary window. Verify welcome and keyboard skip/focus, then replay from the actual General Settings entry. Prove private and Quick Ask windows do not call onboarding RPC.
2. Import only reviewed fixture Chrome history/bookmarks. Capture job ID and imported/skipped counts; leave/reenter the step and restart Aux. Confirm durable import receipt and browser data, setup step and no repeat import. Existing four-format S7 acceptance is preserved; the newer IMPORT mid-job interruption/retry gate stays separate until measured.
3. Acknowledge model data use, configure the local mock endpoint and use the explicit connection test. Record receiver request counts: zero before Test/Start. Confirm failure/recovery copy with one bounded unavailable-endpoint case; no paid model call.
4. Change theme, Space color and both layouts. Verify live normal shell chrome and keyboard reachability under system reduced motion/transparency. Owner visual acceptance remains a separate ACCESS gate.
5. Measure current default-browser status. Skip/replay must issue no OS prompt. If changing the disposable fixture's system default is not wanted, leave real OS acceptance open; source stubs do not qualify it. Any explicit request must leave a durable cooldown after restart.
6. Open a loopback fixture article explicitly, select it, review context, and start one postcard. Capture the exact onboarding receipt and run ID, the runtime's isolated-page/native isolation receipt, provider request, and visible chat. Confirm the owner source is preserved and the expected draft/answer appears. A queued row alone is insufficient.
7. Lose the renderer response after runtime dispatch, reconnect/replay and open the same chat. Prove one delivery identity and one first run. Separately restart after pending receipt before dispatch; observe interrupted guidance and zero automatic model requests, then explicit same-ID retry. Delete only a disposable fixture chat using the usual action-time approval where required, and prove setup does not recreate it.
8. Navigate the reviewed source before Start and require refusal before dispatch. Finish later at each step, restart and replay with state preserved. A second Profile must have independent progress and cannot recover this receipt.
9. If recovery staging is exercised, use only a disposable empty Profile and synthetic protected package; complete the existing authenticated review/restart path. Retain the recovery store's own acceptance manifest rather than treating the setup link as proof.

Write a source-bound native manifest containing shell/runtime hashes, native identity, fixture hashes, receipts, actual run ID/provider counts, screenshots and refusal cases. Only then close the corresponding ONBOARD gates.

## Still open after this source batch

Native journey above and the focused review/replay matrix in `ONBOARD-REVIEW-S13-HANDOFF.md`; integrated candidate bundle budget; full SETTINGS/CHAT/MEMORY prerequisite acceptance; owner review of final copy and both layouts; ACCESS/VoiceOver and final S14 qualification. The subsequent source batch in `MEMORY-PASTE-S13-HANDOFF.md` adds reviewed pasted assistant-Memory import from the permissions step; its native restart/review/Forget gate remains open. Signed release packaging remains out of scope. No universal native/roadmap completion claim is made.
