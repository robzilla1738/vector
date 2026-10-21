# Exact reviewed daemon cache refresh

`vendor/provided/refresh-vault-exclusion-cache.mjs` is a separate copy-only utility. It does not edit historical signing/reuse validators or their pinned source files. It is bound to signing receipt SHA751bcfbb4a6ff5279d4517e4775b3b45b4484e1f3bb1c687ac005d6549b82ceb and approved code/binary/seed bytes.

The integrator first stages/packages the new production adapter, then provides:

```js
refreshVaultExclusionCache({
  cachePath, cacheSha256,                    // original exact eight-helper cache
  signedReceiptPath, signedReceiptSha256,    // exact approved new daemon receipt
  packageRoot, packageReportSha256,          // fresh unsigned current package
  originalDaemonPath,                       // pinned original1852 static executable
  resourceReview,                          // explicit before/after hashes for allowed UI/provenance leaves
  output,                                  // fresh project out/ directory
})
```

The unsigned resource inventory must equal the original baseline plus only the exact production-generated daemon executable, exact disabled seed and explicitly reviewed metadata/UI hashes. Existing reviewedUiResourceInventory retains its narrow allowlist. Any additional difference fails rather than being silently admitted.

The signed daemon bundle must exactly match its receipt; only executable, seed and CodeResources may differ from the original cached daemon. All other daemon leaves (including the nested guard), embedded profile, entitlements, flags, team and certificate are verified unchanged. All eight helper signatures are checked before/after the copy. Seven helper proofs remain byte-identical to the original cache.

The new cache includes resourceSigningLineage naming both original cache and actual new signing receipt, original proofs, fresh package hash and changed daemon proof. It explicitly states that the compatibility field parentFinalProofs now holds seven inherited proofs plus the new daemon proof, rather than falsely attributing that daemon to the old receipt. Historical parent receipt/authority fields continue to identify original installation-authority evidence. The refresh itself performs no Apple signing; earlier daemon signing is explicitly recorded as true. No new runtime authority result is claimed.

The existing reuse planner can then consume the new cache and this exact unsigned package with an empty UI review, because the reviewed resource changes are already part of its new baseline. Do not run the old cache constructor on the new daemon or overwrite the old cache. Integrator owns invocation and post-copy launch verification.

Lane validation: production adapter output matches approved sourceSHA d5133e910653114e22484906ac524dacf449d6fc69f20837c610207f9ba6f465; seedSHA09732935b6f0b54ce75c5fbe3956c9f88681c4c5e3362093aed8be96e09ba3f7. Utility parses successfully; no actual cache refresh, signing or runtime was performed in this lane.
