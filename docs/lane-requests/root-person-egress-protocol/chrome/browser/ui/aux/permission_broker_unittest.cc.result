// Copyright 2026 The Aux Authors
#include "chrome/browser/ui/aux/permission_broker.h"
#include "chrome/browser/ui/aux/profile_prefs.h"
#include "components/prefs/pref_service.h"
#include <cmath>
#include <vector>
#include "pdf/buildflags.h"
#include "components/actor/core/shared_types.h"
#include "chrome/common/chrome_render_frame.mojom.h"
#include "chrome/common/actor.mojom.h"
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
#include "chrome/browser/ui/aux/shell_events.h"
#include "chrome/browser/ui/aux/download_naming.h"
#include "chrome/browser/download/chrome_download_manager_delegate.h"
#include "chrome/browser/download/download_core_service.h"
#include "chrome/browser/download/download_core_service_factory.h"
#include "base/files/file_util.h"
#include "base/files/scoped_temp_dir.h"
#include "content/public/test/mock_download_manager.h"
#include "components/download/public/common/mock_download_item.h"
#include "testing/gmock/include/gmock/gmock.h"
#include "chrome/browser/ui/aux/page_identity.h"
#include "chrome/browser/ui/aux/runtime_host.h"
#include "chrome/browser/ui/aux/tab_catalog.h"
#include "chrome/browser/ui/tabs/tab_strip_model.h"
#include "chrome/test/base/browser_with_test_window_test.h"
#include "chrome/test/base/testing_profile.h"
#include "chrome/browser/content_settings/host_content_settings_map_factory.h"
#include "components/content_settings/core/browser/host_content_settings_map.h"
#include "components/permissions/permission_request_manager.h"
#include "components/permissions/permission_request_data.h"
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
    frame_bindings_.push_back(
        std::make_unique<PermissionFixtureFrameBindings>(page_));
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
    host_ = nullptr;
    AuxRuntimeHostTestPeer::Destroy(profile());
    calls_.clear();
    manager_ = nullptr; page_ = nullptr; controller_ = nullptr;
    BrowserWithTestWindowTest::TearDown();
    frame_bindings_.clear();
  }
  void AddFixtureTab(const GURL& url) {
    auto contents = content::WebContentsTester::CreateTestWebContents(
        profile(), content::SiteInstance::Create(profile()));
    auto* page = contents.get();
    frame_bindings_.push_back(
        std::make_unique<PermissionFixtureFrameBindings>(page));
    // Match AddTab's foreground index-zero insertion, while providing the
    // real empty stylesheet acknowledgement before navigation starts.
    browser()->tab_strip_model()->InsertWebContentsAt(
        0, std::move(contents), ADD_ACTIVE);
    NavigateAndCommit(page, url);
  }
  void Renew() {
    const double now = static_cast<double>(base::Time::Now().InMillisecondsSinceUnixEpoch());
    if (!lease_.Find("issuedAt")) lease_.Set("issuedAt", now);
    lease_.Set("expiresAt", now + 30000);
    auto result = controller_->Install(base::DictValue().Set("lease", lease_.Clone()).Set("expectedUrl", origin_.spec()));
    ASSERT_TRUE(result.FindDict("result"));
  }
  std::unique_ptr<permissions::MockPermissionRequest> MakeRequest(
      permissions::RequestType type,
      base::WeakPtr<permissions::MockPermissionRequest::MockPermissionRequestState> state) {
    // Match a real same-origin request: the short MockPermissionRequest
    // constructor leaves its embedding origin empty, which the broker must
    // correctly refuse. Keep that production origin check intact.
    auto data = std::make_unique<permissions::PermissionRequestData>(
        type, false, origin_, origin_);
    return std::make_unique<permissions::MockPermissionRequest>(
        std::move(data), std::move(state));
  }
  void Prompt() {
    manager_->AddRequest(page_->GetPrimaryMainFrame(), MakeRequest(permissions::RequestType::kNotifications, state_.GetWeakPtr()));
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
    if (auto_fresh_ && Find("permission.revalidate")) FreshAllow();
  }
  void FreshAllow(std::optional<double> window_end = std::nullopt) {
    auto* call = Find("permission.revalidate"); ASSERT_TRUE(call);
    EXPECT_TRUE(call->internal);
    auto body = call->params.Clone(); body.Set("decision", "allow");
    if (window_end) body.Set("overnight", base::DictValue().Set("windowEnd", *window_end).Set("requireAC", false));
    Reply("permission.revalidate", true, std::move(body));
  }
  void Allow(bool drain = true) {
    auto* request = Find("permission.request"); ASSERT_TRUE(request);
    EXPECT_TRUE(request->internal);
    const auto* batch = request->params.FindString("batchId"); ASSERT_TRUE(batch);
    auto at = request->params.FindDouble("requestedAt"); ASSERT_TRUE(at);
    EXPECT_EQ(*at, std::floor(*at));
    Reply("permission.request", true, base::DictValue().Set("batchId", *batch).Set("decision", "allow")
        .Set("reservationId", "00000000-0000-4000-8000-000000000001"), drain);
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
  std::vector<std::unique_ptr<PermissionFixtureFrameBindings>> frame_bindings_;
  permissions::MockPermissionRequest::MockPermissionRequestState state_;
  GURL origin_{"https://agent.test/"};
  bool auto_fresh_ = true;
  std::string isolation_id_, page_id_;
  base::DictValue lease_;
};

TEST_F(PermissionBrokerTest, PersonReadRetainsOriginalOrdinaryDocument) {
  AddFixtureTab(GURL("https://person-read.test/start"));
  auto* human = browser()->tab_strip_model()->GetWebContentsAt(0);
  PageIdentity::GetOrCreate(profile(), human);
  auto receipt = controller_->CapturePersonRead(human);
  ASSERT_TRUE(receipt);
  EXPECT_TRUE(controller_->MayReadPerson(*receipt));
  EXPECT_EQ(receipt->document().AsRenderFrameHostIfValid(),
            human->GetPrimaryMainFrame());
  EXPECT_FALSE(controller_->CapturePersonRead(page_));
  EXPECT_TRUE(controller_->PermissionAuthority(human->GetPrimaryMainFrame()).empty());
  NavigateAndCommit(human, GURL("https://person-read.test/next"));
  EXPECT_FALSE(controller_->MayReadPerson(*receipt));
  EXPECT_TRUE(controller_->CapturePersonRead(human));
}
TEST_F(PermissionBrokerTest, PersonReadCannotSurviveSettledOwnerMutation) {
  AddFixtureTab(GURL("https://person-read.test/"));
  auto* human = browser()->tab_strip_model()->GetWebContentsAt(0);
  PageIdentity::GetOrCreate(profile(), human);
  auto receipt = controller_->CapturePersonRead(human);
  ASSERT_TRUE(receipt);
  int retirements = 0;
  auto subscription = controller_->ObserveAuthority(
      base::BindRepeating([](int* count) { ++*count; }, &retirements));
  auto token = controller_->owner_mutations().Begin();
  ASSERT_TRUE(token);
  EXPECT_FALSE(controller_->MayReadPerson(*receipt));
  EXPECT_FALSE(controller_->CapturePersonRead(human));
  ASSERT_TRUE(controller_->owner_mutations().End(*token, true));
  EXPECT_FALSE(controller_->MayReadPerson(*receipt));
  EXPECT_TRUE(controller_->CapturePersonRead(human));
  EXPECT_EQ(retirements, 2);
}
TEST_F(PermissionBrokerTest, PersonReadDisconnectCannotReplayOriginalReceipt) {
  AddFixtureTab(GURL("https://person-read.test/"));
  auto* human = browser()->tab_strip_model()->GetWebContentsAt(0);
  PageIdentity::GetOrCreate(profile(), human);
  auto receipt = controller_->CapturePersonRead(human);
  ASSERT_TRUE(receipt);
  controller_->Disconnect();
  EXPECT_FALSE(controller_->MayReadPerson(*receipt));
  auto replacement = controller_->CapturePersonRead(human);
  ASSERT_TRUE(replacement);
  EXPECT_TRUE(controller_->MayReadPerson(*replacement));
  EXPECT_FALSE(controller_->MayReadPerson(*receipt));
}
TEST_F(PermissionBrokerTest, PersonReadRefusesRuntimeOwnedAndForeignProfile) {
  AddFixtureTab(GURL("https://person-read.test/"));
  auto* human = browser()->tab_strip_model()->GetWebContentsAt(0);
  PageIdentity::GetOrCreate(profile(), human);
  auto receipt = controller_->CapturePersonRead(human);
  ASSERT_TRUE(receipt);
  TestingProfile other;
  EXPECT_FALSE(EgressController::ForProfile(&other)->CapturePersonRead(human));
  EXPECT_FALSE(EgressController::ForProfile(&other)->MayReadPerson(*receipt));
  PageIdentity::MarkRuntimeOwned(profile(), human);
  EXPECT_FALSE(controller_->CapturePersonRead(human));
  EXPECT_FALSE(controller_->MayReadPerson(*receipt));
}
TEST_F(PermissionBrokerTest, PersonReadRefusesRegisteredIsolationBeforeInstall) {
  auto [id, partition] = controller_->ReserveIsolation("read-preparing", "task", 4);
  ASSERT_FALSE(id.empty());
  auto contents = content::WebContentsTester::CreateTestWebContents(
      profile(), content::SiteInstance::CreateForFixedStoragePartition(
          profile(), origin_, partition));
  auto* preparing = contents.get();
  frame_bindings_.push_back(
      std::make_unique<PermissionFixtureFrameBindings>(preparing));
  browser()->tab_strip_model()->AppendWebContents(std::move(contents), true);
  NavigateAndCommit(preparing, origin_);
  ASSERT_TRUE(controller_->RegisterIsolation(preparing, id, "read-preparing", "task", 4));
  EXPECT_TRUE(controller_->PermissionAuthority(preparing->GetPrimaryMainFrame()).empty());
  EXPECT_FALSE(controller_->CapturePersonRead(preparing));
}
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
  AddFixtureTab(GURL("https://other.test/")); page_->WasHidden(); Prompt();
  auto* request = Find("permission.request"); ASSERT_TRUE(request);
  const auto* batch = request->params.FindString("batchId"); ASSERT_TRUE(batch);
  Reply("permission.request", true, base::DictValue().Set("batchId", *batch).Set("decision", "deny"));
  EXPECT_FALSE(state_.granted); EXPECT_TRUE(state_.finished);
}
TEST_F(PermissionBrokerTest, GenuineHiddenReadyBatchAcceptsWithoutForegroundPrompt) {
  AddFixtureTab(GURL("https://other.test/")); page_->WasHidden();
  Prompt(); EXPECT_FALSE(prompts_->is_visible()); Allow();
  EXPECT_TRUE(state_.granted); EXPECT_TRUE(state_.finished);
}
TEST_F(PermissionBrokerTest, VisiblePromptCanBecomeBackgroundWhileOwnerMutationHeld) {
  Prompt(); Mutate(); Allow();
  auto* request = Find("permission.invalidate"); EXPECT_EQ(request, nullptr);
  AddFixtureTab(GURL("https://other.test/")); page_->WasHidden();
  EXPECT_FALSE(prompts_->is_visible()); EXPECT_TRUE(manager_->IsRequestInProgress());
  EXPECT_EQ(Find("permission.invalidate"), nullptr);
  Reply("safety.originPolicies.set", true, base::DictValue()); EXPECT_TRUE(state_.granted);
}
TEST_F(PermissionBrokerTest, BackgroundMatchingRevocationStillPreventsEffects) {
  AddFixtureTab(GURL("https://other.test/")); page_->WasHidden();
  Prompt(); Mutate(); Allow(); controller_->Revoke(base::DictValue().Set("leaseId", "lease"));
  Reply("safety.originPolicies.set", true, base::DictValue()); EXPECT_FALSE(state_.granted);
  EXPECT_NE(Find("permission.invalidate"), nullptr);
}
TEST_F(PermissionBrokerTest, HiddenPersonRequestWaitsForAttendedNativePrompt) {
  controller_->Revoke(base::DictValue().Set("leaseId", "lease"));
  AddFixtureTab(GURL("https://other.test/")); page_->WasHidden();
  manager_->AddRequest(page_->GetPrimaryMainFrame(), MakeRequest(permissions::RequestType::kNotifications, state_.GetWeakPtr()));
  manager_->DocumentOnLoadCompletedInPrimaryMainFrame(); base::RunLoop().RunUntilIdle();
  EXPECT_TRUE(manager_->IsRequestInProgress()); EXPECT_FALSE(prompts_->is_visible());
  EXPECT_EQ(Find("permission.request"), nullptr); EXPECT_FALSE(state_.granted);
  browser()->tab_strip_model()->ActivateTabAt(1); page_->WasShown(); base::RunLoop().RunUntilIdle();
  EXPECT_TRUE(prompts_->is_visible()); EXPECT_EQ(Find("permission.request"), nullptr);
  manager_->Accept(std::monostate()); EXPECT_TRUE(state_.granted);
}
TEST_F(PermissionBrokerTest, SupportedNativeKeysComeFromActualRequestTypeProducer) {
  for (auto type : {permissions::RequestType::kNotifications, permissions::RequestType::kClipboard,
                    permissions::RequestType::kIdleDetection, permissions::RequestType::kLocalFonts,
                    permissions::RequestType::kMultipleDownloads, permissions::RequestType::kKeyboardLock,
                    permissions::RequestType::kPointerLock}) {
    SCOPED_TRACE(permissions::PermissionKeyForRequestType(type));
    permissions::MockPermissionRequest::MockPermissionRequestState state;
    manager_->AddRequest(page_->GetPrimaryMainFrame(), MakeRequest(type, state.GetWeakPtr()));
    manager_->DocumentOnLoadCompletedInPrimaryMainFrame(); base::RunLoop().RunUntilIdle();
    ASSERT_TRUE(manager_->IsRequestInProgress());
    auto* request = Find("permission.request"); ASSERT_TRUE(request);
    auto* types = request->params.FindList("permissionTypes"); ASSERT_TRUE(types); ASSERT_EQ(types->size(), 1u);
    EXPECT_EQ((*types)[0].GetString(), permissions::PermissionKeyForRequestType(type));
    EXPECT_FALSE(state.granted);
    manager_->Dismiss(std::monostate()); base::RunLoop().RunUntilIdle(); calls_.clear();
  }
}
TEST_F(PermissionBrokerTest, UnsupportedNativeRequestRemainsAttended) {
  manager_->AddRequest(page_->GetPrimaryMainFrame(), MakeRequest(permissions::RequestType::kGeolocation, state_.GetWeakPtr()));
  manager_->DocumentOnLoadCompletedInPrimaryMainFrame(); base::RunLoop().RunUntilIdle();
  ASSERT_TRUE(manager_->IsRequestInProgress());
  EXPECT_EQ(Find("permission.request"), nullptr); EXPECT_FALSE(state_.granted);
}
TEST_F(PermissionBrokerTest, ReplacementRequestCannotReceiveAlreadyQueuedAllow) {
  Prompt(); Allow(false); manager_->Dismiss(std::monostate());
  permissions::MockPermissionRequest::MockPermissionRequestState replacement;
  manager_->AddRequest(page_->GetPrimaryMainFrame(), MakeRequest(permissions::RequestType::kClipboard, replacement.GetWeakPtr()));
  manager_->DocumentOnLoadCompletedInPrimaryMainFrame(); base::RunLoop().RunUntilIdle();
  EXPECT_FALSE(state_.granted); EXPECT_FALSE(replacement.granted);
  manager_->Dismiss(std::monostate());
}
TEST_F(PermissionBrokerTest, PersonPageWithoutRealLeaseStaysAttended) {
  controller_->Revoke(base::DictValue().Set("leaseId", "lease"));
  manager_->AddRequest(page_->GetPrimaryMainFrame(), MakeRequest(permissions::RequestType::kNotifications, state_.GetWeakPtr()));
  manager_->DocumentOnLoadCompletedInPrimaryMainFrame(); base::RunLoop().RunUntilIdle();
  ASSERT_TRUE(manager_->IsRequestInProgress());
  EXPECT_EQ(Find("permission.request"), nullptr); EXPECT_FALSE(state_.granted);
  manager_->Accept(std::monostate()); EXPECT_TRUE(state_.granted);
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
  auto request = MakeRequest(permissions::RequestType::kNotifications, state_.GetWeakPtr());
  request->RegisterOnPermissionDecidedCallback(base::BindOnce(&PermissionBrokerTest::DestroyPage, base::Unretained(this)));
  manager_->AddRequest(page_->GetPrimaryMainFrame(), std::move(request));
  manager_->DocumentOnLoadCompletedInPrimaryMainFrame(); base::RunLoop().RunUntilIdle();
  ASSERT_NE(Find("permission.request"), nullptr); Allow();
  EXPECT_TRUE(state_.granted); EXPECT_TRUE(state_.finished); EXPECT_EQ(page_, nullptr);
}
TEST_F(PermissionBrokerTest, ActualDenyCallbackCanDestroyManagerWithoutPostEffectAccess) {
  auto request = MakeRequest(permissions::RequestType::kNotifications, state_.GetWeakPtr());
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
  auto request = MakeRequest(permissions::RequestType::kNotifications, state_.GetWeakPtr());
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
  auto request = MakeRequest(permissions::RequestType::kNotifications, state_.GetWeakPtr());
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
  auto request = MakeRequest(permissions::RequestType::kNotifications, state_.GetWeakPtr());
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

TEST_F(PermissionBrokerTest, HeldAllowRequiresFreshInternalReceiptAfterEveryOwnerReceipt) {
  auto_fresh_ = false;
  Prompt(); Mutate(); Allow();
  EXPECT_EQ(Find("permission.revalidate"), nullptr);
  EXPECT_FALSE(state_.granted);
  Reply("safety.originPolicies.set", true, base::DictValue());
  ASSERT_NE(Find("permission.revalidate"), nullptr);
  EXPECT_FALSE(state_.granted);
  FreshAllow();
  EXPECT_TRUE(state_.granted); EXPECT_TRUE(state_.finished);
  EXPECT_NE(Find("permission.finalize"), nullptr);
}
TEST_F(PermissionBrokerTest, NativeEffectRejectsExactOvernightWindowEndAfterReceiptQueue) {
  auto_fresh_ = false;
  profile()->GetPrefs()->SetBoolean(kKeepRuntimeInBackgroundPref, true);
  Prompt(); Allow();
  ASSERT_NE(Find("permission.revalidate"), nullptr);
  FreshAllow(static_cast<double>(base::Time::Now().InMillisecondsSinceUnixEpoch()));
  EXPECT_FALSE(state_.granted); EXPECT_TRUE(state_.finished);
  EXPECT_FALSE(manager_->IsRequestInProgress());
  EXPECT_TRUE(state_.cancelled);
}
TEST_F(PermissionBrokerTest, NativeEffectRejectsCurrentProfileBackgroundRevocation) {
  auto_fresh_ = false;
  profile()->GetPrefs()->SetBoolean(kKeepRuntimeInBackgroundPref, true);
  Prompt(); Allow();
  ASSERT_NE(Find("permission.revalidate"), nullptr);
  profile()->GetPrefs()->SetBoolean(kKeepRuntimeInBackgroundPref, false);
  FreshAllow(static_cast<double>(base::Time::Now().InMillisecondsSinceUnixEpoch()) + 60000);
  EXPECT_FALSE(state_.granted); EXPECT_TRUE(state_.finished);
  EXPECT_TRUE(state_.cancelled);
}
TEST_F(PermissionBrokerTest, ExpiredReceiptCancelsExactDuplicateBatchWithoutDurableDenial) {
  auto_fresh_ = false;
  auto* content_settings = HostContentSettingsMapFactory::GetForProfile(profile());
  ASSERT_TRUE(content_settings);
  const auto notification_before = content_settings->GetContentSetting(
      origin_, origin_, ContentSettingsType::NOTIFICATIONS);
  ASSERT_EQ(notification_before, CONTENT_SETTING_ASK);
  profile()->GetPrefs()->SetBoolean(kKeepRuntimeInBackgroundPref, true);
  permissions::MockPermissionRequest::MockPermissionRequestState duplicate_state;
  auto request = MakeRequest(permissions::RequestType::kNotifications, state_.GetWeakPtr());
  auto duplicate = request->CreateDuplicateRequest(duplicate_state.GetWeakPtr());
  manager_->AddRequest(page_->GetPrimaryMainFrame(), std::move(request));
  manager_->AddRequest(page_->GetPrimaryMainFrame(), std::move(duplicate));
  manager_->DocumentOnLoadCompletedInPrimaryMainFrame(); base::RunLoop().RunUntilIdle();
  ASSERT_NE(Find("permission.request"), nullptr); Allow();
  ASSERT_NE(Find("permission.revalidate"), nullptr);
  FreshAllow(static_cast<double>(base::Time::Now().InMillisecondsSinceUnixEpoch()));
  EXPECT_FALSE(state_.granted); EXPECT_FALSE(duplicate_state.granted);
  EXPECT_TRUE(state_.cancelled); EXPECT_TRUE(duplicate_state.cancelled);
  EXPECT_TRUE(state_.finished); EXPECT_TRUE(duplicate_state.finished);
  EXPECT_FALSE(manager_->IsRequestInProgress());
  EXPECT_NE(Find("permission.finalize"), nullptr);
  EXPECT_EQ(content_settings->GetContentSetting(
      origin_, origin_, ContentSettingsType::NOTIFICATIONS), notification_before);
}
TEST_F(PermissionBrokerTest, ForeignFreshNonceCannotGrantActualRequest) {
  auto_fresh_ = false;
  Prompt(); Allow();
  auto* call = Find("permission.revalidate"); ASSERT_TRUE(call);
  auto body = call->params.Clone(); body.Set("nonce", 999); body.Set("decision", "allow");
  Reply("permission.revalidate", true, std::move(body));
  EXPECT_FALSE(state_.granted); EXPECT_NE(Find("permission.invalidate"), nullptr);
}
TEST_F(PermissionBrokerTest, MutationAfterFreshRequestRequiresAnotherFreshRuntimeCheck) {
  auto_fresh_ = false;
  Prompt(); Allow();
  auto* call = Find("permission.revalidate"); ASSERT_TRUE(call);
  EXPECT_EQ(call->params.FindInt("nonce"), 1);
  Mutate(); FreshAllow();
  EXPECT_FALSE(state_.granted);
  Reply("safety.originPolicies.set", true, base::DictValue());
  call = Find("permission.revalidate"); ASSERT_TRUE(call);
  EXPECT_EQ(call->params.FindInt("nonce"), 2);
  EXPECT_FALSE(state_.granted);
  FreshAllow(); EXPECT_TRUE(state_.granted); EXPECT_TRUE(state_.finished);
}

// The actual Profile download observer runs against the supported manager
// fixture; file identity/candidate production and internal transport stay real.
class FastDownloadSignalFixture {
 public:
  FastDownloadSignalFixture(bool initialized, bool restore_complete) {
    CHECK(directory_.CreateUniqueTempDir());
    restored_path_ = directory_.GetPath().AppendASCII("restored.pdf");
    live_path_ = directory_.GetPath().AppendASCII("live.pdf");
    refused_path_ = directory_.GetPath().AppendASCII("refused.pdf");
    CHECK(base::WriteFile(restored_path_, "synthetic restored bytes"));
    CHECK(base::WriteFile(live_path_, "synthetic live bytes"));
    CHECK(base::WriteFile(refused_path_, "synthetic refused bytes"));
    Configure(restored_, restored_guid_, restored_path_);
    Configure(live_, live_guid_, live_path_);
    Configure(refused_, refused_guid_, refused_path_);
    auto owned_manager = std::make_unique<testing::NiceMock<content::MockDownloadManager>>();
    manager_ = owned_manager.get();
    ON_CALL(*manager_, GetBrowserContext()).WillByDefault(testing::Return(&profile_));
    ON_CALL(*manager_, IsManagerInitialized()).WillByDefault(testing::Return(initialized));
    ON_CALL(*manager_, GetAllDownloads(testing::_)).WillByDefault(
        [this, restore_complete](content::DownloadManager::DownloadVector* items) {
          if (restore_complete) items->push_back(&restored_);
        });
    profile_.SetDownloadManagerForTesting(std::move(owned_manager));
    // Keep the real download preferences/delegate while avoiding unrelated
    // history-service initialization on this standalone TestingProfile.
    DownloadCoreServiceFactory::GetForBrowserContext(&profile_)
        ->SetDownloadManagerDelegateForTesting(
            std::make_unique<ChromeDownloadManagerDelegate>(&profile_));
    EXPECT_CALL(*manager_, AddObserver(testing::_)).WillOnce(testing::SaveArg<0>(&observer_));
    AuxRuntimeHostTestPeer::Install(&profile_, base::BindRepeating(
        [](std::vector<base::DictValue>* calls, bool internal, std::string method,
           std::string json, AuxRuntimeHost::ResponseCallback reply) {
          EXPECT_TRUE(internal);
          if (method == "downloads.completedNative") {
            auto params = base::JSONReader::ReadDict(json, base::JSON_PARSE_RFC);
            CHECK(params); calls->push_back(std::move(*params));
            std::move(reply).Run({true, "{\"status\":\"fixture-recorded\"}", "", ""});
          } else std::move(reply).Run({false, "", "capability_unsupported", "No unrelated fixture dispatch"});
        }, base::Unretained(&calls_)));
    StartShellEvents(&profile_);
    CHECK(observer_);
  }
  ~FastDownloadSignalFixture() {
    observer_->ManagerGoingDown(manager_);
    AuxRuntimeHostTestPeer::Destroy(&profile_);
    // The mock manager does not deliver the real delegate Shutdown callback.
    // The supported setter shuts down the original delegate before destroying
    // it, while this fixture's manager and download items are still alive.
    DownloadCoreServiceFactory::GetForBrowserContext(&profile_)
        ->SetDownloadManagerDelegateForTesting(nullptr);
  }
  void Configure(download::MockDownloadItem& item, const std::string& guid,
                 const base::FilePath& path) {
    ON_CALL(item, GetState()).WillByDefault(testing::Return(download::DownloadItem::COMPLETE));
    ON_CALL(item, GetTargetDisposition()).WillByDefault(testing::Return(download::DownloadItem::TARGET_DISPOSITION_OVERWRITE));
    ON_CALL(item, GetInsecureDownloadStatus()).WillByDefault(testing::Return(download::DownloadItem::SAFE));
    ON_CALL(item, GetGuid()).WillByDefault(testing::ReturnRef(guid));
    ON_CALL(item, GetURL()).WillByDefault(testing::ReturnRef(source_));
    ON_CALL(item, GetTabUrl()).WillByDefault(testing::ReturnRef(source_));
    ON_CALL(item, GetTabReferrerUrl()).WillByDefault(testing::ReturnRef(empty_url_));
    ON_CALL(item, GetTargetFilePath()).WillByDefault(testing::ReturnRef(path));
    ON_CALL(item, GetForcedFilePath()).WillByDefault(testing::ReturnRef(empty_path_));
    ON_CALL(item, GetEndTime()).WillByDefault(testing::Return(base::Time::Now()));
  }
  TestingProfile profile_;
  base::ScopedTempDir directory_;
  const GURL source_{"http://127.0.0.1/fast-download.pdf"}, empty_url_;
  const base::FilePath empty_path_;
  const std::string restored_guid_ = "restored-guid", live_guid_ = "live-guid", refused_guid_ = "refused-guid";
  base::FilePath restored_path_, live_path_, refused_path_;
  testing::NiceMock<download::MockDownloadItem> restored_, live_, refused_;
  raw_ptr<content::MockDownloadManager> manager_ = nullptr;
  raw_ptr<content::DownloadManager::Observer> observer_ = nullptr;
  std::vector<base::DictValue> calls_;
};

TEST_F(PermissionBrokerTest, LiveFastCompletedDownloadAdmitsOnceWhileScanHistoryStaysSuppressed) {
  FastDownloadSignalFixture fixture(true, true);
  EXPECT_TRUE(fixture.calls_.empty());
  EXPECT_FALSE(DownloadNamingCandidate(&fixture.profile_, &fixture.restored_));
  fixture.observer_->OnDownloadCreated(fixture.manager_, &fixture.live_);
  ASSERT_EQ(fixture.calls_.size(), 1u);
  ASSERT_NE(fixture.calls_[0].FindString("id"), nullptr);
  EXPECT_EQ(*fixture.calls_[0].FindString("id"), fixture.live_guid_);
  EXPECT_TRUE(DownloadNamingCandidate(&fixture.profile_, &fixture.live_));
  fixture.observer_->OnDownloadCreated(fixture.manager_, &fixture.live_);
  fixture.live_.NotifyObserversDownloadUpdated();
  fixture.observer_->OnManagerInitialized();
  EXPECT_EQ(fixture.calls_.size(), 1u);
  EXPECT_FALSE(DownloadNamingCandidate(&fixture.profile_, &fixture.restored_));
}
TEST_F(PermissionBrokerTest, UninitializedCreatedCompleteIsHistoricalAndNeverRenamedAfterInitialization) {
  FastDownloadSignalFixture fixture(false, false);
  fixture.observer_->OnDownloadCreated(fixture.manager_, &fixture.restored_);
  EXPECT_TRUE(fixture.calls_.empty());
  ON_CALL(*fixture.manager_, IsManagerInitialized()).WillByDefault(testing::Return(true));
  fixture.observer_->OnManagerInitialized();
  fixture.restored_.NotifyObserversDownloadUpdated();
  EXPECT_TRUE(fixture.calls_.empty());
  EXPECT_FALSE(DownloadNamingCandidate(&fixture.profile_, &fixture.restored_));
  fixture.observer_->OnDownloadCreated(fixture.manager_, &fixture.live_);
  ASSERT_EQ(fixture.calls_.size(), 1u);
}
TEST_F(PermissionBrokerTest, LiveFastDownloadEligibilityStillRefusesDangerousAndPersonPromptedFiles) {
  FastDownloadSignalFixture fixture(true, false);
  ON_CALL(fixture.refused_, IsDangerous()).WillByDefault(testing::Return(true));
  fixture.observer_->OnDownloadCreated(fixture.manager_, &fixture.refused_);
  EXPECT_TRUE(fixture.calls_.empty());
  EXPECT_FALSE(DownloadNamingCandidate(&fixture.profile_, &fixture.refused_));
  ON_CALL(fixture.live_, GetTargetDisposition()).WillByDefault(testing::Return(download::DownloadItem::TARGET_DISPOSITION_PROMPT));
  fixture.observer_->OnDownloadCreated(fixture.manager_, &fixture.live_);
  EXPECT_TRUE(fixture.calls_.empty());
  EXPECT_FALSE(DownloadNamingCandidate(&fixture.profile_, &fixture.live_));
}

}  // namespace aux
