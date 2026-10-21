# Agent-page toolbar visibility

One-file incremental proposal on the exact native-supplied-agent-text-pill/d8c634bd9 output. Root owns application/build; shared native remains untouched here.

This is an explicitly observed supplied-reference Chromium155 integration, not a claim that the stripped153 pending-navigation predicate has been fully recovered. Root's controlled actual Aside comparison establishes that the Ask action is absent on its Agent settings page and present on an external page; supplied NTP references also omit it. Original041f0808/041f0c1c origin checks corroborate a native Agent-page condition, but their exact navigation-entry field mapping remains unresolved.

The narrow adapter suppresses only the genuine Aux Agent action when the active WebContents' **last committed URL** is either the actual Agent extension origin or chrome://newtab. It preserves the existing Agent-panel-open condition. It does not inspect pending/visible URLs, invent account state, alter other extension actions, mutate the stored pin preference, or force an unpinned action onto external pages.

Creation, IsActionVisibleOnToolbar and UpdateIconVisibility use the same condition. Existing ExtensionsToolbarViewModel::DidFinishNavigation admits only actual committed primary-main-frame navigation; its active-tab/WebContents replacement observers enter OnActiveWebContentsChanged, which calls UpdateAllIcons. That existing consumer now refreshes genuine Agent visibility, so switching away or committing an external URL restores it according to the original pin/forced-visibility policy. No new observer or lifecycle is introduced.

`python3 verify.py` validates exact hashes, five counted transformations (one intentionally matches two existing guards), and disposable patch replay. No C++ build, browser/owner-data access, signing or runtime actions occurred. Packaged transitions external→NTP/settings→external and panel open/close remain root's observation check.
