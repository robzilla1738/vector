# Original notification DB does not persist the JSON companion

**Finding, no native patch.** The supplied native database serializer omits the separate JSON companion; its reader does not reconstruct it. Adding a guessed protobuf field or wrapping the structured-clone bytes would change supplied behavior. Current416's existing live Blink→Mojo→PlatformNotificationData companion and immediate-delivery retention remain unchanged.

## Positive original boundaries

The original payload's generated ClassData is at e9c8710, with the exact type name `content.NotificationDatabaseDataProto.NotificationData` at e9c8750. It points to default object ec7efb0 and actual parse table ec7f1e8. That default object's vtable e55cb40 points at a08163c for generated serialization; GetClassData at a081440 returns the same ClassData. The actual parser has maximum field16 and16 field entries. The original generated serializer at a0817b0 passes field number8 for the existing byte-string member at proto+70. This is the structured-clone payload, not JSON. The complete generated serializer is pinned, including its actual existing field16 and unknown-field handling; no new JSON field is inferred from unused numbers.

A single exact reference to the known default object locates the original content conversion pair:

| Boundary | Actual original range | Relevant behavior |
| --- | --- | --- |
| DeserializeNotificationDatabaseData | 672a29c–672aa24 | Parses the real outer database proto; payload+70 is copied to native DB+290/+298, then execution proceeds to actions+2c8. |
| SerializeNotificationDatabaseData | 672aa24–672b204 | Copies native DB+290/+298 clone bytes to payload+70, then processes actions+2c8 and the existing trigger/outer fields/metadata. |
| Generated payload serialization | a08163c–a081b24 | Writes payload+70 as byte-string field8; no separate JSON member. |
| Live inbox JSON extraction | 40fa214–40fa608 | Reads clone bytes and independently checks the real JSON optional at PlatformNotificationData+210/+228 before emitting click_payload_json. |

The content conversion's real PlatformNotificationData begins at native DB+98 (its title conversion). The independent live inbox consumer establishes clone storage at PlatformNotificationData+1f8/+200 and JSON optional at+210/presence+228. Thus, in the database object's coordinate system, clone storage is+290/+298 and the separate JSON optional is+2a8/+2c0.

Serializer672aca4 reads clone length+298,672acac reads clone pointer+290, and672accc selects proto data+70. After that write,672acd4 immediately reads the actions vector at+2d0/+2c8. It does not inspect the JSON optional between those regions. The complete serializer also copies the original outer serialized_metadata map as-is; it does not synthesize a JSON metadata entry.

The inverse reader672a6b0 reads proto data+70 and672a6d4 targets clone storage+290. Its next phase at672a6fc is actions+2c8, with no JSON optional reconstruction. This is an absence of serialization/reconstruction, not a claim that the reader actively clears a preexisting optional in an arbitrary reused output object. Ordinary fresh DB results therefore do not obtain this companion from disk.

## Fidelity consequence

The source does not persist a separate click_payload_json/data_json protobuf field. It preserves the original structured-clone bytes in field8. A notification delivered from the original live/callback object can carry the companion; a later fresh database read cannot recover it through this schema. Whether an application can later interpret its clone bytes is a different API path and does not justify treating them as UTF8 JSON here.

Current155 notification_database_data.proto and notification_database_conversions.cc likewise have the existing clone field8 and no companion persistence. They are pinned for boundary comparison, not used to invent the original schema. The actual protobuf table definition is also pinned to make the recovered max-field/count interpretation reviewable. No schema or structured-clone change is proposed; scheduled/reloaded JSON retention should be documented as an original implementation limitation, not an unimplemented Aux protobuf extension.

`python3 verify.py` verifies the supplied whole-image hash, five bounded original function listings, actual class/vtable/parser data, field8 and conversion instructions, and the actual155 comparison-source hashes. It passed. No native checkout edits, builds, app/provider/notification execution, database opening, owner state, Keychain, permission or signing operation occurred. Runtime notification acceptance remains separate.
