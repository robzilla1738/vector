# Native-owned Aux memory v2 integration

The actual distribution, source projection and focused filesystem/schema checks passed. This is source/static-stage evidence. The memory executable, native owner APIs and final app have not run.

The original catalog's RSA signature was verified before derivation. The new catalog explicitly uses format2 and has no copied signature claim. Its exact SHA256 is embedded in the native-authenticated sealed entry; future signed-package validation remains required. The runtime descriptor/cache key, executable name and all callers change together. Both supplied model descriptors and model payloads retain their original bytes, modes and cache keys. Old runtime generations remain separate; no existing ciphertext, credentials or installation records are reinterpreted or deleted.

The supplied ModelDownload and MemoryProcess implementations are retained. The adaptation uses fixed bundled catalog/seed paths and the native-captured task home, rejects catalog URL/public-key overrides, refuses quarantine and unauthenticated downloads, and holds the existing broker producer through actual filesystem cleanup. Damaged caches require restart-to-repair from the authenticated bundle rather than using an untrusted remote update.

`source/seed.mjs` derives from the supplied distribution seeder. It checks every selected source file before target mutation, retains valid generations, repairs partial safe caches with a new generation and atomic CURRENT publication, and preserves previously published generations on later failure. Files and directories are synced; pending work and cleanup are physically awaited. Unsafe links and changed sources refuse. The product inlines the seed function and manifest in the sealed entry; its fixture export is not an external product API.

Actual evidence:

- `actual-distribution-a1.json`: original signature verification, real zstd round trip,31 mapped records and unchanged models.
- `actual-seed-fixture-a1.json`: initial publication, retained reuse, partial repair, preservation of corrupt old generations, unsafe CURRENT refusal and bad-source refusal before cache mutation.
- `actual-schema-fixture-a1.json`: actual supplied schemas accept the new runtime and unchanged models; the old runtime format, catalog corruption and overrides refuse.
- `actual-projection-a1.json`:216 anchors per ordinary/dormant source leaf; exact independent original-entry projection and unchanged loader/publisher/ChatGPT helper. No native API was added.
- `actual-static-stage-a1.json`: standalone complete memory stage verification. Its metadata is outside the component tree.

The attempted general app-stage omission is **not an accepted integration**. Its byte comparison passed, but that producer still emits predecessor source that calls the old seed helper. `app-stage-a2-disposition.json` records the mismatch. The general-purpose app/runtime stagers and checker retain their previous coherent behavior. Only the complete v7 source/entry/distribution package omits the three old helpers. `historical-check-app-stage-a2.mjs` records that historical invocation; it is not a current acceptance command.

The standalone format-aware stager/checker is `vendor/provided/aux-memory-runtime-v2-stage.mjs`. The exact combined successor is prepared and assembled by `../runtime-package-a1/runtime_package.py`; it verifies source, distribution and helper associations together. Do not activate the raw distribution or rejected intermediate app stage alone. All signing, native/runtime acceptance, OS capability and release gates remain separate. UI/CSS/assets and the accepted app are unchanged.
