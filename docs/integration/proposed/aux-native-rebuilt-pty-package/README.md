# Exact unsigned daemon and rebuilt PTY package

This successor packages the actual v4-policy native daemon and the retained rebuilt arm64 PTY module together, inside the existing assembler's private transaction. It preserves the supplied spawn-helper bytes, the ordinary refused state2 entry and the two fixed dormant native resources. It changes no Agent UI, CSS or artwork and never mutates the accepted app.

`source/package.mjs` exports:

- `verifyRebuiltPtyPackageInput({repositoryRoot, receiptPath, compositionBytes, stage})`: verifies the finite pinned build graph, exact successful v4 link receipt, historical compile/link and corrected metadata evidence, actual module receipt and retained unsigned artifacts. It returns an opaque preflight object tied to this module instance.
- `replaceCopiedDaemonAndPty({resources, assembled, evidence, repositoryRoot})`: requires that preflight and the existing checked `aux-v1`, state2, `provided-node-development` assembly. It replaces exactly one daemon executable leaf and one arm64 `pty.node` leaf; records their old/new hashes; keeps the exact original helper and ordinary index; and adds exactly the two existing reviewed native-entry projections. All inputs are checked before mutation. The existing assembler owns rollback of this private tree on failure.

The integrator adds a separate `--native-pty-receipt` package option. It must be mutually exclusive with `--native-main-receipt` and the development DP layout. Run preflight before assembly, call replacement after checked resource assembly in the same private transaction, and record its returned report as `nativePtyReplacement` in the outer package report. Do not call the old `addDormantCurrentNativeEntry`: it pins a different historical daemon. This helper reuses `currentNativeEntryResources` directly with unchanged exact projections.

The earlier coherent v3 build's `initial-results.json` remains failed: compilation and full linking succeeded, but its gate incorrectly required four linker-localized Swift definitions to be externally visible. Its separate corrected metadata receipt checks the actual exports and internal definitions. Neither receipt is relabeled. The v4 successor receives its own successful build receipt, retained in this manifest alongside that history.

Packaging is not activation. The policy parser's v4 support does not create or accept a signed policy. No signed module, signature bypass, startup authority, cold hook, protected Keychain call, execution, runtime custody proof or final release is supplied here. The default-off state2 refusal remains. Actual signed/installed runtime and UI acceptance are still required before replacing the accepted app. No signing or runtime check is performed by this helper.

## Actual root assembly

Root integrated the exclusive CLI option and private transaction into the maintained assembler. Actual session94762 ended0 and published `out/provided-candidate-aux-rebuilt-pty-v4/Aux.app`,10766 supplied resources and418 native leaves. `evidence/actual-package.json` binds the observed package/bundle hashes and directly hashed native outputs. Compared with the preceding paired candidate, exactly two resource hashes changed; all1217 Agent files (five CSS), original spawn helper, ordinary index and both dormant entry resources match. This is static package evidence only. No app/module was run or signed and the accepted app remains untouched.
