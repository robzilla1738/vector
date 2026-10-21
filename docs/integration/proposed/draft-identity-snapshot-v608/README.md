# Preserve durable draft identity in session snapshots

Confirmed gap: PageIdentity::Persist marks its incremental write complete, but AddTabExtraData drops writes for untracked windows and only schedules a command for tracked windows. ScheduleResetCommands clears pending commands and rebuilds from live tabs; the existing snapshot builder omits aux.page_id. Thus the first durable-draft proposal alone cannot guarantee restart identity.

This narrow follow-up serializes the existing live PageIdentity into the actual SessionServiceBase snapshot with AppendRebuildCommand. Tracked TabInserted also re-emits that same ID, covering identity creation before insertion/tracking and tab moves. It does not mint IDs, change tracked-window policy, or rely on resetting the persisted flag. The original identity belongs to its WebContents and moves with it. Incognito/nontracked insertion still returns before the new hook. Existing profile partition and restore rules remain unchanged.

Two files/four exact anchors, pinned against currently applied608-final. sessions:impl gains the independent page_identity target. This has no cycle: page_identity depends only on the distinct sessions header/interface target, not sessions:impl. Source-only apply check passes; no shared edits or builds by this lane.
