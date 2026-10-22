# Encrypted cookie restoration boundary

Status: encrypted backend retrieval implemented; native import is unfinished. This proposal has not changed the accepted desktop, its UI, the Chromium checkout or the exact cloud signing candidate.

## Established source facts

`inspect-boundary.mjs` reads only the pinned supplied daemon and two native source files. Its four checked excerpts and hashes are in `source-evidence.json`. The supplied `syncCookies` sends browser-global `Storage.getCookies` without an explicit context, then uses the account/runtime generation callback around upload. The examined Chromium155 default-context resolver follows the last-used loaded original profile. The examined explicit-context lookup accepts that original profile or registered off-the-record contexts. Thus adding a `browserContextId` copied from the active tab is insufficient to establish a stable destination for arbitrary normal profiles.

The existing extension `getProfileContext` provides persisted profile ID/path and bound account/user metadata. Those identifiers are not automatically interchangeable with a verified writable CDP browser-context ID. This is a bounded static trace, not a complete inventory of native commands or actual runtime acceptance; an interrupted broad search is not evidence that no other implementation exists.

## Completed backend prerequisite

The original metadata route remains unchanged. New owner-authenticated `GET /drive/cookies/object?generation=N` requires the metadata's exact positive revision in `If-Match`. It reads the current user's ciphertext and account generation together, refuses stale/mismatched generations or revisions, and verifies stored ciphertext size/hash before returning binary bytes with no-store policy and an explicit `X-Aux-Cookie-Revision` header. It returns no plaintext or import capability. Missing preconditions fail428; wrong revision/generation fails412; another owner or deleted snapshot is unavailable404.

No migration was needed. The existing encrypted upload/delete consumer is unchanged. Real-Neon checks cover ciphertext/hash identity, ownership, capture ordering/CAS, generation, revision and deletion/tombstone behavior. The deployed-only runner uses newly generated synthetic sessions/cookies and cleans its own records; it never reads a browser cookie jar. Actual HTTP evidence is recorded separately under `services/aux-cloud/evidence/cookie-export.json` after execution.

## Required native integration

1. Establish the exact supplied bridge route for an account's regular browser profile and native storage partition. Match persistent profile ID, local account ID, cloud user ID and the account/key-generation lifetime. Recheck binding after asynchronous remote work. A last-used profile, active tab or profile path alone is not authorization.
2. Verify/decrypt the downloaded snapshot using the actual account CSK and existing `aux.cookie-snapshot.v1` owner/generation AAD; check ciphertext and plaintext size/hash, original envelope schema and capture metadata. Reuse the original expiration/domain/partition exclusions and canonical cookie parameter conversion. Never import Aux/identity-provider authentication cookies that the supplied exclusions omit.
3. Apply only through a stable native destination tied to that verified profile. Define serialization with profile-account rebinding, profile teardown and concurrent local cookie mutations before enabling writes. Reject private/off-the-record or ambiguous targets; never fall back to global `Storage.setCookies` or clear a jar on failure. The current unsigned signing candidate must not be silently mutated to add this work.
4. Integrate with the supplied sync opt-in/lifecycle rather than a new approximation of its UI. Resolve how multiple normal profiles belonging to the same cloud user map to the current one-snapshot-per-user storage model before automatic restoration; an account's cookies must not be silently merged into an unrelated profile. Verify with two disposable profiles and synthetic cookies after the native binding exists.

The examined code supports neither a full native restore claim nor a promise that an upload test proves restore. New native/daemon bytes require a new concrete acceptance/signing lineage as applicable. The separately pending exact signing plan remains SHA256 `43415d770be82878ab4a5ef0ded4ac525b0f0c8f667246ed652464c42af5d5a9`; this source inspection verifies that plan file is unchanged and performs no signing or profile operations.
