# Focused a7 compiler correction

Three count-one source adaptations against the actual a6 selected files, prompted by the real focused a7 compiler diagnostics:

- Mac child launcher explicitly includes `content/public/common/content_client.h`, which declares `GetContentClient()`. The adjacent `content_browser_client.h` already exists and remains explicit; no duplicate include is added.
- `AuxChildLifetime` declares its existing private default constructor out of line.
- The unchanged default implementation is defined in the existing, already registered `aux_child_process_drain.cc`, in `content::internal`.

No warning suppression, observer behavior, field initialization, policy/receipt handling, UI or build registration changes. Existing v1/v2/v3 proposals and native tree are untouched. The separately pending browser-custody-content-a5 header must also receive the exact constructor-declaration anchor before integration, preserving its other custody edits; this proposal does not overwrite that successor with an older header.

`python3 check.py` verifies pinned before/after bytes and all three literal replays. No GN generation, compilation, app/provider calls or runtime acceptance occurred in this lane. Root owns projection and the focused native rerun.
