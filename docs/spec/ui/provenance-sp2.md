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
