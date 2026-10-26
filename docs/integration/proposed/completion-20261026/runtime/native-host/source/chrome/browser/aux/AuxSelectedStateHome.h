#pragma once
#include "AuxOwnedNativePeerChild.h"
#include "chrome/browser/aux/feature_store/feature_write_participant.h"
#include "base/files/file_path.h"
#include "base/command_line.h"
#include <memory>
#include <array>
#include <string>
#include <string_view>

namespace aux::peer {
// Factual native lifecycle observation. Even the final phase is not a whole-
// browser drain certificate and cannot authorize recovery or release a lease.
struct BrowserShutdownObservation {
  bool wrong_process = false;
  bool admission_closed = false;
  bool sequence_uncertain = false;
  uint32_t phase = 0;
  uint64_t admitted_generation = 0;
  uint64_t active_authority_reads = 0;
  bool monitor_running = false;
  bool whole_writer_drain_proven = false;
  aux::features::NativeFeatureWriteObservation feature_writes;
};
void BeginNativeBrowserShutdown();
void ObserveNativeBrowserProfileTeardown();
void ObserveNativeBrowserThreadsDestroyed();
void ObserveNativeBrowserProcessDestroyed();
void ObserveNativeBrowserPostShutdownIO();
void ObserveNativeBrowserPartsDestroyed();
BrowserShutdownObservation InspectNativeBrowserShutdown();
// Fresh-only native retained grant; old policy, existing roots and unknown refuse.
bool AuthorizeNativeBrowserStartupBeforeLocalState();
// Builds OS path-based write restrictions from the currently admitted native
// Owner roots only. Host command arguments never choose the protected roots.
std::optional<base::CommandLine> PrepareNativeHostPathWriteRestrictions(
    const base::CommandLine& host);
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
// Native-only capture data route, never migration/profile authority.
DaemonAuthorityReply ExchangeNativeSelectedHostFrame(std::span<const uint8_t> frame);
DaemonAuthorityReply ExchangeNativeSelectedUiCaptureFrame(std::span<const uint8_t> frame);
NativeDaemonSignatureReply ObserveNativeSelectedDaemonChallenge(std::string_view encoded_message);
std::optional<std::string> SignNativeSelectedDaemonChallenge(std::string_view encoded_message);
std::optional<std::string> GetNativeSelectedInstallationPublicKeys();
std::optional<std::array<uint8_t, 32>> GetNativeSelectedAgentInboxV2MasterKey();
// Native-only, one-shot selected route. No path/env/status/JSON setter exists.
// It retains actual selected child ownership; it does not admit profile writers.
bool InstallNativeSelectedStateHome(std::unique_ptr<SelectedNativeHome> selected);
SelectedStateHomeResolution ReadNativeSelectedStateHome();
// Native-only read/reap observation of the original selected child. This does
// not close its parent peer, roots or admission and cannot certify no-child.
SelectedStateHomeObservation InspectNativeSelectedOwnedChildForShutdown();
SelectedStateHomeObservation CloseNativeSelectedStateHome();
}  // namespace aux::peer
