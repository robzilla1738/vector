#pragma once
#include <node_api.h>
#include <memory>
#include <cstdint>

enum class AuxDevelopmentWorkerDrain { drained, pending, untracked, reentrant, wrongProcess };

// Native embedding API. Neither this type nor its methods are JS exports.
// Construction establishes only process-local ownership, NOT cohort admission.
class AuxDevelopmentWorkerHost final {
 public:
  AuxDevelopmentWorkerHost() = delete;
  // Explicit immutable native provider from genuine typed terminal preparation.
  // Token is routing/lifetime only, never JS input or cohort admission.
  explicit AuxDevelopmentWorkerHost(uint64_t prepared_fresh_provider);
  ~AuxDevelopmentWorkerHost();
  AuxDevelopmentWorkerHost(const AuxDevelopmentWorkerHost&) = delete;
  AuxDevelopmentWorkerHost& operator=(const AuxDevelopmentWorkerHost&) = delete;

  // Invoke in the actual Node environment's native bootstrap callback, on its
  // owning thread with its current V8 context. No caller-supplied PID/scope/ID.
  // Registers at most once per actual Environment, even after failure/close.
  napi_status RegisterCurrentWorker(napi_env env, napi_value target);

  // Permanently closes this host's registrations; actual Swift retirement
  // closes command admission and drains acquired synchronous calls. OS utility
  // admission is also closed; pending/untracked async work is NOT drained.
  // In-flight factory/attachment also yields pending; a late owner is retired
  // rather than published as a live command capability. No mutex crosses a
  // producer or NAPI publication callback (which may reenter native close).
  // Explicit close also closes captured current PDF and utility images process-wide.
  // Ordinary per-environment cleanup never initiates either image closure. Legacy PDF
  // images without lifetime exports, refused/late images stay untracked.
  // Native embedding must retain this object until drained before teardown.
  AuxDevelopmentWorkerDrain CloseAndDrain();
 private:
  struct State;
  std::shared_ptr<State> state_;
};
