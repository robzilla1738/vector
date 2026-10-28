# Aux release-readiness audit: supplied components and pipeline

2026-10-28. Read-only. Candidate `out/provided-candidate-completion-20261026-a1/Aux.app` (seal `b606bf7c`). Nothing was launched, signed or edited. Abbreviations: `EXT` = `Contents/Resources/aux/apps/extension/dist`, `DMN` = `Contents/Resources/aux/apps/daemon/Aux Daemon.app/Contents/Resources`, `ENTRY` = `DMN/node-development/aux-native-entry.mjs`, `RT` = `Contents/Resources/aux/agent-runtime`.

Checks I ran that pass: `python3 scripts/verify-candidate.py` gives 89 pins, 0 missing, 0 changed, and 11,191 inventory entries with 0 differences (STATUS still says 69 pins). `codesign --verify --deep --strict Aux.app` exits 0. The daemon's entitlements are team `9F2JXY8TCK` with `9F2JXY8TCK.dev.aux.local` only.

## 1. Extension (Phase 2)

| Item | State | Evidence | What's left |
|---|---|---|---|
| Billing route guarded | DONE | `extension-main-Dz1-AsCT.js`: `/settings/billing/` has `beforeLoad` and redirects to General | — |
| "Plan & Usage", credits and referral out of settings search | DONE | `route-TQyeTEXE.js` search entries removed (receipt `extension-ui-a1`). "Plan & Usage" survives only inside the guarded `billing-*.js` chunk | — |
| Referral, "Aux Pro" and Developers "Pro plan" copy | DONE (dead code remains) | `general-*.js` still imports `Ic` from `referral-link-field` but never renders it. The Developers Remote Control component `Pe` (which holds "Requires the Pro plan" and "Remote Control requires the Pro plan.") is defined but never referenced; the rendered sections are Skill & MCP and FAQs only. Channels `showUpgrade:!1` | Optional cleanup of the unreferenced chunks. Other upgrade prompts (routines "Free plan limit", model-select "Upgrade to Pro", session composer) depend on `AUX_LAUNCH_POLICY={paymentsEnabled:false,hostedAiEnabled:false}`. That needs the Phase 7 live check |
| Vault/Password Manager wording in the recovery flow | DONE for the reachable flow | `/_public/auth/recovery/` (no guard, purpose `encrypted-data`) uses only the parser `B` from `recovery-key-*.js`. The text "Unlocking Password Manager…" in the recovery-key file and "doesn't match your vault" are reached only from `password-*.js`, `password-import-menu-*.js` and `components-*.js`, whose routes (`/settings/password`, `/onboarding/import-password`) redirect | The strings still ship in a shared chunk. Live check of the recovery flow |
| `/artifact-test`, `/error-test`, `/liquid-glass-playground` guarded | DONE | Each route has `beforeLoad: throw redirect("/")`. The chunks (`error-test-*.js` holds "Aux Pro" fixtures) still ship | Optional removal of the chunks |
| Discord link | DONE | No `discord.gg` and no Aside Discord. The only Discord URL is `https://discord.com`, the label for the Discord messenger channel feature | — |
| Docs and Community links | DONE (removed) | No `app.getaux.co/docs` and no "Community" in EXT. `https://app.getaux.co/docs` now returns 200, so the links could come back | Decide whether to restore Docs now that it is live |
| `127.0.0.1:9/aux-unavailable` install command and channel help links | **PARTLY** | The Remote Control FAQ and its dead install command are gone. The stray `}` is fixed (`t.split("-")[1]}.md`). But `channels-CJn5l9_T.js` still builds `http://127.0.0.1:9/aux-unavailable/docs/help/channels-${…}.md` twice. The reachable messenger bot form (`nt`) renders it as a **"How to setup {Slack/Telegram/Discord} bot"** link (`Ls … to:n`), which is dead. `production-cloud-a1` replaced only the `/api` placeholder | Point the guide at real docs (for example `app.getaux.co/docs/...`) or hide the link |
| English-only pin (D8) | DONE (minor residuals) | EXT has no `_locales` and no `i18n.getMessage`. The four formatters are `en-US`, and `Intl.*Format` defaults to `n="en-US"`. Residuals: `conversation-*.js` `toLocaleString([],{month…})` (a timestamp tooltip follows the OS locale); `markdown-*.js` `Intl.NumberFormat()` for CSV separator detection; dictation sends `getUILanguage()` as the STT language (behavior, not copy) | One `toLocaleString([])` |
| One feedback entry (D5) | DONE in the extension | "Send feedback" appears only in the chat session menu (`_sessionId-*.js`) and its dialog. The settings-sidebar link (`island`), the new-tab menu entry and the `/feedback` command are removed. The `?open_send_feedback` handler stays, with no link to it. Native `locale.pak` still has "Send Feedback" ×3 and "Report an Issue" (Chromium) | Phase 7: confirm no native menu reaches Google feedback |
| Remote Control and relay copy hidden (D6) | DONE (hidden, not removed) | The Developers Remote Control section, its FAQ and the Personal Assistants channel are removed from rendering. The strings remain in unreferenced code (`developers-*.js` `Pe`; `channels-*.js` remote-control mutation text) | — |
| "Google API keys missing" | **OPEN** | Not an extension string. `chromium/tree/aux.patch:3836` only rebrands `IDS_MISSING_GOOGLE_API_KEYS` ("…functionality of Aux will be disabled"). The delta has no suppression of the infobar (`infobar_utils`, `HasAPIKeyConfigured`) | Suppress the infobar for Aux (no Google keys by design), or confirm live that Aux's startup path never shows it |
| Naming consistency ("Aux", "Aux Daemon") | **PARTLY** | EXT: "Aux daemon" ×3 (auth error strings in `queries`, `background`, `content`) and "Aux Daemon" ×3; manifest name "Aux Browsing Agent"; Developers FAQ says "Aux Browser". ENTRY: "Aux Browser" ×9 (CLI error text, OAuth `client_name`, REPL skill), "Aux browser" ×6, "Aux daemon" ×4 against "Aux Daemon" ×4. Framework: "Aux Browser" ×7, "Aux daemon" ×3 | One sweep: "Aux" for the app and "Aux Daemon" for the daemon |

## 2. Daemon and runtime (Phases 1, 3, 4)

| Item | State | Evidence | What's left |
|---|---|---|---|
| Cloud policy (D1 flipped to production) | DONE as documented | ENTRY: `AUX_API_BASE_URL=https://api.getaux.co` (7 uses including the account issuer), share `https://share.getaux.co`, 0 `dev-cloud`, 0 `localhost:3000`. EXT `background.js` and `strip-markdown` use `https://api.getaux.co`, and the credits dialog falls back to `https://app.getaux.co/account`. Receipt `production-cloud-a1` | See the next rows for residual dev-cloud references |
| dev-cloud still referenced | **PARTLY** | 48 files. (a) `bundle.json.cloudPolicy = {mode:"development", api/share:"https://dev-cloud.getaux.co"}` is stale metadata, not read by the daemon. (b) **46 built-in `SKILL.md` files** under `DMN/static/skills/builtin/**` have `icon: "https://dev-cloud.getaux.co/builtin-skills/v1/*.{jpg,svg}"`. They resolve today (200) only because the dev-cloud alias still serves production | Repoint the icons to `app.`/`api.getaux.co` before the dev-cloud alias is retired |
| History sync off unless opted in | DONE (stronger: unreachable) | The only `startHistorySync(` call is inside `stopHistorySync`'s restart branch. The one real call site was replaced by `/* Aux: history sync and cookie backup are off in this release. */`. `isSyncEnabled` also requires a cloud account and `experimental.sync` (default `false`) | It is unreachable, not opt-in. Decide whether opt-in is ever wanted |
| CORS and trusted origins | **PARTLY: remote origins re-admitted** | `isTrustedLocalUiOrigin` is the extension plus `127.0.0.1`/`localhost`/`[::1]` on the daemon's own port (DONE). But `production-cloud-a1` re-added `isAllowedCorsOrigin = app.getaux.co \|\| api.getaux.co \|\| local` ("as the supplied build allowed"). That reverses the audit's "remote origins out of daemon CORS". Also: `DEV_AUTH_ALLOWED_ORIGINS` admits `localhost:5175` (plus `AUX_DEV_AUTH_ORIGIN` from the environment) for dev tokens. Those still need an installation-key signature, so the risk is low | Decide whether the hosted web app really needs to call the local daemon. If not, drop the two remote origins. Either way, record it in STATUS: the 2026-10-27 observation "CORS refuses dev-cloud" predates this |
| Inherited provider keys ignored | **PARTLY** | `auxDropInheritedProviderCredentials()` runs at startup with the regex `^(OPENAI\|AZURE_OPENAI\|ANTHROPIC\|GEMINI\|GOOGLE…\|MISTRAL\|GROQ\|XAI\|DEEPSEEK\|OPENROUTER\|AI_GATEWAY\|COHERE\|PERPLEXITY\|TOGETHER\|FIREWORKS\|CEREBRAS\|HF\|HUGGINGFACE)_(API_KEY\|ADMIN_KEY\|AUTH_TOKEN\|OAUTH_TOKEN\|ACCESS_TOKEN)$`. The daemon also reads these, which **survive**: `AWS_ACCESS_KEY_ID`/`AWS_SECRET_ACCESS_KEY`/`AWS_BEARER_TOKEN_BEDROCK`, `HF_TOKEN`, `KIMI_API_KEY`, `MOONSHOT_API_KEY`, `MINIMAX_API_KEY`, `ZAI_API_KEY`, `XIAOMI_API_KEY`, `NVIDIA_API_KEY`, `BASETEN_API_KEY`, `CLOUDFLARE_API_KEY`, `OPENCODE_API_KEY`, `META_API_KEY`, `RADIUS_API_KEY`, `GOOGLE_APPLICATION_CREDENTIALS`, `ANTHROPIC_IDENTITY_TOKEN[_FILE]` | Widen the list (or allowlist the environment) and add a test that compares it with the provider env names the daemon reads |
| Embedded Aside PostHog key stripped | DONE | `AUX_POSTHOG_PROJECT_API_KEY=\`aux-analytics-disabled\``. PostHog is constructed with `disabled:!0`. No `phc_` key is in EXT or ENTRY; the one `phc_` hit is posthog-node's own validation string. posthog-js/node library code ships (2,416 hits, inert) | Optional: drop the library |
| `loadBinding` contract | DONE | ENTRY: `bindingLoadError=…;return binding=null}}function loadPdfBinding` | — |
| Shutdown budget | DONE | `AUX_SHUTDOWN_BUDGET_MS=15e3`, `budgetExceeded:()=>process.exit(75)` | — |
| CDP challenge cap | **PARTLY** | `chrome/browser/devtools/aux_cdp_authority.cc` (in `chromium/tree/added.tar.gz`) caps `challenges_` at **1024 globally**, evicting the oldest, with a 30 s TTL. That is not per peer, so one local client can evict other clients' pending challenges | Per-peer (or per-connection) cap, if the audit's intent stands |
| `index.mjs` 12 MB dead weight | DONE | `node-development/index.mjs` is 198 bytes (the refusal line). `aux-native-entry.mjs` is 12.4 MB and live. Minor: `aux-crypto/` is duplicated at `DMN/aux-crypto` and `DMN/node-development/aux-crypto` (614 KB × 2) | — |
| Memory census scope | DONE (source receipt) | `runtime/memory-census-scope-a1/README.md`: counts only helpers whose image is inside this bundle, skips zombies, and refuses if the bundle root can't be read. In seal `7f810851` | Live: a second install or a zombie |
| Runtime and model update channels | Note | ENTRY still has `http://127.0.0.1:9/aux-unavailable/releases` (runtime and CLI releases), `…/releases/dev-updater/models` (memory models), and a Windows `install.ps1`. This is intentional (no Aux release policy), but the shipped runtime and models can't update | Phase 9 updater design |

## 3. Identity sweep of the packaged app

Python byte scan of all 11,176 files in `Aux.app`, including the text inside binaries:

| Pattern | Files / hits | Verdict |
|---|---|---|
| `Aside` | 8 / 16 | Benign except one: content-filter lists (`adAside`), Blink `HTMLAsideConstructor`/PDF tag `Aside`, Python and V8 docs ("Aside from…"). **`RT/prepare-python.py:62` prints `"Aside: could not clear quarantine…"`**. No daemon or extension code calls it (0 references) |
| `aside.` | 7 / 28 | Framework legacy `aside.*` storage-key readers (allowed by AGENTS), filter-list domains and CSS, HTML tag lists in ENTRY, npm comments. OK |
| `AsideBrowser`, `studio.Aside`, `getaside` | 0 | Clean |
| `8CPD4K4TBB` | **86 / 467** | **Aside vendor's code signatures.** `codesign -dvv` shows `Authority=Developer ID Application: At Inc. (8CPD4K4TBB)` on `RT/native/bin/{rg,pdfinfo,pdftotext,pdftoppm}`, 31 `RT/native/lib/*.dylib`, lxml `.so` files in the venv, and `DMN/native/node-pty/prebuilds/darwin-x64/{pty.node,spawn-helper}`. Docs call these "authentic bundled third-party signatures" (`standard-profile-isolation/runtime-coordination/README.md:22`) |
| `dev-cloud` | 48 / 49 | `bundle.json` (2) and 46 `SKILL.md` icon URLs (see §2) |
| `localhost:3000` | 11 / 80 | All in npm's bundled `undici` docs. OK |
| `posthog` | 438 / 2,416 | Library code in EXT and ENTRY. Key replaced and disabled. OK |

Further residuals the requested patterns don't catch:
- **Runtime provenance path** (confirmed, as STATUS says): `/Users/runner/work/bro-components/bro-components/packages/aside-runtime/dist/aside-runtime-1.26.1019.335-darwin-arm64` appears in `DMN/../MacOS/aux-daemon` (6×, next to an `ASIDE_`/`AUX_` prefix list) and in `DMN/native/runtime-source-pins.json` (33×). `bro-components` or `aside-runtime` appears in about 805–1,451 runtime files (pyc and venv metadata).
- **STATUS's "identity is complete except the runtime-provenance path" understates it.** Also present:
  - (a) `\.aside/` in **646 `.pyc`** files (`/Users/rcourson/.aside/.runtime-install-…`). These were compiled on the owner's machine from the installed Aside runtime; the frozen snapshot has the same 653 owner-path files.
  - (b) **Owner home paths** in 11 files: `RT/python/venv/pyvenv.cfg` (home/executable/command), `venv/bin/pip*` shebangs, `activate*`, and `DMN/native/runtime-text-root.json`. All of these point at `/Users/rcourson/Documents/Vibe/web/out/…`, a path that no longer exists since the repo rename. `runtime-text-root.json` is hash-pinned by `runtime-bootstrap.cjs`, so it acts as a relocation anchor. Confirm that the venv and pip still work after seeding.
  - (c) The At Inc. signatures above.
  - (d) `bundle.json` (4.3 MB build manifest shipped in the app): 995 `/Users/rcourson/…` and `/private/tmp/…` paths, `productionReady:false`, `localDevelopmentOnly:true`, `fullIdentityComplete:false`, a `blockers` list, and an `excludedFiles` record naming `AsidePasswordImporterProvider.appex`. The Framework and CLI mention `bundle.json`; whether they read it at runtime is unverified.
  - (e) The `prepare-python.py` "Aside:" string.

## 4. Images and videos

Hashing 126 raster, video and icon files against `out/provided-source-snapshot-1.26.1016.1852`: 34 changed (app icons, extension icons, the 8 retouched extension images, both sign-in videos) and 92 unchanged.

macOS Vision OCR over every extension, CLI, computer-use and daemon PNG/JPG/GIF, plus all 69 WebP/AVIF converted to PNG: **0 "aside" hits**. I viewed the main unchanged suspects (`aux-context-awareness`, `aux-lasso`, `automation.png`, CU permission icons, illustration rows); none shows the Aside mark or text.

Remaining suspects, all unchanged from Aside, with no text found but no visual sign-off: `EXT/assets/background-BriNwY3v.webm` (the only unretouched video, not OCR'd frame by frame), `background-DmA5he4Z.avif`, `chat-background-*.webp`, `task-*.png` and `hero-illustration/captures/*.png` (third-party site screenshots: Netflix, LinkedIn, Amazon, Chase), and the CU permission images. Note: the marketing art carries third-party marks (Google, Amazon, Bank of America, Salesforce, X, Canva, Carta, Chase, Netflix). That is inherited, but it is a trademark-use question for a public release.

## 5. Visual baseline

`docs/acceptance/visual-manifest.json` has 130 surfaces, all null; it protects nothing. The relevant pin is `docs/acceptance/aux-identity-ui-baseline.json` (135 files, `acceptedRoot` under the old `/Users/rcourson/Documents/Vibe/web/...`). Against the candidate, after the 7 `aside-*` → `aux-*` relocations, **8 files drift**: `aux-CeBDTZrg.webp`, `aux-cli`, `aux-mini-popup`, `aux-password-manager`, `aux-payment-use`, `cover-BBxO7594.webp`, `grant-permission-*.webp`, and `globals-B-8L9em-.css`. **OPEN:** the baseline still pins the pre-retouch hashes of the 7 Aside-labeled rasters. A check against it would either fail on the current seal or, if "repaired" back to it, restore Aside art. Re-pin to the retouched hashes and update `acceptedRoot`. There is no OCR step in the identity audit yet (Phase 2 asked for one).

## 6. Pipeline and engineering (Phase 5)

| Item | State | Evidence | What's left |
|---|---|---|---|
| Candidate reproducible from the repo | **PARTLY** | `verify-candidate.py` passes (89 pins, full inventory). README:10 says a fresh `stage:provided` is the predecessor pipeline; the candidate is A38 plus the ordered receipt-bound repairs. `scripts/lib/provided-ui.test.mjs:35` skips with "Default-profile Agent revision is unreviewed". Nothing rebuilds the candidate end to end, and the A38 base and many pins live only in ignored `out/` (backup D11 done) | Clean-room rebuild proof |
| Tests for executor, chromium-tree, verify-candidate, aux_drive | **PARTLY** | Present: `scripts/test_chromium_tree.py`, `scripts/candidate/test_prepare_edits.py` (both in `pnpm test`). **Missing:** tests for `scripts/candidate/repair_combined.py` (executor), `verify-candidate.py` and `scripts/acceptance/aux_drive.py`. `pnpm check` = `pnpm test && check:provided`; it does not run `verify-candidate.py` | Add the three tests, and put `verify-candidate.py` in `pnpm check` |
| Env-gated tests skip | **PARTLY** | About 15 tests still use `skip: !source`/`!pinned`/`missing` (for example `aux-native-crypto-boundary-audit`, the four `*-identity` tests, `cloud-service-policy`, `runtime-cache-contract`, `skill-catalog-scope`, `cli-adapter`, `daemon-adapter`, `provided-computer-use`, `provided-runtime`, `provided-signing`, `provided-ui`). STATUS: 5 skips remain | Fail instead of skip when the frozen snapshot is present |
| Live tools under `docs/integration` | **PARTLY** | The executor, freezer and edit prep moved to `scripts/candidate/`. But `scripts/stage-provided.mjs`, `scripts/lib/provided-package.mjs`, `provided-stage-inputs.mjs` and `audit-candidate-compatibility.py` still import code from `docs/integration/proposed/**` (1,823 tracked code files there) | Move or freeze them |
| Repo weight | **OPEN** | `git count-objects -vH`: 203 MiB packed + 52 MiB loose, 1 garbage temp object. Tracked: 8,964 files / 302 MB, 8,140 under `docs/integration`. Largest blobs in history: `chromium/patches/aux/0049-maintained-content-semantics.patch` 28.8 MB (×5 versions), `0040-native-adblock-engine.patch` 19.1 MB, `chromium/tree/aux.patch` 16 MB/15.7 MB/4.4 MB, `0016-content-blocking.patch` 9.9 MB (×4). In HEAD, two 11.8 MB copies (`…/fresh-startup-milestone-a42/http-request-adapter-source/{aux-native-entry,index}.mjs`) and three about 2.8 MB signing receipts. `chromium/patches/` is empty except `.DS_Store` | Prune at an archive tag (Phase 5) |
| `~/Applications/Aux.app` stale launcher | **OPEN** | Dated 2026-10-19. `Contents/MacOS/Aux` is a shell script running `node …/aux/scripts/aux.mjs --chromium …/browser/Aux.app` (the retired independent build). STATUS acknowledges it | Remove or replace (owner's call, since it is a delete) |

## 7. REPL (Bash, PTY, CLI)

**OPEN (external gate).** `runtime/repl-activation-ready/README.md`: the source is complete and rebased onto the current seal (browser overlay with 19 anchors, daemon JS rules, daemon main with the peer-loss bound); it compiles and is inactive. Tools return disabled-capability failures.

Apple request **2H4D7KNGUP**, submitted 2026-10-26 (`integrator/endpoint-entitlement/`), is the **`com.apple.developer.endpoint-security.client` entitlement** for Team `9F2JXY8TCK` / `dev.aux.browser.daemon`. The early browser observer may also need coverage for `dev.aux.browser`, which is unverified.

After approval: relink the daemon and Framework, apply the daemon entitlement and profile delta, apply the v11 signing/resource delta, reseal locally, then run six journeys (Bash, a yield/cancel, PTY I/O/resize/exit, an escaped descendant, revocation, Quit).

## 8. ChatGPT/Codex plan and 1Password

- **ChatGPT plan: OPEN.**
  - `vendor/aside/shims/aux-chatgpt.cjs` (526 lines) ships as `DMN/native/aux-chatgpt.cjs`. It uses the official `auth.openai.com` flow with scopes `resource.invoke chatgpt.tokens.use.direct` and a per-account binding. `CredentialStorage` routes `openai-codex` get/delete through `auxChatGPT()`.
  - The eligibility packet (`integration/chatgpt-eligibility/request-packet/request.pending.json`) is `prepared-remaining-owner-facts-unconfirmed`. `submitted:false`, and `publicDistributionStatus`, `commercialStatus` and `openSourceLicenseAndPublicationRights` are all `UNCONFIRMED`.
  - **New finding:** ENTRY still contains the supplied pi-ai OpenAI Codex OAuth module using **the Codex CLI's public client ID `app_EMoamEEZ73f0CkXaXp7hrann`** with a `localhost:1455` callback and device-code flow (`loginOpenAICodex`, `startOpenAICodexDeviceAuth`, `refreshAccessToken`). It is registered through `registerBundledOAuthFlowLoaders({openaiCodex:…})` and is the `oauth.load` of the `openai-codex` provider. The eligibility README says "no borrowed client is proposed". Whether the login route can still reach this loader instead of `aux-chatgpt.cjs` was not proven. Verify, and remove or fence it.
- **Other subscription-reuse providers ship and are listed in the UI**: `claude-code` ("Reuse your Claude Pro or Max subscription"), `github-copilot` (sends `Copilot-Integration-Id: vscode-chat` and the `copilot-chat/0.35.0` plugin version), `kimi-code`, `meta-muse` and `xai-grok-oauth` (EXT `strip-markdown-*.js` `Xf` set; ENTRY `isSubscription:!0` ×12). The scope in AGENTS and the contract is "BYOK or an eligible ChatGPT/Codex plan". These are outside it and carry vendor-terms risk (client impersonation). Not mentioned in STATUS.
- **1Password: OPEN.** The native-host adapter is sealed and its binding request runs off the UI thread. `runtime/native-host/README.md` describes a `sandbox-exec` lease that **denies fork and other image execution** for native hosts. `desktop/external-password-manager-acceptance/README.md` notes it is unobserved whether 1Password's host works inside those limits. 1Password also requires an Apple-signed browser in /Applications (blocked: Developer ID p12 import and a provisioning profile, owner steps), a disposable vendor account, and the UI pass (D12).

## 9. Licensing

- **Third-party notices bundled:**
  - Node (`RT/node/LICENSE`), Python (`RT/python/runtime/lib/python3.13/LICENSE.txt`) and node-pty (`DMN/native/node-pty/LICENSE`).
  - Memory/ONNX/Rust crate notices (`DMN/native/local-memory-licenses/*`, with a README).
  - The memory model `NOTICE.txt`, `EXT/CRISP-LICENSE.txt`, and the filter lists' `LICENSE-GPL-3.0.txt`.
  - Chromium: the Framework binary references `chrome://credits` (1 hit). The credits page should be inside `resources.pak`; not opened.
- **Gaps:**
  - **No third-party license file for the extension's npm dependencies** (React, TanStack, posthog-js, shiki, Base UI and others; there is only CRISP).
  - **None for the daemon's bundled npm graph** (pi-ai, Anthropic/OpenAI SDKs, hono, zod, yauzl, quickjs-emscripten and photon wasm).
  - GPL-3.0 filter lists ship. Check that source/offer obligations are met (the lists are data; usually fine with the license text).
- **Anthropic proprietary skills:** `DMN/static/skills/builtin/{docx,pptx,xlsx}/LICENSE.txt` reads "© 2025 Anthropic, PBC. All rights reserved". Lines 18–21 prohibit reproducing, creating derivative works, and **distributing, sublicensing or transferring to any third party**. Shipping them in Aux looks inconsistent with that license (it was inherited from Aside). Remove them or obtain permission.
- **Right to ship the supplied Aside implementation: no recorded license or permission from the copyright holder.**
  - **What the docs say:** AGENTS.md and the contract describe "the Aside implementation the owner supplied". The authorized static inputs are `~/Downloads/aside-rea 2`, `~/AI Blueprints/06`, the installed packages under `~/Library/Application Support/Aside/` and `~/.aside/runtime`, and the frozen snapshot. `docs/source/provided-ui.md:3` says "The active reuse plan authorizes these static installed packages".
  - **What that authority is:** every authorization I found is the *owner's* (Robert's) instruction to use these inputs. Several docs describe recovering behavior by disassembly and decompilation of the supplied binaries ("reconstructed source from bounded SDK disassembly", Ghidra/REA in `aux-native-*` READMEs; `recovered-cpp`).
  - **What is missing:** I found **no document recording a license, assignment or written permission from At Inc. (Aside's publisher, Developer ID `8CPD4K4TBB`)** to copy, modify or redistribute the Agent extension, daemon, CLI, runtime or UI.
  - **Related signals:** the ChatGPT packet marks `openSourceLicenseAndPublicationRights: UNCONFIRMED`. STATUS "Legal" covers only Aux's own terms and privacy. Phase 8 lists "legal confirmation" as an external gate without saying what it covers.
  - **Flag:** release-blocking until the owner records the basis (ownership, license or permission).

## 10. New findings (not in the excellence audit)

1. **At Inc. (Aside) Developer ID signatures on 86 runtime and PTY binaries** (§3). This is an identity residual and a release-signing question (library validation, notarization, provenance). Re-sign them under Aux, or document the decision explicitly.
2. **Codex CLI client ID in the shipped daemon** (§8). This contradicts "no borrowed client".
3. **Out-of-scope subscription providers** (Claude Pro/Max, Copilot with VS Code headers, Kimi, Meta, Grok) are visible in onboarding and provider UI (§8).
4. **Anthropic "all rights reserved" docx/pptx/xlsx skills redistributed** (§9).
5. **Daemon CORS re-admits `app.`/`api.getaux.co`** after D1 flipped (§2). STATUS's CORS observation predates it.
6. **Dead "How to setup … bot" guide link** in the messenger channel setup (§1).
7. **`bundle.json` ships the build manifest** with about 995 owner paths, `/private/tmp` paths and stale dev-cloud metadata. **Owner paths** also appear in the venv config, pip shebangs, `runtime-text-root.json` and 646 pyc files (§3).
8. **The inherited-key drop misses AWS/Bedrock, HF_TOKEN and about 12 other provider env keys** (§2).
9. **The identity UI baseline pins the pre-retouch Aside rasters** (8 drift); the visual manifest is all null (§5).
10. **Missing npm third-party notices** for the extension and daemon (§9).
11. **STATUS drift:** pin count is 69 in STATUS against 89 actual. The "identity complete except runtime provenance" claim is understated (§3).
