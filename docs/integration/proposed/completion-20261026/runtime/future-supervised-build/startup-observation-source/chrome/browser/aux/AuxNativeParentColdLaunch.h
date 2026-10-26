#pragma once
#include "AuxSelectedStateHome.h"
#include <optional>
#include "base/files/file_path.h"
#include "base/time/time.h"

namespace aux::peer {
// Native startup only, before profile/extension construction. The fixed signed
// bundle derives its own child image; no caller path, identity or home exists.
// This starts only the fresh native service, not a legacy-state migration.
SelectedStateHomeResolution StartSealedNativeDaemonBeforeProfiles();
// Observation of the existing one-shot startup budget, never a new allowance.
base::TimeTicks NativeBrowserStartupDeadline();
// Native signed-image observations and fixed OS-user directories only. These
// never select legacy state, settle a writer, or authorize browser startup.
struct NativeUserStartupPaths {
  base::FilePath home;
  base::FilePath data;
  base::FilePath cache;
};
int InspectSealedNativeDaemonLaunchLocationMode();
std::optional<NativeUserStartupPaths> DeriveOrdinaryUserStartupPaths();
bool PrepareOrdinaryUserStartupPaths(const NativeUserStartupPaths&);
bool RevalidateOrdinaryUserStartupPaths(const NativeUserStartupPaths&);
}
