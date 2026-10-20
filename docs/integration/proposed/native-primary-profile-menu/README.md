# Original primary profile-menu actions

Source-only follow-up to native257. No shared native source, browser state, dialogs, signing or builds were touched. `python3 docs/integration/proposed/native-primary-profile-menu/verify.py` checks the pinned original instructions/literals, all three icon representations bit-for-bit, 17 counted input anchors and a two-file disposable patch replay. Compilation and real interaction observation remain integrator checks.

## Recovered distinction

The primary profile row's More control is **kind6**, not the pager's kind7. Original4573f8c binds456fae8 and4573fa0 stores6. The dispatcher4574428 subtracts1; tabled6e3084 entry5 resolves45771a8. Kind6 is240px wide, Edit plus Delete only when the genuine non-omitted roster has at least two profiles. Delete uses40ff0cc for the clicked target's enabled predicate. The row itself is the anchor captured at4573fc4. The pager's existing `ShowAuxProfileActions` and its genuine kind7/kind8 implementation are unchanged.

This proposal replaces only the independently implemented primary More path with the real kind6 content. Its Edit/Delete vector icons come directly from descriptors e9d4e38/e82eae8; both original size representations of Delete are preserved. Exact path/representation addresses and byte hashes are in `icons-source.json`. The existing source-backed AuxMenuRow and 240px primary panel are retained.

## Actual flow corrections

- Original457333c calls40fd7f4 for persistent horizontal profile order,45740dc..45740f0 skips missing/omitted entries, and4573ce4 uses40fde94 with the actual filtered count. The primary roster now reuses those already ported helpers. Labels use already-loaded profiles only; no profile is loaded just to format a name. A current-profile row does not dispatch a switch, matching the original callback omission.
- Original45719a0 retires the menu before showing a `ui::DialogModel`: title “Edit profile”, subtitle “Choose a short, recognizable name.”, a text field initialized from the stored local profile name, accessible name “Profile name”, Save and Cancel, initially focused text field. Subtitle is the original model+60 field, not a newly inserted paragraph. Accepted4571f84 invokes40feffc: `CollapseWhitespace(input,true)`, ignore an empty result, otherwise `SetLocalProfileName(normalized,false)`. This removes the unrelated old 16-icon picker from primary Edit.
- Primary Delete reuses the same already ported original4571fe4 DialogModel and genuine deletion coordinator as pager Sign Out, including the real current-target/removal predicate and cancellation lifecycle. It removes the invented Yes/No dialog and its different copy.
- Original45718f8 tears down first;40fe36c chooses the first unused “Profile N” against both local and displayed names of all registered profiles, using avatar26 and `is_hidden=false`. Callback45838f8 dispatches4572824 through the original weak sender. The port now follows that creation/same-browser switch flow rather than creating “New profile” with avatar0 and opening another window. New profile is omitted for an off-the-record sender, as in original4573420..4573540.

## Chromium155 adaptations

The original menu coordinator synchronously owns and retires its children. The existing port's actual Widget teardown is asynchronous. Edit/Delete/Create therefore use the existing `pending_switch_` destructor/post-task boundary, retaining the actual weak browser and copied target path. The primary delegate closes its owned submenu before releasing the action. An upstream `PreventCloseOnDeactivate` pin is owned by the child closing callback so activating the child cannot destroy its parent and its row callbacks. Explicit owner/profile retirement still closes both real widgets. This pin is a platform lifetime adapter, not a claim about an original field or timer.

The edit callback uses `DialogModel::Builder::model()`, whose upstream contract explicitly permits raw pointers captured by model-owned callbacks. The live browser and target registry entry are checked again before mutation. No new global profile state, surrogate cloud result, synthetic menu action or owner-data read was added.

## Inputs and remaining limits

`manifest.json` pins the actual frozen native257 sidebar baseline `f4c084c5b68971be102256954e1a01a4a3f2185f838f3ea7de88b4d06fb075d8` and the proposed complete output, plus one new include file (null actual baseline). No GN dependency is added: the containing browser_ui target already has the real profile order/label, DialogModel and constrained-window dependencies from prior delivered slices. The `.inc` can be listed by the integrator without changing compilation semantics.

The other primary submenu implementations (Bookmarks/Downloads/Extensions/History/Developers), exact row-avatar producer and generic submenu popup paint/activation remain separate fidelity gaps. This proposal does not certify them or replace them with guesses. Actual child submenu interaction, edit confirmation and same-browser new-profile behavior still need disposable runtime observation after compilation. All supplied binary excerpts are static implementation evidence, not runtime acceptance.
