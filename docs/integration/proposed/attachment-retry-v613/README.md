# Same-file attachment retry (613 baseline)

The supplied composer's native file-input change handler snapshots `files` and awaits the original read routine, but does not clear the input value. Only a later scope reset clears it. Browsers need not fire another change event when the user chooses the same file after removing its attachment or receiving a read error, preventing the original retry operation from running.

One exact anchor resets the input value immediately after copying its FileList and before awaiting the existing reader. The copied File objects remain owned by the original operation. This permits selecting the same path again without changing attachment processing, quota policy, draft scope, CSS, or native admission. The existing read generation checks, pending-read counter, persistence handoff and failed-storage listener remain unchanged. Existing-file reads still do not have a new cancellation UI; scope reset continues the supplied cancellation-by-generation behavior.

The focused check executes the actual transformed handler with a deferred reader, verifies that clearing happens while the read is pending, that the FileList snapshot survives input mutation, and that a second selection supplies the same File object to the original routine. Source and complete transformed-module hashes and anchor counts are recorded in source-pins.json. No runtime/profile/provider operations were performed.

## Integrator acceptance (actual disposable app only)

1. Attach a tiny synthetic `aux-retry.txt`, wait for its chip, remove it, and choose the same path again. The chip must return. Do not send.
2. In the same disposable document, choose a synthetic text fixture large enough for its loading state to be observed; attempt profile switching while it still reads. Expect the existing busy refusal with original profile/draft intact, then retry after completion. If the read finishes before the switch, record the pending-read case as unobserved, not passed. Do not add arbitrary delays to production code to manufacture this result.
3. For quota recovery, use the known approximately 4.34 MB synthetic text fixture from actual611. Capture the immediate existing error toast: “Could not save this draft. Keep this window open and remove a large attachment, then try again.” Verify the chip remains, switching is refused, removing the attachment releases protection, and profile roundtrip then succeeds. Nothing is sent. A missed transient toast is an observation gap, not grounds to alter its visual design or duration.

Pending-read refusal and quota-toasting are different boundaries: the original file listener protects unfinished reads; the draft writer's separate listener protects completed data that cannot fit in storage. This change does not claim arbitrary-size attachment durability or live AI-task migration. Root owns actual app testing and packaging; existing stage import/leaf allowance for permission-approval is sufficient.
