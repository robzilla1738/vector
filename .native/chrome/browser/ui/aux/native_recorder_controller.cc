// Copyright 2026 The Aux Authors
#include "chrome/browser/ui/aux/native_recorder_controller.h"

#include <limits>
#include <optional>
#include <string_view>
#include <utility>

#include "base/check.h"
#include "base/functional/bind.h"
#include "base/functional/callback_helpers.h"
#include "base/json/json_writer.h"
#include "base/json/json_reader.h"
#include "base/strings/escape.h"
#include "base/strings/string_util.h"
#include "base/strings/utf_string_conversions.h"
#include "base/uuid.h"
#include "base/timer/timer.h"
#include "base/time/time.h"
#include "chrome/browser/profiles/profile.h"
#include "chrome/browser/ui/aux/egress_controller.h"
#include "chrome/browser/ui/aux/native_recorder_script.h"
#include "chrome/browser/ui/aux/page_identity.h"
#include "chrome/browser/ui/aux/tab_catalog.h"
#include "chrome/common/chrome_isolated_world_ids.h"
#include "content/public/browser/navigation_handle.h"
#include "content/public/browser/render_frame_host.h"
#include "content/public/browser/web_contents.h"
#include "mojo/public/cpp/bindings/associated_receiver.h"
#include "third_party/blink/public/common/associated_interfaces/associated_interface_provider.h"
#include "net/base/url_util.h"
#include "url/gurl.h"

namespace aux {
namespace {
base::DictValue Fault(const char* code, const char* message) {
  base::DictValue error;
  error.Set("code", code);
  error.Set("message", message);
  base::DictValue result;
  result.Set("error", std::move(error));
  return result;
}
base::DictValue Result(base::DictValue result) {
  base::DictValue reply;
  reply.Set("result", std::move(result));
  return reply;
}
bool SecretKey(const std::string& key) {
  for (const char* part : {"password", "passwd", "token", "secret",
                           "credential", "authorization", "session", "otp",
                           "code", "api_key", "apikey", "api-key"}) {
    if (key.find(part) != std::string::npos)
      return true;
  }
  return false;
}
bool SafeUrl(const GURL& url) {
  if (!url.SchemeIsHTTPOrHTTPS() || url.has_username() || url.has_password() ||
      url.spec().size() > 8192)
    return false;
  for (net::QueryIterator query(url); !query.IsAtEnd(); query.Advance()) {
    // Classify keys only, never read credential query values.
    if (SecretKey(base::ToLowerASCII(base::UnescapeURLComponent(
            query.GetKey(), base::UnescapeRule::NORMAL))))
      return false;
  }
  const auto fragment = base::ToLowerASCII(url.ref());
  return fragment.find('=') == std::string::npos || !SecretKey(fragment);
}
}  // namespace

class NativeRecorderController::DocumentSink final : public chrome::mojom::AuxRecorderSink {
 public:
  DocumentSink(base::WeakPtr<NativeRecorderController> owner,
               uint64_t connection, std::string id, uint64_t generation,
               content::WeakDocumentPtr document)
      : owner_(owner), connection_(connection), id_(std::move(id)),
        generation_(generation), document_(document) {}
  mojo::PendingAssociatedRemote<chrome::mojom::AuxRecorderSink> Bind() {
    return receiver_.BindNewEndpointAndPassRemote();
  }
 private:
  bool Current() const {
    return owner_ && owner_->Current(connection_, id_, generation_, document_);
  }
  void Event(uint64_t sequence, const std::string& raw,
             EventCallback callback) override {
    if (!Current()) { std::move(callback).Run(false); return; }
    // Bound the renderer payload before allocating or parsing its JSON.
    if (sequence_ == std::numeric_limits<uint64_t>::max() ||
        sequence != sequence_ + 1 || raw.size() > 16000 ||
        owner_->events_.size() >= 50 ||
        owner_->event_bytes_ + raw.size() > 65536) {
      auto owner = owner_;
      std::move(callback).Run(false);
      if (owner) owner->Retire();
      return;
    }
    auto parsed = base::JSONReader::Read(raw, base::JSON_PARSE_RFC);
    if (!parsed || !parsed->is_dict()) {
      auto owner = owner_;
      std::move(callback).Run(false);
      if (owner) owner->Retire();
      return;
    }
    sequence_ = sequence;
    owner_->event_bytes_ += raw.size();
    owner_->events_.Append(std::move(*parsed));
    std::move(callback).Run(true);
  }
  void Overflow() override { if (Current()) owner_->Retire(); }
  void DocumentEnded() override {
    if (Current()) owner_->ready_ = false;
  }
  base::WeakPtr<NativeRecorderController> owner_;
  const uint64_t connection_;
  const std::string id_;
  const uint64_t generation_;
  const content::WeakDocumentPtr document_;
  uint64_t sequence_ = 0;
  mojo::AssociatedReceiver<chrome::mojom::AuxRecorderSink> receiver_{this};
};

struct NativeRecorderController::PendingReply {
  explicit PendingReply(Reply callback) : callback(std::move(callback)) {}
  void Finish(base::DictValue value) {
    if (!callback)
      return;
    timer.Stop();
    auto done = std::move(callback);
    std::move(done).Run(std::move(value));
  }
  Reply callback;
  base::OneShotTimer timer;
};
std::shared_ptr<NativeRecorderController::PendingReply>
NativeRecorderController::ArmReply(Reply reply) {
  auto request = std::make_shared<PendingReply>(std::move(reply));
  reply_ = request;
  request->timer.Start(
      FROM_HERE, base::Seconds(8),
      base::BindOnce(
          [](base::WeakPtr<NativeRecorderController> self,
             std::shared_ptr<PendingReply> request, uint64_t operation) {
            if (self && self->reply_ == request &&
                self->operation_generation_ == operation)
              self->Retire();
            request->Finish(Fault("timeout", "Recording callback timed out"));
          },
          weak_factory_.GetWeakPtr(), request, operation_generation_));
  return request;
}
WEB_CONTENTS_USER_DATA_KEY_IMPL(NativeRecorderController);
NativeRecorderController::NativeRecorderController(content::WebContents* contents)
    : content::WebContentsObserver(contents),
      content::WebContentsUserData<NativeRecorderController>(*contents) {}
NativeRecorderController::~NativeRecorderController() {
  weak_factory_.InvalidateWeakPtrs();
  auto request = std::move(reply_);
  auto retired = std::move(retired_callback_);
  navigation_gap_timer_.Stop();
  active_ = false;
  person_read_subscription_ = {};
  person_read_.reset();
  person_authority_.reset();
  recorder_remote_.reset();
  sink_.reset();
  if (request)
    request->Finish(Fault("target_detached", "Recording tab closed"));
  if (retired)
    std::move(retired).Run();
}

bool NativeRecorderController::PersonPage() const {
  auto* contents = web_contents();
  auto* profile = contents
                      ? Profile::FromBrowserContext(contents->GetBrowserContext())
                      : nullptr;
  auto* identity = contents ? PageIdentity::FromWebContents(contents) : nullptr;
  auto* frame = contents ? contents->GetPrimaryMainFrame() : nullptr;
  return profile && !profile->IsOffTheRecord() && identity &&
         !identity->runtime_owned() && frame && frame->IsRenderFrameLive() &&
         TabCatalog::GetForProfile(profile)->FindPage(identity->id()) == contents &&
         SafeUrl(contents->GetLastCommittedURL());
}
bool NativeRecorderController::PersonReadCurrent() const {
  return person_authority_ && person_read_ &&
         person_authority_->MayReadPerson(*person_read_);
}
void NativeRecorderController::OnPersonReadAuthorityChanged() {
  if (!active_ || PersonReadCurrent()) return;
  auto request = std::move(reply_);
  Retire();
  if (request)
    request->Finish(Fault("permission_denied", "Recording person authority retired"));
}
bool NativeRecorderController::Current(
    uint64_t connection_generation, const std::string& recorder_id,
    uint64_t document_generation,
    const content::WeakDocumentPtr& document) const {
  auto* frame = document.AsRenderFrameHostIfValid();
  return active_ && connection_generation_ == connection_generation &&
         recorder_id_ == recorder_id &&
         document_generation_ == document_generation && PersonReadCurrent() && frame &&
         document_.AsRenderFrameHostIfValid() == frame &&
         web_contents()->GetPrimaryMainFrame() == frame;
}
void NativeRecorderController::Start(uint64_t connection_generation,
                                     Reply reply) {
  if (!connection_generation || !PersonPage()) {
    std::move(reply).Run(Fault("permission_denied",
                              "Recording needs a current person-owned tab"));
    return;
  }
  if (active_ || pending_) {
    std::move(reply).Run(Fault("conflict", "Recording is already active"));
    return;
  }
  auto* authority = EgressController::ForProfile(
      Profile::FromBrowserContext(web_contents()->GetBrowserContext()));
  auto receipt = authority->CapturePersonRead(web_contents());
  if (!receipt || document_generation_ == std::numeric_limits<uint64_t>::max()) {
    std::move(reply).Run(Fault("permission_denied", "Recording person authority unavailable"));
    return;
  }
  person_authority_ = authority->GetWeakPtr();
  person_read_ = std::move(receipt);
  person_read_subscription_ = authority->ObserveAuthority(base::BindRepeating(
      &NativeRecorderController::OnPersonReadAuthorityChanged,
      weak_factory_.GetWeakPtr()));
  recorder_id_ = base::Uuid::GenerateRandomV4().AsLowercaseString();
  connection_generation_ = connection_generation;
  active_ = true;
  established_ = false;
  ++document_generation_;
  document_ = web_contents()->GetPrimaryMainFrame()->GetWeakDocumentPtr();
  Install(std::move(reply));
}
void NativeRecorderController::Install(Reply reply) {
  ready_ = false;
  pending_ = true;
  const uint64_t operation = ++operation_generation_;
  auto* frame = document_.AsRenderFrameHostIfValid();
  if (!frame || !PersonReadCurrent()) {
    Retire();
    std::move(reply).Run(Fault("target_detached", "Recording document changed"));
    return;
  }
  recorder_remote_.reset();
  frame->GetRemoteAssociatedInterfaces()->GetInterface(&recorder_remote_);
  sink_ = std::make_unique<DocumentSink>(weak_factory_.GetWeakPtr(),
      connection_generation_, recorder_id_, document_generation_, document_);
  auto request = ArmReply(std::move(reply));
  recorder_remote_.set_disconnect_handler(base::BindOnce(
      [](base::WeakPtr<NativeRecorderController> self, uint64_t operation,
         std::shared_ptr<PendingReply> request) {
        if (!self || self->operation_generation_ != operation) return;
        if (self->established_ && self->navigation_id_) {
          self->ready_ = false;
          self->navigation_gap_timer_.Start(FROM_HERE, base::Seconds(8),
              base::BindOnce(
                  [](base::WeakPtr<NativeRecorderController> self, uint64_t operation) {
                    if (self && self->operation_generation_ == operation) self->Retire();
                  }, self, operation));
          return;
        }
        self->Retire();
        request->Finish(Fault("target_detached", "Recording renderer detached"));
      }, weak_factory_.GetWeakPtr(), operation, request));
  recorder_remote_->Prepare(base::BindOnce(
      [](base::WeakPtr<NativeRecorderController> self, uint64_t connection,
         std::string id, uint64_t generation, uint64_t operation,
         content::WeakDocumentPtr document, std::shared_ptr<PendingReply> request,
         bool prepared) {
        if (!self || !self->Current(connection, id, generation, document) ||
            self->operation_generation_ != operation) {
          request->Finish(Fault("target_detached", "Recording document changed before preparation"));
          return;
        }
        if (!prepared) {
          self->Retire();
          request->Finish(Fault("backend_unavailable", "Recording preparation refused"));
          return;
        }
        self->recorder_remote_->Start(id, generation, self->sink_->Bind(),
            base::BindOnce(
                [](base::WeakPtr<NativeRecorderController> self, uint64_t connection,
                   std::string id, uint64_t generation, uint64_t operation,
                   content::WeakDocumentPtr document, std::shared_ptr<PendingReply> request,
                   bool accepted) {
                  if (!self || !self->Current(connection, id, generation, document) ||
                      self->operation_generation_ != operation) {
                    request->Finish(Fault("target_detached", "Recording document changed"));
                    return;
                  }
                  self->pending_ = false;
                  if (!accepted) {
                    self->Retire();
                    request->Finish(Fault("backend_unavailable", "Recording could not start"));
                    return;
                  }
                  self->ready_ = true;
                  self->established_ = true;
                  base::DictValue result;
                  result.Set("recorderId", id);
                  result.Set("documentGeneration", std::to_string(generation));
                  result.Set("producerSha256", recorder_script::kProducerSha256);
                  request->Finish(Result(std::move(result)));
                }, self, connection, id, generation, operation, document, request));
      }, weak_factory_.GetWeakPtr(), connection_generation_, recorder_id_,
      document_generation_, operation, document_, request));
}
void NativeRecorderController::Drain(uint64_t connection,
                                     const std::string& id, Reply reply) {
  const bool current = Current(connection, id, document_generation_, document_);
  const bool transition = active_ && established_ && navigation_id_ &&
      connection_generation_ == connection && recorder_id_ == id && PersonPage();
  if (!current && !transition) {
    std::move(reply).Run(Fault("target_detached", "Recording authority changed"));
    return;
  }
  base::DictValue result;
  result.Set("recorderId", recorder_id_);
  result.Set("documentGeneration", std::to_string(document_generation_));
  if (!current || !ready_ || pending_) {
    result.Set("pending", true);
  } else {
    result.Set("events", std::move(events_));
    events_ = base::ListValue();
    event_bytes_ = 0;
  }
  std::move(reply).Run(Result(std::move(result)));
}
void NativeRecorderController::Retire() {
  active_ = false; ready_ = false; pending_ = false; established_ = false;
  navigation_gap_timer_.Stop(); navigation_id_.reset();
  ++operation_generation_;
  recorder_id_.clear(); connection_generation_ = 0;
  document_ = content::WeakDocumentPtr();
  events_.clear(); event_bytes_ = 0;
  person_read_subscription_ = {}; person_read_.reset(); person_authority_.reset();
  recorder_remote_.reset(); sink_.reset(); reply_.reset();
  auto retired = std::move(retired_callback_);
  if (retired) std::move(retired).Run();
}
void NativeRecorderController::Stop(uint64_t connection,
                                    const std::string& id, Reply reply) {
  if (connection_generation_ != connection || recorder_id_ != id || !active_) {
    std::move(reply).Run(Fault("permission_denied", "Recording receipt changed"));
    return;
  }
  auto endpoint = std::make_shared<mojo::AssociatedRemote<chrome::mojom::AuxRecorder>>(std::move(recorder_remote_));
  const auto generation = document_generation_;
  auto prior = std::move(reply_);
  Retire();
  if (prior) prior->Finish(Fault("target_detached", "Recording stopped"));
  if (!endpoint->is_bound()) {
    base::DictValue result; result.Set("stopped", true);
    std::move(reply).Run(Result(std::move(result)));
    return;
  }
  auto request = std::make_shared<PendingReply>(std::move(reply));
  request->timer.Start(FROM_HERE, base::Seconds(8), base::BindOnce(
      [](std::shared_ptr<PendingReply> request) {
        request->Finish(Fault("timeout", "Recording cleanup timed out"));
      }, request));
  (*endpoint)->Stop(id, generation, base::BindOnce(
      [](std::shared_ptr<mojo::AssociatedRemote<chrome::mojom::AuxRecorder>> endpoint,
         std::shared_ptr<PendingReply> request, bool stopped) {
        if (!stopped) { request->Finish(Fault("backend_unavailable", "Recording cleanup refused")); return; }
        base::DictValue result; result.Set("stopped", true);
        request->Finish(Result(std::move(result)));
      }, endpoint, request));
}
void NativeRecorderController::Disconnect(uint64_t connection) {
  if (connection_generation_ != connection) return;
  auto prior = std::move(reply_);
  Retire();
  if (prior) prior->Finish(Fault("target_detached", "Recording connection closed"));
}
void NativeRecorderController::DidStartNavigation(content::NavigationHandle* navigation) {
  if (!active_ || !navigation->IsInPrimaryMainFrame() || navigation->IsSameDocument()) return;
  if (!PersonReadCurrent() || !SafeUrl(navigation->GetURL())) {
    auto prior = std::move(reply_); Retire();
    if (prior) prior->Finish(Fault("permission_denied", "Recording navigation became unavailable"));
    return;
  }
  navigation_id_ = navigation->GetNavigationId();
}
void NativeRecorderController::DidFinishNavigation(
    content::NavigationHandle* navigation) {
  if (!active_ || !navigation->IsInPrimaryMainFrame() || navigation->IsSameDocument()) return;
  if (!navigation->HasCommitted()) {
    if (navigation_id_ == navigation->GetNavigationId()) {
      navigation_id_.reset(); navigation_gap_timer_.Stop();
      if (!ready_) Retire();
    }
    return;
  }
  if (navigation_id_ != navigation->GetNavigationId()) {
    auto prior = std::move(reply_); Retire();
    if (prior) prior->Finish(Fault("ref_stale", "Recording navigation identity changed"));
    return;
  }
  navigation_id_.reset(); navigation_gap_timer_.Stop();
  if (!PersonPage() || events_.size() >= 49 ||
      document_generation_ == std::numeric_limits<uint64_t>::max()) {
    auto prior = std::move(reply_);
    Retire();
    if (prior)
      prior->Finish(Fault("target_detached", "Recording document became unavailable"));
    return;
  }
  auto authority = person_authority_;
  auto next_receipt = authority ? authority->CapturePersonRead(web_contents()) : std::nullopt;
  if (!next_receipt) {
    auto prior = std::move(reply_); Retire();
    if (prior) prior->Finish(Fault("permission_denied", "Recording navigation lost person authority"));
    return;
  }
  person_read_ = std::move(next_receipt);
  auto prior = std::move(reply_);
  ready_ = false;
  pending_ = false;
  ++operation_generation_;
  ++document_generation_;
  document_ = web_contents()->GetPrimaryMainFrame()->GetWeakDocumentPtr();
  base::DictValue event;
  event.Set("kind", "navigate");
  event.Set("url", navigation->GetURL().spec());
  const auto encoded = base::WriteJson(event);
  if (!encoded || event_bytes_ + encoded->size() > 65536) {
    Retire();
    if (prior) prior->Finish(Fault("invalid_params", "Recording exceeds safe bounds"));
    return;
  }
  event_bytes_ += encoded->size();
  events_.Append(std::move(event));
  const auto generation = document_generation_;
  auto weak = weak_factory_.GetWeakPtr();
  if (prior)
    prior->Finish(Fault("target_detached", "Recording document changed"));
  if (!weak || !active_ || document_generation_ != generation)
    return;
  Install(base::BindOnce([](base::DictValue) {}));
}
void NativeRecorderController::WebContentsDestroyed() {
  auto prior = std::move(reply_);
  Retire();
  if (prior)
    prior->Finish(Fault("target_detached", "Recording tab closed"));
}
}  // namespace aux
