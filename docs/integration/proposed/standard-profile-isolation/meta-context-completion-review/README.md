# Meta private-context completion — bounded source review

Review only. No implementation, native projection, build, grant, sign-in, browser operation or package mutation is included. The current Meta HTTP successor is independently useful; its browser-lifetime uncertainty must remain until the mechanism below is implemented and accepted.

## Result

There is no existing callback in the selected stack that proves Meta's complete private-context and client-transport cleanup. A small client-side `closeAndWait` can prove only the exact WebSocket's physical close. A callback after profile destruction can prove only that C++ object lifetime. Neither is a whole-context writer drain. Completing the latter requires production completion acknowledgments from the asynchronous storage/network owners, bound to one native context lifetime. Signing or a macOS permission cannot supply those missing callbacks.

## Exact existing sequence and limits

1. Actual a4 daemon `openOAuthWindow` constructs a dedicated `CdpClient`, requests `Target.createBrowserContext({disposeOnDetach:true})`, and creates a target with that context ID. Abort calls `CdpClient.close`. The client sets its current socket to null, rejects commands and asks the socket to close. Its socket-close listener calls the disconnect path only while the socket is current; the intentional close therefore suppresses that event. In-flight authorization/connection attempts can also outlive that method. `send` can reconnect, and its response does not expose an immutable connection identity.
2. `content/browser/devtools/protocol/target_handler.cc:805` disposes detach-owned contexts with `base::DoNothing`. Its explicit disposal handler at line1640 forwards a delegate callback, but the actual callback is weaker than cleanup completion. Target-destroyed events identify targets, not all services belonging to the private context.
3. `chrome/browser/devtools/devtools_browser_context_manager.cc:196` waits for the last browser window, stops observing the profile, posts `DestroyOTRProfileWhenAppropriate`, and then sends successful disposal (lines215–224). The no-window branch at line161 also invokes deferred destruction and returns success. These are scheduling/window-closure acknowledgments.
4. `chrome/browser/profiles/profile_destroyer.cc:196` calls `MaybeSendDestroyedNotification` before renderer-host observation and the eventual deletion. Renderer-host destruction can schedule retries (line385), and timeout paths are lifecycle controls, not all-writer completion. `OnProfileWillBeDestroyed` must not settle a writer ticket.
5. `chrome/browser/profiles/profile_impl.cc:1109` erases the owned OTR profile. After the actual erase returns, an independent retained record could report that the profile destructor completed. However `OffTheRecordProfileImpl::~OffTheRecordProfileImpl` (line257) calls keyed-service shutdown and `ShutdownStoragePartitions`; these do not join every asynchronous service task.
6. `BrowserContextImpl::ShutdownStoragePartitions` (content/browser/browser_context_impl.cc:265) resets the partition map. `StoragePartitionImpl::~StoragePartitionImpl` (line1260) calls multiple shutdown methods with no completion aggregate. The network context is a Mojo remote (`NetworkContextOwner`, line1220); dropping it is not a service-side completion acknowledgment. DOM storage `Shutdown` (dom_storage_context_wrapper.cc:228) resets control remotes and explicitly describes this as signaling shutdown.
7. Generated code cache provides a concrete counterexample: production `GeneratedCodeCacheContext::Shutdown` (line231) posts `ShutdownOnThread` and returns. Its separate **testing** path (line239, line344) waits for cache backend cleanup. That test API is evidence of the distinction, not an approved production drain primitive. Network `CloseAllConnections()` closes connections only; it is not network context, cookie/cache database or queued-file-task teardown.

Source hashes for these exact statements are in `source-inputs.json`. This is a bounded lifecycle trace, not an exhaustive inventory of every Chromium writer.

## Smallest truthful implementation split

### Client transport ownership (local source change)

Use the existing bundled `CdpClient` and `openOAuthWindow`; do not replace authenticated connection discovery or construct an unauthenticated custom connector. Add a private per-instance closing gate and retained connection-attempt records. A new `closeAndWait()` must prevent admission/reconnect, retain already-started resolution/handshake work, and join the physical close event for each actual socket created by that instance. A late successful connection is closed and still joined. Missing close, thrown teardown, discarded callback or unresolved authorization transport remains pending/unknown. The socket record must survive clearing `#i`; a close request or `transportEvents.disconnected` alone is insufficient.

Meta then retains this client until both its exact native context completion reply and physical client transport close. Closing that transport early cannot be used to infer server cleanup. Original callbacks, URLs and window geometry remain unchanged.

### Native context identity and object completion (new narrow owner)

A proposed `AuxOAuthContextLifetime` record should be created **before** the private context/target creation is submitted and owned outside the Profile, DevTools handler and window lifetimes. Use an opaque `base::UnguessableToken`, actual context identity, current authenticated DevTools session/connection identity and native owner generation. No filesystem path, renderer-supplied account or matching URL identifies this record.

Close admission for only this context before closing its targets. Prevent later `createTarget`/attachment work from adding unaccounted descendants to that context; retain any already-submitted creation. The record can collect target closure and a callback after the actual `ProfileImpl::DestroyOffTheRecordProfile` erase returns. It must not keep that same Profile alive with a keepalive that prevents the deletion it is waiting for. Keep the independent record/participants alive instead; never dereference the profile after destruction.

A proposed Aux-named CDP operation, registered in the actual `Target` protocol/handler, could accept only a native-created opaque handle plus request nonce and return `pending`, `unknown`, `refused` or `settled`. The handler checks the handle's originating authenticated session and exact native generation, not a new connection's claim to the old context ID. `settled` requires all genuine participants; this review does not define a callable completed API. The state survives handler loss, but an unexpected connection loss cannot yield a success reply on a substitute connection. A local received-ACK may release notification state only after genuine native completion; losing an ACK does not create cleanup proof.

### Storage/network participants (required before a settled reply)

The independent context record needs production completion callbacks from each actual storage partition and relevant keyed service, including network context, DOM storage, generated-code-cache backends and other outstanding partition work. Retain those callbacks and their service-side work owners through physical completion. Mojo receiver destruction, UI-sequence queue barriers, empty local maps and Profile destruction alone do not satisfy them. The existing test-only code-cache shutdown path must not be invoked as a production workaround; a production API would need its own reviewed owner/lifetime semantics, including persistent-cache and disk-task completion.

Current `NativeFeatureIoTicket` is useful as a **pattern**: explicit settle only on actual completion; destruction retains abandoned/pending uncertainty. It is not a whole-context certificate. Its records are keyed by native profile path and kinds for organization/feature-state/download/chosen-files. Crucially, `OffTheRecordProfileImpl::GetPath()` (line334) returns the original profile's path. A path-wide zero-pending check cannot identify this private context, and a path-wide admission close would affect the user's normal windows. Context-scoped tickets need the actual opaque context lifetime, with parent/shared-service tasks attributed by their producer—not guessed from the shared path.

Do not call `CloseOwnedBrowserParticipantsForShutdown` or migration closure for this normal sign-in-window cleanup: the actual header explicitly restricts these irreversible admission gates to process shutdown/migration. Existing content/native-messaging descendant uncertainty also remains; window/target destruction cannot clear it. If a required service has no genuine completion or verified lack of remaining Aux-write authority, report unknown.

## Concrete ownership/file boundary for the next implementation

| Owner | Exact existing source seams | Proposed change |
| --- | --- | --- |
| Supplied daemon lane | Actual paired index/entry `CdpClient`, `openOAuthWindow`; a new count-checked source overlay | Per-instance closing gate, exact socket/attempt records, Meta lifetime join; preserve secure authorizer |
| Native CDP lane | `third_party/blink/public/devtools_protocol/domains/Target.pdl`; `content/browser/devtools/protocol/target_handler.{h,cc}`; `content/public/browser/devtools_manager_delegate.h` | Aux-named handle/close protocol and typed callback, no raw-path authority |
| Chrome profile lane | `chrome/browser/devtools/devtools_browser_context_manager.{h,cc}`; `chrome/browser/devtools/chrome_devtools_manager_delegate.{h,cc}`; `chrome/browser/profiles/profile_destroyer.{h,cc}`; `chrome/browser/profiles/profile_impl.cc` | Independent context record, per-context close admission, actual post-destruction signal |
| Storage/service lane | `content/browser/browser_context_impl.{h,cc}`; `content/browser/storage_partition_impl.{h,cc}`; DOM storage and code-cache context files; `services/network/public/mojom/network_context.mojom` and `services/network/network_context.{h,cc}` | Production owner-retained teardown completion; further concrete service seams only where this first inventory proves necessary |
| Native drain integrator | `chrome/browser/aux/feature_store/feature_write_participant.{h,cc}` and existing browser quiesce observations | Add a distinct context-scoped participant/observation without broadening the meaning of existing feature tickets or invoking process shutdown |

This requires a paired daemon/browser protocol update and generated CDP/Mojo bindings; no new Swift/Node addon ABI is inherently required for a browser-local context reply. Native registration/GN/source composition remain integrator-owned. No entitlement change is proposed by this review. Genuine service completion is the implementation blocker; disposable runtime acceptance and any candidate activation permissions come afterward.
