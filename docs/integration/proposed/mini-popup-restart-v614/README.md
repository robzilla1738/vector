# Mini Popup singleton draft recovery

Follow-up to `mini-popup-unsent-work-v613`, using the existing supplied record store rather than a replacement format or fake session identity. The original `minipopup-LkDLFvnq.js` new-chat composer has one module-local draft. It now imports the actual supplied `F/J` reader/writer, exported as `i/l`, with explicit third-argument scope `mini-popup:new`. Only that literal scope joins the existing writer's durable allowlist. Browser Profile isolation remains the actual extension origin's separate storage; no account lookup, path construction or cross-profile registry is introduced.

Normal new-chat text, rich document and completed serialized attachments use the existing version2 record and synchronous writer. They reload when a new popup document is created after disable, cross-profile return or browser restart. Successful writes release the protective listener because the actual retained data has a durable owner. Original storage failure behavior remains visible and fail-closed: shared unsaved-memory Map and beforeunload guard retain the draft, and the composer's existing return-false error path displays its error. Native pending picker/file-read protections are unchanged.

Private-mode handling is explicit. The actual supplied new-chat hook accepts `defaultDraftState.draftMode` and resolves it through its existing mode function; its original `handleDraftModeChange` remains responsible for React state and send behavior. The wrapper must remove both persisted/session copies successfully before entering incognito. On failure it reports an error and does not change mode. Incognito edits remain module memory only, protected against destructive transitions. Same-document reopen/remount retains their mode. A fresh document starts normal and cannot recover incognito text. Explicitly returning to normal saves the current draft through the same writer; failed saves retain the original protection and show an error. This changes no provider/session creation behavior and does not make private drafts durable.

Clearing/submitting uses the original callback locations and clears the store. A failed post-submit clear reports an error and retains a blocker rather than silently claiming success. Forced process termination while storage removal itself fails cannot guarantee deletion; no such claim is made. Existing-session reply drafts retain their pre-existing session owner; this change specifically addresses Mini Popup's otherwise module-only **new-chat** draft. It does not promise automatic reopening of a selected running session, persistence of model/project preferences, or daemon-task migration.

## Integration and lean checks

Commit is a follow-up to51e35fec6. Only `scripts/lib/provided-draft-flush.mjs`, the focused check and these notes change. Existing stage pipeline already invokes the transform; root must review the changed Mini Popup and draft-storage leaves. No native rebuild, styles, dimensions, shortcut registration, globals in other windows, or helper execution.

Six Mini Popup anchors and the existing draft-writer anchor are checked against the frozen supplied files. Run:

`node docs/integration/proposed/mini-popup-unsent-work-v613/check.mjs <frozen-agent/assets/minipopup-LkDLFvnq.js>`

Passed actual transformed module syntax, normal fresh-document recovery with completed attachment, separate-profile store isolation, incognito removal and memory-only edits, explicit normal-mode persistence, failed deletion refusing private-mode change, failed save retaining draft/guard, retry clearing guards, clearing without resurrection, and reapplication rejection. The test evaluates the actual transformed F/J functions and Mini Popup callbacks, not a duplicate storage implementation.

Pinned supplied input/output hashes for this transform alone:

| Leaf | Input | Output |
| --- | --- | --- |
| minipopup-LkDLFvnq.js | 8fd650df3497acc5e8a5c34ab5990f45c9e97c0c920e4a7735f7b28aba72469e | cf574660c1a06b4c7527c774dd448317c479ad77f95ff8c068b516d66001909e |
| draft-storage-ixLojjZ5.js | 4fd066c4a2b8c9d5021e9687463a0ce8bcbd193268f44a18b4ce12c2f05c38bc | 1218b7d98c116d3d9bd92e1b5e314c7fb505a6d49d7a2304628eb378b208fecc |

## Actual acceptance still required

Use the existing supplied Settings → Mini popup and displayed global shortcut. Normal draft → hide → disable/re-enable → reopen should restore text/file. Normal Quit/reopen and global invocation should restore the same draft in its original profile only. Enter incognito, edit harmless text, hide/reopen in the same document to retain it; explicitly clear before disable or profile replacement. A fresh document must not recover private text. Return to normal only when intentionally testing persistence. Clear test drafts and restore the original disabled preference afterward. Synthetic modifier delivery remains inconclusive; no show/test API or substitute ordinary-tab surface is added.
