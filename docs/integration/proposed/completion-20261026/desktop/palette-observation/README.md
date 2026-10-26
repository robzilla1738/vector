# Temporary palette observations

Status: unprojected, uncompiled diagnostic proposal against the current native source. No behavior change; remove after the demonstrated Files dismissal is diagnosed. Two existing owners, eleven exact anchors. No extension asset or JS changes.

`Aux palette event=`: 1 WebContents CloseContents (renderer window.close); 2 palette widget deactivation; 3 active-tab change or insertion (boolean flags); 4 observed Escape; 5 observed toggle; 6 Hide entry with visible boolean; 7 CloseAndReload entry; 8 native command request with numeric command ID. Other existing keyboard close routes still emit event 7.

`Aux palette action=`: 1 list files, 2 prepare rename, 3 apply rename, 4 undo, 5 drag, 6 reveal, 7 PiP. Stage 0 is native API entry before admission; stage 1 passed existing profile/window/generation checks; list stage 2 returned with success boolean. No payloads, filenames, paths, queries, URLs, profile/account IDs or generations are logged.

Observe one existing Recent files activation and its ordered output. No stage 0 means the expected Files API was not reached; stage 0 without 1 means admission/context rejected; stage 2 confirms data returned. Event 1/2/3 identifies explicit close, deactivation, or active-tab/insertion closure respectively. Event 8 exposes accidental native command dispatch without logging text.

Reproduce: `python3 prepare.py` replays frozen baselines and writes source-plan.json and native.patch; it never projects into Chromium. Integrator owns grouped projection/build/app observation. No tests or builds run here.
