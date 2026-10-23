# Optional actual legacy inbox codec fixture

Inactive optional GN target; source/mapping preparation only. No native checkout or GN file has been changed by this proposal. Nothing is added to the shipping browser or startup graph. No build or test is scheduled here.

`mapping.json` maps six exact prepared files to native destinations. Five are byte-identical copies: the actual legacy codec/header, unchanged shipping v2 codec/header, and synthetic test main already compiled in the isolated three-TU check. The only new source content is the optional `testonly` executable GN target. Its only direct dependencies are production `//base` and `//crypto`; GN resolves their actual source sets and archives. No manual Perfetto/Abseil archive list, unit-test library, gtest or replacement crypto is used.

Root integration must retain the exact existing v2 codec hashes, register only the optional target in the chosen fixture root group, and own the composition/application. Target: `//chrome/browser/aux/legacy_inbox_fixture:aux_legacy_inbox_codec_fixture`. With the target generated, a future serialized `autoninja -C out/AuxFast -j2 aux_legacy_inbox_codec_fixture` builds it, and its binary can run only against the synthetic fixture. This document is a deferred recipe, not an instruction to activate production recovery.

The actual main constructs one synthetic historical empty-AAD AES-GCM envelope with a fixed synthetic key/nonce and checks decode, missing/wrong key, framing and nonce/body/tag tampering, then conversion using a different synthetic v2 key, exact original ciphertext/hash retention, v2 reopening and cross-version/key refusal. It calls both real codec implementations. All three TUs compiled previously; external linking failed because its hand-selected closure omitted production source-set dependencies. This target delegates closure resolution to GN. No successful runtime result is claimed yet.

This fixture provides no key authority, writer custody, database migration or permission to read historical rows. Actual safe historical-key capture remains missing; existing create-on-not-found helper must not be used for recovery. UI and accepted app remain unchanged.
