# Preserve extension signing observation and physical custody

Startup11's `Installation signing credential is missing or unsafe` comes from the extension API collapsing every non-ready native result into an empty optional. It is not evidence of missing keys. Native startup already observes pending/busy/timeouts on one challenge; the extension previously attempted once. The existing transport retains its exact nonce/body, so abandoning a pending extension transaction can leave unrelated new challenges busy. Startup11's later lifetimeFailure is distinct evidence, not proof of this particular trigger. No credential material was inspected.

The pinned source successor changes this existing path only:

- The extension stores one original challenge and5s deadline. A UI deadline callback returns unavailable once. No deadline reset or new daemon challenge occurs.
- Before deadline, pending/busy/timedOut schedule another finite observation. Genuine refusal has a refusal message, distinct from unavailability.
- After deadline, the original retained request observes only an already-attempted matching transport operation/body. RequestAuthority checks this before any new nonce/sequence/command creation. A never-started request is refused; a different pending transaction is left untouched. Busy after expiry stops this request because it owns no matching transaction.
- A late genuine result is still ACKed through existing owner/publication checks to settle native custody, then discarded rather than delivered to the extension. Unknown pending/timeouts retain the original owner and continue finite observations; no timeout is called drain. Worker entry rechecks deadline to avoid a queued task starting late.
- All existing code/audit/selected-root checks and actual settlement remain. No credential creation, reset, signing-key fallback, trust relaxation or new transport is added. An already admitted native call can return after the caller deadline; its original owner remains retained.

Nine pinned files cover the API and observe-only parameter through installation_auth, selected owner and existing transport, plus the original supervisor call's explicit false argument. Existing direct callers retain default non-observe-only behavior. No native source projection/build or app operation was performed. `check.py` validates exact source hashes and ownership/control-flow anchors only; native producer compilation and real lifecycle acceptance remain integrator gates.

Future cohort consequence: the changed signature path must be composed into the future selected-state and supervisor overlays, compiled together with these changed producers, then relinked. Existing b6 remains valid historical evidence, not proof of this successor. Preserve future strict ES branches when composing. The daemon need not be changed because this adds only a browser-side request parameter; paired browser declarations/callers must all rebuild.

Supported menu Quit/reopen remains the only proposed current runtime recovery, with observed physical settlement; no state or key reset is authorized. Root owns that operation.
