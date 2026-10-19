# Preserve each supplied original native addon

A static copied-input check found an actual packaging gap: CLI1.26.1015's supplied provided-native.node is SHA66368b6846d2842a5ee0ba3d5c6d5d094fd40098d7819dbb63ef17600c85c3fc, while daemon1.26.1016.1852's is bfe946e05fbaf2ae68d0560258f50e63a6c3ff6da2937e0aa8f9f19016e1f7fb. The previous CJS guard accepted only the daemon hash. Earlier CLI SEA registration proofs copied the daemon addon into the CLI proof bundle; they did **not** prove the packaged original CLI addon. Those historical results must not be reclassified.

## Static evidence

Both exact immutable addons export NAPI registration and the original AsideNativeRun/Free C boundary. Their node_api_module_get_api_version_v1 instructions both return8. Neither has direct undefined node::/v8:: ABI symbols. Their inspected Security import sets and71 CryptoKit import symbols match. Both include their original secureStorageBaseQuery/installBaseQuery, no-argument installation/status/public functions, and the original group/scheme literal families. static-inventory.json records exact files/hashes/symbols/imports without loading either binary.

The actual CLI SEA source SHA013dbd114ac574df1e4c72f53fd438d4b7da4d2aebbf3c45fa22a6fb2fe1dd62 calls its original run binding for cdp-sign with the supplied base64 input bytes. It has no install-init call. Its native-helper wrapper defaults to empty input and parses the original JSON response. Registration, full query coverage, original format compatibility and shared OS DP authority still require their separate bounded proofs; matching imports alone do not establish those behaviors.

## Small integration correction

- native-role-pins.cjs maps only the two fixed canonical bundle-native suffixes to their distinct exact original hashes. No environment/module override, arbitrary addon allowlist or role fallback exists. A daemon/CLI addon swap refuses.
- aux-native.cjs still prepares the imported-pointer/immutable-home scope guard first, then verifies the original addon against the actual canonical bundle role before require. It preserves original exports unchanged. Load-only metadata reports the public binding role.
- The compiled node-boundary-guard does not contain the old daemon-only hash. It needs no semantic broadening; actual registration must still pass its same deny-all/pointer/scope checks.
- Both dedicated unchanged-Node and real SEA proof tools now select each role's actual addon, stage the fixed role directory and require matching role metadata in main/worker results. The SEA report records per-host/per-role binding hashes. No proof was run by this slice.
- Future approval staging now copies the actual CLI addon into the CLI host, while the carrier remains deliberately pinned to the daemon original. The already approved preview/artifacts/home are untouched. Different diagnostic bytes require explicit root review/approval handling.

## Root seams and receipts

Apply root-stager-role-helper.patch (exact two list anchors/source pins in root-hook-provenance.json) so daemon and CLI both receive native-role-pins.cjs. The packaging manifest adds that file to boundary source provenance and reports both immutable role hashes. The existing source-matching boundary receipt is intentionally stale after these CJS source changes; root must review and refresh via the serialized boundary build/receipt workflow before staging/proof acceptance. No duplicate build is queued.

After root integration/fresh receipt, use the corrected dedicated proof with its optional fourth role argument cli, and the corrected SEA proof for both actual roles. Root owns any authorized disposable ad hoc host signing and execution. Only deny-all registration is requested at this stage: no original run/PDF command, installation/DP operation, private-key/development signing, provisioning or grants. Successful registration would still not prove shared DP signing authority.

The separate development-signing preparer draft remains blocked and uncommitted pending this original CLI correction. Its first preparation attempt refused the mismatched CLI pin instead of replacing the addon. No original addon bytes were modified or substituted.
