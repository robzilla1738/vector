# Supplied vertical navigation placement

This proposal adds the supplied browser navigation consumer to Chromium 155. It follows the corrected vertical preference slice and the default horizontal consumer proposal; its two native baseline files do not overlap those slices.

The supplied `036c4d40.c` consumer only changes same-window, browser-initiated foreground/background tab requests with an implicit index and no force-index bit while vertical tabs are displayed. Agent extension pages clear grouping and go to the first unpinned position for top, or the end for bottom. Other top requests inherit the opener and insert before the source tab. They preserve the source group unless a collapsed group would absorb an outside request; that branch clears grouping and inserts before the group. A request explicitly targeting that collapsed group retains upstream ordering. Bottom requests outside the Agent branch retain upstream ordering.

The centralized Aux Agent extension ID replaces the original host. Chromium 155 adds a focused-group fallback after this decision, so the proposal prevents that fallback from undoing the original explicitly ungrouped branches. It uses existing group APIs and makes no new split-group policy. Source pins and bounded instruction extracts accompany the patch.

`manifest.json` pins both native inputs and outputs and count-checks each replacement. Disposable composition verifies the corrected preference, horizontal and navigation patches in order. The shared native checkout is untouched. Compilation and disposable UI observation remain integration gates; this static validation does not claim either has passed.
