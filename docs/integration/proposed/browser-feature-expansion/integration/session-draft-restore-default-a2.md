# Correct the ineffective profile-hook default

The real A20 disposable `Aux Final Work` profile had no explicit `session.restore_on_startup` value after creation. The identity hook cannot establish this default reliably because another real profile owner can have already initialized the identity before its fresh-ID branch. The previous source-only check did not establish runtime reachability.

This successor restores `profile_gate.cc` exactly to its original `bb6e9b51233fab3d85e1c44a385fb7296af0a9ee88bd43fa7d9c2eb9a6c609a1` bytes. The logical-ID snapshot serialization from the previous patch stays intact.

`SessionStartupPref::GetDefaultStartupType` now returns `LAST` for the fixed `ENABLE_AUX_BROWSER` product selection. The existing registry registration and native startup/session restore own the behavior. Explicit user preferences, mandatory policy and recommended values keep their normal precedence. No preference file is written by computing the default, startup URLs remain untouched, and no existing draft, page ID or key is transformed. Other build selections retain their prior default. An absent explicit value remains normal: the effective registry default is the relevant fact.

Four counted anchors across two source files apply against the current A20 native bytes. Independent patch application reproduces both output hashes. No native build, UI observation, state mutation or signing by this lane. Root must compile the affected owners and check actual effective startup behavior plus normal quit/restart in the approved disposable scope; this source correction alone is not runtime acceptance.
