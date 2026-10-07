# Aux v3: the fast, free, powerful AI browser

## North star: what Aux feels like after this plan

- **Instant.** Aux opens as fast as stock Chromium, typing in the command bar paints the same frame, and pages prerender before Enter.
- **Beautiful.** It looks like Aside, pixel for pixel, while staying Aux: same vertical sidebar, 42 px toolbar, translucent glass, alpha typography and squircles, with the Aux name, mark and voice.
- **Free:**
  - Every feature that exists is on. Nothing is hidden behind qualification gates.
  - The agent works in your real, signed-in sites and only stops for **money** and **credentials**. Each stop is one Touch ID tap, and "Always allow" means always.
- **Powerful AI:**
  - frontier models by default;
  - local models detected automatically;
  - sign in with an AI account instead of pasting keys;
  - your extensions, memory, skills, routines, subagents, MCP and a real terminal.
- **Unblocked development.** No CI, Actions, Dependabot, budget gates, evidence manifests or slot receipts. Typecheck, lint, fast tests, launch, look.

## Context (original audit, before v3 implementation)

**Why this plan exists.** The owner asked for a full audit and a hand-off plan to make Aux the best AI browser. The plan must be fast, small, beautiful and frictionless, with no over-testing, CI or release work.

**Sources**
- The reference corpus is `~/AI Blueprints/01–07`: 01 Comet, 02 Muse, 03 ChatGPT/Codex, 04 Grok/Cursor, 05 Dia, **06 Aside** (the design to copy), 07 Arc.
- The path the owner supplied, `~/aux-chromium-stock-measurement`, is the stock Chromium 154 checkout for the performance baseline. Its pinned StockFast build has now completed; comparative measurements remain deferred to the next round.

**Original audit findings: strong foundations, held back by gates and process**

The table records the starting point. Current implementation and build evidence are in [STATUS.md](STATUS.md); the remaining validation targets are preserved below.

| Area | Today |
|---|---|
| Features | 91 features are refused unless "qualified" for the exact clean commit. **Only `splitView` qualifies.** |
| Agent approvals | Every click needs a separate human approval. `CONFIRMATION_TIERS` is frozen (`apps/runtime/src/safety/confirmation.ts:6`), "always" is downgraded to "ask" (`safety/decide.ts:253`), and the guardian model runs on risky steps. |
| Agent reach | The agent sees only signed-out, isolated task tabs and @mentioned tabs. |
| Agent limits | 16 model calls and 60 steps per run, a 90 s timeout per call, bash network off, and an error after 8 code-mode sessions. |
| Agent engine | The legacy JSON planner (46% pass@1) is the default whenever pages are attached (`services/runs.ts:1067`). The tool loop scored 95.3%. |
| Models | All four routes use `meta/muse-spark-1.3-contributor`. The Imagen IDs are stale. Chat has no model picker. There are no local presets and no sign-in. |
| Startup | The runtime fails to start on a saved Profile. Each boot re-reads, decrypts and rewrites every sensitive row in about 40 tables (`store/sqlite-protection.ts:184`), runs VACUUM, and builds about 60 services eagerly. |
| Build | The release build has never been produced. ThinLTO and PGO are forced off. No H.264/AAC. Dev numbers are taken with DCHECKs on. A 145 MB Node binary ships inside the app. |
| Command bar | Every keystroke goes to Node and SQLite. There is no native autocomplete and no prerender. |
| Shell | Startup JS is at 99.8% of its byte budget. Settings is one 268 KB chunk, and zod loads at startup. |
| Design | Horizontal is the default. Rows are 30 px instead of 32, the toolbar 40 px instead of 42. Text and window are opaque, glass is partial, and there are 3 icon systems and 3 dialog layers. |
| Dev process | 350 patches (about 175 are harness), Actions on every push plus a nightly Chromium build, Dependabot, byte-budget and contract-purity build failures, a 390-warning lint cap, a Prettier ratchet, 175 committed built assets pinned by SHA, 94 native-harness files, native-slot owner receipts, 112 MB of docs, and six copies of the status banner. |
| Dev surface | Cut in commit `8f3d54225`, against the owner's decision to keep it. |

---

## 1. Locked owner decisions (do not re-ask)

1. **Vertical layout is the default,** an exact copy of Aside: a unified sidebar (Bookmarks, Chats, Tabs), a 42 px toolbar, and floating collapse with expand-on-hover. Horizontal is an option on the same state.
2. **Auto mode is the default.**
   - The agent reads, navigates, fills, submits, sends and deletes freely.
   - It pauses only for **money** and **credentials**. **Account-security** changes are handed to the user.
   - Users can "Always allow" per site.
   - Settings also offers **Ask first** and **Full auto**.
3. **Browser auth means both:**
   - (a) the agent uses the user's **real signed-in sessions** by default;
   - (b) **sign in with an AI subscription or account** through OAuth instead of API keys.
4. **The dev and cloud surface stays.** The git workspace, Vercel Sandbox and GitHub/Vercel/Sentry are rebuilt as a coherent part of the same agent loop.
5. **Carried over:**
   - Chromium is the only engine.
   - No backward compatibility; a fresh schema and fresh data.
   - Finish the Vector→Aux rename.
   - Vercel AI Gateway is the default transport, with real catalog IDs.
6. **Never part of development:** CI, GitHub Actions, Dependabot, push automation, signing, notarization, release packaging, qualification matrices, pixel-diff programs and paid benchmark sweeps.
7. **Clean navigation (October 6 owner follow-up).** Profile and Space selection lives at the bottom of the sidebar. Remove the duplicate top Profile card and the overnight/cost summaries from the sidebar and Home. Keep notices compact, bookmark hints centered, and native menus readable in both appearances. Tabs use one clean list with an optional last-used sort toggle, without Today/date headings. Recording stays in the tab menu and command palette, with no stationary sidebar button. Narrow sidebar layouts must keep controls usable. Finish the implementation before the detailed design pass.

---

## 2. Freedom principles (every phase follows them)

**Product**
1. **On by default.** If a feature is built, it is visible. A Labs toggle is the only way to hide something.
2. **Undo instead of confirm.** Replace confirmation dialogs with an action plus an undo toast. The only interruptions are money, credentials and account security.
3. **"Always allow" is absolute.** No hidden floor overrides a user's choice. Hard denies exist only for secret exfiltration and for the agent editing its own permissions, and they are silent and logged.
4. **No artificial ceilings.** Runs continue until the task is done, limited only by the user's own time and cost budgets, with a "Continue" button when a budget is reached.
5. **Nothing waits on the runtime.** Browser UI, tabs, history, bookmarks and autocomplete are native and instant. AI surfaces stream in.
6. **The user's world is available.** That means real sessions, extensions, files under granted roots, the terminal, local models, and private windows with ephemeral AI.

**Development**
1. **No remote automation:** no Actions, no Dependabot, no scheduled builds.
2. **No gate fails a build for style, bytes or process.** Builds fail only on compile errors. Budgets and size reports are advisory output.
3. **One command answers "is it fine?":** `npm run check`, which is typecheck, lint errors only and fast unit tests, in under 60 s. Then launch and look.
4. **Tests protect behaviour, not process.** Delete tests that pin removed gates or harness details.
5. **Docs say what is true now:** one ROADMAP, one STATUS, one ARCHITECTURE. History lives in git.

---

## 3. Restriction removal ledger

**Product**

| Restriction today | Where | After |
|---|---|---|
| 91 features refused unless qualified | `api/feature-stages.generated.ts:680`, `contracts/src/aux-features.ts:126,145`, `stage-host-bindings.mjs`, `docs/qualification.json` | All built features on; Settings › Labs for opt-outs (P0.3) |
| Approval for every click, submit, send or post; frozen floor; always→ask downgrade | `safety/confirmation.ts`, `decide.ts:253,322-339`, `approval.ts:18-24` | Auto: no prompts except money/credentials (Touch ID) and account-security handoff (P3) |
| Default grant is read-only; Read/Write/Navigate/Evaluate toggles | `agent/permissions.ts:19-22`, `settings/sections/Agents.tsx:29-49` | All effects granted under the mode; toggles deleted (P3.2) |
| Guardian model call on risky steps; denied if no judge is available | `safety/guardian.ts:39` | Off the hot path: async, log only (P3.2) |
| Agent only in signed-out isolated task tabs; per-request egress approvals | `safety/browser-egress*.ts`, `egress.ts`, patch 0122 | Real sessions by default; isolation becomes an optional "Private task" (P3.3) |
| Agent sees only @mentioned or run-created tabs | `agent/turn-mentions.ts` | Reads the active tab and the current Space; acts in its own tabs, the active tab or any tab you point at (P3.9) |
| 16 model calls and 60 steps per run; 90 s per call | `agent/model-client.ts:178`, `coordinator-verify.ts:33` | No call or step cap; user time/cost budgets with Continue; 60 s stream-idle timeout (P3.9) |
| Bash network off; workdir only in reviewed session roots | `agent/loop/bash.ts:173-199`, `services/command-escalation.ts:41` | Network on in Auto; any granted root; default Guard roots (P3.9) |
| Uploads only from session storage | `chromium-driver/src/playwright-page.ts:612` + S3 rules | Any granted root (P3.9) |
| Error after 8 code-mode sessions | `agent/code-mode.ts:20,107` | Evict the oldest idle session instead (P3.9) |
| Two approvals per MCP server (source, then each tool); Hook digest approval | `OutboundMcpSettings.tsx:340,718,938`, `services/hooks.ts:135` | Adding is the consent; toggles live in Settings (P3.7) |
| Night Shift and routines limited to standing grants; headless "ask" becomes deny | `decide.ts:101`, `approval.ts:186`, `main.ts:343-389` | Same mode as interactive; would-be prompts go to "Needs your input" (P3.2) |
| External scoped tokens can't navigate, open pages or start runs | `api/invoke.ts:41-56` | Full API under the same policy (P6) |
| Image generation off by default and refused when any spend cap is set | `agent/image-tools.ts` | On, counted against the user budget (P3.7) |
| Private windows have no AI | shell window kinds, `App.tsx:479` | Ephemeral AI (local or cloud, no memory or history writes) (P3.9) |
| Remote debugging permanently denied | patch 0016 | Settings › Developers toggle (off by default) for CDP and Playwright users (P3.9) |
| Confirm dialogs ("Open this URL in another Profile?" etc.) | `ProfileSwitcher.tsx:27,29`, `SpaceMemory.tsx:130`, `ModelConnections.tsx:120` | Act plus undo toast; confirm only irreversible deletes of user data (P3.7) |
| Memory and browsing memory are opt-in | `services/{browsing-memory,content-memory,memory-pipeline}.ts` | On by default, local, sensitive sites excluded, one-click pause and forget (P4.8) |
| Spend reservation assumes a 1M-token context; unpriced models throw; `$50` cap in product code | `store/spend-ledger.ts:9`, `projectedModelCostUsd` | Estimate-based reservation; any catalog model; caps are user budgets only (P4.5) |

**Development**

| Restriction today | After |
|---|---|
| `.github/workflows/runtime.yml` runs lint, typecheck, bench, budgets, unit, integration and Electron e2e on every push and PR | Deleted (P0.10) |
| `.github/workflows/chromium.yml` runs on push/PR plus a **nightly 07:17 cron build** | Deleted (P0.10) |
| `.github/dependabot.yml` opens PRs weekly | Deleted (P0.10) |
| `contractSchemaPurityPlugin` fails the shell build (`apps/shell/vite.config.ts:75`) | Removed from the build; optional lint script (P0.10) |
| `scripts/check-budgets.mjs` byte limits block batches over a few hundred bytes | Advisory `npm run size` report; time-based targets in P1 (P1.4) |
| Lint `--max-warnings=390`; Prettier ratchet (`format:check`) | Lint fails on errors only; one full format pass, then `npm run format` on demand (P0.9) |
| 175 built shell assets committed in `chromium/shell-assets/` and pinned by SHA-256; generated bindings with hash guards | Staged from `apps/shell/dist` at build time; generated files regenerated, no hash guards (P0.10) |
| `scripts/native-slot.mjs` owner receipts, supervisors, PTY ownership, 30-min bounded waits, acknowledgement leases | One `scripts/dev.mjs` holding a plain lock (P0.8) |
| Feature switching only via `scripts/qualify.mjs` writing `docs/qualification.json` | Deleted (P0.3) |
| Evidence manifests, `docs/EVIDENCE.md`, journey matrices, F21 signoff, contact sheets | Archived; replaced by "launch and look" (P0.1) |
| `$50` program ledger checked before every model run | Removed as a rule; harness may set `AUX_PROGRAM_SPEND_CAP_USD` (P0.8) |
| A PROVENANCE row for every literal value copied from the corpus | Only for whole files copied from upstream Chromium (license notices) (P0.1) |
| 94-file native journey harness (`tests/host/`); about 175 harness patches | Pruned to a launcher and a few optional smoke scripts; patches consolidated (P0.7, P0.10) |

---

## 4. Other pushback

| Issue | Why it matters | Fix |
|---|---|---|
| Two agent engines; the weaker one is default | Halves task success | P4.1 |
| Encryption on 40 tables with authenticated adapters; a git repo per Space for memory (`execFile("git")`) | Complexity and boot cost for little gain: the keys sit with the same user and FileVault already covers the disk | P1.6 |
| Unguarded measurement code in patches 0317 and 0352, plus cc/blink hooks (0265, 0324) | Runtime cost on hot paths | P0.7 |
| Dead code:<br>• `apps/desktop`<br>• `experiments/cef-shell`, `experiments/internal-cdp-probe`<br>• Electron migration<br>• `StandaloneDriver`, `AttachedChromeDriver`<br>• `AUX_IPC`, `AUX_*_CDP`<br>• `electron_web_request`<br>• `vector.sqlite` refusal<br>• migrations v1–v29 | Contradicts the no-compat decision | P0.5 |
| Shell duplicates:<br>• 3 icon systems, 3 dialog layers, 6 menus<br>• 4 chat lists, 2 virtual lists, 3 Quick Ask pieces<br>• dead components<br>• 7 undefined CSS variables, 89 raw colours | Drift and weight | P2 |
| Content blocking supports hosts lists and simple selectors only | Can't match uBO or Brave, and blocking is the cheapest page-load speedup | P5 |
| Dense one-line code (309 lines over 200 characters) | Hard to review or hand off | P0.9 |

**IP note:** literally adopt measured geometry, token values, CSS recipes and upstream Chromium BSD source. Re-implement behaviour from vendor bundles, prompts and skills rather than pasting minified or proprietary code.

---

## 5. Phase overview

| Phase | Outcome |
|---|---|
| **P0 Reset** | Product fully on; saved Profile boots; dev loop free of gates; dead code and 175 harness patches gone |
| **P1 Speed and size** | Fast build (ThinLTO+PGO, codecs) measured against stock; app ≤ stock + 90 MB; instant first frame; native command bar with prerender |
| **P2 Aside design** | Vertical default; exact tokens, glass, sidebar, toolbar, Home, Settings, chat; one component kit |
| **P3 Free agent** | Auto mode; real sessions; Touch ID for money and credentials only; no ceilings |
| **P4 AI** | One tool loop; frontier defaults; local and sign-in providers; streaming typed transcript; memory, skills, routines, subagents, WebMCP |
| **P5 Browsing power** | Unified ⌘K/T/L, Quick Ask, Lasso, capture, Clean Tabs, PiP, full adblock, extensions everywhere |
| **P6 Dev and cloud** | Projects workspace, Sandbox executor, official MCP connectors, terminal with the user's Claude Code and Codex |
| **P7 Onboarding** | Four skippable screens, importers for every major browser, first task in under 2 minutes |

Run P0 first. P1 and P2 can run in parallel: P1 is native, runtime and build; P2 is the shell. P3 and P4 follow, sharing the contracts. P5–P7 come after P4.

---

## 6. Working rules for the implementing agent

These replace the "frozen scope" paragraph in `AGENTS.md`.

- **Delivery:**
  - Commit to local `main` per coherent slice. No push.
  - Delete whatever you replace; no shims.
  - Disposable dev Profiles are fine. Ask before touching the owner's real Profile.
- **After runtime edits:** run `npx tsc -b` before tests (tests read `apps/runtime/dist`).
- **Per slice:**
  1. `npm run check`.
  2. For native changes: incremental dev build, then `node scripts/dev.mjs --temp-profile`, then click through the change.
- **Next-round validation:** remaining native walkthroughs, phase-end `pnpm perf` (P1.8), and the 20-task smoke (P4.14) are deferred by the owner; they do not block this implementation wrap-up. The existing AuxFast build and runtime packaging have now completed successfully.
- **Native:** one plain lock; never two builds at once. After P0.7, new native work is a new area patch in `chromium/patches/series`.
- **Models:** real providers with the owner's keys are fine.

---

## Phase 0: Reset

**P0.1 Docs**
- Save this plan as `docs/ROADMAP.md`.
- Archive the following to `docs/archive/2026-10-05-v2/`:
  - roadmap v2;
  - `BROWSER-RUNTIME-PLAN.md`, `EXECUTION-BOARD.md`, `ROADMAP-EXECUTION-GRAPH.md`;
  - `HANDOFF*.md`, `INSPECTION-BUILD-HANDOFF.md`, `EVIDENCE.md`, `qualification.json`;
  - the per-lane handoffs.
- Create `docs/STATUS.md` (short and current) and update `docs/architecture.md` to describe the native host only.
- Rewrite `AGENTS.md`:
  - keep the build/test gotcha;
  - replace the frozen scope, "preserve ownership/ack guards", PROVENANCE-per-value and evidence rules with §2 and §6;
  - retitle it "Aux workspace".

**P0.2 Repo weight**
- Move to `~/aux-archive/` and remove from the tree; git history keeps it all:
  - `docs/lane-requests/` (70 MB), `docs/source-audits/` (20 MB), old `docs/evidence/*`;
  - the 365 tracked `.native/` files (14 MB).
- Delete `release/ve-shell`, `release/mac-arm64` (Electron) and old `release/test-artifacts/*`.

**P0.3 Turn everything on**
- **Delete:**
  - `apps/runtime/src/api/feature-stages.generated.ts`;
  - stage derivation in `packages/contracts/src/{feature-requirements.ts,aux-features.ts}`;
  - the qualification bake in `chromium/stage-host-bindings.mjs`;
  - `scripts/qualify.mjs`.
- **Add `packages/contracts/src/features.ts`:** `{ id, default: "on" | "labs" }`, with user overrides in Settings › Labs.
- **Keep the capability check:** the browser publishes the method IDs it implements, and `useFeature()` hides entry points for unimplemented methods only.

**P0.4 Fix saved-Profile startup (P0 bug)**
1. Log boot phase timings.
2. Reproduce on a copy of a populated dev Profile.
3. Fix:
   - skip `migrateSensitiveTable` and `migrateSensitiveKv` when their `aux_meta` marker matches (no per-row decrypt or UPDATE);
   - remove VACUUM from boot;
   - run retention when idle;
   - call `api.setReady()` before `ManagedChromiumDriver.connect()` (`main.ts:539-574`).
4. Done when a populated Profile reaches ready in under 1 s.

**P0.5 Delete dead and legacy code**
- `apps/desktop/`, `experiments/cef-shell`, `experiments/internal-cdp-probe`. Move `experiments/chromium-fork/CONTINUATION.md` to `chromium/BUILDING.md` and repoint the two tests that read `experiments/chromium-fork/native/`.
- `AUX_IPC` (`main.ts:412`), `AUX_ELECTRON_CDP` (`config.ts:109`), and the `"electron"` host defaults (`invoke.ts:28`, `features/registry.ts:16`).
- `StandaloneDriver` (`main.ts:587`), `AttachedChromeDriver` (`main.ts:1445`), `AUX_HOST_CDP` / `AUX_INTERNAL_CDP`, `minimizeLegacyObservationArtifacts`.
- Electron migration: `services/electron-migration*.ts`, `contracts/src/electron-migration.ts`, `scripts/{apply,migrate,rehearse}-electron-*.mjs`, `MigrationImport.tsx`.
- `electron_web_request` (`packages/filter-lists/src/index.ts`, `contracts/src/bridge.ts:39`, `mock/bridge.ts`), the `vector.sqlite` refusal (`contracts/src/installation.ts:7,26-34`), and Electron comments plus the `chrome150` target in `vite.config.ts`.

**P0.6** Remove the remaining Vector references (`README.md`, `.env.example`, docs).

**P0.7 Patch consolidation**
1. Audit 0200–0380.
   - Drop fixture, witness, mailbox and measurement patches.
   - Fold the test hooks you still need into one `aux/test/` patch behind a GN arg `aux_test_hooks=false`.
   - Strip the unguarded code (0317, 0352) and the cc/blink measurement hooks (0265, 0324).
2. On a fresh worktree at the latest 154 point release (which also clears the pending security respin in `docs/CHROMIUM_RESPINS.md`), squash the rest into about 30 area patches: foundation/branding, shell WebUI, runtime host, CDP broker, method registry, tabs/organization, profiles, library, credentials, blocking, egress, agent presence, extensions, dictation, import, updater, window material.
3. Done when it builds and launches.

**P0.8 Dev launcher**
- Replace `scripts/native-slot.mjs` and its calls in `chromium/stage-*.mjs` (supervisors, PTY owners, acknowledgement leases) with `scripts/dev.mjs`. It takes a lock, builds incrementally, stages, and launches with `~/aux-dev-profile` or `--temp-profile`.
- Stop `stage-runtime.mjs` injecting `AUX_PROGRAM_SPEND_CAP_USD=50` into the shipped `main.js`.

**P0.9 Code health**
- One full Prettier pass in a single commit. Then `npm run format` is on demand; delete the `format:check` ratchet (`scripts/check-renderer-format.mjs`).
- Lint fails on errors only.
- Consolidate `exactOrigin` ×3, `digest` ×12 and `featureStagesFor` ×2 into `packages/contracts/src/util/`.

**P0.10 Remove remote automation and build gates**
- **Delete** `.github/workflows/runtime.yml`, `.github/workflows/chromium.yml` and `.github/dependabot.yml`. Leave no git hooks.
- **`npm run check`** = `tsc -b && tsc -p apps/shell/tsconfig.json && oxlint (errors only) && vitest run --project unit`, in under 60 s.
- **Build changes:**
  - remove `contractSchemaPurityPlugin` from `apps/shell/vite.config.ts`;
  - `scripts/check-budgets.mjs` becomes the advisory `npm run size`;
  - `scripts/check-bridge-coverage.mjs` becomes advisory.
- **Staging:** stop committing `chromium/shell-assets/` (175 files). `stage-shell.mjs` copies from `apps/shell/dist` at build time; keep only the CSP and bootstrap-order checks that prevent a broken app. Regenerate the generated bindings at build with no hash guards.
- **Tests:**
  - prune `tests/host/` (94 files) to the launcher plus optional smoke scripts;
  - delete tests for removed gates (`tests/unit/confirmation-tier.test.ts`, qualification, slot and ownership tests);
  - keep fast behaviour tests.

---

## Phase 1: Speed and size

**Targets.** Fast build, Apple Silicon, on mains power, median of 5 runs, against stock Chromium 154 built with the same flags:

| Metric | Target |
|---|---|
| Cold launch → first frame | ≤ stock + 5%, and ≤ 500 ms |
| Launch → interactive | ≤ 700 ms |
| Runtime ready | ≤ 600 ms, off the critical path |
| Warm new window | ≤ 120 ms |
| Tab switch p95 | ≤ 1 frame + 8 ms |
| Command-bar keystroke → paint p95 | ≤ 16 ms with 50k history |
| Memory, 10 idle tabs | shell ≤ 120 MB; runtime idle ≤ 90 MB; total overhead ≤ stock + 150 MB |
| `Aux.app` size | ≤ stock same-flag Chromium.app + 90 MB |

**P1.1 Build flavours** (`chromium/flags.*.gn`)
- **New `flags.fast.gn`** (the daily driver and perf truth; release reuses it later):
  - `is_official_build=true`, `is_component_build=false`;
  - `use_thin_lto=true`, `chrome_pgo_phase=2` — PGO uses `chrome/build/mac-arm.pgo.txt` and needs `"checkout_pgo_profiles": True` in the `.gclient` `custom_vars`, then `gclient runhooks`;
  - `symbol_level=1`, with a stripped app and a separate dSYM;
  - `proprietary_codecs=true`, `ffmpeg_branding="Chrome"`, `enable_widevine=true`;
  - `dcheck_always_on=false`, `target_cpu="arm64"`, `enable_aux_shell=true`.

  Patent licensing for H.264/AAC and the Widevine license are business tasks for later; the build supports both now.
- **`flags.dev.gn`:** add `dcheck_always_on=false`, `blink_symbol_level=0` and `v8_symbol_level=0`. Drop `use_lld=false` unless there's a recorded reason. Keep the component build.
- **`flags.release.gn`:** `import("flags.fast.gn")`.

**P1.2 Runtime size**
- A custom slim Node in `chromium/stage-runtime.mjs`: `--with-intl=small-icu --without-npm --without-corepack --enable-lto`, then `strip`. Target ≤ 90 MB, down from 145.
- Try a Node startup snapshot of the bundle and keep it only if it helps.
- Runtime bundle target is 8 MB, reported advisorily in `scripts/bundle-runtime.mjs`.
  - Minify playwright-core fully.
  - Load QuickJS wasm, parse5 and the provider SDKs on first use.
- Later spike, not now: a Chromium utility-process runtime sharing V8 and ICU (about −100 MB).

**P1.3 Startup critical path**
- **First frame without React.** In `apps/shell/index.html`, inline Aside's `newtab.html` first-frame technique: the token subset plus static skeleton (280 px sidebar, 42 px toolbar, Home brand, Search/Ask card; values in P2.6). React mounts into it. Delete the boot screen in `src/main.tsx`.
- **Shell code cache.** Enable `features::kWebUIBundledCodeCache` (in `content/public/common/content_features.h:363`) for `chrome://aux` by extending patch 0005.
- **Warm windows.** A spare shell renderer for new windows; the app stays alive with no windows open.
- **Native data first.** The shell never waits for the runtime: tabs, history, bookmarks and autocomplete are native (P1.5), and Chats and Tasks stream in.
- **Lazy runtime services.**
  - Add `apps/runtime/src/services/container.ts`, with lazy factories replacing the ~60 eager constructions in `main.ts`.
  - Defer filters, routines, memory maintenance and timers to idle + 5 s.
  - Connect the CDP driver lazily on the first agent action.

**P1.4 Shell performance**
- **Size report.** `npm run size` reports bytes. The real targets are first-frame and interactive time from P1.8. Measure the custom Terser and alias plugins in `vite.config.ts` and delete them if they gain under 3%.
- **Code splitting.**
  - Lazy-load each Settings section (`components/Settings.tsx:5-32` imports all of them today).
  - Keep xterm and markdown lazy.
  - Take zod off the startup path: validate host messages only in dev, or use generated lightweight validators.
- **Store.**
  - Normalise `pages` to `byId` with selectors by ID.
  - Remove whole-collection subscriptions: `Stage.tsx:40-41`, `Toolbar.tsx:22`, and `layout` in Sidebar/HorizontalTabs/Conversation/OnboardingFlow.
  - Split the effects in `App.tsx` into feature hooks.
- **Lists.** Use one `components/VirtualList.tsx` for tabs, chats and history, and delete `src/use-windowed-rows.ts`.
- **Fonts.** Preload only the Latin Geist subset.

**P1.5 Native browsing speed**
- **Native command bar data.**
  - Add host methods `omnibox.start`, `omnibox.stop` and `omnibox.open`, backed by Chromium's `AutocompleteController` (HistoryQuick, HistoryURL, Bookmark, Search, Shortcuts, OpenTab, zero-suggest).
  - The runtime merges AI, chat and routine results asynchronously.
  - This replaces the `history.list` and `command.ranking.*` keystroke calls in `components/CommandBar.tsx:446-669`.
- **Prerender like Chrome's omnibox.**
  - `PrerenderManager::StartPrerenderDirectUrlInput` for a high-confidence URL, and `StartPrerenderSearchResult` for the default search.
  - Preconnect while typing, and prerender on hover for Home cards and sidebar bookmarks.
- **Defaults stay on for every tab:** bfcache, Speculation Rules, HTTP/3 and the network predictor, agent tabs included. Revisit 0121's agent-tab preconnect disabling.
- **Paint lease** (0050): held only while an agent acts, then released after 2 s.
- **Memory saver:** discard after 30 min idle by default; pinned, audible and agent-active tabs are exempt.
- **Runtime per Profile:** measure the cost of one Node process per Profile, and consolidate to one runtime with Profile contexts if multiple Profiles are common.

**P1.6 Data layer: fresh schema v1**
- **One schema file.** Replace the v1→v30 chain in `store/db.ts` with one `store/schema.sql`. Move the tables created in constructors into it: `safety/decide.ts:58`, `approval.ts:31`, `agent/durable.ts`, `loop/transcript.ts`, `store/spend-ledger.ts` and others. Delete the migration steps and `VACUUM INTO`.
- **Pragmas.** WAL with `synchronous=NORMAL`; `secure_delete` only on the secrets and memory tables.
- **Encryption.** AES-GCM at write time only for memory content, transcripts and token metadata. Secrets stay in the Keychain. Delete the 40-table adapter inventory and all boot scans (`store/sqlite-protection.ts`, `protected-startup.ts`).
- **Memory storage.** Replace the per-Space git repos (`services/memory-pipeline.ts:152`) with `memory_files` and `memory_history` tables, which can be reverted.

**P1.7 AI caching**
- **Stable prompt prefix.** Keep the system prompt and tools identical across turns; send tool changes as system messages.
- **Provider caching.** Anthropic `cache_control` through the Gateway via `providerOptions` too (today `agent/prompt-cache.ts` covers direct calls only), OpenAI `promptCacheKey`, and Gemini's implicit caching. Log cached tokens.
- **Result cache.** A content-hash SQLite LRU (200 MB) for summaries, tab and tidy names, translations and embeddings.
- **Speculative snapshot** after every action.

**P1.8 Measurement**
- Build `~/aux-chromium-stock-measurement` once with `flags.fast.gn`, without the Aux shell.
- Merge `tests/benchmarks/native-browser.mjs` and `tests/host/native-stock-memory.mjs` into `pnpm perf`:
  - Aux vs stock: cold start, first frame, interactive, tab switch, command bar, memory;
  - 5 runs, median;
  - one row in `docs/BENCHMARKS.md`.
- Run it only at phase ends.

---

## Phase 2: Aside design parity, Aux branding

**Sources of truth, in order** (all paths under `~/AI Blueprints/06/`):
1. `assets/upstream-src/chrome/browser/ui/layout_constants.cc`, plus `vertical_tab_strip_*`, `tab_strip_layout*` and `tab_style_views` (geometry and behaviour).
2. `assets/06-chrome-tokens.css`, `assets/runtime/colors-{dark,light}.css` and `assets/live-1.0.928/color-aside-tokens.txt` (chrome colours).
3. `assets/extension-design-tokens.txt` and `assets/extension/assets_globals-*.css` (web tokens).
4. `assets/liquid-glass.css` and `assets/tab-design.css`.
5. `assets/live-1.0.928/agent-manager-1.26.929/` (component behaviour).
6. `assets/runtime/ax-tree.txt` (measured geometry).
7. `06_DESIGN.md` and `06_COPYABLE-SURFACES.md` (the index).

**Keep:** the Aux name, mark, icon, copy and sounds. Everything else matches Aside; compare against `/Applications/Aside.app`.

**P2.1 Tokens** (rewrite `apps/shell/src/tokens.css`)
- **Text and surfaces** — Aside's alpha ramp replaces the opaque ink ramp:
  - text: primary 85% white (dark) / 95% black (light); muted 55%; sidebar inactive 65%; sidebar muted 45%;
  - lines: border 10%, border-surface 15% in dark;
  - surfaces: 8/6/4% in dark; white, 85% and 55% in light;
  - states: hover 10%, selected 12.5%.
- **Chrome and status colours:**
  - window `#17171780` / `#ffffff80`; floating sidebar `#24272b` / `#f3f4f6`;
  - location bar `#171717`; search field `#3c3c3c`; hover card `#18181b`; tab switcher `#171717b3`;
  - success `#16a34a`; warning `#facc15` (replaces `#ff8a30`); invalid `#fb7171`; badge `#38b6f6`;
  - brand sky-400 `#38bdf8` in dark, sky-500 in light. This replaces Aux's achromatic+link palette; an Aux accent later is one token, `--brand`.
- **Unchanged:** the ×1.4 squircle and the 0.5 px hairline.
- **Blur and motion:**
  - blur 4/8/12/16/24/64;
  - motion 150 ms `cubic-bezier(.4,0,.2,1)`; overlays 100 ms with zoom 95% and a 2 px slide; click depth 97%; shimmer.
- **Clean-up:**
  - Fix the undefined variables: `--border`, `--panel`, `--on-accent`, `--line-1`, `--line-soft`, `--surface`, `--z-modal`.
  - Tokenise the 89 raw colours.
  - Add an advisory `scripts/check-raw-colors.mjs`.

**P2.2 Window and material**
- Translucent window background over the native glass underlay (patches 0036 and 0070).
- A "Window vibrancy" toggle; Reduce Transparency makes the window opaque; web content stays opaque.
- Fix the light-grey dark-mode tab strip (`docs/evidence/home-parity-2026-10-05/home.png`): frame `#1f2020` inactive, `#3c3c3c` active.

**P2.3 Vertical layout as default** (`Sidebar.tsx`, `Sidebar.css`)
- Change `tabLayout ?? "horizontal"` to `"vertical"` in `App.tsx:276`, `Toolbar.tsx:20` and `store/ui-slice.ts`.
- **Sidebar:**
  - 280 px, with a 5 px resize handle, snap 15 and keyboard step 50 (`vertical_tab_strip_region_view.cc`).
  - Collapsed state, plus floating expand-on-hover with an elevation shadow, held open while a menu or focus is inside (`vertical_tab_strip_expand_on_hover_lock.cc`).
- **Top row:** traffic lights at (15,13); collapse button 32×32 at x=242, y=5.
- **Sections:**
  1. Pinned (a grid when populated).
  2. Bookmarks (collapsible, can be disabled).
  3. Chats with Aux (New chat, 32 px search, sessions).
  4. Tabs (a New tab row, then tabs).
- **Rows and headers:**
  - headers 264×28 with an 8 px inset;
  - rows 264×32 (`--sidebar-row-h: 32px`), radius 8, favicon 16;
  - hairline separators; a thin auto-hiding scrollbar.
- **Footer** 42 px: a Space/Profile button and a 28×28 Search.
- **Tab rows and preferences:**
  - rows show audio and agent indicators and close on hover;
  - groups use the 7-colour trios;
  - insertion position and the bookmarks section are preferences.

**P2.4 Toolbar (vertical mode)** (`Toolbar.tsx`, `NavigationButtons.tsx`)
- 42 px tall (`--toolbar-h` 40 → 42). Back, Forward and Reload are 32×32 at y=5.
- The location group is 34 px tall: a 24 px field, a 24 px search icon, radius 12.
- On the right: Passwords, Extensions and Ask Aux, each 34×34.
- A site chip for blocking and permissions. Auto-hide is optional.

**P2.5 Horizontal mode** (`HorizontalTabs.tsx`, `styles/workspace.css`)
- Follow `tab-design.css` exactly: tabs 34 px tall, radius `12px 12px 0 0`, max 233, favicon 16, 12 px scoops; strip 41; group chips at radius 6, 20 px tall, 12/500; a shrink-to-fit preference.
- Unify the CSS split across `workspace.css`, `overlays.css:44-49` and `sidebar.css:105`.

**P2.6 Home / new tab** (`StartPage.tsx`, `HomeAsk.tsx`, `CommandBar.tsx`)
- **Layout and entry card,** from the live `newtab.html`:
  - main max-width 72rem, padding `10rem 2rem 5rem`, gap 3rem;
  - Aux mark 4rem;
  - omnibox max 50rem, padding `0 1rem`; card margin `0 1rem`, radius 1.4rem, padding .625rem;
  - shadow `0 0 0 .5px var(--border-surface), 0 4px 6px -1px tint, 0 2px 4px -2px tint`, growing to `0 20px 25px -5px` on focus over 150 ms;
  - Search/Ask segmented control 2rem tall, radius .7rem, with a "Tab to switch" hint.
- **Below the entry:**
  - "Needs your input" cards: 10rem tall (`h-40`), `rounded-2xl`, a 370 px artifact pane, grid `minmax(240px,1fr)` at most 827 px wide;
  - Chats and Routines tabs with counts.
- Split `CommandBar.tsx` (1,575 lines) into `omnibox/` modules.

**P2.7 Glass primitive** (new `apps/shell/src/styles/glass.css`)
- Port Aside's full liquid-glass stack, bottom to top:
  1. backdrop blur 4 or 3 px;
  2. fill variants, including the light theme's `multiply` gradient;
  3. a 94% white backing;
  4. the tint stack;
  5. an xor-masked stroke;
  6. inner glow and shade;
  7. a 0.12 s state layer.

  Modifiers `._alpha`, `._inset`, `._noTopGlow`, and `--rim-end-opacity`.
- Use it on menus, popovers, tooltips, the hover card, the palette, toasts, the agent pill and the floating sidebar.
- Delete `styles/surfaces.css:403-445` and the scattered blur values.

**P2.8 Component kit** (`apps/shell/src/ui/`)
- **Components:**
  - Button (24/28/32/36), IconButton, Badge, Kbd (18 px, 11 px text);
  - Menu (`rounded-xl p-1.5`, items ≥ 32 px), replacing 6 copies;
  - Select, Popover, Tooltip with kbd;
  - Dialog (`black/15` overlay with `backdrop-blur-xs`), replacing `ui/dialog.tsx`, `ui/native-dialog.ts` and `ui/confirm.tsx`;
  - Toast (top centre, 3 s, `rounded-3xl`, undo action);
  - Switch, Segmented, Tabs, SearchField.
- **One icon system:** Central Icons, which Aside also uses. Delete `components/icons.tsx` and `components/icon-elements/`.
- **Merge:** the 4 chat lists into one `ChatList`; `SearchEngineSetting` with `SearchEnginesSetting`; the 3 Quick Ask pieces.
- **Delete** `features/commands/ExtensionShortcuts.tsx`, `FileTree.tsx` and `SaveConversationTask.tsx`.

**P2.9 Settings shell** (`apps/shell/src/settings/*`, `components/Settings.tsx`)
- **Nav:** 208 px grouped (Personal / Agent / Features / Archived), with filled icons when active.
- **Content:** a 672 px column on a 22.4 px squircle card, padding 32/64/160, with a section rail at ≥ 720 px.
- **Primitives:**
  - h1 24/450; h2 14/550 at 80%;
  - group card outdented −14 px, with 1 px gaps in dark mode;
  - rows ≥ 52 px; title 14/500, description 12/500; control slot ≤ 160 px.
- **Generated search:** NFD normalisation, all tokens must match; scores exact 120 / word 105 / prefix 90 / word-prefix 80 / substring 65; top 12; triple flash.
- **Sections,** each a lazy chunk:
  - General, Appearance, **Permissions**, Agents, Models, Memory, Routines;
  - Plugins (MCP, Skills), Projects, Passwords, Privacy & Security, Extensions;
  - Quick Ask, Selection actions, Developers, Usage, Archived chats, Labs.

**P2.10 Side panel and chat** (`AgentRail.tsx`, `Conversation.tsx`, `mentions/`, `composer/`)
- **Rail:** 300–620 px, default 400. Fix the 360 px reset at `AgentRail.tsx:71`.
- **Composer:** a model picker and thinking level, attach, @mention, queue vs steer, and the P3 suspension body.
- **Transcript:** a turn fold ("Working for 12s" → "Worked for…"), grouped tool summaries, a 596 px column with a fade mask, and P4.6 items.
- Split `Conversation.tsx` (83 KB).

**P2.11 Tab tools**
- **Ctrl-Tab MRU switcher.**
- **⌘⇧A tab search:** Open tabs / Recently closed / Bookmarks / History / Extensions.
- **Hover card:** a live preview (tab capture, 120 ms fade) plus memory use.

**P2.12 Accessibility.** Reduced motion, focus rings and VoiceOver labels. Body text contrast ≥ 4.5:1, checked by `scripts/check-glass-contrast.mjs`, advisory.

**P2.13 Look check.** 12 side-by-side screenshots against Aside: light/dark × vertical/horizontal × Home/page/Settings/chat. Fix what differs. No diff tooling.

---

## Phase 3: Free agent (Auto by default)

**P3.1 Policy** (new `packages/contracts/src/agent-policy.ts`)
- `agentMode: "auto" | "ask" | "full"`, default `"auto"`.
- Per-site, per-category overrides: Allow / Ask / Block. "Always allow" from any prompt writes here and is honoured absolutely.

| Category | Auto (default) | Ask first | Full auto |
|---|---|---|---|
| read, navigate, input, click, scroll, dialog, download, tabs | allow | allow | allow |
| submit, send, post, delete, install, upload, bash, MCP and external tools | allow | ask (can be always-allowed) | allow |
| money (purchase, payment, subscription) | **Touch ID**; per-site always-allow, with an optional amount limit | ask | allow (opt-in warning) |
| credentials (vault password, passkey or OTP fill) | **Touch ID on first use per site**, then silent | ask | allow |
| account security (password change, 2FA setup, recovery), CAPTCHA | hand off to user | hand off | hand off |

**Silent, logged hard denies in every mode:**
- vault or memory secrets sent to a new destination (secret-hash overlap);
- the agent changing Aux permission settings;
- `evaluate` from a model or MCP caller (`decide.ts:276`).

**P3.2 Engine** (`apps/runtime/src/safety/*`, `agent/permissions.ts`)
- **Delete:**
  - `CONFIRMATION_TIERS` and its test;
  - per-click step-hash approvals (`approval.ts:18-24`);
  - the always→ask downgrades (`decide.ts:253`, `:322-339`);
  - effect-grant limits (`effectGrantsForRun`) and the Read/Write/Navigate/Evaluate UI;
  - the unused `acceptForSession`.
- **Add** `policyFor(mode, category, site, amount?)`, used by `decide()` and `ApprovalStore.authorize`.
- **Guardian** (`safety/guardian.ts`) runs only asynchronously and only logs, when untrusted-content overlap is flagged. Delete it if unused.
- **Headless runs** (routines, Night Shift, external agents) use the same policy. Would-be prompts become "Needs your input" items plus a notification, never silent denials (`main.ts:343-389`, `decide.ts:101`).

**P3.3 Real sessions**
- The agent works in the user's Profile.
  - It owns an "Agent tabs" group whose tabs are created in the background.
  - It can borrow the active tab or any tab the user points at.
  - Use Aside's owned/borrowed tab model (06-AI) in `chrome/browser/ui/aux/tab_catalog.cc` and `agent/turn-tabs.ts`.
- Isolated signed-out tabs (patch 0122) become an optional "Private task" toggle on a chat.
- **Egress:**
  - delete the default per-request digest approvals (`safety/browser-egress*.ts`, `egress.ts`);
  - keep only the secret-overlap deny;
  - `webfetch` may use the session in Auto mode.
- The agent can use the Profile's extensions, such as password-manager autofill.

**P3.4 Touch ID**
- A host method `auth.confirm(reason)` shows the LocalAuthentication sheet, reusing the device-authentication code from patch 0120.
- Each money or credential stop is a single tap.

**P3.5 Prompt UI**
- **One suspension card** in the composer, plus an in-page pill shaped like Aside's `EmbeddedPermissionPrompt`. Example: "Aux wants to pay $42.18 at amazon.com" with [Confirm with Touch ID] [Always allow on amazon.com] [Not now] [Take over].
- ⌘↵ confirms and Esc dismisses. A notification fires when the window is unfocused.
- Replaces `components/ActionConfirmation.tsx`.

**P3.6 Settings › Permissions**
- The mode (Auto by default), a per-category table, and per-site grants with revoke.
- An activity log from `safety_decisions`, with undo for browser-local effects.
- File roots: **Guard** by default — read your home folder except sensitive locations (`~/.ssh`, Keychains, browser Profile directories, password stores); write to Documents, Downloads, Desktop and Projects. Read-only and Full are the alternatives.
- MCP tool toggles.

**P3.7 Friction removal**
- **Consent once:**
  - Adding an MCP server is the consent; drop the per-tool grants (`OutboundMcpSettings.tsx:340,718,938`) and use toggles instead.
  - Hooks need consent at creation only.
- **Replace confirm dialogs with an undo toast:** `components/ProfileSwitcher.tsx:27,29`, `settings/sections/SpaceMemory.tsx:130` and `settings/sections/ModelConnections.tsx:120`.
- **Onboarding:** replace the permissions explainer with a mode card in the AI step.
- **Background work and image generation:**
  - routines and Night Shift use the configured mode;
  - image generation is on, within the user's budget.
- **Website permission prompts:** keep Chromium's semantics, in Aside's in-page style with a quiet chip. Agent tabs decline site permission requests the user hasn't already granted.

**P3.8 Keep, invisibly**
- The durable write ledger (no duplicate effects).
- Stop and Take over.
- The untrusted-content envelope with injection-syntax neutralisation.
- The activity log and undo.

**P3.9 No artificial ceilings**
- **Run length:** delete `DEFAULT_MAX_MODEL_CALLS=16` (`agent/model-client.ts:178`) and `DEFAULT_MAX_STEPS=60` (`coordinator-verify.ts:33`). Runs end when done, or when the user's time or cost budget is reached; a reached budget shows Continue. Replace the 90 s total per-call timeout with a 60 s stream-idle timeout.
- **Code mode:** past 8 sessions, evict the oldest idle one instead of throwing (`agent/code-mode.ts:107`).
- **Bash** (`agent/loop/bash.ts:173-199`, `services/command-escalation.ts`): network on in Auto; workdir anywhere in the granted roots; no exact-match escalation in Auto.
- **Uploads** come from any granted root (`playwright-page.ts:612`).
- **Tab reach:** the agent reads the active tab and the tabs in the current Space without @mentions (`agent/turn-mentions.ts`). @mentions still narrow or extend the scope.
- **Private windows** get ephemeral AI, local or cloud, with no memory or history writes.
- **Settings › Developers:**
  - a toggle for the remote-debugging port, for Playwright/Puppeteer users (patch 0016 keeps it off by default);
  - DevTools are always available;
  - unpacked extensions are allowed.

---

## Phase 4: AI excellence

**P4.1 One engine**
- `agent-loop` is the only engine (`services/runs.ts:1067`).
- **Delete:**
  - `agent/{planner.ts,coordinator-loop.ts,coordinator-turn.ts,coordinator-verify.ts,member-agent.ts}` and `scheduler/set-runner.ts`;
  - `schemaNeedsJsonFallback` and the Cerebras/Qwen JSON workarounds (`gateway-client.ts:107-160`);
  - `AUX_RUN_ENGINE`.

**P4.2 System prompt**
- Write a new `apps/runtime/src/agent/prompt/system.md` from these rules:
  - from Aside:
    - read snapshots first; each snapshot invalidates older refs;
    - pack an action and its snapshot into one call;
    - change strategy after 2–3 failures;
    - update the user about every 30 s;
    - attach visual proof;
  - from 03: accessibility first; never repeat a no-op; verify focus;
  - from 05: thinking style, citations, writing output, ask-user.
- Re-implement; don't paste.

**P4.3 One tool manifest** for the built-in agent, MCP, CLI and SDK:
- **Browsing:**
  - `repl` (QuickJS with yield/wait and the handles `tabs`, `snapshot`, `page`, `fetch`, `fs`);
  - batched `snapshot` and `act`;
  - tabs and windows.
- **Search and recall:** `webfetch`, `websearch` (Gateway), semantic `history_search`, bookmarks, `memory_search`.
- **Files and shell:** `read_file`, `write_file`, `edit_file`, and `bash` (seatbelt; local or Sandbox).
- **Coordination:** `subagent`, `subagent_wait`, `ask_user_question`, `write_todos`, `notification`, `routine_update`.
- **Page and external tools:** WebMCP page tools, MCP tools, extension actions.
- **Creation:** `image_generate`, and artifacts (docx/xlsx/pptx/chart/html).

Each schema carries a `byline` for the tool rail.

**P4.4 Context**
- Attach the active tab's title, URL and selection automatically, as untrusted context with a removable pill.
- @mentions for tabs, groups, Spaces, skills and connectors.
- Keep compaction and the 40 KB tool-output budget (`agent/loop/context.ts`).
- Auto-recall memory with a 500 ms deadline, about 2k tokens.
- Keep the tools array stable for caching.

**P4.5 Models and providers** (`packages/contracts/src/{model-registry.ts,model-connections.ts}`, `agent/direct-providers.ts`, `services/settings.ts`)
- **Catalog-driven.** Fetch the Gateway's `/v1/models` at startup (cached 24 h) plus each provider's list. Validate IDs and delete the stale `google/imagen-4.0-*`.
- **Defaults** (Gateway, verified live on 2026-10-05):

  | Route | Model | Fallback |
  |---|---|---|
  | fast | `anthropic/claude-haiku-4.5` | `google/gemini-3.8-flash` |
  | standard and visual | `anthropic/claude-sonnet-5.5` | `openai/gpt-6.1-sol` |
  | deep | `anthropic/claude-opus-5.5` | `openai/gpt-6.1-sol` |
  | Max (selectable) | `anthropic/claude-fable-5.1` | — |
  | utility (names, waiting phrases, intent) | a local model when available, else `openai/gpt-6-luna-fast` | — |
  | image | `openai/gpt-image-2` | — |

  Delete `DEFAULT_PLANNER_MODEL_ID` and the hard-coded `openai/gpt-5.6-luna-fast` (`settings.ts:496`, `model-client.ts:174`).
- **Model choice in the UI.** A composer picker with a thinking level (Auto/Low/Medium/High). Settings › Models gets categories with "Automatic".
- **Local:**
  - auto-detect Ollama (`:11434/api/tags`), LM Studio (`:1234/v1/models`), and llama.cpp or MLX servers (`:8080`, `:8000/v1/models`);
  - Apple on-device Foundation Models (macOS 26+, nothing to download) through a native host method, for the utility route;
  - a "Local only" mode with a badge.
- **Sign-in framework** (new `apps/runtime/src/services/provider-auth/`):
  - PKCE and device-code flows, in an Aux tab or the system browser;
  - Keychain tokens, with refresh.
  - **Connectors:**
    - **Sign in with Vercel** → AI Gateway (the default, zero-key path);
    - **OpenRouter** (official PKCE);
    - **GitHub Copilot** (device flow);
    - **ChatGPT and Claude subscriptions:** confirm each provider's current terms allow third-party clients before enabling. Otherwise use the compliant path: the user's own Codex or Claude Code inside Aux's terminal, connected to Aux through MCP (P6).
- **Budgets.**
  - User budgets per day or month on the Usage page.
  - Estimate-based reservations.
  - Remove `PROGRAM_SPEND_LIMIT_USD` (`store/spend-ledger.ts:9`) and `projectedModelCostUsd`'s throw for unpriced models.

**P4.6 Typed streaming transcript** (`packages/contracts/src/transcript.ts`, `apps/shell/src/transcript/*`)
- **Streaming:** tokens stream in, replacing the 280-character `message` in `agent/answer-delta.ts`.
- **Item types:**
  - markdown;
  - thinking (280 ms → 370 ms, 180 px clamp);
  - tool rail (16 px marker, 6 px dot, 2 px line, 22 px gap, present/past labels);
  - citation pills with a 280 px hovercard;
  - artifacts in the isolated `aux-result` origin;
  - text proposal with Insert and undo;
  - question (A/B/C);
  - error (category plus Try again / Edit / New chat);
  - image and todo.
- **Waiting phrases** come from the utility model.

**P4.7 Steering.** Queue vs steer, interrupt (`<interrupted_request>`), and edit, branch or retry a message.

**P4.8 Memory** (Aside model; on by default, local)
- **Storage and capture:**
  - memory files per Space (P1.6);
  - extraction after chats, and nightly "dreaming" consolidation that cites evidence;
  - History with Revert;
  - a sensitivity gate that excludes banking, health and similar sites.
- **Controls:** one-click pause and forget, plus Settings › Memory (Overview, History, Configure).
- **Semantic history search** through local or Gateway embeddings.

**P4.9 Skills**
- SKILL.md format compatible with Claude Code, and import from `~/.claude/skills`.
- `autoInject` by keyword or URL: a pointer message, not the body.
- **Builtin skills written by Aux:** pdf, docx, xlsx, pptx, Google Docs/Sheets/Gmail, Notion, Slack, password managers, site-specific.
- Keep the tested replay skills (`agent/skills.ts`).

**P4.10 Routines.** Split `services/routines.ts` (1,706 lines).
- RRULE schedules, event triggers and heartbeat mode.
- Results go to "Needs your input" and notifications; add a suggestion scan.

**P4.11 Subagents.** Up to 8, with profiles (default, explorer, read-only, `fork_self` for cache sharing). Interrupts cascade to children.

**P4.12 WebMCP.** Turn on the Blink `WebMCP` runtime feature for non-private Profiles and expose page tools, including declarative form tools.

**P4.13 Notifications.** Three categories, an Aux-authored completion sound at 0.35 volume, and a Dock badge. No notification while the user is viewing that chat.

**P4.14 Quality bar (deferred next-round validation).** A 20-task smoke subset of `tests/benchmarks/tasks/manifest.json`, run manually at phase ends on the default routes, targeting pass@1 ≥ 90%. Fix the scorer first: a pass requires `status === "completed"` (`tests/benchmarks/tasks/run.mjs`).

---

## Phase 5: Browsing power (best of 01, 05 and 07)

**Command bar (⌘K / ⌘T / ⌘L unified)**
- Native autocomplete (P1.5).
- Routing: Automatic / Prefer search / Prefer chat, decided by the utility or local model.
- Switch to an already-open tab instead of duplicating it, with popular-domain ranking.
- Actions and settings results; ⌘↵ asks Aux.

**Quick windows and capture**
- **Quick Ask / mini popup:** a global hotkey, plus a Little-Arc window for links opened from other apps (`LittleWindow.tsx`, `QuickAsk.tsx`).
- **Selection actions:** templates with `{text}`, `{code}` and `{image}`, and a double-tap hotkey.
- **Capture:** screen, full page or selection, attached to the chat.

**Tidying and media**
- **Clean Tabs:** auto-archive after 12 h, 3 d or 7 d, with undo. Also Tidy, and smart download renaming with undo.
- **PiP:** auto-PiP on tab switch, and document PiP.
- **Split view:** vertical and horizontal panes, convert and flip.
- **Link routing** rules, and Profile/Space linking.

**Content and extensions**
- **Content blocking:** maintained uBlock Origin semantics with browser-owned network admission and document-scoped cosmetic/scriptlet execution. Default EasyList, EasyPrivacy and uBO lists, with a per-site toggle in the site chip. The maintained engine replaces the retired hosts-only and incomplete Rust implementations. Full syntax and actual network, body, cosmetic, scriptlet, popup and canonical-host acceptance targets remain; the remaining native walkthroughs are deferred to next-round validation.
- **Extensions:**
  - Web Store install on by default (0025);
  - pinning and an extensions menu like Aside's;
  - side-panel extensions;
  - native messaging for 1Password and Bitwarden.
- **Boosts:** Zap and user CSS exist; add agent-generated Boosts.

**Personalisation**
- **Spaces theming:** one seed colour plus a `color-mix` ramp.
- **Rebindable shortcuts** (0044), with a recorder and a cheat sheet.

---

## Phase 6: Dev and cloud, coherent; external agents

**Rebuild the capabilities, not the old code.** `git show 8f3d54225^` is reference only; it holds `cloud.*`, `cloud-environments.ts`, `development.*` and the REST clients.

**Projects and the dev workspace**
- **Projects** are workspace folders with file roots, a skills folder and instructions. Extend `services/workspace-folders.ts` and rename Settings › Workspaces to Projects.
- **The dev workspace** (Preview / Changes / Files / Console) is a Project view built on P4.3's file, bash and git tools, with a live Preview of local dev servers.

**Cloud and connectors**
- **Vercel Sandbox** is one executor behind `bash` and `repl` ("Run in cloud", through `@vercel/sandbox`), not a separate API.
- **GitHub, Vercel and Sentry** are their official remote MCP servers, using OAuth and pre-listed in Settings › Plugins. Fold `services/github-connection.ts` into this.

**Terminal and external agents**
- **Terminal** (xterm, lazy) runs the user's own Claude Code or Codex with their own login.
- **Settings › Developers:**
  - install the `aux` CLI and add `aux open <url> [--profile]`;
  - one-click "Connect Aux to Claude Code / Codex / Cursor", which writes the Aux MCP server into their configs and installs an Aux skill pointer.
- **External agent sessions** (via `aux-mcp`) appear in Tasks with the same presence, Stop and Take over. Their tokens get the full API under P3 policy (`api/invoke.ts:41-56`).

---

## Phase 7: Onboarding and import (4 screens, all skippable)

1. **Welcome.**
2. **Import.** Auto-detect Chrome, Arc, Safari, Firefox, Edge, Brave, Dia, Comet and Atlas, with progress per browser. Covers tabs, bookmarks, history, passwords and extensions, through the 0033 importer plus Chromium-profile importers.
3. **AI.** Sign in with Vercel or OpenRouter, or pick a detected local model. Auto mode is preselected.
4. **Look.** Vertical is preselected, with a live preview of both layouts.

Then a first-chat postcard with 3 starter prompts, and a default-browser ask with a back-off cooldown. Rewrite `apps/shell/src/onboarding/OnboardingFlow.tsx`, which has 7 steps today.

---

## Later (not now)

- End-to-end encrypted sync (Dia-style escrow; `docs/design/cross-device-sync.md`).
- Mobile and Windows.
- Signing, notarization, Sparkle, DMG, the Widevine license, and public performance claims.
- The utility-process runtime spike.

---

## Critical files

| Area | Files |
|---|---|
| Gates and dev process | `.github/workflows/{runtime,chromium}.yml`, `.github/dependabot.yml`, `packages/contracts/src/{aux-features,feature-requirements}.ts`, `apps/runtime/src/api/feature-stages.generated.ts`, `chromium/stage-{shell,runtime,host-bindings}.mjs`, `scripts/{qualify,native-slot,check-budgets,check-bridge-coverage,check-renderer-format,contract-schema-purity}.mjs`, `apps/shell/vite.config.ts`, `package.json`, `AGENTS.md` |
| Boot and data | `apps/runtime/src/main.ts`, `store/{db.ts,sqlite-protection.ts,protected-startup.ts,repo.ts}`, `services/memory-pipeline.ts`, `lifecycle.ts` |
| Safety and limits | `apps/runtime/src/safety/{confirmation,decide,approval,guardian,origin-policy,browser-egress,egress}.ts`, `agent/{permissions,model-client,code-mode,turn-mentions}.ts`, `agent/loop/bash.ts`, `apps/shell/src/components/ActionConfirmation.tsx`, `settings/sections/Agents.tsx`, `features/trust/*` |
| Agent and models | `services/runs.ts`, `agent/{loop/*,planner.ts,coordinator-*.ts,gateway-client.ts,direct-providers.ts,prompt-cache.ts}`, `packages/contracts/src/{model-registry,model-connections,api}.ts` |
| Shell | `apps/shell/{index.html,vite.config.ts}`, `src/{tokens.css,App.tsx,main.tsx}`, `components/{Sidebar,Toolbar,HorizontalTabs,StartPage,CommandBar,AgentRail,Conversation,Settings}.tsx`, `styles/*`, `store/*`, `settings/*`, `onboarding/*` |
| Native and build | `chromium/flags.{dev,release}.gn` (+ `flags.fast.gn`), `chromium/patches/series`, `scripts/bundle-runtime.mjs`, `tests/benchmarks/native-browser.mjs`, `tests/host/native-stock-memory.mjs` |
| Reference | `~/AI Blueprints/06/` (P2 list), `~/AI Blueprints/FEATURE-PULL-LIST.md`, `~/AI Blueprints/0{1,3,5,7}_COPYABLE-SURFACES.md` |

---

## Deferred next-round validation (proportionate, local only)

The owner has deferred remaining native walkthroughs, phase performance measurements, manual 20-task/provider acceptance, and detailed design comparisons to the next roadmap round so implementation can wrap up now. Source checks have passed, and the current AuxFast native build and runtime packaging have completed successfully. The targets below are preserved for later validation, not claimed as passed or as empirical phase completion. The configured Gateway environment credential was rejected; live provider acceptance remains unverified. Owner OAuth registrations remain explicitly deferred.

- Do not repeat passing source checks for this wrap-up. Remaining native walkthroughs and provider-dependent acceptance are next-round work.
- **P0 validation target:**
  - a populated dev Profile boots with runtime ready in under 1 s;
  - every built feature is visible;
  - no `.github` automation remains;
  - `npm run check` passes in under 60 s.
- **P1 validation target:** `pnpm perf` meets the P1 targets against stock on the fast build. Record one row in `docs/BENCHMARKS.md`.
- **P2 validation target:** the 12 Aside side-by-sides show no geometry or colour differences beyond branding.
- **P3 validation target:**
  - in Auto, a fixture flow (search → open → fill → submit → send) runs with **zero prompts**;
  - a checkout asks for exactly **one Touch ID**;
  - a credential fill asks once per site and is silent afterwards;
  - a secret-exfiltration fixture is silently blocked and logged;
  - a 100-call run completes without hitting any cap.
- **P4 validation target:**
  - the 20-task smoke reaches pass@1 ≥ 90%;
  - more than 50% of tokens are cached on multi-turn runs;
  - an Ollama model works with Wi-Fi off.
- **P5–P7 validation target:** a manual walkthrough of each feature works, and a fresh Profile reaches a completed first agent task within 2 minutes.

## After approval

1. Save this plan as `docs/ROADMAP.md` (P0.1).
2. Update the auto-memory `aux-product-direction.md` with the locked decisions: vertical default, Auto mode semantics, real sessions, subscription sign-in with the terms gate, the dev surface rebuild, and the freedom principles (no CI, no gates, no qualification).
