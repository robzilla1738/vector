#pragma once
#include "AuxOwnedNativePeerChild.h"
#include "base/files/file_path.h"
#include <memory>

namespace aux::peer {
enum class SelectedStateHomeRoute { unselected, current, unavailable, closed, wrongProcess };
struct SelectedStateHomeResolution {
  SelectedStateHomeRoute route;
  base::FilePath path;
  uint64_t ready_exports = 0;
};
struct SelectedStateHomeObservation {
  SelectedStateHomeRoute route;
  bool monitor_running = false;
  uint64_t active_reads = 0;
  bool initialization_pending = false;
  bool monitor_join_pending = false;
  std::optional<NativeChildObservation> child_close;
};
// Native-only, one-shot selected route. No path/env/status/JSON setter exists.
// It retains actual selected child ownership; it does not admit profile writers.
bool InstallNativeSelectedStateHome(std::unique_ptr<SelectedNativeHome> selected);
SelectedStateHomeResolution ReadNativeSelectedStateHome();
SelectedStateHomeObservation CloseNativeSelectedStateHome();
}  // namespace aux::peer
