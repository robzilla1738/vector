# Browser source integration

Inactive local integration, preserving the accepted application and all UI files.

`compose.py` replays the existing browser-root transport, early Local State
provenance, and final NetworkContext cache-path proposals in that order into a
fresh scratch directory. Each phase checks exact input hashes before applying
its patch; the final cache phase also checks exact output hashes. The two cache
validator files are explicit pinned additions. All 18 resulting files were
composed successfully from the current shared Chromium baseline. Original
shared files were unchanged. This composition does not enable the cold feature.

`compile-composed.py` checked the previously unchecked actual
`chrome_browser_main.cc` translation unit against all composed headers, with
`AUX_SEALED_NATIVE_COLD_ENTRY=1` only for that isolated object. It passed with no
diagnostics. The compiler, target flags, module file, overlay files and resulting
object are pinned in `evidence/browser-main.json`. This check exercises the real
browser startup caller rather than substituting fixture declarations.

The initial composed tree is `/private/tmp/aux-browser-composed-20261023/source`.
The isolated object is
`/private/tmp/aux-browser-composed-compile-20261023/browser-main.o`.

## Remaining full-browser acceptance

The new `ContentBrowserClient::CanCreateNetworkContext` virtual method changes
the native class vtable. Linking only the individually checked translation
units with the existing warm objects would not be a coherent full-browser
verification. The real GN/Ninja dependency graph must rebuild affected callers
and derived-class/vtable producers before full linking. This has not been run;
the shared Chromium checkout includes existing owner changes and is untouched.
A cold-enabled build also requires a consistent define across the relevant
targets, paired exact daemon/module/policy inputs and completed authorization.

No browser or protected daemon was launched, no UI screenshot comparison was
performed, and no profile, Keychain or other owner data was read. These receipts
establish source composition and one genuine native integration compilation,
not working protected startup, cache race closure, complete writer custody,
visual/runtime acceptance, signing or release readiness. The accepted app
remains the current preview; this lane does not replace or relabel it.
