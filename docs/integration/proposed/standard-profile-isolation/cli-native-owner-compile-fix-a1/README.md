# Native CLI owner compile corrections

Four exact overlays address the five failed owners from root's actual 17-owner build; the other twelve passed. This lane did not compile or mutate the native checkout.

* The narrow membership header explicitly imports the Mach definition of `audit_token_t`, fixing both primary engine and bridge consumers.
* The actual dynamic `bootstrap_register` call remains checked before/after real signed-image revalidation. A one-call clang diagnostic scope documents the deprecated API. `bootstrap_check_in` requires an installed launchd service and cannot replace this dynamic registration without changing installation/authority semantics. Other diagnostics remain enabled.
* SDK-compatible descriptor cleanup now owns its vector; only a local reference aliases it. No Chromium-specific raw-reference header enters the standalone SDK code.
* The native receiver service uses a real process-lifetime `base::NoDestructor` holder. Existing explicit Close/join and pending counters remain unchanged. Static exit cleanup never joins a service thread or produces drain evidence.

`source-plan.json` pins the actual current four beforeimages, seven one-match anchors, final source hashes and the five actual compiler diagnostic files. `native.patch` is the exact delta. Root owns projection and focused recompilation. No signing, native API/product execution, authentication, owner data or runtime readiness claim is involved. These are narrow successors to the already-projected flat CLI source, not replacements for the whole native composition.
