#ifndef CHROME_BROWSER_EXTENSIONS_API_AUX_BROWSER_IMPORT_CHROMIUM_SOURCE_CAPTURE_H_
#define CHROME_BROWSER_EXTENSIONS_API_AUX_BROWSER_IMPORT_CHROMIUM_SOURCE_CAPTURE_H_
#include "chrome/browser/extensions/api/aux_browser_import/chromium_clone_worker.h"
namespace aux_import {
// Real Handler input contains no credentials. Capture is the first MayBlock
// phase, before a new target path/attributes or any copied-profile effects.
struct ChromiumNewTargetSelection {
  ChromiumCloneSource source;
  base::FilePath source_profile;
  std::u16string selected_profile_name;
};
struct ChromiumCapturedNewTargetSource {
  ChromiumNewTargetSelection selection;
  std::optional<CapturedSourcePassword> password;
};
ChromiumCapturedNewTargetSource CaptureChromiumNewTargetSource(
    ChromiumNewTargetSelection selection);
}  // namespace aux_import
#endif
