# Approved disposable-location daemon rebuild

`build.py` reuses the successful A37 daemon's exact Swift link command, with two argument substitutions only: the approved `AuxFreshBootstrapPolicy.swift` SHA5e210c1fbec2224f3de0aada0d5215962a8de139ed596fa664d9ec3a8db2589f, and a fresh `/private/tmp/aux-browser-only-daemon-build-20261025-a64/Aux Daemon` output. The other49 Swift sources,15 compiled native objects and selected archives remain unchanged. It does not run A37's C++ compilation command.

The script verifies the original successful receipt/plan and original binary SHA4891d37f1dc60adc58c34392bf983e2dddb72ab87ec04f750b852f614827d6a4. It checks every prior input pin and pins every explicit file selected by the actual link, including the already-compiled worker object. It compares all pins and the old binary again afterward. The exact command and input hashes are recorded in `build-plan.json`; execution and output evidence are in `actual-build.json`.

Run with the existing Python interpreter. The script enters root `scripts/native-build.py`, which holds `/tmp/aux-build.lock` across verification, compilation and inspection. The existing `-Xlinker -no_adhoc_codesign` argument is mandatory and unchanged. Inspection uses `file`, `otool -l` and read-only `codesign -d`; no signature is created. A preexisting A64 directory is refused and preserved rather than replaced.

This is a raw unsigned executable for root's separate exact-byte package/signing workflow. No app/helper execution, location initialization, owner/nonempty-folder access, Keychain access, signature, provisioning, OS grant, UI change, feature retesting or release is part of this build. Browser C++ source projection/build and final package/runtime acceptance belong to root.
