# Actual UI-only enrollment staging integration

Integrated only the reviewed account enrollment presentation/behavior. No CSS, sidebar, toolbar, glass, icons or window geometry changed. This is a lean static stage/check result, not actual rendered app acceptance or protected/cloud activation.

`stage-provided.mjs` applies the proposal's `stage-prebranding` adapter at the end of the real transformText callback, before normal branding, only for state2. All three exact account edits remain replayable in the original preservation chain. State1 takes the existing return path and adds no assets.

`provided-ui.mjs` copies exactly the two fixed enrollment assets after original source processing and before Agent fingerprint/revision. It validates source path, bytes, SHA256 and0644 mode against the reviewed source-pins/materializer. Collisions with original paths refuse. Each added record carries its repository source/source hash, generatedBy, output hash/mode and integration classification. The Agent `recoveryEnrollment` manifest contains exactly those two records. The supplied original1215 records remain separate.

The shared UI checker compares that manifest and every generated record/actual byte/mode against the same pinned materializer; missing/extra/duplicate generated files or forged source metadata fail. It separately retains exact original source coverage, anchor replay and no-extra-on-disk checks. Agent revision11 includes all1217 actual output files. Earlier ten reviews remain byte-for-byte equivalent JSON records.

Actual UI-only derivation first reached the existing fail-closed revision check after the complete original transformations and two additions. It returned fingerprint `ade97244902afdc5dd345af447090b2c79a715a0500ccc4aed6eeb82ca75eb1d` without retaining unaccepted output. Only then was revision11 appended. The subsequent checked UI stage produced Agent version1.26.1016.1863 at `out/aux-enrollment-ui-review-20261022/ui`. No full supplied stage/package or native build ran in this lane.

`stage-ui.mjs` extracts and executes the **actual** staging callback and **actual** shared checker UI boundary, rather than maintaining another transformation implementation. It reads only the frozen static Agent/Vault inputs. Existing original outputs were compared with `out/provided-reuse-aux-recovery-utilities/ui/agent`: exactly `assets/account-Dr_CA8LL.js` and `manifest.json` differ; the other1213 existing Agent files match. All five Agent CSS files and all icons remain identical. It parses the resulting account module and both new assets and checks their sibling imports exist; it does not evaluate React or an app. The account output hash is exactly the reviewed `3d3119ea8f2bd1afd7c203efecd07c1f2d2d6d4425a1c94f36b9a9bbb7c65f47`.

`check-generated.mjs` exercises only the actual new checker fragment with missing-asset, extra-asset and forged-source-pin metadata. All three reject without modifying the successful stage. Evidence/source hashes are in `evidence.json`; initial fail-closed fingerprint review is in `derivation.json`.

New copied assets:

- `assets/aux-sync-recovery-enrollment-controller.js`:4175bytes, SHA2568a6d30d3346c2a890660182d93bae0573dab0ef4eb475bd51decbcd9ab9647d3.
- `assets/aux-sync-recovery-enrollment.js`:4170bytes, SHA2562aeaa20ec0a4b29a459a604a987d9829381a7f614dd707ddf88337437918fd45.

Root owns adding the corresponding source pins to adaptationInputs and composing the paired daemon/status/runtime successor. This commit does not touch daemon staging, the shared source-input list, native GN, app packaging, owner state, signing, protected factory or cloud. Actual full app build/visual observation and live account enrollment remain separate gates.
