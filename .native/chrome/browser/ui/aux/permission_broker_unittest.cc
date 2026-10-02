// Copyright 2026 The Aux Authors
#include "chrome/browser/ui/aux/permission_broker.h"
#include <cmath>
#include "pdf/buildflags.h"
#include "components/actor/core/shared_types.h"
#include "chrome/common/chrome_render_frame.mojom.h"
#include "content/public/browser/web_contents_observer.h"
#include "mojo/public/cpp/bindings/associated_receiver_set.h"
#include "third_party/blink/public/common/associated_interfaces/associated_interface_provider.h"
#include "url/origin.h"

#include "chrome/browser/ui/browser.h"
#include "base/functional/bind.h"
#include "base/memory/weak_ptr.h"
#include "base/json/json_reader.h"
#include "base/json/json_writer.h"
#include "base/run_loop.h"
#include "base/test/task_environment.h"
#include "chrome/browser/ui/aux/egress_controller.h"
#include "chrome/browser/ui/aux/page_identity.h"
#include "chrome/browser/ui/aux/runtime_host.h"
#include "chrome/browser/ui/aux/tab_catalog.h"
#include "chrome/browser/ui/tabs/tab_strip_model.h"
#include "chrome/test/base/browser_with_test_window_test.h"
#include "chrome/test/base/testing_profile.h"
#include "components/permissions/permission_request_manager.h"
#include "components/permissions/request_type.h"
#include "components/permissions/test/mock_permission_prompt_factory.h"
#include "components/permissions/test/mock_permission_request.h"
#include "content/public/browser/site_instance.h"
#include "content/public/test/web_contents_tester.h"
#include "testing/gtest/include/gtest/gtest.h"

// Transport and the exact empty synthetic Profile stylesheet renderer are
// fixture producers. Production commit conditions, owner BEGIN/receipts,
// Broker Current/Answer and actual manager permission effects run unchanged.
class AuxRuntimeHostTestPeer {
 public:
  static AuxRuntimeHost* Install(Profile* profile, AuxRuntimeHost::TestDispatch dispatch) {
    return AuxRuntimeHost::InstallTestDispatch(profile, std::move(dispatch));
  }
  static void Destroy(Profile* profile) { AuxRuntimeHost::RemoveTestDispatch(profile); }
  static void Disconnect(AuxRuntimeHost* host) { host->OnPumpDone(false); }
};

namespace aux {
class PermissionFixtureRenderFrame : public chrome::mojom::ChromeRenderFrame {
 public:
  PermissionFixtureRenderFrame() = default;
  ~PermissionFixtureRenderFrame() override = default;

  void OverrideBinder(content::RenderFrameHost* rfh) {
    blink::AssociatedInterfaceProvider* remote_interfaces =
        rfh->GetRemoteAssociatedInterfaces();
    remote_interfaces->OverrideBinderForTesting(
        chrome::mojom::ChromeRenderFrame::Name_,
        base::BindRepeating(&PermissionFixtureRenderFrame::Bind,
                            weak_factory_.GetWeakPtr()));
  }

  // chrome::mojom::ChromeRenderFrame:
  void SetAuxZapStylesheet(const std::string& origin,
                           uint64_t sequence,
                           const std::string& stylesheet,
                           SetAuxZapStylesheetCallback callback) override {
    const GURL url(origin);
    const bool exact_empty = url.is_valid() && url.SchemeIsHTTPOrHTTPS() &&
        url::Origin::Create(url).Serialize() == origin && sequence == 0 && stylesheet.empty();
    EXPECT_TRUE(exact_empty) << "Only the synthetic empty Profile policy is implemented";
    std::move(callback).Run(exact_empty, false);
  }
  void SetWindowFeatures(
      blink::mojom::WindowFeaturesPtr window_features) override {}
  void RequestReloadImageForContextNode() override {}
  void RequestBitmapForContextNode(
      RequestBitmapForContextNodeCallback callback) override {}
  void RequestBitmapForContextNodeWithBoundsHint(
      RequestBitmapForContextNodeWithBoundsHintCallback callback) override {}
  void RequestBoundsHintForAllImages(
      RequestBoundsHintForAllImagesCallback callback) override {}
  void RequestImageForContextNode(
      int32_t image_min_area_pixels,
      const gfx::Size& image_max_size_pixels,
      chrome::mojom::ImageFormat image_format,
      int32_t quality,
      RequestImageForContextNodeCallback callback) override {}
  void ExecuteWebUIJavaScript(const std::u16string& javascript) override {}
  void GetMediaFeedURL(GetMediaFeedURLCallback callback) override {}
  void LoadBlockedPlugins(const std::string& identifier) override {}
  void SetShouldDeferMediaLoad(bool should_defer) override {}

  void InitializeTool(actor::mojom::ToolInvocationPtr request,
                      InitializeToolCallback callback) override {
    std::move(callback).Run(
        nullptr);
  }
  void ExecuteTool(const actor::TaskId& task_id,
                   ExecuteToolCallback callback) override {
    std::move(callback).Run(nullptr);
  }
  void InvokeTool(actor::mojom::ToolInvocationPtr request,
                  InvokeToolCallback callback) override {
    std::move(callback).Run(nullptr);
  }
  void StartActorJournal(
      mojo::PendingAssociatedRemote<actor::mojom::JournalClient> client)
      override {}
  void CreatePageStabilityMonitor(
      mojo::PendingReceiver<
          page_content_annotations::mojom::PageStabilityMonitor> monitor,
      const actor::TaskId& task_id,
      bool supports_paint_stability) override {}
  void CancelTool(const actor::TaskId& task_id) override {}
  void GetCrossDocumentScriptToolResult(
      const base::UnguessableToken& execution_id,
      GetCrossDocumentScriptToolResultCallback callback) override {
    std::move(callback).Run("");
  }
#if BUILDFLAG(IS_ANDROID)
  void SetCCTClientHeader(const std::string& header) override {}
#endif
#if BUILDFLAG(ENABLE_PDF)
  void PdfPageCaptured(const std::u16string& contents,
                       const std::string& pdf_lang,
                       const GURL& page_url) override {}
#endif

 private:
  void Bind(mojo::ScopedInterfaceEndpointHandle handle) {
    receivers_.Add(
        this, mojo::PendingAssociatedReceiver<chrome::mojom::ChromeRenderFrame>(
                  std::move(handle)));
  }

  mojo::AssociatedReceiverSet<chrome::mojom::ChromeRenderFrame> receivers_;
  base::WeakPtrFactory<PermissionFixtureRenderFrame> weak_factory_{this};
};


class PermissionFixtureFrameBindings : public content::WebContentsObserver {
 public:
  explicit PermissionFixtureFrameBindings(content::WebContents* page) : content::WebContentsObserver(page) {
    renderer_.OverrideBinder(page->GetPrimaryMainFrame());
  }
  void RenderFrameCreated(content::RenderFrameHost* frame) override { renderer_.OverrideBinder(frame); }
 private:
  PermissionFixtureRenderFrame renderer_;
};

class PermissionBrokerTest : public BrowserWithTestWindowTest {
 public:
  PermissionBrokerTest() : BrowserWithTestWindowTest(base::test::TaskEnvironment::TimeSource::MOCK_TIME) {}
  struct Call {
    bool internal;
    std::string method;
    base::DictValue params;
    AuxRuntimeHost::ResponseCallback reply;
  };
  void SetUp() override {
    BrowserWithTestWindowTest::SetUp();
    controller_ = EgressController::ForProfile(profile());
    host_ = AuxRuntimeHostTestPeer::Install(profile(), base::BindRepeating(
        [](PermissionBrokerTest* self, bool internal, std::string method,
           std::string json, AuxRuntimeHost::ResponseCallback reply) {
          auto params = base::JSONReader::ReadDict(json, base::JSON_PARSE_RFC);
          CHECK(params);
          if (method == "zap.snapshot") {
            EXPECT_TRUE(internal);
            EXPECT_EQ(params->FindString("profileId") ? *params->FindString("profileId") : "",
                self->profile()->GetPath().BaseName().AsUTF8Unsafe());
            // This fixture Profile has no saved Zap rules. Keep the real
            // commit condition and renderer acknowledgement pipeline active.
            std::move(reply).Run({true, "[]", "", ""});
            return;
          }
          self->calls_.push_back({internal, std::move(method), std::move(*params), std::move(reply)});
        }, base::Unretained(this)));
    auto [id, partition] = controller_->ReserveIsolation("run", "task", 4);
    isolation_id_ = id;
    auto instance = content::SiteInstance::CreateForFixedStoragePartition(profile(), origin_, partition);
    auto contents = content::WebContentsTester::CreateTestWebContents(profile(), instance);
    page_ = contents.get();
    browser()->tab_strip_model()->AppendWebContents(std::move(contents), true);
    frame_bindings_ = std::make_unique<PermissionFixtureFrameBindings>(page_);
    NavigateAndCommit(page_, origin_);
    page_->WasShown();
    ASSERT_TRUE(controller_->RegisterIsolation(page_, id, "run", "task", 4));
    page_id_ = PageIdentity::GetOrCreate(profile(), page_);
    ASSERT_EQ(TabCatalog::GetForProfile(profile())->FindPage(page_id_), page_);
    auto context_reply = controller_->Context(base::DictValue().Set("tabId", page_id_).Set("expectedUrl", origin_.spec()));
    auto* context = context_reply.FindDict("result");
    ASSERT_TRUE(context);
    lease_ = context->Clone();
    lease_.Remove("isolation");
    lease_.Set("leaseId", "lease");
    lease_.Set("runId", "run");
    lease_.Set("taskId", "task");
    lease_.Set("taskRevision", 4);
    lease_.Set("isolationId", id);
    lease_.Set("documentEpoch", 1);
    Renew();
    ASSERT_FALSE(controller_->PermissionAuthority(page_->GetPrimaryMainFrame()).empty());
    permissions::PermissionRequestManager::CreateForWebContents(page_);
    manager_ = permissions::PermissionRequestManager::FromWebContents(page_);
    manager_->set_enabled_app_level_notification_permission_for_testing(true);
    prompts_ = std::make_unique<permissions::MockPermissionPromptFactory>(manager_);
    PermissionBroker::CreateForWebContents(page_);
  }
  void TearDown() override {
    prompts_.reset();
    frame_bindings_.reset();
    host_ = nullptr;
    AuxRuntimeHostTestPeer::Destroy(profile());
    calls_.clear();
    manager_ = nullptr; page_ = nullptr; controller_ = nullptr;
    BrowserWithTestWindowTest::TearDown();
  }
  void Renew() {
    const double now = static_cast<double>(base::Time::Now().InMillisecondsSinceUnixEpoch());
    if (!lease_.Find("issuedAt")) lease_.Set("issuedAt", now);
    lease_.Set("expiresAt", now + 30000);
    auto result = controller_->Install(base::DictValue().Set("lease", lease_.Clone()).Set("expectedUrl", origin_.spec()));
    ASSERT_TRUE(result.FindDict("result"));
  }
  void Prompt() {
    manager_->AddRequest(page_->GetPrimaryMainFrame(), std::make_unique<permissions::MockPermissionRequest>(
        origin_, permissions::RequestType::kNotifications, state_.GetWeakPtr()));
    manager_->DocumentOnLoadCompletedInPrimaryMainFrame();
    base::RunLoop().RunUntilIdle();
    ASSERT_TRUE(manager_->IsRequestInProgress());
    ASSERT_NE(Find("permission.request"), nullptr);
  }
  Call* Find(const std::string& method) {
    for (auto& call : calls_) if (call.method == method && call.reply) return &call;
    return nullptr;
  }
  void Reply(const std::string& method, bool ok, base::DictValue body, bool drain = true) {
    auto* call = Find(method); ASSERT_TRUE(call);
    auto json = base::WriteJson(body); ASSERT_TRUE(json);
    auto reply = std::move(call->reply);
    std::move(reply).Run({ok, *json, ok ? "" : "conflict", ok ? "" : "CAS failed"});
    if (drain) base::RunLoop().RunUntilIdle();
  }
  void Allow(bool drain = true) {
    auto* request = Find("permission.request"); ASSERT_TRUE(request);
    EXPECT_TRUE(request->internal);
    const auto* batch = request->params.FindString("batchId"); ASSERT_TRUE(batch);
    auto at = request->params.FindDouble("requestedAt"); ASSERT_TRUE(at);
    EXPECT_EQ(*at, std::floor(*at));
    Reply("permission.request", true, base::DictValue().Set("batchId", *batch).Set("decision", "allow"), drain);
  }
  void DestroyPage() {
    auto contents = browser()->tab_strip_model()->DetachWebContentsAtForInsertion(
        browser()->tab_strip_model()->GetIndexOfWebContents(page_));
    page_ = nullptr; manager_ = nullptr; contents.reset();
  }
  void RevokeLease() { controller_->Revoke(base::DictValue().Set("leaseId", "lease")); }
  bool RevokeAndCheckAuthority() {
    RevokeLease();
    return !controller_->PermissionAuthority(page_->GetPrimaryMainFrame()).empty();
  }
  bool ReplaceAndCheckAuthority() {
    NavigateAndCommit(page_, origin_);
    return !controller_->PermissionAuthority(page_->GetPrimaryMainFrame()).empty();
  }
  bool DestroyAndCheckDocument(content::WeakDocumentPtr document) {
    DestroyPage();
    return document.AsRenderFrameHostIfValid() &&
        !controller_->PermissionAuthority(document.AsRenderFrameHostIfValid()).empty();
  }
  void Mutate(const std::string& method = "safety.originPolicies.set", bool internal = false) {
    auto done = base::BindOnce([](AuxRuntimeHost::Response) {});
    if (internal) host_->CallInternal(method, "{}", std::move(done));
    else host_->CallApi(method, "{}", std::move(done));
  }
 protected:
  std::vector<Call> calls_;
  raw_ptr<EgressController> controller_ = nullptr;
  raw_ptr<AuxRuntimeHost> host_ = nullptr;
  raw_ptr<content::WebContents> page_ = nullptr;
  raw_ptr<permissions::PermissionRequestManager> manager_ = nullptr;
  std::unique_ptr<permissions::MockPermissionPromptFactory> prompts_;
  std::unique_ptr<PermissionFixtureFrameBindings> frame_bindings_;
  permissions::MockPermissionRequest::MockPermissionRequestState state_;
  GURL origin_{"https://agent.test/"};
  std::string isolation_id_, page_id_;
  base::DictValue lease_;
};

TEST_F(PermissionBrokerTest, UnrelatedSuccessfulMutationResumesOnlyAfterReceipt) {
  Prompt(); Allow(false); Mutate(); base::RunLoop().RunUntilIdle();
  EXPECT_FALSE(state_.granted); EXPECT_TRUE(controller_->owner_mutations().pending());
  Reply("safety.originPolicies.set", true, base::DictValue());
  EXPECT_TRUE(state_.granted); EXPECT_TRUE(state_.finished);
}
TEST_F(PermissionBrokerTest, MatchingRevocationDropsQueuedAllow) {
  Prompt(); Mutate("safety.grants.revoke"); Allow(); EXPECT_FALSE(state_.granted);
  controller_->Revoke(base::DictValue().Set("leaseId", "lease"));
  Reply("safety.grants.revoke", true, base::DictValue());
  EXPECT_FALSE(state_.granted); EXPECT_NE(Find("permission.invalidate"), nullptr);
}
TEST_F(PermissionBrokerTest, EveryOverlapReceiptRequiredAndForeignReplayCannotRelease) {
  Prompt(); Mutate(); Mutate("safety.grants.revoke"); Allow();
  EXPECT_FALSE(controller_->owner_mutations().End("foreign", true));
  Reply("safety.originPolicies.set", true, base::DictValue()); EXPECT_FALSE(state_.granted);
  Reply("safety.grants.revoke", true, base::DictValue()); EXPECT_TRUE(state_.granted);
}
TEST_F(PermissionBrokerTest, FailedOwnerMutationCannotReplayConsumedAllow) {
  Prompt(); Mutate(); Allow(); Reply("safety.originPolicies.set", false, base::DictValue());
  EXPECT_FALSE(state_.granted); EXPECT_EQ(controller_->owner_mutations().failure_epoch(), 1u);
  EXPECT_NE(Find("permission.invalidate"), nullptr);
}
TEST_F(PermissionBrokerTest, DestroyedHostRetiresHeldConsentAndTokens) {
  Prompt(); Mutate(); Allow(); host_ = nullptr; AuxRuntimeHostTestPeer::Destroy(profile());
  EXPECT_FALSE(state_.granted); EXPECT_FALSE(controller_->owner_mutations().pending());
  EXPECT_EQ(controller_->owner_mutations().failure_epoch(), 1u);
}
TEST_F(PermissionBrokerTest, DisconnectedHostDropsHeldConsent) {
  Prompt(); Mutate(); Allow(); AuxRuntimeHostTestPeer::Disconnect(host_);
  EXPECT_FALSE(state_.granted); EXPECT_FALSE(controller_->owner_mutations().pending());
  EXPECT_EQ(controller_->owner_mutations().failure_epoch(), 1u);
}
TEST_F(PermissionBrokerTest, DifferentProfileMutationDoesNotPauseThisProfile) {
  TestingProfile other;
  auto* other_controller = EgressController::ForProfile(&other);
  auto token = other_controller->owner_mutations().Begin(); ASSERT_TRUE(token);
  Prompt(); Allow(); EXPECT_TRUE(state_.granted);
  EXPECT_TRUE(other_controller->owner_mutations().End(*token, false));
}
TEST_F(PermissionBrokerTest, WrongBatchCannotCauseNativeAcceptance) {
  Prompt(); Reply("permission.request", true, base::DictValue().Set("batchId", "foreign").Set("decision", "allow"));
  EXPECT_FALSE(state_.granted); EXPECT_NE(Find("permission.invalidate"), nullptr);
}
TEST_F(PermissionBrokerTest, ReplacementDocumentCannotAcceptHeldReply) {
  Prompt(); Mutate(); Allow(); NavigateAndCommit(page_, origin_);
  Reply("safety.originPolicies.set", true, base::DictValue()); EXPECT_FALSE(state_.granted);
}
TEST_F(PermissionBrokerTest, SameLeaseRenewalKeepsImmutableRequestIdentity) {
  Prompt(); Mutate(); Allow();
  task_environment()->FastForwardBy(base::Seconds(10)); Renew();
  EXPECT_EQ(Find("permission.invalidate"), nullptr);
  Reply("safety.originPolicies.set", true, base::DictValue()); EXPECT_TRUE(state_.granted);
}
TEST_F(PermissionBrokerTest, HeldDeadlineCancelsDespiteRealLeaseRenewal) {
  Prompt(); Mutate(); Allow();
  for (int i = 0; i < 12; ++i) { task_environment()->FastForwardBy(base::Seconds(10)); Renew(); }
  Reply("safety.originPolicies.set", true, base::DictValue()); EXPECT_FALSE(state_.granted);
  EXPECT_NE(Find("permission.invalidate"), nullptr);
}
TEST_F(PermissionBrokerTest, InternalCallsCannotOriginateOwnerFence) {
  Prompt(); Mutate("safety.grants.revoke", true);
  EXPECT_FALSE(controller_->owner_mutations().pending()); Allow(); EXPECT_TRUE(state_.granted);
}
TEST_F(PermissionBrokerTest, BrowserResolverRejectsForeignBatchAndKeepsRealPendingRequest) {
  Prompt();
  EXPECT_FALSE(manager_->ResolveRequestsFromBrowser({nullptr}, true, base::BindRepeating(
      [](EgressController* controller, content::RenderFrameHost* frame) {
        return !controller->PermissionAuthority(frame).empty();
      }, controller_.get(), page_->GetPrimaryMainFrame())));
  EXPECT_TRUE(manager_->IsRequestInProgress()); EXPECT_FALSE(state_.granted);
  Allow(); EXPECT_TRUE(state_.granted);
}
TEST_F(PermissionBrokerTest, HiddenDeniedReplyUsesActualManagerDenialPipeline) {
  AddTab(browser(), GURL("https://other.test/")); page_->WasHidden(); Prompt();
  auto* request = Find("permission.request"); ASSERT_TRUE(request);
  const auto* batch = request->params.FindString("batchId"); ASSERT_TRUE(batch);
  Reply("permission.request", true, base::DictValue().Set("batchId", *batch).Set("decision", "deny"));
  EXPECT_FALSE(state_.granted); EXPECT_TRUE(state_.finished);
}
TEST_F(PermissionBrokerTest, GenuineHiddenReadyBatchAcceptsWithoutForegroundPrompt) {
  AddTab(browser(), GURL("https://other.test/")); page_->WasHidden();
  Prompt(); EXPECT_FALSE(prompts_->is_visible()); Allow();
  EXPECT_TRUE(state_.granted); EXPECT_TRUE(state_.finished);
}
TEST_F(PermissionBrokerTest, VisiblePromptCanBecomeBackgroundWhileOwnerMutationHeld) {
  Prompt(); Mutate(); Allow();
  auto* request = Find("permission.invalidate"); EXPECT_EQ(request, nullptr);
  AddTab(browser(), GURL("https://other.test/")); page_->WasHidden();
  EXPECT_FALSE(prompts_->is_visible()); EXPECT_TRUE(manager_->IsRequestInProgress());
  EXPECT_EQ(Find("permission.invalidate"), nullptr);
  Reply("safety.originPolicies.set", true, base::DictValue()); EXPECT_TRUE(state_.granted);
}
TEST_F(PermissionBrokerTest, BackgroundMatchingRevocationStillPreventsEffects) {
  AddTab(browser(), GURL("https://other.test/")); page_->WasHidden();
  Prompt(); Mutate(); Allow(); controller_->Revoke(base::DictValue().Set("leaseId", "lease"));
  Reply("safety.originPolicies.set", true, base::DictValue()); EXPECT_FALSE(state_.granted);
  EXPECT_NE(Find("permission.invalidate"), nullptr);
}
TEST_F(PermissionBrokerTest, HiddenPersonRequestWaitsForAttendedNativePrompt) {
  controller_->Revoke(base::DictValue().Set("leaseId", "lease"));
  AddTab(browser(), GURL("https://other.test/")); page_->WasHidden();
  manager_->AddRequest(page_->GetPrimaryMainFrame(), std::make_unique<permissions::MockPermissionRequest>(
      origin_, permissions::RequestType::kNotifications, state_.GetWeakPtr()));
  manager_->DocumentOnLoadCompletedInPrimaryMainFrame(); base::RunLoop().RunUntilIdle();
  EXPECT_TRUE(manager_->IsRequestInProgress()); EXPECT_FALSE(prompts_->is_visible());
  EXPECT_EQ(Find("permission.request"), nullptr); EXPECT_FALSE(state_.granted);
  browser()->tab_strip_model()->ActivateTabAt(1); page_->WasShown(); base::RunLoop().RunUntilIdle();
  EXPECT_TRUE(prompts_->is_visible()); EXPECT_EQ(Find("permission.request"), nullptr);
  manager_->Accept(PromptOptions{}); EXPECT_TRUE(state_.granted);
}
TEST_F(PermissionBrokerTest, SupportedNativeKeysComeFromActualRequestTypeProducer) {
  for (auto type : {permissions::RequestType::kNotifications, permissions::RequestType::kClipboard,
                    permissions::RequestType::kIdleDetection, permissions::RequestType::kLocalFonts,
                    permissions::RequestType::kMultipleDownloads, permissions::RequestType::kKeyboardLock,
                    permissions::RequestType::kPointerLock}) {
    SCOPED_TRACE(permissions::PermissionKeyForRequestType(type));
    permissions::MockPermissionRequest::MockPermissionRequestState state;
    manager_->AddRequest(page_->GetPrimaryMainFrame(), std::make_unique<permissions::MockPermissionRequest>(
        origin_, type, state.GetWeakPtr()));
    manager_->DocumentOnLoadCompletedInPrimaryMainFrame(); base::RunLoop().RunUntilIdle();
    ASSERT_TRUE(manager_->IsRequestInProgress());
    auto* request = Find("permission.request"); ASSERT_TRUE(request);
    auto* types = request->params.FindList("permissionTypes"); ASSERT_TRUE(types); ASSERT_EQ(types->size(), 1u);
    EXPECT_EQ((*types)[0].GetString(), permissions::PermissionKeyForRequestType(type));
    EXPECT_FALSE(state.granted);
    manager_->Dismiss(PromptOptions{}); base::RunLoop().RunUntilIdle(); calls_.clear();
  }
}
TEST_F(PermissionBrokerTest, UnsupportedNativeRequestRemainsAttended) {
  manager_->AddRequest(page_->GetPrimaryMainFrame(), std::make_unique<permissions::MockPermissionRequest>(
      origin_, permissions::RequestType::kGeolocation, state_.GetWeakPtr()));
  manager_->DocumentOnLoadCompletedInPrimaryMainFrame(); base::RunLoop().RunUntilIdle();
  ASSERT_TRUE(manager_->IsRequestInProgress());
  EXPECT_EQ(Find("permission.request"), nullptr); EXPECT_FALSE(state_.granted);
}
TEST_F(PermissionBrokerTest, ReplacementRequestCannotReceiveAlreadyQueuedAllow) {
  Prompt(); Allow(false); manager_->Dismiss(PromptOptions{});
  permissions::MockPermissionRequest::MockPermissionRequestState replacement;
  manager_->AddRequest(page_->GetPrimaryMainFrame(), std::make_unique<permissions::MockPermissionRequest>(
      origin_, permissions::RequestType::kClipboard, replacement.GetWeakPtr()));
  manager_->DocumentOnLoadCompletedInPrimaryMainFrame(); base::RunLoop().RunUntilIdle();
  EXPECT_FALSE(state_.granted); EXPECT_FALSE(replacement.granted);
  manager_->Dismiss(PromptOptions{});
}
TEST_F(PermissionBrokerTest, PersonPageWithoutRealLeaseStaysAttended) {
  controller_->Revoke(base::DictValue().Set("leaseId", "lease"));
  manager_->AddRequest(page_->GetPrimaryMainFrame(), std::make_unique<permissions::MockPermissionRequest>(
      origin_, permissions::RequestType::kNotifications, state_.GetWeakPtr()));
  manager_->DocumentOnLoadCompletedInPrimaryMainFrame(); base::RunLoop().RunUntilIdle();
  ASSERT_TRUE(manager_->IsRequestInProgress());
  EXPECT_EQ(Find("permission.request"), nullptr); EXPECT_FALSE(state_.granted);
  manager_->Accept(PromptOptions{}); EXPECT_TRUE(state_.granted);
}

TEST_F(PermissionBrokerTest, DenyIsImmediateWhileActualOwnerMutationPending) {
  Prompt(); Mutate();
  auto* request = Find("permission.request"); ASSERT_TRUE(request);
  const auto* batch = request->params.FindString("batchId"); ASSERT_TRUE(batch);
  Reply("permission.request", true, base::DictValue().Set("batchId", *batch).Set("decision", "deny"));
  EXPECT_TRUE(controller_->owner_mutations().pending());
  EXPECT_FALSE(state_.granted); EXPECT_TRUE(state_.finished);
  EXPECT_FALSE(manager_->IsRequestInProgress());
  Reply("safety.originPolicies.set", true, base::DictValue());
  EXPECT_FALSE(state_.granted);
}
TEST_F(PermissionBrokerTest, ResolverFinalBoundaryRejectsActualLeaseRevocation) {
  Prompt();
  std::vector<const permissions::PermissionRequest*> batch;
  for (const auto& request : manager_->Requests()) batch.push_back(request.get());
  EXPECT_FALSE(manager_->ResolveRequestsFromBrowser(batch, true, base::BindRepeating(&PermissionBrokerTest::RevokeAndCheckAuthority, base::Unretained(this))));
  EXPECT_FALSE(state_.granted); EXPECT_TRUE(manager_->IsRequestInProgress());
  EXPECT_NE(Find("permission.invalidate"), nullptr);
}
TEST_F(PermissionBrokerTest, ResolverFinalBoundaryRejectsActualDocumentReplacement) {
  Prompt();
  std::vector<const permissions::PermissionRequest*> batch;
  for (const auto& request : manager_->Requests()) batch.push_back(request.get());
  EXPECT_FALSE(manager_->ResolveRequestsFromBrowser(batch, true, base::BindRepeating(&PermissionBrokerTest::ReplaceAndCheckAuthority, base::Unretained(this))));
  EXPECT_FALSE(state_.granted); EXPECT_NE(Find("permission.invalidate"), nullptr);
}
TEST_F(PermissionBrokerTest, ResolverFinalBoundarySurvivesActualManagerDestruction) {
  Prompt();
  std::vector<const permissions::PermissionRequest*> batch;
  for (const auto& request : manager_->Requests()) batch.push_back(request.get());
  const auto document = page_->GetPrimaryMainFrame()->GetWeakDocumentPtr();
  auto* manager = manager_.get();
  EXPECT_FALSE(manager->ResolveRequestsFromBrowser(batch, true, base::BindRepeating(&PermissionBrokerTest::DestroyAndCheckDocument, base::Unretained(this), document)));
  EXPECT_FALSE(state_.granted); EXPECT_TRUE(state_.finished);
}
TEST_F(PermissionBrokerTest, ActualGrantCallbackCanDestroyManagerWithoutPostEffectAccess) {
  auto request = std::make_unique<permissions::MockPermissionRequest>(
      origin_, permissions::RequestType::kNotifications, state_.GetWeakPtr());
  request->RegisterOnPermissionDecidedCallback(base::BindOnce(&PermissionBrokerTest::DestroyPage, base::Unretained(this)));
  manager_->AddRequest(page_->GetPrimaryMainFrame(), std::move(request));
  manager_->DocumentOnLoadCompletedInPrimaryMainFrame(); base::RunLoop().RunUntilIdle();
  ASSERT_NE(Find("permission.request"), nullptr); Allow();
  EXPECT_TRUE(state_.granted); EXPECT_TRUE(state_.finished); EXPECT_EQ(page_, nullptr);
}
TEST_F(PermissionBrokerTest, ActualDenyCallbackCanDestroyManagerWithoutPostEffectAccess) {
  auto request = std::make_unique<permissions::MockPermissionRequest>(
      origin_, permissions::RequestType::kNotifications, state_.GetWeakPtr());
  request->RegisterOnPermissionDecidedCallback(base::BindOnce(&PermissionBrokerTest::DestroyPage, base::Unretained(this)));
  manager_->AddRequest(page_->GetPrimaryMainFrame(), std::move(request));
  manager_->DocumentOnLoadCompletedInPrimaryMainFrame(); base::RunLoop().RunUntilIdle();
  auto* call = Find("permission.request"); ASSERT_TRUE(call);
  const auto* batch = call->params.FindString("batchId"); ASSERT_TRUE(batch);
  Reply("permission.request", true, base::DictValue().Set("batchId", *batch).Set("decision", "deny"));
  EXPECT_FALSE(state_.granted); EXPECT_TRUE(state_.finished); EXPECT_EQ(page_, nullptr);
}

TEST_F(PermissionBrokerTest, OriginalDecisionMutationCancelsUntouchedDuplicateWithoutReplay) {
  permissions::MockPermissionRequest::MockPermissionRequestState duplicate_state;
  auto request = std::make_unique<permissions::MockPermissionRequest>(
      origin_, permissions::RequestType::kNotifications, state_.GetWeakPtr());
  auto duplicate = request->CreateDuplicateRequest(duplicate_state.GetWeakPtr());
  request->RegisterOnPermissionDecidedCallback(base::BindOnce(&PermissionBrokerTest::Mutate, base::Unretained(this), std::string("safety.originPolicies.set"), false));
  manager_->AddRequest(page_->GetPrimaryMainFrame(), std::move(request));
  manager_->AddRequest(page_->GetPrimaryMainFrame(), std::move(duplicate));
  manager_->DocumentOnLoadCompletedInPrimaryMainFrame(); base::RunLoop().RunUntilIdle();
  ASSERT_NE(Find("permission.request"), nullptr); Allow();
  EXPECT_TRUE(state_.granted); EXPECT_TRUE(state_.finished);
  EXPECT_FALSE(duplicate_state.granted); EXPECT_TRUE(duplicate_state.cancelled);
  EXPECT_TRUE(duplicate_state.finished); EXPECT_FALSE(manager_->IsRequestInProgress());
  Reply("safety.originPolicies.set", true, base::DictValue());
  EXPECT_TRUE(state_.granted); EXPECT_FALSE(duplicate_state.granted);
}
TEST_F(PermissionBrokerTest, DuplicateDecisionRevocationCancelsLaterDuplicateWithoutReplay) {
  permissions::MockPermissionRequest::MockPermissionRequestState first_duplicate, later_duplicate;
  auto request = std::make_unique<permissions::MockPermissionRequest>(
      origin_, permissions::RequestType::kNotifications, state_.GetWeakPtr());
  auto first = request->CreateDuplicateRequest(first_duplicate.GetWeakPtr());
  auto later = request->CreateDuplicateRequest(later_duplicate.GetWeakPtr());
  first->RegisterOnPermissionDecidedCallback(base::BindOnce(&PermissionBrokerTest::RevokeLease, base::Unretained(this)));
  manager_->AddRequest(page_->GetPrimaryMainFrame(), std::move(request));
  manager_->AddRequest(page_->GetPrimaryMainFrame(), std::move(first));
  manager_->AddRequest(page_->GetPrimaryMainFrame(), std::move(later));
  manager_->DocumentOnLoadCompletedInPrimaryMainFrame(); base::RunLoop().RunUntilIdle();
  ASSERT_NE(Find("permission.request"), nullptr); Allow();
  EXPECT_TRUE(state_.granted); EXPECT_TRUE(first_duplicate.granted);
  EXPECT_FALSE(later_duplicate.granted); EXPECT_TRUE(later_duplicate.cancelled);
  EXPECT_TRUE(state_.finished); EXPECT_TRUE(first_duplicate.finished); EXPECT_TRUE(later_duplicate.finished);
  EXPECT_FALSE(manager_->IsRequestInProgress()); EXPECT_NE(Find("permission.invalidate"), nullptr);
}

TEST_F(PermissionBrokerTest, ActualDuplicateCallbackDestructionCannotGrantLaterDuplicate) {
  permissions::MockPermissionRequest::MockPermissionRequestState first_duplicate, later_duplicate;
  auto request = std::make_unique<permissions::MockPermissionRequest>(
      origin_, permissions::RequestType::kNotifications, state_.GetWeakPtr());
  auto first = request->CreateDuplicateRequest(first_duplicate.GetWeakPtr());
  auto later = request->CreateDuplicateRequest(later_duplicate.GetWeakPtr());
  first->RegisterOnPermissionDecidedCallback(base::BindOnce(&PermissionBrokerTest::DestroyPage, base::Unretained(this)));
  manager_->AddRequest(page_->GetPrimaryMainFrame(), std::move(request));
  manager_->AddRequest(page_->GetPrimaryMainFrame(), std::move(first));
  manager_->AddRequest(page_->GetPrimaryMainFrame(), std::move(later));
  manager_->DocumentOnLoadCompletedInPrimaryMainFrame(); base::RunLoop().RunUntilIdle();
  ASSERT_NE(Find("permission.request"), nullptr); Allow();
  EXPECT_TRUE(state_.granted); EXPECT_TRUE(first_duplicate.granted);
  EXPECT_FALSE(later_duplicate.granted); EXPECT_TRUE(later_duplicate.cancelled);
  EXPECT_TRUE(state_.finished); EXPECT_TRUE(first_duplicate.finished); EXPECT_TRUE(later_duplicate.finished);
  EXPECT_EQ(page_, nullptr);
}
}  // namespace aux
