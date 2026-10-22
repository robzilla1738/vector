# Private inference input transport

This slice preserves the actual shipped1852 daemon and Agent UI. It changes transport only when the supplied image JSON would exceed3.5MB, or a native audio file exceeds3MiB. Small requests keep their supplied transport.

## Contracts

Use the existing authenticated `/attachments/intents` → `/:id/upload-url` → signed private Blob PUT → `/:id/commit` sequence, with `purpose:"inference"`. Allowed images: PNG/JPEG/WebP. Audio: WebM,MP4/M4A,MP3,WAV,Ogg,FLAC. Each input is1–20MiB; all image references must total≤20MiB, max16. Intents expire15minutes after creation. Signed PUT authorization never lasts beyond that expiry. No account Authorization header goes to a signed PUT.

Cloud `/ai/images/generations` accepts each `inputImages` entry as either supplied `{data,mimeType}` or strictly `{uploadId}`. `/stt/transcribe` additionally accepts small `application/json` `{uploadId,language?}`. Responses stay supplied `{model,images}` and `{text}` respectively. These references are opaque IDs, not URLs; the backend resolves only owned, ready, unexpired, purpose=inference DB records. Ordinary permanent attachment IDs cannot be used.

All IDs are claimed atomically, once, under the owner's transaction lock. Reads enforce expected byte count, SHA256 and MIME signatures. The existing strict-ZDR provider routing and usage accounting remain in place. Failure before/after provider dispatch is handled by the existing reservation rules. Inputs are deleted in `finally`, including downstream failures. Failed delete operations remain retryable by existing maintenance. Abandoned ready inputs are also cleaned after expiry. Account deletion already purges these rows through existing attachment storage handling.

Consumed/canceled rows intentionally remain `failed` tombstones until the upload token expires, even after successful Blob deletion. This prevents replay and lets scheduled cleanup remove any late signed PUT. Unexpired inference tombstones still count toward storage quota. They are never session bindings or share imports. `/attachments/:id/content` denies inference input reads.

## Audio admission and metering

Native WebM Opus is scanned at the encoded-packet level, supporting MediaRecorder files without a Duration field. Channel Ogg Opus likewise counts packets instead of trusting granule timing alone. Both include declared/timeline bounds and reserve measured duration plus1second. Laced WebM blocks conservatively allow120ms per Opus packet. Non-Opus MP4/M4A,MP3,WAV,FLAC uses `music-metadata` and conservatively reserves the full accepted30minute window, refunding to provider-reported actual duration. Missing/invalid duration, unsupported Opus containers and recordings beyond30minutes fail before provider dispatch. This is an explicit bounded service policy, not a promise to accept every audio codec inside an otherwise permitted MIME type.

## Integration handoff

1. Apply migration011; migrations001–010 remain untouched.
2. Root dependency owner adds `music-metadata@12.2.3` (already committed separately in root63d6c18af).
3. Compose `applyCloudInferenceUploadAdapter` from `vendor/provided/cloud-inference-upload-adapter.mjs` on actual branded1852 daemon source. It returns3 count-checked integration anchors. No new environment flag, API key, route mount, rewrite or CORS change is required.
4. Existing Blob token/config and authenticated attachment routes are reused. Gateway terms/ZDR availability remain separately pending.

## Evidence / limits

Local focused checks: complete patched shipped daemon `node --check`; four native adapter tests (large image control-body size, unsigned private PUT, large audio request preservation, cleanup, unchanged small path); actual PostgreSQL migration+claim transaction via disposable PGlite (cross-owner denial, downstream failure cleanup, replay rejection, abandoned-ready cleanup); bounded private Blob read/hash/signature fixture; native90second WebM/Ogg packet fixtures; existing inference/attachment focused tests and TypeScript.

No provider requests, cloud storage operations, database migrations, owner files or credentials were used for these checks. Root must run the real disposable private Blob lifecycle fixture, compose the adapter, rebuild and perform native acceptance before calling this deployed or tested against actual services. Audio fixtures exercise container/packet parsing; a real recorded native WebM/M4A acceptance sample is still needed once Gateway terms permit the bounded live check.
