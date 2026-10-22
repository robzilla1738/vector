#include "aux-owned-napi-adapter.h"
#include "../../aux-owned-dispatch-lifetime/source/aux-owned-command-dispatcher.h"
#include <atomic>
#include <memory>
#include <new>
namespace {
struct Instance {
  const uint64_t handle;
  void* const owner;
  const AuxReleaseOwnedDispatcher release_owner;
  std::atomic<unsigned> references{1};
  std::atomic<bool> closed{false};
  Instance(uint64_t h, void* o, AuxReleaseOwnedDispatcher release)
      : handle(h), owner(o), release_owner(release) {}
  void Retain() { references.fetch_add(1, std::memory_order_relaxed); }
  void Close() {
    if (!closed.exchange(true, std::memory_order_acq_rel)) {
      // Actual registry closes new calls and drains acquired calls first.
      AuxNativeContextRetire(handle);
      release_owner(owner);
    }
  }
  void Release() {
    if (references.fetch_sub(1, std::memory_order_acq_rel) == 1) delete this;
  }
};
void Finalize(napi_env, void* data, void*) {
  auto* state = static_cast<Instance*>(data);
  state->Close(); state->Release();
}
void Cleanup(void* data) {
  auto* state = static_cast<Instance*>(data);
  state->Close(); state->Release();
}
struct Lease {
  Instance* state;
  explicit Lease(Instance* value) : state(value) { state->Retain(); }
  ~Lease() { state->Release(); }
};
napi_value Fail(napi_env env, const char* text, bool type = false) {
  if (type) napi_throw_type_error(env, nullptr, text);
  else napi_throw_error(env, nullptr, text);
  return nullptr;
}
struct Input {
  std::unique_ptr<uint8_t[]> bytes;
  size_t length = 0;
};
bool Read(napi_env env, napi_value value, size_t maximum, Input* result) {
  napi_valuetype type;
  if (napi_typeof(env, value, &type) != napi_ok || type != napi_string ||
      napi_get_value_string_utf8(env, value, nullptr, 0, &result->length) != napi_ok ||
      result->length > maximum) return false;
  result->bytes.reset(new (std::nothrow) uint8_t[result->length + 1]);
  if (!result->bytes) return false;
  size_t copied = 0;
  return napi_get_value_string_utf8(env, value,
      reinterpret_cast<char*>(result->bytes.get()), result->length + 1, &copied) == napi_ok &&
      copied == result->length;
}
napi_value Run(napi_env env, napi_callback_info info) {
  size_t argc = 2;
  napi_value args[2];
  void* data = nullptr;
  if (napi_get_cb_info(env, info, &argc, args, nullptr, &data) != napi_ok || !data)
    return Fail(env, "Native dispatcher callback is unavailable");
  auto* state = static_cast<Instance*>(data); // NAPI-owned callback data, never a JS handle.
  Lease lease(state);
  if (state->closed.load(std::memory_order_acquire))
    return Fail(env, "Native dispatcher instance is closed");
  if (argc < 1) return Fail(env, "run(command, input) requires a command", true);
  Input command, input;
  if (!Read(env, args[0], 128, &command) || (argc >= 2 && !Read(env, args[1], 16384, &input)))
    return Fail(env, "run(command, input) requires bounded string arguments", true);
  using Result = std::unique_ptr<char, decltype(&AuxNativeResultFree)>;
  Result result(AuxNativeContextRun(state->handle, command.bytes.get(),
      static_cast<intptr_t>(command.length), input.bytes.get(),
      static_cast<intptr_t>(input.length)), &AuxNativeResultFree);
  if (!result) return Fail(env, "Native dispatcher returned no result");
  napi_value output;
  // The result stays a JSON STRING, preserving the actual JS JSON.parse caller.
  if (napi_create_string_utf8(env, result.get(), NAPI_AUTO_LENGTH, &output) != napi_ok)
    return nullptr; // RAII still frees the native owned result exactly once.
  return output;
}
}
napi_status AuxAttachOwnedDispatcher(napi_env env, napi_value target,
    uint64_t immutable_handle, void* retained_owner,
    AuxReleaseOwnedDispatcher release_owner) {
  if (!retained_owner || !release_owner) return napi_invalid_arg;
  if (!env || !target || immutable_handle == 0) {
    AuxNativeContextRetire(immutable_handle); release_owner(retained_owner);
    return napi_invalid_arg;
  }
  auto* state = new (std::nothrow) Instance(immutable_handle, retained_owner, release_owner);
  if (!state) {
    AuxNativeContextRetire(immutable_handle); release_owner(retained_owner);
    return napi_generic_failure;
  }
  napi_value function;
  napi_status status = napi_create_function(env, "run", NAPI_AUTO_LENGTH, Run, state, &function);
  if (status == napi_ok) {
    state->Retain();
    status = napi_add_finalizer(env, function, state, Finalize, nullptr, nullptr);
    if (status != napi_ok) state->Release();
  }
  if (status == napi_ok) {
    state->Retain();
    status = napi_add_env_cleanup_hook(env, Cleanup, state);
    if (status != napi_ok) state->Release();
  }
  if (status == napi_ok) {
    napi_property_descriptor property = {"run", nullptr, nullptr, nullptr, nullptr,
        function, static_cast<napi_property_attributes>(napi_writable | napi_enumerable | napi_configurable), nullptr};
    status = napi_define_properties(env, target, 1, &property);
  }
  if (status != napi_ok) state->Close();
  state->Release();
  return status;
}
