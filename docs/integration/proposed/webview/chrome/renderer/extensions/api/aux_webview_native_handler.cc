// Copyright 2026 Aux Authors. All rights reserved.
#include "chrome/renderer/extensions/api/aux_webview_native_handler.h"
#include <tuple>
#include "base/functional/bind.h"
#include "content/public/renderer/render_frame.h"
#include "extensions/renderer/script_context.h"
#include "gin/converter.h"
#include "third_party/blink/public/platform/browser_interface_broker_proxy.h"
#include "third_party/blink/public/web/web_custom_element.h"
#include "third_party/blink/public/web/web_local_frame.h"
#include "v8/include/v8-function.h"
#include "v8/include/v8-promise.h"
namespace extensions {
AuxWebViewNativeHandler::AuxWebViewNativeHandler(ScriptContext* context)
    : ObjectBackedNativeHandler(context) {}
AuxWebViewNativeHandler::~AuxWebViewNativeHandler() {
  if (is_valid()) Invalidate();
}
void AuxWebViewNativeHandler::AddRoutes() {
  RouteHandlerFunction("attachTab", "auxWebViewInternal", base::BindRepeating(
      &AuxWebViewNativeHandler::Attach, base::Unretained(this)));
  RouteHandlerFunction("detach", "auxWebViewInternal", base::BindRepeating(
      &AuxWebViewNativeHandler::Detach, base::Unretained(this)));
  RouteHandlerFunction("listen", "auxWebViewInternal", base::BindRepeating(
      &AuxWebViewNativeHandler::Listen, base::Unretained(this)));
  RouteHandlerFunction("allowDefinition", "auxWebViewInternal", base::BindRepeating(
      &AuxWebViewNativeHandler::AllowDefinition, base::Unretained(this)));
}
void AuxWebViewNativeHandler::Attach(const v8::FunctionCallbackInfo<v8::Value>& args) {
  auto* isolate = GetIsolate();
  auto v8_context = context()->v8_context();
  int tab = -1;
  auto reject = [&](const char* error) {
    isolate->ThrowException(v8::Exception::Error(gin::StringToV8(isolate, error)));
  };
  if (args.Length() != 2 || !gin::ConvertFromV8(isolate, args[0], &tab) || tab < 0 ||
      !args[1]->IsObject() || pending_.size() + leases_.size() >= 8) {
    reject("Expected tab id and a local placeholder window"); return;
  }
  auto* owner = context()->GetRenderFrame();
  v8::Local<v8::Context> child_context;
  if (!owner || !owner->IsMainFrame() ||
      !args[1].As<v8::Object>()->GetCreationContext().ToLocal(&child_context)) {
    reject("Webview context is unavailable"); return;
  }
  auto* child = blink::WebLocalFrame::FrameForContext(child_context);
  if (!child || child->Parent() != owner->GetWebFrame()) {
    reject("Placeholder is not a direct local child"); return;
  }
  if (!remote_.is_bound()) {
    owner->GetBrowserInterfaceBroker().GetInterface(remote_.BindNewPipeAndPassReceiver());
    remote_.set_disconnect_handler(base::BindOnce(
        &AuxWebViewNativeHandler::Disconnected, weak_.GetWeakPtr()));
    remote_->BindClient(receiver_.BindNewPipeAndPassRemote());
  }
  auto resolver = v8::Promise::Resolver::New(v8_context).ToLocalChecked();
  const uint64_t request = ++sequence_;
  pending_.emplace(request, v8::Global<v8::Promise::Resolver>(isolate, resolver));
  args.GetReturnValue().Set(resolver->GetPromise());
  remote_->AttachTab(tab, child->GetLocalFrameToken(), base::BindOnce(
      &AuxWebViewNativeHandler::DidAttach, weak_.GetWeakPtr(), request));
}
void AuxWebViewNativeHandler::DidAttach(uint64_t request, bool success,
    const std::string& lease, const std::string& error) {
  auto it = pending_.find(request);
  if (!is_valid() || it == pending_.end()) return;
  auto* isolate = GetIsolate();
  v8::HandleScope handles(isolate);
  v8::Context::Scope scope(context()->v8_context());
  auto resolver = it->second.Get(isolate);
  if (success && !lease.empty() && !retired_.erase(lease)) {
    leases_.insert(lease);
    std::ignore = resolver->Resolve(context()->v8_context(), gin::StringToV8(isolate, lease));
  } else {
    std::ignore = resolver->Reject(context()->v8_context(), v8::Exception::Error(
        gin::StringToV8(isolate, error.empty() ? "Native tab attachment failed" : error)));
  }
  pending_.erase(it);
}
void AuxWebViewNativeHandler::Detach(const v8::FunctionCallbackInfo<v8::Value>& args) {
  std::string lease;
  if (args.Length() != 1 || !gin::ConvertFromV8(GetIsolate(), args[0], &lease) ||
      !leases_.contains(lease) || !remote_.is_bound()) return;
  remote_->Detach(lease, base::BindOnce(
      [](base::WeakPtr<AuxWebViewNativeHandler> self, std::string id, bool detached) {
        if (self) self->Detached(id);
      }, weak_.GetWeakPtr(), lease));
}
void AuxWebViewNativeHandler::Listen(const v8::FunctionCallbackInfo<v8::Value>& args) {
  if (args.Length() == 1 && args[0]->IsFunction())
    listener_.Reset(GetIsolate(), args[0].As<v8::Function>());
}
void AuxWebViewNativeHandler::AllowDefinition(const v8::FunctionCallbackInfo<v8::Value>& args) {
  if (args.Length() != 1 || !args[0]->IsFunction()) return;
  blink::WebCustomElement::EmbedderNamesAllowedScope allow;
  // This callback must be synchronous while reserved-name registration is allowed.
  std::ignore = args[0].As<v8::Function>()->Call(
      context()->v8_context(), context()->v8_context()->Global(), 0, nullptr);
}
void AuxWebViewNativeHandler::Detached(const std::string& lease) {
  if (!is_valid()) return;
  if (!leases_.erase(lease)) {
    if (retired_.size() >= 16) retired_.erase(retired_.begin());
    retired_.insert(lease);
    return;
  }
  if (listener_.IsEmpty()) return;
  auto* isolate = GetIsolate();
  v8::HandleScope handles(isolate);
  v8::Context::Scope scope(context()->v8_context());
  v8::Local<v8::Value> args[] = {gin::StringToV8(isolate, lease)};
  context()->SafeCallFunction(listener_.Get(isolate), 1, args);
}
void AuxWebViewNativeHandler::Disconnected() {
  if (!is_valid()) return;
  auto* isolate = GetIsolate();
  v8::HandleScope handles(isolate);
  v8::Context::Scope scope(context()->v8_context());
  for (auto& [id, resolver] : pending_)
    std::ignore = resolver.Get(isolate)->Reject(context()->v8_context(),
        v8::Exception::Error(gin::StringToV8(isolate, "Native embedding connection closed")));
  pending_.clear();
  const auto leases = leases_;
  for (const auto& id : leases) Detached(id);
  receiver_.reset();
  remote_.reset();
}
void AuxWebViewNativeHandler::Invalidate() {
  weak_.InvalidateWeakPtrs();
  remote_.reset();
  receiver_.reset();
  pending_.clear();
  leases_.clear();
  retired_.clear();
  listener_.Reset();
  ObjectBackedNativeHandler::Invalidate();
}
}  // namespace extensions
