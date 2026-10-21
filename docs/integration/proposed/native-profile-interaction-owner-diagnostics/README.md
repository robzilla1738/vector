# Identify the rejecting interaction owner

Actual v581 rejects the combined source-interaction-owners stage. Split exactly its six short-circuited predicates into separate literal failure messages, preserving predicate order, call count and return behavior. No owner identity, profile name/path, tab content or token is logged. Only an explicit failed profile transition emits a message.

Static audit:
- ChromeLabs checks prepared/callback state, regular profile/userdata/action identity, bubble/closing-widget absence, cold controller/flags objects, and current pinned-model observation. A hidden button alone cannot prove admission.
- AgentTabs waits until its actual registered widget owners retire; asynchronous Close is not enough.
- TabStripService rejects every Mojo client/observer, active session, and native nonself observer. TabSearchPageHandler constructs a profile-scoped TabStripServiceAggregator with BrowserTabStripServiceTracker, so a cached TabSearch WebUI may be a stable external owner even without a visible bubble. That is a candidate, not proven by current evidence.
- TabStripUIController rejects any bound receiver or in-progress command. Native NTP/Agent appearance does not prove receiver absence.
- ContextHighlight checks transition/callback state and real window identity/profile; its layer visibility alone is not a rejection.
- SkillsUI checks transition/callback state, pending deletions, delete callbacks, actual tab controllers showing, and ToastController pending work. Empty visible UI is insufficient evidence.

Do not relax external client or pending-work guards. A genuine repair must first identify the failing owner and then detach/rebind its actual profile-scoped subscriptions while preserving in-flight rejection. This proposal changes diagnostics only.

One exact replacement against current v581; isolated patch replay and output comparison passed. Integrator owns focused browser_window_features_aux_profile_switch compilation and one normal profile-switch retry with logging-only switches. No shared source edits/build/runtime here.
