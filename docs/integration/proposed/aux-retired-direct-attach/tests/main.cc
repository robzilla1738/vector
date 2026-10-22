#include "aux-development-host-attach.h"
#include <cassert>
#include <cstdint>
int main() {
  assert(AuxAttachSignedDevelopmentDispatcher(nullptr, nullptr)==napi_invalid_arg);
  // Invalid opaque placeholders must never be dereferenced or used to enter
  // Node/protected producers. They grant nothing and are always refused.
  auto env=reinterpret_cast<napi_env>(uintptr_t{1});
  auto value=reinterpret_cast<napi_value>(uintptr_t{1});
  assert(AuxAttachSignedDevelopmentDispatcher(env,nullptr)==napi_invalid_arg);
  assert(AuxAttachSignedDevelopmentDispatcher(nullptr,value)==napi_invalid_arg);
  assert(AuxAttachSignedDevelopmentDispatcher(env,value)==napi_generic_failure);
  assert(AuxAttachSignedDevelopmentDispatcher(env,value)==napi_generic_failure);
}
