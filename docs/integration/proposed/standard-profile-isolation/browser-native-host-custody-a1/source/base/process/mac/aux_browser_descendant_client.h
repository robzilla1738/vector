// Copyright 2026 The Aux Authors. Never expose these native tickets to JS/IPC.
#ifndef BASE_PROCESS_MAC_AUX_BROWSER_DESCENDANT_CLIENT_H_
#define BASE_PROCESS_MAC_AUX_BROWSER_DESCENDANT_CLIENT_H_
#include "base/process/mac/aux_browser_descendant_bridge.h"
#include <dlfcn.h>
namespace aux::browser_custody {
using Ticket = uint64_t;
enum class Family : uint32_t { kContent=1, kNativeMessaging=2, kDaemon=3, kCrashpad=4 };
enum class Result : uint32_t { kPending=0, kSettled=1, kUnknown=2, kRefused=3 };
inline const AuxBrowserDescendantBridgeV1* Bridge() {
  // Search only the executable image: never a plugin, dylib, environment path,
  // renderer-supplied callback or a second framework observer singleton.
  using Getter=const AuxBrowserDescendantBridgeV1*(*)() noexcept;
  static const auto* bridge=[]()->const AuxBrowserDescendantBridgeV1* {
    auto getter=reinterpret_cast<Getter>(dlsym(RTLD_MAIN_ONLY,"AuxGetBrowserDescendantBridgeV1"));
    const auto* value=getter?getter():nullptr;
    return value && value->version==1 && value->size==sizeof(*value) ? value : nullptr;
  }();
  return bridge;
}
inline Ticket Reserve(Family family) {const auto* b=Bridge();return b?b->reserve(static_cast<uint32_t>(family)):0;}
struct OptionalTicket {bool required=false;Ticket ticket=0;};
inline OptionalTicket ReserveIfBrowser(Family family) {const auto* b=Bridge();return {b!=nullptr,b?b->reserve(static_cast<uint32_t>(family)):0};}
inline bool MaySpawn(Ticket t){const auto* b=Bridge();return b&&b->may_spawn(t);}
inline void DidCreate(Ticket t,int64_t pid){if(const auto* b=Bridge())b->did_create(t,pid);}
inline void DidFailBeforeChild(Ticket t){if(const auto* b=Bridge())b->failed_before_child(t);}
inline void DidObserveOriginalReap(Ticket t,bool matched){if(const auto* b=Bridge())b->original_reap(t,matched);}
inline Result Inspect(Ticket t){const auto* b=Bridge();return b?static_cast<Result>(b->inspect(t)):Result::kRefused;}
inline Result InspectStream(){const auto* b=Bridge();return b?static_cast<Result>(b->inspect_stream()):Result::kRefused;}
inline void CloseAdmission(){if(const auto* b=Bridge())b->close_admission();}
inline bool TransferDaemon(Ticket t,uint64_t generation){const auto* b=Bridge();return b&&b->transfer_daemon(t,generation);}
inline Result InspectBrowserScope(uint64_t generation){const auto* b=Bridge();return b?static_cast<Result>(b->inspect_browser_scope(generation)):Result::kRefused;}
}  // namespace aux::browser_custody
#endif
