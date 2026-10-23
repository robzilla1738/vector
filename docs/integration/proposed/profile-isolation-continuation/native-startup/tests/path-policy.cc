// Disposable filesystem policy fixture; no browser/native service is started.
#include "chrome/browser/aux/AuxBrowserNetworkPaths.cc"
#include <cstdio>
#include <filesystem>
#include <iostream>
namespace aux::peer {
std::shared_ptr<const BrowserPrivateRoots> CaptureActualChromiumBrowserRoots() { return {}; }
}
int main() {
  char root[] = "/private/tmp/aux-network-paths-XXXXXX";
  if (!mkdtemp(root)) return 1;
  const std::string home(root);
  auto done = [&] { std::filesystem::remove_all(home); };
  std::filesystem::create_directories(home + "/data/Profile");
  std::filesystem::create_directory(home + "/outside");
  symlink((home + "/outside").c_str(), (home + "/data/escape").c_str());
  symlink((home + "/missing").c_str(), (home + "/data/dangling").c_str());
  FILE* file = fopen((home + "/data/file").c_str(), "w");
  if (!file) { done(); return 2; }
  fclose(file);
  using namespace aux::peer;
  bool passed = ProspectivePhysicalPath(home + "/data/Profile/Cache/new") == home + "/data/Profile/Cache/new" &&
      Within(home + "/data/Profile", home + "/data") &&
      !Within(home + "/database", home + "/data") &&
      !Within(ProspectivePhysicalPath(home + "/data/escape/Cache"), home + "/data") &&
      ProspectivePhysicalPath(home + "/data/dangling/Cache").empty() &&
      ProspectivePhysicalPath(home + "/data/file").empty() &&
      ProspectivePhysicalPath(home + "/data/file/Cache").empty() &&
      ProspectivePhysicalPath(home + "/data/../outside").empty() &&
      ProspectivePhysicalPath(home + "/data//Cache").empty() &&
      ProspectivePhysicalPath("relative/Cache").empty() &&
      !CanCreateContainedBrowserNetworkContext({home + "/data"}) &&
      !CanCreateContainedBrowserNetworkContext({});
  done();
  std::cout << "prospective-path cases and absent-native-capture refusal: " << passed << '\n';
  return passed ? 0 : 3;
}
