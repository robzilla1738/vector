#include "AuxNativeParentConnectionBridge.h"
#include "AuxNativePeerTransport.h"
#include <limits>
#include <map>
#include <memory>
#include <mutex>
#include <unistd.h>

namespace {
using aux::peer::AuthenticatedNativeParentConnection;
struct Record {
  std::shared_ptr<AuthenticatedNativeParentConnection> connection;
  uint64_t references = 1;
};
struct Registry {
  const pid_t process = getpid();
  std::mutex mutex;
  uint64_t last_handle = 0;
  std::map<uint64_t, Record> records;
};
Registry& Connections() { static auto* registry = new Registry; return *registry; }
}
extern "C" uint64_t AuxConnectActualNativeParent(mach_port_t right,
    SecRequirementRef requirement, const uint8_t* hash, size_t length, uint32_t timeout_ms) {
  try {
    // The C argument is an explicitly transferred current-process right, not
    // an inherited object. Own it before registry allocation or process refusal
    // so every return/exception consumes it exactly once.
    auto endpoint = aux::peer::NativeSendRight::AdoptReceivedRight(right);
    if (!endpoint.is_valid()) return 0;
    auto& registry = Connections();
    if (getpid() != registry.process) return 0;
    if (!hash || (length != 20 && length != 32)) return 0;
    auto policy = aux::peer::ExactCodePolicy::CopyNativePolicy(requirement, {hash, length});
    if (!policy) return 0;
    auto actual = AuthenticatedNativeParentConnection::Connect(std::move(endpoint), policy, timeout_ms);
    if (!actual) return 0;
    std::shared_ptr<AuthenticatedNativeParentConnection> retained(std::move(actual));
    std::lock_guard<std::mutex> lock(registry.mutex);
    if (registry.last_handle == std::numeric_limits<uint64_t>::max()) return 0;
    const auto handle = ++registry.last_handle;
    registry.records.emplace(handle, Record{std::move(retained), 1});
    return handle;
  } catch (...) { return 0; }
}
extern "C" int32_t AuxRetainNativeParentConnection(uint64_t handle) {
  auto& registry = Connections();
  if (getpid() != registry.process) return -3;
  std::lock_guard<std::mutex> lock(registry.mutex);
  auto found = registry.records.find(handle);
  if (found == registry.records.end() ||
      found->second.references == std::numeric_limits<uint64_t>::max()) return -1;
  ++found->second.references;
  return 0;
}
extern "C" void AuxReleaseNativeParentConnection(uint64_t handle) {
  auto& registry = Connections();
  if (getpid() != registry.process) return;
  std::shared_ptr<AuthenticatedNativeParentConnection> released;
  {
    std::lock_guard<std::mutex> lock(registry.mutex);
    auto found = registry.records.find(handle);
    if (found == registry.records.end()) return;
    if (--found->second.references == 0) {
      released = std::move(found->second.connection);
      registry.records.erase(found);
    }
  }
  // Last reference closes outside registry lock; in-flight real checks retain it.
  if (released) released->CloseAndInspect();
}
extern "C" int32_t AuxRevalidateNativeParentConnection(uint64_t handle, uint32_t timeout_ms) {
  try {
    auto& registry = Connections();
    if (getpid() != registry.process) return -3;
    std::shared_ptr<AuthenticatedNativeParentConnection> actual;
    {
      std::lock_guard<std::mutex> lock(registry.mutex);
      auto found = registry.records.find(handle);
      if (found == registry.records.end()) return -1;
      actual = found->second.connection;
    }
    switch (actual->Revalidate(timeout_ms)) {
      case aux::peer::ExchangeStatus::authenticated: return 0;
      case aux::peer::ExchangeStatus::timedOut: return 1;
      case aux::peer::ExchangeStatus::closed: return -2;
      case aux::peer::ExchangeStatus::wrongProcess: return -3;
      case aux::peer::ExchangeStatus::refused: return -1;
    }
  } catch (...) { return -1; }
  return -1;
}

extern "C" int32_t AuxSendAuthenticatedFreshColdHome(uint64_t handle, uint64_t ready_service, uint32_t timeout_ms) {
  try {
    auto& registry = Connections();
    if (getpid() != registry.process) return -3;
    std::shared_ptr<AuthenticatedNativeParentConnection> actual;
    {
      std::lock_guard<std::mutex> lock(registry.mutex);
      auto found = registry.records.find(handle);
      if (found == registry.records.end()) return -1;
      actual = found->second.connection;
    }
    const auto observed = actual->SendSelectedHome(ready_service, timeout_ms);
    if (observed.right_cleanup_unresolved) return -4;
    switch (observed.status) {
      case aux::peer::ExchangeStatus::authenticated: return 0;
      case aux::peer::ExchangeStatus::timedOut: return 1;
      case aux::peer::ExchangeStatus::closed: return -2;
      case aux::peer::ExchangeStatus::wrongProcess: return -3;
      case aux::peer::ExchangeStatus::refused: return -1;
    }
  } catch (...) { return -1; }
  return -1;
}
