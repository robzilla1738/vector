# Lasso transform request ownership — supplied1852

A new start on the same runtime port aborts the old transform and installs a new
AbortController. Previously the old promise's delayed completion/catch always
cleared the shared controller. That orphaned the new request from later abort or
disconnect, and old chunks/completion/errors could be delivered to the new UI.

The single exact function replacement captures the actual controller as request
owner. Only that owner can emit chunks/completion/errors or clear current state.
Abort/disconnect first removes the owner, then aborts it. Original routes, request
payloads, streaming decoder, error text, authentication and UI remain untouched.
No native or daemon changes are required.

`patch.json` pins the complete frozen background.js input/output and a count-one
anchor. `prepare.mjs` reproduces it from the frozen source. `check.mjs` executes the
actual replaced port function with deferred transport promises: A→B followed by
late A failure/chunk, B cancellation, normal C completion, D disconnect and late
completion. All pass. Full output syntax passed. No cloud request or UI operation
was performed. Root must integrate this adapter and include background.js in the
reviewed staged-leaf inventory before actual acceptance.

## Activation and notification audit

Lasso selection is implemented in supplied content/content.js, dynamically
registered/injected by background.js through chrome.scripting. The supplied
iframe routes include /lasso, /selection-handle, /capture-toolbar and
/capture-result. Settings has distinct text-selection and lasso-selection flags,
modifier configuration (default Alt), and original action definitions. Therefore
absence of a native C++ Lasso class is not evidence of a missing activation owner.
Actual pointer selection/capture activation and coordinates still need acceptance;
the transform port alone never established those.

Native NotificationInbox keeps a weak original Profile and sends original Agent
messages through that profile's ExtensionRegistry/MessageService. Its asynchronous
save reply uses the inbox's weak pointer; shutdown invalidates it. Permissions
and encrypted storage remain original source paths. No definite native lifetime
or cross-profile routing defect was found in this bounded trace.

For extension-owned clickable notifications, background.js `ly` stores clickPath
and windowId; onClicked clears the entry and invokes `ic`. That helper queries,
updates or creates main.html tabs using the calling extension's Chrome API profile
context and focuses the result. The stored window is only a target hint, not a
new account authorization. Actual late click after that window is closed or
transferred profiles remains unaccepted: target-window query/create can reject,
and the existing handler logs the failure. No guessed cross-profile fallback was
added. Notification clicks are therefore not marked fully accepted by this audit.
