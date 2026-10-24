# Browser drain — participant closure slice

Source-only successor against the selected a21 source, preserving UI. No app,
native build, owner state, signing or provider operation was performed.

- Reuses the actual content and native-messaging launch/reaper owners. Admission
  closes before spawn; refusal returns through the existing failed-launch path.
  Missing launch/reap callbacks stay retained. No second reaper or PID disappearance
  is introduced. Bound 4096 outstanding records; overflow/forked caller is unknown.
- Separates original migration from process shutdown. The process-shutdown path
  closes session/feature/worker/profile/navigation admissions but deliberately
  does not close the selected daemon peer before its final authenticated receipt.
- Aggregate status consumes genuine backend-close/write observations and keeps
  pending and unknown distinct. It is not authority and does not set the historical
  whole_writer_drain_proven field. Native messaging/content snapshots are scopes,
  not proof that untracked descendants cannot exist.

## Integration

Register new content/browser/aux_child_process_drain.cc and public header in the
existing mac content target. The actual process-shutdown caller, frozen UI
observation, late transport report/ACK and supervisor retention are a subsequent
coherent layer. Do not activate clean restart from this slice alone. Ordinary
window close and profile switch must not invoke the irreversible process close.

## Verification

Exact ordered count replay and applied unified patch byte equality passed for
six modified files. Two public bridge leaves are added. Source validation only;
actual native compilation and lifecycle acceptance remain with the integrator.
