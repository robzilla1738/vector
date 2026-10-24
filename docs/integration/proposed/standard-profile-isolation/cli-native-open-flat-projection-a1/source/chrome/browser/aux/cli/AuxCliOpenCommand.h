#pragma once
#include <cstdint>
class Profile;
namespace aux::cli {
struct NativeOpenObservation {
  bool started=false, admission_closed=true, receiver_running=false, wrong_process=false;
  uint64_t queued_ui_invocations=0, pending_profile_operations=0;
};
// Native lifecycle registration only; never an extension/renderer entry point.
// Root calls Start after genuine protected startup admits the browser and Close
// before profile teardown. These methods never admit the broad supplied CLI.
bool StartNativeOpenServiceAtActualBrowserStartup();
void CloseNativeOpenServiceAdmission();
// Process-lifetime atomic observation; safe for the retained drain provider
// after UI/Profile teardown. It grants no target or writer authority.
NativeOpenObservation InspectNativeOpenService();
// UI sequence factual exclusion for native switching/cookie restore. A false
// value is not a browser writer/descendant drain certificate.
bool IsNativeCliOpenPendingForProfile(Profile*);
}
