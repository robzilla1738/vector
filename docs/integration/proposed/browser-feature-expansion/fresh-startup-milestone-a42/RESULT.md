# Aux fresh-browser milestone — ready for local testing

2026-10-25, repair A25. The bounded milestone ends here; no next feature batch has started. **The packaged browser is open and ready for local testing in the approved disposable scope. Aux is not feature-complete or release-ready.**

## Build and launch

- App: `/Users/rcourson/Documents/Vibe/web/out/provided-candidate-fresh-browser-20261025-a45/Aux.app`.
- Use [Launch Aux.command](../../../../../out/provided-candidate-fresh-browser-20261025-a45/Launch%20Aux.command) to reopen it. This starts the required protected development launcher; opening the raw app alone is not this tested launch path.
- Browser/framework A65, native daemon A59, paired HTTP entry A17, unchanged supplied UI revision33; packaged CLI remains unverified.
- Only `/private/tmp/aux-fresh-browser-c5mop317` was used. Final test profiles are **Aux Final Work** and **Aux Final Personal**. Earlier partial disposable profiles remain preserved; they were not reset or migrated.
- The accepted app at `out/provided-candidate-local-browser-pass/Aux.app` remains intact. Fixed candidate paths/approved state are part of this development setup; do not move it or copy its acceptance to another package.

## Actual working / failed / untested checklist

| Check | Actual result |
| --- | --- |
| Startup and paired daemon | **Passed.** Final A25 initial launch and normal restart return HTTP200, `aux-daemon`, `ready:true`. |
| Navigation | **Passed.** Synthetic navigation/back-forward in the affected cohort and public HTTPS navigation in final A25. |
| Two isolated fresh profiles | **Passed for tested storage.** Work and Personal keep distinct cookies, localStorage notes and chat contexts `/u/3` and `/u/4`. Extension isolation is still unverified. |
| Profile switching | **Passed.** Primary popup activates actual Personal and Work profile windows in both directions. Source windows and drafts remain intact. Switching focuses/opens separate profile windows; it does not retarget a live window in place. |
| Multiple windows | **Passed.** Shared logical tabs with independent selected views; native session restore retains original page identities. |
| Draft and attachment persistence | **Passed for the synthetic TXT case.** Original unsent Work text and TXT chip recover after normal restart; Personal retains its separate draft. The final same-package restart repeats Work recovery successfully. Large/missing attachment cases remain untested. |
| Sidebar / chat / Settings | **Passed after warm-up.** Actual collapsed/expanded sidebar, connected local chat and General Settings observed. AI responses were not tested. |
| Immediate Settings during profile activation | **Known limitation.** First click can safely show a local-service-starting refusal; retry after account warm-up loads Settings. |
| UI preservation and comparison | **Passed for observed surfaces.** UI33 assets/styles/fonts unchanged; final actual app compared to supplied Aside and accepted Aux captures. Rounded central pane, seamless toolbar and glass panels retained. Different viewport/profile data prevents a whole-window pixel-equality claim. |
| Normal shutdown and restart | **Passed within measured process group.** Browser exit0, `groupStopped:true`, `forced:false`; no candidate executables remained, then same package restarted. This is not universal OS descendant custody proof. |
| Local signatures / assembly | **All17 verify.** Same approved repair scope/identity/entitlements; compilation/signatures alone were not used as runtime evidence. |

## Known limitations and explicit follow-ups

- **Provider/account integration:** authorized BYOK and eligible ChatGPT/Codex model responses, OAuth, hosted speech/sync/sharing require separate end-to-end checks. No inference or paid-provider request was used here.
- **Extension compatibility:** Chrome extension installation/profile isolation, 1Password autofill and desktop/native messaging remain unverified. Ordinary mode disables supervised helper/native-addon execution, so native messaging may require implementation as well as testing.
- **Deliberately disabled:** privileged tasks, exec/PTY, Computer Use and native addons. Subprocess-based memory indexing reports `spawn EPERM`; local chat/draft storage works, but indexing is not operational. The deferred task authority architecture is not part of this build.
- **CLI:** included but URL/profile routing remains unverified; it did not hold up the browser.
- **Hover:** existing accepted implementation preserved; genuine edge-hover animation needs a manual check because the current input API has no pointer-move primitive.
- **Menu lifetime:** closed legacy non-View popup delegates may be retained. Actual close-event dispatch is fixed; broader ownership cleanup is deferred. Repeated popup use may retain memory.
- **Data/recovery:** owner/legacy profiles remain refused; no migration, credential/key reset or owner-state access. Advanced interrupted-write/crash recovery and broad attachment cases remain separate. This is a fresh-profile development candidate, not a general migration/installation build.
- **Google services:** no Google browser service keys were configured; ordinary HTTPS browsing passed. Provider-dependent browser features may show a missing-key notice.

## Remaining release blockers

Complete account/provider and extension/native-messaging acceptance; resolve or explicitly scope disabled automation/indexing and CLI; clean up the warm-up/menu-lifetime limitations; perform clean-install/packaging and intended release-platform acceptance. Production signing, notarization, updater/distribution and release remain a separate authorized milestone. No provisioning, new OS grants or release work was performed here.

## Evidence

- [Final actual runtime receipt](actual-focused-browser-checks-a25.json), [UI comparison](actual-ui-comparison-a25.json), [finite checklist](CHECKLIST-CURRENT.md).
- [Exact package/signature inventory](actual-bounded-repair-a25.json), [source composition](source-composition-a25.json), [initial launch](actual-launch-attempt-a25.json), [same-package restart](actual-launch-restart-a25.json).
- Actual screenshots: `out/provided-candidate-fresh-browser-20261025-a45/actual-example-chat-a25.png`, `actual-restored-chat-a25.png`, `actual-collapsed-chat-a25.png`, `actual-expanded-chat-a25.png`.
- Prior failed source/build/signing preimages and A13/A17/A20/A23 runtime receipts remain preserved. Earlier startup failures are historical, not current readiness claims.
- [Owner bounded repair approval](owner-signing-approval-a5.json). No formal release/owner runtime-acceptance marker was fabricated.
