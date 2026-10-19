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


## Owner clarification: standard HTML tokens

The owner clarified that the standard HTML element named `aside` is permitted and is unrelated to the reference product. This does not permit reference product names, extension IDs, copied artifacts or proprietary names. The checker admits only narrowly recognized independently licensed HTML vocabulary sequences; other matches still fail.

Verified independent upstream sources:
- `prosemirror-model@1.25.12` (MIT), `src/from_dom.ts`, SHA256 `b4f5e77c9dd4f430002b83fae8e1d114d9653e16ef4b28fba5ea01eb52980abb`. Acquired through the independently resolved pnpm lock; contains HTML block element vocabulary.
- `micromark-util-html-tag-name@2.0.1` (MIT), `index.js`, SHA256 `da74ea4080075b3f45a13eda9a05789e7038e1560954aff6979daafa68d0f096`. Acquired through the independently resolved pnpm lock; contains HTML block element vocabulary.

The independently acquired Apache-2.0 `Xenova/all-MiniLM-L6-v2` tokenizer contains ordinary English vocabulary (including the lowercase word `aside`). These are linguistic tokens rather than product names. Name-only detection admits the exact immutable `tokenizer.json` and `vocab.txt` SHA256 values in `apps/memory/models/manifest.json`; extension-ID and reference-artifact hash checks still run. The model artifacts are hash-verified before local inference.

The source checker also recognizes literal HTML opening/closing `aside` tags and the retained reader's HTML removal-selector sequence. Those refer to the standard HTML element authorized by the owner, not reference product identity. Existing filter-list and legacy native naming findings remain unresolved and visible pending retirement/audit.

The canonical Apache-2.0 license text was acquired directly from https://www.apache.org/licenses/LICENSE-2.0.txt (SHA256 `cfc7749b96f63bd31c3c42b5c471bf756814053e847c10f3eb003417bc523d30`). It naturally collides with the same public legal text in the reference inventory. The checker permits that exact digest only at license/notice filenames; names and extension-identity checks still apply. This is a public upstream license allowance, not an allowance for copied product artifacts.

## Vault follow-up evidence (VF, 2026-10-19)

Spec-only static inspection; no reference execution, profile database, real credential or Keychain read. Build agents consume `ui/vault-security.md`, not these artifacts.

- VF1: target `AsidePasswordManager/1.26.1016.1852/assets/runtime-CjDNbPPr.js`, SHA256 `5226bf447d6f135b43c9e8e719352b1dff1d7e4b13b2deb95f78c54da0c00f17`, defaults near decoded offset119369; `auth-CvIrRFM9.js`, SHA256 `d3f872cd94a98bc9fce02d1d75ea8a18b694aa21ccd0920a46bb010241d72346`, settings schema near12462. Establishes10080-minute default and integer schema.
- VF2: target `AsideAgentManager/1.26.1016.1852/assets/password-LjdLcSRV.js`, SHA256 `e00998141c347fa2ff29dfe5b62b6e6b797fc50aff0112ddc77cfc86b7bbb7ed`, timeout menu/control near71050–72150. Establishes exact menu values, not custom-timeout support.
- VF3: SP1-E1 extracted daemon, current SHA256 `9012caa45761482f936ef5d3994fc39444eb9a96202cdb65e931c10d5faf0439`, decoded offsets10561708–10563150 and10636431–10657160. Expiry derivation, manual lock, status and unlocked-key access, settings reset/update renewal. Target extension `backend-B-WKHlbp.js`, SHA256 `ea4afc93fc5ed4f1f19ce04915f6ff6ee5d95d4bf861e2e0337d21da594f46a8`, unlock deadline around34554–37560 corroborates minute unit but extension cache alone does not prove daemon inactivity behavior.
- VF4: target Vault `edit-mode-CvGhwo6n.js`, SHA256 `52e0032f131ef3ccfe84b6fcd69757701caa43918074aac12cb61652e0301512`, secret-copy lifetime around33258; `background.js`, SHA256 `eb760bfead1afc936c7c4b12573423809a224a3859781991ae40f4e4c00139fb`, alarm scheduling/handler near1405689 and1691942; `offscreen-2pbTn94C.js`, SHA256 `cb13dbeacf549fe75bea81cac71bcc96f770224d6abdd93c39827b5a804f8c51`, clear operation. Establishes30-second sensitive-copy clearing and2-second feedback; no configurable expiry control established.
- VF5: target Vault `password-generator-DuFk_MJX.js`, SHA256 `a78ff583d9f403eaf310c0a73c1e7128fb5c8d7323c728f2eb99c7adc7ea789a`, schema near1000–1550 and controls near4200–6550; `password-generator-CuRjsOHg.js`, SHA256 `2c2943c43fb86b3f84eb4c57157ea0b2777767b9cd98b15fb07de60505544780`, defaults/behavior near2600–3600 and5365–5600. Dictionary not transcribed; generator algorithm/code not passed to builders.
- VF6: target Vault popup/editor/background occurrences of reprompt plus SP1-E1 data projections and agent access. Observed persistence/default metadata but no explicit challenge contract in inspected scope. Native exchange session/import in SP1-E1 around11570586–11593831 and11629535–11631912. These observations are intentionally marked draft for enforcement/runtime interoperability.

REA inert JavaScript analysis receipt `ev_4904cb84f357d303b8e8bc3a07a0cdfa9de4d5a9a1c5f82db4cc991afb7c4d75`, retained parent `ev_62cd5e20bab690728ec0613a857cd39da2d5acce8f889c1b6da47ef756c49fca`, covered five selected target assets. Its graph is partial (node ceiling and21 unselected files); manual focused static byte reading supplied the findings above. Neither the graph nor static reading establishes execution, live expiry or live OS exchange acceptance.

- VF7: Apple public `ASCredentialImportManager`, `ASCredentialExportManager`, `ASExportedCredentialData`, `ASImportableCredential.Passkey` and `Passkey.key` documentation, inspected2026-10-19. Public URLs are linked in `native/credential-exchange.md`. Current Xcode SDK `AuthenticationServices.swiftinterface` confirms macOS26 availability, platform field types and additional newer-version fields. The official Markdown key page explicitly establishes PKCS#8 bytes and Base64URL JSON encoding; no reference codec copied. AutoFill Credential Provider entitlement documentation requires capability on both host and extension; it does not prove an ad hoc app is eligible.
- VF8: Static plist/signature metadata only for target bundled `Aside Password Importer.app` and `AsidePasswordImporterProvider.appex` inside `AsideDaemon/mac-arm64/1.26.1016.1852/Aside Daemon.app/Contents/Applications/`. Host declares exchange activity; extension declares passwords/passkeys/exchange support and version1.0; signature includes AutoFill provider entitlement, app sandbox and product-specific identity/Keychain groups. Those identities/groups were not passed to implementation. SP1-E1 session normalization around11570800–11571687 and constants near11576789 establish10-minute inactive-session expiry and24-hour status retention. No helper, source export, OS chooser, credential or owner profile execution.


## VM reference-only measurement follow-up, 2026-10-19

All sources below are immutable updated component package files, read without accessing owner browser profiles, daemon accounts, credentials or Keychain. The spec-only lane did not launch the native reference app. Original derived specification: `ui/visual-measurements.md`; raw non-shipping evidence: `out/reference/visual/measurement-index.json`. Probe extraction configuration/scripts remain spec-team-only reference material. Synthetic style probes are not accepted screenshots.

| ID | Exact target source and hash | Derived scope and limits |
| --- | --- | --- |
| VM1 | `/Users/rcourson/Library/Application Support/Aside/AsideAgentManager/1.26.1016.1852/assets/-layouts-CcApOQbE.js` (SHA-256 `a60d5a1a37bd280c33376bfa835a0420e5a4ad48f51f33f347fe9313267c1c90`); `/Users/rcourson/Library/Application Support/Aside/AsideAgentManager/1.26.1016.1852/assets/general-3dgRbrRk.js` (SHA-256 `e57dcde064f8872f2d8250123778924174deb2256d161b175cca751ef57f5ea4`); `/Users/rcourson/Library/Application Support/Aside/AsideAgentManager/1.26.1016.1852/assets/appearance-Ceuw3-j6.js` (SHA-256 `5d6795dc6c007d961e8960cc41e6825634be81da00d023e179647bc22e20f318`); `/Users/rcourson/Library/Application Support/Aside/AsideAgentManager/1.26.1016.1852/assets/privacy-BeEEt9Qu.js` (SHA-256 `b69101623284eed5fb8c7a108489861f7dc65cd9c4885584992624c1f883556c`); `/Users/rcourson/Library/Application Support/Aside/AsideAgentManager/1.26.1016.1852/assets/context-awareness-BocPTg31.js` (SHA-256 `dbb10064b0dc8fd8c391ee1354f70ef4e812acb078407e07f7490f76a3085e14`) | Target settings/import/context component declarations; interpreted original dimensions in visual-measurements.md M2. |
| VM2 | `/Users/rcourson/Library/Application Support/Aside/AsideAgentManager/1.26.1016.1852/assets/session-composer-Dc0LRfZA.js` (SHA-256 `71e187af0ca2887e13b840cd1e1b4aa2f46693821fb96daa8eafa9f4480bf645`); `/Users/rcourson/Library/Application Support/Aside/AsideAgentManager/1.26.1016.1852/assets/session-composer-BoATOu3F.css` (SHA-256 `17d617a57cb9ede5721f536bb8546527250a2a05648bb2a4b00748ebc611c8d0`) | Target conversation/composer declarations and companion prompt-marker stylesheet; original dimensions/conditional rail behavior in M3. |
| VM3 | `/Users/rcourson/Library/Application Support/Aside/AsidePasswordManager/1.26.1016.1852/assets/popup-MxHiJ2Et.js` (SHA-256 `172e509c9ee498da414d73a1124ace50434b077ef627a53dc904d985c1290bc4`); `/Users/rcourson/Library/Application Support/Aside/AsidePasswordManager/1.26.1016.1852/assets/password-generator-DuFk_MJX.js` (SHA-256 `a78ff583d9f403eaf310c0a73c1e7128fb5c8d7323c728f2eb99c7adc7ea789a`); `/Users/rcourson/Library/Application Support/Aside/AsidePasswordManager/1.26.1016.1852/assets/iframe-CPJY6beY.js` (SHA-256 `5a0194e9940f33106569349021c0f8af4eee3cdc5637681bf56bd119493bd2c9`) | Target Vault popup, generator and inline suggestion declarations; local-only measurements in M4. Sharing dialog measurements deliberately excluded. |
| VM4 | `/Users/rcourson/Library/Application Support/Aside/AsideAgentManager/1.26.1016.1852/assets/lasso-Chg_FuP-.js` (SHA-256 `0ed6dbe9b101d94935556273775a9141b429c596adecb924a96fc938c2bf9b52`); `/Users/rcourson/Library/Application Support/Aside/AsideAgentManager/1.26.1016.1852/assets/capture-toolbar-HNeL44hk.js` (SHA-256 `0e753ac953107ecc4790b678cefae9852396c7784f48f5f35751f6e14a61867f`); `/Users/rcourson/Library/Application Support/Aside/AsideAgentManager/1.26.1016.1852/assets/capture-result-nUfmrYC9.js` (SHA-256 `cfa3ec9546c3971ad154a59443bd16044465963f4d3b36d9871a456916f438f4`); `/Users/rcourson/Library/Application Support/Aside/AsideAgentManager/1.26.1016.1852/assets/translate-status-B2-Ij1Y9.js` (SHA-256 `b88f72dbf81421b816f17158952f7373f78c0e59deb1fac7969ce1586dbea364`) | Target lasso/capture/result/translation declarations; M5 body constraints, no native placement proof. |
| VM5 | `/Users/rcourson/Library/Application Support/Aside/AsideAgentManager/1.26.1016.1852/assets/globals-B-8L9em-.css` (SHA-256 `b8ed758b2ee5ea4171ea440d42ed0920699479c53ab5f56d72ba7cf62ac1d629`); `/Users/rcourson/Library/Application Support/Aside/AsidePasswordManager/1.26.1016.1852/assets/globals-CvG2QIZG.css` (SHA-256 `0f90fce4a52341c1fef7599a8dcb2ff88e49a9cf46cbd3410369c8bf2a12c16b`) | Compiled target stylesheet values verified with synthetic generic DOM style probes, 1280/420px widths, 800px height, light/dark. No original screen or baseline. |
| VM6 | `/Users/rcourson/Library/Application Support/Aside/AsideAgentManager/1.26.1016.1852/manifest.json` (SHA-256 `afa06a5fc5b0ca836413f8b7b8eae20d440dff502b1871b0cdb489a04d244570`); `/Users/rcourson/Library/Application Support/Aside/AsidePasswordManager/1.26.1016.1852/manifest.json` (SHA-256 `440e83e27c6576af3c19877ddcff224b731c09bd4069399832215e25074f804b`) | Target package version verification; both manifests report 1.26.1016.1852. This does not identify the native bundle as that version. |
