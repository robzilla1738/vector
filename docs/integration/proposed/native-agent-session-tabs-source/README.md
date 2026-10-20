# Genuine Agent session-tabs data owner

This source-only slice ports the original5d0 polling/model owner. It uses the actual browser's profile/account, actual marked tab handles and DevTools target IDs, the supplied `sessions.list` and batched `sessions.tabs.resolveByTarget` procedures, and the original user/CLI-root ancestry rules. It does not infer tab ownership from URLs or substitute the native owned-tabs bubble.

The original initial250ms delay,2s repeat,32-target batch,5s request timeout,4MiB response bound and stable surviving handle order are retained. A failed or incomplete request preserves the last published graph. Profile/account changes clear that graph before another request. Actual transaction/temporary-empty/cache source guards are read through two narrow Browser getters. All asynchronous callbacks use the real window/profile scope and weak owner lifetime; retiring the owner cancels its loader/timer.

`AgentSessionTabsSource(BrowserWindowInterface&, TabStripModel&, RepeatingClosure changed)` exposes `Start()`, `Retire()`, `RepresentsTab(const tabs::TabInterface&) const` and real ordered `TabHandle`s. The visual owner must subscribe to structural changes and instantiate genuine common tab rows; **do not mount filtering alone**. Root's recovered original464ccfc mount reparents5d0 into the actual unpinned container under the real TabStripView, preserving original4125380 ancestry semantics.

Dependencies: prior actual AgentSessionTabsModel proposal (including root's out-of-line special-member style fix), actual `ChatAccountForProfile`, `IsBookmarkTabExcluded`, BrowserPlatform authorization, and root-owned UI/GN integration. No shared native files were changed and no network/runtime operations were performed.

Explicit limits: the original+42f snapshot/retirement writer has not been recovered. `Retire()` is cancellation of this active owner, not a claim to reproduce a frozen visual snapshot. The existing native authorization API refreshes a401 on the next original2s poll. Original transport/parser errors remain real failures; no authorization or session association is fabricated. Full visual owner and ancestor mount remain the next slice.

Run `python3 verify.py` here for independent baseline/patch replay and original byte pins. Native compile and actual UI behavior observation remain root-owned and unperformed for this proposal.
