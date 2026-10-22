// Synthetic immutable markers/private files only. No wrapper exec or Aux home.
#include "packaged-identity-admission.h"
#include <cstdio>
#include <vector>
namespace {
struct Case { const char* name; std::string json; bool allowed; };
bool Write(const std::string& path, const std::string& bytes) {
  int fd = open(path.c_str(), O_WRONLY | O_CREAT | O_EXCL | O_NOFOLLOW, 0600);
  if (fd < 0) return false;
  size_t offset = 0;
  while (offset < bytes.size()) {
    const ssize_t size = write(fd, bytes.data() + offset, bytes.size() - offset);
    if (size <= 0) { close(fd); return false; }
    offset += static_cast<size_t>(size);
  }
  return close(fd) == 0;
}
}
int main() {
  @autoreleasepool {
    const std::string valid = R"({"version":1,"implementation":"supplied"})";
    const std::vector<Case> cases = {
      {"defaults", valid, true},
      {"compatibility", R"({"version":1,"implementation":"supplied","identityProfile":"compatibility","stateIdentityVersion":1})", true},
      {"aux-v1", R"({"version":1,"implementation":"supplied","identityProfile":"aux-v1","stateIdentityVersion":1})", true},
      {"nested-state-ignored", R"({"version":1,"implementation":"supplied","metadata":{"stateIdentityVersion":2}})", true},
      {"nested-duplicates-not-top-level", R"({"version":1,"implementation":"supplied","metadata":{"x":1,"x":2}})", true},
      {"extra-acceptance-not-authority", R"({"version":1,"implementation":"supplied","accepted":true,"stateIdentityVersion":2})", false},
      {"state2", R"({"version":1,"implementation":"supplied","stateIdentityVersion":2})", false},
      {"unknown-state", R"({"version":1,"implementation":"supplied","stateIdentityVersion":3})", false},
      {"state-string", R"({"version":1,"implementation":"supplied","stateIdentityVersion":"1"})", false},
      {"state-bool", R"({"version":1,"implementation":"supplied","stateIdentityVersion":true})", false},
      {"state-null", R"({"version":1,"implementation":"supplied","stateIdentityVersion":null})", false},
      {"state-array", R"({"version":1,"implementation":"supplied","stateIdentityVersion":[1]})", false},
      {"state-float", R"({"version":1,"implementation":"supplied","stateIdentityVersion":1.0})", false},
      {"state-exponent", R"({"version":1,"implementation":"supplied","stateIdentityVersion":1e0})", false},
      {"version-float", R"({"version":1.0,"implementation":"supplied"})", false},
      {"version-bool", R"({"version":true,"implementation":"supplied"})", false},
      {"version-missing", R"({"implementation":"supplied"})", false},
      {"wrong-implementation", R"({"version":1,"implementation":"other"})", false},
      {"implementation-type", R"({"version":1,"implementation":1})", false},
      {"unknown-profile", R"({"version":1,"implementation":"supplied","identityProfile":"aux-v2"})", false},
      {"profile-null", R"({"version":1,"implementation":"supplied","identityProfile":null})", false},
      {"profile-number", R"({"version":1,"implementation":"supplied","identityProfile":1})", false},
      {"duplicate-state", R"({"version":1,"implementation":"supplied","stateIdentityVersion":2,"stateIdentityVersion":1})", false},
      {"escaped-duplicate-state", R"({"version":1,"implementation":"supplied","state\u0049dentityVersion":2,"stateIdentityVersion":1})", false},
      {"escaped-duplicate-version", R"({"v\u0065rsion":1,"version":1,"implementation":"supplied"})", false},
      {"duplicate-unknown-key", R"({"version":1,"implementation":"supplied","x":1,"x":2})", false},
      {"duplicate-empty-key", R"({"version":1,"implementation":"supplied","":1,"":2})", false},
      {"nul-in-unknown-key", R"({"version":1,"implementation":"supplied","stateIdentityVersion\u0000extra":2})", true},
      {"braces-in-string", R"({"version":1,"implementation":"supplied","note":"} [ \"quoted\""})", true},
      {"trailing-comma", R"({"version":1,"implementation":"supplied",})", false},
      {"nested-trailing-comma", R"({"version":1,"implementation":"supplied","x":[1,]})", false},
      {"comment", R"({"version":1,/*x*/"implementation":"supplied"})", false},
      {"trailing-document", valid + "{}", false},
      {"leading-zero", R"({"version":1,"implementation":"supplied","x":01})", false},
      {"invalid-number", R"({"version":1,"implementation":"supplied","x":NaN})", false},
      {"array-root", "[]", false},
      {"string-root", "\"test\"", false},
      {"empty", "", false},
      {"utf8-bom", std::string("\xEF\xBB\xBF") + valid, false},
      {"invalid-utf8", std::string("{\"version\":1,\"implementation\":\"supplied\",\"x\":\"") + char(0xff) + "\"}", false},
      {"oversized", std::string(aux::packaged_identity::kMaxMarkerBytes + 1, ' '), false},
    };
    for (const auto& item : cases) {
      if (aux::packaged_identity::MarkerAllowed(item.json) != item.allowed) {
        std::fprintf(stderr, "Marker policy failed: %s\n", item.name); return 1;
      }
    }
    char temporary[] = "/tmp/aux-marker-fixture-XXXXXX";
    if (!mkdtemp(temporary)) return 2;
    char canonical[PATH_MAX];
    if (!realpath(temporary, canonical)) return 2;
    const std::string root(canonical), marker = root + "/bundle.json";
    size_t files = 0;
    auto expect = [&](bool actual, bool expected) {
      ++files; return actual == expected;
    };
    if (!Write(marker, valid) ||
        !expect(aux::packaged_identity::MarkerAllowedAt(marker), true)) return 3;
    if (symlink(marker.c_str(), (root + "/alias").c_str()) ||
        !expect(aux::packaged_identity::MarkerAllowedAt(root + "/alias"), false)) return 3;
    if (link(marker.c_str(), (root + "/hardlink").c_str()) ||
        !expect(aux::packaged_identity::MarkerAllowedAt(marker), false)) return 3;
    unlink((root + "/hardlink").c_str());
    if (chmod(marker.c_str(), 0620) ||
        !expect(aux::packaged_identity::MarkerAllowedAt(marker), false)) return 3;
    chmod(marker.c_str(), 0600);
    if (mkfifo((root + "/fifo").c_str(), 0600) ||
        !expect(aux::packaged_identity::MarkerAllowedAt(root + "/fifo"), false)) return 3;
    if (!expect(aux::packaged_identity::MarkerAllowedAt(root + "/missing"), false)) return 3;
    if (!expect(aux::packaged_identity::MarkerAllowedAt("relative/bundle.json"), false)) return 3;
    unlink((root + "/alias").c_str()); unlink((root + "/fifo").c_str());
    unlink(marker.c_str()); rmdir(root.c_str());
    std::printf("{\"policyCases\":%zu,\"syntheticFileCases\":%zu,\"allWritersVerified\":false}\n", cases.size(), files);
    return 0;
  }
}
