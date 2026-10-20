// Self-contained original-native command carrier. No replacement cryptography.
#include <CommonCrypto/CommonDigest.h>
#import <Foundation/Foundation.h>
#import <Security/Security.h>
#include <cstdlib>
#include <dlfcn.h>
#include <iostream>
#include <limits.h>
#include <string>
#include <sys/stat.h>
#include <unistd.h>
#import "agent-inbox-master-key.h"

namespace {
int Fail(const char *message) {
  // Messages are constants: never print native inputs, keys or stored values.
  std::cerr << message << '\n';
  return 1;
}
} // namespace
int main(int argc, const char *argv[]) {
  @autoreleasepool {
    using Validate = bool (*)(const void *, const void *, const void *,
                              const void *, const void *);
    auto validate = reinterpret_cast<Validate>(
        dlsym(RTLD_DEFAULT, "AuxNativeBoundaryValidate"));
    if (!validate ||
        !validate((const void *)(unsigned long)&SecItemAdd,
                  (const void *)(unsigned long)&SecItemCopyMatching,
                  (const void *)(unsigned long)&SecItemDelete,
                  (const void *)(unsigned long)&SecItemUpdate,
                  (const void *)(unsigned long)&SecKeyCreateRandomKey))
      return Fail("Aux native query boundary is not active");
    const char *home = std::getenv("AUX_HOME");
    char canonical[PATH_MAX];
    if (!home || home[0] != '/' || !realpath(home, canonical))
      return Fail("Absolute existing AUX_HOME required");
    unsigned char digest[CC_SHA256_DIGEST_LENGTH];
    CC_SHA256(canonical, static_cast<CC_LONG>(strlen(canonical)), digest);
    static const char hex[] = "0123456789abcdef";
    std::string scope;
    for (unsigned char byte : digest) {
      scope += hex[byte >> 4];
      scope += hex[byte & 15];
    }
    using Configure = bool (*)(const char *);
    auto configure = reinterpret_cast<Configure>(
        dlsym(RTLD_DEFAULT, "AuxNativeBoundaryConfigureScope"));
    if (!configure || !configure(scope.c_str()))
      return Fail("Cannot establish fixed Aux native scope");
    if (argc == 2 && std::string(argv[1]) == "--verify-boundary") {
      std::cout
          << "{\"boundaryActive\":true,\"originalBindingLoaded\":false}\n";
      return 0;
    }
    const bool verifyLoad =
        argc == 3 && std::string(argv[1]) == "--verify-load";
    const char *bindingPath =
        verifyLoad ? argv[2] : (argc == 3 ? argv[1] : nullptr);
    using Latch = void (*)();
    using IsDenied = bool (*)();
    using RefusedCalls = uint64_t (*)();
    auto latch = reinterpret_cast<Latch>(
        dlsym(RTLD_DEFAULT, "AuxNativeBoundaryDenyAll"));
    auto isDenied = reinterpret_cast<IsDenied>(
        dlsym(RTLD_DEFAULT, "AuxNativeBoundaryIsDenyAll"));
    auto refusedCalls = reinterpret_cast<RefusedCalls>(
        dlsym(RTLD_DEFAULT, "AuxNativeBoundaryRefusedCalls"));
    std::string command, input;
    if (verifyLoad) {
      if (!latch || !isDenied || !refusedCalls)
        return Fail("Deny-all boundary handshake unavailable");
      latch();
      if (!isDenied())
        return Fail("Deny-all boundary latch failed");
    } else {
      // Actual crypto remains held until isolated runtime acceptance is
      // reviewed.
      const char *accepted = std::getenv("AUX_ENABLE_PROVIDED_NATIVE_CARRIER");
      if (!accepted || std::string(accepted) != "1")
        return Fail(
            "Provided native carrier requires explicit runtime acceptance");
      if (argc != 3)
        return Fail(
            "Usage: aux-native-carrier <provided-native.node> <command>");
      command = argv[2];
      if (command != "install-status" && command != "install-init" &&
          command != "get-public-keys" && command != "cdp-sign" &&
          command != "agent-inbox-key")
        return Fail("Native carrier command is not allowed");
      if (command == "agent-inbox-key") {
        const char *accepted =
            std::getenv("AUX_ENABLE_PROVIDED_AGENT_INBOX_KEYCHAIN");
        if (!accepted || std::string(accepted) != "1")
          return Fail("Agent inbox key requires separate runtime acceptance");
      }
      for (char ch; std::cin.get(ch);) {
        if (input.size() >= 32768)
          return Fail("Native carrier input too large");
        input += ch;
      }
      NSData *inputBytes = [NSData dataWithBytes:input.data()
                                          length:input.size()];
      id payload = input.empty()
                       ? @{}
                       : [NSJSONSerialization JSONObjectWithData:inputBytes
                                                         options:0
                                                           error:nil];
      if (![payload isKindOfClass:[NSDictionary class]])
        return Fail("Native input must be a JSON object");
      if (command == "cdp-sign") {
        id challenge = payload[@"challenge"];
        if ([payload count] != 1 ||
            ![challenge isKindOfClass:[NSString class]] ||
            ![challenge length] || [challenge length] > 16384 ||
            ![[NSData alloc] initWithBase64EncodedString:challenge options:0])
          return Fail("Invalid native signing request");
      } else if ([payload count] != 0)
        return Fail("Unexpected native command input");
    }
    // No module is loaded by the boundary-only probe. Runtime loading requires
    // this exact immutable supplied binding, never an arbitrary native module.
    struct stat info;
    if (lstat(bindingPath, &info) || !S_ISREG(info.st_mode) ||
        (info.st_mode & 0022))
      return Fail(
          "Provided binding must be a regular non-shared-writable file");
    NSData *bindingBytes = [NSData
        dataWithContentsOfFile:[NSString stringWithUTF8String:bindingPath]];
    if (!bindingBytes)
      return Fail("Cannot read provided native binding");
    CC_SHA256(bindingBytes.bytes, static_cast<CC_LONG>(bindingBytes.length),
              digest);
    std::string bindingHash;
    for (unsigned char byte : digest) {
      bindingHash += hex[byte >> 4];
      bindingHash += hex[byte & 15];
    }
    if (bindingHash !=
        "bfe946e05fbaf2ae68d0560258f50e63a6c3ff6da2937e0aa8f9f19016e1f7fb")
      return Fail("Provided native binding hash mismatch");
    if (command == "agent-inbox-key") {
      NSData *key = AuxLoadAgentInboxMasterKey();
      if (!key)
        return Fail("Scoped Agent inbox key is unavailable");
      NSData *json = [NSJSONSerialization
          dataWithJSONObject:@{ @"key" : [key base64EncodedStringWithOptions:0] }
                     options:0
                       error:nil];
      if (!json)
        return Fail("Cannot encode Agent inbox key response");
      // This is the bounded private parent pipe, never a diagnostic log.
      std::cout.write(static_cast<const char *>(json.bytes), json.length);
      std::cout << '\n';
      return 0;
    }
    void *library = dlopen(bindingPath, RTLD_LAZY | RTLD_LOCAL);
    if (!library) {
      if (verifyLoad) {
        std::cout << "{\"boundaryActive\":true,\"denyAll\":true,"
                     "\"originalBindingLoaded\":false,\"exportsResolved\":"
                     "false,\"refusedSecurityCalls\":"
                  << refusedCalls() << "}\n";
        return 1;
      }
      return Fail("Cannot load provided native binding");
    }
    using Run = const char *(*)(const char *, const char *);
    using Free = void (*)(const char *);
    auto run = reinterpret_cast<Run>(dlsym(library, "AsideNativeRun"));
    auto freeResult = reinterpret_cast<Free>(dlsym(library, "AsideNativeFree"));
    if (verifyLoad) {
      const bool resolved = run && freeResult;
      dlclose(library);
      if (!isDenied())
        return Fail("Deny-all latch changed during load");
      std::cout << "{\"boundaryActive\":true,\"denyAll\":true,"
                   "\"originalBindingLoaded\":true,\"exportsResolved\":"
                << (resolved ? "true" : "false")
                << ",\"refusedSecurityCalls\":" << refusedCalls() << "}\n";
      return resolved ? 0 : 1;
    }
    if (!run || !freeResult) {
      dlclose(library);
      return Fail("Provided native command exports unavailable");
    }
    const char *result = run(command.c_str(), input.c_str());
    if (!result) {
      dlclose(library);
      return Fail("Provided native command returned no result");
    }
    std::cout << result << '\n';
    freeResult(result);
    dlclose(library);
    return 0;
  }
}
