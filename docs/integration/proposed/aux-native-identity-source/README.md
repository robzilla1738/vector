# Exact native addon source inventory — 2026-10-22

Read-only parallel audit of authorized static inputs. No addon execution, owner state, Keychain, signing or new large reverse-engineering job.

The current recovered C++ collection supplies decompiled Chromium UI functions, not a rebuildable implementation of the native installation/credential addon. The actual source inventory reports2,454 C/C++ files,2,392 target functions in31 Chromium UI units, zero Swift/Rust files and no addon build descriptions. The81 native files in `AI Blueprints/06` are upstream Chromium UI. Targeted source searches found no implementation of `AsideNativeRun`, `AsideNativeFree`, `install-init`, `dk-unwrap`, `secure-store` or the installation derivation domains. A diagnostic strings listing mentions these operations, but does not implement them. Installed static packages provide binaries without the corresponding Swift project.

Exact frozen original role binaries:

| Role | Bytes | SHA256 |
| --- | ---: | --- |
| Daemon | 9255280 | `bfe946e05fbaf2ae68d0560258f50e63a6c3ff6da2937e0aa8f9f19016e1f7fb` |
| CLI | 9246656 | `66368b6846d2842a5ee0ba3d5c6d5d094fd40098d7819dbb63ef17600c85c3fc` |

These are distinct supplied role binaries; the second hash is not evidence of an Aux role transformation. They contain exported function names, installation selectors, product identities and original cryptographic/group semantics. The existing carrier's `dlsym` and scoped query mapper depend on those contracts. A renamed filename or shim retaining them does not satisfy the complete identity requirement.

Next work must recover the exact addon operations or obtain their original project, then make a reviewed native identity/format migration that preserves the actual private authority, DP/enclave/PQ behavior and explicit version selection. Blind ASCII substitution cannot establish that result. The pure Aux v2 crypto and preference/provider migration helpers already prepared do not implement the native transaction or prove native cryptographic acceptance.

No claim that full original source recovery is impossible is made: this inventory establishes that the currently inspected authorized source trees do not contain a rebuildable addon implementation. Targeted further recovery remains possible and must be distinguished from the complete recovered Chromium UI collection. No substitution of a new crypto backend or downgrade is authorized or implemented by this inventory.
