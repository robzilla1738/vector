#pragma once
#include "AuxOwnedNativePeerChild.h"
#include "base/files/file_path.h"
#include <memory>
#include <array>
#include <string>
#include <string_view>

namespace aux::peer {
// Fresh-only native retained grant; old policy, existing roots and unknown refuse.
bool AuthorizeNativeBrowserStartupBeforeLocalState();
enum class SelectedStateHomeRoute { unselected, current, unavailable, closed, wrongProcess };
struct SelectedStateHomeResolution {
  SelectedStateHomeRoute route;
  base::FilePath path;
  uint64_t ready_exports = 0;
  int child_pid = -1;
};
struct SelectedStateHomeObservation {
  SelectedStateHomeRoute route;
  bool monitor_running = false;
  uint64_t active_reads = 0;
  bool initialization_pending = false;
  bool monitor_join_pending = false;
  std::optional<NativeChildObservation> child_close = std::nullopt;
};
struct NativeDaemonSignatureReply {
  DaemonAuthorityStatus status = DaemonAuthorityStatus::refused;
  std::optional<std::string> signature;
};
NativeDaemonSignatureReply ObserveNativeSelectedDaemonChallenge(std::string_view encoded_message);
std::optional<std::string> SignNativeSelectedDaemonChallenge(std::string_view encoded_message);
std::optional<std::string> GetNativeSelectedInstallationPublicKeys();
std::optional<std::array<uint8_t, 32>> GetNativeSelectedAgentInboxV2MasterKey();
// Native-only, one-shot selected route. No path/env/status/JSON setter exists.
// It retains actual selected child ownership; it does not admit profile writers.
bool InstallNativeSelectedStateHome(std::unique_ptr<SelectedNativeHome> selected);
SelectedStateHomeResolution ReadNativeSelectedStateHome();
SelectedStateHomeObservation CloseNativeSelectedStateHome();
}  // namespace aux::peer
