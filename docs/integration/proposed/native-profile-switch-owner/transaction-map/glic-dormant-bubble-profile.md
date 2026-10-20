# Real dormant Actor bubble profile binding

Source-only staged adaptation against actual applied135; eight files, exact hashes and independent patch replay. No shared writes, compile or runtime claim.

The real `ActorTaskListBubble` retains `profile_` and a reference to its profile manager's task-row map even after its widget is destroyed. Both ToolbarView and TabStripActionContainer reuse this same private object on the next Show. Thus changing only Glic controllers would retain old-profile data.

New exact forwarding API on the genuine GlicSplitButtonDelegate is `CanRebindActorBubbleForAuxProfileSwitch()` and `RebindActorBubbleForAuxProfileSwitch(Profile*)`. Unknown delegate implementations return false (not success); their mutator is unreachable. Actual two view owners forward to their existing private object, or accept an actually absent object. The private bubble refuses while either `widget_` exists OR its widget observation is still live: Close() clears widget_ before asynchronous destruction, so a visibility/widget-null check alone is insufficient.

Commit after actual browser identity change calls each genuine delegate Rebind with the actual browser profile. The dormant bubble then obtains that profile's real GlicActorTaskIconManager and references its real row map. Same views, outer controllers, callback lists, row click callback and dormant bubble survive. No widget is closed, no row invented/cleared, no model replaced. Preparation/rollback need no mutation to this object: rollback occurs before identity commit.

This is a dependency of the stable Split-controller proposal, which must check BOTH delegate owners before effects and revalidate before identity. It does not itself enable a profile-switch trigger. Existing toolbar owned-actions lifecycle remains unchanged.
