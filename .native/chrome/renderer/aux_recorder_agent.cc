// Copyright 2026 The Aux Authors
#include "chrome/renderer/aux_recorder_agent.h"

#include <limits>
#include "base/functional/bind.h"
#include "base/strings/utf_string_conversions.h"
#include "base/uuid.h"
#include "chrome/common/chrome_isolated_world_ids.h"
#include "chrome/common/native_recorder_script.h"
#include "content/public/renderer/render_frame.h"
#include "gin/arguments.h"
#include "gin/converter.h"
#include "gin/function_template.h"
#include "third_party/blink/public/common/associated_interfaces/associated_interface_registry.h"
#include "third_party/blink/public/platform/scheduler/web_agent_group_scheduler.h"
#include "third_party/blink/public/web/web_document.h"
#include "third_party/blink/public/web/web_local_frame.h"
#include "third_party/blink/public/web/web_script_source.h"
#include "v8/include/v8-context.h"
#include "v8/include/v8-function.h"
#include "v8/include/v8-object.h"

namespace chrome {
AuxRecorderAgent::AuxRecorderAgent(content::RenderFrame* frame)
    : content::RenderFrameObserver(frame) {
  frame->GetAssociatedInterfaceRegistry()->AddInterface<mojom::AuxRecorder>(
      base::BindRepeating(&AuxRecorderAgent::Bind, weak_factory_.GetWeakPtr()));
}
AuxRecorderAgent::~AuxRecorderAgent() = default;
void AuxRecorderAgent::Bind(
    mojo::PendingAssociatedReceiver<mojom::AuxRecorder> receiver) {
  auto* frame = render_frame()->GetWebFrame();
  if (!frame || !render_frame()->IsMainFrame() || receivers_.size() >= 2) return;
  receivers_.Add(this, std::move(receiver), std::make_shared<ReceiverScope>(frame->GetDocument().Token()));
}
bool AuxRecorderAgent::Current(const std::string& id, uint64_t generation,
                              const blink::DocumentToken& document) const {
  auto* frame = render_frame()->GetWebFrame();
  return sink_.is_bound() && id_ == id && generation_ == generation &&
         document_ == document && frame && render_frame()->IsMainFrame() &&
         frame->GetDocument().Token() == document;
}
void AuxRecorderAgent::Prepare(PrepareCallback callback) {
  auto* frame = render_frame()->GetWebFrame();
  const auto scope = receivers_.current_context();
  const bool ready = frame && render_frame()->IsMainFrame() &&
                     frame->GetDocument().Token() == scope->document &&
                     !sink_.is_bound();
  scope->prepared = ready;
  std::move(callback).Run(ready);
}
void AuxRecorderAgent::Start(
    const std::string& id, uint64_t generation,
    mojo::PendingAssociatedRemote<mojom::AuxRecorderSink> sink,
    StartCallback callback) {
  auto* frame = render_frame()->GetWebFrame();
  const auto receiver_scope = receivers_.current_context();
  if (!frame || !receiver_scope->prepared || frame->GetDocument().Token() != receiver_scope->document ||
      !render_frame()->IsMainFrame() || sink_.is_bound() ||
      !generation || !base::Uuid::ParseLowercase(id).is_valid() || !sink.is_valid()) {
    std::move(callback).Run(false);
    return;
  }
  receiver_scope->prepared = false;
  id_ = id;
  generation_ = generation;
  document_ = frame->GetDocument().Token();
  sequence_ = 0;
  bytes_ = 0;
  pending_events_ = 0;
  sink_.Bind(std::move(sink));
  sink_.set_disconnect_handler(base::BindOnce(&AuxRecorderAgent::Retire,
                                             weak_factory_.GetWeakPtr(), false));
  const auto original_document = *document_;
  const auto weak = weak_factory_.GetWeakPtr();
  auto* isolate = frame->GetAgentGroupScheduler()->Isolate();
  v8::HandleScope scope(isolate);
  auto global = frame->ExecuteScriptInIsolatedWorldAndReturnValue(
      ISOLATED_WORLD_ID_AUX_RECORDER,
      blink::WebScriptSource(blink::WebString::FromUtf8("globalThis")),
      blink::BackForwardCacheAware::kAllow);
  if (!weak) { std::move(callback).Run(false); return; }
  if (!Current(id, generation, original_document) || global.IsEmpty() ||
      !global->IsObject()) {
    Retire(true);
    std::move(callback).Run(false);
    return;
  }
  auto context = global.As<v8::Object>()->GetCreationContextChecked();
  v8::Context::Scope context_scope(context);
  auto binding = gin::CreateFunctionTemplate(
      isolate, base::BindRepeating(&AuxRecorderAgent::Capture,
          weak_factory_.GetWeakPtr(), id_, generation_, *document_))
      ->GetFunction(context);
  v8::Local<v8::Function> function;
  const bool bound = binding.ToLocal(&function) &&
      context->Global()->Set(context, gin::StringToSymbol(isolate, "__auxRec"),
                             function).FromMaybe(false);
  if (!weak) { std::move(callback).Run(false); return; }
  if (!bound) {
    Retire(true);
    std::move(callback).Run(false);
    return;
  }
  if (!weak) { std::move(callback).Run(false); return; }
  if (!Current(id, generation, original_document)) {
    Retire(true);
    std::move(callback).Run(false);
    return;
  }
  auto result = frame->ExecuteScriptInIsolatedWorldAndReturnValue(
      ISOLATED_WORLD_ID_AUX_RECORDER,
      blink::WebScriptSource(blink::WebString(aux::recorder_script::kStreamingBegin)),
      blink::BackForwardCacheAware::kAllow);
  if (!weak) { std::move(callback).Run(false); return; }
  const bool accepted = !result.IsEmpty() && result->IsTrue() &&
                        Current(id, generation, original_document);
  if (!accepted) Retire(true);
  std::move(callback).Run(accepted);
}
void AuxRecorderAgent::Capture(const std::string& id, uint64_t generation,
                              const blink::DocumentToken& document,
                              gin::Arguments* args) {
  std::string step;
  if (!Current(id, generation, document)) return;
  if (!args->GetNext(&step) || args->Length() != 1 || step.size() > 16000 ||
      sequence_ == std::numeric_limits<uint64_t>::max() ||
      pending_events_ >= 50 || bytes_ + step.size() > 65536) {
    sink_->Overflow();
    Retire(false);
    return;
  }
  bytes_ += step.size();
  // Same associated RenderFrame group as FrameHost::BeginNavigation. The
  // trusted DOM listener sends this before a submit starts that navigation.
  ++pending_events_;
  sink_->Event(++sequence_, step, base::BindOnce(
      [](base::WeakPtr<AuxRecorderAgent> self, std::string id,
         uint64_t generation, blink::DocumentToken document, size_t bytes,
         bool accepted) {
        if (!self || !self->Current(id, generation, document)) return;
        if (!accepted) { self->Retire(false); return; }
        --self->pending_events_;
        self->bytes_ -= bytes;
      }, weak_factory_.GetWeakPtr(), id, generation, document, step.size()));
}
void AuxRecorderAgent::Stop(const std::string& id, uint64_t generation,
                           StopCallback callback) {
  if (!sink_.is_bound() && id_.empty() && retired_id_ == id && retired_generation_ == generation) {
    std::move(callback).Run(true);
    return;
  }
  if (!document_ || !Current(id, generation, *document_)) {
    std::move(callback).Run(false);
    return;
  }
  Retire(true);
  std::move(callback).Run(true);
}
void AuxRecorderAgent::Retire(bool notify) {
  auto* frame = render_frame()->GetWebFrame();
  const bool original = frame && document_ && frame->GetDocument().Token() == *document_;
  if (!id_.empty()) { retired_id_ = id_; retired_generation_ = generation_; }
  id_.clear(); generation_ = 0; document_.reset();
  if (notify && sink_.is_bound()) sink_->DocumentEnded();
  sink_.reset();
  if (original) frame->ExecuteScriptInIsolatedWorld(
      ISOLATED_WORLD_ID_AUX_RECORDER,
      blink::WebScriptSource(blink::WebString(aux::recorder_script::kStreamingStop)),
      blink::BackForwardCacheAware::kAllow);
}
void AuxRecorderAgent::DidCreateNewDocument() { receivers_.Clear(); Retire(true); }
void AuxRecorderAgent::WillDetach(blink::DetachReason) { receivers_.Clear(); Retire(true); }
void AuxRecorderAgent::OnDestruct() { delete this; }
}  // namespace chrome
