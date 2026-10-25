// Copyright 2026 The Aux Authors. Link only into the main browser executable.
#include "base/process/mac/aux_browser_descendant_bridge.h"
#include "base/process/mac/aux_browser_descendant_engine.h"
#include <map>
#include <mutex>
#include <unistd.h>
#if !defined(AUX_BROWSER_ONLY_NATIVE_STARTUP)
namespace {
const pid_t kBrowserImageProcess=getpid();
struct Registry {std::mutex mutex;uint64_t next=1;std::map<uint64_t,aux::browser_descendants::Ticket> tickets;};
Registry& State(){static auto* s=new Registry;return *s;}
aux::browser_descendants::Ticket Find(uint64_t id) noexcept {
  if(getpid()!=kBrowserImageProcess||!id)return {};
  try {auto& s=State();std::lock_guard<std::mutex> lock(s.mutex);auto it=s.tickets.find(id);return it==s.tickets.end()?nullptr:it->second;}catch(...){return {};}
}
uint64_t Reserve(uint32_t family) noexcept {
  if(getpid()!=kBrowserImageProcess)return 0;
  try {auto& s=State();std::lock_guard<std::mutex> lock(s.mutex);
    if(s.next==UINT64_MAX||s.tickets.size()>=16384)return 0;
    const auto id=s.next++;auto [slot,inserted]=s.tickets.emplace(id,nullptr);
    if(!inserted)return 0;
    auto ticket=aux::browser_descendants::Reserve(family,[]{});
    if(!ticket){s.tickets.erase(slot);return 0;}
    slot->second=std::move(ticket);return id;
  }catch(...){return 0;}
}
bool MaySpawn(uint64_t id)noexcept{return aux::browser_descendants::MaySpawn(Find(id));}
void DidCreate(uint64_t id,int64_t pid)noexcept{aux::browser_descendants::DidCreate(Find(id),pid);}
void Failed(uint64_t id)noexcept{aux::browser_descendants::DidFailBeforeChild(Find(id));}
void Reaped(uint64_t id,bool matched)noexcept{aux::browser_descendants::DidObserveOriginalReap(Find(id),matched);}
uint32_t Inspect(uint64_t id)noexcept{return static_cast<uint32_t>(aux::browser_descendants::Inspect(Find(id)));}
uint32_t InspectStream()noexcept{return static_cast<uint32_t>(aux::browser_descendants::InspectStream());}
void Close()noexcept{aux::browser_descendants::CloseAdmission();}
bool Transfer(uint64_t id,uint64_t generation)noexcept{return aux::browser_descendants::TransferDaemon(Find(id),generation);}
uint32_t BrowserScope(uint64_t generation)noexcept{return static_cast<uint32_t>(aux::browser_descendants::InspectBrowserScope(generation));}
const AuxBrowserDescendantBridgeV1 kBridge{1,sizeof(AuxBrowserDescendantBridgeV1),Reserve,MaySpawn,DidCreate,Failed,Reaped,Inspect,InspectStream,Close,Transfer,BrowserScope};
}
#endif
extern "C" __attribute__((visibility("default")))
const AuxBrowserDescendantBridgeV1* AuxGetBrowserDescendantBridgeV1() noexcept {
#if defined(AUX_BROWSER_ONLY_NATIVE_STARTUP)
  // ES is unavailable in this explicit ordinary build. Optional child custody
  // must remain unavailable, never report a fake settled stream.
  return nullptr;
#else
  return getpid()==kBrowserImageProcess?&kBridge:nullptr;
#endif
}

// Separate finite factual query. The V1 custody table/layout stays unchanged.
extern "C" __attribute__((visibility("default")))
uint32_t AuxGetActualCliClientMembershipV1(audit_token_t peer) noexcept {
  return aux::browser_descendants::InspectActualCliClientInPrimaryImage(peer) ==
      aux::browser_descendants::CliClientMembership::managed ? 1 : 0;
}
