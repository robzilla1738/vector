# Runtime packaging evidence

Observed locally on macOS arm64, 2026-10-19. This is runtime-component evidence; packaged browser acceptance remains outstanding.

| Component | Evidence |
| --- | --- |
| Node 26.12.0 | Official archive SHA-256 matched; independently built CLI SEA returned `0.2.0`; daemon SEA started in disposable AUX_HOME and reported owned PID/readiness. |
| Python 3.13.16 | Pinned Astral archive matched; isolated interpreter imported TLS and SQLite successfully. Installed and pinned dependency license texts retained. |
| ripgrep 15.2.0 | Official archive matched; executable reports expected version and PCRE2 capability. |
| Poppler 26.10.0 | 52 public bottles matched pinned SHA-256. Relocated 389 actual Mach-O files to bundled peers and applied local ad hoc signatures. Generated PDF metadata, text extraction and PNG rendering passed. A separately relocated directory with spaces extracted expected text with Homebrew absent from PATH. |
| Memory model | Six immutable model/tokenizer files verified by the local runtime; full Apache-2.0 text, notice and manifest retained. |
| Extensions/helpers | Current workspace production builds and TypeScript pass. Helper bundle resources include original notices before local signing; no owner capture/contacts/messages/biometry prompts used for these checks. |

`scripts/package-aux.mjs` assembles the actual native Aux app with bundled production daemon/CLI dependencies, helpers, extension output, runtime and memory model. Final mode rejects component builds or the retired shell flag; intermediate mode is explicitly labelled. The assembled app's own native executable remains the entry point and owns daemon startup. The development launcher supplies disposable profile/home and mock Keychain flags and never prestarts a second daemon.

The assembler has not yet been validated by a full rebuilt browser launch. Native full link, non-component install, final effective-source/bundle provenance audit, visual comparison and the complete task checklist remain required.

The actual-model acceptance runner is `scripts/e2e.mjs`. It requires explicit account/profile IDs and refuses homes/profiles outside an `aux-*` system temporary directory. It stores the `.env` key through the credential API and removes it in cleanup. Its twenty cases cover ten real browser interactions, working files/shell transformations, explicit CSV/JSON attachments, cross-session semantic memory, child delegation, task plans, real automatic compaction, and a browser-to-file report. Browser-only cases require real browser tool events and server-observed fixture actions. A partial run is labelled incomplete. The suite is prepared but has not yet run against the rebuilt browser.
