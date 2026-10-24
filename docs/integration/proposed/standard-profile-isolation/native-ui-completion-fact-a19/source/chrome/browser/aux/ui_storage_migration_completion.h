// Copyright 2026 The Aux Authors. BSD-style license: see //LICENSE.
#ifndef CHROME_BROWSER_AUX_UI_STORAGE_MIGRATION_COMPLETION_H_
#define CHROME_BROWSER_AUX_UI_STORAGE_MIGRATION_COMPLETION_H_
#include <cstdint>
#include <memory>
#include <optional>
#include <string>
#include <string_view>
#include <vector>
#include "base/containers/span.h"
#include "base/functional/callback.h"
class Profile;
namespace aux {
class UiStorageMigrationCompletion;
class UiStorageMigrationOwnerAck;
namespace migration_detail { class Controller; }
namespace peer {
std::optional<UiStorageMigrationOwnerAck> AcceptNativeSelectedUiMigrationCompletion(
    UiStorageMigrationCompletion& completion);
}
// Minted ONLY by the actual selected-home owner after its existing authenticated
// terminal read and real owner/root/generation checks. Not installation admission.
class UiStorageMigrationOwnerAck final {
 public:
  UiStorageMigrationOwnerAck(UiStorageMigrationOwnerAck&&);
  UiStorageMigrationOwnerAck& operator=(UiStorageMigrationOwnerAck&&);
  ~UiStorageMigrationOwnerAck();
  bool IsCurrent() const;
  bool Matches(uint64_t native_generation, std::string_view terminal_fingerprint) const;
 private:
  friend std::optional<UiStorageMigrationOwnerAck> peer::AcceptNativeSelectedUiMigrationCompletion(
      UiStorageMigrationCompletion& completion);
  UiStorageMigrationOwnerAck(uint64_t native_generation, std::string terminal_fingerprint,
      base::RepeatingCallback<bool()> owner_current);
  uint64_t native_generation_ = 0;
  std::string terminal_fingerprint_;
  base::RepeatingCallback<bool()> owner_current_;
};
// One-shot native fact. Destruction/absence never opens writers or grants startup.
// It refers to one actual retained transaction, not renderer or JSON authority.
class UiStorageMigrationCompletion final {
 public:
  UiStorageMigrationCompletion(UiStorageMigrationCompletion&&);
  UiStorageMigrationCompletion& operator=(UiStorageMigrationCompletion&&);
  ~UiStorageMigrationCompletion();
  uint64_t native_generation() const;
  std::string_view terminal_fingerprint() const;
  bool IsCurrent() const;
  std::vector<uint8_t> TerminalReadFrame() const;
  bool MatchesTerminalReply(base::span<const uint8_t> reply) const;
 private:
  friend class migration_detail::Controller;
  UiStorageMigrationCompletion(uint64_t native_generation, std::string terminal_fingerprint,
      std::vector<uint8_t> read_frame, std::vector<uint8_t> expected_reply,
      base::RepeatingCallback<bool()> actual_current);
  uint64_t native_generation_ = 0;
  std::string terminal_fingerprint_;
  std::vector<uint8_t> read_frame_, expected_reply_;
  base::RepeatingCallback<bool()> actual_current_;
};
std::unique_ptr<UiStorageMigrationCompletion> TakeUiStorageMigrationCompletion(Profile* profile);
bool AcknowledgeUiStorageMigrationCompletion(Profile* profile, UiStorageMigrationOwnerAck acknowledgement);
}  // namespace aux
#endif
