# Supplied Safari WebUI current/new-target owner

Source-only proposal; not applied, compiled, or run by this lane. Six immutable outputs extend the existing real SafariDataImporter adapter; the supplied extension's byte-payload import remains separate. No archive, profile, database, credential, Keychain or OS operation was performed.

`aux_import::SafariWebUIImport(Profile*, SafariImport::Update)` captures the actual initiating profile. `Start(TargetMode, validated_archive_path, WebUILifecycle)` receives original chooser mode0/new or1/current and the actual previously validated picker path. It does not read and re-stage that archive. Mode0 reserves a real ProfileManager path/attributes with source name `Safari` and default avatar before `CreateProfileAsync`, then sets the initialized name in actual preferences/attributes. It does not reuse Chromium's theme/reset/GAIA branches. Mode1 uses the captured actual profile.

`SafariImport::StartFilePath` enters its same native component setup directly. The existing real four-ready/CompleteImport/four-imported barrier remains the destination owner. The first `running` update follows successful component setup, immediately before PrepareImport; Handler should emit source `browser-import-started` with `safari` at this point, not at file selection. Its public byte `Start` and temporary archive ownership remain supported. The added `commit_started()` retains the original source failure distinction without fabricating readiness.

Original42502d8 chooses failure by the commit flag saved before destroying the client. Before commit,4250e40 retains reserved target attributes/path and chooses either native warning or the WebUI `safari-import-invalid-file` event. After commit (or failed initialized target/setup),4251420 removes only this job's real reserved attributes and schedules deletion of its owned target path, then reports failed. Current-profile failure never deletes the captured profile. The original destructor4251a24 does not remove a reserved target; Cancel/retirement here likewise cancels the actual client without inventing rollback of destination writes.

The lifecycle has four explicit fields:

- `retire_owner`: genuine captured initiating native owner's retirement.
- `open_profile`: genuine original loaded-profile/window/gate route, receiving successful target path.
- `invalid_archive`: once bool callback, true only when the genuine captured owner exists and the exact native warning was displayed. L4's `CaptureSafariInvalidArchiveWarning` produces this; absence/false emits Update `invalid-file`, which Handler maps only to source `safari-import-invalid-file`.
- `has_owner_window`: required repeating actual-owner presence predicate. L4's `CaptureImportOwnerPresence` produces this; no guessed visibility or success constant.

The warning source458d4ec uses Warning style, title `Invalid Safari ZIP File`, body `This is not a valid Safari data ZIP file.`, one `OK` button, modal. Its4250f3c branch returns before the fallback WebUI event4250f40, so the adapter preserves exclusive consumers. Successful completion is posted independently of Handler lifetime. A present real owner is retired before the existing Safari completion dialog; absent owner in new mode directly opens the successful profile, with no invented modal. The final weak Handler update is invoked after genuine completion UI, matching original ordering. No standard-window-button controls are added: the Safari source has no Chromium/Firefox458cf98 call.

## Integration

Root registers `safari_webui_import.cc/.h` in the actual Mac importer target and retains existing Safari client, profile metadata and completion-choice dependencies. No GN changes are made here. Focused compile targets are this new owner, existing `safari_import` and `import_completion_choice` objects. Handler binds the four real lifecycle fields, chooser mode, selected archive, and the state/event mapping above. L4 separately delivers only native presence/warning capture bindings. No changes to Handler/root manifests/shared native files are included.

`python3 verify.py` checks the complete static original hash, every bounded code/literal pin, counted baseline anchors and disposable six-file patch replay. It does not compile/run native code or establish runtime import acceptance. The genuine destination completion behavior remains unobserved on disposable Safari data.
