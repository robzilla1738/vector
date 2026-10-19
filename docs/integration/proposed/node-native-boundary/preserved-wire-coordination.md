# Preserve supplied protocol spellings

Supplied-wire preservation is authoritative; Aux changes product branding, assets, isolated home/ports/bundle/extension identities. This slice updates both runtime adapters together. Shared native and UI integration remain root-owned; do not launch a mixed protocol stack.

## Exact adaptation changes

Removed daemon edits for HTTP domain (2), dev domain (1), daemon token scheme (3), WS prefix (2), CDP scheme (1), JWT audience (4), JWT issuer (5), HTTP offset24→22 (2), WS offset18→16 (1). Original lowercase health service `aside-daemon`, audience/issuer and prefix offsets remain unchanged. CLI removes WS prefix rewrite (2) and preserves original auth spellings through product branding.

The pinned daemon has663 original proper-case Aside occurrences; nine bundle-identity replacements leave654 before visible/nonwire branding. Five protected categories: daemon session token3, CDP session token1, HTTP auth domain2, dev auth domain1, method/dispatch78. Original raw Aside. count88 includes10 visible prose periods: these still brand to Aux. The method group comprises77 full method occurrences and one quoted startsWith(`Aside.`) dispatch prefix. Longest method names protect getTabs/getTab collisions. Remaining569 product/internal occurrences brand Aux.

Pinned CLI has101 proper-case occurrences before branding, protects daemon token2 and HTTP domain1, leaving98 visible/nonwire occurrences. Its fixed loader copied from root's current accepted adapter loads only `../Resources/native/aux-native.cjs`; no env override, embedded binding or original fallback is restored.

`vendor/provided/wire-brand.mjs` exports `brandProductPreservingWires(source, {productCount, wireCounts}) -> {code, edits}`. All five category counts must be explicit, including zero. `wireCounts['Aside.']` denotes full method occurrences plus quoted bare dispatch prefix, not prose. It verifies product/wire counts, rejects temporary-marker collisions, protects longer literal methods first, brands remaining proper-case identifiers, then restores original tokens. `edits` are ordered replayable `{name,kind,find,replace,count}` records. Root UI may retain its separate helper; no UI source changed here.

## Native coordinated work remains pending

The earlier source-only native auth proposal still prefixes `Aux Daemon Auth v1\0` length19 in installation_auth.cc and auth_scheme_probe.cc. Root must change both to original `Aside Daemon Auth v1\0` length21, while CDP keeps original raw32 challenge verification without any domain prefix. Proposed aux_cdp_authority.cc still uses AuxSessionToken for response/header; both must become original AsideSessionToken. Current native supervisor health service check, HTTP scheme/header and any private API native signer callers must preserve original spellings too. Do not restore original home, bundle, installation namespace or ports. Legacy private PEM export remains fail-closed. This slice edits none of those shared native/proposal sources, avoiding collision with root's composition.

Six focused tests pass: unknown-source rejection, P256 disposable test-adapter signature domain distinction (not production crypto evidence), every pinned daemon method count and original dispatch branch/auth/health/offset preservation, real CLI syntax/assets/entry/tail preservation and complete count-anchor replay, and helper drift/replay checks. No supplied daemon/native binding, account/profile, Keychain, model or network operation was executed. Pending current native build handles31341/27971 remain live and silent.
