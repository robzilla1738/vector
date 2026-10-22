# Inactive owned macOS utility composition

This slice connects the five supplied macOS utility routes to the actual instance-owned dispatcher/NAPI implementation. It does not supply runtime admission or activate a production addon.

## Native composition

Define `AUX_MACOS_UTILITY_DISPATCH` and compile the three source files from `../aux-native-macos-utilities/source`. The flag only includes declarations; it is not an admission token. Each sealed-context owner constructor gains a distinct native-only overload:

```swift
let utilities = AuxMacOSUtilityCommandCore(boundary: AuxAppKitUtilityBoundary())
let owner = try AuxOwnedCommandDispatcher(scopedTerminal: validatedContext,
                                          macOSUtilities: utilities)
```

The corresponding `capturedTerminal`, `runtimeCaptured` and `recoveredFreshTerminal` overloads are available only in their existing declaration graphs. No arbitrary installation-core constructor, JS utility factory, scope argument, handle override or mutable selected utility instance is added. The existing overloads retain **no OS capability**, even when the declaration flag is present. Without the flag the graphs need no utility sources or frameworks.

The immutable registry entry holds the installation core, optional secure-store and optional utility core together. Actual `AuxNativeContextRun` obtains the original owned lease and per-entry serialization before calling the utility route. Secure-store commands retain their original route; a recognized utility command returns its JSON string; other commands retain the installation core's existing unknown-command result. Input decoding limits and handle-before-pointer validation are unchanged. Retirement and owner finalization close/drain synchronous calls on that same entry; no second registry or stale-context command route exists. This does not drain outstanding OS jobs after a command timeout.

AppKit/QuickLook source comes from the earlier pinned reconstruction review, preserving its five command schemas and actual OS APIs. This composition adds no fake success implementation. The actual trusted host must decide when to attach this capability and provide a suitable AppKit execution context. PDF/other addon surfaces remain separate and are not intercepted here.

## Focused checks

`bash docs/integration/proposed/aux-owned-macos-utility-dispatch/check.sh`:

1. Verifies exact source/fixture pins and compares the capability-absent dispatcher projection to baseline048652e64 under four prior declaration combinations. The only old-path formatting change is whitespace; historical source pins/receipts remain unchanged.
2. Serially compiles the real NAPI8 adapter, actual owned registry, software installation authority/runtime four-row validation, finite secure-store policy, actual AppKit/QuickLook source and this distinct fixture-only native producer into a `.node` library.
3. Loads only that new fixture using frozen Node with disposable HOME/TMPDIR and no inherited environment. The OS boundary is captured, never AppKit-constructed. Checks all five routes, malformed-input no-effect, OS failure forwarding, per-instance first-copy isolation, genuine software signature/root, secure save/read/clear, unknown routing, worker cleanup and finalizer/retirement. Native fixture also verifies a dispatcher without OS capability retains unknown-command behavior and a retired handle refuses calls.
The final combined run passed23 Node checks, plus the fixture’s native absent-capability/retired-handle assertions. Existing runtime/secure-store SDK deprecation warnings remain; their Security paths were not executed.

4. Inventories the actual compiled addon bytes for zero case-insensitive reference-product substring.

The unchanged earlier31 utility checks and default24 fixture are not rerun. This is a new combined graph check, not proof of live runtime admission or actual OS effects.

## Async custody limit

The preserved synchronous QuickLook three-second timeout cancels the request but does not prove callback completion. Its callback can still create/write the requested PNG after `run` returns, including after dispatcher retirement. NSWorkspace's five-second open timeout likewise does not prove that the requested OS action or callback is finished. Callback-owned synchronized storage remains memory-valid, but that fact is not a stopped-writer/OS-job fence. The registry lease covers the synchronous command invocation only. No migration/coordinator may use this fixture's retirement as evidence that all writers or OS actions have drained. A future admitted host must separately account for in-flight OS jobs; this slice does not change the supplied timeout behavior to manufacture acceptance.

## Remaining activation work

A real clean native host still must supply its admitted installation context and OS capability, retain the owner through the existing attach API, and decide/verify execution-thread policy. There is no production module initializer in this slice. Before enabling these routes, an explicitly authorized disposable real OS check must verify clipboard, workspace candidate/default/icon enumeration, explicit-app open and QuickLook output. No clipboard/open/application enumeration/ownerfile/Keychain action, signing, UI change or packaging change is performed here.
