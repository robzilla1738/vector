// Self-contained original-native command carrier. No replacement cryptography.
#import <Foundation/Foundation.h>
#import <Security/Security.h>
#include <CommonCrypto/CommonDigest.h>
#include <dlfcn.h>
#include <cstdlib>
#include <iostream>
#include <limits.h>
#include <string>
#include <unistd.h>
#include <sys/stat.h>

namespace {
int Fail(const char* message) {
  // Messages are constants: never print native inputs, keys or stored values.
  std::cerr << message << '\n';
  return 1;
}
}
int main(int argc, const char* argv[]) {
  @autoreleasepool {
    using Validate = bool (*)(const void*, const void*, const void*, const void*, const void*);
    auto validate = reinterpret_cast<Validate>(dlsym(RTLD_DEFAULT, "AuxNativeBoundaryValidate"));
    if (!validate || !validate((const void*)(unsigned long)&SecItemAdd,
                              (const void*)(unsigned long)&SecItemCopyMatching,
                              (const void*)(unsigned long)&SecItemDelete,
                              (const void*)(unsigned long)&SecItemUpdate,
                              (const void*)(unsigned long)&SecKeyCreateRandomKey))
      return Fail("Aux native query boundary is not active");
    const char* home = std::getenv("AUX_HOME");
    char canonical[PATH_MAX];
    if (!home || home[0] != '/' || !realpath(home, canonical))
      return Fail("Absolute existing AUX_HOME required");
    unsigned char digest[CC_SHA256_DIGEST_LENGTH];
    CC_SHA256(canonical, static_cast<CC_LONG>(strlen(canonical)), digest);
    static const char hex[] = "0123456789abcdef";
    std::string scope;
    for (unsigned char byte : digest) { scope += hex[byte >> 4]; scope += hex[byte & 15]; }
    if (setenv("AUX_NATIVE_KEYCHAIN_SCOPE", scope.c_str(), 1)) return Fail("Cannot set Aux native scope");
    if (argc == 2 && std::string(argv[1]) == "--verify-boundary") {
      std::cout << "{\"boundaryActive\":true,\"originalBindingLoaded\":false}\n";
      return 0;
    }
    // Runtime invocation is intentionally held behind an explicit acceptance
    // switch until original-module coverage and isolated Keychain behavior pass.
    if (!std::getenv("AUX_ENABLE_PROVIDED_NATIVE_CARRIER") ||
        std::string(std::getenv("AUX_ENABLE_PROVIDED_NATIVE_CARRIER")) != "1")
      return Fail("Provided native carrier requires explicit runtime acceptance");
    if (argc != 3) return Fail("Usage: aux-native-carrier <provided-native.node> <command>");
    const std::string command = argv[2];
    if (command != "install-status" && command != "install-init" &&
        command != "get-public-keys" && command != "cdp-sign")
      return Fail("Native carrier command is not allowed");
    std::string input;
    for (char ch; std::cin.get(ch); ) {
      if (input.size() >= 32768) return Fail("Native carrier input too large");
      input += ch;
    }
    NSData* inputBytes = [NSData dataWithBytes:input.data() length:input.size()];
    id payload = input.empty() ? @{} : [NSJSONSerialization JSONObjectWithData:inputBytes options:0 error:nil];
    if (![payload isKindOfClass:[NSDictionary class]]) return Fail("Native input must be a JSON object");
    if (command == "cdp-sign") {
      id challenge = payload[@"challenge"];
      if ([payload count] != 1 || ![challenge isKindOfClass:[NSString class]] || [challenge length] > 16384 ||
          ![[NSData alloc] initWithBase64EncodedString:challenge options:0])
        return Fail("Invalid native signing request");
    } else if ([payload count] != 0) return Fail("Unexpected native command input");
    // No module is loaded by the boundary-only probe. Runtime loading requires
    // this exact immutable supplied binding, never an arbitrary native module.
    struct stat info;
    if (lstat(argv[1], &info) || !S_ISREG(info.st_mode) || (info.st_mode & 0022))
      return Fail("Provided binding must be a regular non-shared-writable file");
    NSData* bindingBytes = [NSData dataWithContentsOfFile:[NSString stringWithUTF8String:argv[1]]];
    if (!bindingBytes) return Fail("Cannot read provided native binding");
    CC_SHA256(bindingBytes.bytes, static_cast<CC_LONG>(bindingBytes.length), digest);
    std::string bindingHash;
    for (unsigned char byte : digest) { bindingHash += hex[byte >> 4]; bindingHash += hex[byte & 15]; }
    if (bindingHash != "bfe946e05fbaf2ae68d0560258f50e63a6c3ff6da2937e0aa8f9f19016e1f7fb")
      return Fail("Provided native binding hash mismatch");
    void* library = dlopen(argv[1], RTLD_LAZY | RTLD_LOCAL);
    if (!library) return Fail("Cannot load provided native binding");
    using Run = const char* (*)(const char*, const char*);
    using Free = void (*)(const char*);
    auto run = reinterpret_cast<Run>(dlsym(library, "AsideNativeRun"));
    auto freeResult = reinterpret_cast<Free>(dlsym(library, "AsideNativeFree"));
    if (!run || !freeResult) { dlclose(library); return Fail("Provided native command exports unavailable"); }
    const char* result = run(command.c_str(), input.c_str());
    if (!result) { dlclose(library); return Fail("Provided native command returned no result"); }
    std::cout << result << '\n';
    freeResult(result);
    dlclose(library);
    return 0;
  }
}
