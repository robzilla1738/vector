#define __STDC_WANT_LIB_EXT1__ 1
#import "agent-inbox-master-key.h"
#import <LocalAuthentication/LocalAuthentication.h>
#import <Security/Security.h>
#include <array>
#include <cstdint>
#include <dlfcn.h>
#include <string.h>

namespace {
NSData *ReadKey(NSDictionary *query, OSStatus *status) {
  CFTypeRef raw = nullptr;
  *status = SecItemCopyMatching((__bridge CFDictionaryRef)query, &raw);
  id value = CFBridgingRelease(raw);
  if (*status != errSecSuccess || ![value isKindOfClass:[NSData class]])
    return nil;
  NSString *encoded = [[NSString alloc] initWithData:value
                                           encoding:NSUTF8StringEncoding];
  NSData *key = [[NSData alloc] initWithBase64EncodedString:encoded ?: @""
                                                  options:0];
  if (key.length != 32 ||
      ![[key base64EncodedStringWithOptions:0] isEqualToString:encoded])
    return nil;
  return key;
}
}  // namespace

NSData *AuxLoadAgentInboxMasterKey() {
  // Neither the old installation acceptance nor merely loading this helper
  // authorizes the additional legacy-Keychain family.
  using Enabled = bool (*)();
  auto enabled = reinterpret_cast<Enabled>(
      dlsym(RTLD_DEFAULT, "AuxNativeBoundaryAgentInboxKeychainEnabled"));
  if (!enabled || !enabled())
    return nil;
  LAContext *context = [[LAContext alloc] init];
  if (!context)
    return nil;
  context.interactionNotAllowed = YES;
  NSDictionary *query = @{
    (__bridge id)kSecClass : (__bridge id)kSecClassGenericPassword,
    (__bridge id)kSecAttrService : @"Aside Agent Master Key",
    (__bridge id)kSecAttrAccount : @"Aside Agent",
    (__bridge id)kSecReturnData : @YES,
    (__bridge id)kSecMatchLimit : (__bridge id)kSecMatchLimitOne,
    (__bridge id)kSecUseAuthenticationContext : context,
  };
  OSStatus status;
  NSData *key = ReadKey(query, &status);
  if (key || status != errSecItemNotFound)
    return key;
  std::array<uint8_t, 32> bytes;
  if (SecRandomCopyBytes(kSecRandomDefault, bytes.size(), bytes.data()) !=
      errSecSuccess) {
    memset_s(bytes.data(), bytes.size(), 0, bytes.size());
    return nil;
  }
  key = [NSData dataWithBytes:bytes.data() length:bytes.size()];
  memset_s(bytes.data(), bytes.size(), 0, bytes.size());
  if (!key)
    return nil;
  NSMutableDictionary *attributes = [query mutableCopy];
  [attributes removeObjectForKey:(__bridge id)kSecReturnData];
  [attributes removeObjectForKey:(__bridge id)kSecMatchLimit];
  attributes[(__bridge id)kSecAttrLabel] = @"Aside Agent Master Key";
  attributes[(__bridge id)kSecAttrAccessible] =
      (__bridge id)kSecAttrAccessibleWhenUnlocked;
  attributes[(__bridge id)kSecAttrIsInvisible] = @YES;
  attributes[(__bridge id)kSecValueData] =
      [[key base64EncodedStringWithOptions:0]
          dataUsingEncoding:NSUTF8StringEncoding];
  status = SecItemAdd((__bridge CFDictionaryRef)attributes, nullptr);
  if (status == errSecSuccess)
    return key;
  // A concurrent original-style creator wins; read that same scoped item.
  // Other failures never overwrite, delete or select another identity.
  return status == errSecDuplicateItem ? ReadKey(query, &status) : nil;
}
