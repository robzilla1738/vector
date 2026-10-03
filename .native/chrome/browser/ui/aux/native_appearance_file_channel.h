// Copyright 2026 The Aux Authors
#ifndef CHROME_BROWSER_UI_AUX_NATIVE_APPEARANCE_FILE_CHANNEL_H_
#define CHROME_BROWSER_UI_AUX_NATIVE_APPEARANCE_FILE_CHANNEL_H_
#include <sys/stat.h>
#include <memory>
#include <optional>
#include <string>
#include "base/files/scoped_file.h"
#include "base/memory/scoped_refptr.h"
#include "base/values.h"
#include "build/build_config.h"
#include "chrome/browser/buildflags.h"
class Profile;
namespace aux {
#if BUILDFLAG(IS_MAC) && BUILDFLAG(ENABLE_AUX_SHELL) && BUILDFLAG(AUX_ALLOW_REMOTE_DEBUGGING_FOR_TESTS)
class NativeObservationMetadata;
// Only original pre-thread metadata can construct this lease. No path/fd caller
// selector is accepted by channel initialization or the appearance publisher.
class NativeAppearanceDirectoryLease {
 public:
  NativeAppearanceDirectoryLease(NativeAppearanceDirectoryLease&&);
  ~NativeAppearanceDirectoryLease();
 private:
  friend class NativeObservationMetadata;
  friend class NativeAppearanceFileChannel;
  NativeAppearanceDirectoryLease();
  base::ScopedFD root_, profile_;
  struct stat root_identity_ {}, profile_identity_ {};
  std::string root_path_, profile_path_;
};
class NativeAppearanceFileChannel {
 public:
  static std::unique_ptr<NativeAppearanceFileChannel> Create(
      NativeAppearanceDirectoryLease lease);
  ~NativeAppearanceFileChannel();
  // Called only by the guarded existing capability handler. No effect opcode.
  std::optional<base::Value::Dict> Receipt(Profile* original_profile);
  // Existing getter supplies original raw JSON after its WeakDocument checks.
  // Disk publication runs on one background sequence, never a UI blocking write.
  bool Publish(Profile* original_profile, std::string original_raw_json);
  void Retire();
 private:
  class State;
  explicit NativeAppearanceFileChannel(scoped_refptr<State> state);
  scoped_refptr<State> state_;
};
// Shared metadata adapter supplies the original one-shot private lease.
std::optional<NativeAppearanceDirectoryLease> TakeNativeAppearanceDirectoryLease();
void InitializeNativeAppearanceFileChannel();
std::optional<base::Value::Dict> NativeAppearanceFileChannelReceipt(Profile* original_profile);
bool PublishNativeAppearanceFileRecord(Profile* original_profile, std::string original_raw_json);
#endif
}  // namespace aux
#endif
