# Genuine session-tabs model checkpoint

This is the original region+5d0 owner’s data boundary, not the independent
agent-tabs bubble. It is a prerequisite for the genuine view, not a replacement
view or a completed mount.

`4625d00` constructs `AsideAgentSessionTabsView` (metadata4629f08,
literaldecb922), retaining BrowserView, its real TabStripModel, a required
tab-handle-to-model callback and a changed callback. First poll is250ms.
`46289c8` schedules the next poll after2s. It does not poll continuously250ms.

The real authenticated request at4628ad8..4628d90 is
`sessions.list({accountId,ephemeral:"include",archived:"include",parent:"all"})`.
The owner collects actual marked tabs’ DevToolsAgentHost IDs and batches
`sessions.tabs.resolveByTarget({accountId,targetId})` in groups of32. It does
not use a tab URL, Chats association, extension tab ID or tab title as target ID.

`4629268` parses plain tRPC `result.data`. Each session record has a parentId
and an eligibility bit: trigger.type is "user" and either trigger.source or
trigger.client is "cli". First duplicate ID wins. A target result maps to
sessionId. Only after the complete sequence succeeds does the original replace
its target map; failed or stale auth/HTTP/JSON responses do not fabricate an
empty successful graph.

`4626ac0` first checks the original exact profile/account scope and real
`4127744` marker predicate (`aux::IsBookmarkTabExcluded` in current native).
It walks the target’s session ancestry, rejecting cycles, missing parents and
empty IDs, and represents a tab only when it reaches an eligible record.
`RootForTarget` is precisely that ancestry stage; it deliberately does not claim
to validate native scope/group ownership by itself.

The next owner/view slice must retain these real scope checks around both auth
and every asynchronous response, preserve the previous successful model on a
failed poll, and integrate the real row factory. Original46272bc creates one
`AgentSessionGroupView`, title "Agent Tabs", genuine411b300 group header and
412a6c0 tab views keyed by real handles. These leaves are absent from current
native and need their own source-backed port. Do not mount this filter alone:
ordinary rows must not disappear before genuine represented rows exist.

The staged probe covers parent traversal, both CLI trigger fields, non-user
rejection, cycles, null association, duplicate retention and malformed batches.
Only patch replay and original byte pins were checked here; native compile,
probe execution and actual UI observation remain integrator work.
