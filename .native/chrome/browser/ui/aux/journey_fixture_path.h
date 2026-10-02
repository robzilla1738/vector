// Copyright 2026 The Aux Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
#ifndef CHROME_BROWSER_UI_AUX_JOURNEY_FIXTURE_PATH_H_
#define CHROME_BROWSER_UI_AUX_JOURNEY_FIXTURE_PATH_H_

#include <sys/stat.h>
#include <unistd.h>
#include <string>
#include <memory>
#include <cstdint>
#include "base/files/scoped_file.h"
#include "base/command_line.h"
#include "base/files/file_path.h"
#include "base/files/file_util.h"

namespace aux {
// Metadata only: this never opens a Profile, session, credential or Keychain file.
inline bool OwnedJourneyFixtureRoot(const std::string& value, uid_t owner = geteuid()) {
  const base::FilePath path(value);
  if (!path.IsAbsolute() || path.ReferencesParent() || path.value() != path.StripTrailingSeparators().value())
    return false;
  const auto parent = path.DirName().value();
  const auto name = path.BaseName().value();
  if ((parent != "/tmp" && parent != "/private/tmp") || !name.starts_with("aux-native-journey-") ||
      name.size() <= std::string("aux-native-journey-").size()) return false;
  for (char c : name) if (!((c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') ||
                          (c >= '0' && c <= '9') || c == '-' || c == '_')) return false;
  struct stat info;
  if (lstat(value.c_str(), &info) != 0 || !S_ISDIR(info.st_mode) || info.st_uid != owner ||
      (info.st_mode & 0700) != 0700 || (info.st_mode & 077) != 0) return false;
  const base::FilePath canonical = base::MakeAbsoluteFilePath(path);
  return !canonical.empty() && canonical.value() == "/private/tmp/" + name;
}
// Test-build opt-in only; no listener or public debugging capability is opened.
inline bool NativeAppearanceObservationEnabled(
    const base::CommandLine& command) {
  if (!command.HasSwitch("aux-native-appearance-observer")) return false;
  const base::FilePath profile(command.GetSwitchValueASCII("user-data-dir"));
  if (profile.BaseName().value() != "profile" ||
      !OwnedJourneyFixtureRoot(profile.DirName().value())) return false;
  struct stat info;
  return lstat(profile.value().c_str(), &info) == 0 && S_ISDIR(info.st_mode) &&
      info.st_uid == geteuid() && (info.st_mode & 0700) == 0700 &&
      (info.st_mode & 077) == 0;
}
// Captured before browser threads start, while canonical resolution is allowed.
// UI readers retain the exact canonical owner and reject path/FD replacement.
class NativeObservationMetadata {
 public:
  static std::unique_ptr<NativeObservationMetadata> Capture(
      const base::CommandLine& command);
  ~NativeObservationMetadata();
  bool Enabled(bool appearance) const;
 private:
  NativeObservationMetadata();
  std::string root_path_, profile_path_;
  base::ScopedFD root_, profile_;
  struct stat root_identity_ {}, profile_identity_ {};
  bool appearance_ = false, performance_ = false;
};
// Test-only scoped installation captures the same real directory receipt and
// restores prior process admission. It cannot turn invalid metadata into true.
class ScopedNativeObservationMetadataForTesting {
 public:
  explicit ScopedNativeObservationMetadataForTesting(const base::CommandLine& command);
  ~ScopedNativeObservationMetadataForTesting();
  ScopedNativeObservationMetadataForTesting(const ScopedNativeObservationMetadataForTesting&) = delete;
  ScopedNativeObservationMetadataForTesting& operator=(const ScopedNativeObservationMetadataForTesting&) = delete;
 private:
  std::unique_ptr<NativeObservationMetadata> previous_;
  bool previous_initialized_ = false;
  uint64_t previous_generation_ = 0, generation_ = 0;
};
void InitializeNativeObservationMetadata(const base::CommandLine& command);
bool NativeAppearanceObservationEnabled();
bool NativePerformanceObservationMetadataEnabled();
}  // namespace aux
#endif
