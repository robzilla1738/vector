# Bounded local browser milestone — final checklist

A25 is ready for local browser testing in the fixed disposable scope. This is not full product or release acceptance. See [actual results and limitations](RESULT.md).

## Must finish — completed for this milestone

- [x] Fix native first-window construction order and paired daemon startup.
- [x] Retain genuine native validation objects/storage lifetime and handle ordinary journal lock handoff without bypassing live identity/root/signature checks.
- [x] Correct HTTP adapter request cloning; actual health and connected UI.
- [x] Standard profile selection opens/focuses real isolated native windows, preserves source state and dispatches on actual popup close.
- [x] Native session defaults and logical-ID snapshots recover actual page-bound drafts/attachments without rewriting draft keys or explicit startup choices.
- [x] Real registered shutdown handler gets an execution opportunity; normal final shutdown/restart verified.
- [x] Assemble current browser A65, native daemon A59, paired entry A17, supplied UI33 and packaged CLI; preserve accepted app.

## Must verify — focused actual checks completed

- [x] Initial startup and same-package normal restart; HTTP200 ready true.
- [x] Navigation, back/forward and public HTTPS.
- [x] Work/Personal cookies, localStorage and chat context separation.
- [x] Primary profile popup selects both native targets without losing source drafts.
- [x] Multiple windows share logical tabs with independent selected views.
- [x] Original Work text+TXT and separate Personal draft recover after native session restart; Work repeated after final same-package restart.
- [x] Sidebar collapsed/expanded, chat, settled Settings; actual final screenshot/reference comparison.
- [x] Normal browser exit0, process group stopped without force, no candidate executables remaining; same app reopened and left running.

## Known limitation / still needing implementation or diagnosis

- [ ] Immediate Settings during profile warm-up can refuse safely; retry works. No data loss observed.
- [ ] Legacy non-View popup delegate ownership cleanup; repeated menu use may retain memory.
- [ ] Subprocess-based memory indexing and privileged execution/native helpers remain disabled in ordinary mode. Broader authority work is deferred, not implemented.
- [ ] CLI URL/profile routing is packaged but unverified; fix only after focused actual routing checks demonstrate a failure.

## Explicit follow-ups / can defer for this milestone

- [ ] Account-dependent BYOK/eligible ChatGPT/Codex inference and hosted services: actual authorized end-to-end tests; no paid request used here.
- [ ] Chrome extensions/profile isolation, 1Password autofill and native messaging: actual compatibility tests; disabled helpers may need implementation.
- [ ] Genuine pointer-hover animation: manual observation; existing implementation preserved.
- [ ] Large/missing attachment cases, broad crash/advanced interrupted-write recovery and clean installation outside approved scope.
- [ ] Owner/legacy adoption and migration: refused until separately designed and authorized; existing credentials/state never reset.
- [ ] Production signing, notarization, updater/distribution and release: separate milestone.

Consequences: use the protected launch command and these disposable profiles for local testing. No general migration/release readiness, full automation/extension support or account-backed AI claim is made. No automatic next batch.
