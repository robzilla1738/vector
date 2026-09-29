# S13 setup review, replay and first-chat admission

Date: 2026-09-29. Base: integration `18007dbd436c2fb36b18d04853d3a86b604d128b`. This batch extends the existing replayable onboarding and pasted-Memory setup. **S13 remains native-open.** Source presence, a setup receipt, or a queued run alone does not establish the required native import-to-running-chat journey.

## Audit and chosen outcome

The current roadmap requires seven optional/replayable steps, four-browser import review with Keychain explanation, model data-use disclosure, live personalization, default-browser cooldown, permissions and three postcard questions ending in the first chat. The original `c48e4f11` source implementation and subsequent pasted-Memory source already cover those surfaces. The current App mounts `OnboardingHost`, and General contains the replay entry. Historical statements that the entire onboarding directory or shared mounting are absent are stale.

The concrete missing handoff was a trustworthy review before the first chat, together with replay/reconnect correctness. This batch delivers that owner outcome without duplicating importer, model, Memory or recovery services.

## Delivered behavior

- **Review the latest browser import.** The postcard now reads the existing durable `import.status` receipt and listens to `import.progress`. It presents source-browser names and confirmed bookmark/history/tab counts, skipped counts and running/interrupted/error state. Counts explicitly describe the latest receipt; they do not claim to be a current library inventory. A missing receipt differs from unavailable progress. Returning to Import is explicit; review never discovers a browser Profile, resumes a job or imports anything. Newer receipt events win over delayed responses and failures from older status requests.
- **Review authority and recovery.** The summary names the configured model provider without rendering keys, explains the exact reviewed page and separate temporary task session, links back to model/permissions/import/recovery steps, and distinguishes browser-data import from Aux's own Keychain access. Recovery copy explains the phrase/package boundary, new-empty-Profile staging/restart, excluded cookies/credentials and externally copied package limits after Forget. Existing `RecoveryPackage` performs the actual reviewed/authenticated operations.
- **Fail closed when recovery is unknown.** Recovery readiness is checked on opening/reconnect/focus and immediately before first-chat dispatch. An unavailable status is explicit, offers retry and blocks a new chat. Recovery controls wait for a successful status check; staged recovery keeps restart guidance. Finishing later or skipping remains available. The runtime's existing staged-restore guard remains in force.
- **Keep the reviewed source exact.** The UI offers only idle, unowned HTTP(S) pages in the current native window, excludes loading/agent/external-controlled pages, and invalidates review on URL/session/document changes. It rechecks the live source after the asynchronous readiness read before calling `onboarding.start`. The onboarding runtime also checks loading/control state before reserving a receipt and again before dispatch; a race leaves a failed receipt with the same reusable delivery identity and performs no adapter call.
- **Replay saved progress reliably.** Explicit replay creates a fresh flow instance, prevents the old revision from continuing to edit, coalesces duplicate requests and ignores stale startup responses. The host refuses Private and Quick Ask utility windows. Disconnection disables setup controls while allowing Finish later without an unavailable RPC; reconnect does not reopen a view dismissed in that window. Explicit replay remains available after reconnect. The existing server-owned run/chat IDs and no-automatic-retry semantics are preserved.

## Ownership and integration

Changed only:

- `apps/shell/src/onboarding/OnboardingFlow.tsx`, `OnboardingHost.tsx`, `onboarding.css` and focused tests.
- New onboarding-specific `SetupReview.tsx` and test.
- `apps/runtime/src/services/onboarding.ts` and `tests/unit/onboarding.test.ts`.
- This handoff, the original onboarding handoff's current-state notes, and the source evidence JSON.

**No new shared wiring is required.** The existing App mount and General replay action on base `18007dbd` invoke these components. Integrator must stage the updated runtime and shell together in the next coherent candidate. No shared contract, API registry, generated binding, App/Settings assembly, importer service, native source or Chromium patch was changed. No native build or paid model request was run.

This batch does not change the importer's accepted S7 contract, source formats, merge/dedup rules or recovery authentication. Preserve the prior four-browser/import-restart evidence. It also does not provide a new native caller-window authorization mechanism; the UI and existing Profile runtime scope are checked here, while native Private/Profile/window admission and isolated-source authority remain native acceptance requirements.

## Focused native acceptance

Use one disposable Profile, fixture Chrome data and a synthetic local model. Reuse the accepted importer format matrix instead of repeating unchanged browser-format tests.

1. Fresh Profile opens setup; entering Import performs no source discovery until the owner requests it. Review a small fixture Chrome Profile/category selection and import once. Skip/leave/reopen setup; the postcard's latest receipt shows the same confirmed counts. An interrupted import is labelled honestly and returning to Import requires fresh review before retry.
2. Confirm Keychain and recovery explanation before any optional credential or package action. Cancelling the actual OS prompt remains a STORE/native gate, with its own evidence; displaying setup copy is not proof of authentication. Simulated recovery-status failure must block first-chat dispatch and offer an explicit retry. A staged package must block starting until normal Quit/restart.
3. Configure an unpaid local model through the existing reviewed model setup. No provider request occurs from setup acknowledgement, import review, replay or summary refresh. Theme/layout changes still repaint normally; use existing personalization evidence unless this candidate changes those paths.
4. Review an idle fixture page in the current window, pick a postcard and start. Record the actual first `runId`/`chatId`, isolated-page source authority and the local model's request count. Observe that chat running in the normal chat surface. Two immediate clicks produce one delivery. No cookies/saved passwords/account authority are copied.
5. Replay while setup is open and after the first chat. Replay opens the current Welcome state and later opens the same first chat; no second import/model dispatch occurs from replay. A stale response from before replay must not replace the new view. Lost start response/restart reconciles the persisted identity, without automatic retry. Existing deleted-first-chat refusal remains required where exercised with appropriate fixture approval.
6. While setup is open, disconnect the runtime. Controls become unavailable, Finish later closes, and reconnect does not show it again in that window until explicit replay. Browser use stays available. Private and Quick Ask utility windows produce no onboarding read/update/start calls.
7. Navigate, reload, move or place the reviewed source under agent control during readiness checking. Require refusal before adapter/model dispatch. Open a second Profile and confirm independent setup/import/first-chat state. Native caller-window and Profile binding must be established by browser-owned identity, not inferred from labels.

Evidence must include the combined source/native/build hashes, fixture/import receipt counts, actual first-run/chat identity, bounded model-request counts, replay/reconnect/refusal observations and cleanup. Keep S13, ACCESS and S14 open until their complete native gates pass. Signed release packaging remains outside scope.

## Focused source evidence

40 distinct cases pass: runtime onboarding **15**, flow/host **17**, setup review **8**. Runtime output was rebuilt before tests. Workspace rebuild, renderer typecheck, lint (**374**, ceiling **390**, no new onboarding warnings), format ratchet and diff checks pass. The renderer tests use synthetic receipts/pages and mocked bridge/model seams; they do not qualify native behavior.

```sh
npx tsc -b
npx tsc -p apps/shell/tsconfig.json
npx vitest run --project unit tests/unit/onboarding.test.ts apps/shell/src/onboarding/OnboardingFlow.test.tsx apps/shell/src/onboarding/SetupReview.test.tsx
```

File hashes and verification scope: [`evidence/onboarding-review-source-2026-09-29.json`](evidence/onboarding-review-source-2026-09-29.json).
