# split-multipane-metrics-a1

Restoring a session that contains a 3- or 4-pane Aux split aborted the browser in `split_tabs::LogSplitViewUpdatedUKM` (`CHECK(split_tabs.size() == 2)`), reached from `TabUIHelper::PrimaryPageChanged` during restore. Upstream assumed two-pane splits; Aux allows up to `SplitPaneTree::kMaxPanes`. Both UKM helpers now require at least two tabs and record one row per pane. Metrics only; no UI change.
