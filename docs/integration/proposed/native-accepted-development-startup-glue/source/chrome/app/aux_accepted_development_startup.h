// Copyright 2026 Aux Authors. All rights reserved.
// Local development only: consume an explicit private acceptance record.
#ifndef CHROME_APP_AUX_ACCEPTED_DEVELOPMENT_STARTUP_H_
#define CHROME_APP_AUX_ACCEPTED_DEVELOPMENT_STARTUP_H_
#include <Security/Security.h>
#include <errno.h>
#include <fcntl.h>
#include <pwd.h>
#include <sys/stat.h>
#include <unistd.h>

#include <string>
#include <string_view>

#include "base/apple/scoped_cftyperef.h"
#include "base/base_paths.h"
#include "base/command_line.h"
#include "base/containers/span.h"
#include "base/environment.h"
#include "base/files/file_util.h"
#include "base/files/scoped_file.h"
#include "base/json/json_reader.h"
#include "base/path_service.h"
#include "base/strings/string_number_conversions.h"
#include "base/strings/string_util.h"
#include "crypto/hash.h"

namespace aux::development_startup {
constexpr char kScope[] =
    "dbca8cbbce80cb5eb3f2f89043330556fdbf2350f3c057a69d6e10e6b3d11476";
inline std::string Digest(std::string_view bytes) {
  return base::ToLowerASCII(base::HexEncode(crypto::hash::Sha256(bytes)));
}
inline bool OwnedParents(base::FilePath path) {
  while (!path.empty()) {
    struct stat st;
    if (lstat(path.value().c_str(), &st) != 0 || !S_ISDIR(st.st_mode) ||
        (st.st_uid != getuid() && st.st_uid != 0) || (st.st_mode & 0022))
      return false;
    const auto parent = path.DirName();
    if (parent == path) return true;
    path = parent;
  }
  return false;
}
inline bool PrivateDirectory(const base::FilePath& path) {
  struct stat st;
  return path.IsAbsolute() && base::MakeAbsoluteFilePath(path) == path &&
         lstat(path.value().c_str(), &st) == 0 && S_ISDIR(st.st_mode) &&
         st.st_uid == getuid() && (st.st_mode & 0077) == 0;
}
inline bool ReadPrivateRecord(const base::FilePath& path, std::string& bytes) {
  base::ScopedFD fd(open(path.value().c_str(), O_RDONLY | O_NOFOLLOW | O_CLOEXEC));
  struct stat st;
  if (!fd.is_valid() || fstat(fd.get(), &st) != 0 || !S_ISREG(st.st_mode) ||
      st.st_uid != getuid() || (st.st_mode & 0777) != 0600 || st.st_nlink != 1 ||
      st.st_size <= 0 || st.st_size > 8 * 1024 * 1024)
    return false;
  bytes.resize(st.st_size);
  size_t offset = 0;
  while (offset < bytes.size()) {
    ssize_t size = read(fd.get(), bytes.data() + offset, bytes.size() - offset);
    if (size < 0 && errno == EINTR) continue;
    if (size <= 0) return false;
    offset += size;
  }
  char extra;
  return read(fd.get(), &extra, 1) == 0;
}
inline bool CheckCode(const base::FilePath& app, const char* relative,
                      const base::DictValue& pins, bool resources) {
  const auto* expected = pins.FindString(relative);
  const auto path = relative[0] ? app.AppendASCII(relative) : app;
  const auto canonical = base::MakeAbsoluteFilePath(path);
  if (!expected || canonical.empty() ||
      (canonical != app && !app.IsParent(canonical))) return false;
  base::apple::ScopedCFTypeRef<CFURLRef> url(CFURLCreateFromFileSystemRepresentation(
      kCFAllocatorDefault, reinterpret_cast<const UInt8*>(canonical.value().data()),
      canonical.value().size(), base::DirectoryExists(canonical)));
  base::apple::ScopedCFTypeRef<SecStaticCodeRef> code;
  if (!url || SecStaticCodeCreateWithPath(url.get(), kSecCSDefaultFlags,
                                         code.InitializeInto()) != errSecSuccess)
    return false;
  const SecCSFlags flags = kSecCSStrictValidate | kSecCSCheckAllArchitectures |
      kSecCSNoNetworkAccess | (resources ? 0 : kSecCSDoNotValidateResources);
  if (SecStaticCodeCheckValidity(code.get(), flags, nullptr) != errSecSuccess)
    return false;
  base::apple::ScopedCFTypeRef<CFDictionaryRef> info;
  if (SecCodeCopySigningInformation(code.get(), kSecCSSigningInformation,
                                    info.InitializeInto()) != errSecSuccess)
    return false;
  auto hash = static_cast<CFDataRef>(
      CFDictionaryGetValue(info.get(), kSecCodeInfoUnique));
  return hash && CFGetTypeID(hash) == CFDataGetTypeID() &&
      base::ToLowerASCII(base::HexEncode(base::span(
          CFDataGetBytePtr(hash), CFDataGetLength(hash)))) == *expected;
}
// Returns false only for a present but invalid acceptance, before state access.
// Absence leaves the ordinary startup/auth behavior unchanged.
inline bool Apply() {
  auto* command = base::CommandLine::ForCurrentProcess();
  auto env = base::Environment::Create();
  if (command->HasSwitch("type") || env->HasVar("AUX_HOME")) return true;
  if (getuid() != geteuid()) return false;
  const passwd* user = getpwuid(getuid());
  if (!user || !user->pw_dir) return false;
  const auto directory = base::FilePath(user->pw_dir).AppendASCII(
      "Library/Application Support/Aux/DevelopmentStartup");
  const auto record_path = directory.AppendASCII("accepted.json");
  struct stat record_stat;
  if (lstat(record_path.value().c_str(), &record_stat) != 0)
    return errno == ENOENT;
  std::string bytes;
  if (!PrivateDirectory(directory) || !OwnedParents(directory) ||
      !ReadPrivateRecord(record_path, bytes))
    return false;
  auto record = base::JSONReader::ReadDict(bytes, base::JSON_PARSE_RFC);
  if (!record || record->FindInt("version") != 1 ||
      record->FindBool("accepted") != true ||
      record->FindString("kind") == nullptr ||
      *record->FindString("kind") != "aux-existing-development-scope")
    return false;
  const auto* app_value = record->FindString("app");
  const auto* home_value = record->FindString("home");
  const auto* data_value = record->FindString("userDataDir");
  const auto* profile_value = record->FindString("profileDirectory");
  const auto* scope = record->FindString("scope");
  const auto* receipt = record->FindString("receiptJson");
  const auto* receipt_hash = record->FindString("receiptSha256");
  const auto* pins = record->FindDict("codeDirectoryHashes");
  if (!app_value || !home_value || !data_value || !profile_value || !scope ||
      !receipt || !receipt_hash || !pins || *scope != kScope ||
      Digest(*home_value) != kScope || Digest(*receipt) != *receipt_hash)
    return false;
  const base::FilePath app(*app_value), home(*home_value), data(*data_value);
  const base::FilePath profile(*profile_value);
  base::FilePath executable;
  if (!base::PathService::Get(base::FILE_EXE, &executable) ||
      base::MakeAbsoluteFilePath(app) != app || !OwnedParents(app) ||
      base::MakeAbsoluteFilePath(executable) != app.AppendASCII("Contents/MacOS/Aux") ||
      !PrivateDirectory(home) || !PrivateDirectory(data) || !home.IsParent(data) ||
      profile.empty() || profile.IsAbsolute() || profile.ReferencesParent() ||
      profile.BaseName() != profile || !PrivateDirectory(data.Append(profile)))
    return false;
  auto proof = base::JSONReader::ReadDict(*receipt, base::JSON_PARSE_RFC);
  if (!proof || proof->FindString("scope") == nullptr ||
      *proof->FindString("scope") != kScope ||
      proof->FindString("status") == nullptr ||
      *proof->FindString("status") != "signed-and-verified" ||
      proof->FindBool("authorityProofInherited") != true ||
      proof->FindString("packageRoot") == nullptr ||
      base::FilePath(*proof->FindString("packageRoot")).AppendASCII("Aux.app") != app)
    return false;
  // Verify actual code, not merely a bundle identifier or acceptance Boolean.
  // Only app/framework resource enumeration is skipped; installer pins their
  // complete verified inventory. Small authority bundles validate resources.
  if (pins->size() != 7 || !CheckCode(app, "", *pins, false) ||
      !CheckCode(app, "Contents/Frameworks/Aux Framework.framework", *pins, false))
    return false;
  for (const char* relative : {
      "Contents/Resources/aux/apps/daemon/Aux Daemon.app",
      "Contents/Resources/aux/apps/cli/Aux CLI.app",
      "Contents/Resources/aux/native/Aux Native Carrier.app",
      "Contents/Resources/aux/native/libaux-native-boundary.dylib",
      "Contents/Resources/aux/apps/computer-use/Aux Computer Use.app"}) {
    if (!CheckCode(app, relative, *pins, true)) return false;
  }
  const auto* seals = record->FindDict("resourceSealSha256");
  if (!seals || seals->size() != 3) return false;
  for (const char* relative : {
      "Contents/_CodeSignature/CodeResources",
      "Contents/Frameworks/Aux Framework.framework/Versions/Current/_CodeSignature/CodeResources",
      "Contents/Resources/aux/bundle.json"}) {
    const auto path = base::MakeAbsoluteFilePath(app.AppendASCII(relative));
    const auto* expected = seals->FindString(relative);
    struct stat st;
    std::string content;
    if (!expected || path.empty() || !app.IsParent(path) ||
        lstat(path.value().c_str(), &st) != 0 || !S_ISREG(st.st_mode) ||
        st.st_uid != getuid() || (st.st_mode & 0022) ||
        !base::ReadFileToStringWithMaxSize(path, &content, 8 * 1024 * 1024) ||
        Digest(content) != *expected) return false;
  }
  // A clean Finder launch may supply document/URL arguments, but cannot mix
  // accepted storage with an explicit unrelated profile or scope.
  if (command->HasSwitch("user-data-dir") || command->HasSwitch("profile-directory") ||
      env->HasVar("AUX_NATIVE_KEYCHAIN_SCOPE") ||
      env->HasVar("AUX_ENABLE_PROVIDED_NATIVE_CARRIER")) return false;
  for (const char* key : {"AUX_ENABLE_PROVIDED_AGENT_INBOX_KEYCHAIN",
                         "AUX_PROVIDED_DP_PROBE", "AUX_DP_PROBE_APPROVED",
                         "AUX_DP_PROBE_OPERATION", "AUX_PROVIDED_NATIVE_LOAD_ONLY"})
    env->UnSetVar(key);
  if (!env->SetVar("HOME", home.value()) ||
      !env->SetVar("CFFIXED_USER_HOME", home.value()) ||
      !env->SetVar("AUX_HOME", home.value()) ||
      !env->SetVar("AUX_NATIVE_KEYCHAIN_SCOPE", kScope) ||
      !env->SetVar("AUX_ENABLE_PROVIDED_NATIVE_CARRIER", "1")) return false;
  command->AppendSwitchPath("user-data-dir", data);
  command->AppendSwitchASCII("profile-directory", profile.value());
  return true;
}
}  // namespace aux::development_startup
#endif
