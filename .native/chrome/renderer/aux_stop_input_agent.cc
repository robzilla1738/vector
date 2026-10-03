// Copyright 2026 The Aux Authors
#include "chrome/renderer/aux_stop_input_agent.h"
#include <limits>
#include "base/functional/bind.h"
#include "content/public/renderer/render_frame.h"
#include "gin/arguments.h"
#include "gin/function_template.h"
#include "third_party/blink/public/common/associated_interfaces/associated_interface_registry.h"
#include "third_party/blink/public/platform/scheduler/web_agent_group_scheduler.h"
#include "third_party/blink/public/platform/web_string.h"
#include "third_party/blink/public/web/web_document.h"
#include "third_party/blink/public/web/web_dom_event.h"
#include "third_party/blink/public/web/web_local_frame.h"
#include "v8/include/v8-context.h"
#include "v8/include/v8-exception.h"
#include "v8/include/v8-function.h"
#include "v8/include/v8-object.h"
#include "v8/include/v8-json.h"
#include "v8/include/v8-promise.h"

namespace chrome {
struct AuxStopInputAgent::Pending {
  v8::Global<v8::Context> context;
  v8::Global<v8::Promise::Resolver> resolver;
};
AuxStopInputAgent::AuxStopInputAgent(content::RenderFrame* frame)
    : content::RenderFrameObserver(frame) {
  frame->GetAssociatedInterfaceRegistry()->AddInterface<mojom::AuxStopInput>(
      base::BindRepeating(&AuxStopInputAgent::Bind, weak_factory_.GetWeakPtr()));
}
AuxStopInputAgent::~AuxStopInputAgent() = default;
void AuxStopInputAgent::Bind(
    mojo::PendingAssociatedReceiver<mojom::AuxStopInput> receiver) {
  if (!render_frame()->IsMainFrame() || receiver_.is_bound())
    return;
  receiver_.Bind(std::move(receiver));
  receiver_.set_disconnect_handler(base::BindOnce(&AuxStopInputAgent::Retire,
                                                   weak_factory_.GetWeakPtr()));
}
bool AuxStopInputAgent::Current(const blink::DocumentToken& original) const {
  auto* frame = render_frame()->GetWebFrame();
  return frame && render_frame()->IsMainFrame() && sink_.is_bound() &&
      document_ == original && frame->GetDocument().Token() == original;
}
void AuxStopInputAgent::Prepare(
    mojo::PendingAssociatedRemote<mojom::AuxStopInputSink> sink,
    PrepareCallback callback) {
  auto* frame = render_frame()->GetWebFrame();
  if (!frame || !render_frame()->IsMainFrame() || document_ ||
      sink_.is_bound() || !sink.is_valid()) {
    std::move(callback).Run(false);
    return;
  }
  auto* isolate = frame->GetAgentGroupScheduler()->Isolate();
  v8::HandleScope handles(isolate);
  auto context = frame->MainWorldScriptContext();
  if (context.IsEmpty()) {
    std::move(callback).Run(false);
    return;
  }
  v8::Context::Scope context_scope(context);
  const auto original = frame->GetDocument().Token();
  document_ = original;
  sink_.Bind(std::move(sink));
  sink_.set_disconnect_handler(base::BindOnce(&AuxStopInputAgent::Retire,
                                             weak_factory_.GetWeakPtr()));
  const auto weak = weak_factory_.GetWeakPtr();
  auto function = gin::CreateFunctionTemplate(isolate, base::BindRepeating(
      &AuxStopInputAgent::Stop, weak, original))->GetFunction(context);
  v8::Local<v8::Function> binding;
  const bool installed = function.ToLocal(&binding) &&
      context->Global()->CreateDataProperty(context,
          v8::String::NewFromUtf8Literal(isolate, "__auxNativeMeasuredStop"),
          binding).FromMaybe(false);
  if (!weak) {
    std::move(callback).Run(false);
    return;
  }
  const bool ready = installed && Current(original);
  if (!ready) Retire();
  std::move(callback).Run(ready);
}
void AuxStopInputAgent::Stop(const blink::DocumentToken& original,
                           gin::Arguments* args) {
  auto* isolate = args->isolate();
  auto context = isolate->GetCurrentContext();
  v8::Local<v8::Promise::Resolver> resolver;
  if (!v8::Promise::Resolver::New(context).ToLocal(&resolver))
    return;
  args->Return(resolver->GetPromise());
  v8::Local<v8::Value> event_value;
  std::string run_id;
  if (!Current(original) || args->Length() != 2 ||
      !args->GetNext(&event_value) || !args->GetNext(&run_id) ||
      run_id.empty() || run_id.size() > 160 || pending_.size() >= 8 ||
      sequence_ == std::numeric_limits<uint64_t>::max()) {
    resolver->Reject(context, v8::Exception::Error(v8::String::NewFromUtf8Literal(
        isolate, "The original Stop control is unavailable. Refresh and retry."))).FromMaybe(false);
    return;
  }
  if (!Current(original)) {
    resolver->Reject(context, v8::Exception::Error(v8::String::NewFromUtf8Literal(
        isolate, "The original Stop control changed. Refresh and retry."))).FromMaybe(false);
    return;
  }
  auto event = blink::WebDOMEvent::FromV8Value(isolate, event_value);
  const auto input = event.TakeNativeStopInputForCurrentDispatch(
      blink::WebString::FromUtf8(run_id));
  auto pending = std::make_unique<Pending>();
  pending->context.Reset(isolate, context);
  pending->resolver.Reset(isolate, resolver);
  const auto id = ++sequence_;
  pending_.emplace(id, std::move(pending));
  // The token is never returned to page script. An absent token still asks the
  // fixed browser endpoint for ordinary Stop, without measurement authority.
  sink_->Stop(input.is_empty() ? std::nullopt : std::make_optional(input), run_id,
      base::BindOnce(&AuxStopInputAgent::Complete, weak_factory_.GetWeakPtr(),
                     id, original));
}
void AuxStopInputAgent::Complete(uint64_t id,
    const blink::DocumentToken& original, bool accepted,
    const std::string& original_result_json) {
  auto found = pending_.find(id);
  if (found == pending_.end()) return;
  auto pending = std::move(found->second);
  pending_.erase(found);
  if (!Current(original)) return;
  auto* isolate = render_frame()->GetWebFrame()->GetAgentGroupScheduler()->Isolate();
  v8::HandleScope handles(isolate);
  auto context = pending->context.Get(isolate);
  v8::Context::Scope context_scope(context);
  auto resolver = pending->resolver.Get(isolate);
  // Remove original ownership before Promise callbacks can reenter the agent.
  v8::Local<v8::Value> original_result;
  v8::Local<v8::String> result_string;
  const bool parsed = accepted && original_result_json.size() <= 2 * 1024 * 1024 &&
      v8::String::NewFromUtf8(isolate, original_result_json.data(),
          v8::NewStringType::kNormal, static_cast<int>(original_result_json.size())).ToLocal(&result_string) &&
      v8::JSON::Parse(context, result_string).ToLocal(&original_result);
  if (parsed) resolver->Resolve(context, original_result).FromMaybe(false);
  else resolver->Reject(context, v8::Exception::Error(v8::String::NewFromUtf8Literal(
      isolate, "Stop could not be completed. Refresh and retry."))).FromMaybe(false);
}
void AuxStopInputAgent::Retire() {
  auto* frame = render_frame()->GetWebFrame();
  auto* isolate = frame ? frame->GetAgentGroupScheduler()->Isolate() : nullptr;
  const auto original = document_;
  document_.reset();
  sink_.reset();
  auto pending = std::move(pending_);
  pending_.clear();
  if (!isolate || !original || frame->GetDocument().Token() != *original)
    return;
  v8::HandleScope handles(isolate);
  auto live_context = frame->MainWorldScriptContext();
  if (live_context.IsEmpty()) return;
  // Retire all member ownership before any Promise hook can reenter/delete
  // this agent. The loop thereafter uses original owned locals only.
  for (auto& [id, call] : pending) {
    auto context = call->context.Get(isolate);
    if (context != live_context) continue;
    v8::Context::Scope context_scope(context);
    call->resolver.Get(isolate)->Reject(context, v8::Exception::Error(
        v8::String::NewFromUtf8Literal(isolate,
            "The original Stop control was retired. Refresh and retry."))).FromMaybe(false);
  }
}
void AuxStopInputAgent::DidCreateNewDocument() {
  const auto weak = weak_factory_.GetWeakPtr();
  Retire();
  if (weak) receiver_.reset();
}
void AuxStopInputAgent::WillDetach(blink::DetachReason) {
  const auto weak = weak_factory_.GetWeakPtr();
  Retire();
  if (weak) receiver_.reset();
}
void AuxStopInputAgent::OnDestruct() { delete this; }
}  // namespace chrome
