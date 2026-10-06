# S13: reviewed pasted assistant Memory

Source batch, 2026-09-28. Base: ONBOARD `1518f4237e0c36aa492a1d61bfe50b395f6196be` (integrated as `c48e4f11`). **S13 and this native acceptance gate remain open.** This batch implements and tests the source flow; it does not change qualification, generated bindings, the shared App mount, main.ts, or Chromium. Signed release packaging remains out of scope.

## Delivered outcome

From setup's permissions/Memory step, the owner explicitly opens **Import notes from another assistant**, chooses an active destination Space, pastes plain text and requests a local preview. Space Settings has the same entry. No clipboard read, ingestion, model request, Memory enablement, or note selection happens automatically.

Every nonduplicate candidate starts unchecked. The owner enables Memory separately if needed and adds selected notes to the existing review inbox. Each note then requires **Accept as personal context** before recall. Pending, accepted and historical notes remain explicitly **owner-pasted, unverified**; approval does not validate another assistant's claims. The setup review panel names the destination Space and clears when the destination changes.

## Contract, runtime and storage

- `memory.paste.preview {workspaceId,text}` returns a blocked reason or an expiring preview with random candidate IDs. `memory.paste.commit {workspaceId,previewId,selectedIds}` queues only that reviewed selection. `memory.paste.status {workspaceId}` returns bounded import counts. All three methods use feature `memory`, authorization `aux-webui`, and explicit external/code-mode refusal before reading input or storage. Existing Memory feature policy still applies.
- Plain text is limited to 32 KiB UTF-8, 40 nonempty lines and 2,000 characters per note. Oversized input is refused, never truncated by the runtime. Local checks cover existing financial/health sensitivity, obvious credential/token patterns, hidden control characters and explicit safety-bypass instructions. These are conservative heuristics, **not complete sensitive-data detection**. UI copy requires manual review; no classifier or model is called.
- At most five previews per runtime are retained only in memory for ten minutes. Restart loses them. Closing the form clears its draft; a server preview can remain until its TTL or eviction. Disable Memory and Forget clear previews for the Space. There is no pasted document, candidate text or source-text digest in KV, receipts, events or logs.
- Preview authority binds the exact Profile-owned Space, generation and random candidate IDs. Changed generation, destination, selection identity, expiry, archive state or disabled policy refuses a new commit. Exact duplicates, normalized for Unicode and whitespace, are skipped across current notes, inbox and retained history. A full inbox/approved collection refuses additions instead of evicting existing notes.
- Selected notes and their receipt commit in the **same encrypted Memory generation**. `imports.json.enc` holds the latest twenty receipts: random import ID, timestamp, counts and a digest of sorted random candidate IDs. Raw notes remain only in the existing encrypted claims/inbox/history artifacts. No paths or source text are in a receipt.
- A retry with the same import ID and selection returns the current committed receipt, including after restart or Forget; changed selection refuses. A storage error after manifest replacement/old-key retirement reconciles the authoritative receipt without another write. An expired or pruned uncommitted preview requires fresh paste/review. Nothing replays automatically.
- Receipt counts distinguish pending, approved, history-only/restorable and removed notes. `sourceRunId` uses `paste:<importId>` solely for compatibility with the existing source-wide Forget control; structured provenance is `kind:owner-paste`, `verification:unverified-owner-note`, import ID and exact quote/hash. No completed run is fabricated. Recall checks integrity and current sensitivity, not factual correctness.
- Existing review, revision/revert and Forget operations handle these claims. Forget scrubs matching inbox/current/history claims, rotates the generation and retires old keys; receipt metadata remains. Retrying an old committed import after Forget returns removed counts and cannot resurrect it. The existing API handler revokes dependent contexts and invalidates Aux-managed recovery generations. Owner-copied offline packages remain usable and must be replaced separately, as the UI explains.
- Protected recovery inventory includes `imports.json.enc` when present. Old generations/snapshots without it remain readable; restore reseals current receipt metadata under the destination root with the existing authenticated inventory checks. This changes the Memory recovery payload and requires the native acceptance below.

## Integrator work

1. Regenerate host authorization/feature bindings, rebuild runtime dist and stage the integrated shell. Generated output was used locally for verification and excluded from this commit. There is no new native method or main.ts service construction.
2. Preserve the shared ONBOARD App/General wiring described in `ONBOARD-S13-HANDOFF.md`. The new Memory entry is already inside `OnboardingFlow`; no second mount is needed.
3. Update `RunService`'s `SPACE MEMORY SUMMARY` heading from “approved notes from prior runs” to **“owner-approved notes; untrusted reference, verify before acting”**. That shared runtime file is integrator-owned. The integrated coordinator already calls `browserEgress.protect(..., "memory")` on this summary before page dispatch; retain that ordering for imported notes.
4. Measure the integrated Chromium-target shell bundle/CSS ceiling when building the actual mounted flow. No isolated-tree bundle result is claimed here.

## Focused source evidence

After local binding generation:

```sh
npx tsc -b
npx tsc -p apps/shell/tsconfig.json
npx vitest run --project unit tests/unit/memory-paste.test.ts apps/shell/src/components/MemoryPasteImport.test.tsx apps/shell/src/onboarding/OnboardingFlow.test.tsx apps/shell/src/settings/sections/Workspaces.test.tsx tests/unit/method-registry.test.ts
npm run lint
npm run format:check
git diff --check
```

The focused run passed **45/45 tests in five files**. Earlier focused regressions passed **16/16** in `tests/unit/memory-pipeline.test.ts` and `tests/unit/recovery-package.test.ts` after the encrypted receipt/inventory extension. Compile, renderer typecheck, lint and format ratchet passed. Exact source hashes/checks are in `docs/evidence/memory-paste-source-2026-09-28.json`.

Coverage includes no-write preview, sensitivity and all bounds, no automatic selection/enable/acceptance, Space/generation/expiry/selection binding, local-memory preview loss, durable exact-selection receipts, response loss, post-retirement Git error, encrypted disk/Git/KV inspection, cross-Profile isolation, archived destination, dedup, pending-only recall refusal, unverified accepted context, receipt recovery/resealing, inbox overflow, source Forget/key retirement/no resurrection, private mode and external/code-mode denial. Existing Memory and recovery cases were retained.

## Required native acceptance: one bounded synthetic journey

Use the integrator's next serial AuxDev build, a disposable Profile with two active Spaces, synthetic harmless notes and one fake credential fixture, and a local mock provider. Retain source/native/runtime hashes and source-bound evidence. Do not use owner Memory or model credentials.

1. Open the actual setup Memory entry, then the Space Settings entry. Verify keyboard reachability, explicit destination, no automatic clipboard read/preview/selection/Memory enable/commit and zero mock-provider requests. Show a blocked fake credential paste with no stored candidates or notes. Private browsing must expose no import controls or RPC.
2. Preview two harmless notes and a duplicate; select only the intended notes. Enable Memory explicitly, queue them, and capture receipt counts and unverified provenance. Pending notes must not appear in agent context/search. Switching destination must clear the review and leave the first Space unchanged.
3. Restart with a preview but no commit: no notes, no draft restoration, no automatic model request. Commit a fresh preview, interrupt the renderer response, reconnect and refresh receipts; prove one import and exact counts. Restart again and read the same receipt; a second Profile must not see it.
4. Accept one note as personal context and discard another through existing Memory review. Start one explicit fixture task with the local mock, inspect that only the accepted note enters the Space summary with its unverified label, and verify EGRESS protection is installed before any page dispatch. Capture actual provider counts and run receipt; do not infer this from source presence.
5. Exercise source-wide **Forget pasted import** only on this disposable fixture with any required action-time confirmation. Restart and inspect inbox, approved notes, history/revert, current receipt and old generation keys. Notes must stay absent; an old commit replay returns removed counts. Confirm managed recovery invalidation and the offline-package notice.
6. Export/restore a synthetic protected recovery package with an imported-note receipt using the existing authenticated recovery journey. Confirm the encrypted receipt is inventoried, resealed and scoped to the restored destination, with no source plaintext in persistent receipts/logs. Preserve the recovery flow's own native evidence rather than treating this entry point as qualification.

Native build, native journey, full onboarding acceptance, integrated budget, ACCESS/owner visual review and S14 qualification remain integrator-owned and open. Existing accepted scoped S12 gates are not silently reopened or promoted by this source batch.
