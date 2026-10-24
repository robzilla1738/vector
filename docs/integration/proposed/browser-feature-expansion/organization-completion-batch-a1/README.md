# Organization completion batch — 2026-10-24

This source successor fixes concrete gaps in the current native organization implementation. It changes no styling, material, layout tokens, assets, original row geometry or default sidebar topology. It is not app acceptance.

## Changes

1. **Archived rows can restore.** Their existing activation handler previously returned before its restore branch. Click, Enter and Space can now reach the real guarded/durable restore command.
2. **Independent windows show their own retained page.** Organization rows use native current-window metadata for actual URL, automatic page title and favicon, while manual/legacy titles and the canonical organization record remain unchanged. The pending-update tooltip displays both current and shared URLs. A remote shared update does not navigate or retitle the local document implicitly.
3. **Pinned display and action identity are distinct.** The grid keeps its saved record intact for actions, uses a separate display URL for the actual live page, and caches its favicon under that URL. The canonical Aux glyph follows the displayed page. Row reuse compares logical ID and saved URL, so different same-URL pins cannot silently exchange row identity.
4. **Close rechecks the exact tab and current retention.** Posted close handling retains its native TabHandle and logical ID, then validates membership/profile/identity and rereads archived/native-pin/inherited Keep state. A queued ordinary close cannot archive a tab that became retained, accidentally target another instance that later used the same logical ID, or archive shared membership after window-close or split handling took over.
5. **Folder ordering and keyboard traversal agree with the model.** A drag target uses its pre-removal position; same-sibling moves now compensate once for source removal. Right-arrow on an already expanded folder focuses its first visible child. No reordering occurs merely from selecting a tab.
6. **Space menus are scoped to their opening context.** They retain profile, owner generation, model revision and active Space. A menu action after profile switching, organization changes or Space changes refuses and requests reopening instead of applying to a newly selected context.
7. **Cleanup continues in long-lived sessions.** The profile service arbitrates one pass per hour with a monotonic deadline. A lightweight window timer requests ordinary reconciliation; every same-profile window shares the same claim. Policy changes reset the claim for immediate reevaluation. Existing candidate/protection/writer/compensation checks remain intact. Timer closures stop on profile rebind and shutdown and never create a second cleanup authority.

## Integration

`source-plan.json` pins the nine actual native inputs and their exact successor outputs. Its 36 anchors are each count-checked against `/private/tmp/aux-chromium-recovery-snapshot-20261023/src`. `native.patch` is a unified exact delta. `project.py` writes only this owned proposal directory. The shared native tree is unchanged.

The integrator should compose these nine outputs against the current pinned tree, then compile the five affected owner units once: `aux_organization_window_controller.cc`, `aux_organization_tree_view.cc`, `aux_spaces_switcher.cc`, `organization_service.cc`, and `vertical_pinned_tab_entries_view.cc`. Existing registration covers all files; no GN/source-registration additions are needed. The service cleanup method and its sole caller change together. Root owns source composition, build graph/receipts, packaging and global status.

`actual-source-check-a1.json` records exact anchor replay, disposable unified-patch replay, exact final bytes, reverse checking and generated-source whitespace checking. This is source evidence only. No native object, native fixture, provider, account, real profile, app, helper or lifecycle operation ran in this lane; no signing/release/OS grant occurred.

## Required integration and actual-app observation

- Compile the five changed units with their paired headers, then include them in the next coherent native build/candidate.
- With disposable state, click/keyboard-restore an archived tab/folder; check nested sibling drag positions and arrow traversal.
- Keep two same-profile windows on different documents of one shared tab; check that each row/pin tooltip and favicon show its own actual URL and that adopting a shared update remains explicit. Include distinct same-URL pins in reordering.
- Queue Close while retaining/unretaining or moving the exact tab, and open a Space menu before changing profile/revision/Space; check refusal/retention without wrong-context action.
- With a controlled native clock, verify the shared hourly cleanup claim, policy reset and timer lifecycle; exercise existing late activity/protected-view cancellation. No broad test suite is requested.

These journeys are not run. Profile authority/startup, state migration/recovery, coherent browser/daemon packaging, genuine multiwindow/provider/extension/UI acceptance, and the broader roadmap remain separate open work. The accepted app/UI is unchanged.
