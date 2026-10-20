# Original live profile-preview presentation

Two new source files port actual4640600 owner bounds,4649d80 progress transforms/opacity,4657a84 live-view borrowing and465933c/465330c restoration. They create no UI, capture, destination, gesture or fake preview. Root must register the two files in the enabled Aux Mac UI target; they use the existing `aux_profile_switch_owner` utility.

The owner passes its actual existing source/cache Views and original ProfilePagePreviewPageView plus its real live-content child. BindPreview restores the prior target, requires the already-laid-out genuine target cache to have the real source-region size, and borrows actual target Views in their original order. Bounds subtract the target region's computed preview top; actual scroll offsets, parent/index, visibility and bounds are retained by the existing ProfilePreviewViews records. Reset restores those same Views and original source transforms/opacity. The async preview request must use `borrowed_views()` from this same transaction so restoration precedes the actual profile load/core.

Progress uses real owner width, never full BrowserView width: source X=-max(width,1)*progress; with visible matching preview, source opacity=1+originalFloat(df518f4)*abs(progress), preview X=max(width,1)*(direction-progress), opacity=min(1,.22+.78*abs(progress)). The actual negative float is -0.42000001668930054, so the port preserves those bits rather than rounding the source constant. The root owner clips to bounds. At absolute progress<=.001, the actual source layers and borrowed target restore. A mismatched preview is made transparent and hidden, exactly as the visual branch; selecting/hiding other cached pages remains the actual chooser owner's responsibility.

## Actual role proof

The original hot VerticalTabStripRegionView constructor was PGO-relocated to37dfa..37e57, outside its046-method cluster. This resolves the previously unknown fields without mapping different155 offsets:

- `+6a8`: **VerticalPinnedTabEntriesView**, constructed4604e08; primary vtablee71f4b0 slot58 points460a738→460a634, whose metadata literaldecb673 names that class. Hot37e0a38 calls the constructor and37e0a84 assigns the same object.
- `+478→+338`: **PinnedTabContainerView**, not a ScrollView. Actual TabStripView setter41278c0 validates metadata789e0f0→789e1b0 (`PinnedTabContainerView` literalda9b94a), then stores that same object at4127938.
- `+5b0`: **VerticalTabStripScrollView**, constructed42455c0 with exact diagnostic name/sourcefile literalsdb10e77/db10e92, assigned37e0d38.
- `+6f0`: **VerticalTabStripBottomContainer**, constructed3621b00. Its primary vtablee68bad0 slot58→2db8d48→2db8d50 metadata names the class atdb10d9f; assigned37e40f0.
- `+6f8`: bare **views::View** spacer, constructed136f140 at37e4180 and assigned37e41d0.

All five are collected from the genuine cached region at4658294..4658304. Current AuxSidebarView combines sections that were distinct original roles; its whole View cannot be relabeled as the original custom-pinned surface. Original target/fallback creation465352c also contains image/placeholder UI and actual cache identity validation, still under recovery. This component supplies no alternate placeholder or UI. It is not yet region input wiring or full preview parity.

## Verification and integration order

Exact two-new-file patch replay passes in a disposable tree. The supplied thin binary SHA,11 bounded original excerpts and existing algorithm evidence are pinned in source-evidence.json. No native source writes/builds, app/daemon launch, owner state, network, signing or OS authority occurred. The sources remain uncompiled and have no installed UI trigger. Root's applied158/159 sources are untouched.

Use the actual input guards/frozen roster from `native-profile-switch-owner/transaction-map/profile-input-selection.md` (932491f62) when integrating the real owner; unresolved geometry/hover guards cannot be discarded. Current direct-menu dispatch deliberately uses the stateless common helper and does not acquire this preview owner or its loading latch.
