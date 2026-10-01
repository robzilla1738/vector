# Cross-device sync design

Status: design only. No sync service, account, transport or production feature is included in the browser-runtime implementation.

## Source and scope

The browser-runtime plan requests the 05 Sync/escrow model. The checked-in `docs/reference-specs/05/README.md` is a measurement queue, not a completed Sync specification; it contains no escrow measurements. The following is an Aux design proposal. A source comparison remains required before a future implementation claims parity. Nothing reads a credential store to fill this evidence gap.

Sync is opt-in per Profile, with separate encryption domains for each Profile. Private windows, cookies, credentials, model tokens, connector secrets, page bodies, agent observations, and live tab controller leases never sync. Initial selectable collections are Spaces, pins, folders, command bindings and explicitly selected skills. URL-bearing collections require an explicit disclosure and consent. A remote tab is a reopenable URL record, never a live WebContents or an actuation grant.

## Encryption and escrow

Each Profile receives a random root encryption key; collection keys are derived with separate domain labels and epochs. Records use authenticated encryption with Profile, collection, stable record ID, schema and epoch bound as associated data. The service stores ciphertext, opaque routing IDs and bounded delivery metadata. Device signing keys authenticate membership and record envelopes. Server authentication alone cannot enroll a device or decrypt content.

Enrollment requires approval by an existing unlocked device or a user-held recovery secret. The approving device wraps the Profile key for the new device public key and signs membership. Device key material remains in local native protected storage. Aux agents cannot read it. Recovery escrow stores only an encrypted key envelope; an independent, high-entropy user recovery secret unwraps it locally. Losing every device and the recovery secret loses access. A future implementation must specify the exact envelope format, algorithms, KDF and audited library before shipping; this document does not assert cryptographic verification.

Revocation removes a device from membership, rotates the root and collection epochs, and re-encrypts current retained records. Old encrypted exports or keys already copied to a revoked device cannot be recalled. Recovery reset generates a fresh envelope and retires prior managed envelopes. UI states this limit clearly.

## Ordering and conflicts

Every record has a stable ID, writer device, monotonic writer counter, observed revision vector and tombstone. Delivery is idempotent and accepts out-of-order batches. Updates to disjoint fields merge; concurrent edits to the same field remain visible as a conflict until the person selects a value. Ordered lists use stable position identifiers and deterministic device-ID tie breaking. Deletion wins against stale updates; explicit restore creates a new revision. Tombstones are retained until all active devices acknowledge them or an explicit offline-device expiry is reviewed.

Local changes and encrypted outbox entries commit atomically. A single worker sends bounded batches with backoff, validates signed membership and decrypts before applying a transaction. Organization revisions still use local CAS. Device-local window selection, split focus, window geometry and active tabs stay local; shared pins and folder membership can sync. Unsupported schemas remain unapplied and report an update requirement. Corrupt records are isolated without overwriting healthy local state.

## User experience and future acceptance

Settings shows selected collections, connected devices, last successful sync, queued changes and actionable errors. Enrollment names the device and requires a person. Recovery setup asks the person to save and verify the recovery secret without sending it to a model. Disable stops transport; remove-cloud-copy requests deletion and retains local data. Forget advances epochs and removes retained managed copies, while explicitly stating the copied-export limitation.

Before implementation: measure the requested 05 reference, review the threat model and envelope protocol, decide transport retention and offline-device policy, and obtain privacy copy review. Acceptance must prove cross-Profile isolation, no secret/session ingestion, replay and tamper rejection, concurrent edits and deletes, offline reorder, interrupted enrollment, revoked-device refusal, recovery success/failure, key rotation, bounded work and visible errors using synthetic keys and loopback services. Cloud sync remains out of this build's feature registry and qualification map.
