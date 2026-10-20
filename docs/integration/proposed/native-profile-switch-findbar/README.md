# Preserve real Find bar tab-state lifecycle

One ordered provider-source change after 4afdbddbb removes the blanket “FindBarController has ever been created” refusal. No controller, view, widget, API or search behavior is replaced.

The actual controller retains the same window command controller and observes the actual current WebContents/FindTabHelper. It caches no Profile or profile service. Its view/host likewise retain actual window/controller sources. The existing Browser::TabDetachedAtImpl, for the genuinely active removed tab, already invokes ChangeWebContents(nullptr) before profile identity changes. That existing method stops the find-bar animation, saves the source tab's selected range, resets its actual helper observation, hides the window UI without clearing the tab's find-active/search state, and clears the observed WebContents.

Actual target insertion invokes Browser's normal HandleActiveTabChanged and reattaches the real target helper. Pre-identity rollback invokes the same normal path for the source tab. Existing ChangeWebContents restores each actual tab's find state, visibility and focus. The stable bar/command controller stay in the same physical window. No synthetic EndFindSession, search result, selection clear, clipboard read or draft copy is introduced.

Seven production source SHA256 pins in source-evidence.json anchor the actual Browser detach/active-tab chain and Find controller/view/host fields and behavior. This is proof of the current155 normal tab lifecycle used by the real collection transfer, not an inferred original binary field or new gesture.

Verification: reconstruct the complete initial provider from its committed /dev/null patch, replay only the exact provider hunks of each subsequent pinned parent, verify each intermediate hash, then independently apply this one-file proposal and verify the final hash. PASS. No moving shared header baseline is used. No shared edits, native builds, Find UI execution, owner profiles/data, clipboard or runtime/UI acceptance. Other unsupported sources still refuse and no trigger is enabled.
