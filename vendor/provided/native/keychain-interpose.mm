// Daemon/CLI carrier only. Never inject into Chromium or an owner application.
// Loading this library performs no Keychain request. Unknown queries fail closed.
#import "keychain-query-map.h"
#include <cstdlib>
#include <atomic>
#include <cstdint>

namespace {
std::atomic<bool> deny_all{false};
std::atomic<uint64_t> refused{0};
bool Refuse() {
  if (!deny_all.load(std::memory_order_acquire)) return false;
  refused.fetch_add(1, std::memory_order_relaxed);
  return true;
}
NSDictionary* Map(CFDictionaryRef input, bool update = false) {
  const char* raw = std::getenv("AUX_NATIVE_KEYCHAIN_SCOPE");
  if (!raw || !input) return nil;
  NSString* scope = [NSString stringWithUTF8String:raw];
  return update ? AuxMapKeychainUpdate((__bridge NSDictionary*)input, scope)
                : AuxMapKeychainQuery((__bridge NSDictionary*)input, scope);
}
OSStatus Add(CFDictionaryRef attributes, CFTypeRef* result) {
  @autoreleasepool {
    if (Refuse()) { if (result) *result = nullptr; return errSecInteractionNotAllowed; }
    NSDictionary* q = Map(attributes);
    if (!q) { if (result) *result = nullptr; return errSecParam; }
    return SecItemAdd((__bridge CFDictionaryRef)q, result);
  }
}
OSStatus Copy(CFDictionaryRef query, CFTypeRef* result) {
  @autoreleasepool {
    if (Refuse()) { if (result) *result = nullptr; return errSecInteractionNotAllowed; }
    NSDictionary* q = Map(query);
    if (!q) { if (result) *result = nullptr; return errSecParam; }
    return SecItemCopyMatching((__bridge CFDictionaryRef)q, result);
  }
}
OSStatus Delete(CFDictionaryRef query) {
  @autoreleasepool {
    if (Refuse()) return errSecInteractionNotAllowed;
    NSDictionary* q = Map(query);
    return q ? SecItemDelete((__bridge CFDictionaryRef)q) : errSecParam;
  }
}
OSStatus Update(CFDictionaryRef query, CFDictionaryRef attributes) {
  @autoreleasepool {
    if (Refuse()) return errSecInteractionNotAllowed;
    NSDictionary* q = Map(query), *a = Map(attributes, true);
    return q && a ? SecItemUpdate((__bridge CFDictionaryRef)q, (__bridge CFDictionaryRef)a) : errSecParam;
  }
}
SecKeyRef Create(CFDictionaryRef attributes, CFErrorRef* error) {
  @autoreleasepool {
    if (Refuse()) {
      if (error) *error = CFErrorCreate(kCFAllocatorDefault, kCFErrorDomainOSStatus, errSecInteractionNotAllowed, nullptr);
      return nullptr;
    }
    NSDictionary* q = Map(attributes);
    if (!q) {
      if (error) *error = CFErrorCreate(kCFAllocatorDefault, kCFErrorDomainOSStatus, errSecParam, nullptr);
      return nullptr;
    }
    return SecKeyCreateRandomKey((__bridge CFDictionaryRef)q, error);
  }
}
#define AUX_INTERPOSE(replacement, original) \
  __attribute__((used)) static const struct { const void* replacement; const void* original; } \
  interpose_##original __attribute__((section("__DATA,__interpose"))) = { \
    (const void*)(unsigned long)&replacement, (const void*)(unsigned long)&original }
AUX_INTERPOSE(Add, SecItemAdd);
AUX_INTERPOSE(Copy, SecItemCopyMatching);
AUX_INTERPOSE(Delete, SecItemDelete);
AUX_INTERPOSE(Update, SecItemUpdate);
AUX_INTERPOSE(Create, SecKeyCreateRandomKey);
}  // namespace

// Carrier checks its actual import bindings before loading the supplied module.
// This handshake performs no security operation and never treats an env flag as proof.
extern "C" bool AuxNativeBoundaryValidate(const void* add, const void* copy,
                                           const void* remove, const void* update,
                                           const void* create) {
  return add == (const void*)(unsigned long)&Add &&
         copy == (const void*)(unsigned long)&Copy &&
         remove == (const void*)(unsigned long)&Delete &&
         update == (const void*)(unsigned long)&Update &&
         create == (const void*)(unsigned long)&Create;
}

// One-way per-process safety latch. No environment change can turn this off.
extern "C" void AuxNativeBoundaryDenyAll() {
  deny_all.store(true, std::memory_order_release);
}
extern "C" bool AuxNativeBoundaryIsDenyAll() {
  return deny_all.load(std::memory_order_acquire);
}
extern "C" uint64_t AuxNativeBoundaryRefusedCalls() {
  return refused.load(std::memory_order_relaxed);
}
