Browser host registry source request

Moves the exact 154 browser methods and 26 browser events into browser-host-methods.ts. Moves the exact 70 authenticated runtime methods into runtime-host-methods.ts. Shared capability schema retains its original validation. The full facade combines original browser then runtime entries without filtering, aliasing, or schema changes. The generated production browser client imports only the browser registry.

Verification: workspace dist rebuild and shell typecheck PASS; scoped lint PASS; eight real registry/client controls PASS; original full schemas/metadata/key order comparison PASS; generation check preserves 224 methods / 26 events and original hash 5a32635d3dbe. Exact seven-leaf replay forward/reverse/forward PASS. Original schema digest includes both argument/result schemas, wireArgs, event payloads, metadata and key order. No runtime validators removed.

Root owns contextual adoption and packaged renderer budget verification. No renderer-size claim or native qualification is made by this source export. M4 draft remains isolated.
