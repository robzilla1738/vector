# Native PDF admission and drain

The actual PDF module now owns a process-wide native admission counter, including calls queued for the PDFium engine mutex. Native `AuxPdfCloseAdmissionAndDrain()` permanently closes admission and returns drained/pending; it never waits inside JavaScript callbacks. `AuxPdfPendingOperations()` observes admitted calls without reopening admission. These functions are native symbols, not new JavaScript exports. Already admitted calls may finish, including writes; the host must retain custody until the real count reaches zero. A wrong-process call is refused. Native mutexes have process lifetime, and no destructor invents drain.

Property getters execute JavaScript while the engine lock is held. Recursive PDF calls now fail before taking that same lock, rather than deadlocking. This does not change the synchronous seven-method API or any method/helper body: the entire region between `PathUtf8` and the common `Run` wrapper is byte-identical to `f902d52ec`. Engine/form/rendering behavior retains its historical fixtures; those broad fixtures were not repeated for this wrapper change.

The real isolated GN target compiled and linked in terminal50200, exit0. The initial link selected the uninitialized in-tree Python shim and failed; the corrected command uses the already available parent-checkout hermetic Python. No Python bootstrap, repair or installation occurred. Only the new owned PDF target/header were copied; no browser target/output was built or changed. Build command, under the shared lock:

```sh
python3 scripts/native-build.py env PATH=/Users/rcourson/Documents/Code/aux-chromium-security-155/depot_tools/bootstrap-2@3.11.8.chromium.35_bin/python3/bin:/usr/bin:/bin:/usr/sbin:/sbin /Users/rcourson/Documents/Code/aux-chromium-security-155/chromium/src/third_party/ninja/ninja -C /Users/rcourson/Documents/Code/aux-chromium-security-155/chromium/src/out/AuxPdfBridge -j2 aux_pdf_four
```

Three actual frozen-Node processes passed in terminal48237, exit0, with disposable homes and synthetic PDFs only. One checks a recursive getter and reentrant native close; one holds an actual Node worker inside an admitted operation while another thread closes admission; one checks idle closure. The native count remains pending until admitted work finishes, and all seven methods refuse subsequent starts. The separate TEST-only observer resolves only an already loaded own image; it is not staged or linked into the product. No original addon, protected API, owner document, real app or OS operation ran.

The retained module is `out/aux-pdf-lifetime/aux-pdf.node`; exact source/config/runtime pins and retained logs are in `runtime-evidence.json` and `evidence/`. Staging now consumes this verified successor. Earlier packaged module evidence remains historical and unchanged. No new candidate has yet been packaged by this slice.

The native host still must call this API on the exact reviewed loaded image and retain custody across its whole transaction. This gate does not stop independent processes, renderer/storage writers or authorize a profile. No trusted native consumer, whole-profile admission, state2 activation or new UI is claimed.
