# Original explicit post-import Open Profile choice

Two new Mac leaf source files; no shared handler/GN/native writes. The prior switch interpretation is corrected by the actual called implementation: completion flag13 does **not** mean unconditional profile activation. The original new-target path first asks the user whether to open it.

Original4258c80 requires both destination completion flags, consumes the actual completion callback with true, and returns immediately if flag13 is false. When true, it posts the real current-mode callback425902c or new-target callback4259100. The former reaches458d328; the latter reaches458d0b4. The retained source-browser display name is copied into the posted task, with the actual target path additionally captured for the new-target path. No directory copy or initialized Profile alone triggers these completion alerts.

The exact new-target leaf458d0b4 creates an informational NSAlert titled `<browser> migration completed.` with body `Your data was migrated from <browser>. Do you want to open the migrated profile now?` and buttons Open Profile / Not Now. Only first-button1000 invokes ProfileManager's actual target-profile loader7acaadc with captured target path and its real completion callback458d2f0. Other responses perform no activation. The current-mode leaf458d328 instead displays `<browser> import completed.` / `Your data was imported from <browser>.` and one OK button, with no profile switching.

New typed155 adapter API:

```
ShowNewProfileImportCompleted(browser_name, base::OnceClosure open_profile);
ShowCurrentProfileImportCompleted(browser_name);
```

`open_profile` is an explicit required consumer; it is consumed only on actual Open Profile acceptance and otherwise destroyed. Root must bind the genuine loader/target path with its real context ownership, never a successful no-op or an automatic switch. The adapter deliberately separates this recovered alert leaf from the original wrapper's weak native-window activation and target-loader callback: those remain real owner integration requirements. It does not pretend the two helper calls are the entire new-profile lifecycle.

Original nine exact UTF16/CFString literals, actual Objective-C selector stubs and the full458d0b4..458d5b0 branch are pinned. Both new files replay cleanly. No alert was displayed and no profile, runtime, DB, Keychain, build or signing operation occurred. Root owns registration/GN/application and must call these only after the real extension/cookie/model destination barrier and optional completion-UX gate.
