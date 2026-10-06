# Aux inspection build — 2026-10-05

The inspection package is located at `/Users/rcourson/aux-chromium-stable/chromium/src/out/AuxDev/Aux.app`.
Latest implementation: `3c4379bc3` on local main, following `4d7bef5b5`. Read the current status below; older process/preview entries are historical. Preserve the original owner of any live preview and never force-clear its native slot.

## Current delivery status — October 5, 2026, evening

Local `main` includes the panel correction (`4d7bef5b5`) and reference Home/sidebar batch (`3c4379bc3`). The packaged Aux preview now has the content-area collapse control, functional sidebar chat search, fresh Search/Ask entry, reference logo/entry/card geometry, and consistent panel backing. Aux branding and page-free Ask are retained. Real saved content drives cards; empty Profiles do not fabricate reference content. This closes the demonstrated default-view defects, **not full product parity**.

See [the current inspection handoff](HANDOFF.md) and [latest retained evidence](evidence/home-parity-2026-10-05/index.json). Renderer manifest `b13d8d5b27dc99d3bba53bc55834991646107558eda5778a087ccabb40e23ac0` is a resource update on the retained Native352 native/runtime base. Exact bytes: startup JS **500722 / 501760**, startup CSS **179825 / 184320**, total JS **1842400 / 1843200**. Focused checks, shell typecheck/format/lint, budgets, cached native build and actual-window collapse/expand/Search/Ask observations passed.

The last launched inspection uses a disposable Profile and local demo model, with original supervisor PTY61610 owning cleanup. The previous launcher wait is historical; the inherited-slot launcher completed setup. The saved-Profile runtime startup issue remains unresolved. Resize remains user-owned; full current journeys, exhaustive performance/design matrices, external-provider qualification and release remain deferred. Historical `full542Passed=false` and `safetyPassed=false` remain unchanged. Work stayed local: no push, GitHub Actions, signing or release.

---

## Historical initial inspection batch

- Page-free chat home and optional context, retaining Aux name and logo.
- Command surface scope filtering and qualified routine gating.
- Split drag survives ordinary title/loading/visibility updates while real owner/document/permission changes still cancel it.
- Native mailbox first-presentation readiness preserves the original deadline and owner guards.
- Fixed the native `FrameTimingDetails` class declaration compilation failure (canonical patch 0380).
- Renderer remains within strict startup, CSS, and total JavaScript budgets. No new features were added during delivery mode.

## Current build and evidence

- Integrated source branch: `codex/sidebar-selection-next`, product integration commit `cf88bf3d0`.
- Built product identity: `eda022bb8e19ec59d473c4438fb5f625b13c6034`, filtered tree `990ffe76ff298e1d96d1417f9516837bf18363be`, clean.
- Native cached build passed. Matching native/runtime/helper pair: `/private/tmp/aux-browser-runtime-builder-native352-source-001/release/test-artifacts/builder-native352-eda022bb-runtime-helper-target27-001/pair-proof.json`.
- Current focused ownership, permission, mailbox, generation, and acknowledgement controls passed: `/private/tmp/aux-builder-native352-preparation-001/NATIVE352-RELEVANT17-TERMINAL-001.json`.
- Strict renderer budgets: startup JS 500637/501760 bytes; CSS 179504/184320; total JS 1842978/1843200. Source gates retained from the integrated batch; no repeat after the native-only declaration fix.
- All work stayed local. No GitHub Actions, push, signing, or release was performed.

## Inspection limits and remaining work

This is an inspection preview, not full roadmap or release qualification. A fresh disposable Profile uses a synthetic loopback model (`fixture-model`), confirmed configured in the actual runtime. No external model provider was qualified.

The user owns resize testing. Historical full qualification remains 541 successes and one viewport failure; full542Passed and safetyPassed remain false. Do not relabel that result. The five current functional journeys and exhaustive performance/visual matrices are deferred, as requested.

Preview supervisor PTY session 73508 / original Node owner 62055 / original App 62086. Fresh root: `/tmp/aux-native-journey-mOKiMu`. Root dismissed setup through the actual UI; the user then opened New chat. The existing supervisor has a test-harness nested native-slot acquisition wait in setup AX creation. This is separate from the product: the App is visible and the local model is configured. Preserve original cleanup ownership; no forced slot release. A successor launcher must establish the existing native-slot token before nested AX acquisition, following `run-journey.mjs`. Do not run more tests while the user inspects.

Historical Native351 compilation failure and Native352 prewrite staging input failures remain retained in their original output directories. No further product build is required for the current preview.

## Local-main integration and document precedence

Local `main` receives both the completed implementation history and the older `integration/browser-runtime` documentation history. The merge had documentation-only conflicts; product files did not conflict. The newer canonical documentation remains in place and the older branch variants are preserved byte-for-byte under `docs/archive/2026-10-05-integration-branch/`. The previously untracked `docs/ONBOARDING-7-STEPS.md` is preserved and committed. Historical agent continuation instructions are archived; the live `AGENTS.md` retains workspace build/test instructions and the frozen delivery scope.

Current status sections in README, HANDOFF, ROADMAP, EVIDENCE, execution board/graph, browser runtime plan, native runbook/journey guide and design source map point here. Their older dated entries remain historical. Existing proof bytes are copied into `docs/evidence/inspection-build-2026-10-05/`; the index retains original paths and hashes. This documentation update did not run another product qualification, build or hosted CI job. A documentation merge commit is distinct from the compiled Native352 source identity.

## Product defects versus harness defects

The native compilation failure was a real product declaration mismatch, corrected by patch 0380. The split drag lifetime and command-scope/routine gating corrections are product behavior changes with retained focused source checks; their current full native journeys remain pending. The first-presentation barrier addresses native startup readiness without changing its original deadline, permitted owner, path, sequence or generation requirements.

Unsupported mention-key spelling, the first-chat approval-versus-open receipt distinction, staging source-map/count operands, and the nested preview slot acquisition are harness defects. Their corrected source and historical failures remain separate from product qualification. The preview's actual model settings were read back: openai-compatible, literal loopback endpoint, fixture-model. No prompt was sent by root after the user took control of the window.

## Preview lifetime and next launch

The current supervisor's AX setup acquisition waits on its own native slot because the Node environment lacks the inherited slot token. App startup, identity and local model configuration already completed. Root dismissed setup through the actual UI, and the user opened New chat. The wait is bounded at 30 minutes from the nested acquisition; it may then cause the supervisor to clean up and close the preview. Do not claim an indefinite preview session or completed supervisor-ready receipt.

The builder saved a source-only next-launch correction at `/private/tmp/aux-builder-native352-preparation-001/launch-visible-preview-with-owned-slot-next.sh`. A copy is retained as `docs/evidence/inspection-build-2026-10-05/next-preview-launch.sh`. It launches the existing supervisor through the existing native-slot wrapper so nested App/AX acquisitions inherit the original token. It was not executed. Its absolute paths refer to the current local checkout and retained temporary artifacts; it is not a portable installer. Do not execute it while the current original owner is alive. Request normal supervisor stop or let its bounded cleanup retire the original App and helper, and establish actual owner/slot retirement before a subsequent launch. Never force-clear the slot, detach the fixture server or reuse a replacement process as the original owner.

## Remaining work, only when explicitly resumed

1. User-owned resize result: retain the exact historical viewport case and evaluate the user's result without relabeling the prior failure.
2. Current end-to-end Home, first-chat, command-bar modes, keyboard tabs and split-fluid journeys: deferred, not passed. Historical Native350 Home/page-free/open results are useful context but do not qualify Native352.
3. Native first-presentation behavior, required native/legacy/Stock safety union and all relevant qualification gates: focused current controls passed, full current qualification did not run.
4. Performance budgets: renderer byte limits pass with a narrow reserve; native latency, memory and original trial matrices remain open.
5. Design acceptance: complete supplied-06 source-to-surface adoption comparisons, light/dark and layout states, material/overflow/focus/accessibility matrices, contact sheets and required F21 signoff. Preserve Aux branding.
6. Real external model/provider, credentials, migration, release signing/notarization, packaging and any other roadmap owner gates remain unqualified or deferred as recorded in their original roadmap sections. No real user-data migration was authorized.

Do not resume this list automatically: the user's current instruction is to stop overtesting, finish documentation and deliver everything to local main. No push or remote CI is part of that instruction.

## Default-view correction — October 5, evening

The user's side-by-side Aux/Aside screenshots exposed a fully transparent purple chat sidebar and rail header, an opaque black rail body, oversized home welcome copy, and competing home/panel welcome surfaces. The focused correction gives chat panels an 85% minimum neutral backing (matching the existing home backing), keeps the rail conversation transparent over that single panel surface, and adds hairline panel boundaries. Home retains Aux branding with a quiet mark and a compact 736px page-free composer; when the rail owns composition, the duplicate mark is hidden and the return action remains available without a filled banner. Draft ownership, optional browser context and model setup are unchanged.

Design basis: the supplied comparison screenshot; `06/assets/06-chrome-tokens.css` panel/semantic palette, `upstream-src/chrome/browser/ui/views/frame/vertical_tab_strip_background_blur_backdrop.cc` neutral backing for legibility, and existing captured WebUI spacing/squircle/hairline tokens. The 85% panel backing is an Aux adaptation to the reference, not a claim of exact upstream opacity. Existing reduced-transparency and forced-color overrides remain active. Focused Home and composer draft/focus checks pass. Packaging and actual-window visual confirmation are tracked separately below; this correction does not close deferred qualification.

Actual-window review caught an existing higher-specificity transparency rule overriding the initial panel correction. The final selector matches that specificity; a browser computed-style check changed the chat panel from alpha 0 to alpha .85. The initial visual result was not accepted. A follow-up resource package includes this correction.

Final correction packaged and launched successfully: renderer manifest `4e0afe644a05a30de615373b4b85c9ee18ee2f8d6dab3000cbe02607f5caddce`, with the Native352 native/runtime base retained. This is a renderer resource update, not a new full-product qualification. Startup JS500637B, CSS179783B, total JS1842887B satisfy existing budgets. Package receipt: `/tmp/aux-default-ui-package-002.json`. Actual CUA window review confirmed matching dark sidebar/rail surfaces and a single welcome state; Compose here returned to the compact home composer. Final screenshot: `/tmp/aux-default-view-updated.png`. Aux remains open with sidebar visible, rail closed, disposable inspection Profile and local demo model. Active preview supervisor PTY60615 owns cleanup; `stop` requests normal shutdown. Prior preview ownership entries above are historical and retired. Existing saved-Profile runtime startup remains unresolved and unrelated to this visual correction.

## Reference parity correction — October 5, 19:38 feedback

The prior color-only correction did not establish layout parity. This batch restores the existing Search/Ask hero on fresh Home (explicit saved choices remain respected; Ask still uses the durable page-free composer), adopts the captured new-tab 64px brand mark, 48px gap, 160px top-padding ceiling and 736px entry, and restores 240px recent cards. The standalone notification-setting footer is removed; notification settings remain available through their existing controls. Recent work reflects real saved content; an empty inspection Profile does not fabricate reference cards.

The horizontal Home/conversation collapse button moves from beside the macOS traffic lights to the content area's top-left at 6px, matching captured `sidebar-BazviuRf.js`. A live native website retains an accessible chrome toggle. The sidebar now includes the captured 32px search field, 16px following gap and 6px gutters. Search filters actual saved chat titles, reveals matching collapsed-folder entries without modifying folder persistence, and clears on Escape. Aux names/logo and current Tasks semantics are retained; no invitation or account functionality is fabricated.

Source authority: `06/assets/live-1.0.928/agent-manager-1.26.929/newtab.html`, captured sidebar bundle, `06/assets/tab-design.css`, and the user-provided full-window reference. Home choice/failure recovery and saved-chat filtering checks pass, as do shell typecheck, format and strict renderer budgets. Final package/window result follows below. Full-product qualification remains deferred.

Packaged renderer manifest `b13d8d5b27dc99d3bba53bc55834991646107558eda5778a087ccabb40e23ac0` (175 assets) passed strict budgets and the cached native resource rebuild. Actual Aux verification confirmed the collapse control inside content in both collapsed/expanded states, visible sidebar search, default Search pill, and Ask opening the page-free composer then returning to Search. Screenshot: `/tmp/aux-reference-home-parity.png`; build log: `/tmp/aux-parity-package.log`. Live preview is owned by PTY61610 with the existing native-slot supervisor and local demo model; previous preview sessions are retired. This verifies the demonstrated default-view corrections, not full cross-product parity or deferred acceptance matrices.
