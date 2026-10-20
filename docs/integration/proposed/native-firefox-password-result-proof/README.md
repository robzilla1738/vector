# Original Firefox password result producer

Bounded evidence-only follow-up to the actual preparation-hook port. This corrects the earlier shorthand “two password flags” in the public-owner finding: the original host stores an **optional result payload**, not merely two interchangeable booleans. No independent success surrogate or partial stock-host completion patch is proposed.

## Positive producer and ordering

Original actual ExternalProcessImporterClient constructor `781d55c` receives the real host WeakPtr and stores it at original client+c0/c8. Its original bridge is stored at+160, and cancellation is initialized at+168. The exact constructor is pinned, so the following writes are tied to the actual host, not guessed from another object's coincidentally similar offsets.

The native result-input entry `4105cd8` has the concrete argument shape `(this, bool, uint32)`. If the client is not cancelled, it marks received+169, stores the supplied bool at+16a and the supplied32-bit count at+16c. The precise original public C++/Mojo method name and utility-side sender have not yet been recovered; this proof does not invent either.

Final completion `4105eec` ignores cancelled clients, clears its real pending flag+170 and validates the actual host WeakPtr. At `4105f40..60` it:

1. Takes this completion's supplied bool argument as the low32 bits.
2. Takes the retained native32-bit count from client+16c as the high32 bits.
3. Writes this8-byte payload to actual host+114.
4. Sets host+11c engaged=true, preserving engagement if already set.
5. Only then emits the actual PASSWORDS item-ended notifications (`4105f64..80`, item8), followed by further real settlement.

The matching concrete branches `4105b04..58` and `4105bac..bf0` publish false with the real decoded-row count, or true with zero, before notifying item8. The count's integer source/width is proven. Its exact public semantic name is deliberately left “count” until its remote producer is recovered; it is not asserted to be a count of committed destination writes merely from this packing code.

Observer `42648b0` consequently reads engagement+11c and bool+114 while handling ImportItemEnded(PASSWORDS). This is how the original owner can distinguish actual password success from an ordinary host End. The count is available on the host but is not consumed by that particular observer. A typed155 adaptation can preserve an `optional` payload with bool and uint32 count without copying original ABI offsets. It must be populated from the real callback/result path, never initialized as success or inferred from a row list being empty.

## Exact next implementation boundary

The retained155 ExternalProcessImporterClient lacks this input/result/pending settlement path, and its Mojo observer contract does not currently expose the original `(bool,uint32)` result input. Its Mac utility Firefox password import is disabled, as pinned in the preceding owner proof. Therefore porting only a host result setter/getter would leave an unproduced result and cannot enable full Firefox success.

The next bounded source entrypoints are now concrete:

- Client result input: **4105cd8**.
- Client actual destination/form write entry: **4105c18**, with actual calls4098b6c,7822200,41067e4/4106008 on its positive branches. Their full typed ownership/utility linkage remains to be recovered before choosing an equivalent155 API.
- Client final password completion: **4105eec**.
- Native row/result-to-item-ended branches: **4105b04** and **4105bac**.
- Actual result consumer: **42648b0**, then full settlement42648ec.
- Genuine host/utility seam remains original ExternalProcessImporterHost constructor7820514 / Start4106178 / Launch4106480; the latter's preparation gate has been ported separately.

Static source availability: the complete authorized original arm64 thin binary is hash-pinned in source-evidence.json, so every entry above is available for bounded LLVM/raw analysis. Current155 client sources are copied/hash-pinned under evidence/current155. The supplied decompiled04260740.c is the **cookies** worker; it must not be mislabeled as the password utility. A recovered original Mac NSS/password utility entry, its result sender and original schema name are still explicit prerequisites. No packaged source file is claimed available when only the static binary body has been identified.

`verify.py` passes five exact original range/listing hashes, the original thin hash and both current155 client source hashes. No native changes, build, source profile/DB/NSS/Keychain/OS operation or runtime execution occurred. As requested, this closes the bounded result-recovery checkpoint; full Firefox behavior remains pending its genuine caller/worker/destination prerequisites.
