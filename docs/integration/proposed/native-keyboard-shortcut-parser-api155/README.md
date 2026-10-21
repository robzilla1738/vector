# Keyboard shortcut parser155 include correction

Actual v570 compilation reported the new parser's incorrect `base/strings/split_string.h` include. The actual155 public header is `base/strings/string_split.h`, which declares the exact `base::SplitStringPiece` overload used here. This one-anchor correction changes only that include, with actual570 baseline/output hashes and exact patch replay.

A bounded inspection verified that every quoted include in the three new shortcut files exists after this change. It also checked current declarations for SplitStringPiece, PrefService::GetDefaultPrefValue, RegisterDictionaryPref, SetShortcutHandlingSuspended, Accelerator::GetShortcutText and the WebContents observer callbacks. No additional mismatch was found in this inspection. The result is recorded in api-check.json; it is not a native compile claim. No behavior, UI, schema, metrics or GN changes.

`python3 verify.py` passes counted anchors and exact patch replay. Root owns focused compilation and native application. No shared checkout changes/build/runtime operations were performed in this lane.
