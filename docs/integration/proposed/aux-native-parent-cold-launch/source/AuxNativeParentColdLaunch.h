#pragma once
#include "AuxSelectedStateHome.h"

namespace aux::peer {
// Native startup only, before profile/extension construction. The fixed signed
// bundle derives its own child image; no caller path, identity or home exists.
// This starts only the fresh native service, not a legacy-state migration.
SelectedStateHomeResolution StartSealedNativeDaemonBeforeProfiles();
}
