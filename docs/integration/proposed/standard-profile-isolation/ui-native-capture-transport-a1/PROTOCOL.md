# Native capture frame format v1

This is a finite native-only data protocol inside authority wire version6, operation7. Every request body is1–8192bytes. The enclosing authority wire includes its exact length and a canonical zero tail. Native audit/code/birth/generation/sequence/nonce checks are prerequisites, not replaceable fields in these frames. All integers below are unsigned little endian. UUIDs are16 raw bytes; a journal UUID and upload UUID are distinct. No frame supplies a filesystem path or authorizes target writes.

| Byte0 | Request remainder | Successful reply |
|---|---|---|
| 1 Begin | upload UUID16, total byte count u32, SHA25632; exact53bytes | 1, retained byte count u32 |
| 2 Append | upload UUID16, exact current offset u32, nonempty bytes; maximum8192bytes total | 2, new retained byte count u32 |
| 3 Persist | upload UUID16; exact17bytes | 3, canonical immutable JSON capture receipt |
| 4 Discover | none; exact1byte | 4, ID count u32, count×16 journal UUID bytes; at most256 |
| 5 Load | journal UUID16; exact17bytes | 5, byte count u32, source generation u64, current generation u64, capture SHA25632, receipt byte count u32, immutable JSON receipt |
| 6 Read | loaded journal UUID16, offset u32, count u32; exact25bytes | 6, exactly requested bytes; count1–8191 |

Total capture size is1–64MiB. A new upload cannot replace unfinished/unknown work. Existing exact begin metadata can report retained offset; append requires the next offset. Persistence requires complete bytes/digest, marks physical outcome unknown before IO and retains either a successful receipt or uncertainty. A new request is never permission to reperform unknown IO. Enclosing authority recovery observes the same outstanding sequence/nonce rather than resending physical work. After a lost result, discover/load can inspect actual journal state; partial directories remain and are not called complete.

Load validates the actual immutable journal before caching its data. Read is bounded against that exact cached payload and remains guarded by the real current native owner. The source generation is a data fact; neither load nor equality with a caller field grants migration/profile authority. The profile controller must verify completeness, source identity, digest, target intents and recovery separately.

Malformed frames, unsupported operations, stale owner/route, invalid offset/digest, lost guard or unknown physical result refuse. No error means that a physical write is proven absent. No cancellation/delete/reset/credential operation exists in this protocol.
