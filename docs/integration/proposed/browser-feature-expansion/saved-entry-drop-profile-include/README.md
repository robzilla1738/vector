# Saved-entry drop target: complete Profile type

The actual full a12 compile failed at `aux_saved_entry_drop_target.cc:228`: the async commit callback compares `WebContents::GetBrowserContext()` with `raw_ptr<Profile>`. The header forward-declares `Profile`; this translation unit did not include its definition, so `raw_ptr` equality could not establish the `Profile : public content::BrowserContext` relationship.

This one-line source fix directly includes `chrome/browser/profiles/profile.h` in the implementation. The header continues using a forward declaration. No cast, pointer extraction, ownership change, condition change, or UI change is introduced.

Baseline: the exact selected Chromium source at `/private/tmp/aux-chromium-recovery-snapshot-20261023/src/chrome/browser/ui/views/frame/aux_saved_entry_drop_target.cc`. Compiler evidence: `/private/tmp/aux-chromium-recovery-snapshot-20261023/unsigned-browser-features-full-build-20261023-a12/build.log`, lines 31–50. The selected `profile.h:68` declares the concrete inheritance.

`manifest.json` pins the before/after bytes. The one-file patch passed whitespace-error checking and exact replay against its baseline. No extra compile, test, app execution, shared-source mutation or signing was performed. The integrator must project/register this leaf if it is outside the existing feature manifest and rerun the failed native build.
