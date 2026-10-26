# Existing shortcut reservation must not veto another edit

Actual current app rejected two different Search tabs replacements with the same unrelated command 34057 error. Its supplied default is Command+Shift+backslash. SetKeyboardShortcut clones current mappings and calls ImportShortcutProfile, whose ValidateProspective loop tests every effective binding against OS symbolic shortcuts. Thus an unchanged default's existing collision blocks every edit.

One counted native anchor limits the macOS-reservation rejection to changed effective accelerators. A newly assigned reserved chord still rejects, including imports and a reset that changes a custom chord to a now-reserved default. Existing duplicate-table checks, browser-menu checks, OS-query failure rejection, profile generation/revision CAS, managed settings and atomic publication remain intact. No remapping or OS-setting change is performed on behalf of the owner.

This is a source-boundary correction supported by the actual error and exact branch; no broad tests or live shortcut attempts were run. Root owns projection, affected-object build and one successful remap plus reserved/duplicate rejection observation.
