# Conditional profile-bearing carrier resolver

One-source proposal against actual appliedv27 `chrome/browser/aux/installation_auth.cc`. Stagedv29 does not modify that file. `fix.patch` + `manifest.json` preserve existing default carrier behavior and select a second **fixed** path only through explicit packaged metadata. Temporary patch replay matches the exact output hash; no shared source write, native build, carrier execution or private-state operation occurred.

BundlePaths::FromBrowserExecutable currently derives `<browser Contents>/Resources/aux` and fixed component paths; it does not load bundle.json. The supplied resource assembler writes its actual report at `<root>/bundle.json`. Root's explicit `package-provided.mjs --development-dp-layout` now writes `nativeCarrierLayout:"profile-bundle"` there and assembles the carrier's CFBundleInfo/main executable. Packaging defaults remain unchanged.

| Metadata condition | Resolver outcome |
| --- | --- |
| bundle.json genuinely missing (FILE_ERROR_NOT_FOUND, not a dangling link) | Existing `native/aux-native-carrier` |
| Valid JSON object, field absent | Existing `native/aux-native-carrier` |
| Field exactly string `profile-bundle` | Only `native/Aux Native Carrier.app/Contents/MacOS/aux-native-carrier` |
| Any other string, null, boolean, number, array or object field | Refuse; no fallback |
| Existing unreadable, malformed, non-object, oversized or unsafe metadata | Refuse; no fallback |
| Selected executable absent or unsafe | Refuse; no fallback |

The metadata read is bounded to16MiB; current supplied candidate/resource reports inspected as static build artifacts are approximately3.95MiB. The existing canonical-root confinement and non-group/world-writable file checks apply to the metadata and selected executable. There is no arbitrary executable path, environment selector, alternate default or permission/success substitute. A missing/unreadable boundary dylib or original native binding still refuses the same operation.

`AUX_ENABLE_PROVIDED_NATIVE_CARRIER=1` remains necessary. The actual command inputs, supplied authentication labels, socket transport, HOME/AUX_HOME, boundary dylib, original binding, process lifetime, timeout and signature verification are unchanged. No Team ID, Keychain group, profile, entitlement or cryptographic material is embedded. Selecting the app layout is not proof of a usable shared authority or successful signing/authentication.

Actual C++ compilation and disposable resolver/carrier acceptance remain pending the root build boundary and separate human-approved authority scope. Review source pins and strict JSON/type/file guards before integrating. No actual DP or owner data test is authorized or performed here.
