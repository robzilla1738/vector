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
