#include "chrome/browser/extensions/api/aux_browser_import/chromium_source_capture.h"
#include <utility>
#include "base/files/file_util.h"
namespace aux_import {
namespace {
const char* SourceId(ChromiumCloneSource source) {
  switch (source) {
    case ChromiumCloneSource::kArc: return "arc";
    case ChromiumCloneSource::kBrave: return "brave";
    case ChromiumCloneSource::kAtlas: return "atlas";
    case ChromiumCloneSource::kChrome: return "chrome";
    case ChromiumCloneSource::kComet: return "comet";
    case ChromiumCloneSource::kDia: return "dia";
    case ChromiumCloneSource::kEdge: return "edge";
    case ChromiumCloneSource::kHelium: return "helium";
  }
}
bool HasEncryptedData(const base::FilePath& path) {
  // Aux imports ordinary site sessions, never stored user passwords.
  return base::PathExists(path.AppendASCII("Cookies")) ||
         base::PathExists(path.AppendASCII("Network/Cookies"));
}
}  // namespace
ChromiumCapturedNewTargetSource CaptureChromiumNewTargetSource(
    ChromiumNewTargetSelection selection) {
  ChromiumCapturedNewTargetSource captured{std::move(selection), std::nullopt};
  const auto& input = captured.selection;
  // Exact425957c mode0 branch: Atlas bypass FIRST, then directory+four paths.
  // Failed lookup remains absent;4255868 performs its original key admission
  // after the reply/reservation. Never invent a key or retry after the clone.
  if (input.source != ChromiumCloneSource::kAtlas &&
      base::DirectoryExists(input.source_profile) &&
      HasEncryptedData(input.source_profile)) {
    captured.password = CaptureSourcePassword(SourceId(input.source));
  }
  return captured;
}
}  // namespace aux_import
