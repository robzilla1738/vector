# Supplied sidebar native system-menu contents

This follows `native-sidebar-context-menu-admission` without changing BrowserWidget again. The supplied normal-window builder is fully recovered: Init c7836ac→BuildMenu c7836fc chooses normal type0, then cbafc38→4600df4. The app/popup path c783710 is separate and remains unchanged.

The original normal-window order is:

1. New Tab34014, Reopen Closed Tab34028, Bookmark All Tabs35001, Name Window34049.
2. Separator, actual Gemini pin53320 (real profile eligibility/dynamic pinned preference).
3. If the actual vertical-tab controller exists: separator, Show Tabs Vertically/Horizontally34058; while vertical, Collapse/Expand Tabs34061; while vertical and the real hover feature is enabled, auto-expand toggle34060.
4. Separator, actual Task Manager40287.

The complete original4600df4..141c does **not** add Tab Search pin53321, horizontal unified-tabstrip scroll-button pin, or tabstrip feedback. Current155 adds those three controls. This narrow Aux-Mac branch excludes only those source-absent entries, restoring the genuine menu's order/grouping without removing their implementations elsewhere. Gemini pinning must remain: resource2173 is `Pin Gemini`, not Tab Search. No placeholder or invented action is substituted.

Existing native delegate semantics are retained. Original c7839e0..3a18 uses real Glic profile eligibility for command53320 and actual command enablement otherwise. c783b00..cf4 dynamically resolves restore-window/group/split, vertical/collapsed/hover state and actual Glic pinned preference. The current155 delegate provides those same real sources and native commands. No fake checked/enabled values, target state, preference writes or new dispatch path is added. Current Mac `chrome::CanOpenTaskManager()` is always true, matching the original unconditional final row.

The original English resources retain Title Case. Current Mac-specific resources match those visible captions; native MenuControllerCocoa runs labels through `FixUpWindowsStyleLabel`, which strips mnemonic markers and converts ASCII three-dot suffixes into the original ellipsis. Therefore the builder requires no hardcoded labels, punctuation rewrite or global resource changes. Exact original resource IDs/text and current native conversion snapshots are included. Equivalence of every localized catalog is not claimed.

Only `system_menu_model_builder.cc` changes; no BrowserWidget, Body, Region, top-controls, chat actions, GN or native/shared files are modified. Existing app/popup, non-Aux and non-Mac builders are preserved. `python3 verify.py` checks exact actual397 baseline hashes and independently replays the one-file patch. No build, runtime menu invocation, owner state or network operation was performed; disposable native observation remains root integration work.
