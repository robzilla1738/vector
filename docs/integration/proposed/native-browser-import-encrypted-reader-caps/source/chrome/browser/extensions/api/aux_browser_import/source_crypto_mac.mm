// Copyright 2026 Aux Authors. BSD-3-Clause; see //LICENSE.
// Supplied importer Safe Storage selectors; Chromium macOS v10 encryption.
#include "chrome/browser/extensions/api/aux_browser_import/source_crypto.h"

#import <AppKit/AppKit.h>
#include <CommonCrypto/CommonCryptor.h>
#include <CommonCrypto/CommonKeyDerivation.h>
#import <LocalAuthentication/LocalAuthentication.h>
#import <Security/Security.h>
#include <string.h>

#include "crypto/apple/keychain_v2.h"
#include "third_party/boringssl/src/include/openssl/mem.h"
namespace aux_import {
namespace {
// Original 426abd0 supplies both selectors to KeychainV2::FindGenericPassword.
// Keep the separate historical Edge path until its original migrator is known.
struct SafeStorageSelectors {
  const char* service;
  const char* account;
};
std::optional<SafeStorageSelectors> SuppliedSelectors(std::string_view source) {
  if (source == "arc") {
    return SafeStorageSelectors{"Arc Safe Storage", "Arc"};
  }
  if (source == "brave") {
    return SafeStorageSelectors{"Brave Safe Storage", "Brave"};
  }
  if (source == "chrome") {
    return SafeStorageSelectors{"Chrome Safe Storage", "Chrome"};
  }
  if (source == "comet") {
    return SafeStorageSelectors{"Comet Safe Storage", "Comet"};
  }
  if (source == "dia") {
    return SafeStorageSelectors{"Dia Safe Storage", "Dia"};
  }
  if (source == "helium") {
    return SafeStorageSelectors{"Helium Storage Key", "Helium"};
  }
  return std::nullopt;
}
const char* Service(std::string_view source) {
  if (auto selectors = SuppliedSelectors(source)) {
    return selectors->service;
  }
  if (source == "edge") {
    return "Microsoft Edge Safe Storage";
  }
  return nullptr;
}
}  // namespace
bool SupportsSourceKey(std::string_view source) {
  return Service(source);
}
bool InstalledSourceApplication(std::string_view source) {
  @autoreleasepool {
    // Original42653d0 probes these exact named .app directories, then checks
    // NSBundle.bundleIdentifier (or its Info.plist fallback). LaunchServices
    // discovery by bundle ID alone admits apps the supplied chooser omits.
    struct Application {
      std::string_view id;
      const char* name;
      const char* bundle;
    };
    static constexpr Application applications[] = {
        {"chrome", "Google Chrome", "com.google.Chrome"},
        {"brave", "Brave Browser", "com.brave.Browser"},
        {"safari", "Safari", "com.apple.Safari"},
        {"firefox", "Firefox", "org.mozilla.firefox"},
        {"arc", "Arc", "company.thebrowser.Browser"},
        {"atlas", "ChatGPT Atlas", "com.openai.atlas"},
        {"comet", "Comet", "ai.perplexity.comet"},
        {"dia", "Dia", "company.thebrowser.dia"},
        {"helium", "Helium", "net.imput.helium"},
    };
    for (const auto& application : applications) {
      if (application.id != source) {
        continue;
      }
      NSString* name = [NSString stringWithUTF8String:application.name];
      if (![name hasSuffix:@".app"]) {
        name = [name stringByAppendingString:@".app"];
      }
      NSString* expected = [NSString stringWithUTF8String:application.bundle];
      for (NSString* parent in @[
             @"/Applications",
             [NSHomeDirectory() stringByAppendingPathComponent:@"Applications"],
             @"/System/Applications"
           ]) {
        NSString* path = [parent stringByAppendingPathComponent:name];
        BOOL directory = NO;
        if (![[NSFileManager defaultManager] fileExistsAtPath:path
                                                 isDirectory:&directory] ||
            !directory) {
          continue;
        }
        NSString* identifier = [NSBundle bundleWithPath:path].bundleIdentifier;
        if (!identifier.length) {
          NSDictionary* info = [NSDictionary
              dictionaryWithContentsOfFile:
                  [path stringByAppendingPathComponent:@"Contents/Info.plist"]];
          id value = info[@"CFBundleIdentifier"];
          if ([value isKindOfClass:[NSString class]]) {
            identifier = value;
          }
        }
        if ([identifier isEqualToString:expected]) {
          return true;
        }
      }
      return false;
    }
    return false;
  }
}
SourceKey DeriveSourceKey(std::string_view password) {
  SourceKey key{};
  constexpr unsigned char salt[] = {'s', 'a', 'l', 't', 'y',
                                    's', 'a', 'l', 't'};
  CCKeyDerivationPBKDF(kCCPBKDF2, password.data(), password.size(), salt,
                       sizeof(salt), kCCPRFHmacAlgSHA1, 1003, key.data(),
                       key.size());
  return key;
}
SourceKey::~SourceKey() {
  ClearSourceKey(*this);
}
void ClearSourceKey(SourceKey& key) {
  OPENSSL_cleanse(key.data(), key.size());
}
std::optional<SourceKey> AuthorizeSourceKey(std::string_view source,
                                            std::string& error) {
  @autoreleasepool {
    if (auto selectors = SuppliedSelectors(source)) {
      auto password = crypto::apple::KeychainV2::GetInstance().FindGenericPassword(
          selectors->service, selectors->account);
      if (!password.has_value()) {
        error = "Source Safe Storage permission was denied or its credential is "
                "unavailable";
        return {};
      }
      if (password->empty() || password->size() > 4096) {
        OPENSSL_cleanse(password->data(), password->size());
        error = "Source Safe Storage credential is invalid";
        return {};
      }
      auto key = DeriveSourceKey(std::string_view(
          reinterpret_cast<const char*>(password->data()), password->size()));
      OPENSSL_cleanse(password->data(), password->size());
      return key;
    }
    const auto* service = Service(source);
    if (!service) {
      error = "Source Safe Storage format is not supported";
      return {};
    }
    LAContext* context = [[LAContext alloc] init];
    context.interactionNotAllowed = NO;
    NSDictionary* query = @{
      (__bridge id)kSecClass : (__bridge id)kSecClassGenericPassword,
      (__bridge id)kSecAttrService : [NSString stringWithUTF8String:service],
      (__bridge id)kSecMatchLimit : (__bridge id)kSecMatchLimitOne,
      (__bridge id)kSecReturnData : @YES,
      (__bridge id)kSecUseAuthenticationContext : context,
    };
    CFTypeRef result = nullptr;
    const OSStatus status =
        SecItemCopyMatching((__bridge CFDictionaryRef)query, &result);
    if (status != errSecSuccess || !result ||
        CFGetTypeID(result) != CFDataGetTypeID()) {
      if (result) {
        CFRelease(result);
      }
      error = "Source Safe Storage permission was denied or its credential is "
              "unavailable";
      return {};
    }
    auto data = static_cast<CFDataRef>(result);
    const auto length = CFDataGetLength(data);
    if (length <= 0 || length > 4096) {
      CFRelease(result);
      error = "Source Safe Storage credential is invalid";
      return {};
    }
    auto key = DeriveSourceKey(std::string_view(
        reinterpret_cast<const char*>(CFDataGetBytePtr(data)), length));
    CFRelease(result);
    return key;
  }
}
std::optional<std::string> DecryptSourceValue(std::string_view ciphertext,
                                              const SourceKey& key) {
  if (!ciphertext.starts_with("v10") || ciphertext.size() <= 3 ||
      (ciphertext.size() - 3) % 16) {
    return {};
  }
  const auto payload = ciphertext.substr(3);
  std::string plaintext(payload.size(), '\0');
  std::array<unsigned char, 16> iv;
  iv.fill(' ');
  size_t size = 0;
  const auto status =
      CCCrypt(kCCDecrypt, kCCAlgorithmAES, kCCOptionPKCS7Padding, key.data(),
              key.size(), iv.data(), payload.data(), payload.size(),
              plaintext.data(), plaintext.size(), &size);
  if (status != kCCSuccess) {
    OPENSSL_cleanse(plaintext.data(), plaintext.size());
    return {};
  }
  plaintext.resize(size);
  return plaintext;
}
}  // namespace aux_import
