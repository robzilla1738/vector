// Daemon/CLI carrier only. Never inject into Chromium or an owner application.
// Loading this library performs no Keychain request. Unknown queries fail
// closed.
#import "keychain-query-map.h"
#import "agent-inbox-keychain-map.h"
#include <atomic>
#include <cstdint>
#include <cstdlib>
#include <mutex>
#include <string>

namespace {
std::atomic<bool> deny_all{false};
std::atomic<uint64_t> refused{0};
std::mutex scope_mutex;
std::string fixed_scope;
bool Refuse() {
  if (!deny_all.load(std::memory_order_acquire))
    return false;
  refused.fetch_add(1, std::memory_order_relaxed);
  return true;
}
bool AgentInboxEnabled() {
  const char *accepted = std::getenv("AUX_ENABLE_PROVIDED_AGENT_INBOX_KEYCHAIN");
  if (!accepted || std::string(accepted) != "1" ||
      deny_all.load(std::memory_order_acquire))
    return false;
  std::lock_guard<std::mutex> lock(scope_mutex);
  return !fixed_scope.empty();
}
NSDictionary *Map(CFDictionaryRef input, bool update = false,
                  bool allow_agent_inbox = false) {
  if (!input)
    return nil;
  std::string raw;
  {
    std::lock_guard<std::mutex> lock(scope_mutex);
    raw = fixed_scope;
  }
  if (raw.empty())
    return nil;
  NSString *scope = [NSString stringWithUTF8String:raw.c_str()];
  NSDictionary *mapped;
  if (AuxIsAgentInboxKeychainQuery((__bridge NSDictionary *)input, scope)) {
    if (update || !allow_agent_inbox || !AgentInboxEnabled())
      return nil;
    // The original family already requires a noninteractive LAContext.
    return AuxMapAgentInboxKeychainQuery((__bridge NSDictionary *)input, scope);
  } else {
    mapped = update ? AuxMapKeychainUpdate((__bridge NSDictionary *)input, scope)
                    : AuxMapKeychainQuery((__bridge NSDictionary *)input, scope);
  }
  if (!mapped)
    return nil;
  // Keep original DP/enclave/access-control semantics. Only unattended UI
  // policy is tightened: denied interaction remains a real error, never a fake
  // unlock.
  NSMutableDictionary *unattended = [mapped mutableCopy];
  unattended[(__bridge id)kSecUseAuthenticationUI] =
      (__bridge id)kSecUseAuthenticationUIFail;
  return unattended;
}
OSStatus Add(CFDictionaryRef attributes, CFTypeRef *result) {
  @autoreleasepool {
    if (Refuse()) {
      if (result)
        *result = nullptr;
      return errSecInteractionNotAllowed;
    }
    NSDictionary *q = Map(attributes, false, true);
    if (!q) {
      if (result)
        *result = nullptr;
      return errSecParam;
    }
    return SecItemAdd((__bridge CFDictionaryRef)q, result);
  }
}
OSStatus Copy(CFDictionaryRef query, CFTypeRef *result) {
  @autoreleasepool {
    if (Refuse()) {
      if (result)
        *result = nullptr;
      return errSecInteractionNotAllowed;
    }
    NSDictionary *q = Map(query, false, true);
    if (!q) {
      if (result)
        *result = nullptr;
      return errSecParam;
    }
    return SecItemCopyMatching((__bridge CFDictionaryRef)q, result);
  }
}
OSStatus Delete(CFDictionaryRef query) {
  @autoreleasepool {
    if (Refuse())
      return errSecInteractionNotAllowed;
    NSDictionary *q = Map(query);
    return q ? SecItemDelete((__bridge CFDictionaryRef)q) : errSecParam;
  }
}
OSStatus Update(CFDictionaryRef query, CFDictionaryRef attributes) {
  @autoreleasepool {
    if (Refuse())
      return errSecInteractionNotAllowed;
    NSDictionary *q = Map(query), *a = Map(attributes, true);
    return q && a ? SecItemUpdate((__bridge CFDictionaryRef)q,
                                  (__bridge CFDictionaryRef)a)
                  : errSecParam;
  }
}
SecKeyRef Create(CFDictionaryRef attributes, CFErrorRef *error) {
  @autoreleasepool {
    if (Refuse()) {
      if (error)
        *error = CFErrorCreate(kCFAllocatorDefault, kCFErrorDomainOSStatus,
                               errSecInteractionNotAllowed, nullptr);
      return nullptr;
    }
    NSDictionary *q = Map(attributes);
    if (!q) {
      if (error)
        *error = CFErrorCreate(kCFAllocatorDefault, kCFErrorDomainOSStatus,
                               errSecParam, nullptr);
      return nullptr;
    }
    return SecKeyCreateRandomKey((__bridge CFDictionaryRef)q, error);
  }
}
#define AUX_INTERPOSE(replacement, original)                                   \
  __attribute__((used)) static const struct {                                  \
    const void *replacement;                                                   \
    const void *original;                                                      \
  } interpose_##original __attribute__((section("__DATA,__interpose"))) = {    \
      (const void *)(unsigned long)&replacement,                               \
      (const void *)(unsigned long)&original}
AUX_INTERPOSE(Add, SecItemAdd);
AUX_INTERPOSE(Copy, SecItemCopyMatching);
AUX_INTERPOSE(Delete, SecItemDelete);
AUX_INTERPOSE(Update, SecItemUpdate);
AUX_INTERPOSE(Create, SecKeyCreateRandomKey);
} // namespace

// Carrier checks its actual import bindings before loading the supplied module.
// This handshake performs no security operation and never treats an env flag as
// proof.
extern "C" bool AuxNativeBoundaryValidate(const void *add, const void *copy,
                                          const void *remove,
                                          const void *update,
                                          const void *create) {
  return add == (const void *)(unsigned long)&Add &&
         copy == (const void *)(unsigned long)&Copy &&
         remove == (const void *)(unsigned long)&Delete &&
         update == (const void *)(unsigned long)&Update &&
         create == (const void *)(unsigned long)&Create;
}

// One-way per-process safety latch. No environment change can turn this off.
extern "C" void AuxNativeBoundaryDenyAll() {
  deny_all.store(true, std::memory_order_release);
}
extern "C" bool AuxNativeBoundaryIsDenyAll() {
  return deny_all.load(std::memory_order_acquire);
}
extern "C" bool AuxNativeBoundaryAgentInboxKeychainEnabled() {
  return AgentInboxEnabled();
}
extern "C" uint64_t AuxNativeBoundaryRefusedCalls() {
  return refused.load(std::memory_order_relaxed);
}

extern "C" bool AuxNativeBoundaryConfigureScope(const char *raw) {
  if (!raw || strlen(raw) != 64)
    return false;
  std::string value(raw);
  if (value.find_first_not_of("0123456789abcdef") != std::string::npos)
    return false;
  std::lock_guard<std::mutex> lock(scope_mutex);
  if (!fixed_scope.empty())
    return fixed_scope == value;
  fixed_scope = value;
  return true;
}
