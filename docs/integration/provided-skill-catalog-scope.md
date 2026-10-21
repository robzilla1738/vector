# Supplied Skills catalog: Aux title and retired Vault entry

The owner excludes the built-in password manager/Vault product (AGENTS.md, 2026-10-20). The pinned 1.26.1016.1852 Agent Settings screen consumes `projects.listSkillsForSettings`, then partitions its rows into System, Built-in Skills, Password Manager and My Skills. The daemon's existing session-skill exclusion does not remove the Settings catalog row.

The Agent adapter now wraps that actual Settings query's existing selector, retaining its result and filtering only `path === "builtin/password-manager"`. All groups receive the filtered list. Apple Passwords, Bitwarden and custom/user skills remain, including a user skill whose name is `password-manager`. No skill files are deleted, catalog entries fabricated or third-party integrations declared verified.

The display helper title-cases the original `name: aside`, which produces the observed “Aside” despite prose branding. The Agent helper and proposed daemon helper map exactly `{name:"aside", path:"builtin/aside"}` to display title “Aux”. The original lowercase name, path, REPL identifier and public protocol stay intact. Other skills named `aside` retain their supplied display behavior.

The separate proposal `docs/integration/proposed/skill-catalog-daemon/catalog-patch.mjs` contains two count-one catalog filters for its actual `listSkills` and `listSkillsForSettings` handlers. These are **pending executable integration**, outside the active daemon adapter and staging imports: applying the proposal changes the adapted daemon code SHA to `71b02b3255a016f4438a5deb1b99332cdc7269679e2ff96c725bc3ec04b9a7b5`. A newly injected SEA cannot reuse the currently signed daemon executable hash/signature. No executable, signing, stage, native helper or addon was modified here. The current runnable daemon can still expose the obsolete row until that separate boundary is resolved; the Agent filter removes it from the actual Settings consumer meanwhile. No Node fallback is proposed for the normal product.

## Pinned input and count checks

Original daemon code: `5e35dfa1eb76d4614246f954b652fd505e271a0b3f1ac3168132fb8bc03814f5` (whole-source check). Each of the three proposed daemon anchors must match once. The active adapter is byte-identical to pre-slice base34193fa55 (source SHA256 `194573981c40bfda4ea488c5d84050e769da8eac837cba69b0d308b1f4b43ba0`) and still generates daemon code SHA256 `93084eb7eebf911b473d791e796f5d8ad740bc8befa5527a8adb0205d42a9dd0`. The proposal asserts that exact input hash before applying. Production staging imports no proposal code, so the UI refresh does not change daemon executable provenance.

Agent inputs and output of **only** `transformProvidedNativeUi` (not final packaged/branding output):

| Asset | Original SHA256 | Transform output SHA256 |
|---|---|---|
| `assets/utils-WfPpT5w5.js` | `7cc4165c84fcf42aba15f0fc1cefef8cb009a6840988474ff9ec0e4b647c3eea` | `75764a1d95605e2c38e36014736e67891f97c31bb365b4304c21e2b2866162fe` |
| `assets/skills-CfSQ7MCw.js` | `0967d1025eeb8d0df5ee338feab28f1bd4fecdd699fc926c484e3003fcab66f7` | `403673c5560df07642075f71dbbcdc75d615f07b8039a400eb6d1720cb3961dd` |

Each asset-specific anchor must match exactly once or staging refuses it. Changes use the existing count-checked UI adapter seam. There are no packaging/registration/GN edits.

## Verification

Four focused checks passed: existing UI transform replay/wire preservation (two checks), the proposed daemon query handlers plus title helper, with a separate active-code hash assertion evaluated in isolated JS contexts, and the actual Agent query selector/title helper evaluated with inert catalog fixtures. Inputs came only from the frozen supplied source snapshot. No daemon, original native command, credential/provider request or owner state was accessed. The default `password-manager` built-in row is absent; external-manager and user rows remain.

Actual catalog API/UI observation after root stages the Agent change remains required. Source-level fixture success does not prove the running daemon catalog has changed.
