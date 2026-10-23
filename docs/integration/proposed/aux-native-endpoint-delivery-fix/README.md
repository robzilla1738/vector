# Exact endpoint delivery compile correction

The actual85029 five-object check failed only on the third Chromium object: `base::apple::ScopedMachSendRight` has `is_valid()` and no Boolean conversion. The source correction changes only `right ?` to `right.is_valid() ?`. The two prior actual Chromium transport/owned-child objects passed unchanged; neither Node object ran.

This directory preserves the exact failed manifest, recipe, source and all three logs/result. Original retained objects remain at the output path in `review.json`. No failed evidence is promoted to success. Active source and recipe hashes are refreshed in the original proposal; historical manifests/recipes remain intact.

After review, run the active recipe under the native build serializer with `--remaining-after-85029 --output <fresh external directory>`. This mode requires exact prior failure/passing-source evidence, then compiles only corrected Chromium delivery plus both previously unrun Node objects. It records prior passing objects separately from newly compiled commands. Default mode remains the complete five-object recipe.

Python syntax and exact current input/configuration pins were checked. No compiler was queued for this correction. No Mach, Security, native code, launch or UI was executed. The newer fileport proposal remains a separate uncompiled successor; these first two passing object receipts apply only to original handoff sources, never the fileport changes.
