# Root compile and integration handoff

No compiler, native API, app/daemon/CLI executable, Node entry or provider request was run by this lane. `static-check.json` is source verification only.

## Coherent graph

Copy `source/common/*` to one include directory `chrome/browser/aux/cli/`, then the browser sources beside them. `AuxCliWire`, `AuxCliSealedImages` and `AuxCliIngress` use only SDK/C++20 and must be linked into the actual browser and proposed CLI frontend. The browser invocation additionally needs the proposed `AuxOwnedNativePeerChild`, selected-home, descendant-engine, base process/launch and shutdown owners from this exact native composition.

The daemon backend needs Wire/SealedImages and the **actual current** `AuxNativeContext*`, retained provider, retained native parent and OS retirement C exports from the pinned 48-Swift/14-native-object a3 graph. Compile its C++ object; add the CLI sealed Swift reader in the complete policy graph, not in isolation with stubbed role types. The current CLI role checks must continue to refuse until a real retained-runtime owner and image graph are paired. The proposed frontend needs the actual `AuxTakeNativeParentEndpointForBootstrap` implementation, not a stub or JSON claim.

The six overlays must replay together from their pinned inputs; especially pair `launch.h` and `launch_mac.cc`, peer child header/implementation, and descendant engine header/implementation. Keep default directory-FD `-1` for every existing caller. Root is the sole owner of actual GN/registration and packaging.

## Suggested focused checks (root only)

1. Under `scripts/native-build.py` and the shared native build lock, compile the three SDK common C++ objects and CLI frontend object with the actual SDK/target/exception flags used by the existing native executable. Include Security/CoreFoundation/CommonCrypto and actual parent endpoint dependencies; do not link stub implementations.
2. Compile the six changed Chromium units and the new browser invocation against the integrated native generated headers and real API graph. Use the actual Ninja object targets derived from that graph.
3. Compile the daemon backend and CLI sealed reader into the existing real native source graph after the typed target/gateway interfaces are supplied. Preserve every new unresolved/missing implementation as a genuine gate rather than exporting a symbol-only readiness function.
4. Do not select this frontend for the candidate or remove quarantine/private-child refusals from compile-only evidence. Actual execution requires the target grant, proxy/native owner, role image policy and retained gateway. Root should record actual compiler output and explicitly separate it from runtime acceptance.

No exact final linker invocation is fabricated here: required target/proxy producer source does not yet exist. The manifest pins existing source dependencies and states those gaps.
