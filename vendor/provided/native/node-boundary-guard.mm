// Loads only the boundary. The original supplied addon is loaded by JS after
// this succeeds. No native crypto or Keychain operation is invoked here.
#include <CommonCrypto/CommonDigest.h>
#import <Foundation/Foundation.h>
#import <Security/Security.h>
#include <cstdlib>
#include <dlfcn.h>
#include <limits.h>
#include <node_api.h>
#include <string>
#include <sys/stat.h>
#include <unistd.h>

namespace {
napi_value Error(napi_env env, const char *message) {
  napi_throw_error(env, nullptr, message);
  return nullptr;
}
napi_value Prepare(napi_env env, napi_callback_info info) {
  size_t count = 2;
  napi_value arguments[2];
  if (napi_get_cb_info(env, info, &count, arguments, nullptr, nullptr) !=
          napi_ok ||
      count != 2)
    return Error(env, "Native guard requires home and load-only mode");
  size_t length = 0;
  bool deny = false;
  if (napi_get_value_string_utf8(env, arguments[0], nullptr, 0, &length) !=
          napi_ok ||
      length == 0 || length >= PATH_MAX ||
      napi_get_value_bool(env, arguments[1], &deny) != napi_ok)
    return Error(env, "Invalid native guard arguments");
  std::string home(length + 1, '\0');
  if (napi_get_value_string_utf8(env, arguments[0], home.data(), home.size(),
                                 &length) != napi_ok)
    return Error(env, "Invalid native guard home");
  home.resize(length);
  if (home.find('\0') != std::string::npos || home[0] != '/')
    return Error(env, "Absolute native guard home required");
  char canonical[PATH_MAX];
  struct stat metadata;
  if (!realpath(home.c_str(), canonical) || stat(canonical, &metadata) ||
      !S_ISDIR(metadata.st_mode) || metadata.st_uid != geteuid() ||
      (metadata.st_mode & 0022))
    return Error(env, "Owned isolated native home required");
  using Validate = bool (*)(const void *, const void *, const void *,
                            const void *, const void *);
  using Configure = bool (*)(const char *);
  using Latch = void (*)();
  using IsDenied = bool (*)();
  using Refused = uint64_t (*)();
  using Isolated = bool (*)();
  auto validate = reinterpret_cast<Validate>(
      dlsym(RTLD_DEFAULT, "AuxNativeBoundaryValidate"));
  auto configure = reinterpret_cast<Configure>(
      dlsym(RTLD_DEFAULT, "AuxNativeBoundaryConfigureScope"));
  auto latch =
      reinterpret_cast<Latch>(dlsym(RTLD_DEFAULT, "AuxNativeBoundaryDenyAll"));
  auto isDenied = reinterpret_cast<IsDenied>(
      dlsym(RTLD_DEFAULT, "AuxNativeBoundaryIsDenyAll"));
  auto refused = reinterpret_cast<Refused>(
      dlsym(RTLD_DEFAULT, "AuxNativeBoundaryRefusedCalls"));
  if (!validate || !configure || !latch || !isDenied || !refused ||
      !validate((const void *)(unsigned long)&SecItemAdd,
                (const void *)(unsigned long)&SecItemCopyMatching,
                (const void *)(unsigned long)&SecItemDelete,
                (const void *)(unsigned long)&SecItemUpdate,
                (const void *)(unsigned long)&SecKeyCreateRandomKey))
    return Error(env, "Actual native query interposition is required");
  unsigned char digest[CC_SHA256_DIGEST_LENGTH];
  CC_SHA256(canonical, static_cast<CC_LONG>(strlen(canonical)), digest);
  const char hex[] = "0123456789abcdef";
  std::string scope;
  for (unsigned char byte : digest) {
    scope += hex[byte >> 4];
    scope += hex[byte & 15];
  }
  if (!configure(scope.c_str()))
    return Error(env, "Native scope cannot change in a process");
  // Deliberately inherited by original native helper worker children. Each
  // worker independently re-derives and validates this value before requiring
  // original.
  if (setenv("AUX_HOME", canonical, 1) ||
      setenv("AUX_NATIVE_KEYCHAIN_SCOPE", scope.c_str(), 1))
    return Error(env, "Cannot establish canonical native worker scope");
  if (deny)
    latch();
  auto isolated = reinterpret_cast<Isolated>(
      dlsym(RTLD_DEFAULT, "AuxNativeBoundaryHasIsolatedKeychain"));
  if (!deny && (!isolated || !isolated()))
    return Error(env,
                 "Fresh isolated Keychain target has not been provisioned");
  if (!deny && isDenied())
    return Error(env, "Load-only process cannot enable native execution");
  napi_value result, yes, mode, calls;
  napi_create_object(env, &result);
  napi_get_boolean(env, true, &yes);
  napi_get_boolean(env, isDenied(), &mode);
  napi_create_double(env, static_cast<double>(refused()), &calls);
  napi_set_named_property(env, result, "boundaryActive", yes);
  napi_set_named_property(env, result, "denyAll", mode);
  napi_set_named_property(env, result, "refusedSecurityCalls", calls);
  return result;
}
napi_value Status(napi_env env, napi_callback_info) {
  using IsDenied = bool (*)();
  using Refused = uint64_t (*)();
  auto denied = reinterpret_cast<IsDenied>(
      dlsym(RTLD_DEFAULT, "AuxNativeBoundaryIsDenyAll"));
  auto refused = reinterpret_cast<Refused>(
      dlsym(RTLD_DEFAULT, "AuxNativeBoundaryRefusedCalls"));
  if (!denied || !refused)
    return Error(env, "Native boundary status unavailable");
  napi_value result, mode, calls;
  napi_create_object(env, &result);
  napi_get_boolean(env, denied(), &mode);
  napi_create_double(env, static_cast<double>(refused()), &calls);
  napi_set_named_property(env, result, "denyAll", mode);
  napi_set_named_property(env, result, "refusedSecurityCalls", calls);
  return result;
}
napi_value Init(napi_env env, napi_value exports) {
  napi_value prepare;
  if (napi_create_function(env, "prepare", NAPI_AUTO_LENGTH, Prepare, nullptr,
                           &prepare) != napi_ok)
    return Error(env, "Cannot expose native boundary guard");
  napi_set_named_property(env, exports, "prepare", prepare);
  napi_value status;
  if (napi_create_function(env, "status", NAPI_AUTO_LENGTH, Status, nullptr,
                           &status) != napi_ok)
    return Error(env, "Cannot expose native boundary status");
  napi_set_named_property(env, exports, "status", status);
  return exports;
}
} // namespace
NAPI_MODULE(NODE_GYP_MODULE_NAME, Init)
