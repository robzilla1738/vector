# Explicit legacy notification-backup decoder

Inactive successor. Existing readers, writers, startup paths and stored rows remain unchanged. The actual optional production-linked GN fixture now compiles, links and passes one disposable execution using synthetic independent keys. Evidence: `../aux-native-legacy-inbox-check/evidence/actual-run.json`. The earlier external link failures below are historical; the live-key authority and durable migration gaps still apply.

The historical writer produces `ASIDEAI1` + 12-byte nonce + AES-256-GCM ciphertext/tag with **empty AAD**. The new unchanged codec produces `AUXAI002` with its prefix as AAD. This helper explicitly classifies the old framing, requires an independently supplied historical 32-byte key, and returns authenticated plaintext bytes or a typed refusal. It never tries the new key, DK or another key on failure.

`PrepareExplicitLegacyInboxV2Bytes` requires both keys explicitly, decrypts the original, seals with the actual existing v2 codec, independently reopens and compares the plaintext, and privately constructs a candidate containing exact original/replacement ciphertext plus SHA-256 bindings. It performs no database write. These hashes do not prove scope, custody or permission to migrate. Plaintext remains in process memory only; this code makes no secure-erasure claim.

## Actual legacy authority boundary

Pinned recovered query/master-key/save-worker evidence in `native-notification-inbox-key-source` establishes an independently random 32-byte master key, stored as UTF-8 Base64 in generic-password service `Aside Agent Master Key`, account `Aside Agent`. No explicit access group, Data Protection flag, search list or synchronizable attribute was supplied. Do not assume an accessible default group or row ownership from these facts.

The historical Aux mapper prefixes those strings with `aux.<scope>.`; it does not make that query equivalent to the new v2 derived key. `vendor/provided/native/agent-inbox-master-key.mm` currently creates a random key when its lookup returns not-found. That function is unsuitable as a recovery reader: missing historical data must never cause replacement-key creation. Its default-denied interposer gate is not new native authority.

The existing unselected `LoadAgentInboxMasterKey(home)` still calls the old carrier. The selected native path supplies only the v2 purpose key. No authenticated read-only legacy-key producer is present in these inspected paths. Bounded supplied-daemon source inspection found no `ASIDEAI1`/`inbox_entries` reader; it is not evidence that no reader exists in every original binary.

## Remaining integration

An explicitly reviewed, genuine native read-only historical selector producer must distinguish missing, inaccessible and malformed keys without Add or fallback. It needs real scope/group authority and writer custody. A real backup reader then needs exact row/version/ciphertext selection, durable compare-and-swap replacement, readback and restart handling before a migration can write. Neither caller-supplied key bytes nor this candidate grants those prerequisites. No automatic fallback, SQL rewrite, key reset or new public endpoint is introduced. Compatibility literals remain historical format metadata, not new product identifiers.

## Focused actual-code evidence

`tests/legacy-inbox-test.cc` calls the two actual codec implementations with synthetic bytes. It covers independent keys, binary plaintext, nonce/body/tag tampering, truncation, version refusal and authenticated byte preparation. The actual test-only target now supplies the complete production //base and //crypto closure and has passed a synthetic execution. It has no browser/startup dependency and does not read real legacy keys or migrate rows. The original deferred target file and external attempts remain historical evidence.

## Historical external compile checkpoint — 2026-10-23

Single serialized session `29663` compiled the actual legacy codec, unchanged v2 codec and synthetic fixture with the existing AuxFast crypto target flags, PCM and diagnostic plugins. All three compiler exits were zero. External linking failed: Apple ld does not accept Chromium's existing thin archives; it also warned that the bundled libLTO path was absent. No binary was produced or executed. This is compile evidence only, not successful decryption/roundtrip/runtime acceptance.

`evidence/receipt.json` preserves exact commands and source/index hashes, plus actual compiler/link logs. Thin archive hashes cover indexes, not all transitive object members. `check-existing.py` is the bounded external recipe; it changes neither shared source nor GN and refuses an existing output. No retry or additional native graph was queued. A future reviewed link using the actual compatible Chromium linker/target remains needed.

## Historical LLVM link-only follow-up

Session `42226` stopped in preflight before invoking a linker: three unit-test-only archives from the inspected GN target had never been built. That recipe and failure are preserved. The one actual LLVM link attempt, session `48469`, reused all three compiled objects without recompilation and selected Chromium's `ld64.lld` using the real GN target's `-fuse-ld=lld`. It hashed 2,627 inputs including 2,248 thin-archive object members, tools, objects and SDK metadata.

LLVM accepted the thin archives, but linking failed on genuine Perfetto/protozero source-set symbols pulled by base logging/dump-without-crashing. The external recipe included target archives and Abseil source-set objects, but not the complete production source-set closure. No unresolved-symbol suppression was used. No binary or fixture ran, and no further attempt was queued. This narrows the tooling gap; runtime acceptance remains unverified. `evidence/lld-link-receipt.json` and `lld-link.log` preserve the actual failed attempt.
