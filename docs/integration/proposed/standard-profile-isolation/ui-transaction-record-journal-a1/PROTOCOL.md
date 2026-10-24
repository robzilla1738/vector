# Immutable transaction records over the audited native capture channel

Additive frames7–12 inside authority wirev6/operation7. Existing frames1–6 are unchanged. The enclosing actual native peer, code/birth/generation/sequence/nonce and retained Entry checks remain prerequisites. These operations persist **data only**; every binding and receipt says `qualified:false`, `activationAuthorized:false`. No Profile selector, filesystem path, store mutation or migration grant is introduced.

Integers are unsigned little endian. Journal/upload UUIDs are16 raw bytes; SHA256 digests are32 raw bytes. Request bodies remain at most8192 bytes; replies at most8192 bytes. Payloads are nonempty, bounded64MiB; at most64 records and64MiB aggregate payload per capture transaction.

| Frame | Exact request | Successful reply |
|---|---|---|
| 7 Begin record | byte7; capture journal UUID16; upload UUID16; ordinalu32; kindu8; previous receipt SHA32; intent payload SHA32; payload bytesu32; payload SHA32. Total138. | byte7; retained upload bytesu32 |
| 8 Append | byte8; upload UUID16; exact next offsetu32; nonempty bytes. | byte8; new retained bytesu32 |
| 9 Persist | byte9; upload UUID16. Total17. | byte9; actual immutable receipt SHA32; receipt bytesu32; canonical receipt JSON |
| 10 Load/observe | byte10; journal UUID16; ordinalu32. Total21. | byte10; payload bytesu32; kindu8; immutable receipt SHA32; receipt bytesu32; canonical receipt JSON |
| 11 Read loaded | byte11; exact loaded journal UUID16; ordinalu32; offsetu32; countu32. Total29. Count1–8191. | byte11; exact requested payload bytes |
| 12 Discover | byte12; capture journal UUID16. Total17. | byte12; countu32; repeated ordinalu32/kindu8/receipt SHA32/payload SHA32 (69bytes each) |

Kind1 is pre-target-intent;2 target-attempt;3 store-readback;4 restore-attempt;5 source-readback;6 backends-target-observed;7 cache-publish-attempt;8 cache-publish-ack. Ordinal0 must be kind1, use the zero previous digest and set intent SHA to its own payload SHA. Later records cannot be kind1 and must use the exact prior immutable receipt SHA and first intent payload SHA. Ordinals are contiguous, minted as fixed record positions under the already complete native-created capture journal; the client cannot create or select another directory.

The exact payload is opaque at the journal boundary. The native controller separately validates its complete source/target records, real native Profile/epoch/topology/document ownership and physical leases. A receipt proves those exact bytes were retained with actual root/policy/initial-journal/capture/generation bindings, file and directory sync, and exact readback. It never proves the payload's claims or authorizes a store action.

Persistence uses exclusive fixed-name immutable files. Physical uncertainty is marked before IO. A lost Persist response can be observed with Load, which freshly syncs and reads the exact chain; only an exact descriptor and payload match can clear that same retained upload's uncertainty. Conflicting payloads, missing/gapped/partial files, stale bindings and malformed frames refuse. Existing partial records are never overwritten, skipped or deleted. Such a journal remains unqualified; recovery must requalify actual stores and retain the partial evidence rather than infer that a target action did not run.

Load caches only the validated payload for bounded Read. Capture and record uploads/downloads have separate retained state. Existing bytes and older generations remain data: fresh native owners and physical writer gates must be rediscovered before recovery or publication. No timer, absence of a callback, destructor, caller flag or journal generation is a drain/admission proof.
