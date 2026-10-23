# Genuine Swift runtime link configuration for the narrow parent module

Actual browser91150 compiled the parent Swift module and53 steps, then `auth_scheme_probe`'s real C++/lld link reported Swift runtime/Foundation/Darwin symbols unresolved. The three real Swift objects already contain their `LC_LINKER_OPTION` runtime/framework autolinks, but the narrow source-set did not propagate Apple Swift's Mac runtime search/compatibility inputs to its C++ final consumers. Removing authentication or allowing undefined lookup would conceal that missing link dependency.

`driver-evidence.json` records a **print-only** invocation of the actual Apple Swift driver against those three object files and SDK27/target13.0. No compiler/linker job was executed by that invocation. The driver supplies:

* Toolchain `usr/lib/swift/macosx` and SDK `usr/lib/swift` library search directories.
* Exact toolchain `libswiftCompatibilityPacks.a` archive.
* `/usr/lib/swift` runtime rpath.

The evidence also retains each actual object's hash and complete Mach-O autolink options.19 referenced Swift libraries/archives resolve under those exact toolchain/SDK directories and are pinned in inputs.json. This is actual binary metadata, not a guessed list of Swift library names. System framework and runtime behavior remain unexecuted.

The only native change is `native_peer_policy/BUILD.gn`: import the existing mac_sdk.gni; derive the same SDK-sibling default Swift toolchain used by swiftc.py when no explicit toolchain is selected; declare the finite runtime link config; and propagate it with `all_dependent_configs` from the narrow Swift target to every final consumer. The existing three Swift source files, compiler flags/module/SDK, C wrappers and authentication are untouched. The config retains object autolinking and strict undefined-symbol policy; no `dynamic_lookup`, export workaround, hand-written symbol definition or warning suppression is introduced. The library path contains the exact CompatibilityPacks archive as the genuine driver requires; GN's normal library placement keeps it among final link inputs.

`check-link.py` is a bounded actual module-to-executable link recipe. It preserves the genuine failed Chromium linker_driver/clang++/lld prefix, strict autolink/fatal-warnings/SDK/target and the three compiled Swift objects. A trivial C entry is only a link anchor and is **never executed**. `-u` requires both real parent C wrappers so dead-strip cannot hide their implementation dependencies. The recipe adds precisely the driver-derived runtime paths/archive/rpath, not a protected runtime/provider/Node graph. It compiles only that C entry and links the three existing module objects; no Swift object, browser or daemon is rebuilt.

Default invocation with fresh external `--output` prepares only. Root can add `--execute` under native-build serialization to perform the two bounded compiler/link steps, before resuming the actual framework link. The native GN must be the exact reviewed baseline or exact successor and remain unchanged during the check; its observed hash is recorded. Both configurations are accepted only for source/link testing, not as an authority/activation flag. The future whole framework link validates genuine transitive GN propagation; this isolated recipe alone does not.

Source, object, real toolchain/SDK library, captured driver metadata and Python syntax checks passed. No link test, module load, native call, Security/Keychain operation, signing tool or executable run occurred in this lane. All previously compiled objects, failure receipts, policies, accepted UI, native checkout and STATUS remain untouched.

## Root actual check

Actual serialized check14125 passed both compiler/linker steps against the three real parent objects. Both C wrappers were explicitly retained; the output was not run. Receipt and logs are under `evidence/`. The one-file GN correction was then composed/applied with854 verified source/artwork targets; actual full browser resume18769 remains separate and pending. No runtime or accepted-app claim follows from the bounded link result.

Actual whole browser18769 subsequently passed32 incremental steps in4m24.74s, including the real authentication-probe/framework/app/helper final links and library verification. The builder inventoried three artifacts and passed its generated synthetic-key probe. `evidence/actual-browser-build.json` records exact source/artwork/artifact hashes. No app launch, protected startup, signing or accepted-app replacement occurred.
