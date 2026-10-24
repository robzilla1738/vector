# A9b — Chromium checked pointer fields

Root's real Chromium compiler requires the two non-owning native control fields to use `raw_ptr<T>`. This exact three-anchor successor adds the correct header and changes only those field types; it introduces no exclusion annotation, binding, ownership, readiness or authority change.

The returned view is ephemeral. Reacquire it for each immediate call from the actual same context and compare the wrapper-owned generation; do not retain a control proxy or this `raw_ptr` view across asynchronous service replacement. The original request and opaque server token remain retained data, and an old token cannot be adopted by a successor service.

Exact replay/reverse/input/whitespace passed against the committed A9a output. Root owns actual compiler verification. No native build, app lifecycle or runtime acceptance occurred in this lane.
