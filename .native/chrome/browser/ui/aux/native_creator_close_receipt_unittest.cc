// Copyright 2026 The Aux Authors
#include "chrome/browser/ui/aux/native_creator_close_receipt.h"

#include <array>
#include <atomic>
#include <memory>
#include <optional>
#include <vector>
#include "base/memory/weak_ptr.h"
#include "content/common/navigation_client.mojom.h"
#include "mojo/public/cpp/bindings/scoped_interface_endpoint_handle.h"
#include "third_party/blink/public/common/associated_interfaces/associated_interface_provider.h"
#include "base/functional/bind.h"
#include "base/debug/stack_trace.h"
#include "base/run_loop.h"
#include "base/test/task_environment.h"
#include "chrome/browser/ui/aux/egress_controller.h"
#include "chrome/browser/ui/browser.h"
#include "chrome/browser/ui/aux/page_identity.h"
#include "chrome/browser/ui/aux/tab_catalog.h"
#include "chrome/browser/ui/browser_window/public/browser_window_interface.h"
#include "chrome/browser/ui/tabs/tab_strip_model.h"
#include "chrome/test/base/browser_with_test_window_test.h"
#include "chrome/test/base/testing_profile.h"
#include "content/public/browser/navigation_handle.h"
#include "content/public/browser/navigation_controller.h"
#include "content/public/browser/web_contents.h"
#include "content/public/browser/web_contents_observer.h"
#include "base/strings/string_number_conversions.h"
#include "content/public/browser/render_frame_host.h"
#include "content/public/browser/site_instance.h"
#include "content/public/browser/security_principal.h"
#include "content/public/browser/storage_partition.h"
#include "content/public/test/navigation_simulator.h"
#include "content/public/test/web_contents_tester.h"
#include "testing/gtest/include/gtest/gtest.h"
#include "ui/base/page_transition_types.h"

namespace aux {
class CreatorNavigationFinishObserver final : public content::WebContentsObserver {
 public:
  CreatorNavigationFinishObserver(content::WebContents* page, base::DictValue* diagnostic)
      : content::WebContentsObserver(page), diagnostic_(diagnostic) {}
  ~CreatorNavigationFinishObserver() override {
    weak_factory_.InvalidateWeakPtrs();
    for (const auto& id : original_frames_) {
      if (auto* frame = content::RenderFrameHost::FromID(id))
        frame->GetRemoteAssociatedInterfaces()->OverrideBinderForTesting(
            content::mojom::NavigationClient::Name_, {});
    }
  }
  void ReadyToCommitNavigation(content::NavigationHandle* navigation) override {
    auto* frame = navigation->GetRenderFrameHost();
    const auto id = frame->GetGlobalId();
    for (const auto& original : original_frames_)
      if (original == id) return;
    original_frames_.push_back(id);
    // Match NavigationSimulator's retained unbound receiver: keep the actual
    // original commit endpoint alive while mock time advances before Commit.
    frame->GetRemoteAssociatedInterfaces()->OverrideBinderForTesting(
        content::mojom::NavigationClient::Name_,
        base::BindRepeating(&CreatorNavigationFinishObserver::RetainOriginalClient,
                            weak_factory_.GetWeakPtr()));
  }
  void DidFinishNavigation(content::NavigationHandle* navigation) override {
    diagnostic_->Set("finishedNavigationId", base::NumberToString(navigation->GetNavigationId()));
    diagnostic_->Set("finishedUrl", navigation->GetURL().spec());
    diagnostic_->Set("hasCommitted", navigation->HasCommitted());
    diagnostic_->Set("isErrorPage", navigation->IsErrorPage());
    diagnostic_->Set("netErrorCode", navigation->GetNetErrorCode());
    const auto discard_reason = navigation->GetNavigationDiscardReason();
    diagnostic_->Set("discardReasonObserved", discard_reason.has_value());
    if (discard_reason)
      diagnostic_->Set("discardReason", static_cast<int>(*discard_reason));
    if (!navigation->HasCommitted() && navigation->GetNetErrorCode() != 0)
      diagnostic_->Set("originalFinishStack", base::debug::StackTrace(32).ToString());
  }
 private:
  void RetainOriginalClient(mojo::ScopedInterfaceEndpointHandle handle) {
    original_clients_.push_back(std::move(handle));
  }
  raw_ptr<base::DictValue> diagnostic_;
  std::vector<content::GlobalRenderFrameHostId> original_frames_;
  std::vector<mojo::ScopedInterfaceEndpointHandle> original_clients_;
  base::WeakPtrFactory<CreatorNavigationFinishObserver> weak_factory_{this};
};
// These are genuine Profile/catalog/isolation/navigation/refusal controls. The supplied private connection generation is synthetic; this
// fixture does not qualify Worker Connect/socket authentication or Mac input.
class NativeCreatorCloseReceiptTest : public BrowserWithTestWindowTest {
 public:
  NativeCreatorCloseReceiptTest()
      : BrowserWithTestWindowTest(base::test::TaskEnvironment::TimeSource::MOCK_TIME) {}
  void SetUp() override {
    BrowserWithTestWindowTest::SetUp();
    controller_ = EgressController::ForProfile(profile());
    ASSERT_TRUE(controller_->AdmitRuntimeConnection(kGeneration, "synthetic-fixture-native-host"));
    auto [id, partition] = controller_->ReserveIsolation("creator-run", "creator-task", 3);
    isolation_id_ = id;
    auto site = content::SiteInstance::CreateForFixedStoragePartition(
        profile(), GURL("https://aux.invalid/"), partition);
    auto contents = content::WebContentsTester::CreateTestWebContents(profile(), site);
    page_ = contents->GetWeakPtr();
    finish_observer_ = std::make_unique<CreatorNavigationFinishObserver>(page_.get(), &navigation_diagnostic_);
    browser()->GetTabStripModel()->AppendWebContents(std::move(contents), true);
    ASSERT_TRUE(controller_->RegisterIsolation(page_.get(), id, "creator-run", "creator-task", 3, {"creator-run", "registered-parent"}, kGeneration));
    page_id_ = PageIdentity::GetOrCreate(profile(), page_.get());
    TabCatalog::GetForProfile(profile())->MarkRuntimeOwned(page_id_);
    ASSERT_EQ(TabCatalog::GetForProfile(profile())->FindPage(page_id_), page_.get());
    const auto scope_snapshot = [&]() {
      auto* frame = page_ ? page_->GetPrimaryMainFrame() : nullptr;
      auto* site = frame ? frame->GetSiteInstance() : nullptr;
      auto* storage = frame ? frame->GetStoragePartition() : nullptr;
      auto* identity = page_ ? PageIdentity::FromWebContents(page_.get()) : nullptr;
      return std::array<bool, 4>{
          frame != nullptr,
          site && site->GetSecurityPrincipal().GetStoragePartitionConfig() == partition,
          storage && storage->GetConfig() == partition,
          identity && identity->runtime_owned()};
    };
    const auto original_scope = scope_snapshot();
    content::NavigationController::LoadURLParams blank(GURL("about:blank"));
    blank.source_site_instance = site;
    blank.transition_type = ui::PAGE_TRANSITION_AUTO_TOPLEVEL;
    page_->GetController().LoadURLWithParams(blank);
    navigation_ = content::NavigationSimulator::CreateFromPending(page_->GetController());
    navigation_->ReadyToCommit();
    navigation_diagnostic_.Set("originalNavigationId", base::NumberToString(navigation_->GetNavigationHandle()->GetNavigationId()));
    const auto ready_scope = scope_snapshot();
    auto created = controller_->RegisterCreatorPage(page_.get(),
        navigation_->GetNavigationHandle()->GetNavigationId(), kGeneration, nullptr);
    const auto* result = created.FindDict("result");
    ASSERT_TRUE(result) << created.DebugString()
        << " original_frame=" << original_scope[0]
        << " original_site_partition=" << original_scope[1]
        << " original_storage_partition=" << original_scope[2]
        << " original_runtime_owned=" << original_scope[3]
        << " ready_frame=" << ready_scope[0]
        << " ready_site_partition=" << ready_scope[1]
        << " ready_storage_partition=" << ready_scope[2]
        << " ready_runtime_owned=" << ready_scope[3];
    const auto* id_value = result->FindString("creationId");
    ASSERT_TRUE(id_value);
    creation_id_ = *id_value;
  }
  void TearDown() override {
    finish_observer_.reset();
    navigation_.reset();
    early_navigation_.reset();
    if (controller_) controller_->Disconnect();
    base::RunLoop().RunUntilIdle();
    controller_ = nullptr;
    page_.reset();
    BrowserWithTestWindowTest::TearDown();
  }
  void Commit() {
    ASSERT_TRUE(navigation_->GetNavigationHandle()) << "Original creator navigation finished before Commit: " << navigation_diagnostic_.DebugString();
    navigation_->Commit();
    navigation_.reset();
  }
  base::DictValue Proof(uint64_t generation = kGeneration) {
    return controller_->CreatorCleanupProof(base::DictValue()
        .Set("pageId", page_id_).Set("creationId", creation_id_), generation);
  }
  void Close(const base::DictValue& proof, std::optional<base::DictValue>* reply) {
    controller_->CloseCreatorPage(base::DictValue().Set("proof", proof.Clone()),
        kGeneration, std::make_shared<std::atomic_bool>(false),
        base::BindOnce([](std::optional<base::DictValue>* output, base::DictValue value) {
          *output = std::move(value);
        }, reply));
  }
 protected:
  static constexpr uint64_t kGeneration = 17;
  raw_ptr<EgressController> controller_ = nullptr;
  base::WeakPtr<content::WebContents> page_;
  std::string page_id_, creation_id_, isolation_id_;
  base::DictValue navigation_diagnostic_;
  std::unique_ptr<CreatorNavigationFinishObserver> finish_observer_;
  std::unique_ptr<content::NavigationSimulator> navigation_, early_navigation_;
  std::optional<bool> ready_;
  std::optional<base::DictValue> reply_, replay_;
  int ready_replies_ = 0;
  bool ready_value_ = true;
};

TEST_F(NativeCreatorCloseReceiptTest, EarlyBlankReadyRetirementCannotReuseOriginalCreatorIterator) {
  auto [isolation_id, partition] = controller_->ReserveIsolation("early-run", "early-task", 1);
  auto site = content::SiteInstance::CreateForFixedStoragePartition(
      profile(), GURL("https://aux.invalid/"), partition);
  auto contents = content::WebContentsTester::CreateTestWebContents(profile(), site);
  auto original_page = contents->GetWeakPtr();
  browser()->GetTabStripModel()->AppendWebContents(std::move(contents), true);
  ASSERT_TRUE(controller_->RegisterIsolation(original_page.get(), isolation_id,
      "early-run", "early-task", 1, {"early-run"}, kGeneration));
  const auto page_id = PageIdentity::GetOrCreate(profile(), original_page.get());
  TabCatalog::GetForProfile(profile())->MarkRuntimeOwned(page_id);
  auto created = controller_->RegisterCreatorPage(original_page.get(), 0, kGeneration,
      nullptr, browser());
  const auto* result = created.FindDict("result");
  ASSERT_NE(result, nullptr);
  ASSERT_NE(result->FindString("creationId"), nullptr);
  const std::string creation_id = *result->FindString("creationId");
  controller_->WaitCreatorReady(page_id, creation_id, kGeneration, base::BindOnce(
      [](EgressController* controller, std::string original_page_id,
         int* replies, bool* current, bool ready) {
        ++*replies;
        *current = ready;
        controller->ReleaseIsolation(original_page_id);
      }, controller_, page_id, &ready_replies_, &ready_value_));
  EXPECT_EQ(ready_replies_, 0);
  content::NavigationController::LoadURLParams blank(GURL("about:blank"));
  blank.source_site_instance = site;
  blank.transition_type = ui::PAGE_TRANSITION_AUTO_TOPLEVEL;
  original_page->GetController().LoadURLWithParams(blank);
  early_navigation_ = content::NavigationSimulator::CreateFromPending(
      original_page->GetController());
  early_navigation_->ReadyToCommit();
  const auto navigation_id = early_navigation_->GetNavigationHandle()->GetNavigationId();
  early_navigation_->Commit();
  early_navigation_.reset();
  EXPECT_EQ(ready_replies_, 0);
  EXPECT_FALSE(controller_->BindCreatorBlankNavigation(page_id, creation_id, kGeneration, navigation_id));
  EXPECT_EQ(ready_replies_, 1);
  EXPECT_TRUE(ready_value_);
  EXPECT_TRUE(original_page);
  EXPECT_TRUE(controller_->CreatorCleanupProof(base::DictValue()
      .Set("pageId", page_id).Set("creationId", creation_id), kGeneration).FindDict("error"));
}

TEST_F(NativeCreatorCloseReceiptTest, ReadyRequiresOriginalCommittedNavigation) {
  controller_->WaitCreatorReady(page_id_, creation_id_, kGeneration,
      base::BindOnce([](std::optional<bool>* result, bool value) { *result = value; }, &ready_));
  EXPECT_FALSE(ready_);
  Commit();
  ASSERT_TRUE(ready_);
  EXPECT_TRUE(*ready_);
  auto proof = Proof();
  ASSERT_TRUE(proof.FindDict("result"));
  EXPECT_EQ(proof.FindDict("result")->FindString("phase") ?
      *proof.FindDict("result")->FindString("phase") : "", "creation");
}
TEST_F(NativeCreatorCloseReceiptTest, OriginalConnectionCannotBeReplaced) {
  Commit();
  EXPECT_TRUE(Proof(kGeneration + 1).FindDict("error"));
  EXPECT_TRUE(Proof().FindDict("result"));
}
TEST_F(NativeCreatorCloseReceiptTest, CreationDeadlineCannotBeRearmedByReady) {
  controller_->WaitCreatorReady(page_id_, creation_id_, kGeneration,
      base::BindOnce([](std::optional<bool>* result, bool value) { *result = value; }, &ready_));
  task_environment()->FastForwardBy(base::Seconds(8));
  ASSERT_TRUE(ready_);
  EXPECT_FALSE(*ready_);
  Commit();
  EXPECT_TRUE(Proof().FindDict("error"));
  EXPECT_TRUE(page_);
}
TEST_F(NativeCreatorCloseReceiptTest, UnsupportedInputViewRefusesCleanupAndRetainsOriginalPage) {
  Commit();
  auto proof = Proof();
  ASSERT_TRUE(proof.FindDict("result"));
  Close(*proof.FindDict("result"), &reply_);
  base::RunLoop().RunUntilIdle();
  ASSERT_TRUE(reply_);
  EXPECT_TRUE(reply_->FindDict("error"));
  EXPECT_TRUE(page_);
  EXPECT_EQ(browser()->GetTabStripModel()->count(), 1);
  Close(*proof.FindDict("result"), &replay_);
  ASSERT_TRUE(replay_);
  EXPECT_TRUE(replay_->FindDict("error"));
}
TEST_F(NativeCreatorCloseReceiptTest, OwnerMutationRefusesOriginalProofAndHumanCanClose) {
  Commit();
  auto proof = Proof();
  ASSERT_TRUE(proof.FindDict("result"));
  auto mutation = controller_->owner_mutations().Begin();
  ASSERT_TRUE(mutation);
  Close(*proof.FindDict("result"), &reply_);
  ASSERT_TRUE(reply_);
  EXPECT_TRUE(reply_->FindDict("error"));
  EXPECT_TRUE(page_);
  ASSERT_TRUE(controller_->owner_mutations().End(*mutation, true));
  browser()->GetTabStripModel()->CloseWebContents(page_.get(), TabCloseTypes::CLOSE_NONE);
  base::RunLoop().RunUntilIdle();
  EXPECT_FALSE(page_);
}
TEST_F(NativeCreatorCloseReceiptTest, DisconnectRetiresPendingReadyExactlyOnce) {
  controller_->WaitCreatorReady(page_id_, creation_id_, kGeneration,
      base::BindOnce([](int* count, bool* ready, bool value) { ++*count; *ready = value; }, &ready_replies_, &ready_value_));
  controller_->Disconnect();
  EXPECT_EQ(ready_replies_, 1);
  EXPECT_FALSE(ready_value_);
  Commit();
  task_environment()->FastForwardBy(base::Seconds(9));
  EXPECT_EQ(ready_replies_, 1);
  EXPECT_TRUE(Proof().FindDict("error"));
}
TEST_F(NativeCreatorCloseReceiptTest, ParentRetirementRetainsOriginalRegisteredAncestry) {
  Commit();
  ASSERT_TRUE(Proof().FindDict("result"));
  EXPECT_FALSE(controller_->RetireRegisteredRun("registered-parent", kGeneration + 1));
  EXPECT_TRUE(Proof().FindDict("result"));
  ASSERT_TRUE(controller_->RetireRegisteredRun("registered-parent", kGeneration));
  EXPECT_TRUE(controller_->HasStoppedRunIntent("registered-parent", kGeneration));
  EXPECT_FALSE(controller_->HasStoppedRunIntent("unrelated", kGeneration));
  EXPECT_TRUE(Proof().FindDict("error"));
  EXPECT_TRUE(page_);
}
TEST_F(NativeCreatorCloseReceiptTest, ReleasedChildRetainsHistoricalParentStopWithoutAuthority) {
  Commit();
  controller_->ReleaseIsolation(page_id_);
  EXPECT_TRUE(controller_->CheckRunResume("creator-run", kGeneration).FindDict("result"));
  ASSERT_TRUE(controller_->RetireRegisteredRun("registered-parent", kGeneration));
  EXPECT_TRUE(controller_->CheckRunResume("creator-run", kGeneration).FindDict("error"));
  EXPECT_TRUE(controller_->CheckRunResume("unrelated", kGeneration).FindDict("result"));
  EXPECT_TRUE(Proof().FindDict("error"));
  EXPECT_TRUE(page_);
}
TEST_F(NativeCreatorCloseReceiptTest, TerminalChildCannotDiscardActiveParentHistoricalRegistration) {
  Commit();
  controller_->ReleaseIsolation(page_id_);
  ASSERT_TRUE(controller_->RetireTerminalRun("creator-run", kGeneration).FindDict("result"));
  const auto retained = controller_->ReserveIsolation("creator-run", "creator-task", 3);
  EXPECT_EQ(retained.first, isolation_id_);
  ASSERT_TRUE(controller_->RetireRegisteredRun("registered-parent", kGeneration));
  EXPECT_TRUE(controller_->CheckRunResume("creator-run", kGeneration).FindDict("error"));
  EXPECT_TRUE(controller_->RetireTerminalRun("registered-parent", kGeneration + 1).FindDict("error"));
  EXPECT_EQ(controller_->ReserveIsolation("creator-run", "creator-task", 3).first, isolation_id_);
  ASSERT_TRUE(controller_->RetireTerminalRun("registered-parent", kGeneration).FindDict("result"));
  EXPECT_EQ(controller_->ReserveIsolation("creator-run", "creator-task", 3).first, isolation_id_);
  browser()->GetTabStripModel()->CloseWebContents(page_.get(), TabCloseTypes::CLOSE_NONE);
  base::RunLoop().RunUntilIdle();
  ASSERT_FALSE(page_);
  ASSERT_TRUE(controller_->RetireTerminalRun("registered-parent", kGeneration).FindDict("result"));
  EXPECT_NE(controller_->ReserveIsolation("creator-run", "creator-task", 3).first, isolation_id_);
  EXPECT_FALSE(controller_->HasStoppedRunIntent("registered-parent", kGeneration));
}
TEST_F(NativeCreatorCloseReceiptTest, MoreThan128TerminalFamiliesReclaimOnlyAfterGenuinePageDestruction) {
  Commit();
  // The original active parent family remains registered throughout these
  // independent terminal lifecycles; reclamation cannot prune active ancestry.
  for (int index = 0; index < 130; ++index) {
    const std::string run = "completed-family-" + std::to_string(index);
    auto [id, partition] = controller_->ReserveIsolation(run, "terminal-task", 1);
    ASSERT_FALSE(id.empty()) << index;
    auto site = content::SiteInstance::CreateForFixedStoragePartition(
        profile(), GURL("https://aux.invalid/"), partition);
    auto contents = content::WebContentsTester::CreateTestWebContents(profile(), site);
    auto original = contents->GetWeakPtr();
    browser()->GetTabStripModel()->AppendWebContents(std::move(contents), true);
    ASSERT_TRUE(controller_->RegisterIsolation(original.get(), id, run,
        "terminal-task", 1, {run}, kGeneration));
    ASSERT_TRUE(controller_->RetireTerminalRun(run, kGeneration).FindDict("result"));
    EXPECT_EQ(controller_->ReserveIsolation(run, "terminal-task", 1).first, id);
    browser()->GetTabStripModel()->CloseWebContents(original.get(), TabCloseTypes::CLOSE_NONE);
    base::RunLoop().RunUntilIdle();
    ASSERT_FALSE(original);
    EXPECT_NE(controller_->ReserveIsolation(run, "terminal-task", 1).first, id);
  }
  ASSERT_TRUE(controller_->RetireRegisteredRun("registered-parent", kGeneration));
  EXPECT_TRUE(controller_->CheckRunResume("creator-run", kGeneration).FindDict("error"));
  EXPECT_TRUE(page_);
}
TEST_F(NativeCreatorCloseReceiptTest, ResumeOriginalIntentCannotConsumeReplacedStopOrReplay) {
  ASSERT_TRUE(controller_->RetireRegisteredRun("registered-parent", kGeneration));
  auto original = controller_->PrepareRunResume("registered-parent", kGeneration);
  ASSERT_TRUE(original);
  ASSERT_TRUE(controller_->RetireRegisteredRun("registered-parent", kGeneration));
  EXPECT_TRUE(controller_->ConsumeRunResume("registered-parent", *original, kGeneration).FindDict("error"));
  EXPECT_FALSE(controller_->FinishRunResume(*original, true));
  EXPECT_TRUE(controller_->HasStoppedRunIntent("registered-parent", kGeneration));
  auto fresh = controller_->PrepareRunResume("registered-parent", kGeneration);
  ASSERT_TRUE(fresh);
  EXPECT_TRUE(controller_->ConsumeRunResume("registered-parent", *fresh, kGeneration).FindDict("result"));
  EXPECT_TRUE(controller_->ConsumeRunResume("registered-parent", *fresh, kGeneration).FindDict("error"));
  EXPECT_TRUE(controller_->FinishRunResume(*fresh, true));
  EXPECT_FALSE(controller_->FinishRunResume(*fresh, true));
}
TEST_F(NativeCreatorCloseReceiptTest, OriginalResumeDeadlineCannotExtendAfterConsumption) {
  ASSERT_TRUE(controller_->RetireRegisteredRun("registered-parent", kGeneration));
  auto original = controller_->PrepareRunResume("registered-parent", kGeneration);
  ASSERT_TRUE(original);
  ASSERT_TRUE(controller_->ConsumeRunResume("registered-parent", *original, kGeneration).FindDict("result"));
  task_environment()->FastForwardBy(base::Seconds(8));
  EXPECT_FALSE(controller_->FinishRunResume(*original, true));
  EXPECT_TRUE(controller_->HasStoppedRunIntent("registered-parent", kGeneration));
  EXPECT_FALSE(controller_->AdmitRuntimeConnection(kGeneration, "synthetic-fixture-native-host"));
  controller_->Disconnect();
  EXPECT_FALSE(controller_->AdmitRuntimeConnection(kGeneration, "synthetic-fixture-native-host"));
  EXPECT_TRUE(controller_->AdmitRuntimeConnection(kGeneration + 1, "synthetic-fixture-native-host"));
  EXPECT_FALSE(controller_->PrepareRunResume("registered-parent", kGeneration));
  EXPECT_TRUE(page_);
}
}  // namespace aux
