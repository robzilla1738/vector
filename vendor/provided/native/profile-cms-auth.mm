// Read-only CMS authentication. No SecItem/SecKey, signing, provisioning or network.
#import <Foundation/Foundation.h>
#import <Security/Security.h>
#import <Security/CMSDecoder.h>
#import <CommonCrypto/CommonDigest.h>
#include <dlfcn.h>
#include <unistd.h>
#include <cstdio>
#include <cstdlib>
#include <cstring>
#include <initializer_list>

static constexpr size_t kLimit = 2 * 1024 * 1024;
static NSString* Digest(NSData* data) {
  unsigned char digest[CC_SHA256_DIGEST_LENGTH];
  CC_SHA256(data.bytes, (CC_LONG)data.length, digest);
  NSMutableString* text = [NSMutableString string];
  for (unsigned char byte : digest) [text appendFormat:@"%02x", byte];
  return text;
}
static int Refuse(NSString* stage, OSStatus status = 0) {
  NSDictionary* reply = @{@"version": @1, @"authenticated": @NO,
    @"stage": stage, @"osStatus": @(status), @"signingAuthorized": @NO};
  NSData* json = [NSJSONSerialization dataWithJSONObject:reply options:0 error:nullptr];
  fwrite(json.bytes, 1, json.length, stdout); fputc('\n', stdout); return 1;
}
// Only plist types; dates/data have explicit representations expected by JS gate.
static id Normalize(id value, unsigned depth) {
  if (depth > 32) return nil;
  if ([value isKindOfClass:NSString.class] || [value isKindOfClass:NSNumber.class]) return value;
  if ([value isKindOfClass:NSData.class]) return [value base64EncodedStringWithOptions:0];
  if ([value isKindOfClass:NSDate.class]) {
    NSISO8601DateFormatter* formatter = [NSISO8601DateFormatter new];
    return [formatter stringFromDate:value];
  }
  if ([value isKindOfClass:NSArray.class]) {
    NSMutableArray* out = [NSMutableArray array];
    for (id item in value) { id normalized = Normalize(item, depth + 1); if (!normalized) return nil; [out addObject:normalized]; }
    return out;
  }
  if ([value isKindOfClass:NSDictionary.class]) {
    NSMutableDictionary* out = [NSMutableDictionary dictionary];
    for (id key in value) {
      if (![key isKindOfClass:NSString.class]) return nil;
      id normalized = Normalize(value[key], depth + 1); if (!normalized) return nil; out[key] = normalized;
    }
    return out;
  }
  return nil;
}
int main(int argc, const char* argv[]) { @autoreleasepool {
  if (argc != 2 || strcmp(argv[1], "--authenticated-json") != 0) return Refuse(@"usage");
  // Do not accept injected trust/policy implementations in this standalone tool.
  for (const char* name : {"DYLD_INSERT_LIBRARIES", "DYLD_LIBRARY_PATH", "DYLD_FRAMEWORK_PATH"})
    if (getenv(name)) return Refuse(@"injected-environment");
  alarm(15);
  NSMutableData* message = [NSMutableData data]; unsigned char bytes[16384];
  for (;;) { ssize_t n = read(STDIN_FILENO, bytes, sizeof(bytes)); if (n < 0) return Refuse(@"read"); if (!n) break;
    if (message.length + (size_t)n > kLimit) return Refuse(@"input-limit"); [message appendBytes:bytes length:(NSUInteger)n]; }
  if (!message.length) return Refuse(@"empty-input");
  // Apple exports this registry identifier, though it is not public SDK API.
  // Resolve the real policy; never guess an OID or fall back to BasicX509.
  auto symbol = static_cast<CFStringRef*>(dlsym(RTLD_DEFAULT, "kSecPolicyAppleOSXProvisioningProfileSigning"));
  if (!symbol || !*symbol || CFGetTypeID(*symbol) != CFStringGetTypeID()) return Refuse(@"apple-profile-policy-unavailable");
  SecPolicyRef apple = SecPolicyCreateWithProperties(*symbol, nullptr);
  if (!apple) return Refuse(@"apple-profile-policy-unsupported");
  CFDictionaryRef properties = SecPolicyCopyProperties(apple);
  CFTypeRef identifier = properties ? CFDictionaryGetValue(properties, kSecPolicyOid) : nullptr;
  bool exact = identifier && CFEqual(identifier, *symbol);
  if (properties) CFRelease(properties);
  if (!exact) { CFRelease(apple); return Refuse(@"apple-profile-policy-mismatch"); }
  SecPolicyRef revocation = SecPolicyCreateRevocation(kSecRevocationOCSPMethod |
    kSecRevocationRequirePositiveResponse | kSecRevocationNetworkAccessDisabled);
  if (!revocation) { CFRelease(apple); return Refuse(@"offline-revocation-policy"); }
  const void* policies[] = {apple, revocation};
  CFArrayRef policyArray = CFArrayCreate(nullptr, policies, 2, &kCFTypeArrayCallBacks);
  CMSDecoderRef decoder = nullptr; SecTrustRef trust = nullptr; CFDataRef content = nullptr;
  OSStatus status = CMSDecoderCreate(&decoder);
  NSString* stage = @"cms-create"; bool authenticated = false;
  do {
    if (status) break;
    stage = @"cms-decode"; status = CMSDecoderUpdateMessage(decoder, message.bytes, message.length); if (status) break;
    status = CMSDecoderFinalizeMessage(decoder); if (status) break;
    size_t signers = 0; stage = @"cms-signer-count"; status = CMSDecoderGetNumSigners(decoder, &signers); if (status || signers != 1) break;
    CMSSignerStatus signer = kCMSSignerUnsigned; OSStatus unused = 0;
    stage = @"cms-signature";
    status = CMSDecoderCopySignerStatus(decoder, 0, policyArray, false, &signer, &trust, &unused);
    if (status || signer != kCMSSignerValid || !trust) break;
    stage = @"offline-trust-config";
    status = SecTrustSetPolicies(trust, policyArray); if (status) break;
    status = SecTrustSetNetworkFetchAllowed(trust, false); if (status) break;
    Boolean fetchAllowed = true; status = SecTrustGetNetworkFetchAllowed(trust, &fetchAllowed); if (status || fetchAllowed) break;
    stage = @"apple-profile-offline-trust"; CFErrorRef error = nullptr;
    bool trusted = SecTrustEvaluateWithError(trust, &error);
    if (error) { status = (OSStatus)CFErrorGetCode(error); CFRelease(error); }
    if (!trusted) break;
    stage = @"authenticated-content"; status = CMSDecoderCopyContent(decoder, &content);
    if (status || !content || CFDataGetLength(content) <= 0 || CFDataGetLength(content) > (CFIndex)kLimit) break;
    authenticated = true;
  } while (false);
  CFRelease(policyArray); CFRelease(apple); CFRelease(revocation);
  if (trust) CFRelease(trust); if (decoder) CFRelease(decoder);
  if (!authenticated) { if (content) CFRelease(content); return Refuse(stage, status); }
  NSData* payload = CFBridgingRelease(content);
  id profile = [NSPropertyListSerialization propertyListWithData:payload options:NSPropertyListImmutable format:nullptr error:nullptr];
  if (![profile isKindOfClass:NSDictionary.class]) return Refuse(@"profile-plist");
  id normalized = Normalize(profile, 0); if (!normalized) return Refuse(@"profile-types");
  NSDictionary* reply = @{@"version": @1, @"authenticated": @YES,
    @"policy": @"AppleOSXProvisioningProfileSigning", @"offline": @YES,
    @"positiveRevocationRequired": @YES, @"cmsSha256": Digest(message),
    @"payloadSha256": Digest(payload), @"profile": normalized, @"signingAuthorized": @NO};
  NSData* json = [NSJSONSerialization dataWithJSONObject:reply options:0 error:nullptr];
  if (!json || json.length > kLimit * 3) return Refuse(@"output-limit");
  fwrite(json.bytes, 1, json.length, stdout); fputc('\n', stdout); return 0;
} }
