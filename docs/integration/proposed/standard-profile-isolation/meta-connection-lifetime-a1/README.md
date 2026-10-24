# Meta owned context and physical connection lifetime — proposal a1

Source-only successor to the exact daemon projection v4/a4 (182 anchors) and native browser composition a4. This proposal changes no UI, endpoints, other windows, native build inputs or packaged app. Integration and native compilation remain pending.

## Delivered

- The private Meta sign-in window has its own original secure-default CDP client. Its broker owner retains authorization/connection attempts and every real socket close event even after the flow map removes the login. An error, close request, command response, readyState or timeout cannot stand in for physical socket closure.
- This dedicated client cannot silently reconnect and claim its earlier context on a different authenticated socket. The supplied reconnect behavior for every non-owned client is unchanged. A late admitted connection is retained and closed; a missing close event stays pending.
- `Target.disposeAuxBrowserContextAndObserve` accepts only an exact context in the current browser-level handler's dispose-on-detach ownership set. It closes only that private context. Standard `Target.disposeBrowserContext` semantics are unchanged.
- The native callback is retained separately from Profile/window lifetimes. The existing `OnBrowserClosed`/disposal callback is only request acceptance. The new callback is emitted after the exact owning `ProfileImpl` OTR unique_ptr erase/destructor returns. Missing destruction remains pending; refusal or a lost connection stays unknown.
- The response also reports a **limited native storage observation**, not generic service settlement: the context must be a DevTools OTR Profile, have loaded partitions, and every loaded partition must be initialized with native in-memory configuration, no generated disk-code-cache instance and no NetworkContext dispatch that ever received persistent file paths. Network paths are observed after embedder/DevTools overrides, immediately before the real service dispatch; the observation is sticky across reconnects. An unimplemented partition observer defaults to false.
- Known Meta registration follows the existing private lazy-provider identity validation. Its HTTP requests reuse an already owned manager transport, or retain their own original wrapper if invoked directly. This avoids the nested scope hiding requests from the manager's request-count check.

On the qualified path, Meta-local ownership settles only after exact context destruction and actual CDP socket close. It does **not** release the separate native browser reservation or certify browser-global services/descendants. `serviceCleanupState` is deliberately `unknown`; this is not used as a positive service-drain certificate. Failed or unqualified native results call the original broker uncertainty marker.

## Scope of the storage qualification

The selected native policy independently forces OTR StoragePartitionConfig to memory-only; ProfileNetworkContextService forces OTR network storage to memory and supplies persistent file_paths only for non-memory contexts; StoragePartitionImpl does not create generated code cache for memory partitions. These actual inputs are pinned in `scope-inputs.json`. Generic missing shutdown ACKs for those memory-only services are **not** evidence of outstanding admitted-root disk writes.

Services redirected to the original Profile, browser-global shader/cache work and native descendants retain the existing native browser owner and process-wide shutdown participants. Nothing here calls `CloseOwnedBrowserParticipantsForShutdown`, changes their coverage flags, clears their uncertainty, or replaces their required final receipt. Their known unobserved-descendant cases remain unknown. No new per-context certificate is invented merely to restate that separate ownership. This proposal's boolean describes loaded partition configuration immediately before object destruction; it must not be promoted into a whole-profile or browser CLEAN proof.

## Exact integration

`overlay.json` pins the two independent daemon leaves, source transformer and native replacement table. `transformAuxMetaConnectionLifetime` performs 14 count-one edits per leaf. The source helpers are inserted literally; the source and dormant entry were each replayed and syntax-checked independently.

`native-replacements.json` and `native.patch` describe 18 count-one edits across these 13 files, with immutable before copies and complete proposed after copies:

- `third_party/blink/public/devtools_protocol/domains/Target.pdl`
- `content/public/browser/devtools_manager_delegate.{h,cc}`
- `chrome/browser/devtools/chrome_devtools_manager_delegate.{h,cc}`
- `chrome/browser/devtools/devtools_browser_context_manager.{h,cc}`
- `chrome/browser/profiles/profile_impl.cc`
- `content/browser/devtools/protocol/target_handler.{h,cc}`
- `content/public/browser/storage_partition.h`
- `content/browser/storage_partition_impl.{h,cc}`

Regenerate the existing Target protocol bindings from the PDL. No new source target or GN registration is proposed. The default public StoragePartition method is defined alongside existing public StoragePartition implementations in storage_partition_impl.cc. Root owns projection, generated bindings, compilation and packaging. The daemon must not be paired with an old native implementation and described as having qualified completion: unsupported command falls back to existing dispose-on-detach and retains uncertainty.

## Lean verification and remaining acceptance

`node check.mjs` performed independent paired literal replay and Node syntax checking, exact native before/after replay against the current a4 snapshot, and inert event fixtures. Fixtures cover an error without close, a late admitted socket, a lost original session, separate object-observation/socket-close gates, and an unqualified native result retaining uncertainty. No real socket, HTTP request, provider, browser, native client, product execution, build, grant or signing occurred.

`evidence.json` is source evidence only. Native compile/generated API acceptance and a disposable real Meta sign-in/cancellation observation are unrun. Existing macOS observer/entitlement prerequisites and native browser descendant coverage limitations are unchanged. There is no global browser shutdown as sign-in completion.
