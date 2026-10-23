# Inactive ES observer actual syntax/link check

Single serialized session `40009` completed with exit0. Actual unchanged `AuxEsDescendantObserver.cc` compiled and linked against the pinned installed macOS27 SDK, libEndpointSecurity and libbsm with Xcode C++20, Blocks and exceptions. Artifact SHA-256 `ea2bdec609846287415a7560c295e7129dce196ffd4d7300f8c48a43a3e682f4`, 198216 bytes; arm64 Mach-O dynamic library, deployment target13.0/SDK27.0. Source availability guard remains responsible for refusing the macOS27-only API on older hosts.

This is syntax/link acceptance only, not invocation, Chromium rollout/style acceptance, entitlement qualification or behavior testing. No library was loaded, ES client/factory called, process observed, entitlement added or signing performed. `-no_adhoc_codesign` produced no LC_CODE_SIGNATURE command. The actual import table includes es_new_descendants_client/subscription/deletion and libbsm identity functions; no replacement event producer is linked. No observer source correction was needed. No product/shared GN/native checkout registration or activation occurred.

The event cache still provides neither a genuine initial subtree census nor a final delivery/closure barrier. Empty cache does not mean drained. Existing callbacks, default muting and potentially missing final messages remain runtime/integration obligations. Do not activate the observer or require ES based on this compile receipt.

`check.py` is the exact bounded recipe and refuses an existing output. Evidence contains compiler/link log, exact input/command receipt and public Mach-O metadata. `verify.py` authenticates those files without running native code. The generated unsigned dylib remains an external compile artifact only.
