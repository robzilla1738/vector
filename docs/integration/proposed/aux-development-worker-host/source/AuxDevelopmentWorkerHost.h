#pragma once
#include <node_api.h>
#include <memory>

enum class AuxDevelopmentWorkerDrain { drained, pending, untracked, reentrant, wrongProcess };

// Native embedding API. Neither this type nor its methods are JS exports.
// Construction establishes only process-local ownership, NOT cohort admission.
class AuxDevelopmentWorkerHost final {
 public:
  AuxDevelopmentWorkerHost();
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
  // Explicit close also closes the captured current PDF image process-wide.
  // Ordinary per-environment cleanup never initiates PDF closure. Legacy PDF
  // images without lifetime exports, refused/late images stay untracked.
  // Native embedding must retain this object until drained before teardown.
  AuxDevelopmentWorkerDrain CloseAndDrain();
 private:
  struct State;
  std::shared_ptr<State> state_;
};
