# A7 — physical DOM transaction owner and privileged service consumers

This is a source-only continuation of the reviewed A4 physical queue seam. It does not change UI assets, component markup, styles, existing browser defaults, startup admission, signing or release. Eight actual native owners are pinned by exact before/after hashes and 51 counted anchors. No shared native files were changed or executed by this lane.

The actual `AsyncDomStorageDatabase` owns an opaque lease and its original maps. The existing disk backend must already be open, and every live committer must be absent. Local additionally refuses any area holder; Session additionally refuses any data map or namespace owner. This conservative first physical slice **does not operate underneath live native/renderer caches**. It is not yet usable for the normal already-mounted Agent cohort.

While held, ordinary backend dispatch, commit/drain requests, service binds, namespace creation/clone/deletion, purges, policy updates, stale-data continuations and database recreation defer before their physical or service-owned mutation. Their original callbacks/closures and order are retained. Attempted work taints the source. A target requires the exact opaque owner, no current operation, an unchanged empty committer registry, an untainted source and no previous target attempt. Dropping a lease, losing a reply or destroying an owner never certifies success or reopens admission.

Capture reads the backend's real complete metadata inventory, selects only the actual canonical Agent origin and retains exact full raw maps privately. Only the nine reviewed UI preference/draft families are exported. Their Local/Session scope, bounded draft identity, serialized encoding, current/legacy schema, duplicate encoding and source/target collisions are checked. Persisted claims refuse recovery. Unrelated entries and exact value bytes are preserved. Unknown Unicode draft identities and repeated map topology refuse instead of being guessed.

The target is the finite versioned legacy-key-to-Aux-key mapping already specified by `vendor/provided/aux-ui-storage-migration.mjs`. No caller supplies a target, map locator, profile, root or replacement values. Native source CAS compares each full retained map and actual Agent metadata inventory. The backend's real `UpdateMaps` batch and explicit `SyncForAuxMigration` run on its existing DB sequence; readback compares exact source and target maps. Local usage size is adjusted to the target's real raw byte count while preserving existing timestamps; restoration uses retained original metadata. These observations concern file data, not directory durability or cross-store atomicity.

A failed or unknown attempt remains held. A separate exact source/target readback with fresh backend sync can resolve a lost acknowledgement. Source restoration is derived from the same retained originals and refuses any current map outside the exact source/target alternatives; it never accepts caller restore data or overwrites an unexpected map. Release after any target/restore attempt requires an actual synchronized known source/target observation. Release replays queued ordinary work; that replay is not migration qualification.

The real privileged Local/Session control interfaces consume the backend implementation through appended methods, preserving previous Mojo ordinals. A native request token is correlation only; the distinct service-minted opaque lease token owns the transaction. Read-only discovery recognizes only the service's original request and does not reprepare after a lost response. Neither API is brokered to a renderer.

## Remaining integration gates

- Live StorageArea admission, pending load/COW/clone closure and native/renderer cache adoption with acknowledged observer handling. Current refusal is intentional and explicit.
- Merging the finite actual renderer draft/memory intents into per-document/native Session topology; conflicting shared state must refuse or use a real native fork.
- Native worker keepalive/hold and complete browser/daemon writer inventory joined with these physical gates. The normal Agent has a live MV3 worker.
- Corrected A5 controller consumption, final read-only renderer `Seal`, complete capture qualification and actual durable pre-target cross-store intent. No controller currently invokes this A7 target API.
- Restart-recoverable backend lease/target intent and durable backup/restore across process loss. A7 custody exists only inside the actual current service process.
- Directory durability, cross-store target/readback/recovery and activation facts. Source registration, compiler success and physical sync alone grant none of these.

Root owns actual Mojo generation and compilation of the three existing implementation units: `async_dom_storage_database.cc`, `local_storage_impl.cc`, `session_storage_impl.cc`. This lane performed one exact source/patch replay, reverse replay, input preservation and whitespace check; `actual-source-check-a7.json` records that evidence. No native build, app, service, provider call, owner state or runtime acceptance is claimed.
