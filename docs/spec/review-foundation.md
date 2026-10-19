# Foundation fresh build review

Reviewed 2026-10-19 from approved build-facing specifications only: daemon core/agent, UI tokens/newtab/chat and native platform/apis-core/omnibox/adblock-import/surfaces. No reference implementations, bundles, provenance ledgers or reference application were inspected.

The reviewed prose contains behavior, measurements, validation and interface descriptions rather than executable implementation extracts. No reference-specific private implementation identifiers were identified. Public Chromium concepts and explicitly Aux-owned contracts are usable. This is a review of these documents, not an audit of upstream provenance or shipped artifacts.

Ready for independent construction: daemon loopback HTTP, P-256 challenge authentication and token validation; account-scoped durable state; bridge registration, replacement, liveness and request correlation; session lifecycle and human-action suspension; semantic tokens and measured input/chat dimensions; native lifecycle gate, API signatures, omnibox revision ownership, filter resource limits and importer lifecycle.

Material unresolved details remain: settings key/type/default inventory and invalidation payload, account security/bootstrap disk state, native open-object schemas and preference defaults/ranges, browser command allowlist and policy mapping, viewport extension methods, full procedural filter operators and native/extension visual captures. These cannot be called parity-complete. Explicitly new Aux contracts may coordinate missing serialization details, but must be labelled design choices. Agent API breadth is implementable incrementally; unsupported routes must fail rather than return fabricated successes.

For core implementation Aux chooses PKCS8 PEM installation-private.pem, SPKI PEM installation-public.pem and a separate session-secret under AUX_HOME; private files mode 0600. Registry JSON is version 1, mirrored from transactional SQLite; account folders are u/<numeric-id>. These choices complete cross-language signing/storage coordination and are not claims about reference serialization.

## L1 implementation choices and focused evidence

The daemon uses Hono, standard plain-transformer tRPC and a separately authenticated WebSocket bridge. `createDaemon({extendRouter})` admits domain routers; Store exposes accountHome/accountDb and namespaced get/all/set plus account-deletion callbacks. SQLite owns account identity and bindings; accounts.json is an atomic public metadata projection. Token auth uses the published PEM encoding. No cloud credentials are manufactured.

Settings inventory currently covers theme, contextAwarenessEnabled, sidebarRecentLimit, completionSoundEnabled, defaultModel, permissionMode and followActiveTab. Unknown setting mutations reject. Context files are instructions.md, context.md and profile.md. Completion audio is capped at 10 MiB as an Aux choice. `/events` carries account-labelled settings invalidations. Permission/capture reconciliation and native recent projection refresh require domain integration. Native bootstrap lock state remains an integration gap; initialized denotes local account registry provisioning only.

The bridge provides constrained API command names, explicit CDP method admission, correlation per connection, replacement-safe close, acquisition deadlines, cancellation, pings and disconnect rejection. Human-action policy belongs to the invoking agent tool boundary; this transport does not constitute completed browser policy acceptance. Secure CDP remains native-owned, with no JavaScript proxy.

Focused Node tests verify signed challenge consumption/failure/expiry, session expiry, key permissions, account isolation, restart persistence, non-reused deleted IDs, traversal rejection, foreign HTTP Host/Origin rejection, authenticated plain tRPC, WS command/reply, cancellation and replacement arbitration. Packaged/browser cross-language auth, helper shutdown, live liveness timeout, full native and visual acceptance remain outstanding.
