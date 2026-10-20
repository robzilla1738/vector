#ifndef CHROME_BROWSER_EXTENSIONS_API_AUX_BROWSER_IMPORT_CHROMIUM_CLONE_WORKER_H_
#define CHROME_BROWSER_EXTENSIONS_API_AUX_BROWSER_IMPORT_CHROMIUM_CLONE_WORKER_H_

#include <optional>
#include <string>
#include "base/files/file_path.h"
#include "base/values.h"
#include "chrome/browser/extensions/api/aux_browser_import/source_crypto.h"

namespace aux_import {

// Original425fe90 source-kind order; not public source IDs or UI indices.
enum class ChromiumCloneSource {
  kArc, kBrave, kAtlas, kChrome, kComet, kDia, kEdge, kHelium
};

struct ChromiumCloneRequest {
  ChromiumCloneSource source;
  base::FilePath source_profile;
  // The genuine reserved, unloaded new ProfileManager path, never a live path.
  base::FilePath target_profile;
  std::u16string profile_name;
  // Captured by the original pre-worker source-key owner. Absent is distinct
  // from an admitted empty password. This worker never performs a new lookup.
  std::optional<CapturedSourcePassword> captured_source_password;
};

struct ChromiumClonePhoto {
  std::string url;
  std::string bytes;
};

struct ChromiumCloneWorkerResult {
  bool success = false;
  std::string error = "Chromium browser import failed";
  base::FilePath target_profile;
  std::u16string profile_name;
  // Private native DTOs; their Blob byte fields MUST NOT pass through JSON/RPC.
  base::DictValue cookies;
  base::DictValue passwords;
  base::ListValue extensions;
  std::optional<ChromiumClonePhoto> photo;
};

// MayBlock full original4255868 worker. Successful completion means the copied
// unloaded profile and restoration data are ready for real CreateProfileAsync.
// It does NOT mean initialized-profile/destination/activation success. Caller
// must join the existing cookie/password/extension destination barriers and
// apply the actual initialized-profile metadata before final completion.
ChromiumCloneWorkerResult PrepareChromiumNewTarget(ChromiumCloneRequest request);

}  // namespace aux_import
#endif
