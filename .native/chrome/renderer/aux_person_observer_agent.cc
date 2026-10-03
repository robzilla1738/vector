// Copyright 2026 The Aux Authors
#include "chrome/renderer/aux_person_observer_agent.h"

#include <optional>
#include "base/functional/bind.h"
#include "base/json/json_reader.h"
#include "base/json/json_writer.h"
#include "base/strings/utf_string_conversions.h"
#include "base/uuid.h"
#include "chrome/common/chrome_isolated_world_ids.h"
#include "chrome/common/native_person_observer_script.h"
#include "content/public/renderer/render_frame.h"
#include "gin/converter.h"
#include "third_party/blink/public/common/associated_interfaces/associated_interface_registry.h"
#include "third_party/blink/public/platform/scheduler/web_agent_group_scheduler.h"
#include "third_party/blink/public/web/web_document.h"
#include "third_party/blink/public/web/web_local_frame.h"
#include "third_party/blink/public/web/web_script_source.h"
#include "v8/include/v8-primitive.h"

namespace chrome {
AuxPersonObserverAgent::AuxPersonObserverAgent(content::RenderFrame* frame)
    : content::RenderFrameObserver(frame) {
  frame->GetAssociatedInterfaceRegistry()->AddInterface<mojom::AuxPersonObserver>(
      base::BindRepeating(&AuxPersonObserverAgent::Bind,
                         weak_factory_.GetWeakPtr()));
}
AuxPersonObserverAgent::~AuxPersonObserverAgent() = default;
bool AuxPersonObserverAgent::Current(const blink::DocumentToken& document) const {
  auto* frame = render_frame()->GetWebFrame();
  return frame && render_frame()->IsMainFrame() &&
         frame->GetDocument().Token() == document;
}
void AuxPersonObserverAgent::Bind(
    mojo::PendingAssociatedReceiver<mojom::AuxPersonObserver> receiver) {
  auto* frame = render_frame()->GetWebFrame();
  if (!frame || !render_frame()->IsMainFrame() || receivers_.size() >= 4)
    return;
  receivers_.Add(this, std::move(receiver),
                 std::make_shared<Scope>(frame->GetDocument().Token()));
}
void AuxPersonObserverAgent::Prepare(const std::string& read_id,
                                    PrepareCallback callback) {
  const auto scope = receivers_.current_context();
  const bool ready = Current(scope->document) && scope->prepared_id.empty() &&
                    base::Uuid::ParseLowercase(read_id).is_valid();
  if (ready)
    scope->prepared_id = read_id;
  std::move(callback).Run(ready);
}
void AuxPersonObserverAgent::Read(const std::string& read_id,
                                 const std::string& request_json,
                                 ReadCallback callback) {
  const auto scope = receivers_.current_context();
  const bool admitted = Current(scope->document) &&
                        !read_id.empty() && scope->prepared_id == read_id;
  scope->prepared_id.clear();
  if (!admitted || request_json.size() > 16384) {
    std::move(callback).Run(false, "");
    return;
  }
  auto request = base::JSONReader::ReadDict(request_json, base::JSON_PARSE_RFC);
  auto canonical = request ? base::WriteJson(*request) : std::nullopt;
  if (!canonical) {
    std::move(callback).Run(false, "");
    return;
  }
  const auto document = scope->document;
  const auto weak = weak_factory_.GetWeakPtr();
  auto* frame = render_frame()->GetWebFrame();
  auto* isolate = frame->GetAgentGroupScheduler()->Isolate();
  v8::HandleScope handle_scope(isolate);
  if (!Current(document)) {
    std::move(callback).Run(false, "");
    return;
  }
  const std::u16string script =
      std::u16string(aux::person_observer_script::kRead) + u"(" +
      base::UTF8ToUTF16(*canonical) + u")";
  auto result = frame->ExecuteScriptInIsolatedWorldAndReturnValue(
      ISOLATED_WORLD_ID_AUX_OBSERVER,
      blink::WebScriptSource(blink::WebString(script)),
      blink::BackForwardCacheAware::kAllow);
  if (!weak || !Current(document) || result.IsEmpty() || !result->IsString() ||
      result.As<v8::String>()->Length() > 131072) {
    std::move(callback).Run(false, "");
    return;
  }
  std::string raw;
  const bool accepted = gin::ConvertFromV8(isolate, result, &raw) &&
                        raw.size() <= 131072 && Current(document);
  std::move(callback).Run(accepted, accepted ? raw : "");
}
void AuxPersonObserverAgent::DidCreateNewDocument() { receivers_.Clear(); }
void AuxPersonObserverAgent::WillDetach(blink::DetachReason) { receivers_.Clear(); }
void AuxPersonObserverAgent::OnDestruct() { delete this; }
}  // namespace chrome
