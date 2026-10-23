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

## Fresh v7 authorization integration

The next exact overlay applies `startup/pre-read.patch` to the composed early
feature-list source and replaces the selected-home, owned-child, transport,
wire and prepared-authority headers/implementations with the startup lane's
v7 successor. Shared native headers are copied unchanged into the scratch
include directory so quoted includes resolve the paired successor types rather
than stale shared-tree siblings. The scratch compiler defines the cold feature;
the ordinary application configuration is unchanged.

`compile-authorized.py` passed all six actual changed integration units:
Chromium peer transport, selected-home, owned-child, feature-list, browser-main
and daemon peer transport. `evidence/authorized-native.json` pins every overlay
and input, compiler command, result and output hash. No compiler correction was
needed. The real feature-list caller now requests fresh retained Owner authority
before resolving or reading Local State, but this compilation is not evidence
of a live grant, retained-service behavior, early event-loop availability or
existing-profile/resume authorization.

The daemon parent bridge is separately recompiled against the same successor
transport/wire graph by `compile-bridge.py`; it stages its matching historical
bridge header beside the source and selects the new transport headers first.
Its receipt is recorded separately. These exact daemon objects can be used by
the integrator's new full daemon link. A successful daemon link still does not
establish a linked Chromium candidate or real-app acceptance.

The initial six-unit graph passed, then startup review identified a real
registration race: selected home could be consumed before authority registration.
The final transport leaves it pending until that actual registration arrives.
Only the Chromium and daemon transport units were recompiled after this one-file
correction; both passed. `compile-transport-final.py` verifies the prior overlay
and that no other startup source changed, then records this successor separately
in `evidence/final-transport.json`. The earlier six-unit receipt is historical;
use the final transport objects when linking. The unchanged paired daemon bridge
passed before that correction; its exact matching source/header evidence is in
`evidence/daemon-bridge.json`. No repeated broad check was run.

Final daemon inputs for integrator:
- `/private/tmp/aux-browser-final-transport-20261023/daemon-transport.o`
- `/private/tmp/aux-browser-authorized-bridge-20261023/daemon-parent-bridge.o`

Final browser transport:
`/private/tmp/aux-browser-final-transport-20261023/chromium-AuxNativePeerTransport.o`.
The four initial non-transport objects and separate bridge retain their unchanged hashes;
no stale transport is substituted into the final daemon link.
