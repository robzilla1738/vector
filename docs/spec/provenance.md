# Reference provenance

This is the only spec document containing reference product identifiers and source paths. Reference artifacts are input to the spec team only and never ship.

- Plan: `/Users/rcourson/.factory/specs/2026-10-19-aux-v1-clean-room-rebuild-to-full-aside-parity-multi-agent.md`.
- Reference app: Aside 1.26.1016, `/Applications/Aside.app`, `~/Library/Application Support/Aside`.
- Extracted reference: `~/Downloads/aside-rea 2`.
- Additional reference: `~/AI Blueprints/06`.

Spec agents append exact source-to-section mappings and distinguish static findings, runtime observations and inference. Screenshots and hash manifests stay in gitignored `out/reference/`.


# SP1 evidence ledger (integrator: consolidate into provenance.md)

- **SP1-E1:** `/Users/rcourson/Downloads/aside-rea 2/extracted/daemon-app/index.mjs`, extracted 11,790,267-byte SEA JavaScript. Static observations. Auth byte offsets 2,693,956–2,701,900; bridge schemas/heartbeats 2,749,300–2,760,000; account router 11,398,993; settings 11,708,286; native session HTTP projection 11,765,663; health/readiness 11,775,430. Build documents contain no code excerpts or minified identifiers. Aux domains/restricted local access are explicit adaptations.
- **SP1-E2:** `/Users/rcourson/AI Blueprints/06/agent/AGENT_ARCHITECTURE.md`, `/agent/daemon/daemon-api-map.txt`, `/agent/daemon/trpc-procedures.txt`, `/agent/daemon/DAEMON.md`. Earlier reverse-engineering notes used as discovery indexes, corroborated against E1 where marked ready. Older counts/provider inventories are not assumed current.

No runtime observation or credential inspection by SP1. No owner's browser profile was modified.

- **SP1-E3:** Static reading of the locally installed CLI executable at `/Users/rcourson/.aside/cli/Aside CLI.app/Contents/MacOS/aside`, embedded program option/command registrations near decoded-text offsets 78,748,694–78,767,000 and model/ultrabrowse mapping near 78,825,365; MCP registrations near 78,838,375–78,840,690. No execution, key or profile inspection. CLI prose was not copied into build docs. Corrects older architecture notes: ask maps to guard; ultrabrowse sets proactive mode and highest visible reasoning level.
- **SP1-E4:** Installed builtin skill path inventory only under `/Users/rcourson/Library/Application Support/Aside/AsideDaemon/mac-arm64/1.26.1016.1852/Aside Daemon.app/Contents/Resources/static/skills/builtin`; secondary earlier purpose index `/Users/rcourson/AI Blueprints/06/agent/skills/index.json`. No skill body copied. Inventory includes additional site-specific subtree; exact shipped count needs final independent manifest reconciliation.

- **SP1-E5:** E1 static service routers: context 11,471,668; external managers 11,494,489; inbox 11,499,717; lasso 11,508,743; MCP 11,510,940; memory 11,516,666; meta 11,527,606; models 11,543,135; vault/search/audit 11,559,552–11,567,900; cipher schemas 11,567,862; import 11,628,216; password-manager nesting 11,639,119; projects 11,660,369; routines 11,667,071; tabs 11,688,284. Schema discovery: session creation 6,031,215; routine writable fields 6,040,100; memory layout 6,032,000; context query shapes 6,832,650/6,923,386/6,925,826; vault item shapes 6,988,185. Service spec distinguishes ready observable behavior from draft nested schema/algorithm questions. No source copied into implementation.

SP1-E4 inventory confirmation: 35 top-level SKILL.md definitions, 51 total recursively. CLI diagnostic option is hidden --log-dump <path>. No reference command was executed.


# SP2 evidence ledger

Temporary spec-team ledger; integrator must consolidate into `docs/spec/provenance.md`. Build agents consume the derived docs, never these sources.

| ID | Source and evidence | Derived sections / limits |
| --- | --- | --- |
| SP2-T1 | Installed `~/Library/Application Support/Aside/AsideAgentManager/1.26.1016.1852/assets/globals-B-8L9em-.css`, static declarations inspected 2026-10-19 | `tokens.md`: semantic colors, type, spacing, radii, motion. No runtime color sampling. |
| SP2-T2 | Installed component `newtab.html`, static structure and first-frame CSS | `newtab.md`: dimensions, shadows, theme bootstrap and input hydration. |
| SP2-T3 | Public upstream https://github.com/googlefonts/dm-fonts and https://github.com/google/fonts/tree/main/ofl/dmsans | DM Sans has OFL source availability; Aux-specific substitute rather than identical glyph metrics. |
| SP2-U1 | Installed component `assets/newtab-CnOLQ0yu.js`, `assets/newtab-editor-u_GbForB.js`, static control flow | `newtab.md`: selection/scopes/modes, pending submission and preserved editor. |
| SP2-U2 | Installed component `manifest.json`, static entries | MV3 newtab/sidepanel, Alt+Shift+B, self-only script CSP and artifact sandbox. |
| SP2-U3 | Installed component `assets/session-composer-Dc0LRfZA.js`, `assets/session-composer-BoATOu3F.css`, static event flow and class measurements | `chat.md`: composer, queue, transcript rows, pickers, approvals/artifacts. No reference code retained. |
| SP2-U4 | Installed component `assets/tabsearch-3k_2hgil.js`, static source behavior | `utilities.md`: grouping, query timing, keyboard actions and dimensions. |
| SP2-H1 | `~/AI Blueprints/06/06_DESIGN.md` sections 1/3, older extracted report from 1.26.923 | Supplementary inventory only. Target installed version wins; old screenshots do not prove target parity. |

## Reference extension IDs (denylist only)

The reference agent manifest's external connection allowlist contains `clcdgiameigmljcbkkcbjiljinmfkncl` (Vault). The agent extension ID derived from the reference manifest public key is recorded after verification below. These IDs must never occur in shipped Aux output.

Verified reference IDs by SHA-256 of manifest public-key DER, first16bytes mapped nibbles a–p: agent `fjdhphbdlfjogobdofoaagnlnkoibdge`; Vault `clcdgiameigmljcbkkcbjiljinmfkncl`.

| ID | Source and evidence | Derived sections / limits |
| --- | --- | --- |
| SP2-S1 | Target installed agent assets `-layouts-CcApOQbE.js`, `appearance-Ceuw3-j6.js`, `general-3dgRbrRk.js`, `agents-urkO3LLg.js`, `privacy-BeEEt9Qu.js`, `context-awareness-BocPTg31.js`, `communication-xjhkYtDb.js`, `developers-DTvaoVBC.js`, `experimental-Xq3YsEPK.js`, `mini-popup-BBLwe-a8.js`; static labels, class geometry and API call sites | settings.md control catalog and shared layout; no runtime assertions. |
| SP2-S2 | Target assets `inbox-BIWs6dWb.js`, `tasks-CtF0WxoJ.js`, `tasks-D7OPjR17.js`, `projects-D_csJvC9.js`, `routines-BNdQOEUt.js`, `skills-CfSQ7MCw.js`, `archived-chats-BgWKiXTB.js`, `statistics-CsvIURox.js`; static flow | secondary.md; exact listed dimensions measured from utility scale. |
| SP2-S3 | Target assets `settings-DguZi_c6.js`, historical report SP2-H1 memory behavior inventory | memory controls and file-history behavior; backend schema remains SP1-owned. |
| SP2-S4 | Target assets `model-BrFuJM2w.js`, `mcps-DmPp5oo9.js`, `account-Dr_CA8LL.js`, `password-LjdLcSRV.js`; static route/control inventory | model/MCP/account/password catalog; credential/security protocol not inferred from UI alone. |
| SP2-O1 | Target `onboarding-layout-MxuCwWDr.js`, `import-browser-DwQpkFpc.js`, `import-password-mvM-KsU6.js`, `done-DPzI9pFd.js`, `onboarding-helper-BVYyPOep.js`, `recovery-DY2UC0Rx.js`; static controls/layout | onboarding.md; local-account substitutions are owner-plan decisions. |
| SP2-X1 | Target `minipopup-LkDLFvnq.js`, `glance-BfAlmExy.js`, `capture-anchor-CI2S0j85.js`, `capture-toolbar-HNeL44hk.js`, `capture-result-nUfmrYC9.js`, `selection-handle-Df1vMUiF.js`, `translate-status-B2-Ij1Y9.js`, `lasso-Chg_FuP-.js`; static flow and geometry | utilities.md. Glance purpose and native placements are explicitly incomplete. |
| SP2-V1 | Target `~/Library/Application Support/Aside/AsidePasswordManager/1.26.1016.1852/popup.html`, `assets/popup-MxHiJ2Et.js`; static shell, field inventory and flow | vault.md;600×432popup, split layout, item categories, auth/recovery/import controls. |
| SP2-V2 | Target Vault `assets/password-generator-DuFk_MJX.js`, `assets/password-generator-CuRjsOHg.js`, `assets/iframe-CPJY6beY.js`; static entry inventory, historical SP2-H1 | generator/autofill functionality; exact crypto and authenticator behavior require SP1/native evidence. |

No screenshots or runtime app actions were taken by SP2. Existing owner profiles were never opened, modified or launched. All current-ready sections are static behavioral specifications or explicit owner-plan design decisions; visual acceptance remains open.


# SP3 source provenance (integrator to consolidate)

Reference strings and paths are isolated here. All other native specs refer to these source IDs. Inspection date: 2026-10-19. No reference application launch or real-profile inspection occurred.

- N1: `/Users/rcourson/Downloads/aside-rea 2/native-fork/NATIVE-FORK.md`, native layer map and recovered behavior highlights. This map identifies a Chromium 153.0.8010.53 target; it is not proof of the installed Aside 1.26.1016 behavior. Used for platform lifecycle/profile/CDP and API semantics.
- N2: same tree, `decompiled/0415d84c.c` and `0415e3cc.c`, challenge/session response validation. Static decompiled evidence only; no source excerpt is passed to builders.
- N3: accepted Aux v1 plan, native timings/ports, namespaces and local-only packaging. These are owner requirements rather than independent runtime measurements.
- N4: same tree, `idl/idl-asideAccount.json`, `idl-asideBrowserPreferences.json`, `idl-asideMiniPopup.json`, `idl-asideNotification.json`. Declarative signatures: respectively 4, 33, 10, 2 functions, with no events.
- N5: same tree, `idl/idl-asideOmnibox.json`: 29 functions and 19 events; many payloads are unrestricted JSON, so IDL alone does not establish their wire shape.
- N6: same tree, `idl/idl-asideBrowserImport.json`: 4 functions and 1 event; progress/options shapes are unrestricted JSON.
- N7: same tree, `idl/idl-asideAdblock.json`: 14 functions, typed subscription/update/diagnostic shapes, no events.
- N8: `/Users/rcourson/AI Blueprints/06/06_DESIGN.md`, native palette and geometry section; captured from older reference build, not runtime measurement of 1.26.1016. Used with explicit historical limitation.
- N9: same tree, `assets/06-chrome-tokens.css`: native color roles across light/dark. Native specs translate roles to Aux names rather than preserving product identifiers.

Known provenance gaps: target-version screenshots not captured; exact bootstrap state disk shape and installation signature algorithm need SP1 coordination; native viewport-domain parameter schemas and some open JSON API payloads need further evidence.
