# Out-of-line conservative accessor default

Corrective successor for actual native build71878's Chromium plugin error: non-empty virtual methods may not be defined inline. The header now only declares `BrowserProcess::profile_manager_if_initialized()`; its existing conservative null default is defined in `browser_process.cc`. No behavior, manager creation, real implementation override, aggregate call or UI changed. Historical proposals and their evidence remain intact.

The exact applied input is `out/native-reuse-composition-aux-noncreating-profile-manager/manifest.json`, SHA-256 `3fbf8b1c59ea8286aed1c98d5a0903575dddff4c42fba522e296c918f5e933c1`, 791 source records /23 assets. The additional actual `browser_process.cc` input is pinned independently. Two count-one anchors and complete source/patch pins are retained in `inputs.json`.

`prepare-composition.py --output <fresh-directory>` verifies that applied parent and all source baselines through the existing extender without staged-base forcing. It produces an unapplied 792-source /23-asset successor. No native checkout mutation, build, browser run or protected operation was performed in this lane. Root owns application and the changed native build. This correction removes the reported style violation without suppressing it.
