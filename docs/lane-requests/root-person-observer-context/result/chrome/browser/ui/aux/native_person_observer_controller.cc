// Copyright 2026 The Aux Authors
#include "chrome/browser/ui/aux/native_person_observer_controller.h"

#include <set>
#include <string_view>
#include <utility>
#include "base/functional/bind.h"
#include "base/json/json_reader.h"
#include "base/json/json_writer.h"
#include "base/strings/string_util.h"
#include "base/uuid.h"
#include "chrome/browser/profiles/profile.h"
#include "chrome/common/native_person_observer_script.h"
#include "content/public/browser/navigation_handle.h"
#include "content/public/browser/document_user_data.h"
#include "content/public/browser/render_frame_host.h"
#include "content/public/browser/web_contents.h"
#include "third_party/blink/public/common/associated_interfaces/associated_interface_provider.h"

namespace aux {
namespace {
class PersonReadDocument : public content::DocumentUserData<PersonReadDocument> {
 public:
  const std::string id = base::Uuid::GenerateRandomV4().AsLowercaseString();
  std::string connection_id;
  std::string session_id;
  std::string control_generation;
  std::string retirement_generation;
  ~PersonReadDocument() override = default;
 private:
  explicit PersonReadDocument(content::RenderFrameHost* frame)
      : DocumentUserData(frame) {}
  friend class content::DocumentUserData<PersonReadDocument>;
  DOCUMENT_USER_DATA_KEY_DECL();
};
DOCUMENT_USER_DATA_KEY_IMPL(PersonReadDocument);
base::DictValue Fault(const char* code) {
  return base::DictValue().Set("error", base::DictValue()
      .Set("code", code).Set("message", "This page could not be read. Try again."));
}
bool OnlyKeys(const base::DictValue& value,
              const std::set<std::string_view>& allowed) {
  for (const auto [key, field] : value) {
    if (!allowed.contains(key)) return false;
  }
  return true;
}
bool ValidRequest(const base::DictValue& request) {
  const auto* operation = request.FindString("operation");
  if (!operation) return false;
  if (*operation == "observe") {
    const auto elements = request.FindInt("maxElements");
    const auto text = request.FindInt("maxTextChars");
    const auto* filter = request.FindString("filter");
    const auto* subtree = request.FindString("subtreeRef");
    return OnlyKeys(request, {"operation", "maxElements", "maxTextChars", "filter", "subtreeRef"}) &&
           (!request.contains("filter") ||
            (filter && (*filter == "interactive" || *filter == "all" || *filter == "viewport"))) &&
           (!request.contains("subtreeRef") || (subtree && !subtree->empty() && subtree->size() <= 512)) &&
           elements && *elements >= 1 && *elements <= 200 &&
           text && *text >= 1 && *text <= 16000;
  }
  if (*operation != "extract" || !OnlyKeys(request, {"operation", "fields"}))
    return false;
  const auto* fields = request.FindList("fields");
  if (!fields || fields->empty() || fields->size() > 20) return false;
  std::set<std::string> names;
  const std::set<std::string_view> attributes = {
      "href", "title", "alt", "aria-label", "name", "id", "role"};
  for (const auto& entry : *fields) {
    const auto* field = entry.GetIfDict();
    if (!field || !OnlyKeys(*field, {"name", "selector", "attribute", "all"}))
      return false;
    const auto* name = field->FindString("name");
    if (!name || name->empty() || name->size() > 64 ||
        !base::IsAsciiAlpha((*name)[0]) || !names.insert(*name).second)
      return false;
    for (const char c : *name) {
      if (!base::IsAsciiAlphaNumeric(c) && c != '_' && c != '-') return false;
    }
    const auto* selector = field->FindString("selector");
    if (field->contains("selector") &&
        (!selector || selector->empty() || selector->size() > 512)) return false;
    const auto* attribute = field->FindString("attribute");
    if (field->contains("attribute") &&
        (!selector || !attribute || !attributes.contains(*attribute))) return false;
    if (field->contains("all") && (!selector || !field->FindBool("all")))
      return false;
  }
  return true;
}
}  // namespace
WEB_CONTENTS_USER_DATA_KEY_IMPL(NativePersonObserverController);
base::DictValue NativePersonObserverController::Describe(
    const NativePersonReadReceipt& receipt, const std::string& connection_id) {
  auto* frame = receipt.document().AsRenderFrameHostIfValid();
  if (!frame || !base::Uuid::ParseLowercase(connection_id).is_valid())
    return Fault("target_detached");
  auto* profile = Profile::FromBrowserContext(frame->GetBrowserContext());
  if (!profile || !EgressController::ForProfile(profile)->MayReadPerson(receipt))
    return Fault("target_detached");
  auto* document = PersonReadDocument::GetOrCreateForCurrentDocument(frame);
  if (document->connection_id != connection_id ||
      document->control_generation != receipt.control_generation_ ||
      document->retirement_generation != receipt.retirement_generation_) {
    document->connection_id = connection_id;
    document->control_generation = receipt.control_generation_;
    document->retirement_generation = receipt.retirement_generation_;
    document->session_id = base::Uuid::GenerateRandomV4().AsLowercaseString();
  }
  return base::DictValue().Set("result", base::DictValue()
      .Set("pageId", receipt.page_id()).Set("documentId", document->id)
      .Set("url", frame->GetLastCommittedURL().spec())
      .Set("sessionId", document->session_id)
      .Set("producerSha256", person_observer_script::kProducerSha256));
}
NativePersonObserverController::NativePersonObserverController(
    content::WebContents* contents)
    : content::WebContentsObserver(contents),
      content::WebContentsUserData<NativePersonObserverController>(*contents) {}
NativePersonObserverController::~NativePersonObserverController() {
  closing_ = true;
  Refuse();
}
bool NativePersonObserverController::Current() const {
  return reply_ && authority_ && receipt_ &&
         authority_->MayReadPerson(*receipt_) &&
         receipt_->document().AsRenderFrameHostIfValid() ==
             web_contents()->GetPrimaryMainFrame();
}
void NativePersonObserverController::Read(uint64_t connection_generation,
                                         base::DictValue request, Reply reply) {
  if (reply_) {
    std::move(reply).Run(Fault("conflict"));
    return;
  }
  if (closing_) {
    std::move(reply).Run(Fault("not_found"));
    return;
  }
  auto raw = ValidRequest(request) ? base::WriteJson(request) : std::nullopt;
  if (!connection_generation || !raw || raw->size() > 16384) {
    std::move(reply).Run(Fault("invalid_params"));
    return;
  }
  auto* profile = Profile::FromBrowserContext(web_contents()->GetBrowserContext());
  auto* authority = EgressController::ForProfile(profile);
  auto receipt = authority ? authority->CapturePersonRead(web_contents()) : std::nullopt;
  if (!receipt) {
    std::move(reply).Run(Fault("permission_denied"));
    return;
  }
  connection_generation_ = connection_generation;
  read_id_ = base::Uuid::GenerateRandomV4().AsLowercaseString();
  receipt_ = std::move(receipt);
  authority_ = authority->GetWeakPtr();
  reply_ = std::move(reply);
  authority_subscription_ = authority->ObserveAuthority(base::BindRepeating(
      &NativePersonObserverController::AuthorityChanged, weak_factory_.GetWeakPtr()));
  deadline_.Start(FROM_HERE, base::Seconds(8), base::BindOnce(
      &NativePersonObserverController::Refuse, weak_factory_.GetWeakPtr()));
  auto* frame = receipt_->document().AsRenderFrameHostIfValid();
  document_id_ = PersonReadDocument::GetOrCreateForCurrentDocument(frame)->id;
  frame->GetRemoteAssociatedInterfaces()->GetInterface(
      remote_.BindNewEndpointAndPassReceiver());
  remote_.set_disconnect_handler(base::BindOnce(
      &NativePersonObserverController::Refuse, weak_factory_.GetWeakPtr()));
  if (!Current()) { Refuse(); return; }
  remote_->Prepare(read_id_, base::BindOnce(
      &NativePersonObserverController::Prepared, weak_factory_.GetWeakPtr(),
      std::move(*raw)));
}
void NativePersonObserverController::Prepared(std::string request_json,
                                             bool ready) {
  if (!ready || !Current()) { Refuse(); return; }
  remote_->Read(read_id_, request_json, base::BindOnce(
      &NativePersonObserverController::Received, weak_factory_.GetWeakPtr()));
}
void NativePersonObserverController::Received(bool accepted,
                                             const std::string& result_json) {
  if (!accepted || !Current() || result_json.size() > 131072) { Refuse(); return; }
  auto result = base::JSONReader::ReadDict(result_json, base::JSON_PARSE_RFC);
  if (!result || !Current()) { Refuse(); return; }
  auto value = base::DictValue().Set("readId", read_id_)
      .Set("documentId", document_id_)
      .Set("pageId", receipt_->page_id())
      .Set("producerSha256", person_observer_script::kProducerSha256)
      .Set("value", std::move(*result));
  Finish(base::DictValue().Set("result", std::move(value)));
}
void NativePersonObserverController::AuthorityChanged() {
  if (reply_ && !Current()) Refuse();
}
void NativePersonObserverController::Disconnect(uint64_t connection_generation) {
  if (reply_ && connection_generation_ == connection_generation) Refuse();
}
void NativePersonObserverController::Refuse() {
  if (reply_) Finish(Fault("permission_denied"));
}
void NativePersonObserverController::Finish(base::DictValue result) {
  auto reply = std::move(reply_);
  deadline_.Stop();
  authority_subscription_ = {};
  remote_.reset();
  receipt_.reset();
  authority_.reset();
  read_id_.clear();
  document_id_.clear();
  connection_generation_ = 0;
  weak_factory_.InvalidateWeakPtrs();
  std::move(reply).Run(std::move(result));
}
void NativePersonObserverController::DidStartNavigation(
    content::NavigationHandle* navigation) {
  if (navigation->IsInPrimaryMainFrame() && !navigation->IsSameDocument()) Refuse();
}
void NativePersonObserverController::WebContentsDestroyed() {
  closing_ = true;
  Refuse();
}
}  // namespace aux
