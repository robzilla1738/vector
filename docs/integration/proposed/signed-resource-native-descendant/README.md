# Reuse exact signed Aux resources for a native-only descendant

`vendor/provided/reuse-development-authority.mjs` provides explicit `cache`, `plan`, `apply`, `verify`, and `handoff` modes. No mode performs Apple signing, provisioning, Keychain/authority calls, or product launch. Root authorized caching v527's signed resources while leaving its app untouched. Applying to a new copied package remains a separate explicit handoff.

The complete v527 signed `Contents/Resources/aux` tree can be reused **only** when the next freshly assembled resource tree exactly equals v527's actual pre-profile/pre-sign preparation inventory (every leaf, byte hash, mode, relative link). Require the same `finalApp` relocation path and the same native-boundary receipt. This refuses stale restored-password-manager code, new UI/assets, changed wrappers, recompiled native guards, or a different runtime installation seam. A native-only build can differ outside this supplied resource subtree.

Cache before replacing the fixed app path: the old full signing receipt binds that original path. `cache` validates the pinned successful old signing receipt, its exact nine-target metadata/capability/preservation proofs, joins its genuine existing-authority result, and verifies every copied signed Aux resource leaf. It deliberately scopes current filesystem validation to the reused resources, then copies the exact resource subtree with copy-on-write where available, hashes that complete private copy, and statically checks all eight retained nested signatures. The cache records both the unsigned baseline and signed final resources plus the actual parent helper signature proofs. It needs no old live app after success. Running user/account processes never supply source data; only bundled immutable code/resources are read.

`plan` compares the fresh package's resource tree against the cached **unsigned** baseline, and pins the new full native inventory. `apply` copies the cached signed tree into a separate temporary directory, verifies all retained signatures, preserves the fresh unsigned tree in its external review output, then replaces only the fresh app's resource subtree. It verifies the native build's framework/helper signatures without modifying them. An invalid native signature is an explicit blocker requiring its own reviewed repair; no blanket signing or arbitrary capability guessing occurs.

By default the only signature generated is an ad hoc **outer `Aux.app`** reseal, with the current empty-entitlement browser policy. Explicit reviewed native-bundle repair is described below. All supplied resources, Apple helper signatures/profiles, original addons, runtimes and memory payloads remain byte-identical. A derived receipt links the old verified helper/authority receipt hashes to the new native inventory. It says the authority proof is **inherited**, rather than falsely claiming a new Keychain verification.

## Explicit requests

```
node vendor/provided/reuse-development-authority.mjs cache CACHE_REQUEST.json
```

Cache request for current v527:

```json
{
  "signedReceiptPath":"/absolute/repository/out/current-local-authority-v527/signing-receipt.json",
  "signedReceiptSha256":"812c6f230b6322bb12a889ee383f2033981f9b907f4811faab51f76e15e012f6",
  "authorityReportPath":"/absolute/repository/out/current-local-authority-v527/authority-verify.json",
  "authorityReportSha256":"0be9d3b926532b22a5e7a49ba26fa3c5fd29922c9efca73f21e65c05c528444a",
  "inputPath":"/absolute/repository/out/current-local-authority-v527/inputs.json",
  "inputSha256":"1581e90967eb202813158235341c9861449c77782c171fec76716a8519bf8c5e",
  "output":"/absolute/repository/out/signed-aux-resources-v527"
}
```

It returns `cachePath,cacheSha256`. Once root finishes a fresh native-only package (same `--development-dp-layout`), `plan` request:

```json
{"cachePath":"RETURNED_PATH","cacheSha256":"RETURNED_SHA","packageRoot":"/absolute/new-completed-package","packageReportSha256":"FRESH_PACKAGE_REPORT_SHA","output":"/absolute/fresh-disjoint-review-directory"}
```

It returns `planPath,planSha256`. `apply` request requires those two fields plus `applyAuthorized:true`; this is the only mutating/signing mode and must target a stopped, newly completed copy handed over by root. It returns a derived `receiptPath,receiptSha256`. Failure leaves no success receipt; preserve the review backup and do not launch the incomplete copy.

`verify` takes that receipt path/SHA, rechecks the current complete native inventory, immutable cached resource tree and actual signatures. `handoff` additionally takes a fresh output JSON path and writes a launch command/environment for the same disposable profile. Root launches, not this module. The old `package.json.signed:false` remains the historical unsigned assembly record. The derived signed receipt is authoritative for the final copied app.

Four focused pure tests cover complete byte/mode/link/relocation equality, the narrow metadata ordering case below, exact native repair topology/capabilities/change boundaries, and no-authority/no-Apple-signing behavior. Actual cache/static signature checks are recorded separately. No normal-profile UI/AI success is manufactured by reuse.

The initial full-parent scan found that the old outer browser executable had extra hardlinks after runtime (nlink4; producer untraced); its bytes still match the signed receipt and all three authority executables remain private nlink1 and hash-identical. The cache does not inherit that outer binary. Resource-only validation therefore ignores the unrelated outer inode while preserving every original hash/mode/link check for the reused tree, strict private-copy checks, actual retained signatures and pinned historical signing proofs. The global full-app signing validator is unchanged.

Cache creation hashes the complete private copied tree once and compares it with the trusted signed inventory before verifying all eight retained signatures. Redundant pre/post source-content scans are omitted: any missing/extra/changed byte, mode or link in the actual reusable copy still fails, including a source change racing the copy. The source app is never mutated.

### Generated exclusion-list ordering

The first v529 plan correctly refused one differing leaf: `bundle.json` (v527 unsigned SHA `e1856ce80d203454bfb038688f46e35d583ab3b8b72ebc77129869f66079cccc`; v529 SHA `77f338098a3f8fa3aef030bac52e3db127db83d03c40d533cd6efb1c1a14410a`). All other fresh resource leaves matched. Parsing both documents proved the only semantic difference was the ordering of the same six `excludedFiles` records. This array describes the excluded password-importer files; those files remain absent.

The planner now admits only this metadata ordering difference: both parsed JSON documents must be identical after sorting `excludedFiles` by unique source path, and every record must have exactly the original source/SHA/reason fields. It verifies the bytes used for that comparison against both inventory hashes. Modes, links, added/removed records, changed record data, other JSON fields, and every other resource leaf still require exact equality. The plan and derived receipt retain both exact bundle hashes and the explicit order-equivalence proof. Application restores the entire exact signed resource tree, including its original bundle bytes; it does not rewrite signed helper content.

### Explicit native bundle repair after overlay

The actual v529 native framework and all eight Chromium helper apps have empty entitlements and `adhoc,linker-signed` flags. Strict bundle verification reports `code has no resources but signature indicates they must be present`. Initial apply therefore stopped after overlay, before any seal. The integrator explicitly approved preserving those empty capabilities while sealing the actual native bundles; the historical count of six did not describe this build's eight helpers.

`resume` accepts the original plan path/hash, `applyAuthorized:true`, and a `nativeSealReview` array. Each entry pins the exact actual bundle path, executable path/SHA, observed flags and empty entitlements. The only admitted topology is eight explicitly named Chromium helper apps followed by their versioned Aux Framework. The tool verifies the preserved fresh-resource backup, exact current signed overlay and unchanged native inventory against the original plan before proceeding. It does not recopy resources or repeat preparation.

For a fresh package whose linker-only native bundle policy is already explicitly reviewed, supply the same `nativeSealReview` directly to initial `apply`. Its topology, executable hashes, flags and empty capabilities are validated against the pinned plan before resource copying. Existing complete-package comparison, current executable observation, final allowlist and signature checks remain mandatory. This preferred path is `plan → apply → handoff`; it avoids deliberate failure and the resume-only backup revalidation. The final installation path must still match the cache even when the fresh candidate is assembled in a separate sibling directory.

Each reviewed native bundle is ad hoc signed and strict-verified inside out, then the outer app is sealed. Before signing, executable SHA/flags/entitlements are rechecked; after signing the flags must be exactly ad hoc and entitlements still empty. All native dylibs are verified without signing. Final inventory comparisons permit only the reviewed native executables and their exact generated signature directories, plus the outer app executable/signature directory. The derived receipt records every actual ad hoc target and preserves all eight cached Aux signatures and resource bytes. No `--deep`, Apple signing, Keychain operation or authority reset occurs.
