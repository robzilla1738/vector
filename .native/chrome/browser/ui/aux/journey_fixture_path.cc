// Copyright 2026 The Aux Authors
// Use of this source code is governed by a BSD-style license in the LICENSE file.
#include "chrome/browser/ui/aux/journey_fixture_path.h"
#include <fcntl.h>
#include <limits>
#include <utility>
#include "base/check_is_test.h"
#include "base/no_destructor.h"

namespace aux {
namespace {
struct ObservationState {
  bool initialized = false;
  uint64_t scope_generation = 0, next_scope_generation = 0;
  std::unique_ptr<NativeObservationMetadata> metadata;
};
ObservationState& State() {
  static base::NoDestructor<ObservationState> state;
  return *state;
}
bool PrivateIdentity(const struct stat& actual, const struct stat& expected) {
  return S_ISDIR(actual.st_mode) && actual.st_uid == expected.st_uid &&
      expected.st_uid == geteuid() &&
      (actual.st_mode & 0700) == 0700 && (actual.st_mode & 077) == 0 &&
      actual.st_dev == expected.st_dev && actual.st_ino == expected.st_ino;
}
bool CurrentDirectory(int fd, const std::string& path,
                      const struct stat& expected) {
  struct stat descriptor {}, current {};
  // Bounded metadata checks only. Canonical path resolution was performed
  // before the UI blocking restriction, and the exact descriptors stay held.
  return fstat(fd, &descriptor) == 0 && PrivateIdentity(descriptor, expected) &&
      lstat(path.c_str(), &current) == 0 && PrivateIdentity(current, expected);
}
}  // namespace
NativeObservationMetadata::NativeObservationMetadata() = default;
NativeObservationMetadata::~NativeObservationMetadata() = default;
std::unique_ptr<NativeObservationMetadata> NativeObservationMetadata::Capture(
    const base::CommandLine& command) {
  const bool appearance = command.HasSwitch("aux-native-appearance-observer");
  const bool performance = command.HasSwitch("aux-native-performance-observer");
  if (!appearance && !performance) return nullptr;
  const base::FilePath profile(command.GetSwitchValueASCII("user-data-dir"));
  if (profile.BaseName().value() != "profile" ||
      !OwnedJourneyFixtureRoot(profile.DirName().value())) return nullptr;
  auto result = std::unique_ptr<NativeObservationMetadata>(new NativeObservationMetadata);
  result->root_path_ = profile.DirName().value();
  result->profile_path_ = profile.value();
  result->root_.reset(open(result->root_path_.c_str(),
                          O_RDONLY | O_DIRECTORY | O_NOFOLLOW | O_CLOEXEC));
  if (!result->root_.is_valid()) return nullptr;
  result->profile_.reset(openat(result->root_.get(), "profile",
                               O_RDONLY | O_DIRECTORY | O_NOFOLLOW | O_CLOEXEC));
  if (!result->profile_.is_valid() ||
      fstat(result->root_.get(), &result->root_identity_) != 0 ||
      fstat(result->profile_.get(), &result->profile_identity_) != 0 ||
      !CurrentDirectory(result->root_.get(), result->root_path_, result->root_identity_) ||
      !CurrentDirectory(result->profile_.get(), result->profile_path_, result->profile_identity_))
    return nullptr;
  result->appearance_ = appearance;
  result->performance_ = performance;
  return result;
}
bool NativeObservationMetadata::Enabled(bool appearance) const {
  return (appearance ? appearance_ : performance_) &&
      CurrentDirectory(root_.get(), root_path_, root_identity_) &&
      CurrentDirectory(profile_.get(), profile_path_, profile_identity_);
}
void InitializeNativeObservationMetadata(const base::CommandLine& command) {
  auto& state = State();
  // Initialization is process-local and one-shot; a later caller cannot rebind
  // observation admission to a replacement directory or a different Profile.
  if (state.initialized) return;
  state.initialized = true;
  state.metadata = NativeObservationMetadata::Capture(command);
}
ScopedNativeObservationMetadataForTesting::ScopedNativeObservationMetadataForTesting(
    const base::CommandLine& command) {
  CHECK_IS_TEST();
  auto receipt = NativeObservationMetadata::Capture(command);
  auto& state = State();
  CHECK_LT(state.next_scope_generation, std::numeric_limits<uint64_t>::max());
  previous_ = std::move(state.metadata);
  previous_initialized_ = state.initialized;
  previous_generation_ = state.scope_generation;
  generation_ = ++state.next_scope_generation;
  state.scope_generation = generation_;
  state.initialized = true;
  state.metadata = std::move(receipt);
}
ScopedNativeObservationMetadataForTesting::~ScopedNativeObservationMetadataForTesting() {
  CHECK_IS_TEST();
  auto& state = State();
  CHECK_EQ(state.scope_generation, generation_);
  state.metadata = std::move(previous_);
  state.initialized = previous_initialized_;
  state.scope_generation = previous_generation_;
}
bool NativeAppearanceObservationEnabled() {
  const auto& state = State();
  return state.metadata && state.metadata->Enabled(true);
}
bool NativePerformanceObservationMetadataEnabled() {
  const auto& state = State();
  return state.metadata && state.metadata->Enabled(false);
}
}  // namespace aux
