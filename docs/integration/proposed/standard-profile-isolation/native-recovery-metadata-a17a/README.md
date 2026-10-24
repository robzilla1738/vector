# Exact original metadata for interrupted native transactions

This append-only snapshot change exports the actual retained original optional `base::Time` last-access/last-modified values and optional `base::ByteSize` total size. Existing map IDs, selected values and complete cryptographic digests stay unchanged. Digest-only metadata cannot be reconstructed truthfully after the physical owner process dies; replacing an unknown original value with a computed size or current timestamp would change the original state.

The wire consumer must serialize times as nullable signed decimal strings of exact microseconds since the Windows epoch, and size as a nullable unsigned decimal byte string. These values can exceed JavaScript's exact number range. The native verified-journal consumer parses strings exactly and constructs typed optional values; absence remains absence. This is factual data only, not recovery/admission authority. The productivity and navigation lanes own wire/journal consumption respectively.

Two files / two exact anchors over A16. Exact replay, reverse applicability and whitespace checks only; root owns actual compilation and runtime acceptance.
