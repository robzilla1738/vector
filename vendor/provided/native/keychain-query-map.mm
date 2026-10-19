#import "keychain-query-map.h"

namespace {
NSString* const kOriginalGroup = @"8CPD4K4TBB.at.studio.AsideBrowser.cryptography";
bool ScopeValid(NSString* scope) {
  if (scope.length != 64) return false;
  return [scope rangeOfCharacterFromSet:[[NSCharacterSet characterSetWithCharactersInString:@"0123456789abcdef"] invertedSet]].location == NSNotFound;
}
bool Known(NSString* value) {
  for (NSString* prefix in @[@"aside.", @"aside-canary.", @"aux.", @"Aside_Password_Manager_", @"aside_password_manager_"])
    if ([value hasPrefix:prefix]) return true;
  return false;
}
NSString* Isolate(NSString* value, NSString* scope) {
  // Keep the complete original logical name as a suffix. This preserves
  // distinct legacy/current keys without ever querying their original service.
  NSString* prefix = [NSString stringWithFormat:@"aux.%@.", scope];
  return [value hasPrefix:prefix] ? value : [prefix stringByAppendingString:value];
}
NSDictionary* Map(NSDictionary* input, NSString* scope, bool update, unsigned depth, bool* identity) {
  if (depth > 8 || input.count > 128) return nil;
  id group = input[(__bridge id)kSecAttrAccessGroup];
  if (group && ![group isEqual:kOriginalGroup]) return nil;
  // Opaque handles could select an owner item without a mapped namespace.
  for (id key in @[(__bridge id)kSecValueRef, (__bridge id)kSecValuePersistentRef,
                   (__bridge id)kSecMatchItemList, (__bridge id)kSecMatchSearchList,
                   (__bridge id)kSecUseKeychain])
    if (input[key]) return nil;
  NSMutableDictionary* result = [input mutableCopy];
  [result removeObjectForKey:(__bridge id)kSecAttrAccessGroup];
  bool found = false;
  for (id key in @[(__bridge id)kSecAttrService, (__bridge id)kSecAttrAccount,
                   (__bridge id)kSecAttrApplicationTag, (__bridge id)kSecAttrApplicationLabel]) {
    id value = input[key];
    if (!value) continue;
    bool data = [value isKindOfClass:[NSData class]];
    NSString* text = data ? [[NSString alloc] initWithData:value encoding:NSUTF8StringEncoding] : value;
    if (![text isKindOfClass:[NSString class]] || !text.length) return nil;
    if (!group && !Known(text)) return nil;
    NSString* mapped = Isolate(text, scope);
    result[key] = data ? [mapped dataUsingEncoding:NSUTF8StringEncoding] : mapped;
    found = true;
  }
  for (id key in @[(__bridge id)kSecPrivateKeyAttrs, (__bridge id)kSecPublicKeyAttrs]) {
    id nested = input[key];
    if (!nested) continue;
    if (![nested isKindOfClass:[NSDictionary class]]) return nil;
    bool childIdentity = false;
    NSDictionary* mapped = Map(nested, scope, true, depth + 1, &childIdentity);
    if (!mapped) return nil;
    result[key] = mapped;
    found |= childIdentity;
  }
  if (!update && !found) return nil;
  *identity = found;
  return result;
}
}  // namespace

NSDictionary* AuxMapKeychainQuery(NSDictionary* input, NSString* scope) {
  if (![input isKindOfClass:[NSDictionary class]] || !ScopeValid(scope)) return nil;
  bool identity = false;
  return Map(input, scope, false, 0, &identity);
}
NSDictionary* AuxMapKeychainUpdate(NSDictionary* input, NSString* scope) {
  if (![input isKindOfClass:[NSDictionary class]] || !ScopeValid(scope)) return nil;
  bool identity = false;
  return Map(input, scope, true, 0, &identity);
}
