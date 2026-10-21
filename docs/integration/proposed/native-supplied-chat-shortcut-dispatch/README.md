# Deliver supplied chat accelerators through actual Cocoa event dispatch

Root's actual547 observation: the restored real Ask Aux toolbar action opens the supplied panel, but Command–E produces no change. The original Aside Command–E toggles that same panel. The handler and original accelerator values are already source-pinned in `native-supplied-ask-shortcut`.

The exact current155 cause is a missing platform producer. `AcceleratorsCocoa` only provides command-to-accelerator lookups; it does not participate in `CommandForKeyEvent`. Actual Cocoa dispatch first matches a main-menu item and then the independent `GetShortcutsNotPresentInMainMenu()` table. The new Ask/New Task commands have no main-menu items and are absent from that table, so their events never reach their existing native command handlers.

This one-file Chromium155 adaptation adds the original Command–E34068 and Command–Shift–E34067 values to that actual non-menu event table under `ENABLE_AUX_BROWSER`. The values are proved by original native table rows `cef735c` (`148500001000000045000000`) and `cef7368` (`138500001200000045000000`), already pinned in the prior proposal. Existing key-equivalent matching, command support checks, first-responder handling and actual command consumers remain intact. No parallel event monitor, hardcoded key-layout interpretation, synthetic session or renderer is introduced.

Exact547 preimage/output/anchor hashes are in the manifest. Disposable counted patch replay passes; no shared native edit, build, launch or profiles/OS operation was performed. Integrator should compile this one ObjC++ object and observe both shortcuts from the actual webpage and supplied panel. No extra full suite is needed for this narrow dispatch correction.
