#include "AuxNativeNodeRunner.h"
#include <memory>
#include <optional>

AuxNativeNodeRunResult RunAuxNativeNodeEnvironment(
    node::CommonEnvironmentSetup& setup, const node::ModuleData& entry,
    AuxNativeEnvironmentPreload& preload) {
  auto* isolate = setup.isolate();
  auto* env = setup.env();
  // process.exit must stop this Environment rather than dispose the embedding
  // process's V8/platform or bypass native owner accounting. Shared storage
  // outlives this stack frame if the caller must retain an unresolved setup.
  auto requested_exit = std::make_shared<std::optional<int>>();
  node::SetProcessExitHandler(env, [requested_exit](node::Environment* actual,
                                                  int code) {
    if (!requested_exit->has_value()) *requested_exit = code;
    node::Stop(actual);
  });

  v8::Locker locker(isolate);
  v8::Isolate::Scope isolate_scope(isolate);
  v8::HandleScope handle_scope(isolate);
  v8::Context::Scope context_scope(setup.context());
  const bool loaded =
      !node::LoadEnvironment(env, &entry, preload.Callback()).IsEmpty();
  int exit_code = loaded ? node::SpinEventLoop(env).FromMaybe(1) : 1;
  if (requested_exit->has_value()) exit_code = **requested_exit;
  const auto drain = preload.CloseAndDrain();
  if (drain == AuxDevelopmentWorkerDrain::drained) {
    node::Stop(env);
  }
  // Pending/untracked/reentrant outcomes keep native and Environment ownership
  // with the actual caller. Never destroy a setup merely because JS returned.
  return {exit_code, loaded, drain};
}
