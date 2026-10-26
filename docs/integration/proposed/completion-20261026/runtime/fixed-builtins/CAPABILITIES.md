This batch closes fixed-image loading/capture and finite filesystem publication source gaps. It does not claim the final plan complete or runtime behavior verified.

| Native API | Input paths | Output paths/effects | Source disposition |
|---|---|---|---|
| PDF extractText | filePath | returned text/pages | Current-image main facade; private roots refused |
| PDF getFormFields | filePath | returned field data | Same |
| PDF merge | files[].filePath | outputPath | Every nested file checked; private stage then atomic entry publication |
| PDF rotate | filePath | outputPath | Same |
| PDF fillFormFields | filePath; fields contain values, not file paths | outputPath | Same |
| PDF split | filePath | outputDir/page_NNN.pdf | Generated children staged, no caller-directory image writes |
| PDF renderPages | filePath | outputDir/page_NNN.png | Same |
| generate-thumbnail | filePath | iconOutputPath, thumbnailOutputPath | Staged PNG snapshots; actual late callbacks retained until native drain |
| list-open-apps | filePath | optional iconDirectory/*.png | Native OS app list; staged icon publication |
| app-icons | bundleIds (OS identifiers) | iconDirectory/*.png | No caller filesystem input; staged icon publication |
| copy-file | filePath | writes file URL to system clipboard | NO filesystem destination key; native input protection applies before clipboard disclosure |
| open-with | filePath, appPath | NSWorkspace application launch | Refused before native module call; finite external launched-app ownership still required |

The table is checked against every RequiredString path use in supplied `aux-native-pdf-engine/source/AuxPdfFour.cc`, and every dictionary path access in `aux-native-macos-utilities/source/AuxMacOSUtilityCommandCore.swift`. `AuxAppKitUtilityBoundary.copyFileURL` uses NSPasteboard.clearContents/writeObjects([NSURL]); its name does not mean a disk copy. Native utility `run` dispatches exactly the five listed commands; it exposes no exec/spawn/shell API.

All filesystem input/output paths deny actual captured Control, Task, browser User Data and browser external Cache roots and the sealed app. The only exception is utility reads/writes within actual Control/cache/preview-images, the exact supplied global nonsecret cache producer. Symlink aliases resolve once and publication retains canonical parent FDs; a requested alias cannot redirect later writes. Private generated staging is under Task custody, reached only through native root descriptors, and is never a caller-selected output authority.

Existing remaining source owners:

- Supplied `getPreviewImageCacheDir()` uses actual `AUX_HOME_PATH=auxTaskRoots().controlHome`, then cache/preview-images. That exact route is admitted for utility cache outputs.
- Actual A51 agent context uses `sessionDir:getSessionTaskDir(this.session,this.accountId)`; core/REPL receive it as sessionStorageDir. `getSessionTaskDir` resolves actual Task/u/<numeric-account-id>/sessions/<validated-session-id>, and `ensureSessionTmpDir` appends tmp. Global auxTaskRoots freezes actual owner/transport generations, but not selected account incarnation/session authority. This batch refuses those protected paths; the integration lane owns the required actual selected-session root capability. No JS selected path can serve as that authority.
- PDF write methods are currently advertised through AuxPDFRepl, whose arbitrary code/REPL task entry remains behind supervisedTasksEnabled=false. That guard stays. Native fixed loading does not complete generic REPL supervision or private task outputs.
- PDF extractText is also called by the existing read-file tool; private attachments require the same actual selected account/session read owner, while permitted external selected files can use the fixed main facade. HEIC thumbnail outputs under session tmp require the selected-session publication join.
- CdpClient.ensureConnected/send and the extension command broker retain their generic guard here. `send` accepts arbitrary CDP methods/session IDs; extension routing permits partial/missing selectors with unique-connection fallback. A main installation/builtin owner proves neither selected Profile nor incarnation. The desktop lane owns the finite browser owner/transport correction using actual browser/Profile custody.
- Generic exec, PTY, Computer Use, runtime mutation and arbitrary addon loading remain source-disabled and are the integration lane's finite existing-owner follow-up. This batch changes neither their flags nor their advertised requirement.

No source absence above is recast as an account/vendor-only test gate. OS QuickLook/clipboard/AppKit execution, actual browser ordinary startup, loader signatures/resource seals in a coherent successor, alias handling, real PNG/PDF outputs, asynchronous cancellation/drain and clean Quit still require the final exact approved disposable journey. No OS grant or live app operation occurred here.
