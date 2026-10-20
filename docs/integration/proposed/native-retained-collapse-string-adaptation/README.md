# Retained Collapse chip string ownership adaptation

The v407 focused compile rejects `ActionItem` UTF-16 string views passed to current155 `View::SetTooltipText(const std::u16string&)` and `ViewAccessibility::SetName(std::u16string)`. Preserve the exact supplied tooltip/name values by explicitly constructing owned UTF-16 strings at those two API boundaries, with a direct `<string>` include. The original icon-only action policy, live action/state/image/ownership and visible geometry are unchanged.

One count-pinned existing CC file, layered after `native-retained-collapse-icon-only`. The compile failure is recorded in `out/native-integration/v407-focused-build.log`; this is a platform API correction, not another original-source behavior claim. Native focused compilation and actual visual observation are performed by the integrator.
