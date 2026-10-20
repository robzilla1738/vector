# Supplied resource assembly

Local stages now also contain the pinned supplied daemon JavaScript and its original WASM assets under the daemon app’s `Resources/node-development/`. The assembler records the fixed `provided-node-development` runtime mode. Matching native startup runs that exact implementation with the unchanged bundled Node and the original two Node arguments; the source guard, daemon contracts and authority requirements remain intact. This avoids executing a modified SEA during local development. The extraction checks do not establish native authority or runtime acceptance.

Current scope is local development with 1:1 supplied UI and behavior. Signing, provisioning, notarization and release preparation are outside this workflow. Signing commands and earlier entitlement investigations below are historical tooling references, not next steps or development acceptance requirements.

Run `node scripts/assemble-provided.mjs --stage out/provided-reuse --output out/provided-resources` after staging and the preservation audit. The output must be a new directory. No native app, executable or owner data is launched, signed, replaced or installed by this command.

The assembler copies only manifest-listed files and contained relative links, checks every regular file's SHA256 before and after copying, preserves declared modes, rejects unreported leaves, and publishes the new tree only after successful assembly. It refuses source/output overlap and noncanonical/symlink roots. A failure removes only its private temporary directory. It does not replace the separate source-pinning/replay audit: run `check:provided` for that evidence.

The resulting directory maps directly to `Aux.app/Contents/Resources/aux`:

| Staged component | Bundle resource path |
| --- | --- |
| Original Agent | `apps/extension/dist` |
| Original Vault | `apps/vault/dist` |
| Supplied daemon | `apps/daemon/Aux Daemon.app` |
| Supplied CLI | `apps/cli/Aux CLI.app` |
| Supplied Computer Use helper | `apps/computer-use/Aux Computer Use.app` |
| Supplied agent runtime | `agent-runtime` |
| Catalog-verified memory distribution | `memory-distribution` |

The original password importer remains nested in the daemon's `Contents/Applications`, where its actual resolver searches. All executable declarations, including the nested provider, are checked during app staging. Principal-class/module names are preserved.

`provenance/` contains the source staging reports. `bundle.json` records every assembled resource hash/link/mode, the final installed app path used by relocated runtime wrappers, canonical artwork inputs and outstanding integration blockers. It reports `productionReady:false`; successful assembly does not clear those blockers or establish runtime/visual acceptance. A tree staged for one final app path cannot simply be launched from another location and assumed relocated correctly.

App staging includes the fixed guarded CJS binding beside each supplied addon and the daemon's pinned memory bootstrap, seeder and catalog inventory. The preservation audit requires these files and checks their current repository hashes. Next packaging steps still require the compiled native integration, native guard, carrier/interposer and actual bootstrap/startup acceptance. Original `provided-native.node`, catalog binaries and bundled runtime bytes/signatures must remain intact. Use the explicit [signing planner](provided-signing.md) for changed/new code and enclosing bundles; never recursively re-sign all nested code. The historical `package-aux.mjs` still builds independent components and is not the producer for this assembled tree.

## Native app assembly

`scripts/package-provided.mjs --stage <stage> --native-receipt <build-receipt.json> --composition <composition> --boundary-receipt <native-build-receipt.json> --output <new-directory>` is the supplied implementation's native packaging path. It requires a successful matching native build/generated-key receipt, complete native app leaf inventory, unchanged applied source/artwork/flags, and the current source-pinned boundary build with its actual pure mapping fixture result. Inventory-only boundary reports and old independent native builds do not satisfy these inputs.

The command clones the built native app into a private sibling, verifies every copied native resource/link/mode, assembles supplied resources without merging an existing `Resources/aux`, and adds the fixed carrier, boundary library and two guards. It moves the supplied CLI SEA to `aux-cli-sea` and installs the native pre-exec launcher as the plist-designated `aux-cli`. The launcher supplies the fixed boundary before the SEA starts and never creates runtime acceptance. Publication uses a fresh output directory, and failures remove only the private copy. Sources and installed apps are untouched. `package.json` records provenance and remaining gates; it remains unsigned and `productionReady:false`.

`scripts/sign-provided.mjs --package <candidate-directory> --policy <explicit-policy.json> --receipt <new-external-file>` performs the existing static signing planner/verification. The policy's `targets` list must specify exactly the changed app/helper bundles, CLI SEA and new boundary code with their actual pre-sign hashes and exhaustive entitlement decisions. It cannot add framework/runtime/original-addon signing targets. Add `--apply` to perform those explicit ad hoc signing operations. Receipt hashes connect the final signing changes to the native, composition and boundary inputs; the candidate's report updates only after the signing runner succeeds. No command installs, launches, grants permissions or makes an unverified candidate production-ready.

The CLI SEA's original hardened-runtime flag and JIT capabilities belong to the separately signed `aux-cli-sea`, with the same narrowly allowed DYLD boundary exception as the daemon. The new native CLI executable is signed by its enclosing CLI bundle. Original addons and runtime signatures remain unchanged. The actualv24 full browser/generated-key build and10797-resource/563-leaf package assembly passed, and the explicit11-target signing plan verified without signing. Integrationv26 is now applied with the recovered real prerender pipeline and preference corrections; its final compilation and a corrected role-specific CLI addon proof remain pending. The installed app is not yet replaced, and shared DP authority is blocked by the observed missing entitlement. Current receipts and limits are in STATUS.md.

### Explicit local development profile layout

`--development-dp-layout` opts into the separate three-host development-signing topology. It places the carrier in `native/Aux Native Carrier.app`, declares the supplied CLI SEA as its bundle main while preserving the fixed sibling launcher, and writes only the fixed `nativeCarrierLayout:"profile-bundle"` enum in `bundle.json`. The package report pins these plist/marker changes. No profiles are embedded and no signing occurs. This layout requires the matching compiled carrier resolver and the separate development-signing plan; the default ad hoc signer is incompatible. Ordinary packaging remains unchanged.
