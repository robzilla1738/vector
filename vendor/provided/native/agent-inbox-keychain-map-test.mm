#import "agent-inbox-keychain-map.h"

#import <LocalAuthentication/LocalAuthentication.h>
#import <Security/Security.h>

#include <cassert>
#include <initializer_list>

namespace {
NSDictionary* Read(LAContext* context) {
  return @{
    (__bridge id)kSecClass : (__bridge id)kSecClassGenericPassword,
    (__bridge id)kSecAttrService : @"Aside Agent Master Key",
    (__bridge id)kSecAttrAccount : @"Aside Agent",
    (__bridge id)kSecReturnData : @YES,
    (__bridge id)kSecMatchLimit : (__bridge id)kSecMatchLimitOne,
    (__bridge id)kSecUseAuthenticationContext : context
  };
}

NSDictionary* Add(LAContext* context) {
  // Public, deterministic fixture bytes, never an actual inbox key.
  const unsigned char bytes[32] = {};
  NSData* key = [NSData dataWithBytes:bytes length:sizeof(bytes)];
  return @{
    (__bridge id)kSecClass : (__bridge id)kSecClassGenericPassword,
    (__bridge id)kSecAttrService : @"Aside Agent Master Key",
    (__bridge id)kSecAttrAccount : @"Aside Agent",
    (__bridge id)kSecAttrLabel : @"Aside Agent Master Key",
    (__bridge id)
    kSecAttrAccessible : (__bridge id)kSecAttrAccessibleWhenUnlocked,
    (__bridge id)kSecAttrIsInvisible : @YES,
    (__bridge id)kSecValueData : [key base64EncodedDataWithOptions:0],
    (__bridge id)kSecUseAuthenticationContext : context
  };
}

void RejectChange(NSDictionary* source, id key, id value, NSString* scope) {
  NSMutableDictionary* changed = [source mutableCopy];
  if (value)
    changed[key] = value;
  else
    [changed removeObjectForKey:key];
  assert(!AuxMapAgentInboxKeychainQuery(changed, scope));
}
}  // namespace

int main() {
  @autoreleasepool {
    NSString* scope = [@"a" stringByPaddingToLength:64
                                         withString:@"a"
                                    startingAtIndex:0];
    NSString* other = [@"b" stringByPaddingToLength:64
                                         withString:@"b"
                                    startingAtIndex:0];
    LAContext* context = [[LAContext alloc] init];
    context.interactionNotAllowed = YES;
    NSDictionary* read = Read(context);
    NSDictionary* add = Add(context);
    NSDictionary* readSnapshot = [read copy];
    NSDictionary* addSnapshot = [add copy];
    for (NSDictionary* source in @[ read, add ]) {
      assert(AuxIsAgentInboxKeychainQuery(source, scope));
      NSDictionary* mapped = AuxMapAgentInboxKeychainQuery(source, scope);
      assert(mapped);
      assert(([mapped[(__bridge id)kSecAttrService]
          isEqual:[NSString stringWithFormat:@"aux.%@.Aside Agent Master Key",
                                             scope]]));
      assert(([mapped[(__bridge id)kSecAttrAccount]
          isEqual:[NSString stringWithFormat:@"aux.%@.Aside Agent", scope]]));
      assert(mapped[(__bridge id)kSecUseAuthenticationContext] == context);
      assert(AuxIsAgentInboxKeychainQuery(mapped, scope));
      assert([AuxMapAgentInboxKeychainQuery(mapped, scope) isEqual:mapped]);
      assert(!AuxMapAgentInboxKeychainQuery(mapped, other));
      assert(![AuxMapAgentInboxKeychainQuery(source, other) isEqual:mapped]);
      for (id key in source)
        RejectChange(source, key, nil, scope);
      for (id extra in @[
             (__bridge id)kSecAttrAccessGroup,
             (__bridge id)kSecUseDataProtectionKeychain,
             (__bridge id)kSecAttrSynchronizable, (__bridge id)kSecValueRef,
             (__bridge id)kSecValuePersistentRef,
             (__bridge id)kSecMatchItemList, (__bridge id)kSecMatchSearchList,
             (__bridge id)kSecUseKeychain, (__bridge id)kSecUseItemList,
             (__bridge id)kSecReturnAttributes,
             (__bridge id)kSecUseAuthenticationUI, @"unrecognized"
           ])
        RejectChange(source, extra, @YES, scope);
      // Even false DP/sync attributes differ from the exact legacy shape.
      RejectChange(source, (__bridge id)kSecUseDataProtectionKeychain, @NO,
                   scope);
      RejectChange(source, (__bridge id)kSecAttrSynchronizable, @NO, scope);
      RejectChange(source, (__bridge id)kSecClass, (__bridge id)kSecClassKey,
                   scope);
      RejectChange(source, (__bridge id)kSecAttrService, @"unrelated", scope);
      RejectChange(source, (__bridge id)kSecAttrAccount, @"unrelated", scope);
      RejectChange(source, (__bridge id)kSecUseAuthenticationContext,
                   @"not a context", scope);
    }
    assert([read isEqual:readSnapshot] && [add isEqual:addSnapshot]);
    assert(context.interactionNotAllowed);
    NSDictionary* mappedAdd = AuxMapAgentInboxKeychainQuery(add, scope);
    assert([mappedAdd[(__bridge id)kSecAttrLabel]
        isEqual:@"Aux Agent Master Key"]);
    assert(mappedAdd[(__bridge id)kSecValueData] ==
           add[(__bridge id)kSecValueData]);
    RejectChange(read, (__bridge id)kSecReturnData, @NO, scope);
    RejectChange(read, (__bridge id)kSecReturnData, @1, scope);
    RejectChange(read, (__bridge id)kSecReturnData, @"true", scope);
    RejectChange(read, (__bridge id)kSecMatchLimit,
                 (__bridge id)kSecMatchLimitAll, scope);
    RejectChange(add, (__bridge id)kSecAttrLabel, @"unrelated", scope);
    RejectChange(add, (__bridge id)kSecAttrAccessible,
                 (__bridge id)kSecAttrAccessibleAfterFirstUnlock, scope);
    RejectChange(add, (__bridge id)kSecAttrIsInvisible, @1, scope);
    RejectChange(add, (__bridge id)kSecValueData, @"not NSData", scope);
    RejectChange(add, (__bridge id)kSecReturnData, @YES, scope);
    for (NSUInteger length : {31u, 33u}) {
      NSData* wrong = [NSMutableData dataWithLength:length];
      RejectChange(add, (__bridge id)kSecValueData,
                   [wrong base64EncodedDataWithOptions:0], scope);
    }
    NSData* value = add[(__bridge id)kSecValueData];
    NSMutableData* withWhitespace = [value mutableCopy];
    [withWhitespace appendData:[@"\n" dataUsingEncoding:NSUTF8StringEncoding]];
    RejectChange(add, (__bridge id)kSecValueData, withWhitespace, scope);
    RejectChange(add, (__bridge id)kSecValueData,
                 [@"!!!!" dataUsingEncoding:NSUTF8StringEncoding], scope);
    LAContext* interactive = [[LAContext alloc] init];
    RejectChange(read, (__bridge id)kSecUseAuthenticationContext, interactive,
                 scope);
    for (NSString* invalidScope in @[ @"", @"bad", [scope uppercaseString] ])
      assert(!AuxMapAgentInboxKeychainQuery(read, invalidScope));
    assert(!AuxMapAgentInboxKeychainQuery(read, nil));
    assert(AuxIsAgentInboxKeychainQuery(read, @"invalid"));
    assert(!AuxMapAgentInboxKeychainQuery(nil, scope));
    assert(!AuxIsAgentInboxKeychainQuery(nil, scope));
    assert(!AuxIsAgentInboxKeychainQuery(@{}, scope));
    // Detect malformed partial identities, including NSData encodings, but do
    // not accept their alternate type or missing/wrong paired identity.
    for (id key in
         @[ (__bridge id)kSecAttrService, (__bridge id)kSecAttrAccount ]) {
      NSString* original = read[key];
      NSString* scoped = AuxMapAgentInboxKeychainQuery(read, scope)[key];
      for (id name in @[
             original, [original dataUsingEncoding:NSUTF8StringEncoding],
             scoped, [scoped dataUsingEncoding:NSUTF8StringEncoding]
           ]) {
        NSDictionary* partial = @{key : name};
        assert(AuxIsAgentInboxKeychainQuery(partial, scope));
        assert(!AuxMapAgentInboxKeychainQuery(partial, scope));
      }
      NSMutableDictionary* encoded = [read mutableCopy];
      encoded[key] = [original dataUsingEncoding:NSUTF8StringEncoding];
      assert(AuxIsAgentInboxKeychainQuery(encoded, scope));
      assert(!AuxMapAgentInboxKeychainQuery(encoded, scope));
      NSMutableDictionary* mixed = [read mutableCopy];
      mixed[key] = AuxMapAgentInboxKeychainQuery(read, scope)[key];
      assert(AuxIsAgentInboxKeychainQuery(mixed, scope));
      assert(!AuxMapAgentInboxKeychainQuery(mixed, scope));
    }
    puts("pure inbox query fixtures passed; no Keychain operations");
  }
}
