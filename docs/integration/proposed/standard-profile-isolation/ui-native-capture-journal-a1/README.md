# Retained-owner UI capture journal — 2026-10-24

The private journal is projected into the actual native `AuxOwnedCommandDispatcher`. It persists and reads back immutable **unqualified capture data**, with discovery of completed/partial capture directories for lost replies. It does not claim that target stores migrated, that writers drained, or that startup is authorized.

## Implementation and ownership

The three internal methods enter through the existing real `withEntry` lifetime/execution guard and `guardedFreshAction` before/after/throw observations. They retain the actual `NativeFreshRuntimeCapturedContext.owner` through synchronous IO, sync and readback. The private store accepts no arbitrary root/FD constructor. It duplicates the authenticated browser user-data root from that owner and revalidates generation and actual directory identity.

Four source replacements add the journal and a read-only guard through the actual coordinator/cold guard/root admission. The real root admission must already be **ADMITTED** before any journal operation. The journal cannot call startup receipt issuance or mutate admission to satisfy its own prerequisite; it cannot invalidate the fresh PREPARED marker-only inventory.

Capture directories use exclusive random UUID names. FD-relative no-follow operations require private directory/file modes, current UID, regular single-link bounded files and no extended ACL. Data/binding/readback, directory sync and an immutable final READY receipt precede success. Failures preserve partial directories. Load checks exact policy/initial-journal/root association and canonical receipt/hash/size. Previous-generation data returns its source generation separately; it is never promoted to current proof. Discovery returns only UUIDs, including partials; loading performs the full checks. Each scan opens an independent directory description so it cannot advance the retained root's cursor or skip entries on later scans.

All records use `phase:"captured-unqualified"` and `activationAuthorized:false`. Payloads are bounded JSON objects with the capture-input format; their profile/view claims are still unqualified data. This does not introduce a credential format, derive new keys or read credentials.

These are native-only Swift seams, not registered in the NAPI/string dispatcher, not exposed to arbitrary renderer callers and not yet bridged to the browser controller. There is no new general-purpose root writer.

## Actual evidence

`actual-typecheck-a3.json` passes with the actual48-source production Swift context and original target/macros/SDK. `daemon-source-composition.json` pins the four replacements and unchanged44 sources to the actual a6 predecessor manifest. It is a source composition, **not** a new daemon link/package receipt. The48 original sources remain unchanged.

The initial a1 typecheck lacked the ADMITTED guard and is explicitly rejected (`typecheck-a1-disposition.json`). The a2 guarded typecheck remains valid for its historical source plan/patch/command. Current a3 adds the independent scan cursor and is the active source composition. This is compiler evidence only: no filesystem fixture, native API, daemon or product ran.

## Remaining implementation

The browser controller must bind real Profile/view/epoch owners to captures, settle editor/upload/page/background writers, qualify a complete inventory, and bridge the actual native owner. It must journal target intents and complete cross-store writes/readback/recovery before activation. A capture backup is not that transaction. Live legacy-state UI bootstrap, profile metadata/other stored identities, full CLI native startup/writer coverage and actual disposable app/recovery/extension/provider/UI acceptance remain open.

No accepted app/UI or current inactive package changed. No signing, release, app lifecycle, owner data, provider request or OS permission was used.
