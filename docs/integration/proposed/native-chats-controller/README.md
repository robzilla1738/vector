# Genuine Chats owner assembly

Two new native files assemble the already recovered Chats components. This is a
necessary Chromium155 ownership adaptation, not an alternative sidebar design.
The section is returned directly: no additional visual container, typography,
placeholder row or generic action is introduced.

The actual region constructs `AuxChatsController(browser, bookmark_associations,
shortcut_help, projection_changed)`, mounts `TakeSection()` in the real body,
then calls `Start()`. `projection_changed` is the region's actual projection/layout
notification; consumers can inspect `chats()`, `agent_installed()` and `tabs()`.
The callback has real feed/association changes, never invented successful data.
Root's ordinary Tabs section and saved-pin controller are separate owners.

All mandatory section callbacks now have concrete producers:

- New Chat/selection/rename settlement/Open in new tab use `AuxChatTabOwner`.
- Rename/archive/context use `AuxChatActions`; Copy retains the real ToastService
  consumer added by the integrator. There is no separate copy-toast callback.
- The row's **Show all** uses the source's filtered list route; the header menu
  uses `AuxChatsHeaderActions` and its different unfiltered route, actual bulk
  POSTs and accepted native confirmation.
- The real transport feeds the real parser, actions, rows, task IDs, selected row
  and represented NewChat. No lexical fallback, synthetic account, response or
  model-proxy transport is added. Account selection is `ChatAccountForProfile`.
- Task adoption expands the actual Chats section. Nested feed application owns
  the actual suppression scope, restored only while the weak owner survives.
- Actual ExtensionRegistry changes re-evaluate the original all-five-set Agent
  predicate and start/stop the real transport. Model/registry destruction retires
  requests, menus, timer/association observation and actual profile-pref observers.

Call `Retire()` at the genuine region Begin/removal boundary **before** changing
Browser identity. Recreate against the actual current profile for commit/abort;
there is no API that silently reuses the old profile's feed. A hierarchy-aware
ViewTracker also retires the owner when the mounted section is destroyed first.
Parent callbacks are weak; callback continuation after row/layout changes checks
actual owner survival. Controller destruction is local and synchronous.

Register `aux_chats_controller.{h,cc}` beside the existing enabled AuxMac UI
sources, with the existing Chats/tab-owner/extensions deps. Requires the
`ea850c95a` ordinary-projection task-owner output and current four-argument
AuxChatActions from root's toast integration. Existing native files are unchanged.

This is not the completed body replacement. The original ordinary visibility
projection, real 5d0 AgentSessionTabsView/native row factory and task drag remain
separate, active work. In particular, this proposal neither assumes that 5d0
must be a direct TabStripView descendant nor inserts an invented ancestor adapter.
The full original Bookmarks/Chats/Tabs body must be mounted before retiring the
independent body. Root owns region mount/GN/compiler integration.

Verification is limited to pure disposable patch replay and static artifact/
dependency pins. No native build, application, daemon request, UI observation,
profile/credential/OS access or signing was performed. Uncompiled and unmounted.
