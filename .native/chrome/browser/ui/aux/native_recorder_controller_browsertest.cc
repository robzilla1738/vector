// Copyright 2026 The Aux Authors
#include "chrome/browser/ui/aux/native_recorder_controller.h"

#include <memory>
#include "components/keyed_service/content/browser_context_dependency_manager.h"
#include "chrome/browser/ui/aux/runtime_host.h"
#include "chrome/browser/profiles/profile_manager_observer.h"
#include "chrome/browser/profiles/profile_manager.h"
#include "chrome/browser/browser_process.h"
#include "base/scoped_observation.h"
#include "base/json/json_reader.h"
#include "base/callback_list.h"
#include <optional>
#include <string>

#include "base/functional/bind.h"
#include "base/memory/raw_ptr.h"
#include "base/test/run_until.h"
#include "base/test/test_future.h"
#include "chrome/browser/profiles/profile.h"
#include "chrome/browser/ui/aux/page_identity.h"
#include "chrome/browser/ui/aux/tab_catalog.h"
#include "chrome/browser/ui/browser.h"
#include "chrome/browser/ui/browser_window/public/browser_window_interface.h"
#include "chrome/browser/ui/tabs/tab_strip_model.h"
#include "chrome/test/base/in_process_browser_test.h"
#include "chrome/test/base/ui_test_utils.h"
#include "content/public/browser/web_contents.h"
#include "content/public/test/browser_test.h"
#include "content/public/test/browser_test_utils.h"
#include "content/public/test/test_navigation_observer.h"
#include "third_party/blink/public/common/input/web_mouse_event.h"
#include "ui/gfx/geometry/point_conversions.h"
#include "net/http/http_status_code.h"
#include "net/test/embedded_test_server/embedded_test_server.h"
#include "net/test/embedded_test_server/http_request.h"
#include "net/test/embedded_test_server/http_response.h"
#include "testing/gtest/include/gtest/gtest.h"

// Only the fresh synthetic Profile's empty Zap policy is supplied by this
// fixture. Real Zap validation, renderer acknowledgement and commit remain.
class AuxRuntimeHostTestPeer {
 public:
  static void InstallEmptyFixturePolicy(Profile* profile) {
    AuxRuntimeHost::InstallTestDispatch(profile, base::BindRepeating(
        [](std::string original_profile, bool internal, std::string method,
           std::string json, AuxRuntimeHost::ResponseCallback reply) {
          const auto params = base::JSONReader::ReadDict(json, base::JSON_PARSE_RFC);
          if (internal && method == "zap.snapshot" && params &&
              params->FindString("profileId") &&
              *params->FindString("profileId") == original_profile) {
            std::move(reply).Run({true, "[]", "", ""});
          } else {
            std::move(reply).Run({false, "", "unsupported",
                "No runtime API is supplied by the original Capture fixture"});
          }
        }, profile->GetPath().BaseName().AsUTF8Unsafe()));
  }
};

namespace aux {
namespace {
std::unique_ptr<net::test_server::HttpResponse> RecorderFixture(
    const net::test_server::HttpRequest& request) {
  if (request.relative_url != "/owned-recorder" && !request.relative_url.starts_with("/owned-next"))
    return nullptr;
  auto response = std::make_unique<net::test_server::BasicHttpResponse>();
  response->set_code(net::HTTP_OK);
  response->set_content_type("text/html");
  response->set_content(R"HTML(<!doctype html><button id="owned" style="width:180px;height:100px">Owned fixture</button>
    <form action="/owned-next"><input id="company" name="company" aria-label="Company"><button id="submit">Submit owned fixture</button></form>
    <script>window.ownedClicks=0;document.querySelector('button').addEventListener('click',()=>++window.ownedClicks);</script>)HTML");
  return response;
}
}  // namespace
class NativeRecorderControllerBrowserTest : public InProcessBrowserTest,
                                            public ProfileManagerObserver {
 protected:
  void SetUpInProcessBrowserTestFixture() override {
    InProcessBrowserTest::SetUpInProcessBrowserTestFixture();
    profile_creation_ = BrowserContextDependencyManager::GetInstance()
        ->RegisterCreateServicesCallbackForTesting(base::BindRepeating(
            [](NativeRecorderControllerBrowserTest* fixture, content::BrowserContext*) {
              if (!fixture->profile_manager_observation_.IsObserving()) {
                fixture->profile_manager_observation_.Observe(
                    g_browser_process->profile_manager());
              }
            }, base::Unretained(this)));
  }
  void OnProfileAdded(Profile* profile) override {
    if (!profile->IsOffTheRecord())
      AuxRuntimeHostTestPeer::InstallEmptyFixturePolicy(profile);
  }
  void OnProfileManagerDestroying() override { profile_manager_observation_.Reset(); }
  void TearDownInProcessBrowserTestFixture() override {
    profile_creation_ = {};
    profile_manager_observation_.Reset();
    InProcessBrowserTest::TearDownInProcessBrowserTestFixture();
  }
  base::CallbackListSubscription profile_creation_;
  base::ScopedObservation<ProfileManager, ProfileManagerObserver>
      profile_manager_observation_{this};
  void SetUpOnMainThread() override {
    embedded_test_server()->RegisterRequestHandler(
        base::BindRepeating(&RecorderFixture));
    ASSERT_TRUE(embedded_test_server()->Start());
    TabCatalog::EnsureFactoryBuilt();
    ASSERT_TRUE(ui_test_utils::NavigateToURL(
        browser(), embedded_test_server()->GetURL("/owned-recorder")));
    page_ = browser()->tab_strip_model()->GetActiveWebContents();
    ASSERT_NE(page_, nullptr);
    PageIdentity::GetOrCreate(browser()->GetProfile(), page_);
    TabCatalog::GetForProfile(browser()->GetProfile())->Snapshot();
    NativeRecorderController::CreateForWebContents(page_);
    recorder_ = NativeRecorderController::FromWebContents(page_);
    ASSERT_NE(recorder_, nullptr);
  }
  base::DictValue Start() {
    base::test::TestFuture<base::DictValue> reply;
    recorder_->Start(1, reply.GetCallback());
    return reply.Take();
  }
  base::DictValue Drain(const std::string& id, uint64_t generation = 1) {
    base::test::TestFuture<base::DictValue> reply;
    recorder_->Drain(generation, id, reply.GetCallback());
    return reply.Take();
  }
  base::DictValue Stop(const std::string& id) {
    base::test::TestFuture<base::DictValue> reply;
    recorder_->Stop(1, id, reply.GetCallback());
    return reply.Take();
  }
  raw_ptr<content::WebContents> page_ = nullptr;
  raw_ptr<NativeRecorderController> recorder_ = nullptr;
};

IN_PROC_BROWSER_TEST_F(NativeRecorderControllerBrowserTest,
                       FixedWorldCapturesTrustedInputAndRejectsProgrammaticClick) {
  auto started = Start();
  auto* result = started.FindDict("result");
  ASSERT_NE(result, nullptr) << started.DebugString();
  const auto* id = result->FindString("recorderId");
  ASSERT_NE(id, nullptr);
  const std::string original_id = *id;
  ASSERT_TRUE(content::ExecJs(page_, "document.querySelector('button').click()"));
  auto synthetic = Drain(original_id);
  ASSERT_NE(synthetic.FindDict("result"), nullptr);
  auto* ignored = synthetic.FindDict("result")->FindList("events");
  ASSERT_NE(ignored, nullptr);
  EXPECT_TRUE(ignored->empty());
  ASSERT_TRUE(content::ExecJs(page_, "window.ownedClicks=0"));
  content::SimulateMouseClickOrTapElementWithId(page_, "owned");
  ASSERT_TRUE(base::test::RunUntil([&] {
    return content::EvalJs(page_, "window.ownedClicks").ExtractInt() == 1;
  }));
  auto captured = Drain(original_id);
  ASSERT_NE(captured.FindDict("result"), nullptr);
  auto* events = captured.FindDict("result")->FindList("events");
  ASSERT_NE(events, nullptr);
  ASSERT_EQ(events->size(), 1u);
  EXPECT_EQ(events->front().GetDict().FindString("kind") ?
                *events->front().GetDict().FindString("kind") : "",
            "click");
  auto stopped = Stop(original_id);
  ASSERT_NE(stopped.FindDict("result"), nullptr);
  EXPECT_EQ(stopped.FindDict("result")->FindBool("stopped"), true);
  EXPECT_NE(Drain(original_id).FindDict("error"), nullptr);
}

IN_PROC_BROWSER_TEST_F(NativeRecorderControllerBrowserTest,
                       RefusesForeignConnectionAndRuntimeOwnedPage) {
  auto started = Start();
  ASSERT_NE(started.FindDict("result"), nullptr);
  const auto* id = started.FindDict("result")->FindString("recorderId");
  ASSERT_NE(id, nullptr);
  const std::string original_id = *id;
  EXPECT_NE(Drain(original_id, 2).FindDict("error"), nullptr);
  auto positive = Drain(original_id);
  ASSERT_NE(positive.FindDict("result"), nullptr);
  PageIdentity::MarkRuntimeOwned(browser()->GetProfile(), page_);
  EXPECT_NE(Drain(original_id).FindDict("error"), nullptr);
  auto stopped = Stop(original_id);
  ASSERT_NE(stopped.FindDict("result"), nullptr);
  EXPECT_NE(Start().FindDict("error"), nullptr);
}

IN_PROC_BROWSER_TEST_F(NativeRecorderControllerBrowserTest,
                       OldRecordingReceiptCannotStopOrDrainReplacement) {
  auto started = Start();
  ASSERT_NE(started.FindDict("result"), nullptr);
  const auto* id = started.FindDict("result")->FindString("recorderId");
  ASSERT_NE(id, nullptr);
  const std::string original_id = *id;
  ASSERT_NE(Stop(original_id).FindDict("result"), nullptr);
  auto replacement = Start();
  ASSERT_NE(replacement.FindDict("result"), nullptr);
  const auto* new_id = replacement.FindDict("result")->FindString("recorderId");
  ASSERT_NE(new_id, nullptr);
  EXPECT_NE(*new_id, original_id);
  EXPECT_NE(Stop(original_id).FindDict("error"), nullptr);
  EXPECT_NE(Drain(original_id).FindDict("error"), nullptr);
  ASSERT_NE(Drain(*new_id).FindDict("result"), nullptr);
  ASSERT_NE(Stop(*new_id).FindDict("result"), nullptr);
}

IN_PROC_BROWSER_TEST_F(NativeRecorderControllerBrowserTest,
                       RetiredPendingReplyCannotOverwriteReplacementCleanup) {
  base::test::TestFuture<base::DictValue> original;
  recorder_->Start(1, original.GetCallback());
  // Retire the pending fixed-world install immediately. Its late renderer
  // callback must not clear a freshly installed recording.
  recorder_->Disconnect(1);
  ASSERT_NE(original.Take().FindDict("error"), nullptr);
  auto replacement = Start();
  ASSERT_NE(replacement.FindDict("result"), nullptr);
  const auto* id = replacement.FindDict("result")->FindString("recorderId");
  ASSERT_NE(id, nullptr);
  ASSERT_NE(Drain(*id).FindDict("result"), nullptr);
  ASSERT_NE(Stop(*id).FindDict("result"), nullptr);
}

IN_PROC_BROWSER_TEST_F(NativeRecorderControllerBrowserTest,
                       PreservesTrustedInputAndImmediateSubmitBeforeNavigation) {
  auto started = Start();
  ASSERT_NE(started.FindDict("result"), nullptr);
  const auto* id = started.FindDict("result")->FindString("recorderId");
  ASSERT_NE(id, nullptr);
  const std::string original_id = *id;
  content::SimulateEndOfPaintHoldingOnPrimaryMainFrame(page_);
  const auto submit = gfx::ToRoundedPoint(content::GetCenterCoordinatesOfElementWithId(page_, "submit"));
  content::SimulateMouseClickOrTapElementWithId(page_, "company");
  ASSERT_TRUE(base::test::RunUntil([&] {
    return content::EvalJs(page_, "document.activeElement.id").ExtractString() == "company";
  }));
  content::TestNavigationObserver navigation(page_);
  // No drain, input readback, timeout or script/userGesture flag between these
  // genuine browser-routed input messages and the submitting click.
  content::SimulateCharTyped(page_, u'a');
  content::SimulateMouseClickAt(page_, 0, blink::WebMouseEvent::Button::kLeft, submit);
  navigation.Wait();
  ASSERT_TRUE(navigation.last_navigation_succeeded());
  EXPECT_EQ(page_->GetLastCommittedURL().query(), "company=a");
  base::DictValue captured;
  ASSERT_TRUE(base::test::RunUntil([&] {
    auto next = Drain(original_id);
    auto* result = next.FindDict("result");
    if (result && result->FindBool("pending").value_or(false)) return false;
    captured = std::move(next);
    return true;
  }));
  auto* result = captured.FindDict("result");
  ASSERT_NE(result, nullptr);
  auto* events = result->FindList("events");
  ASSERT_NE(events, nullptr);
  std::optional<size_t> input, submit_click, committed_navigation;
  for (size_t index = 0; index < events->size(); ++index) {
    const auto& event = (*events)[index].GetDict();
    const auto* kind = event.FindString("kind");
    ASSERT_NE(kind, nullptr);
    if (*kind == "input" && event.FindString("value") && *event.FindString("value") == "a") input = index;
    if (*kind == "navigate") committed_navigation = index;
    if (*kind == "click") {
      const auto* target = event.FindDict("target");
      const auto* candidates = target ? target->FindList("candidates") : nullptr;
      if (candidates) for (const auto& candidate : *candidates) {
        const auto* selector = candidate.GetDict().FindString("selector");
        if (selector && *selector == "css:#submit") submit_click = index;
      }
    }
  }
  ASSERT_TRUE(input.has_value());
  ASSERT_TRUE(submit_click.has_value());
  ASSERT_TRUE(committed_navigation.has_value());
  EXPECT_LT(*input, *submit_click);
  EXPECT_LT(*submit_click, *committed_navigation);
  ASSERT_NE(Stop(original_id).FindDict("result"), nullptr);
}
IN_PROC_BROWSER_TEST_F(NativeRecorderControllerBrowserTest,
                       SettledOwnerMutationCannotReplayPersonRecorderReceipt) {
  auto started = Start();
  ASSERT_NE(started.FindDict("result"), nullptr);
  const auto* id = started.FindDict("result")->FindString("recorderId");
  ASSERT_NE(id, nullptr);
  const std::string original_id = *id;
  auto* authority = EgressController::ForProfile(browser()->GetProfile());
  auto mutation = authority->owner_mutations().Begin();
  ASSERT_TRUE(mutation);
  ASSERT_TRUE(authority->owner_mutations().End(*mutation, true));
  EXPECT_NE(Drain(original_id).FindDict("error"), nullptr);
  EXPECT_NE(Stop(original_id).FindDict("error"), nullptr);
  auto replacement = Start();
  ASSERT_NE(replacement.FindDict("result"), nullptr);
  const auto* replacement_id = replacement.FindDict("result")->FindString("recorderId");
  ASSERT_NE(replacement_id, nullptr);
  EXPECT_NE(*replacement_id, original_id);
  ASSERT_NE(Stop(*replacement_id).FindDict("result"), nullptr);
}
}  // namespace aux
