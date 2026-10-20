#import "agent-inbox-keychain-map.h"

#import <LocalAuthentication/LocalAuthentication.h>
#import <Security/Security.h>

namespace {
NSString* const kService = @"Aside Agent Master Key";
NSString* const kAccount = @"Aside Agent";
NSString* const kLabel = @"Aux Agent Master Key";

bool ValidScope(NSString* scope) {
  return [scope isKindOfClass:[NSString class]] && scope.length == 64 &&
         [scope rangeOfCharacterFromSet:
                    [[NSCharacterSet
                        characterSetWithCharactersInString:@"0123456789abcdef"]
                        invertedSet]]
                 .location == NSNotFound;
}

NSString* Scoped(NSString* name, NSString* scope) {
  return [NSString stringWithFormat:@"aux.%@.%@", scope, name];
}

NSString* DetectionText(id value) {
  if ([value isKindOfClass:[NSData class]])
    return [[NSString alloc] initWithData:value encoding:NSUTF8StringEncoding];
  return [value isKindOfClass:[NSString class]] ? value : nil;
}

bool IdentityMatches(id value, NSString* original, NSString* scope) {
  NSString* text = DetectionText(value);
  return [text isEqualToString:original] ||
         (ValidScope(scope) && [text isEqualToString:Scoped(original, scope)]);
}

bool TrueBoolean(id value) {
  return [value isKindOfClass:[NSNumber class]] &&
         CFGetTypeID((__bridge CFTypeRef)value) == CFBooleanGetTypeID() &&
         CFBooleanGetValue((__bridge CFBooleanRef)value);
}

bool NoninteractiveContext(id value) {
  return [value isKindOfClass:[LAContext class]] &&
         [(LAContext*)value interactionNotAllowed];
}

bool ExactKeys(NSDictionary* query, NSArray* keys) {
  return [[NSSet setWithArray:query.allKeys]
      isEqualToSet:[NSSet setWithArray:keys]];
}

bool CanonicalKeyData(id value) {
  if (![value isKindOfClass:[NSData class]])
    return false;
  NSData* decoded = [[NSData alloc] initWithBase64EncodedData:value options:0];
  return decoded.length == 32 &&
         [[decoded base64EncodedDataWithOptions:0] isEqual:value];
}
}  // namespace

bool AuxIsAgentInboxKeychainQuery(NSDictionary* input, NSString* scope) {
  if (![input isKindOfClass:[NSDictionary class]])
    return false;
  return IdentityMatches(input[(__bridge id)kSecAttrService], kService,
                         scope) ||
         IdentityMatches(input[(__bridge id)kSecAttrAccount], kAccount, scope);
}

NSDictionary* AuxMapAgentInboxKeychainQuery(NSDictionary* input,
                                            NSString* scope) {
  if (![input isKindOfClass:[NSDictionary class]] || !ValidScope(scope))
    return nil;
  id service = input[(__bridge id)kSecAttrService];
  id account = input[(__bridge id)kSecAttrAccount];
  if (![service isKindOfClass:[NSString class]] ||
      ![account isKindOfClass:[NSString class]])
    return nil;
  const bool original =
      [service isEqualToString:kService] && [account isEqualToString:kAccount];
  const bool scoped = [service isEqualToString:Scoped(kService, scope)] &&
                      [account isEqualToString:Scoped(kAccount, scope)];
  if ((!original && !scoped) ||
      ![input[(__bridge id)kSecClass]
          isEqual:(__bridge id)kSecClassGenericPassword] ||
      !NoninteractiveContext(input[(__bridge id)kSecUseAuthenticationContext]))
    return nil;

  // Original40da744 read and40daccc add: legacy generic passwords, no DP,
  // access group, synchronization, search list, UI prompt or opaque handle.
  const bool read =
      ExactKeys(input,
                @[
                  (__bridge id)kSecClass, (__bridge id)kSecAttrService,
                  (__bridge id)kSecAttrAccount, (__bridge id)kSecReturnData,
                  (__bridge id)kSecMatchLimit,
                  (__bridge id)kSecUseAuthenticationContext
                ]) &&
      TrueBoolean(input[(__bridge id)kSecReturnData]) &&
      [input[(__bridge id)kSecMatchLimit]
          isEqual:(__bridge id)kSecMatchLimitOne];
  const bool add =
      ExactKeys(input,
                @[
                  (__bridge id)kSecClass, (__bridge id)kSecAttrService,
                  (__bridge id)kSecAttrAccount, (__bridge id)kSecAttrLabel,
                  (__bridge id)kSecAttrAccessible,
                  (__bridge id)kSecAttrIsInvisible, (__bridge id)kSecValueData,
                  (__bridge id)kSecUseAuthenticationContext
                ]) &&
      [input[(__bridge id)kSecAttrLabel]
          isEqual:(original ? kService : kLabel)] &&
      [input[(__bridge id)kSecAttrAccessible]
          isEqual:(__bridge id)kSecAttrAccessibleWhenUnlocked] &&
      TrueBoolean(input[(__bridge id)kSecAttrIsInvisible]) &&
      CanonicalKeyData(input[(__bridge id)kSecValueData]);
  if (!read && !add)
    return nil;

  NSMutableDictionary* result = [input mutableCopy];
  result[(__bridge id)kSecAttrService] = Scoped(kService, scope);
  result[(__bridge id)kSecAttrAccount] = Scoped(kAccount, scope);
  if (add)
    result[(__bridge id)kSecAttrLabel] = kLabel;
  return [result copy];
}
