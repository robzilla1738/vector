# Physical memory close after account authority loss

The actual normal Quit failed at the ordinary memory facade's guarded write. `LocalMemoryManager` attempted its normal `close` RPC after browser/account authority had gone away, propagated the pre-write owner refusal, and waited for outstanding requests before calling the existing physical native close.

This successor preserves healthy close RPCs. Only when the exact native `AUX_MEMORY_INPUT_REFUSED` error says `Memory account owner is unavailable` and that same process has a native close function does it proceed directly to physical cleanup. No request guard is relaxed and no stale-owner write reaches the child. The manager marks its derived index dirty in memory; it may rebuild on its next genuine owner admission. No terminal index flush or state write is introduced.

For a native child, physical close runs before waiting for prior request settlements. The native close promise must still succeed; a wait, pipe, thread or journal uncertainty rejects and keeps shutdown incomplete. All other request failures propagate. The original full-mode process path and ordering remain unchanged.

`MemoryProcess` privately retains the exact `auxClose` function from the actual created native child. It uses this retained function even if the child's close event already cleared the active child reference. Absence of a live process is therefore not substituted for the native journal settlement result. The readonly source-private getter exposes only whether this exact cleanup function exists; no new NAPI binding, path, account or authority input is added.

Organization independently verified the current native contract: Close requires the existing wrapped instance and host PID, stops only that original process, and Finish joins its original thread, checks its actual wait result and all three pipe closures, and requires durable terminal journal settlement plus exact own-record retirement. These terminal operations do not require current account write authority. Unknown custody rejects instead of reporting clean.

`prepare.py` pins both actual A48 leaves and applies four single-count anchors per leaf. Exact forward/reverse replay and both `node --check` commands passed. Packaged output files remain in the fresh temporary directory recorded in `source-plan.json`; they are not committed. Actual normal Quit and absence/reopen checks remain parent-owned acceptance, not evidence supplied by this source patch.

No UI, normal request permission, native source, general execution, helper sandbox, entitlement, credential, signing or release change is included.
