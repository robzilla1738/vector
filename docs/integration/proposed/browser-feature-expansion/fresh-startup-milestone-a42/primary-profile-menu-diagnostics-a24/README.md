# Primary profile menu dispatch observations — A24

Direct sidebar dots successfully select isolated windows, while primary-menu row selection only dismisses the menu after the CPU stall was repaired. No deterministic moved-WeakPtr defect was found: the destructor copies sender/source/epoch from separate members and moves only the pending closure. All actual safety checks and callback ordering remain intact.

This narrow source projection traces row selection, menu destruction, successful UI-task posting, current-source/action state when that task executes, ordinary source-gate rejection, and native-window dispatch. Logs contain only fixed stage text and booleans, never profile paths, identities, URLs, account data or drafts. A menu-row event without destruction identifies teardown; posted=true without source_current identifies the UI task boundary; source_current=false identifies the intentional stale-source fence; native-dispatch means the request reached Chromium profile-window handling, not that activation has succeeded. No truthy readiness/success is invented.

One native file, six exact-count anchors, no style/material/layout or permission change. Exact replay and diff checks pass. Root owns the composed build, approved signing and bounded real primary-menu check. No isolated-tree mutation, build, signing or app action occurred here.
