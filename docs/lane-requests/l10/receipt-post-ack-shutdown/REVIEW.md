# Post-ACK provenance and shutdown closure

Apply after 7d866398. Exact seven-leaf patch SHA256 5473f41af1f927ab02f546a91e6e4074df5e843dc8e674f9ef80d3f4e896e5c9. Mandatory actual main wiring; preserve root's existing onText/page-free source regions. Two new leaves are the real runtime shutdown producer and focused refusal regression.

After awaited status retirement, browser approval rechecks signal, active run and exact pending suspension before advertising confirmation. An aborted held request cancels its exact approval/suspension and restores the waiting run without any confirmation or listener.

Foreground Apply captures only the expected queued identity before retirement; it re-reads parked state and current config inside the ACK callback, refuses changed identity/terminal status and preserves newer revisions. It still grants no approval and leaves the action parked for the person's sheet.

Actual main uses runtimeShutdown: one Promise owns all shutdown calls, published before quiescence callbacks. It quiesces timers/schedulers and process fault handlers, then awaits profile-wide actual controller retirement before egress.close, message stop, active-run interruption, feature stop and disconnection. The mandatory receipt retirement producer is withRunAuthorityMutation(repo), covering foreground and descendant tickets.

A refused or missing ACK is recorded as a refusal in durable SafetyAuditStore and stderr. Shutdown immediately closes the authenticated owner socket, retaining fail-closed native transport teardown, closes egress, performs every individual cleanup even when another rejects, and does not claim active runs interrupted without their ACK. It rejects its shared Promise and signal/disconnect callers exit nonzero. No synthetic ACK, optional authorization fallback or receipt debt deletion is introduced.

Validation: npx tsc -b PASS; three focused suites 51 tests PASS, including actual installed-controller held-ACK shutdown with genuine coordinator interruption, exact shared-Promise identity, refusal/multiple-cleanup failure retention, held-ACK Apply config drift, aborted post-ACK confirmation refusal. Focused oxlint PASS. No native operations/qualification.
