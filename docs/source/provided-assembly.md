# Supplied resource assembly

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

Next packaging steps require the compiled native integration, fixed guarded binding beside each supplied addon, the carrier/interposer and memory bootstrap. Original `provided-native.node`, catalog binaries and bundled runtime bytes/signatures must remain intact. Use the explicit [signing planner](provided-signing.md) for changed/new code and enclosing bundles; never recursively re-sign all nested code. The historical `package-aux.mjs` still builds independent components and is not the producer for this assembled tree.
