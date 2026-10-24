# Native messaging: do not inherit browser log authority

This source successor redirects only a native host's diagnostic stderr to a newly opened, fixed `/dev/null` descriptor. It refuses launch if the sink cannot be opened without following a symlink or is not a root-owned character device. The descriptor remains owned through the actual synchronous spawn and is explicitly remapped to stderr. The existing CLOEXEC-default process launch closes unlisted descriptors. Original stdin/stdout pipes, host arguments, extension protocol and path restrictions are unchanged.

Previously, `launch_context_posix.cc` remapped stdin/stdout but inherited the browser's stderr. If the browser had a writable Aux log descriptor there, a host or its descendants could retain that open-file authority despite pathname restrictions. This corrects that concrete inherited-handle case. Native host diagnostics are discarded instead of inheriting the browser's log; browser-side launch errors remain logged. No product UI changes.

`prepare.py` authenticated the actual a4 native source through its complete input pins, then generated one source leaf and two count-one changes. Exact replacement replay and unified diff checks are source evidence only. The isolated native tree and current package are untouched. Compilation, integration and native-host compatibility observation have not run for this successor.

This does not prove complete native-host custody or recovery. Daemon/task roots, other explicitly granted objects, aliases and descendant/delegated authority remain separate obligations. Existing pending/unknown counters are unchanged. No owner data, process lifecycle, provider request, signing or permissions are involved.
