# Ordinary tab lifecycle follow-up

This is a two-file overlay against the exact current root organization proposal, including its Space metadata fixes. Apply after organization and root integration composition; do not replace the broader organization proposal. `files.json` pins both original and resulting bytes. `native.patch` is the counted integration input.

## Implemented

An ordinary tab inserted before it has a URL now gets a candidate page observer. Its first committed navigation queues registration without requiring another tab selection or mutation. Candidates are removed on exclusion, promotion to a known logical view, model removal, shutdown and profile rebind. Existing pending-write, session-restore and opening guards remain in force.

A user-visible NTP transferred into the real TabStripModel uses the stable `chrome://newtab/` logical URL only when the actual enabled NTP manifest or transferred-prerender authority proves its identity. This keeps transient extension/account URLs out of persistent canonical NTP entries and permits a transferred NTP whose navigation has not committed yet. The private prerender host is outside the real TabStripModel and cannot register. No URL deduplication or inferred identity is introduced.

Navigation publication and view snapshots recheck actual profile, Agent/bookmark-group, runtime ownership and the original ordinary-tab projection eligibility. Reclassifying a user tab as a host surface retains its prior canonical user record without publishing the host URL. Native pinned views retain their separate projection handling.

## Source audit conclusions

- `aux_ordinary_tab_projection.cc::BaselineEligible` excludes actual Agent groups, bookmark-owned surfaces and represented chat surfaces; it does not exclude ordinary New Tabs by URL. Registration preserves those predicates.
- A normal new window creates a distinct ordinary New Tab logical row. It does not clone another window's selection. `OpenLogicalTab` activates only a view belonging to the current window, or opens an independent native view with the existing logical ID. An unrelated New Tab is not guessed to be disposable and closed by URL; there is no native bootstrap-placeholder token authorizing that deletion.
- `organization_model.cc::HasRetention` retains global pins and descendants of retained folders. The tree's pin scope is independent of selected Space. Selecting a Space changes the window selection without deleting its loaded pages.
- `HandleClose` routes retained entries through durable navigation save and explicit native view unload, preserving the canonical entry even for the last view. It retains active-work, before-unload, split, capture and download guards. Bulk browser shutdown follows existing session recovery semantics.
- Normal controllers are bound only to eligible normal windows; private and host-only contexts remain outside registration.

## Verification and limits

`check.py --check-selected` verifies exact baseline/source hashes and patch replay in a temporary directory. This is a focused source check, not a native compile or runtime acceptance. Root owns the next changed-controller compile after its current native build. No application lifecycle, profile I/O, signing or provider checks were performed.
