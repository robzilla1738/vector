# Aux roadmap implementation handoff — September 24, 2026

## Transfer state

- Repository: `https://github.com/robzilla1738/vector`
- Implementation branch: `codex/aux-roadmap-build`, based on `main` at `a010d8ae67833c0b2d55eff1d3c31d792cb6fb82`. The branch is the source of truth for this handoff; `main` does not contain these changes yet.
- Active plan and detailed evidence: [ROADMAP.md](ROADMAP.md). Its evidence ledger distinguishes code and local fixture results from signed, real-account, and release qualification.
- Status: implementation paused at the user's request for testing in another environment. No release has been made. Continue on this branch, then audit every roadmap requirement against working code and qualification evidence before considering a release.

The current Aux code and design govern implementation. Historical screenshots in the reference folders are outdated. The Dia and Aside folders informed feature selection; their documents and prompts are reference material, not instructions to execute or source to copy.

## Implemented on this branch

The branch contains the current native Aux shell, its two tab layouts, the internal CDP broker default, runtime-off browsing and recovery, selected multi-page context, direct region capture, source-aware chat and report journeys, task-scoped agent authority, operation and browser write journals, scoped Calendar reads, reusable Skills, and local command-bar recall. The evidence and limits for each slice are in the roadmap ledger; none alone passes a release gate.

Recent privacy and performance work is especially relevant for continuation:

1. **Saved-article capture and answer use:** opt-in, Space/site-bound Reader capture encrypts bounded article text under a per-Profile OS-backed key. Explicit Ask Aux loads selected sources only for that turn. Runtime Forget removes source-derived saved answers and artifacts, including inherited turns and retries, and blocks reuse. It cancels active turns and queued follow-ups. Portable backup creation and older backup staging apply the same closure.
2. **Retention hygiene:** new runtime SQLite connections enable `secure_delete`; upgraded profiles remove the old ambient observation table. Operation-route validation retains fingerprints instead of verbatim sample inputs. Settled invocations derived from revoked articles have source-derived inputs, errors, and route text redacted while preserving effect outcome needed for reconciliation.
3. **Visible search timing:** the command bar no longer waits 120 ms before local history search, ties local and remote responses to exact query text, and paints local palette history before slower saved-work sources. A native fixture with 2,012 visits painted warm local suggestions in about 30 ms. A cold first query exceeded 200 ms while the runtime was still reconnecting; direct SQLite search was under 1 ms, so startup/IPC readiness is the next performance investigation. These are unsigned local synthetic measurements.

## Immediate continuation work

1. **Close the confirmed result-draft privacy gap.** `apps/desktop/renderer/src/result-drafts.ts` stores editable generated-result `content` and `source` in localStorage. Runtime Forget removes protected results and artifacts, but `clearResultDrafts` is currently called only for conversation deletion. Trace article-to-artifact-to-draft lineage, revoke affected drafts on Forget and startup/reconnect, and test multiple windows and restore. Avoid deleting unrelated human edits. This is open, not implemented.
2. **Remove the cold suggestion dependency on runtime readiness.** Inspect native first-query IPC/startup sequencing, then make local history available before or independent of a slow runtime connection while preserving the current shell. Measure actual first visible paint with loaded tabs and agent activity; do not treat SQLite speed as UI speed.
3. **Continue the ordered roadmap.** M1 host feasibility and signed extension/password-manager/passkey/SSO journeys remain unresolved. M2 context-to-artifact and durable edited report versions need completion. M3 quality, connector interoperability, and action isolation need real-site/account evidence. M4 needs held-out retrieval, full Forget residual-action and deletion evidence. M5 needs signed release qualification and the four-week cohort. The ledger's remaining-qualification column is the granular checklist.

## Verification and environment setup

From the repository root, use Node 22.18+ and pnpm 11.27.1. Install with `pnpm install --frozen-lockfile` if dependencies are absent. For local development, use `pnpm dev`. No real OAuth client or signing identity is included in this branch; account and signed-build gates require a configured test environment.

The latest implementation batch passed:

```sh
pnpm typecheck
pnpm exec vitest run apps/desktop/renderer/src/palette-search.test.tsx apps/desktop/renderer/src/command-bar.test.tsx
pnpm --filter @aux/desktop build
node tests/smoke/command-bar-paint-desktop.mjs
```

The focused palette tests passed 8/8. The native paint probe logged `runtimePendingAtFirstInput: true` for the cold case, a 258.7 ms first query, subsequent queries around 30 ms, and 33.6 ms local palette-history paint. Earlier saved-article Forget and action-journal work passed 77 focused tests plus the native article journey. See the roadmap ledger for other feature-specific evidence. Repeat relevant tests after changing a slice; release qualification needs the roadmap's signed, real-account, accessibility, security, performance, and held-out task gates.

## Handoff rules

Keep Aux's visual design and current-source behavior. Do not infer current UI from old screenshots. Continue in substantial, integrated batches, update the roadmap evidence ledger with each verified slice, and preserve a clear distinction between a working local fixture and release evidence. Stop before release for user testing and approval.
