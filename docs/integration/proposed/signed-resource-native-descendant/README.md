# Reuse exact signed Aux resources for a native-only descendant

`vendor/provided/reuse-development-authority.mjs` provides explicit `cache`, `plan`, `apply`, `verify`, and `handoff` modes. No mode performs Apple signing, provisioning, Keychain/authority calls, or product launch. Root authorized caching v527's signed resources while leaving its app untouched. Applying to a new copied package remains a separate explicit handoff.

The complete v527 signed `Contents/Resources/aux` tree can be reused **only** when the next freshly assembled resource tree exactly equals v527's actual pre-profile/pre-sign preparation inventory (every leaf, byte hash, mode, relative link). Require the same `finalApp` relocation path and the same native-boundary receipt. This refuses stale restored-password-manager code, new UI/assets, changed wrappers, recompiled native guards, or a different runtime installation seam. A native-only build can differ outside this supplied resource subtree.

Cache before replacing the fixed app path: the old full signing receipt binds that original path. `cache` validates the pinned successful old signing receipt, its exact nine-target metadata/capability/preservation proofs, joins its genuine existing-authority result, and verifies every actual signed Aux resource leaf. It deliberately scopes current filesystem validation to the reused resources, then copies the exact resource subtree with copy-on-write where available, rehashes source/copy, and statically checks all eight retained nested signatures. The cache records both the unsigned baseline and signed final resources plus the actual parent helper signature proofs. It needs no old live app after success. Running user/account processes never supply source data; only bundled immutable code/resources are read.

`plan` compares the fresh package's resource tree against the cached **unsigned** baseline, and pins the new full native inventory. `apply` copies the cached signed tree into a separate temporary directory, verifies all retained signatures, preserves the fresh unsigned tree in its external review output, then replaces only the fresh app's resource subtree. It verifies the native build's framework/helper signatures without modifying them. An invalid native signature is an explicit blocker requiring its own reviewed repair; no blanket signing or arbitrary capability guessing occurs.

The only signature generated is an ad hoc **outer `Aux.app`** reseal, with the current empty-entitlement browser policy. The tool proves that this reseal changed only the outer app's main Mach-O/signature directory. All supplied resources, Apple helper signatures/profiles, original addons, runtimes and memory payloads remain byte-identical. A derived receipt links the old verified helper/authority receipt hashes to the new native inventory. It says the authority proof is **inherited**, rather than falsely claiming a new Keychain verification.

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

Two focused pure tests cover complete byte/mode/link/relocation equality, no-authority/no-Apple-signing behavior, and only-outer-signature scope. Actual cache/static signature checks will be recorded separately. No normal-profile UI/AI success is manufactured by reuse.

The initial full-parent scan found that macOS/runtime had added hardlinks to the old outer browser executable (nlink4); its bytes still match the signed receipt and all three authority executables remain private nlink1 and hash-identical. The cache does not inherit that outer binary. Resource-only validation therefore ignores the unrelated outer inode while preserving every original hash/mode/link check for the reused tree, strict private-copy checks, actual retained signatures and pinned historical signing proofs. The global full-app signing validator is unchanged.
