# Peek refusal and narrow split presentation

Five-file inactive native overlay against the actual selected source tree at the root's `fefe0af9c` review point. The source tree, staged product, running apps, build outputs, provider and owner data were not changed. `manifest.json` pins before/after bytes and 19 count-checked edit anchors; `changes.patch` reproduces the same outputs.

## Behavior

A modifier/opt-in Peek request that has already consumed the click now uses the existing native warning surface on refusal. Before displaying it, the code revalidates the captured profile/cookie epoch, native admitted generation, weak source document, source browser and exact currently selected WebContents. A stale result is suppressed. No fallback navigation, new tab, source replacement, URL logging or different-profile notification is introduced.

Recursive splits now measure the dimensions required for the existing nominal 200-DIP pane minimum and existing divider width. Only when that tree cannot fit is a small native control row shown. The user explicitly selects **Focus selected pane**; **Previous pane** and **Next pane** use real local tab selection, and **Show all panes** restores simultaneous presentation. The focused pane retains the normal native split clipping/radii. When dimensions fit again, the control row disappears and the existing full split presentation returns automatically.

This is view presentation, not a different split state. It never detaches, destroys, reparents, navigates or reloads a page and never changes branch ratios or the accepted tree. Hidden panes are absent from accessibility/focus traversal. Explicit keyboard/sidebar pane selection reveals the exact retained view and updates the active contents owner and control's pane-position accessible label. Normal fitting layouts, main toolbar/sidebar/chat geometry and default colors are unchanged. The temporary focus selection is window-local and is not persisted as a new preference.

## Integration

Apply the exact overlay only after validating the five selected baseline hashes. Compile the three changed native translation units in the normal serialized build (tree, MultiContentsView, Peek ingress). No GN/schema/pref registration or additional dependencies are requested. The new helper is part of the existing tree source target; the view reuses already-selected native ToolbarButton, split command, layout and string primitives.

The focused checks performed here were:

- Each of 19 anchors matched once; replay and actual `git apply` in a fresh temporary directory produced all five pinned successors.
- Actual standalone `split_pane_tree.cc` passed `clang++ -std=c++20 -fsyntax-only` using the proposed header. No executable, signature or runtime load was produced.

The Views/Peek units still require the integrator's actual native compilation. No app interaction, hover/keyboard observation, screenshot comparison, isolation acceptance or release readiness is claimed.
