# Preserve lazy startup and register fixed browser execution

Three counted changes per exact diagnostic-a2 resource join the existing lazy wrapper to the existing browser REPL owner. No app, signature, credential, provider call or shared native source changed. This is separate from the still-undiagnosed no-tool agent initialization failure.

The old registration queried `auxBrowserRepls` with the lazy wrapper, but only the constructed REPL is in that map. It silently returned an unregistered tool. The existing execution boundary then required supervised execution even for the fixed browser REPL.

The wrapper now privately registers its resolver. Tool registration records an `awaited` proxy without calling that resolver. Only execution through the existing bound-browser branch resolves the original factory, obtains the real `auxBrowserRepls` owner, and delegates to that owner's existing `awaited(operation)`. All existing native selected-account/session/window guards, cancellation, held PDFs/utilities and QuickJS paths remain unchanged. Missing native owner fails closed; arbitrary/unregistered tools and the generic runtime retain their supervised guard. No new execution backend or eager privileged runtime is introduced.

The resolver captures original account incarnation/creation and session creation at lazy-wrapper creation, refusing replacement before constructing or reusing a REPL. Disposal remains lazy, idempotent and awaited, including when the wrapper was never used.

`proposal.json` holds exact input/output hashes and three single-count substitutions for both `/private/tmp/aux-agent-start-diagnostic-20261026-a2/` modules. `prepare.py NEW_DIRECTORY` refuses changed inputs or anchors and creates derivatives only. Final prepared output: `/private/tmp/aux-lazy-registration-20261026-a1/`. Root should compose these with the diagnosed initialization repair before package/signing; do not revert the diagnostic or other current resources.

Validation: focused execution of the actual changed wrapper/registration/router functions checks zero construction at startup, one construction on use, native owner rejection, account/session replacement refusal, awaited idempotent disposal, no construction on unused disposal, and unchanged generic/unregistered/missing-state guard behavior. Both full modules pass `node --check`. Actual browser/PDF/utility acceptance remains unperformed; no model call was made.
