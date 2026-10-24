# Preserve queued sessions during final process shutdown

This two-file successor follows browser-drain-final. Normal delayed profile-switch rebuilding is unchanged. The process-shutdown participant now propagates its existing shutdown mode into queued snapshot dispatch and flushes actual pending session commands with their original completion accounting, without recreating session state from windows that may already be gone. Existing dispatch generation invalidation, missing-profile accounting and callback-loss uncertainty remain unchanged.

Verification is exact ordered replacement replay and unified patch replay only. No build, browser launch, shutdown or owner-state access was performed.
