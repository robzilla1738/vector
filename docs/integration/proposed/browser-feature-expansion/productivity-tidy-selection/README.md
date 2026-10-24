# Explicit native Tidy selection — inactive follow-on

The existing sidebar Tidy button opens a native menu offering **Tidy current
Space** and **Tidy selected tabs**. Dismissing the menu sends nothing. Selected
scope requires at least two native selected logical records in the current
Space. The supplied planner still excludes pins, protected/active-work records
and unsupported URLs; fewer than two eligible records produces an honest error.
The existing supplied proposal review, Apply, Cancel and Undo stay in place,
with only the review heading describing the chosen scope. No CSS is changed.

Selection is not a renderer-provided ID list. The native menu mints an opaque
token bound to the actual browser weak pointer, native Profile weak pointer,
owner epoch, organization revision, active Space and exact TabStripModel logical
selection. Tokens expire in ten minutes; a new request replaces that window's
old scope. No current active-window fallback is used by scoped snapshots. Losing
the window/profile, changing selection/Space/revision or losing admission refuses
the token. The native synchronous constrained snapshot contains only the selected
records, and native review/apply rejects moves outside those records. Existing
account-instance cancellation and provider policy still own inference. No
provider/backend change, credential, implicit page read or AI spending is added.

## Composition contract

- Add new `aux_tidy_scope.{h,cc}` to projection/GN.
- Apply the native `aux_tabs_actions.{h,cc}` count-checked overlay against its
  exact recorded selected-source baseline (current root had no proposal owner).
  This preserves the original one-shot extension message/port/spinner behavior;
  the payload additionally contains the native-issued scopeToken.
- Apply common feature API edits after `productivity-spaces`. Root owns the
  authoritative common file; replay count-one edits onto a reviewed successor
  when needed, not an unchecked whole-file copy.
- Update only the getOrganizationSnapshot parameters per schema-request.json.
  **No-argument compatibility is preserved:** same existing unscoped read and
  response. A present request must contain only scopeToken; that response adds
  `scopeToken` and `scope` (`current-space` or `selected-tabs`). Scoped planner,
  native action and review/apply must be integrated together. No new method or
  histogram ID is needed for this follow-on.
- Compose `transformAuxTidySelection` immediately after
  `transformAuxProductivityUi` in the post-identity resource pipeline. Include
  returned count-checked anchors in the normal ledger. Do not edit bundles as
  implementation source. Freeze/build/package only after integration.
- Organization lane must expose genuine Cmd/Shift native multiselection from
  logical sidebar rows with selected indication. This overlay consumes actual
  TabStripModel selection; it does not pretend a plain activated row is a group
  selection or silently open unloaded tabs. The root was sent this explicit
  owned row/controller seam for integration.

## Verification

Two focused fixtures passed: real pinned supplied background/review composition
and parsing with every CSS class retained; actual producer requests/moves limited
to native selected records, with unknown IDs, changed scope and missing proof
refused. These are source/fixture evidence only. Native compilation and disposable
real menu/modifier-selection/AI-review acceptance remain pending. No owner data,
provider calls, app lifecycle, signing or release was performed.

The follow-on also fixes the prior mention helper to call the actual global
`IsAuxLocalProfileAdmitted` declaration; `aux::GetProfileCookieBindingEpoch` is
correctly namespaced according to the selected headers. Its manifest is updated.
