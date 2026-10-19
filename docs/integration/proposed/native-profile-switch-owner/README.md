# Supplied horizontal profile-switch owner port

Active source-backed owner transaction work. `owner-primitives.patch` plus `owner-primitives-manifest.json` adds the actual supplied order/reparenting primitives, registers the original internal local-state preference and includes their two new sources in the enabled UI target. Four exact source outputs replayed in a temporary tree; shared source untouched, no build or runtime claim. This proposal does not overlap staged v33's four ContentsWebView/image-state outputs.

## Exact order

Original040fd7f4 builds its candidates from02b3cee0. Bounded instructions pin02b3cee0 to the real `profile.profiles_order` local-state list plus storage-key map, matching155 `ProfileAttributesStorage::GetAllProfilesAttributesSortedForDisplay()`. This finding is specific to this original callchain and does not change any account API's profileIndex order.

Original0147166c copies the path, strips trailing separators, searches backward for the last slash and erases the prefix: actual FilePath::BaseName. Candidates are keyed by those basenames; original `aside.vertical_tabs.profile_order` strings can order only known keys, duplicates are omitted and remaining actual registered paths preserve the base display order. The port never turns a preference string into a new profile filesystem path. The key remains unchanged in isolated Aux local state, as approved by the integrator; it is not a user-visible brand. Unknown/duplicate/nonstring preference entries cannot manufacture destinations. Exact byte matching preserves embedded-NUL strings as unknown rather than truncating them into a known basename.

## Real borrowed-view lifecycle

The original preview is named `ProfilePagePreviewPageView` in `vertical_tab_strip_region_view.cc` (metadata467e220→literaldecc1f6). Its live preview temporarily reparents actual source browser Views. Original4657a84 records ViewTracker lifetimes for both view and parent, exact original child index, bounds, visible flag and, for a real ScrollView with contents, its scroll position. It previews the scroll surface from vertical zero while retaining horizontal offset. Original4658520 restores each surviving view into its original parent/index, then its visible state, bounds and scroll offset. Temporary reparenting is not ownership of the source profile or a new browser tab.

`ProfilePreviewViews` implements this real scoped transaction using155 ViewTracker and View reparenting. It rejects null/cyclic/duplicate borrows, preserves source state, and restores explicitly or on destruction. Deleted source/parent Views are never dereferenced. The caller must restore before destroying the preview's live host. Its input rectangle is the owner-computed original preview geometry; the utility does not invent new visual layout, infer profile identity from a URL, or select a model-generated destination.

## Owner activation remains in progress

Original465841c→40fe7a4→7acaa10 loads the actual selected profile asynchronously, then invokes04559f80 (`SwitchProfileInPlaceForAside`, browser.cc). Its exact transaction preserves per-profile cached tabs/session/selection and profile keepalives, migrates profile-bound controllers and manager ownership, and performs a generation-checked session rebuild after500ms. Separate-window focus/open and back/forward gestures do not implement this transaction.

The new primitives are an integration dependency for that actual owner port; no automatic gesture trigger or successful profile switch is fabricated here. The source-pinned manager/controller migration proposal lives separately under transaction-map/ when ready. Current155 const-profile and per-profile BrowserManagerService ownership must be migrated coherently before wiring activation. The original preview constructor/configuration and visual scroll state continue to be recovered against their actual classes/effects.
