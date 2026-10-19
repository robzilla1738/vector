#import "keychain-query-map.h"
#include <cassert>
int main() {
  @autoreleasepool {
    NSString *scope = [@"a" stringByPaddingToLength:64
                                         withString:@"a"
                                    startingAtIndex:0];
    NSData *secret =
        [@"unchanged fixture bytes" dataUsingEncoding:NSUTF8StringEncoding];
    NSDictionary *original = @{
      (__bridge id)kSecClass : (__bridge id)kSecClassGenericPassword,
      (__bridge id)
      kSecAttrAccessGroup : @"8CPD4K4TBB.at.studio.AsideBrowser.cryptography",
      (__bridge id)kSecAttrService : @"aside.install",
      (__bridge id)kSecAttrAccount : @"aside.install.kem",
      (__bridge id)kSecValueData : secret,
      (__bridge id)kSecUseDataProtectionKeychain : @YES,
      (__bridge id)kSecAttrAccessible :
          (__bridge id)kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly,
      (__bridge id)
      kSecUseAuthenticationUI : (__bridge id)kSecUseAuthenticationUISkip,
    };
    NSDictionary *q = AuxMapKeychainQuery(original, scope);
    assert(q && !q[(__bridge id)kSecAttrAccessGroup]);
    assert(([q[(__bridge id)kSecAttrService]
        hasPrefix:[NSString stringWithFormat:@"aux.%@.", scope]]));
    assert([q[(__bridge id)kSecAttrAccount] hasSuffix:@"aside.install.kem"]);
    assert(q[(__bridge id)kSecValueData] == secret);
    assert([q[(__bridge id)kSecUseDataProtectionKeychain] boolValue]);
    assert(q[(__bridge id)kSecAttrAccessible] ==
           original[(__bridge id)kSecAttrAccessible]);
    assert(q[(__bridge id)kSecUseAuthenticationUI] ==
           original[(__bridge id)kSecUseAuthenticationUI]);
    NSDictionary *legacy = AuxMapKeychainQuery(@{
      (__bridge id)kSecAttrService : @"Aside_Password_Manager_biometric_2",
      (__bridge id)kSecAttrAccount : @"aside_password_manager_master_key_2"
    },
                                               scope);
    assert(legacy);
    assert([legacy[(__bridge id)kSecAttrService]
        hasSuffix:@"Aside_Password_Manager_biometric_2"]);
    NSDictionary *different = AuxMapKeychainQuery(@{
      (__bridge id)kSecAttrService : @"aside.install",
      (__bridge id)kSecAttrAccount : @"aside.install.sig"
    },
                                                  scope);
    assert(![different[(__bridge id)kSecAttrAccount]
        isEqual:q[(__bridge id)kSecAttrAccount]]);
    assert(original[(__bridge id)kSecAttrAccessGroup]);
    assert([AuxMapKeychainQuery(q, scope) isEqual:q]);
    assert(!AuxMapKeychainQuery(
        @{(__bridge id)kSecClass : (__bridge id)kSecClassGenericPassword},
        scope));
    assert(!AuxMapKeychainQuery(
        @{(__bridge id)kSecAttrService : @"owner-service"}, scope));
    assert(!AuxMapKeychainQuery(@{
      (__bridge id)kSecAttrService : @"aside.install",
      (__bridge id)kSecAttrAccessGroup : @"other-team"
    },
                                scope));
    assert(!AuxMapKeychainQuery(@{
      (__bridge id)kSecAttrService : @"aside.install",
      (__bridge id)kSecValuePersistentRef : secret
    },
                                scope));
    assert(!AuxMapKeychainQuery(original, @"bad"));
    assert(!AuxMapKeychainQuery(
        @{
          (__bridge id)kSecAttrService : @"aside.install",
          (__bridge id)kSecAttrSynchronizable : @YES
        },
        scope));
    assert(!AuxMapKeychainQuery(
        @{
          (__bridge id)kSecAttrService : @"aside.install",
          (__bridge id)kSecUseItemList : @[ secret ]
        },
        scope));
    NSDictionary *nested = AuxMapKeychainQuery(
        @{
          (__bridge id)kSecPrivateKeyAttrs : @{
            (__bridge id)kSecAttrApplicationTag :
                [@"aside.install.sig" dataUsingEncoding:NSUTF8StringEncoding]
          }
        },
        scope);
    assert(nested);
    NSDictionary *a =
        AuxMapKeychainUpdate(@{(__bridge id)kSecValueData : secret}, scope);
    assert(a[(__bridge id)kSecValueData] == secret);
    NSString *other = [@"b" stringByPaddingToLength:64
                                         withString:@"b"
                                    startingAtIndex:0];
    assert(![AuxMapKeychainQuery(original, other)[(__bridge id)kSecAttrService]
        isEqual:q[(__bridge id)kSecAttrService]]);
    // Supplied secureStorageBaseQuery always carries this exact group and
    // uses the complete logical key as both generic-password selectors.
    for (NSString *key in @[@"mcp:index:7", @"mcp:7:fixture-server"]) {
      NSDictionary *source = @{
        (__bridge id)kSecClass : (__bridge id)kSecClassGenericPassword,
        (__bridge id)kSecAttrAccessGroup : @"8CPD4K4TBB.at.studio.AsideBrowser.cryptography",
        (__bridge id)kSecAttrService : key,
        (__bridge id)kSecAttrAccount : key,
        (__bridge id)kSecUseDataProtectionKeychain : @YES,
      };
      NSDictionary *mapped = AuxMapKeychainQuery(source, scope);
      assert(mapped && !mapped[(__bridge id)kSecAttrAccessGroup]);
      NSString *expected = [NSString stringWithFormat:@"aux.%@.%@", scope, key];
      assert([mapped[(__bridge id)kSecAttrService] isEqual:expected]);
      assert([mapped[(__bridge id)kSecAttrAccount] isEqual:expected]);
      assert([mapped[(__bridge id)kSecUseDataProtectionKeychain] boolValue]);
      assert([AuxMapKeychainQuery(mapped, scope) isEqual:mapped]);
      NSMutableDictionary *wrongGroup = [source mutableCopy];
      wrongGroup[(__bridge id)kSecAttrAccessGroup] = @"unrecognized-group";
      assert(!AuxMapKeychainQuery(wrongGroup, scope));
      [wrongGroup removeObjectForKey:(__bridge id)kSecAttrAccessGroup];
      assert(!AuxMapKeychainQuery(wrongGroup, scope));
      NSMutableDictionary *opaque = [source mutableCopy];
      opaque[(__bridge id)kSecValuePersistentRef] = secret;
      assert(!AuxMapKeychainQuery(opaque, scope));
    }
    puts("pure query mapping fixtures passed; zero Keychain calls");
  }
}
