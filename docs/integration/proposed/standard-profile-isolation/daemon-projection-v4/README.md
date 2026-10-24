# Fixed provider cleanup composition producer v4

New inactive producer after the actual successful a3 / 166-anchor projection. It does not overwrite earlier producer, projection, source, shim, native or package artifacts. Root runs preparation and production after integration; this lane only prepares the scripts.

The fixed daemon order is **Claude-code login (6), Meta login (3), ChatGPT login (7)**, producing 182 total anchors / 150 added since the original research pair. All original 166 anchors, nine prior stage outputs and inherited 153/118/32 ancestry stay intact and are replayed before adding these 16 changes. Each source lane's isolated a3 input/output review is independently checked before measuring the combined result. Ordinary and dormant inputs are transformed separately.

The ChatGPT source changes require a separate, coupled `aux-chatgpt.cjs` successor. The fixed four-anchor transform derives it from the exact repository input in the reviewed overlay; no product shim is imported or executed. Its source, output hash, package-relative destination, anchor list and overlay association are retained in `composition.artifacts` (exactly one `chatgpt-shim`) and `chatgpt-shim-receipt.json`. The daemon source receipt and final projection evidence bind both the shim bytes and its receipt hash. Packaging must install and verify this exact sidecar together with the daemon pair. This proposal does not grant arbitrary auxiliary-file replacement.

`contract.mjs` pins all three overlay digests and their exact dependency lists, exports and counts. `prepare-review.mjs` refuses an existing review, verifies all predecessor receipts and transitive inputs, replays isolated and combined sources, checks syntax and writes root-only `immutable-inputs.json` plus `review.json`. It does not run the original projector or product.

`freeze.mjs` pins that immutable review, every transitive input, the producer files and current Node executable for one direct fresh `/private/tmp` output. `produce.mjs` checks every frozen input before and after, replays the entire source chain, writes fresh helpers/shim, and invokes only the existing original dormant-entry projector. The independently transformed entry must exactly equal that projector's output; loader and publisher helper bytes must remain identical. No generated daemon or shim is executed.

Root sequence, with an unused pins path and output directory:

```sh
node docs/integration/proposed/standard-profile-isolation/daemon-projection-v4/prepare-review.mjs
node docs/integration/proposed/standard-profile-isolation/daemon-projection-v4/freeze.mjs /Users/rcourson/Documents/Vibe/web /private/tmp/aux-provider-final-v4-pins.json /private/tmp/aux-standard-daemon-projection-20261024-a4
node docs/integration/proposed/standard-profile-isolation/daemon-projection-v4/produce.mjs /private/tmp/aux-provider-final-v4-pins.json /private/tmp/aux-standard-daemon-projection-20261024-a4
```

The composition preserves prior `previousStandard*` and `previousManaged*` ancestry, adding only `previousInteractiveProjection`, `previousInteractiveComposition`, their SHA-256 values, original inputs and appended-stage metadata. Publisher helpers add `previousInteractiveOutput` and keep all old derivation fields. Final evidence uses `aux.standard-daemon-projection.actual.v4`.

Meta's browser-window destruction acknowledgement and ChatGPT's inherited-FD lock subprocess still preserve native unknown. All existing native descendant observer, broker ownership, cold refusal, runtime authority and native pairing requirements remain unchanged. Successful static projection is not product execution, activation, signing, packaging or runtime/provider acceptance.
