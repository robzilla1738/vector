// Synthetic-only probe. Never calls Apply(), opens an Aux profile or Keychain.
#include "chrome/app/aux_packaged_state_identity.h"
#include "base/at_exit.h"
#include "base/files/scoped_temp_dir.h"
#include <iostream>
#include <utility>
#include <vector>
int main() {
  base::AtExitManager exit_manager;
  using aux::state_identity::PackagedIdentityMarkerAllowed;
  using aux::state_identity::PackagedIdentityMarkerAllowedAt;
  const std::vector<std::pair<std::string, bool>> cases = {
    {R"({"version":1,"implementation":"supplied"})", true},
    {R"({"version":1,"implementation":"supplied","identityProfile":"compatibility","stateIdentityVersion":1})", true},
    {R"({"version":1,"implementation":"supplied","identityProfile":"aux-v1","stateIdentityVersion":1})", true},
    {R"({"version":1,"implementation":"supplied","identityProfile":"aux-v1","stateIdentityVersion":2})", false},
    {R"({"version":1,"implementation":"supplied","stateIdentityVersion":2})", false},
    {R"({"version":1,"implementation":"supplied","stateIdentityVersion":3})", false},
    {R"({"version":1,"implementation":"supplied","stateIdentityVersion":"1"})", false},
    {R"({"version":1,"implementation":"supplied","stateIdentityVersion":true})", false},
    {R"({"version":1,"implementation":"supplied","identityProfile":null})", false},
    {R"({"version":1,"implementation":"supplied","identityProfile":"unknown"})", false},
    {R"({"version":1,"implementation":"other"})", false},
    {R"({"implementation":"supplied"})", false},
    {R"({"version":1,"implementation":"supplied","stateIdentityVersion":2,"stateIdentityVersion":1})", false},
    {R"({"version":1,"implementation":"supplied","stateIdentityVersion":2,"stateIdentity\u0056ersion":1})", false},
    {R"({"version":1,"implementation":"supplied","identityProfile":"aux-v1","identityProfile":"compatibility"})", false},
    {R"({"version":1,"implementation":"supplied","nested":{"stateIdentityVersion":2},"text":"{\"stateIdentityVersion\":2}"})", true},
    {"{}", false}, {"[]", false}, {"{", false}, {"", false}
  };
  for (const auto& [bytes, allowed] : cases) {
    if (PackagedIdentityMarkerAllowed(bytes) != allowed) {
      std::cerr << "Synthetic marker policy fixture failed\n"; return 1;
    }
  }
  base::ScopedTempDir directory;
  if (!directory.CreateUniqueTempDir()) return 2;
  const auto root = base::MakeAbsoluteFilePath(directory.GetPath());
  const auto marker = root.AppendASCII("bundle.json");
  if (PackagedIdentityMarkerAllowedAt(marker)) return 3;
  if (!base::WriteFile(marker, cases[0].first) ||
      !base::SetPosixFilePermissions(marker, 0600) ||
      !PackagedIdentityMarkerAllowedAt(marker)) return 4;
  if (!base::WriteFile(marker, cases[3].first) ||
      PackagedIdentityMarkerAllowedAt(marker)) return 5;
  if (!base::WriteFile(marker, cases[0].first) ||
      !base::SetPosixFilePermissions(marker, 0666) ||
      PackagedIdentityMarkerAllowedAt(marker)) return 6;
  if (!base::SetPosixFilePermissions(marker, 0600)) return 7;
  const auto link = root.AppendASCII("bundle-link.json");
  if (!base::CreateSymbolicLink(marker, link) ||
      PackagedIdentityMarkerAllowedAt(link)) return 8;
  const auto nested = root.AppendASCII("Aux.app/Contents/Frameworks/Aux Helper.app/Contents/MacOS/Aux Helper");
  if (base::apple::GetAppBundlePath(nested) != root.AppendASCII("Aux.app")) return 9;
  std::cout << "20 marker fixtures, 5 file-policy checks and outer helper path passed\n";
  return 0;
}
