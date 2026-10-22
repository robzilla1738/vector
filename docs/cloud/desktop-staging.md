# Supplied desktop cloud integration

Cloud access is an explicit build option. Omitting `--cloud-profile` preserves the local-only implementation; shell environment variables do not enable cloud access. The current accepted desktop app is not replaced by staging.

```sh
node scripts/stage-provided.mjs \
  --source-snapshot out/provided-source-snapshot-1.26.1016.1852 \
  --output out/provided-reuse-cloud-development \
  --app-path /Users/rcourson/Documents/Vibe/web/out/provided-candidate-cloud-development/Aux.app \
  --cloud-profile development
node scripts/check-provided.mjs out/provided-reuse-cloud-development \
  --source-snapshot out/provided-source-snapshot-1.26.1016.1852
```

The policy fixes API and sharing origins to `https://dev-cloud.getaux.co`. Production is a separate explicit profile, with fixed `api.getaux.co` and `share.getaux.co` origins; these services are not production-ready yet. Arbitrary origin overrides are rejected. Installer, release and telemetry restrictions are preserved.

The cloud Agent has its own reviewed content fingerprint and version1856; the local profile retains1855. This prevents Chromium caching the old worker without changing extension identity. A production fingerprint must be reviewed separately before that profile stages successfully.

Both the SEA daemon and generated Node development daemon receive the same actual1852 Drive, encrypted-session, attachment and private-media adaptations. The CLI receives the fixed API origin. The Agent receives API routing and the narrow annual-discount copy correction. Component manifests retain replayable patches and code hashes; stage, assembly and package reports carry the resolved cloud policy. All cloud source modules are included in adaptation provenance. The archival Vault input is not enabled or shipped.

The cloud daemon needs a48 KiB larger SEA reservation. A layout-restricted re-embedder relocates only trailing LINKEDIT metadata, checks every original file-backed native section/address and retains the metadata payload verbatim. Unknown load commands/layouts fail closed. Focused structural checks and actual pinned-input generation pass; a signed runtime launch is still required.

Staging is not launch acceptance. The newly modified daemon and CLI invalidate their old signatures; the previous exact-byte signing exceptions do not authorize signing these artifacts. Prepare a complete unsigned copied package and exact changed-file review before requesting any new scoped local signing exception. Original native addons, runtime bytes, canonical Aux branding and existing UI styles must remain unchanged. Use disposable Aux state, never the owner's profile.

Required acceptance after packaging: actual email sign-in and refresh/revoke; text/dictation with mandatory ZDR and the owner's $5 cap; actual two-state sync/conflict/restore and attachments; sharing/revocation; sandbox plan checkout and account lifecycle. Cookie capture/upload/delete is implemented; the supplied1852 daemon has no restore/import consumer, so cross-device cookie restoration remains an explicit integration gap.
