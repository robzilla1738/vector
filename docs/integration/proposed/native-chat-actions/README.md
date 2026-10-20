# Original Chats row action owner

Source-only, unmounted two-file native proposal. Apply after the compiled original Chats model/transport and `native-chat-tab-association`. No shared native file was changed and no clipboard, network, dialog or OS action was executed.

`AuxChatActions` supplies the actual row context-menu lifecycle, pin/unpin/archive/rename/delete/mark-read/open-folder requests, bookmark creation, clipboard action and new-tab dispatch. Original commands1998–2007, native menu flags9, ordering, separators and enabled predicates are retained. `MenuClosed` posts a weak generation-matched action, destroys the real runner/model, then performs the selected effect. The owner retires permanently before profile replacement; late menu/dialog/request callbacks cannot revive it.

Rename uses the genuine native DialogModel and trims leading/trailing Unicode whitespace, preserving internal whitespace. Delete sends the real delete request only from the confirmation callback. Pin remains pending until its real transport completion; neither HTTP failures nor cancellation are reported as successful effects. The transport remains responsible for original account/auth lookup and actual REST requests.

Bookmark command source46398c8 calls4670990: recursive depth-first folder search, bookmark-bar root before Other Bookmarks. It creates the renamed visible `Aux Tasks` folder only when neither search succeeds, then appends the actual task title and canonical task URL. Existing matching bookmarks disable that action. This is not a URL-based claim of native tab ownership.

Mandatory constructor callbacks are actual synchronous current-account lookup, actual `OpenInNewTab(id)`, and the original copied-session toast. They are checked, not replaced by empty callbacks. The native source shows toast text `Session ID Copied!`; wiring the genuine toast consumer is still required. Rename called from a double-click must first run the task-selection owner's original pending-selection settlement; this menu owner does not close tabs itself.

Remaining full-body dependencies: real tab selection/reconciliation and special-handle producers, NewChat/ShowAll routes, section-wide menu actions, popover effects, genuine Tabs section filtering and original Bookmarks owner. This proposal alone does not authorize removing the existing sidebar body or establish UI parity.

Run `python3 verify.py` for full supplied-artifact/range hashes and disposable two-file patch replay. Root owns GN/native compilation and mounting. No existing proposal is regenerated.
