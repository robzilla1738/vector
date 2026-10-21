# Cache Actor admission diagnostics (v591)

Source-only, no native mutation/build/runtime. Five files, eleven count-checked edits.

Each existing cold/rebind predicate reports its first failing operand: window, content container, tab, overlay or handoff. Output includes fixed diagnostic names, a failed boolean and existing queue/depth counts only. No paths, identities, URLs, text, task IDs or pointers are logged. The aggregate cache-actor.02 message identifies `cache=source` or `cache=target`, following the nested diagnostic that caused it.

Original guard order, short-circuit evaluation, service lookup count and result remain unchanged. No counter resets, task cancellation, identity exemptions, posted retries or UI changes. The container's original `actual && actual->IsCold...` becomes the equivalent null check plus call to identify a missing owner.

Expected investigation: cache creation posts actual Actor attachment notifications before synchronous revalidation. A `container.pending-notifications failed=1 count=N` followed by `cache=target` would identify that cause; a different diagnostic would distinguish persistent ownership or another active boundary. This is diagnostic evidence preparation, not a lifecycle fix.
