# Recovered agent-tabs header and close control

Apply this one-file slice after `native-agent-tabs-counterpart`148e51a23. It restores the original in-content header, actual text/type/padding and22px tab-close control while preserving the existing scoped ownership feed, validation and actions. It does not claim the remaining independently implemented surface is faithful.

## Pinned implementation

Fresh REA dossiers for original native button press `04684c18` and row population `0468761c` are retained as compact `evidence/press.json` and `rows.json`; their actual body ranges are noncontiguous and external/PIC callees remain partial. These are decompiler observations, not original C++ or runtime results. Complete bounded instruction regions and external constants are hashed against the supplied framework/arm64 slice in `source-evidence.json`.

The original bubble sets its accessible name to `Agent Tabs` and builds an actual header View containing two Label children. The repeated `0116d8d8` calls operate on the View accessibility object at+2c8; this is not a native WidgetDelegate title field. This port uses WidgetDelegate's accessible-title seam, disables the independent native-frame title and places the actual visible text in the content header. The current explicit frame close button is retained pending its separate original flag recovery.

The header's EmptyBorder contains the exact four int32s at `0df47ab0`: top10,left12,bottom8,right12. Its real FlexLayout is vertical with no inserted inter-label gap. Text copied from actual UTF16 constants:

| Content | Size | Weight | Line height |
| --- | --- | --- | --- |
| Agent Tabs |14|500|20|
| Background tabs opened for work |12|400|18|

The original `04685a40` Label helper derives the existing font list by requested pixel-size delta and weight rather than selecting a new family; the port does the same through155 FontList::Derive. Title/header colors remain the current native Label defaults: the original helper's numeric color IDs221/226 are **not** transplanted into155 or asserted to map to current enum values. Exact color-role/theme recovery remains pending. No invented font family/color values are introduced.

Original list/footer containers use4px insets. The retained compatibility body receives those4px insets; its current error/Refresh controls and8px inter-control spacing remain explicit independent extras rather than falsely attributed to the original. Current width420, session-group headings and cleanup-policy checkbox/actions also remain unchanged pending actual group model/action recovery.

The original row close button has preferred22x22 size,16px icon and `Close tab` tooltip/accessibility label. Its vector metadata at `0e9d61c0` resolves to the real `kCloseIcon`; all138 PathElements (552bytes at `0d3f36e0`) exactly match the current licensed `components/vector_icons/close.icon` when encoded with155's actual CommandType table. The verifier compares the entire byte sequence. No icon was redrawn.155's native-theme image button supplies its existing icon color behavior; original numeric color222/hover rendering is not guessed. The retained row uses center cross-axis alignment so the22px control keeps its recovered size beside the existing text button.

## Model/action recovery still in progress

Original Refresh `04685bc4` iterates TabGroupModel's ordered native group IDs, calls its real GetGroup, checks the pointed object at group+b8 byte+11 bit0, stores the first eligible actual group ID, derives its actual tab range/count and hides/closes the control when unavailable/empty. It does not compare a group title here. Row population uses that exact group ID and actual native Tab handles, with real selection and close-by-current-index actions (`04688df0`, `04688e8c`), plus a native group `Close all` command.

The flag's concrete class/setter and producer are not established yet. Agent1852's existing background creates a real group titled `Agent Tabs`; that alone does not prove this hidden native flag or authorize treating arbitrary same-named groups as agent ownership. No such inference is implemented. The actual source's native actions must be recovered before replacing the guarded feed or group cleanup controls.

`verify.py` checks supplied byte pins/dossiers, exact one-file replay, header metrics/text, complete reused close-icon geometry and unchanged RPC/security/action bodies. No shared native edit, build, OS action, signing, launch, owner profile/data access or runtime acceptance occurred. Root owns application and actual native compilation/observation.
