# Keep uncertain closed handoff held

After the first closed handoff capture is requested, the original frontend lease cannot Restore or Release. Actual Readback/old-request observation remains available. This prevents a failed/lost source recapture or partial cross-store transfer from reopening original callbacks through the old recovery lease. The successful successor is a distinct normal state with no old handoff request.

One retirement slot is reserved for the successor so the existing bounded history cannot exceed64 entries. Three exact anchors replay against A31; no native compile or execution.
