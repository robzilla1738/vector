# Post-switch sidebar counts (native599)

One source file, two exact anchors; source-only diagnostics, no visual or behavioral fix. Immediately after EndAuxProfileSwitch Build/projection and once on the next UI task, log model count, actual root tab nodes/views, visible/drawn/positive-height counts, active-row existence/visibility/drawn/height and strip/body heights. No identity, title, URL, content, path or pointer values. The posted sample uses weak owner and exact generation; it does not force layout or assert animation completion.

Source currently rebuilds and refreshes projection after insertion; no missed refresh or UnloadController closing-flag exclusion was found. These counts distinguish absent native nodes, section exclusion and layout clipping. Hash-pinned and git apply --check passed against599. No build/runtime or shared native changes.

Also counts the first matching exclusion in the original ordinary projection order: saved pin, represented new chat, bookmark, associated chat, agent representation, or ordinary. Reads existing representation state only; no new URL inference or projection mutation.
