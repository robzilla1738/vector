#include "AuxNativeNodeRunner.h"
#include <memory>
#include <optional>
#include <limits>
#if defined(AUX_BROWSER_ONLY_NATIVE_STARTUP) && AUX_BROWSER_ONLY_NATIVE_STARTUP
namespace {
// Node's embedder ESM loader supports builtins only. Run the fixed entry with
// its standard loader; a synchronous hook supplies the authenticated bytes.
constexpr char kSealedEntryBootstrap[] = R"AUXJS((function(require, process, sealedSource, sealedURL) {
  'use strict';
  const modules = require('node:module');
  const { pathToFileURL } = require('node:url');
  if (pathToFileURL(process.argv[1]).href !== sealedURL) {
    throw new Error('Aux sealed entry URL does not match the native entry');
  }
  modules.registerHooks({
    load(url, context, nextLoad) {
      if (url === sealedURL) {
        return { format: 'module', source: sealedSource, shortCircuit: true };
      }
      return nextLoad(url, context);
    }
  });
  return modules.runMain(process.argv[1]);
}))AUXJS";

v8::MaybeLocal<v8::Value> LoadSealedEntry(
    const node::StartExecutionCallbackInfo& info,
    node::CommonEnvironmentSetup& setup, const node::ModuleData& entry) {
  auto* isolate = setup.isolate();
  const auto context = setup.context();
  if (entry.format() != node::ModuleFormat::kModule || entry.source().empty() ||
      entry.source().size() > static_cast<size_t>(std::numeric_limits<int>::max()) ||
      entry.resource_name().empty() ||
      entry.resource_name().size() > static_cast<size_t>(std::numeric_limits<int>::max())) {
    isolate->ThrowException(v8::Exception::Error(
        v8::String::NewFromUtf8Literal(isolate, "Aux sealed entry is invalid")));
    return {};
  }
  v8::Local<v8::String> source, url;
  if (!v8::String::NewFromUtf8(isolate, entry.source().data(),
          v8::NewStringType::kNormal, static_cast<int>(entry.source().size())).ToLocal(&source) ||
      !v8::String::NewFromUtf8(isolate, entry.resource_name().data(),
          v8::NewStringType::kNormal, static_cast<int>(entry.resource_name().size())).ToLocal(&url)) return {};
  v8::Local<v8::Script> script;
  v8::Local<v8::Value> function;
  if (!v8::Script::Compile(context,
          v8::String::NewFromUtf8Literal(isolate, kSealedEntryBootstrap)).ToLocal(&script) ||
      !script->Run(context).ToLocal(&function)) return {};
  if (!function->IsFunction()) return {};
  v8::Local<v8::Value> arguments[] = {info.native_require, info.process_object, source, url};
  return function.As<v8::Function>()->Call(context, v8::Undefined(isolate), 4, arguments);
}
}  // namespace
#endif

extern "C" void AuxObserveDevelopmentMainLoopReturned() noexcept;

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
#if defined(AUX_BROWSER_ONLY_NATIVE_STARTUP) && AUX_BROWSER_ONLY_NATIVE_STARTUP
  const bool loaded = !node::LoadEnvironment(env,
      node::StartExecutionCallback{[&setup, &entry](const node::StartExecutionCallbackInfo& info) {
        return LoadSealedEntry(info, setup, entry);
      }}, preload.Callback()).IsEmpty();
#else
  const bool loaded =
      !node::LoadEnvironment(env, &entry, preload.Callback()).IsEmpty();
#endif
  int exit_code = loaded ? node::SpinEventLoop(env).FromMaybe(1) : 1;
  // This native stack never executes JS again after the actual event loop
  // returned. Setup remains retained through physical cleanup and clean ACK.
  if (loaded) AuxObserveDevelopmentMainLoopReturned();
  if (requested_exit->has_value()) exit_code = **requested_exit;
  const auto drain = preload.CloseAndDrain();
  if (drain == AuxDevelopmentWorkerDrain::drained) {
    node::Stop(env);
  }
  // Pending/untracked/reentrant outcomes keep native and Environment ownership
  // with the actual caller. Never destroy a setup merely because JS returned.
  return {exit_code, loaded, drain};
}
