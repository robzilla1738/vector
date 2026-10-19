# Signing copied supplied packages

`scripts/lib/provided-signing.mjs` provides a reusable planner/runner for root's package assembly. It neither assembles an app nor changes the root packaging CLI. Only explicit **ad hoc** signing is supported. No Developer ID lookup, Keychain access, notarization, OS grant, supplied executable launch or blanket `codesign --deep` operation occurs.

## Integrator contract

```js
const plan = await planProvidedSigning({
  root: '/absolute/private/.assembling-UUID', // parent of the copied Aux.app
  sourceRoots: [/* all original static input roots, not the copied outputs */],
  targets: [
    {
      path: 'Aux.app/Contents/Resources/aux/libaux-native-boundary.dylib',
      kind: 'macho',
      sha256: '...explicit newly built artifact hash...',
      entitlements: {preserveKeys: [], removeKeys: []},
    },
    {
      path: 'Aux.app/Contents/Resources/aux/Aux Computer Use.app',
      kind: 'bundle',
      executable: 'Contents/MacOS/aux-computer-use',
      sha256: '...staged executable hash...',
      entitlements: {
        preserveKeys: [
          'com.apple.security.automation.apple-events',
          'com.apple.security.personal-information.addressbook',
        ],
        removeKeys: [],
      },
    },
    // Explicit daemon/CLI/importer/provider bundles and final outer Aux.app.
    // No runtime executables or unchanged original native dependencies here.
  ],
  verifyPreserved: [/* relative paths of original signed code/bundles to verify strictly */],
});
const preview = await runProvidedSigning(plan); // default verify-only; no signing
const result = await runProvidedSigning(plan, {mode: 'sign'}); // explicit mutation
```

Bundle hashes pin their designated executable; the full plan snapshot separately pins every other file, symlink and mode. Bundles must be `.app`, `.appex` or `.xpc` with a regular `Contents/Info.plist` naming the exact `Contents/MacOS/...` executable. Frameworks are inventoried/preserved, but **framework re-signing is unsupported**. New guard dylibs/carriers may be explicit `macho` targets. The sole permitted `.node` signing target name is `aux-native-guard.node`; original native addons, including `provided-native.node` and node-pty modules, cannot be targeted. Runtime payloads under `agent-runtime` or `distribution/runtime` and catalog payloads under `distribution/memory` cannot be targeted either.

Every actual changed executable needing its own signature must be listed. An app bundle signing operation also signs its designated main executable; do not add that executable separately unless the integrator intentionally needs both operations. A child must precede every enclosing bundle; the planner orders deepest paths first, loose code before same-depth bundles and the final outer app last. No target is inferred merely because it has Mach-O magic. Untargeted Mach-O bytes/signatures remain immutable.

`inspectProvidedSigningTree(root)` can inventory a candidate without signing: it returns canonical root, files (hash/type/mode or link target) and bundle paths. All file hashes stream from disk. The planner reads embedded signatures/entitlements and Info.plist using only static `codesign -d`/`plutil` commands.

## Safety and allowed differences

The absolute root must be a real directory and disjoint from every explicit source root. Supply **all** original roots, including the native browser seed/build copy. The module cannot infer an omitted source origin or prove a caller's assertion that a directory is a copy. It rejects hardlinked files anywhere in the copy, nonregular objects, and absolute/escaping/dangling symlinks; relative internal framework/runtime links are inventoried exactly. Paths must be package-relative and cannot traverse parents. No source directory is written.

Planning validates target hashes/types, bundle executable consistency, the entire copied tree and exhaustive entitlement decisions. It records a version1 plan digest. Running checks that digest and re-inventories/re-plans before mutation. Changed plans, code, resources, modes, links or entitlement metadata fail closed. `verifyPreserved` uses `codesign --verify --strict` before signing and again afterward; no recursive re-signing occurs.

Each signing command is explicitly `codesign --force --sign - --timestamp=none`, with its checked entitlement plist and original supported runtime flag. Existing hardened-runtime option is retained. Unknown signature flags fail rather than being silently discarded. New unsigned code is accepted only when static display reports exactly that it is unsigned.

Each signed target is strictly verified and its actual entitlements/runtime flag rechecked. The final full-tree comparison allows changes **only** to explicitly targeted executable bytes and a targeted bundle's `Contents/_CodeSignature/` files. Every original `.node`, runtime/model/catalog file, untouched native browser nested signature, ordinary resource, file mode and symlink must remain exact. Added signature files are recorded. Report includes before/output hashes for every changed path, signed target order and immutable file count.

This is an exclusive assembly operation, not a hostile concurrent filesystem defense. Root must own its private `.assembling-UUID` directory throughout. Any error after a signing command can leave a partially signed **copy**; discard that private assembly and start from a new copy. No rollback modifies source inputs, and no failed result is reported as acceptance.

## Entitlement policy

For each target, `preserveKeys` and `removeKeys` must partition **all** embedded entitlement keys, exactly once. Missing/unknown/duplicate decisions fail. Preservation accepts only explicit `com.apple.security.*` boolean capabilities; application groups, strings, arrays, original application/team IDs, Keychain groups and `com.apple.developer.*` claims cannot be retained by this ad hoc path. There is no mechanism to invent a capability or rebind a restricted team claim. A fully removed entitlement dictionary is still explicitly written as an empty dictionary, rather than relying on implicit codesign metadata behavior.

The following is the observed actual staged input inventory at `web/out/provided-reuse` on 2026-10-19. These are **static distribution entitlements**, not a read of any owner's Keychain or grant database:

| Bundle | Explicit capabilities eligible for preservation | Keys requiring removal for ad hoc Aux |
| --- | --- | --- |
| Aux Daemon.app and Aux CLI.app | `com.apple.security.cs.allow-jit`, `com.apple.security.cs.allow-unsigned-executable-memory`, `com.apple.security.cs.disable-library-validation` | `com.apple.application-identifier`, `com.apple.developer.team-identifier`, `keychain-access-groups` |
| Aux Password Importer.app | `com.apple.security.app-sandbox`, `com.apple.security.network.client` | `com.apple.application-identifier`, `com.apple.developer.authentication-services.autofill-credential-provider`, `com.apple.developer.team-identifier`, `keychain-access-groups` |
| nested credential-provider appex (direct executable display) | `com.apple.security.app-sandbox` | same four restricted keys as importer |
| Aux Computer Use.app | `com.apple.security.automation.apple-events`, `com.apple.security.personal-information.addressbook` | none |

These tables describe observed keys; they do not auto-select policy. Root must explicitly choose every preservation/removal. Retaining a helper usage capability does not grant macOS permission. Removing original Keychain/team/autofill claims intentionally does **not** fabricate working restricted credential exchange. Actual runtime behavior must remain truthfully unavailable where the ad hoc identity cannot support it.

Daemon/CLI source code signatures have the hardened-runtime flag; preserve it. Native browser flags/entitlements must be inspected from the actual copied build rather than assumed from this table. Guard artifacts were not yet supplied when this module was authored; do not infer entitlements for them.

## Observed copy layout and integration finding

A full static scan of `web/out/provided-reuse` found 10,785 files/links, ten relative internal symlinks, and five nested-code bundles:

1. `apps/cli/Aux CLI.app`
2. `apps/daemon/Aux Daemon.app`
3. daemon's `Contents/Applications/Aux Password Importer.app`
4. importer's `Contents/PlugIns/AsidePasswordImporterProvider.appex`
5. `computer-use/Aux Computer Use.app`

The numerous native runtime executables/dylibs/Python modules and memory executable are preserved, alongside the two original provided-native.node binaries and both architectures of node-pty. They are not signing targets. Full canonical runtime/memory preservation remains checked by root's distribution manifests; signing additionally proves those copied bytes stay unchanged.

The audit found a real provider bundle mismatch: its staged file was `Contents/MacOS/aux-password-importer-provider` but Info.plist still declared `aside-password-importer-provider`. Bundle display reported unsigned because the declared file was absent, while direct executable display exposed the actual original signature. Root was notified to correct the exact executable plist anchor during staging; the planner rejects this inconsistent bundle until corrected. The provider's compiled principal class/module names must remain internally consistent.

## Verification and limits

Focused tests compile tiny **original test fixtures**, never run them, and exercise actual ad hoc signing on disposable copies. They verify nested order, exhaustive entitlement filtering, hardened-runtime preservation, strict signatures, immutable native/runtime/catalog bytes, unchanged baseline fixture code and the default no-sign mode. Negative cases cover source overlap, bad hash, protected `.node`, incomplete/forbidden entitlement policies, non-Mach-O targets, traversal, modified plan/copy, escaping symlinks and hardlinks. Fixture directories are removed.

No supplied source/candidate was signed or executed by this lane. The actual supplied stage was only inventoried and its embedded signatures statically displayed. Root owns actual copied assembly/signing and runtime acceptance. Both planner and successful runner reports retain `productionReady:false`; signature validity alone does not establish UI fidelity, helper/TCC behavior, Keychain isolation or native import support.
