# Refresh the actual native footer profile pager

The active `ProfilePageIndicator` creates its real roster/buttons correctly, but observes only extension installation events. The separate current-profile button controller observes ProfileAttributesStorage; consequently its name can update while another profile's pager tooltip, accessibility label, icon and membership remain stale. A window created before a second profile can keep its pager hidden until an unrelated presentation/rebind refresh.

This two-leaf successor adds a scoped observation of the existing global ProfileAttributesStorage to the actual pager. Actual add/removal/name/auth/avatar/high-resolution/omitted notifications schedule one weak posted UI refresh after storage mutation returns. Aux indicator icon changes already emit the same native avatar notification. Refresh uses the existing real roster/label/routing implementation and preserves the held preview roster and `ProfilePagerDrag::DeferUpdate()` path. Nothing changes dimensions, style, icon drawing, profile dispatch or current-profile selection rules.

Retire resets the storage observation and pending bit; a queued refresh checks the observation before doing anything. Rebind/Refresh can observe the actual current storage again. Existing child callbacks retain their original weak lifetime; no stale profile/path is captured by the scheduled task. Destruction invalidates the existing WeakPtrFactory normally.

`prepare.py` pins the two actual native checkout beforeimages and writes only this proposal's source/plan/patch. Exact two-leaf replay passed all 10 one-count anchors. No native checkout mutation, compilation, app interaction, credentials or signing occurred. Root owns projection and the shared framework build.

Actual acceptance still required: create a second disposable profile while the first window remains open; rename either profile and change its indicator icon; verify both windows' footer labels/roster/current flags without navigation, then verify existing click routing and drag behavior. No broad or repeated fixture suite is necessary.
