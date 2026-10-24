# Inactive async runtime-cache integration

This is a follow-on to `runtime-cache-validation` and the independent `runtime-host-registration-count` correction. It supplies the actual zero-argument async native dispatcher, composes source changes for the current feature daemon and its projected entry, and leaves the accepted app/native tree/source-pair untouched. No native executable or library was linked, signed or executed.

## Real native host composition

`prepare.py` requires the exact historical selected WorkerHost SHA, replays the separate count correction, then applies three count-one host changes: global includes, private implementation includes, and one immutable `inspectRuntimeCache` descriptor. `host-overlay.json` records the intermediate and final hashes. The projection is `source/AuxDevelopmentWorkerHost.cc`; it still uses the actual selected Worker, Owner, registry, native-root bridge, cold guards and cleanup implementation. No fake Owner/environment, pathname/FD/pin/profile selector or alternate ABI is supplied.

`AuxRuntimeCacheAsync.inc` captures `BrokerOwner` on the genuine originating JS callback and reserves `broker_pending` before queueing. It obtains the actual native transport generation and task-directory device/inode; these are never supplied by JavaScript. The async cleanup hook is the actual Node 26.5 NAPI8 hook, not a detached JS promise. It holds the real environment until completion and marks cancellation without settling pending work prematurely. The execute callback performs only native retained-owner/state checks; **it never calls V8, `CurrentWorker`, or a global-current-environment lookup off the JS thread**. This supersedes the earlier draft Owner wrapper; that old `.inc` is not included in this integration.

The retained native Owner and Worker survive every physical reader and reply cleanup. Cancellation polls between bounded reads; Node's completion callback runs after the thread-pool execute callback exits (or after confirmed pre-execution cancellation). Only completion removes the async cleanup hook and pending record. Completion rechecks the genuine NAPI environment, `CurrentWorker`, native owner, transport generation and task identity before returning a frozen aggregate result. Cleanup does not publish JS results. Once the record settles, an already-terminal worker retries the original close/detach path. Existing cold authority and untracked-work flags are unchanged.

The read-only core and exact 10,929 pins are hash-checked copies of the previous proposal. CommonCrypto is used for streaming SHA-256. The method returns no payload, file paths, descriptors or credentials. Its `authority:"none"` is intentional: this is snapshot evidence, not a custody or execution grant.

## Source/entry composition

`transform.mjs` exposes `applyRuntimeCacheInspection(source, {kind, inputSha256})`. Every input hash must match and every replacement is count-checked. `source-overlay.json` records exact current input/output hashes and projected private output paths for:

- The current `runtime-seed.cjs`: both retained-directory and racing-EEXIST returns await the trusted bootstrap inspection callback. Missing callback refuses. There is no cache repair, reset, deletion or new publisher.
- The selected `runtime-bootstrap.cjs`: captures `inspectRuntimeCache` alongside existing immutable native functions, validates frozen report shape and owner/transport generations against the same captured roots, and rejects `incomplete`, `unsafe` or `cancelled`. It passes the callback to both retained branches.
- Current feature source `/private/tmp/aux-browser-features-daemon-source-20261023-a4/index.mjs`, input SHA `4e5c2710ddeb7b1f57f2524088ece6678b0f091ec6f7af68564c355cabae4723`, and its **matching projected entry**, independently count/hash checked. A read-only bootstrap export gates `acquireAgentRuntimeUse` before runtime use, including the old install-failure fallback. It does **not** seed from acquisition. Cancellation is rechecked after inspection. If an install starts during the new await or existing fallback await, acquisition restarts its original install-wait path before incrementing use count; the final check/increment has no intervening await.

`matching-seed`, `unverified-modified`, `unverified-newer` and `unverified-other-version` preserve the original downstream compatibility policy. The supplied updater, release metadata validation, quarantine handling, backup logic and `getLocalAgentRuntimeVersion` implementation are unchanged. In particular, unverified statuses are never renamed “verified” or treated as full update provenance. The original installed-status API retains its narrower entrypoint semantics; this proposal must not be described as complete newer-runtime validation.

## Evidence and remaining gates

`compile-result.json` records a successful object compilation of the **whole actual projected WorkerHost**, using the exact previous real-host command with its existing native Node 26.5 headers, macros and platform flags. No mocks/stubs were substituted. The object and `.d` file remain in the recorded private temporary output; `compile-dependencies.json` pins their selected header dependencies. All four transformed JS files passed syntax checks without executing their modules.

That bounded object compilation was mistakenly invoked directly rather than through `scripts/native-build.py`; this workflow mistake was reported immediately to the integrator. It is source compilation evidence, not serialized final-build acceptance. Do not rerun or queue a second build while the root native lock is held. Root owns the future serialized compile/link/package recipe. No tests, process restarts or runtime payload scans were performed for this follow-on.

Integration must install the native method, seed, bootstrap and **both current source and projected entry** together; refresh their actual dependency/object/source-pair/package receipts. Do not graft this onto the protected predecessor while dropping current feature transforms. The generated host is a reviewable projection, not a replacement for the pinned historical input.

Still separate: native/link/package activation, real cancellation/environment-teardown behavior, runtime execution acceptance, safe native fresh-stage publication, authoritative newer/modified update receipts, mandatory namespace custody, all-writer coverage and full browser drain. No conclusion here narrows those contracts or authorizes signing/release.
