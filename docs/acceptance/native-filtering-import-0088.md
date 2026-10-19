# Native filtering and import slice 0088

Implementation follows approved `docs/spec/native/adblock-import.md` F1–F4 and I1–I2. This is an independently authored implementation using Chromium, RE2 and SQLite; it is not full acceptance of those sections.

The native profile service implements all 14 filtering methods, owner-only atomic source persistence, HTTPS subscription validation and public-address network enforcement, conditional updates, source diagnostics, bounded parsing, generation arbitration and retention of the working engine on failed source updates. The request and navigation throttles enforce network rules, exceptions, supported redirect/rewrite actions and a tab-bound, expiring, single-navigation interstitial bypass. A document-bound Mojo service supplies browser-derived cosmetic rules to an isolated renderer observer. Static CSS and bounded text/attribute/computed-style procedural matching observe DOM changes and suspend on page lifecycle events. The original engine supports domain/type/party/method options, RE2 expressions, exceptions, important rules, removeparam and three bounded redirect resources. Unknown syntax produces diagnostics. Native `aux://adblock-internals` uses this same service.

The four import methods and progress event implement source/profile/category consent, read-only SQLite backups, category progress, cancellation and partial failures. Chromium-family bookmarks preserve roots and folder hierarchy; history imports actual visit timestamps and transitions, titles and source count metadata. Firefox places import preserves timestamps and bookmark hierarchy. Supported preferences use an explicit allowlist and respect managed destination preferences. Native `aux://import-data` uses the same importer. Source paths are native-discovered and never supplied by an extension caller. Extension imports require a user gesture and jobs are scoped to the initiating profile and extension.

The patch also registers two sidebar expansion list preferences and applies the explicitly requested early mock-keychain switch only to nonofficial local macOS Aux browser builds. It does not use that destination key to decode source browser secrets.

## Evidence

- Enabled native compilation passed owned engine, renderer observer, service, throttles, cosmetic host, native WebUI, import service, migrator, extension API and generated registration objects.
- Actual browser request/navigation hooks, Mojo binder, renderer startup, WebUI registration, browser preferences and early Chrome delegate integration objects compiled.
- Engine fixture probe passes network blocking, exceptions/important precedence, request options, redirects/rewrites, regex attribution, cosmetic/procedural matching and subscription URL guards.
- Final scheme-registration object compiled. The rebuilt `migrator_probe` passes disposable Chromium/Firefox snapshot, bookmark hierarchy, exact integer timestamp, source-count, preference allowlist and unsupported encrypted-category fixtures. It explicitly initializes Chromium SQLite, canonicalizes the temporary fixture root for no-follow opens, uses shared source locking, and enforces a page-size-aware 256 MiB snapshot bound.
- Both original native WebUI scripts and the isolated renderer script pass JavaScript syntax checks.
- Consolidation includes only owned new files and explicitly approved shared integration hunks. Reverse application against a scratch copy passes; unrelated dirty Chromium work is preserved.
- No owner browser profile was opened, imported or altered. No full app relink or browser runtime observation is claimed by this slice.

## Remaining acceptance gaps

- Source Safe Storage decoding and actual Chromium PasswordStore/cookie-jar migration are not implemented. Passwords and cookies are unavailable before starting and unsupported requests fail explicitly. Firefox cookie migration, extension installation metadata, Arc pinned data, Safari ZIP migration and application-identity verification remain outstanding. Known source-family paths need independent fixture coverage. The current probes cover generic Chromium and Firefox layouts only.
- History service writes are queued through real Chromium services; the importer does not yet await a durable history backend completion acknowledgment. Source counts are retained as metadata; expired source visits cannot be reconstructed from URL summary counts alone.
- Cosmetic resources are fetched once per document; changing enabled state or rules does not yet update styles in an already loaded document. There is no native WebSocket request hook. Full procedural/scriptlet parity is not claimed; supported operators are the bounded literal forms described above.
- Raw-source persistence is implemented. Compiled binary cache persistence is absent and diagnostics honestly report no compiled-cache hit. Automatic scheduled subscription refresh and richer manual-filter error reporting remain outstanding.
- Native runtime fixtures must still verify interstitial bypass, resources and DOM mutation, subscription update/restart/failure behavior, importing into real disposable destination services, cancellation and event isolation. Full source-family, encrypted migration, malformed archive and final noncomponent app acceptance remain outstanding.

Patch 0088 applies after 0089 because the sidebar preference delta is based on that integrated profile-gate state. The integrator controls patch-series order.
