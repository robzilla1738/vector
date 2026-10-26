# Final nonpersistent runtime identity — paired source successor

Source baseline: A38's exact A51 `index.mjs` / `aux-native-entry.mjs`, plus the earlier cloud-transfer successor. Root's actual-bundle inventory was read from `integrator/a38-delivered-identity.json` at main `b8e79ee89`. No accepted app, original native addon/runtime bytes, native-host Swift/transport, source inventory, owner state or cloud service was changed.

## Implemented

`vendor/provided/aux-final-runtime-identity.mjs` exports `transformAuxFinalRuntimeIdentity({component,path,text,source})`. It validates a complete known A51/cloud-successor source hash and all exact occurrence counts before changing anything. `source` defaults to `text`; root may supply the pinned unmodified source separately when composing unrelated earlier patches. Changed anchors still must match the current composed text. Duplicate application, unknown input, count drift and collision with an existing `init_aux*` module binding refuse.

The daemon transformation has 28 rules / 47 occurrences per complete leaf:

- All 15 private `init_aside*` lexical module bindings and their callers become `init_aux*`. They are internal initialization bindings, not serialized keys or external loader exports.
- Temporary memory/history/export/installer prefixes, the injected DOM Symbol description, nominal image-worker module URL and paired generated system-prompt tags use Aux. These create no migration or old-directory adoption.
- CLI discovery selects `.local/bin/aux`, `.aux/bin/aux` and corresponding Aux Windows executable paths, with paired shell/PowerShell lookup and diagnostic commands. It no longer probes the old product's CLI installation paths. This does not execute discovery or claim the separate CLI destination flow is accepted.
- The retained `isAuxDaemonCommand` function now recognizes Aux daemon command names and rejects the old product's daemon name. Other health/PID/ownership/startup checks are untouched. No daemon was connected to, stopped or replaced.
- OAuth `originator` display metadata and newly emitted telemetry property names use Aux. Issued client IDs, scopes, callback URI, account bindings, tokens and historical remote analytics records are untouched.
- The obsolete Computer Use build instruction references a nonexistent old workspace package. It now truthfully says the helper is not included in this build; it neither enables the capability nor counts it as complete.
- The local feedback UI producer, daemon request schema and outgoing feedback metadata now agree on `auxComponentVersion`. Both daemon occurrences and the one actual UI occurrence change together. The hosted `/voc/session-feedback` receiver is absent from current Aux cloud source, so this is local schema pairing, **not** accepted hosted feedback behavior.

`source-pins.json` contains the exact approved input hashes and each rule's count/scope. `source-check.json` pins full cloud-plus-identity outputs and the unchanged source baseline. Prepared outputs are outside the app. Root must retain the cloud-transfer pass, apply this pass to both complete daemon leaves, and apply the single feedback-UI rule when producing the coherent candidate. Root owns stage/package manifests and must include this generator and its pins in provenance. It does not modify `provided-ui.mjs`, `provided-runtime.mjs` or root's final UI identity transform.

## Focused evidence

Two focused cases passed: complete paired A51/cloud composition with both daemon modules parsing; actual feedback UI producer pairing with module parsing and unchanged class names. The tests execute only the actual extracted daemon-name predicate against synthetic Aux/old-product command strings, proving Aux matches and the owner product does not. No process enumeration or takeover is executed.

The tests preserve the original counts of persisted `asideCode`, external suspension/session identities, cryptographic labels, original embedded-asset key, HTML parsing cases, SQL identity-builder methods and Vault-memory marker declaration. They also reject repeat application, unknown UI bytes and module-binding collisions. Runtime/provider/hosted/UI acceptance remains open; there is no broad unit-suite rerun or native build for these source-only changes.

## Finite remaining identity work

`remaining.json` records actual remaining tokens and concrete reasons. These are unfinished requirements or deliberately preserved valid language/compatibility material; they are not all branding defects.

| Remaining category | Required next action |
| --- | --- |
| `experimental.asideCode` plus six UI readers/producers | Introduce an explicit versioned settings-field transition with matching UI/schema; preserve existing supported new-profile settings and reject unknown values. Do not simply rename the JSON field. |
| `aside_suspension` channel buttons and `aside:worker:` provider session identifiers | Specify versioned external-action/session transition or fresh-only route scope; preserve existing task semantics and outstanding remote messages. Updating both current strings alone does not migrate existing external state. |
| `aside-events` WebSocket subprotocol | Pair with a real Aux event receiver. Current server source has no matching WebSocket receiver; this live cloud contract cannot be closed by a producer-only rename. Polling/source health is not proof that event-dependent services work. |
| Disabled Stripe lookup keys | Keep launch payments disabled; any future lookup-key rollout needs exact external Stripe mapping/paid-record continuity, not a string rewrite. |
| Excluded Vault `owner.kind`, preference markers and importer/credential-exchange callers | Remove the excluded product path after separating shared installation/provider authentication, or perform an explicit versioned format transition where legitimately shared. Never reinterpret stored original Vault records, invoke excluded helpers or inspect owner data. |
| Original embedded native asset spelling | Current macOS non-SEA loader never selects the Windows SEA materializer and its asset adapter exposes only WASM assets. Remove/repack that unreachable source branch with a matching artifact plan; preserve original native addon bytes. No binary replacement. |
| Persisted tag icon ID | Pair stored icon-key transition and the actual Aux mark consumer/asset. Existing values cannot simply disappear from a schema. |
| Historical legacy CLI title reader / original Windows app exclusions | Distinguish compatibility data/safety exclusions from new identifiers. Removing an old capture exclusion is not a branding-only change. |
| Runtime `.pyc`/native binary debug paths and original source provenance | Preserve immutable original runtime bytes. Repack/rebuild only with exact supported tooling/provenance if removal is required; a raw byte replacement is not legitimate identity migration. |
| HTML `aside` / SQL `AsIdentity` / third-party filters | Keep valid HTML selectors/parser tables, upstream SQL APIs and original third-party filter rules. They do not identify delivered Aux product endpoints. |

No full-product identity completion is claimed. Root's actual successor bundle scan must separate these categories and verify the final package; an unchanged source inventory, a passing parser or a renamed private symbol cannot prove the whole delivered app is finished.
