// Copyright 2026 The Aux Authors
#include "chrome/browser/ui/aux/native_organization_work_fixture.h"
#if BUILDFLAG(IS_MAC) && BUILDFLAG(AUX_ALLOW_REMOTE_DEBUGGING_FOR_TESTS)
#include <utility>
#include "base/functional/bind.h"
#include "base/process/process_handle.h"
#include "base/unguessable_token.h"
#include "chrome/browser/profiles/profile.h"
#include "chrome/browser/ui/aux/native_performance_observer.h"
#include "chrome/browser/ui/aux/organization_store.h"
#include "chrome/browser/ui/aux/page_identity.h"
#include "chrome/browser/ui/browser_window/public/browser_window_interface.h"
#include "chrome/browser/ui/browser_window/public/browser_window_interface_iterator.h"
#include "chrome/browser/ui/tabs/tab_strip_model.h"
#include "chrome/browser/ui/webui_browser/webui_browser_ui.h"
#include "content/browser/renderer_host/render_frame_host_impl.h"
#include "content/browser/renderer_host/render_widget_host_impl.h"
#include "content/public/browser/web_contents.h"
#include "content/public/browser/web_ui.h"
namespace aux {
namespace {
const char* Metric(blink::mojom::NativeOrganizationWorkMetric metric) {
  switch (metric) {
    case blink::mojom::NativeOrganizationWorkMetric::kAutoArchive: return "auto-archive";
    case blink::mojom::NativeOrganizationWorkMetric::kLiveFolderRefresh: return "live-folder-refresh";
  }
  return nullptr;
}
Profile* OwnedProfile(base::WeakPtr<WebUIBrowserUI> ui) {
  return ui && ui->web_ui() ? Profile::FromWebUI(ui->web_ui()) : nullptr;
}
std::optional<std::set<std::string>> LivePages(Profile* profile) {
  if (!profile || profile->IsOffTheRecord()) return std::nullopt;
  std::set<std::string> pages; bool valid = true;
  ForEachCurrentBrowserWindowInterfaceOrderedByActivation(
      [&pages, &valid, profile](BrowserWindowInterface* browser) {
        if (browser->GetProfile() != profile) return true;
        auto* tabs = browser->GetTabStripModel();
        if (!tabs || tabs->count() > 5000) { valid = false; return false; }
        for (int i = 0; i < tabs->count(); ++i) {
          auto* contents = tabs->GetWebContentsAt(i);
          auto* identity = contents ? PageIdentity::FromWebContents(contents) : nullptr;
          if (!contents || contents->IsBeingDestroyed() || !identity ||
              !pages.insert(identity->id()).second || pages.size() > 5000) {
            valid = false; return false;
          }
        }
        return true;
      });
  return valid ? std::optional(pages) : std::nullopt;
}
std::optional<base::ListValue> Archive(Profile* profile) {
  std::string error; auto snapshot = OrganizationStore::ProfileSnapshot(profile, &error);
  if (!snapshot) return std::nullopt;
  auto* shared = snapshot->FindDict("shared");
  auto* archive = shared ? shared->FindList("archivedTabs") : nullptr;
  return archive ? std::optional(archive->Clone()) : std::optional(base::ListValue());
}
}
NativeOrganizationWorkFixture::NativeOrganizationWorkFixture(base::WeakPtr<WebUIBrowserUI> ui) : ui_(ui) {}
NativeOrganizationWorkFixture::~NativeOrganizationWorkFixture() { Refuse(); }
bool NativeOrganizationWorkFixture::Current() const {
  auto current = ReadNativeGuestStageShellOwner(ui_);
  auto* frame = document_.AsRenderFrameHostIfValid();
  return NativePerformanceObservationEnabled() && ui_ && ui_->web_ui() &&
      owner_ && current == owner_ && frame && frame == ui_->web_ui()->GetRenderFrameHost() &&
      frame == ui_->web_ui()->GetWebContents()->GetPrimaryMainFrame() &&
      OwnedProfile(ui_) && !OwnedProfile(ui_)->IsOffTheRecord();
}
base::DictValue NativeOrganizationWorkFixture::Record(const char* status) const {
  auto record = base::DictValue().Set("producer", "aux-native-organization-work-v1")
      .Set("version", 1).Set("pid", static_cast<int>(base::GetCurrentProcId())).Set("status", status);
  if (scope_) { record.Set("windowId", scope_->window_id); record.Set("scope", base::DictValue().Set("metric", Metric(scope_->metric))
      .Set("requestNonce", scope_->nonce.ToString()).Set("sampleSequence", static_cast<double>(scope_->sample_sequence))
      .Set("windowId", scope_->window_id).Set("rendererPid", scope_->renderer_pid)
      .Set("documentToken", scope_->document.ToString())
      .Set("nativeDocumentGeneration", static_cast<double>(scope_->document_generation))); }
  return record;
}
void NativeOrganizationWorkFixture::Prepare(blink::mojom::NativeOrganizationWorkMetric metric, Reply reply) {
  if (active_ || pending_ || !Metric(metric) || sequence_ >= 4000) {
    std::move(reply).Run(Record("refused")); return;
  }
  owner_ = ReadNativeGuestStageShellOwner(ui_);
  auto* contents = ui_ && ui_->web_ui() ? ui_->web_ui()->GetWebContents() : nullptr;
  auto* frame = contents ? contents->GetPrimaryMainFrame() : nullptr;
  if (!owner_ || !frame) { std::move(reply).Run(Record("refused")); return; }
  document_ = frame->GetWeakDocumentPtr();
  if (!Current()) { std::move(reply).Run(Record("refused")); return; }
  if (!last_document_ || *last_document_ != owner_->shell_document) {
    if (generation_ == 9007199254740991ULL) { std::move(reply).Run(Record("refused")); return; }
    last_document_ = owner_->shell_document; ++generation_;
  }
  scope_ = blink::mojom::NativeOrganizationWorkScope::New();
  scope_->metric = metric; scope_->nonce = base::UnguessableToken::Create(); scope_->sample_sequence = ++sequence_;
  scope_->window_id = owner_->window_id; scope_->renderer_pid = owner_->shell_renderer_pid;
  scope_->widget_routing_id = owner_->shell_widget_routing_id; scope_->document = owner_->shell_document;
  scope_->document_generation = generation_; active_ = true; read_ = false;
  pending_ = std::move(reply); runtime_.reset(); archived_before_.clear(); live_before_.clear();
  auto archive = Archive(OwnedProfile(ui_)); auto live = LivePages(OwnedProfile(ui_));
  if (!archive || !live) { Refuse(); return; }
  live_before_ = std::move(*live);
  for (const auto& entry : *archive) {
    const auto* value = entry.GetIfDict(); const auto* id = value ? value->FindString("archiveId") : nullptr;
    if (!id || !archived_before_.insert(*id).second) { Refuse(); return; }
  }
  timeout_.Start(FROM_HERE, base::Seconds(2), base::BindOnce(&NativeOrganizationWorkFixture::Refuse, weak_factory_.GetWeakPtr()));
  AuxRuntimeHost::ForProfile(OwnedProfile(ui_))->ReadPerformanceProcessIdentity(
      base::BindOnce(&NativeOrganizationWorkFixture::RuntimePrepared, weak_factory_.GetWeakPtr()));
}
void NativeOrganizationWorkFixture::RuntimePrepared(std::optional<RuntimeIdentity> runtime) {
  if (!pending_ || !Current() || !runtime || runtime->pid <= 0 ||
      runtime->pid == scope_->renderer_pid || runtime->pid == base::GetCurrentProcId()) { Refuse(); return; }
  runtime_ = std::move(runtime);
  auto* frame = document_.AsRenderFrameHostIfValid();
  auto* widget = frame ? static_cast<content::RenderWidgetHostImpl*>(frame->GetRenderWidgetHost()) : nullptr;
  if (!widget) { Refuse(); return; }
  auto receiver = lease_.BindNewPipeAndPassReceiver();
  lease_.set_disconnect_handler(base::BindOnce(&NativeOrganizationWorkFixture::Refuse, weak_factory_.GetWeakPtr()));
  widget->BeginNativeOrganizationWorkForTesting(scope_->Clone(), std::move(receiver),
      base::BindOnce(&NativeOrganizationWorkFixture::Armed, weak_factory_.GetWeakPtr()));
}
void NativeOrganizationWorkFixture::Armed(bool armed) {
  if (!pending_ || !armed || !Current()) { Refuse(); return; }
  timeout_.Start(FROM_HERE, base::Seconds(30),
      base::BindOnce(&NativeOrganizationWorkFixture::Refuse, weak_factory_.GetWeakPtr()));
  auto record = Record("ready");
  std::move(pending_).Run(std::move(record));
}
void NativeOrganizationWorkFixture::Complete(Reply reply) {
  if (!active_ || read_ || pending_ || !Current() || !lease_.is_bound()) {
    auto record = Record("refused"); Refuse(); std::move(reply).Run(std::move(record)); return;
  }
  read_ = true; pending_ = std::move(reply);
  timeout_.Start(FROM_HERE, base::Seconds(21), base::BindOnce(&NativeOrganizationWorkFixture::Refuse, weak_factory_.GetWeakPtr()));
  lease_->Read(base::BindOnce(&NativeOrganizationWorkFixture::ReadCompleted, weak_factory_.GetWeakPtr()));
}
void NativeOrganizationWorkFixture::ReadCompleted(blink::mojom::NativeOrganizationWorkSamplePtr sample) {
  if (!pending_ || !Current() || !sample || !sample->scope || !sample->scope->Equals(*scope_)) { Refuse(); return; }
  lease_.set_disconnect_handler(base::OnceClosure());
  lease_.reset();
  AuxRuntimeHost::ForProfile(OwnedProfile(ui_))->ReadPerformanceProcessIdentity(
      base::BindOnce(&NativeOrganizationWorkFixture::RuntimeCompleted, weak_factory_.GetWeakPtr(), std::move(sample)));
}
void NativeOrganizationWorkFixture::RuntimeCompleted(blink::mojom::NativeOrganizationWorkSamplePtr sample,
    std::optional<RuntimeIdentity> runtime) {
  if (!pending_ || !Current() || !runtime_ || !runtime || runtime->pid != runtime_->pid ||
      runtime->connection_generation != runtime_->connection_generation || !sample->units) { Refuse(); return; }
  auto work = base::DictValue().Set("committed", true).Set("units", static_cast<int>(sample->units))
      .Set("operationId", sample->operation_id);
  if (scope_->metric == blink::mojom::NativeOrganizationWorkMetric::kAutoArchive) {
    auto archive = Archive(OwnedProfile(ui_)); auto live = LivePages(OwnedProfile(ui_));
    if (!archive || !live) { Refuse(); return; }
    unsigned count = 0; base::ListValue batches;
    for (const auto& entry : *archive) {
      const auto& value = entry.GetDict(); const auto* id = value.FindString("archiveId");
      if (!id || archived_before_.contains(*id)) continue;
      const auto* page = value.FindString("pageId"); const auto* batch = value.FindString("batchId");
      const auto* reason = value.FindString("reason"); const auto* state = value.FindString("state");
      if (!page || !batch || !reason || *reason != "auto" || !state || *state != "archived" ||
          !live_before_.contains(*page) || live->contains(*page) || ++count > 20) { Refuse(); return; }
      batches.Append(*batch);
    }
    if (count != sample->units) { Refuse(); return; }
    work.Set("kind", "nativeArchiveBatch").Set("batchIds", std::move(batches));
  } else {
    if (runtime->live_refresh_sequence != runtime_->live_refresh_sequence + 1 ||
        runtime->live_folder_id != sample->folder_id || runtime->live_folder_units != sample->units) { Refuse(); return; }
    work.Set("kind", "runtimeLiveFolderRender").Set("runtimePid", runtime->pid)
        .Set("rowsCommitted", true);
  }
  auto record = Record("measured"); record.Set("work", std::move(work));
  record.Set("sample", base::DictValue().Set("startMs", sample->start_ms).Set("durationMs", sample->duration_ms)
      .Set("durationUpperBoundMs", sample->duration_upper_bound_ms).Set("longTaskCoverage", sample->long_task_coverage)
      .Set("overlappingLongTasks", static_cast<int>(sample->overlapping_long_tasks))
      .Set("maximumLongTaskMs", sample->maximum_long_task_ms).Set("completedTasks", static_cast<int>(sample->completed_tasks))
      .Set("maximumTaskMs", sample->maximum_task_ms).Set("completedThroughMs", sample->completed_through_ms));
  timeout_.Stop(); lease_.reset(); active_ = false;
  std::move(pending_).Run(std::move(record));
}
void NativeOrganizationWorkFixture::Refuse() {
  weak_factory_.InvalidateWeakPtrs(); timeout_.Stop(); lease_.reset(); active_ = false;
  if (pending_) std::move(pending_).Run(Record("refused"));
}
}  // namespace aux
#endif
