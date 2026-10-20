# Explicit frozen original implementation sources

The original installed1852 UI directory disappeared during an application update. Missing inputs must not bypass preservation checks or select a newer component version. This adds a reusable explicit resolver and a seven-anchor proposal against root's current checker. No source pins, staged output, adaptationInputs catalog, transform, package CLI or native files are modified.

New module: `scripts/lib/provided-source-snapshot.mjs`.

```
node scripts/check-provided.mjs STAGE --source-snapshot /absolute/project/out/FROZEN
```

Without that optional argument, the checker retains its existing installed source roots and strict missing-file behavior. Unknown, repeated and missing flags are rejected. With it, every original source read in the checker (UI, original daemon/CLI SEA, relocated runtime text and helper original binary/assets) resolves only through the verified snapshot. Original staged-output hashes and anchored transformations are still independently replayed; the resolver grants no exemption for missing or changed bytes. All other unchanged runtime/memory inventory records are also verified, not merely the anchored text read by the checker.

`resolveProvidedSourceSnapshot({snapshotRoot,repositoryRoot})` returns null when no explicit root was given; otherwise `{root,manifestPath,manifestSha256,roots,inventories}`. `roots` supplies the existing staging APIs' source-root arguments for a future explicit restage. Current stage CLI/provenance is deliberately unchanged: current packaging can check its already-staged candidate without a new adaptation provenance cycle. Root owns package argument forwarding and recording the returned manifest digest.

Snapshot manifest shape:

```json
{
  "version": 1,
  "kind": "provided-source-snapshot",
  "components": {
    "agent": {"path":"agent","pinFile":"docs/source/provided-ui-inputs.json","pinSha256":"<canonical pin-file SHA256>","sourceVersion":"1.26.1016.1852"},
    "vault": {"path":"vault","pinFile":"docs/source/provided-ui-inputs.json","pinSha256":"<same canonical SHA256>","sourceVersion":"1.26.1016.1852"},
    "daemon": {"path":"daemon","pinFile":"docs/source/provided-app-inputs.json","pinSha256":"<canonical SHA256>"},
    "cli": {"path":"cli","pinFile":"docs/source/provided-app-inputs.json","pinSha256":"<same canonical SHA256>"},
    "runtime": {"path":"runtime","pinFile":"docs/source/provided-runtime-inputs.json","pinSha256":"<canonical SHA256>","sourceVersion":"1.26.1019.335"},
    "memory": {"path":"memory","pinFile":"docs/source/provided-runtime-inputs.json","pinSha256":"<same canonical SHA256>","sourceVersion":"catalog-1792381929"},
    "computerUse": {"path":"computer-use","pinFile":"docs/source/provided-computer-use-inputs.json","pinSha256":"<canonical SHA256>","sourceVersion":"1.26.1020"}
  }
}
```

All seven components are mandatory. App inventories have no version field in their canonical pins, so no independent version is invented: exact pinned app bytes establish identity. Each other version must equal its canonical pin. Every manifest pin filename is fixed by component and its full file digest must match the unchanged repository file. Every pinned file must match full hash, size and mode where recorded; directory and dependency-link records retain their exact types, modes and link bytes. Dependency links must resolve within their component. All additional files, special nodes and empty/unlisted directories fail; implicit parent directories of pinned leaves are allowed. Component roots are relative, contained, real directories and cannot overlap. The snapshot must be inside the project workspace; neither root nor its project-relative parents may be symlinks. Recovery receipts may live outside component directories, never among their implementation leaves.

The helper performs only static reads/hashes. It does not recover missing bytes, invoke supplied code, select newer releases, create state, access Keychain, change source modes or grant runtime authority. Other lanes recover and assemble exact originals independently.

Verification: seven disposable fixture tests pass (`node --test scripts/lib/__tests__/provided-source-snapshot.test.mjs`), including exact inventory/dependency success plus missing/drift/extra/mode/version/pin/completeness/root/link/argument refusals. Resolver/checker syntax checks and immutable seven-anchor checker replay pass. The actual recovered seven-component snapshot and complete candidate preservation audit remain integrator verification; no successful package claim is made here.
