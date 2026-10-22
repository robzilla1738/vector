# Aux provider identity: reviewed integration lane

This successor-only helper migrates model-provider contracts to match the cloud
backend's new `provider: "aux"`. It is not activated by importing this module.
No existing adapters, manifests, accepted app, cloud deployment or stored profile
were changed in this lane.

`inputs.json` pins the original1852 daemon JavaScript SHA and17 actual Agent
provider/selection/settings/icon modules. Each rewrite has an exact occurrence
count and original text. `applyAuxProviderIdentity` authenticates the caller's
original static input, then replays those anchors over supplied or Aux-branded
composed text. Unknown files are untouched. Changed/mixed/already-migrated inputs
fail rather than silently getting partial edits. There is no global quoted-aside
replacement: HTML parser/tag modules, JSX aside elements and unrelated owner/crypto
identities are excluded.

Covered paths include provider/model selection defaults and categories, built-in
provider catalog policy maps, runtime provider/API IDs, image-provider selection,
provider listing/auth/model resolution, subscription usage checks, original credit
policy checks, existing provider-icon map keys, provider cache keys, model catalog
settings and provider JSON source/disconnected metadata.13 original hosted request
header occurrences become `x-aux-*`. Optional injected `X-Aside-Auth-Protocol`
markers require the exact expected occurrence count; original pinned1852 inputs
contain none. An already generically capital-branded marker needs no further edit.

## Root integration

1. Add the helper, this pin inventory and migration logic to successor adaptation
   inputs. Retain original static input inventories outside the delivered product.
2. Pass `{ component, path, text, original, branding: 'aux' }`, where `original` is
   the exact pinned source text and `text` is the existing composed Aux text. For
   daemon use path `entry.mjs`. Apply **before** broader lower-case identity edits;
   symbolic Aside-to-Aux branding is supported. Preserve returned anchors in the
   replay/preservation manifest. No CSS/fonts/images are transformed.
3. Run the explicit state migration transaction against authorized Aux state before
   exposing the renamed provider to its consumers. Do not infer permission to read
   owner profiles or credentials. Keep accepted app and old state recoverable.
4. Coordinate all daemon/Agent copies with the cloud API producer commit72ecc21de.
   Model catalog's actual schema must receive Aux; an old running client expects
   the former identity. Original pricing consumer dynamically forwards new lookup
   keys and needs no layout/formatting changes.
5. Package and test the complete successor. These fixtures are not a runtime
   handshake, desktop-state migration, staged preservation or visual acceptance.

## Explicit offline state migration

`migrateAuxProviderState` accepts a version1 envelope and returns version2; no files,
network, Keychain, decryption or account lookup occurs. Its caller supplies mapped
`settings`, `sessions`, `agentSettings`, `modelsJson`, `credentialStore`,
`providerCache`, `modelCatalog` and `browserStorage` fields as applicable. It clones
unknown fields; preserves chosen model IDs, reasoning/fast-mode options and opaque
credential bytes; renames only known provider/config identities. Per-account
`aside.agent-settings.v2:*` and `aside.settings-inventory.v1:*` entries migrate to
versioned Aux keys and their parsed provider selections/inventories migrate together.
Malformed historical storage and old/new key collisions refuse the transaction;
there is no fresh-default/key-reset fallback. A version2 envelope is idempotent.
Actual writer integration must validate schemas and persist atomically before its
version marker, with failure retaining originals. This pure helper alone does not
supply a persistent transactional writer or authorize credential re-encryption.

## Verification and limits

Three focused tests replay all actual pinned modules in supplied/Aux symbol forms,
parse resulting JavaScript, exercise the exact supplied model catalog schema with
new Aux responses, preserve genuine HTML semantics, reject source drift and prove
model/credential/cache preservation with collision/corruption refusal. Both local and cloud-development composed daemon replays passed39 provider
anchors against the existing adapters.

Run `node --experimental-vm-modules --test vendor/provided/aux-provider-identity.test.mjs`.
The fixture reads only the frozen project-owned1852 source snapshot. No provider
request, real account state, native build/signature or UI browser operation occurs.

This is one contract migration, not a no-trace audit. Private symbol names,
legacy credit-error discriminants, unrelated runtime/skill/browser identities,
installation and cryptographic legacy readers, truthful historical fixtures and
legal notices remain for their separate coordinated migrations. Do not rename
those independently with this provider-only pass.
