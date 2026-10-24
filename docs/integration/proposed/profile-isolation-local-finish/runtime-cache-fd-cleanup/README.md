# Runtime-cache parent descriptor cleanup

This count-checked source overlay applies to the actual successful a2 inspector (`d09f42b7…`). It changes only descriptor ownership and cleanup:

- `Parent()` puts the duplicated root descriptor into `Fd` before any string construction, and holds every newly opened descendant in a second `Fd` before validation.
- Successful descent swaps the owned descriptors. The previous parent closes when the temporary owner leaves scope; only the final returned descriptor is released to the caller.
- `Fd` destruction preserves `errno`, so `ENOENT`, cancellation and other existing error classification cannot be overwritten by cleanup.

If string construction or substring allocation throws, stack unwinding now closes the current parent. No raw duplicated or descendant descriptor survives an allocation exception. Normal traversal, no-follow flags, private ownership checks, package-mutation allowlist and status decisions are unchanged.

Two exact count-one replacements produce `d67c7ad5acb41a731ecf24aaf8575a5f3433ae854026b0f78fcb94c542d3915c`. Source inspection confirms `Parent()` releases only its returned descriptor and contains no manual close path. This is source evidence only; no new executable, signing, native build or runtime test was performed. The separate a3 recipe will require a real serialized compile/link before packaging.
