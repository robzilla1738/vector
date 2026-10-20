#155 nonvoid weak callback compatibility

Actual376 compilation rejects direct method/WeakPtr binding for nonvoid callbacks: `WeakPtrs can only bind to methods without return values`. Correct all **three** affected real slots (optional-rect saved update, boolean saved finish, boolean bookmark begin), not only the first displayed diagnostic.

The new bindings use noncapturing lambdas with an ordinary WeakPtr argument. A live owner calls the same concrete method; an expired owner returns nullopt/false. The supplied callback types and successful behavior do not change. Existing void cleanup/projection callbacks keep their normal Chromium weak bindings. Explicit Retire still performs genuine cleanup; an expired return cannot claim a successful conversion.

One exact current376 baseline/output pin, three counted replacements, immutable actual build log and binding API snapshots. Original18def proposal stays unchanged. No native writes, builds or runtime acceptance. Root owns actual apply/compile.
