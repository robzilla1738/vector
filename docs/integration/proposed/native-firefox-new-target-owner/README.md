# Genuine Firefox new-target owner

Incremental proposal against actual467's `firefox_import.{h,cc}` (unchanged by the subsequent chooser/helper batch). Fifteen sequential count-checked anchors/two outputs. No shared native/GN/handler write or execution occurs here. It extends the existing real Firefox owner rather than introducing a second importer or a bare-directory success path.

Existing `Start()` remains current-profile mode1, with no native completion UX, and retains the actual public update shape/progress and cookie/password/store completion barrier. WebUI uses the new overload:

```
FirefoxImport::TargetMode { kNewProfile = 0, kCurrentProfile = 1 };
FirefoxImport::WebUILifecycle {
  RepeatingCallback<void(bool)> set_controls_enabled;
  OnceClosure retire_owner;
  OnceCallback<void(const base::FilePath&)> open_profile;
};
Start(TargetMode, WebUILifecycle);
```

All WebUI calls require genuine weak-window controls and retirement callbacks; new-target mode additionally requires a real profile loader. These are required consumers, not no-op success callbacks. Root owns binding them from the actual WebUI browser/window and target loader. The private migration and success predicates do not depend on callback-supplied fictional profile state.

Source4263494..4263748 reserves the real next ProfileManager path, derives UTF16 `Firefox` plus ` - ` and the selected SourceProfile's profile name only when nonempty, chooses an avatar index from actual ProfileAttributesStorage, adds ProfileAttributesInitParams, then calls the real CreateProfileAsync with initialized callback and an empty created callback. The source's profile string at SourceProfile+70 maps to actual155 `SourceProfile::profile`, not an invented `source_name` field. The source's avatar is the storage-chosen default index; no custom Firefox photo payload is read or fabricated.

Exact callback4263ddc..4263f48 rejects null initialization, writes `profile.name`, updates the actual attributes entry's local name with default=false, and launches the existing real host into the initialized Profile. Unlike Chromium4257878, the complete Firefox callback contains **no explicit theme reset, tracked-reset-list pruning or imported GAIA image branch**. This proposal deliberately retains the initialized profile's genuine155 default theme instead of applying the Chromium-specific helper speculatively. Its original SourceProfile/items capture remains in this owner until the callback, and cancellation invalidates that weak callback. Observer reentrancy is checked after real attribute/pref mutations before further owner access.

Only then is the existing ExternalProcessImporterHost started with a real ProfileWriter and genuine cookie preparation/password result machinery. The same host/item/cookie/password barrier gates completion for either target. Directory creation or a successful Profile callback never marks the job succeeded.

Source4263840 removes a failed reserved target's attributes and schedules its owned target directory for recursive deletion. The proposal limits this cleanup to the actual ProfileManager-reserved path stored by this new mode; current mode has no such path. Cancellation and active-owner destruction clean up the reserved target, while success preserves it. The worker delete is an actual155 MayBlock task; exact historical ThreadPool shutdown traits are not asserted. No arbitrary incoming path or source directory can enter this cleanup API.

Source4262e44 uses the show-completion flag at+70 to disable initiating window standard buttons0/1/2 through458cf98; failure restores them. Success4264450 posts the captured completion UX before invoking its original success callback. Source4264730 distinguishes current vs new mode: current shows the one-OK import-completed alert; new shows migration-completed Open Profile/Not Now. Only actual acceptance consumes the target-loader callback. The posted task owns the real target path and once callbacks independently of owner lifetime. Root's genuine retire-owner callback corresponds to the original success wrapper's actual browser close before showing that leaf. No unconditional switch is introduced.

Required integration dependencies: real existing profiles/ProfileManager/storage/prefs plus the already delivered `import_completion_choice` Mac helper. Root owns targets and WebUI bindings; no handler or GN edit is bundled. Actual window controls/retirement/target-loader bindings and compiled/runtime acceptance remain necessary before enabling the WebUI path.

Five exact original ranges cover start/flag/window-control ownership, new-target path/name/default-avatar reservation, initialized callback, failure cleanup and completion choice. Original literals and both output hashes replay cleanly in a disposable directory. No profile created/read, prefs written, source DB/NSS/Keychain accessed, dialog shown, browser launched, native build or signing occurred. Full Firefox/new-profile runtime parity is not claimed by this static check.
