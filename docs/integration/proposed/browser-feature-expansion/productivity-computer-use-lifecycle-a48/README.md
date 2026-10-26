# Ordinary Computer Use lifecycle

The actual normal Quit failed only at `shutdownComputerUseHelper`: startup had tried the unsupported runtime refresh, then shutdown invoked the packaged source helper's `lifecycle.shutdown` through generic execution even though the ordinary build had never prepared or launched it. A static source executable's presence is not a live helper.

This paired-source successor reads the existing native `supervisedTasksEnabled` property only when it is an immutable own data property with value `false`, on macOS. A missing binding, mutable/accessor property, other platform or supervised mode takes the original lifecycle path. No capability is granted by this observation.

For that disabled producer, startup skips runtime refresh and the context actor reports its existing unsupported state before preparation or spawning. Explicit preparation rejects with the existing disabled-capability error code. A process-local attempted bit is set before any actual runtime refresh or actor spawn. Shutdown omits only the source helper subprocess when the immutable disabled observation is still present, the attempted bit was never set and there is no preparation promise. If preparation or spawning was attempted, all original shutdown logic remains. Existing live-actor stopping, physical child/lease cleanup, other shutdown producers, native guards and general execution denial are untouched.

`prepare.py` pins the actual two A46 packaged leaves, applies seven single-count anchors per leaf, writes paired successor files into a fresh private temporary directory, and verifies exact reverse replay. `source-plan.json` records all bytes and anchors; bulky packaged leaves are not committed. Both output leaves passed `node --check`; no product code was evaluated.

The root owns package/seal integration and actual normal-Quit verification. This source change does not claim that physical shutdown has passed. No UI, native object, module, entitlement, account data, permission or signing change is included.
