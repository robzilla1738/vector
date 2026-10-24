# Native CLI open — complete build/interface handoff

This finishes source/build defects found before compiler handoff. It preserves accepted UI/style and prepares the actual narrow `aux open` path. No native checkout/GN mutation, compiler/linker execution, OS authentication, owner/profile access, product launch, signing or runtime acceptance occurred here.

## Concrete fixes

The native frontend is now explicitly Objective-C++ (`AuxNativeCliFrontend.mm`). Its genuine supplied `packaged-identity-admission.h` imports Foundation and cannot be compiled as ordinary C++. The typed SDK plan passes `-x objective-c++`, ARC and blocks explicitly for this unit. Its standalone main also owns a real autorelease pool. Other SDK common units remain ordinary C++20. A deprecated volatile compound-assignment pattern in the signal handler is replaced with the same finite signal-mask behavior using simple volatile assignment.

The old installation-wide marker no longer blocks the independent native browser command. Marker checks remain inside the still-refused browser-owned Node child and broad installation/account branches; ordinary SEA/account/provider ownership remains quarantined. Native open never starts Node, reads a mutable home, creates an installation provider, sends environment/API tokens or delegates installation/browser storage roots. It still requires exact signed CLI/browser identities and private audited IPC, genuine browser startup admission, the actual loaded Profile/window and one-time real LocalAuthentication approval. A marker never grants native Profile authority.

The Framework cannot directly link the private primary-executable ES engine. A new narrow header is exported through the existing headers-only descendant client target. It calls one separate finite main-image export with the same `RTLD_MAIN_ONLY` pattern as the existing custody client. The sole engine definition remains in the primary executable; positive observations return managed, all missing/other results remain unknown. There is no dylib/plugin/environment callback search or free-profile result. `AuxBrowserDescendantBridgeV1` and its getter/layout remain unchanged. Exact primary bridge/export-list/`-u` proposals keep the real query reachable even with stripping.

The `.mm` source review used actual Profile weak pointers, cookie-binding/restore epochs, `GlobalBrowserCollection::ForEach` creation ordering, native window access, `NavigateParams` constructors, `Navigate` result type, `NavigationHandle::GetWebContents`, actual tab-index lookup and `ScopedProfileKeepAlive::TryAcquire`. These units contain no DictValue builder chains or ExtensionFunction classes requiring the separate lvalue/global-namespace corrections. Source review is not compiler acceptance.

## Actual GN composition

`gn-plan.json` contains six exact root-owned GN/export proposals: seven single-match anchors plus one appended target block. Apply only after the existing A1/Open source chain in `source-plan.json` and prior shared profile-hook proposal.

* `//chrome/browser/aux:native_cli_open_headers` is interface only. `profile_identity` depends on it without introducing a UI/platform dependency cycle.
* `//chrome/browser/aux:native_cli_ingress` compiles the actual SDK Wire, SealedImages, Ingress and OpenArguments units. It needs Security/CoreFoundation and libbsm, with no Node/Swift/provider dependency.
* The existing `//chrome/browser/ui:ui` target owns approval and native open implementation. It gains the real ingress/header and Profile keep-alive dependencies plus AppKit/Foundation/LocalAuthentication.
* `//chrome/browser/aux:native_cli_open` is a genuine standalone native frontend executable. It links the common implementation and exact supplied SDK-only endpoint delivery and immutable marker reader, not stubs or a Node wrapper. Root later places it in the fixed CLI bundle path and keeps signing/release separate.
* The primary executable retains/exports only the additional factual query; the ES registry is not linked into UI or helper processes.

`source-plan.json` maps every changed/new/static copied source to its native-relative destination and pins inputs/outputs/counts. Its predecessor links are deliberate: the membership engine header/implementation build on the earlier eleven-anchor A1 overlays; approval/Ingress build on the latest open-command slice. Do not overwrite the chain with older whole-file copies. Root owns final composition/registration/GN/package selection.

## Ready-to-run compiler argv (root only)

`sdk-compile-plan.json` contains six exact argument arrays for Wire, SealedImages, Ingress, OpenArguments, Frontend and the genuine SDK EndpointDelivery. It pins the actual Xcode compiler, SDK settings and thirteen source/header inputs, with no fake headers, native provider, Swift or Node. Root creates the stated temporary output directory and executes the arrays under the shared native build lock. An optional exact unsigned native-only linker argv uses the six real objects, required SDK frameworks/libbsm/libobjc and `-no_adhoc_codesign`. No command in this lane executes the compiler or linked output.

The coherent browser startup/shutdown call-site proposal remains `../cli-native-open-command-a1/registration-handoff.json`: two actual files/eight exact anchors/output hashes. It registers the real service from `PostBrowserStart`, closes/joins it before profile teardown and blocks authenticated CLEAN until actual closed receiver/zero queued/zero pending native observations. The narrow command's native tab/navigation start is the success boundary; it makes no page-load claim.

Root must compile actual SDK + UI + shared/primary units, apply GN/registration, pair the actual CLI bundle, and later run the bounded disposable native terminal/Profile checks when execution is authorized. Broad account/installation CLI and retained Node/Worker/PDF/utility proxy ownership remain explicitly separate incomplete work. Current signature/startup policy can refuse unsigned execution; object/link success does not authorize signing or establish app readiness.

## Evidence

`static-check.json` records exact source/GN/registration replay and actual input hash verification only. There are sixteen source/registration rows, nineteen single-match source anchors, two append blocks, eight separate startup/shutdown anchors, six prepared SDK compiler commands and thirty-one pinned dependencies. The native checkout and existing UI remain unchanged.
