// Copyright 2026 The Aux Authors
#include "chrome/browser/ui/aux/native_creator_close_receipt.h"

#include <algorithm>
#include <atomic>
#include <memory>
#include <optional>
#include "base/functional/bind.h"
#include "base/json/json_reader.h"
#include "base/json/json_writer.h"
#include "base/run_loop.h"
#include "base/timer/timer.h"
#include "base/test/test_future.h"
#include "chrome/browser/profiles/profile.h"
#include "chrome/browser/ui/aux/egress_controller.h"
#include "chrome/browser/ui/aux/native_cdp_measurement_producer.h"
#include "chrome/browser/ui/aux/cdp_broker.h"
#include "chrome/browser/ui/aux/runtime_host.h"
#include "chrome/browser/ui/aux/tab_catalog.h"
#include "chrome/browser/ui/browser_window/public/browser_window_interface.h"
#include "chrome/browser/ui/tabs/tab_strip_model.h"
#include "chrome/browser/ui/tabs/tab_strip_model_observer.h"
#include "chrome/test/base/in_process_browser_test.h"
#include "chrome/test/base/ui_test_utils.h"
#include "components/javascript_dialogs/app_modal_dialog_controller.h"
#include "components/javascript_dialogs/app_modal_dialog_view.h"
#include "components/keyed_service/content/browser_context_dependency_manager.h"
#include "content/public/browser/render_frame_host.h"
#include "content/public/browser/render_widget_host_view.h"
#include "content/public/browser/web_contents.h"
#include "content/public/browser/web_contents_delegate.h"
#include "content/public/browser/javascript_dialog_manager.h"
#include "content/public/test/browser_test_utils.h"

// The connection generation is deliberately synthetic. This peer invokes the
// real native factories and publication/retirement, never Current or readiness.
// Actual renderer commits, associated Mac input ACK and final deletion run
// unchanged. These cases do not qualify Worker socket authentication.
class AuxCreatorCloseBrowserTestPeer {
 public:
  static void Install(Profile* profile) {
    AuxRuntimeHost::InstallTestDispatch(profile, base::BindRepeating(
        [](Profile* fixture_profile, std::string original_profile, bool internal, std::string method,
           std::string json, AuxRuntimeHost::ResponseCallback reply) {
          const auto params = base::JSONReader::ReadDict(json, base::JSON_PARSE_RFC);
          if (internal && method == "zap.snapshot" && params &&
              params->FindString("profileId") &&
              *params->FindString("profileId") == original_profile) {
            // An actual empty synthetic Profile policy; real renderer/commit
            // acknowledgements remain active. No grants are supplied.
            std::move(reply).Run({true, "[]", "", ""});
          } else if (!internal && method == "pages.resume" && params) {
            auto* host = AuxRuntimeHost::ForProfile(fixture_profile);
            auto* egress = aux::EgressController::ForProfile(fixture_profile);
            auto invocation = params->Clone();
            // Source-only fixture bridge: read the sole genuinely minted
            // local CallApi ticket. This does not attest Worker transport.
            if (egress->person_resumes_.size() == 1)
              invocation.Set("ticketId", egress->person_resumes_.begin()->first);
            auto native = host->HandleNativeCall("native.egressResumePerson",
                invocation, host->admitted_native_generation_);
            const auto* result = native.FindDict("result");
            const auto* error = native.FindDict("error");
            if (result) {
              std::move(reply).Run({true, base::WriteJson(*result).value_or(""), "", ""});
            } else {
              const auto* code = error ? error->FindString("code") : nullptr;
              const auto* message = error ? error->FindString("message") : nullptr;
              std::move(reply).Run({false, "", code ? *code : "ref_stale",
                  message ? *message : "The original native resume was refused"});
            }
          } else if (!internal && (method == "runs.pause" || method == "runs.cancel") && params) {
            // Only the API response is synthetic. Actual native owner ingress
            // has already retired the original registered family synchronously.
            std::move(reply).Run({true, "{}", "", ""});
          } else if (!internal && method == "runs.resume" && params) {
            auto* host = AuxRuntimeHost::ForProfile(fixture_profile);
            auto* egress = aux::EgressController::ForProfile(fixture_profile);
            auto invocation = params->Clone();
            if (egress->run_resumes_.size() == 1)
              invocation.Set("ticketId", egress->run_resumes_.begin()->first);
            auto native = host->HandleNativeCall("native.egressResumeRun", invocation,
                host->admitted_native_generation_);
            const auto* result = native.FindDict("result");
            std::move(reply).Run({result != nullptr, result ? base::WriteJson(*result).value_or("") : "",
                result ? "" : "ref_stale", result ? "" : "Original native run resume refused"});
          } else {
            std::move(reply).Run({false, "", "unsupported",
                "No runtime API is supplied by the creator-cleanup fixture"});
          }
        }, profile, profile->GetPath().BaseName().AsUTF8Unsafe()));
  }
  static void Destroy(Profile* profile) { AuxRuntimeHost::RemoveTestDispatch(profile); }
  static uint64_t Admitted(AuxRuntimeHost* host) { return host->admitted_native_generation_; }
  static base::DictValue ConsumeResume(AuxRuntimeHost* host, const std::string& page_id) {
    return host->HandleNativeCall("native.egressResumePerson",
        base::DictValue().Set("pageId", page_id).Set("ticketId", "not-native-minted"), host->admitted_native_generation_);
  }
  static uint64_t Publish(AuxRuntimeHost* host) {
    const auto generation = std::max(host->admitted_native_generation_,
                                     host->retired_native_generation_) + 1;
    host->NativeConnectionPublished(generation);
    return generation;
  }
  static bool Current(base::WeakPtr<AuxRuntimeHost> host, uint64_t generation) {
    return host && !host->shutting_down_ &&
        host->admitted_native_generation_ == generation &&
        generation > host->retired_native_generation_;
  }
  static void Retire(AuxRuntimeHost* host, uint64_t generation) {
    host->NativeConnectionRetired(generation);
  }
  static void Create(AuxRuntimeHost* host, uint64_t generation,
                     base::DictValue params,
                     base::OnceCallback<void(base::DictValue)> reply) {
    host->HandleNativeCreatorCreateCall(params, generation,
        std::make_shared<std::atomic_bool>(false), std::move(reply));
  }
  static void Close(AuxRuntimeHost* host, uint64_t generation,
                    const base::DictValue& proof,
                    base::OnceCallback<void(base::DictValue)> reply) {
    host->HandleNativeCreatorCloseCall(base::DictValue().Set("proof", proof.Clone()),
        generation, std::make_shared<std::atomic_bool>(false), std::move(reply));
  }
};

namespace aux {
// Wrap the captured real predicate. Its answer is returned unchanged; the
// one-shot supported userdata destruction occurs only after actual authority
// succeeds at the active final-detach check. No production branch is altered.
class NativeCreatorCloseReceiptBrowserTestPeer {
 public:
  static void RemoveReceiptAfterFinalCurrent(NativeCreatorCloseReceipt* receipt) {
    auto original = receipt->current_;
    auto effect = std::make_shared<base::OnceClosure>(base::BindOnce(
        [](base::WeakPtr<content::WebContents> page) {
          if (page) page->RemoveUserData(NativeCreatorCloseReceipt::UserDataKey());
        }, receipt->web_contents()->GetWeakPtr()));
    receipt->current_ = base::BindRepeating(
        [](base::WeakPtr<NativeCreatorCloseReceipt> receipt,
           base::RepeatingCallback<bool()> original,
           std::shared_ptr<base::OnceClosure> effect) {
          const bool actual = original.Run();
          if (actual && receipt && receipt->active_ && !receipt->detaching_ && *effect)
            std::move(*effect).Run();
          return actual;
        }, receipt->GetWeakPtr(), std::move(original), std::move(effect));
  }
};
class NativeCreatorCloseReceiptBrowserTest : public InProcessBrowserTest {
 protected:
  void SetUpInProcessBrowserTestFixture() override {
    InProcessBrowserTest::SetUpInProcessBrowserTestFixture();
    profile_creation_ = BrowserContextDependencyManager::GetInstance()
        ->RegisterCreateServicesCallbackForTesting(base::BindRepeating(
            [](content::BrowserContext* context) {
              auto* profile = Profile::FromBrowserContext(context);
              if (!profile->IsOffTheRecord()) AuxCreatorCloseBrowserTestPeer::Install(profile);
            }));
  }
  void SetUpOnMainThread() override {
    TabCatalog::EnsureFactoryBuilt();
    profile_ = browser()->GetProfile();
    host_ = AuxRuntimeHost::ForProfile(profile_);
    controller_ = EgressController::ForProfile(profile_);
    generation_ = AuxCreatorCloseBrowserTestPeer::Publish(host_);
    original_count_ = browser()->GetTabStripModel()->count();
  }
  void TearDownOnMainThread() override {
    broker_.reset();
    if (host_) AuxCreatorCloseBrowserTestPeer::Retire(host_, generation_);
    if (page_ && page_->GetDelegate()) {
      auto* dialogs = page_->GetDelegate()->GetJavaScriptDialogManager(page_.get());
      if (dialogs) dialogs->CancelDialogs(page_.get(), true);
    }
    base::RunLoop().RunUntilIdle();
    host_ = nullptr;
    controller_ = nullptr;
    page_.reset();
    profile_ = nullptr;
  }
  void Create(base::ListValue ancestry = base::ListValue().Append("creator-browser-run")) {
    AuxCreatorCloseBrowserTestPeer::Create(host_, generation_, base::DictValue()
        .Set("profileId", profile_->GetPath().BaseName().AsUTF8Unsafe())
        .Set("windowId", "main").Set("runId", "creator-browser-run")
        .Set("taskId", "creator-browser-task").Set("taskRevision", 3)
        .Set("background", false)
        .Set("ancestry", std::move(ancestry)), created_.GetCallback());
    ASSERT_TRUE(created_.Wait());
    const auto* result = created_.Get().FindDict("result");
    ASSERT_NE(result, nullptr) << created_.Get();
    const auto* page_id = result->FindString("pageId");
    const auto* creation_id = result->FindString("creationId");
    ASSERT_NE(page_id, nullptr);
    ASSERT_NE(creation_id, nullptr);
    page_id_ = *page_id;
    creation_id_ = *creation_id;
    auto* page = TabCatalog::GetForProfile(profile_)->FindPage(page_id_);
    ASSERT_NE(page, nullptr);
    page_ = page->GetWeakPtr();
    EXPECT_EQ(page->GetLastCommittedURL(), GURL("about:blank"));
    EXPECT_EQ(browser()->GetTabStripModel()->count(), original_count_ + 1);
    const auto document = page->GetPrimaryMainFrame()->GetWeakDocumentPtr();
    auto* view = page->GetRenderWidgetHostView();
    ASSERT_NE(view, nullptr);
    view->AwaitNativeInputAdmissionForDocument(document, input_ack_.GetCallback());
    ASSERT_TRUE(input_ack_.Get());
    ASSERT_TRUE(view->HasNativeInputAdmissionForDocument(document));
    auto proof = controller_->CreatorCleanupProof(base::DictValue()
        .Set("pageId", page_id_).Set("creationId", creation_id_), generation_);
    const auto* value = proof.FindDict("result");
    ASSERT_NE(value, nullptr) << proof;
    proof_ = value->Clone();
  }
  void Close() {
    AuxCreatorCloseBrowserTestPeer::Close(host_, generation_, proof_, close_.GetCallback());
  }
  base::test::TestFuture<bool> measurement_ready_;
  base::DictValue InstallOriginalLease() {
    auto context = controller_->Context(base::DictValue().Set("tabId", page_id_)
        .Set("expectedUrl", "about:blank"));
    const auto* value = context.FindDict("result");
    if (!value || !value->FindDict("isolation") ||
        !value->FindDict("isolation")->FindString("isolationId")) return {};
    const auto isolation_id = *value->FindDict("isolation")->FindString("isolationId");
    auto lease = value->Clone();
    lease.Remove("isolation");
    lease.Remove("personControlled");
    const auto now = static_cast<double>(base::Time::Now().InMillisecondsSinceUnixEpoch());
    lease.Set("leaseId", "creator-original-native-lease")
        .Set("runId", "creator-browser-run").Set("taskId", "creator-browser-task")
        .Set("taskRevision", 3).Set("documentEpoch", 1)
        .Set("isolationId", isolation_id)
        .Set("issuedAt", now).Set("expiresAt", now + 30000);
    auto installed = controller_->Install(base::DictValue().Set("lease", lease.Clone())
        .Set("expectedUrl", "about:blank"));
    if (!installed.FindDict("result") ||
        !installed.FindDict("result")->FindBool("accepted").value_or(false)) return {};
    return lease;
  }
  void NavigationReady(uint64_t generation, const std::string& page_id,
      const std::string& attachment_id, int command_id,
      const std::string& lease_id, bool ready) {
    if (!native_ready_.IsReady()) native_ready_.SetValue(base::DictValue()
        .Set("generation", static_cast<double>(generation)).Set("pageId", page_id)
        .Set("attachmentId", attachment_id).Set("commandId", command_id)
        .Set("leaseId", lease_id).Set("ready", ready));
  }
  void AttachOriginalWithoutNavigation(CdpBroker::NavigationCallback callback) {
    native_lease_ = InstallOriginalLease();
    ASSERT_FALSE(native_lease_.empty());
    ASSERT_NE(native_lease_.FindString("leaseId"), nullptr);
    const auto expiry = native_lease_.FindDouble("expiresAt");
    ASSERT_TRUE(expiry);
    native_expiry_ = *expiry;
    broker_ = std::make_unique<CdpBroker>(profile_, base::BindRepeating(
        [](uint64_t, const std::string&, const std::string&) {}), std::move(callback));
    broker_->WaitForAttachment(page_id_, *native_lease_.FindString("leaseId"), native_expiry_,
        generation_, base::BindRepeating(&AuxCreatorCloseBrowserTestPeer::Current,
            host_->GetWeakPtr(), generation_), attached_.GetCallback());
    const auto& attached = attached_.Get();
    ASSERT_NE(attached.FindDict("result"), nullptr) << attached;
    ASSERT_NE(attached.FindDict("result")->FindString("attachmentId"), nullptr);
    native_attachment_id_ = *attached.FindDict("result")->FindString("attachmentId");
  }
  void StartReplacementNavigation() {
    native_lease_ = InstallOriginalLease();
    const auto& lease = native_lease_;
    ASSERT_FALSE(lease.empty());
    ASSERT_NE(lease.FindString("leaseId"), nullptr);
    const auto expiry = lease.FindDouble("expiresAt");
    ASSERT_TRUE(expiry);
    broker_ = std::make_unique<CdpBroker>(profile_, base::BindRepeating(
      [](uint64_t, const std::string&, const std::string&) {}),
      base::BindRepeating(&NativeCreatorCloseReceiptBrowserTest::NavigationReady,
          base::Unretained(this)));
    broker_->WaitForAttachment(page_id_, *lease.FindString("leaseId"), *expiry,
      generation_, base::BindRepeating(&AuxCreatorCloseBrowserTestPeer::Current,
          host_->GetWeakPtr(), generation_), attached_.GetCallback());
    const auto& attached = attached_.Get();
    ASSERT_NE(attached.FindDict("result"), nullptr) << attached;
    ASSERT_NE(attached.FindDict("result")->FindString("attachmentId"), nullptr);
    native_attachment_id_ = *attached.FindDict("result")->FindString("attachmentId");
    const auto& attachment_id = native_attachment_id_;
    auto started = broker_->StartControlledNavigation(page_id_, attachment_id, 42,
      "about:blank", *expiry, generation_);
    ASSERT_NE(started.FindDict("result"), nullptr) << started;
    EXPECT_TRUE(started.FindDict("result")->FindBool("accepted").value_or(false));
    // The real DevTools navigation replaces the same-URL document. Nothing is
    // inferred from URL polling or a fabricated NavigationSimulator commit.
    const auto& ready = native_ready_.Get();
    EXPECT_EQ(ready.FindString("pageId") ? *ready.FindString("pageId") : "", page_id_);
    EXPECT_EQ(ready.FindString("attachmentId") ? *ready.FindString("attachmentId") : "", attachment_id);
    EXPECT_EQ(ready.FindInt("commandId"), 42);
    EXPECT_EQ(ready.FindString("leaseId") ? *ready.FindString("leaseId") : "", *lease.FindString("leaseId"));
    EXPECT_EQ(ready.FindDouble("generation"), static_cast<double>(generation_));
    ASSERT_TRUE(ready.FindBool("ready").value_or(false));
    native_expiry_ = *expiry;
  }
  void InstallBeforeUnload() {
    ASSERT_TRUE(page_);
    ASSERT_TRUE(content::ExecJs(page_.get(),
        "window.onbeforeunload = event => { event.preventDefault(); event.returnValue = 'stay'; };"));
    content::PrepContentsForBeforeUnloadTest(page_.get());
  }
  void ClearBeforeUnload() {
    ASSERT_TRUE(page_);
    ASSERT_TRUE(content::ExecJs(page_.get(), "window.onbeforeunload = null;"));
  }
  base::CallbackListSubscription profile_creation_;
  raw_ptr<Profile> profile_ = nullptr;
  raw_ptr<AuxRuntimeHost> host_ = nullptr;
  raw_ptr<EgressController> controller_ = nullptr;
  base::WeakPtr<content::WebContents> page_;
  uint64_t generation_ = 0;
  int original_count_ = 0;
  std::string page_id_, creation_id_;
  base::DictValue proof_;
  base::test::TestFuture<base::DictValue> created_, close_, replay_, recreated_;
  base::test::TestFuture<bool> input_ack_;
  base::test::TestFuture<AuxRuntimeHost::Response> resume_;
  base::test::TestFuture<AuxRuntimeHost::Response> owner_stop_;
  base::test::TestFuture<AuxRuntimeHost::Response> owner_resume_;
  std::unique_ptr<CdpBroker> broker_;
  base::test::TestFuture<base::DictValue> attached_, native_ready_;
  base::DictValue native_lease_;
  std::string native_attachment_id_;
  double native_expiry_ = 0;
};

IN_PROC_BROWSER_TEST_F(NativeCreatorCloseReceiptBrowserTest,
                       TakeoverPreparationWaitsForRealOriginalFinalDispatch) {
  ASSERT_NO_FATAL_FAILURE(Create());
  auto lease = InstallOriginalLease();
  ASSERT_FALSE(lease.empty());
  NativeCdpMeasurementProducer producer(browser());
  auto arm = producer.Run(NativeCdpMeasurementProducer::Operation::kPrepareTakeover);
  ASSERT_NE(arm.FindString("status"), nullptr);
  ASSERT_EQ(*arm.FindString("status"), "armed");
  ASSERT_NE(arm.FindString("mode"), nullptr);
  EXPECT_EQ(*arm.FindString("mode"), "takeover");
  producer.WaitForFreshDispatches(measurement_ready_.GetCallback());
  EXPECT_FALSE(measurement_ready_.IsReady());
  auto* frame = page_->GetPrimaryMainFrame();
  ASSERT_TRUE(controller_->RecordFinalCdpDispatch(
      {frame->GetWeakDocumentPtr(), page_id_, "cdp", false}, lease));
  EXPECT_TRUE(measurement_ready_.Get());
}

IN_PROC_BROWSER_TEST_F(NativeCreatorCloseReceiptBrowserTest,
                       AttachRetirementCallbackDestroysOriginalWebContents) {
  ASSERT_NO_FATAL_FAILURE(Create());
  ASSERT_NO_FATAL_FAILURE(AttachOriginalWithoutNavigation(base::BindRepeating(
      [](base::WeakPtr<BrowserWindowInterface> owner,
         base::WeakPtr<content::WebContents> page, uint64_t,
         const std::string&, const std::string&, int, const std::string&, bool ready) {
        if (!ready && owner && page) {
          auto* model = owner->GetTabStripModel();
          const int index = model->GetIndexOfWebContents(page.get());
          if (index >= 0) model->DetachAndDeleteWebContentsAt(index);
        }
      }, browser()->GetWeakPtr(), page_)));
  content::TestNavigationManager navigation(page_.get(), GURL("about:blank"));
  auto started = broker_->StartControlledNavigation(page_id_, native_attachment_id_, 71,
      "about:blank", native_expiry_, generation_);
  ASSERT_NE(started.FindDict("result"), nullptr) << started;
  ASSERT_TRUE(navigation.WaitForRequestStart());
  auto replacement = broker_->Attach(page_id_, "agent",
      *native_lease_.FindString("leaseId"), native_expiry_, generation_);
  EXPECT_NE(replacement.FindDict("error"), nullptr) << replacement;
  EXPECT_FALSE(page_);
  EXPECT_EQ(browser()->GetTabStripModel()->count(), original_count_);
}

IN_PROC_BROWSER_TEST_F(NativeCreatorCloseReceiptBrowserTest,
                       AttachRetirementCallbackReplacesSameUrlDocument) {
  ASSERT_NO_FATAL_FAILURE(Create());
  ASSERT_NO_FATAL_FAILURE(AttachOriginalWithoutNavigation(base::BindRepeating(
      [](base::WeakPtr<content::WebContents> page, uint64_t,
         const std::string&, const std::string&, int, const std::string&, bool ready) {
        if (!ready && page) {
          page->Stop();
          EXPECT_TRUE(content::NavigateToURL(page.get(), GURL("about:blank")));
        }
      }, page_)));
  const auto original_document = page_->GetPrimaryMainFrame()->GetWeakDocumentPtr();
  content::TestNavigationManager navigation(page_.get(), GURL("about:blank"));
  auto started = broker_->StartControlledNavigation(page_id_, native_attachment_id_, 72,
      "about:blank", native_expiry_, generation_);
  ASSERT_NE(started.FindDict("result"), nullptr) << started;
  ASSERT_TRUE(navigation.WaitForRequestStart());
  auto replacement = broker_->Attach(page_id_, "agent",
      *native_lease_.FindString("leaseId"), native_expiry_, generation_);
  EXPECT_NE(replacement.FindDict("error"), nullptr) << replacement;
  ASSERT_TRUE(page_);
  EXPECT_FALSE(original_document.AsRenderFrameHostIfValid());
  EXPECT_EQ(page_->GetLastCommittedURL(), GURL("about:blank"));
  EXPECT_NE(broker_->Dispatch(page_id_, native_attachment_id_,
      R"({"id":73,"method":"Runtime.evaluate","params":{"expression":"window.oldCallbackEffect=true"}})",
      native_expiry_, generation_).FindDict("error"), nullptr);
}

IN_PROC_BROWSER_TEST_F(NativeCreatorCloseReceiptBrowserTest,
                       SameProfileHostRecreationRetiresOriginalAuthority) {
  ASSERT_NO_FATAL_FAILURE(Create());
  const auto original_generation = generation_;
  const auto original_host = host_->GetWeakPtr();
  auto lease = InstallOriginalLease();
  ASSERT_FALSE(lease.empty());
  ASSERT_TRUE(controller_->RetireRegisteredRun("creator-browser-run", generation_));
  auto original_resume = controller_->PrepareRunResume("creator-browser-run", generation_);
  ASSERT_TRUE(original_resume);
  AuxCreatorCloseBrowserTestPeer::Destroy(profile_);
  host_ = nullptr;
  EXPECT_FALSE(original_host);
  AuxCreatorCloseBrowserTestPeer::Install(profile_);
  host_ = AuxRuntimeHost::ForProfile(profile_);
  generation_ = AuxCreatorCloseBrowserTestPeer::Publish(host_);
  EXPECT_EQ(original_generation, 1u);
  EXPECT_EQ(generation_, 1u);
  EXPECT_EQ(AuxCreatorCloseBrowserTestPeer::Admitted(host_), generation_);
  EXPECT_TRUE(controller_->CreatorCleanupProof(base::DictValue()
      .Set("pageId", page_id_).Set("creationId", creation_id_), generation_).FindDict("error"));
  EXPECT_TRUE(controller_->ConsumeRunResume("creator-browser-run", *original_resume,
      generation_).FindDict("error"));
  EXPECT_TRUE(controller_->Install(base::DictValue().Set("lease", lease.Clone())
      .Set("expectedUrl", "about:blank")).FindDict("error"));
  // A new connection with the same raw Worker counter cannot adopt the
  // original registered page or its creator/lease/Stop-release tickets.
  ASSERT_NE(lease.FindString("isolationId"), nullptr);
  EXPECT_FALSE(controller_->RegisterIsolation(page_.get(),
      *lease.FindString("isolationId"), "creator-browser-run", "creator-browser-task", 3,
      {"creator-browser-run"}, generation_));
  EXPECT_TRUE(page_);
  AuxCreatorCloseBrowserTestPeer::Create(host_, generation_, base::DictValue()
      .Set("profileId", profile_->GetPath().BaseName().AsUTF8Unsafe())
      .Set("windowId", "main").Set("runId", "fresh-host-run")
      .Set("taskId", "fresh-host-task").Set("taskRevision", 1)
      .Set("background", false).Set("ancestry", base::ListValue().Append("fresh-host-run")),
      recreated_.GetCallback());
  ASSERT_TRUE(recreated_.Wait());
  const auto* new_page = recreated_.Get().FindDict("result");
  ASSERT_NE(new_page, nullptr) << recreated_.Get();
  ASSERT_NE(new_page->FindString("pageId"), nullptr);
  EXPECT_NE(*new_page->FindString("pageId"), page_id_);
  EXPECT_EQ(browser()->GetTabStripModel()->count(), original_count_ + 2);
}

IN_PROC_BROWSER_TEST_F(NativeCreatorCloseReceiptBrowserTest,
                       GenuineCreationMacAckAndFinalDeletionAreOneUse) {
  ASSERT_NO_FATAL_FAILURE(Create());
  ASSERT_NE(proof_.FindString("phase"), nullptr);
  EXPECT_EQ(*proof_.FindString("phase"), "creation");
  Close();
  const auto& reply = close_.Get();
  ASSERT_NE(reply.FindDict("result"), nullptr) << reply;
  EXPECT_TRUE(reply.FindDict("result")->FindBool("closed").value_or(false));
  EXPECT_FALSE(page_);
  EXPECT_EQ(browser()->GetTabStripModel()->count(), original_count_);
  AuxCreatorCloseBrowserTestPeer::Close(host_, generation_, proof_, replay_.GetCallback());
  EXPECT_NE(replay_.Get().FindDict("error"), nullptr);
}

IN_PROC_BROWSER_TEST_F(NativeCreatorCloseReceiptBrowserTest,
                       NativeInstalledLeaseWithoutRuntimeAckRetiresToCloseOnly) {
  ASSERT_NO_FATAL_FAILURE(Create());
  auto context = controller_->Context(base::DictValue().Set("tabId", page_id_)
      .Set("expectedUrl", "about:blank"));
  const auto* value = context.FindDict("result");
  ASSERT_NE(value, nullptr);
  const auto* isolation = value->FindDict("isolation");
  ASSERT_NE(isolation, nullptr);
  ASSERT_NE(isolation->FindString("isolationId"), nullptr);
  auto lease = value->Clone();
  lease.Remove("isolation");
  lease.Remove("personControlled");
  const auto now = static_cast<double>(base::Time::Now().InMillisecondsSinceUnixEpoch());
  lease.Set("leaseId", "creator-actual-install-with-lost-runtime-response")
      .Set("runId", "creator-browser-run").Set("taskId", "creator-browser-task")
      .Set("taskRevision", 3).Set("documentEpoch", 1)
      .Set("isolationId", *isolation->FindString("isolationId"))
      .Set("issuedAt", now).Set("expiresAt", now + 30000);
  // The native effect succeeds. No runtime ActivePage/ACK is manufactured.
  auto installed = controller_->Install(base::DictValue().Set("lease", lease.Clone())
      .Set("expectedUrl", "about:blank"));
  ASSERT_NE(installed.FindDict("result"), nullptr) << installed;
  EXPECT_TRUE(installed.FindDict("result")->FindBool("accepted").value_or(false));
  EXPECT_NE(controller_->CreatorCleanupProof(base::DictValue().Set("pageId", page_id_)
      .Set("creationId", creation_id_), generation_).FindDict("error"), nullptr);
  auto retired = controller_->Revoke(base::DictValue().Set("lease", lease.Clone()));
  ASSERT_NE(retired.FindDict("result"), nullptr) << retired;
  EXPECT_TRUE(retired.FindDict("result")->FindBool("accepted").value_or(false));
  auto cleanup = controller_->CreatorCleanupProof(base::DictValue().Set("pageId", page_id_)
      .Set("creationId", creation_id_), generation_);
  ASSERT_NE(cleanup.FindDict("result"), nullptr) << cleanup;
  proof_ = cleanup.FindDict("result")->Clone();
  ASSERT_NE(proof_.FindString("phase"), nullptr);
  EXPECT_EQ(*proof_.FindString("phase"), "installed_revoke");
  // Queued original Install remains refused; this receipt can only delete.
  EXPECT_NE(controller_->Install(base::DictValue().Set("lease", lease.Clone())
      .Set("expectedUrl", "about:blank")).FindDict("error"), nullptr);
  Close();
  const auto& reply = close_.Get();
  ASSERT_NE(reply.FindDict("result"), nullptr) << reply;
  EXPECT_TRUE(reply.FindDict("result")->FindBool("closed").value_or(false));
  EXPECT_FALSE(page_);
}

IN_PROC_BROWSER_TEST_F(NativeCreatorCloseReceiptBrowserTest,
                       GenuineStartReadyTakeProducesCommittedCloseOnlyReceipt) {
  ASSERT_NO_FATAL_FAILURE(Create());
  const auto original_document = page_->GetPrimaryMainFrame()->GetWeakDocumentPtr();
  ASSERT_NO_FATAL_FAILURE(StartReplacementNavigation());
  const auto& lease = native_lease_;
  const auto& attachment_id = native_attachment_id_;
  const auto expiry = native_expiry_;
  auto receipt = broker_->TakeReadyNavigationReceipt(page_id_, attachment_id, 42, generation_);
  ASSERT_NE(receipt.FindDict("result"), nullptr) << receipt;
  const auto* taken = receipt.FindDict("result");
  EXPECT_EQ(taken->FindString("originalAttachmentId") ? *taken->FindString("originalAttachmentId") : "", attachment_id);
  EXPECT_EQ(taken->FindString("originalLeaseId") ? *taken->FindString("originalLeaseId") : "", *lease.FindString("leaseId"));
  ASSERT_NE(taken->FindString("navigationId"), nullptr);
  EXPECT_FALSE(taken->FindString("navigationId")->empty());
  EXPECT_FALSE(original_document.AsRenderFrameHostIfValid());
  EXPECT_NE(broker_->TakeReadyNavigationReceipt(page_id_, attachment_id, 42,
      generation_).FindDict("error"), nullptr);
  EXPECT_NE(broker_->Dispatch(page_id_, attachment_id,
      R"({"id":43,"method":"Runtime.evaluate","params":{"expression":"window.staleAgentEffect = true"}})",
      expiry, generation_).FindDict("error"), nullptr);
  auto cleanup = controller_->CreatorCleanupProof(base::DictValue().Set("pageId", page_id_)
      .Set("creationId", creation_id_), generation_);
  ASSERT_NE(cleanup.FindDict("result"), nullptr) << cleanup;
  proof_ = cleanup.FindDict("result")->Clone();
  ASSERT_NE(proof_.FindString("phase"), nullptr);
  EXPECT_EQ(*proof_.FindString("phase"), "committed_transition");
  Close();
  const auto& reply = close_.Get();
  ASSERT_NE(reply.FindDict("result"), nullptr) << reply;
  EXPECT_TRUE(reply.FindDict("result")->FindBool("closed").value_or(false));
  EXPECT_FALSE(page_);
}

IN_PROC_BROWSER_TEST_F(NativeCreatorCloseReceiptBrowserTest,
                       NativeStartDeadlineCannotBeExtendedByDelayedTake) {
  ASSERT_NO_FATAL_FAILURE(Create());
  ASSERT_NO_FATAL_FAILURE(StartReplacementNavigation());
  // Hold the actual completed command beyond its native monotonic eight-second
  // cap, while its separately installed lease still has thirty seconds.
  base::RunLoop elapsed;
  base::OneShotTimer timer;
  timer.Start(FROM_HERE, base::Seconds(9), elapsed.QuitClosure());
  elapsed.Run();
  auto delayed = broker_->TakeReadyNavigationReceipt(page_id_, native_attachment_id_,
      42, generation_);
  EXPECT_NE(delayed.FindDict("error"), nullptr);
  EXPECT_NE(controller_->CreatorCleanupProof(base::DictValue().Set("pageId", page_id_)
      .Set("creationId", creation_id_), generation_).FindDict("error"), nullptr);
  EXPECT_NE(broker_->Dispatch(page_id_, native_attachment_id_,
      R"({"id":43,"method":"Runtime.evaluate","params":{"expression":"window.expiredCommandEffect = true"}})",
      native_expiry_, generation_).FindDict("error"), nullptr);
  EXPECT_TRUE(page_);
  EXPECT_EQ(browser()->GetTabStripModel()->count(), original_count_ + 1);
}

IN_PROC_BROWSER_TEST_F(NativeCreatorCloseReceiptBrowserTest,
                       ConnectionRetirementRefusesOriginalAndHumanCanClose) {
  ASSERT_NO_FATAL_FAILURE(Create());
  AuxCreatorCloseBrowserTestPeer::Retire(host_, generation_);
  Close();
  EXPECT_NE(close_.Get().FindDict("error"), nullptr);
  ASSERT_TRUE(page_);
  browser()->GetTabStripModel()->CloseWebContents(page_.get(), TabCloseTypes::CLOSE_NONE);
  base::RunLoop().RunUntilIdle();
  EXPECT_FALSE(page_);
}

IN_PROC_BROWSER_TEST_F(NativeCreatorCloseReceiptBrowserTest,
                       NativePersonRetirementRefusesOriginalCleanup) {
  ASSERT_NO_FATAL_FAILURE(Create());
  const auto document = page_->GetPrimaryMainFrame()->GetWeakDocumentPtr();
  // This calls the genuine native retirement consumer with synthetic timing;
  // physical event provenance/100ms qualification is a separate input fixture.
  controller_->RetireForNativePersonInput(page_.get(), document,
      base::TimeTicks::Now(), base::TimeTicks::Now(), true);
  Close();
  EXPECT_NE(close_.Get().FindDict("error"), nullptr);
  EXPECT_TRUE(page_);
  EXPECT_EQ(browser()->GetTabStripModel()->count(), original_count_ + 1);
}

IN_PROC_BROWSER_TEST_F(NativeCreatorCloseReceiptBrowserTest,
                       GenuineLocalPersonReturnControlCreatesFreshOneUseNativeContext) {
  ASSERT_NO_FATAL_FAILURE(Create());
  const auto document = page_->GetPrimaryMainFrame()->GetWeakDocumentPtr();
  auto retirement = controller_->RetireForNativePersonInput(page_.get(), document,
      base::TimeTicks::Now(), base::TimeTicks::Now(), true);
  ASSERT_TRUE(retirement);
  EXPECT_NE(AuxCreatorCloseBrowserTestPeer::ConsumeResume(host_, page_id_)
      .FindDict("error"), nullptr);
  // Genuine local-person CallApi ingress creates the ticket. The fixture
  // forwards only its fixed consume operation, with no readiness override.
  host_->CallApi("pages.resume", base::WriteJson(base::DictValue()
      .Set("pageId", page_id_)).value_or(""), resume_.GetCallback());
  const auto& reply = resume_.Get();
  ASSERT_TRUE(reply.ok) << reply.error_message;
  const auto row = base::JSONReader::ReadDict(reply.result_json, base::JSON_PARSE_RFC);
  ASSERT_TRUE(row);
  const auto* context = row->FindDict("context");
  ASSERT_NE(context, nullptr);
  EXPECT_FALSE(context->FindBool("personControlled").value_or(true));
  ASSERT_NE(context->FindString("controlGeneration"), nullptr);
  EXPECT_NE(*context->FindString("controlGeneration"),
      *retirement->original_scope.FindString("retiredControlGeneration"));
  EXPECT_EQ(context->FindString("documentToken") ? *context->FindString("documentToken") : "",
      *retirement->original_scope.FindString("documentToken"));
  EXPECT_NE(AuxCreatorCloseBrowserTestPeer::ConsumeResume(host_, page_id_)
      .FindDict("error"), nullptr);
  auto lease = InstallOriginalLease();
  EXPECT_FALSE(lease.empty());
}

IN_PROC_BROWSER_TEST_F(NativeCreatorCloseReceiptBrowserTest,
                       GenuineParentOwnerStopRetiresOnlyRegisteredDescendantAndResumeIsOneUse) {
  ASSERT_NO_FATAL_FAILURE(Create(base::ListValue().Append("creator-browser-run").Append("registered-parent")));
  const auto original_document = page_->GetPrimaryMainFrame()->GetWeakDocumentPtr();
  auto lease = InstallOriginalLease();
  ASSERT_FALSE(lease.empty());
  const EgressRequestContext original{original_document, page_id_, "cdp"};
  ASSERT_TRUE(controller_->RecordFinalCdpDispatch(original, lease));
  auto* human = browser()->GetTabStripModel()->GetWebContentsAt(0);
  ASSERT_NE(human, page_.get());
  const auto human_document = human->GetPrimaryMainFrame()->GetWeakDocumentPtr();
  host_->CallApi("runs.pause", base::WriteJson(base::DictValue()
      .Set("runId", "registered-parent")).value_or(""), owner_stop_.GetCallback());
  // Refusal is synchronous even before the worker/API completion is observed.
  EXPECT_FALSE(controller_->RecordFinalCdpDispatch(original, lease));
  EXPECT_TRUE(owner_stop_.Get().ok);
  EXPECT_TRUE(controller_->HasStoppedRunIntent("registered-parent", generation_));
  EXPECT_NE(controller_->CheckRunResume("registered-parent", generation_).FindDict("error"), nullptr);
  EXPECT_NE(controller_->CheckRunResume("creator-browser-run", generation_).FindDict("error"), nullptr);
  EXPECT_NE(controller_->CheckRunResume("unrelated-run", generation_).FindDict("result"), nullptr);
  EXPECT_FALSE(controller_->HasStoppedRunIntent("unrelated-run", generation_));
  EXPECT_TRUE(human_document.AsRenderFrameHostIfValid());
  EXPECT_NE(controller_->CreatorCleanupProof(base::DictValue().Set("pageId", page_id_)
      .Set("creationId", creation_id_), generation_).FindDict("error"), nullptr);
  host_->CallApi("runs.resume", base::WriteJson(base::DictValue()
      .Set("runId", "registered-parent")).value_or(""), owner_resume_.GetCallback());
  ASSERT_TRUE(owner_resume_.Get().ok) << owner_resume_.Get().error_message;
  EXPECT_FALSE(controller_->HasStoppedRunIntent("registered-parent", generation_));
  // A local Return/Resume does not revive the original lease or old command.
  EXPECT_FALSE(controller_->RecordFinalCdpDispatch(original, lease));
  auto fresh = InstallOriginalLease();
  ASSERT_FALSE(fresh.empty());
  EXPECT_NE(*fresh.FindString("controlGeneration"), *lease.FindString("controlGeneration"));
  EXPECT_TRUE(controller_->RecordFinalCdpDispatch(original, fresh));
  EXPECT_NE(controller_->ConsumeRunResume("registered-parent", "not-native-minted", generation_)
      .FindDict("error"), nullptr);
}

IN_PROC_BROWSER_TEST_F(NativeCreatorCloseReceiptBrowserTest,
                       GenuineBeforeUnloadContinuationDeletesOnlyOriginal) {
  ASSERT_NO_FATAL_FAILURE(Create());
  ASSERT_NO_FATAL_FAILURE(InstallBeforeUnload());
  Close();
  auto* dialog = ui_test_utils::WaitForAppModalDialog();
  ASSERT_NE(dialog, nullptr);
  ASSERT_TRUE(dialog->is_before_unload_dialog());
  ASSERT_NE(dialog->view(), nullptr);
  EXPECT_FALSE(close_.IsReady());
  dialog->view()->AcceptAppModalDialog();
  const auto& reply = close_.Get();
  ASSERT_NE(reply.FindDict("result"), nullptr) << reply;
  EXPECT_TRUE(reply.FindDict("result")->FindBool("closed").value_or(false));
  EXPECT_FALSE(page_);
}

IN_PROC_BROWSER_TEST_F(NativeCreatorCloseReceiptBrowserTest,
                       HeldBeforeUnloadOwnerRetirementCannotDeleteOriginal) {
  ASSERT_NO_FATAL_FAILURE(Create());
  ASSERT_NO_FATAL_FAILURE(InstallBeforeUnload());
  Close();
  auto* dialog = ui_test_utils::WaitForAppModalDialog();
  ASSERT_NE(dialog, nullptr);
  ASSERT_TRUE(dialog->is_before_unload_dialog());
  ASSERT_NE(dialog->view(), nullptr);
  EXPECT_FALSE(close_.IsReady());
  auto mutation = controller_->owner_mutations().Begin();
  ASSERT_TRUE(mutation);
  EXPECT_NE(close_.Get().FindDict("error"), nullptr);
  dialog->view()->AcceptAppModalDialog();
  base::RunLoop().RunUntilIdle();
  ASSERT_TRUE(page_);
  EXPECT_EQ(browser()->GetTabStripModel()->count(), original_count_ + 1);
  ASSERT_TRUE(controller_->owner_mutations().End(*mutation, true));
  ASSERT_NO_FATAL_FAILURE(ClearBeforeUnload());
  browser()->GetTabStripModel()->CloseWebContents(page_.get(), TabCloseTypes::CLOSE_NONE);
  base::RunLoop().RunUntilIdle();
  EXPECT_FALSE(page_);
}

IN_PROC_BROWSER_TEST_F(NativeCreatorCloseReceiptBrowserTest,
                       UserdataRemovalIsNotSuccessfulWebContentsDestruction) {
  ASSERT_NO_FATAL_FAILURE(Create());
  ASSERT_NO_FATAL_FAILURE(InstallBeforeUnload());
  Close();
  auto* dialog = ui_test_utils::WaitForAppModalDialog();
  ASSERT_NE(dialog, nullptr);
  ASSERT_NE(dialog->view(), nullptr);
  EXPECT_FALSE(close_.IsReady());
  ASSERT_NE(NativeCreatorCloseReceipt::FromWebContents(page_.get()), nullptr);
  page_->RemoveUserData(NativeCreatorCloseReceipt::UserDataKey());
  EXPECT_NE(close_.Get().FindDict("error"), nullptr);
  EXPECT_TRUE(page_);
  dialog->view()->AcceptAppModalDialog();
  base::RunLoop().RunUntilIdle();
  ASSERT_TRUE(page_);
  EXPECT_EQ(browser()->GetTabStripModel()->count(), original_count_ + 1);
  ASSERT_NO_FATAL_FAILURE(ClearBeforeUnload());
  browser()->GetTabStripModel()->CloseWebContents(page_.get(), TabCloseTypes::CLOSE_NONE);
  base::RunLoop().RunUntilIdle();
  EXPECT_FALSE(page_);
}

IN_PROC_BROWSER_TEST_F(NativeCreatorCloseReceiptBrowserTest,
                       FinalRealPredicateUserdataDestructionRefusesWithoutDeletion) {
  ASSERT_NO_FATAL_FAILURE(Create());
  ASSERT_NO_FATAL_FAILURE(InstallBeforeUnload());
  Close();
  auto* dialog = ui_test_utils::WaitForAppModalDialog();
  ASSERT_NE(dialog, nullptr);
  ASSERT_NE(dialog->view(), nullptr);
  auto* original = NativeCreatorCloseReceipt::FromWebContents(page_.get());
  ASSERT_NE(original, nullptr);
  NativeCreatorCloseReceiptBrowserTestPeer::RemoveReceiptAfterFinalCurrent(original);
  EXPECT_FALSE(close_.IsReady());
  dialog->view()->AcceptAppModalDialog();
  EXPECT_NE(close_.Get().FindDict("error"), nullptr);
  ASSERT_TRUE(page_);
  EXPECT_EQ(NativeCreatorCloseReceipt::FromWebContents(page_.get()), nullptr);
  EXPECT_EQ(browser()->GetTabStripModel()->count(), original_count_ + 1);
  ASSERT_NO_FATAL_FAILURE(ClearBeforeUnload());
  browser()->GetTabStripModel()->CloseWebContents(page_.get(), TabCloseTypes::CLOSE_NONE);
  base::RunLoop().RunUntilIdle();
  EXPECT_FALSE(page_);
}

IN_PROC_BROWSER_TEST_F(NativeCreatorCloseReceiptBrowserTest,
                       IndependentHumanCloseNeverBecomesAgentSuccess) {
  ASSERT_NO_FATAL_FAILURE(Create());
  ASSERT_NO_FATAL_FAILURE(InstallBeforeUnload());
  Close();
  auto* dialog = ui_test_utils::WaitForAppModalDialog();
  ASSERT_NE(dialog, nullptr);
  ASSERT_NE(dialog->view(), nullptr);
  EXPECT_FALSE(close_.IsReady());
  browser()->GetTabStripModel()->CloseWebContents(page_.get(), TabCloseTypes::CLOSE_NONE);
  EXPECT_NE(close_.Get().FindDict("error"), nullptr);
  EXPECT_TRUE(page_);
  dialog->view()->AcceptAppModalDialog();
  base::RunLoop().RunUntilIdle();
  EXPECT_FALSE(page_);
}

class RetireCreatorAtFinalObserver : public TabStripModelObserver {
 public:
  explicit RetireCreatorAtFinalObserver(EgressController* controller)
      : controller_(controller) {}
  void OnTabWillBeRemoved(tabs::TabInterface*, int) override {
    mutation_ = controller_->owner_mutations().Begin();
  }
  std::optional<std::string> mutation_;
 private:
  raw_ptr<EgressController> controller_;
};

IN_PROC_BROWSER_TEST_F(NativeCreatorCloseReceiptBrowserTest,
                       ObserverRetirementRefusesBeforeDestroyTabFeatures) {
  ASSERT_NO_FATAL_FAILURE(Create());
  auto* model = browser()->GetTabStripModel();
  RetireCreatorAtFinalObserver observer(controller_);
  model->AddObserver(&observer);
  Close();
  const bool completed = close_.Wait();
  model->RemoveObserver(&observer);
  ASSERT_TRUE(completed);
  EXPECT_NE(close_.Get().FindDict("error"), nullptr);
  ASSERT_TRUE(observer.mutation_);
  EXPECT_TRUE(page_);
  EXPECT_EQ(model->GetIndexOfWebContents(page_.get()), original_count_);
  EXPECT_TRUE(controller_->owner_mutations().End(*observer.mutation_, true));
  model->CloseWebContents(page_.get(), TabCloseTypes::CLOSE_NONE);
  base::RunLoop().RunUntilIdle();
  EXPECT_FALSE(page_);
}
}  // namespace aux
