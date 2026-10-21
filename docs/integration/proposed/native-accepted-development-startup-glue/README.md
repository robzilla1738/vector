# Accepted development startup: build wiring and reader bound

Apply after `native-accepted-development-startup` (commit 8bdc63447). BUILD file preimages are the actual v571 checkout; the new header preimage is that proposal's exact output. This changes no scope, acceptance requirement, signature pins or runtime authority.

Both macOS `//chrome:chrome_dll` and `//chrome/app:test_support` compile the nonrenderer main delegate. Register the helper header and direct `//crypto` / `Security.framework` dependencies only for Aux nonofficial builds. Renderer-only builds do not include the helper. Preserve component-build Carbon linkage; add the Aux buildflags import where test_support needs it.

The header directly includes its string, string_view, span and FILE_EXE declarations. Raise the private record limit from 512 KiB to 8 MiB: the existing verified v566 receipt is 2,753,123 bytes before JSON string escaping, so the previous bound rejected the required embedded proof. This keeps exact receipt bytes and digest validation, ownership/mode checks and bounded allocation; it does not substitute a weaker compact descriptor.

Validation: all replacements count checked; isolated patch replay and exact output hashes. No native checkout changes, build, runtime startup or acceptance-record creation. Integrator must compile `obj/chrome/chrome_dll/chrome_main_delegate.o` after GN regeneration and link the framework; test_support dependency registration is source-reviewed only.
