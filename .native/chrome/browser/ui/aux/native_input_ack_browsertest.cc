// Copyright 2026 The Aux Authors
#include <memory>

#include "base/functional/bind.h"
#include "base/json/json_reader.h"
#include "components/keyed_service/content/browser_context_dependency_manager.h"
#include "chrome/browser/ui/aux/runtime_host.h"
#include "base/memory/raw_ptr.h"
#include "base/test/test_future.h"
#include "base/time/time.h"
#include "chrome/browser/ui/browser_window/public/browser_window_interface.h"
#include "chrome/browser/profiles/profile.h"
#include "chrome/browser/ui/aux/cdp_broker.h"
#include "chrome/browser/ui/aux/page_identity.h"
#include "chrome/browser/ui/aux/tab_catalog.h"
#include "chrome/browser/ui/tabs/tab_strip_model.h"
#include "chrome/test/base/in_process_browser_test.h"
#include "chrome/test/base/ui_test_utils.h"
#include "content/browser/renderer_host/render_widget_host_view_mac.h"
#include "content/public/browser/navigation_handle.h"
#include "content/public/browser/render_frame_host.h"
#include "content/public/browser/render_widget_host.h"
#include "content/public/browser/web_contents.h"
#include "content/public/browser/web_contents_observer.h"
#include "content/public/test/browser_test.h"
#include "content/public/test/browser_test_utils.h"
#include "net/test/embedded_test_server/embedded_test_server.h"

// Supplies only the real empty synthetic Profile Zap policy needed by native
// navigation startup. Renderer commit and associated input ACK are unchanged.
class AuxNativeInputAckBrowserTestPeer {
 public:
  static void Install(Profile* profile) {
    AuxRuntimeHost::InstallTestDispatch(profile, base::BindRepeating(
        [](std::string profile_id, bool internal, std::string method,
           std::string json, AuxRuntimeHost::ResponseCallback reply) {
          const auto params = base::JSONReader::ReadDict(json, base::JSON_PARSE_RFC);
          if (internal && method == "zap.snapshot" && params &&
              params->FindString("profileId") && *params->FindString("profileId") == profile_id) {
            std::move(reply).Run({true, "[]", "", ""});
          } else {
            std::move(reply).Run({false, "", "unsupported", "No runtime API supplied by input ACK fixture"});
          }
        }, profile->GetPath().BaseName().AsUTF8Unsafe()));
  }
};

namespace content {
// Sole seam: retain the original completion AFTER the actual associated ACK.
// This peer cannot set readiness or replace any current-document predicate.
class NativeInputAcknowledgementTestPeer {
 public:
  static void Hold(RenderWidgetHostViewMac* view,
                   base::OnceCallback<void(base::OnceClosure)> callback) {
    CHECK(!view->native_input_ack_hold_for_testing_);
    view->native_input_ack_hold_for_testing_ = std::move(callback);
  }
};
}  // namespace content

namespace aux {
class NativeInputAcknowledgementBrowserTest : public InProcessBrowserTest,
                                             public content::WebContentsObserver {
 protected:
  void SetUpInProcessBrowserTestFixture() override {
    InProcessBrowserTest::SetUpInProcessBrowserTestFixture();
    profile_creation_ = BrowserContextDependencyManager::GetInstance()
        ->RegisterCreateServicesCallbackForTesting(base::BindRepeating(
            [](content::BrowserContext* context) {
              auto* profile = Profile::FromBrowserContext(context);
              if (!profile->IsOffTheRecord()) AuxNativeInputAckBrowserTestPeer::Install(profile);
            }));
  }
  void SetUpOnMainThread() override {
    embedded_test_server()->ServeFilesFromSourceDirectory("content/test/data");
    ASSERT_TRUE(embedded_test_server()->Start());
    page_ = browser()->GetTabStripModel()->GetActiveWebContents();
    ASSERT_NE(page_, nullptr);
    Observe(page_);
  }
  void TearDownOnMainThread() override {
    Observe(nullptr);
    page_ = nullptr;
  }
  void ReadyToCommitNavigation(content::NavigationHandle* navigation) override {
    if (!hold_next_ || !navigation->IsInPrimaryMainFrame() ||
        navigation->IsSameDocument())
      return;
    auto* widget = navigation->GetRenderFrameHost()->GetRenderWidgetHost();
    auto* view = static_cast<content::RenderWidgetHostViewMac*>(widget->GetView());
    CHECK(view);
    hold_next_ = false;
    content::NativeInputAcknowledgementTestPeer::Hold(view,
        held_ack_.GetCallback());
  }
  void NavigateWithHeldAcknowledgement() {
    hold_next_ = true;
    ASSERT_TRUE(ui_test_utils::NavigateToURL(
        browser(), embedded_test_server()->GetURL("/title1.html")));
    ASSERT_TRUE(held_ack_.Wait());
  }
  content::RenderWidgetHostView* View() {
    return page_->GetPrimaryMainFrame()->GetRenderWidgetHost()->GetView();
  }
  base::CallbackListSubscription profile_creation_;
  raw_ptr<content::WebContents> page_ = nullptr;
  bool hold_next_ = false;
  base::test::TestFuture<base::OnceClosure> held_ack_;
};

IN_PROC_BROWSER_TEST_F(NativeInputAcknowledgementBrowserTest,
                       GenuineAckReleaseAdmitsOnlyOriginalDocument) {
  ASSERT_NO_FATAL_FAILURE(NavigateWithHeldAcknowledgement());
  const auto original = page_->GetPrimaryMainFrame()->GetWeakDocumentPtr();
  ASSERT_FALSE(View()->HasNativeInputAdmissionForDocument(original));
  base::test::TestFuture<bool> admitted;
  View()->AwaitNativeInputAdmissionForDocument(original, admitted.GetCallback());
  EXPECT_FALSE(admitted.IsReady());
  std::move(held_ack_.Take()).Run();
  EXPECT_TRUE(admitted.Get());
  EXPECT_TRUE(View()->HasNativeInputAdmissionForDocument(original));
}

IN_PROC_BROWSER_TEST_F(NativeInputAcknowledgementBrowserTest,
                       ReplacementRetiresWaiterAndHeldOriginalCompletion) {
  ASSERT_NO_FATAL_FAILURE(NavigateWithHeldAcknowledgement());
  const auto original = page_->GetPrimaryMainFrame()->GetWeakDocumentPtr();
  base::test::TestFuture<bool> admitted;
  View()->AwaitNativeInputAdmissionForDocument(original, admitted.GetCallback());
  EXPECT_FALSE(admitted.IsReady());
  ASSERT_TRUE(ui_test_utils::NavigateToURL(
      browser(), embedded_test_server()->GetURL("/title2.html")));
  EXPECT_FALSE(admitted.Get());
  std::move(held_ack_.Take()).Run();
  EXPECT_FALSE(View()->HasNativeInputAdmissionForDocument(original));
  const auto replacement = page_->GetPrimaryMainFrame()->GetWeakDocumentPtr();
  base::test::TestFuture<bool> current;
  View()->AwaitNativeInputAdmissionForDocument(replacement, current.GetCallback());
  EXPECT_TRUE(current.Get());
}

IN_PROC_BROWSER_TEST_F(NativeInputAcknowledgementBrowserTest,
                       DestructionRefusesOriginalWaiterBeforeLateAckRelease) {
  ASSERT_NO_FATAL_FAILURE(NavigateWithHeldAcknowledgement());
  const auto original = page_->GetPrimaryMainFrame()->GetWeakDocumentPtr();
  base::test::TestFuture<bool> admitted;
  View()->AwaitNativeInputAdmissionForDocument(original, admitted.GetCallback());
  EXPECT_FALSE(admitted.IsReady());
  Observe(nullptr);
  auto owned = browser()->GetTabStripModel()->DetachWebContentsAtForInsertion(0);
  ASSERT_EQ(owned.get(), page_);
  page_ = nullptr;
  owned.reset();
  EXPECT_FALSE(admitted.Get());
  std::move(held_ack_.Take()).Run();
  EXPECT_FALSE(original.AsRenderFrameHostIfValid());
}
IN_PROC_BROWSER_TEST_F(NativeInputAcknowledgementBrowserTest,
                       GenuineHumanDocumentReadinessCannotMintAgentAttachment) {
  ASSERT_NO_FATAL_FAILURE(NavigateWithHeldAcknowledgement());
  const auto document = page_->GetPrimaryMainFrame()->GetWeakDocumentPtr();
  std::move(held_ack_.Take()).Run();
  ASSERT_TRUE(View()->HasNativeInputAdmissionForDocument(document));
  auto* profile = browser()->GetProfile();
  TabCatalog::EnsureFactoryBuilt();
  const auto page_id = PageIdentity::GetOrCreate(profile, page_);
  TabCatalog::GetForProfile(profile)->Snapshot();
  CdpBroker broker(profile, base::BindRepeating(
      [](uint64_t, const std::string&, const std::string&) {}),
      base::BindRepeating([](uint64_t, const std::string&, const std::string&,
                             int, const std::string&, bool) {}));
  // Synthetic admitted generation tests the native agent-only scope check;
  // this case does not claim to authenticate the Worker socket handshake.
  const auto catalog = broker.Catalog(1);
  const auto* original_catalog = catalog.FindDict("result");
  ASSERT_NE(original_catalog, nullptr);
  const auto* pages = original_catalog->FindList("pages");
  ASSERT_NE(pages, nullptr);
  EXPECT_TRUE(pages->empty());
  base::test::TestFuture<base::DictValue> reply;
  broker.WaitForAttachment(page_id, "not-a-native-agent-lease",
      base::Time::Now().InMillisecondsSinceUnixEpoch() + 1000, 1,
      base::BindRepeating([] { return true; }), reply.GetCallback());
  const auto result = reply.Take();
  EXPECT_EQ(result.FindDict("result"), nullptr);
  const auto* error = result.FindDict("error");
  ASSERT_NE(error, nullptr);
  const auto* code = error->FindString("code");
  ASSERT_NE(code, nullptr);
  EXPECT_EQ(*code, "permission_denied");
}
}  // namespace aux
