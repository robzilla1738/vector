# Original scroll admission: real view and mode owners

This closes two previously unnamed guards in the supplied `464c540` eligibility function. It is static evidence for the real preview owner, with no new native source, input activation or runtime acceptance.

## Drawn view, not active widget

`464c540..574` reads the region's visible byte at `+1c8`, obtains its pointer at `+188`, and calls that object's virtual `+a8`. These are `views::View::visible_`, `parent_` and `View::IsDrawn()`. They are **not** a Widget pointer and `Widget::IsActive()`/`IsVisible()`.

The supplied implementation at `89f39c..3bc` is exactly:

```cpp
return visible_ && parent_ ? parent_->IsDrawn() : false;
```

The primary View table address point `e584330` follows its two zero header words. Slot `+a8`, `e5843d8`, holds the actual chained code pointer `0x1000000089f39c`. This independently identifies the virtual call in admission. Current155 `ui/views/view.cc` has the same `View::IsDrawn()` implementation and public virtual declaration. Use the actual region's `IsDrawn()`; adding a window-activation requirement would change supplied admission.

## Real vertical-tabs mode

The pointer at region `+848` is its `tabs::VerticalTabStripStateController`. Byte `+1e0` is `is_vertical_tabs_enabled_`, not a gesture-specific setting. Original `41d9d90..ea8` changes this exact byte, checks the adjacent enable-lock count at `+1e4`, reads/writes the literal `vertical_tabs.enabled` at `cee5a8f`, and notifies mode-will/mode-did callback lists at `+140`/`+178`. The same object's `+90` is its persisted `state_.collapsed`.

The supplied upstream controller declaration/body establishes the field semantics. `ShouldDisplayVerticalTabs()` returns `IsVerticalTabsFeatureEnabled() && is_vertical_tabs_enabled_`; original admission checks those same real `VerticalTabs`/`VerticalTabsLaunch` features before the `+1e0` byte. The current155 port should use the stable controller's actual `ShouldDisplayVerticalTabs()` instead of inventing another enable flag.

## Remaining admission contract

These identifications do not remove the recovered regular-profile/event/hover/collapse/width/phase/dominance gates in `profile-input-selection.md`. They also do not prove unnamed animation and child-state fields are safely replaceable with broad booleans. Parent's actual owner port must preserve those additional conditions and the source-backed selection/settlement lifecycle.

`profile-scroll-admission-evidence.json` pins original binary, supplied controller source, current155 view source and three bounded raw artifacts. The original binary is only read. No native/shared edits, compile, browser/native-addon execution, profile/preference access or OS operation occurred.
