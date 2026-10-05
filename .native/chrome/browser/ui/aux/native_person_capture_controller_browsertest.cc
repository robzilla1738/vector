// Copyright 2026 The Aux Authors
#include "chrome/browser/ui/aux/native_person_capture_controller.h"
#include "base/base64.h"
#include "base/logging.h"
#include "base/debug/stack_trace.h"
#include "net/base/net_errors.h"
#include "base/callback_list.h"
#include "base/json/json_reader.h"
#include "base/scoped_observation.h"
#include "chrome/browser/browser_process.h"
#include "chrome/browser/profiles/profile.h"
#include "chrome/browser/profiles/profile_manager.h"
#include "chrome/browser/profiles/profile_manager_observer.h"
#include "chrome/browser/ui/aux/runtime_host.h"
#include "components/keyed_service/content/browser_context_dependency_manager.h"
#include <memory>
#include <optional>
#include "base/strings/string_number_conversions.h"
#include "content/public/browser/navigation_handle.h"
#include "content/public/browser/web_contents_observer.h"
#include "base/command_line.h"
#include "content/public/common/content_switches.h"
#include "net/dns/mock_host_resolver.h"
#include "base/containers/span.h"
#include "third_party/skia/include/core/SkColor.h"
#include "base/functional/bind.h"
#include "base/test/bind.h"
#include "base/memory/raw_ptr.h"
#include "base/test/test_future.h"
#include "chrome/browser/ui/browser.h"
#include "chrome/browser/ui/tabs/tab_strip_model.h"
#include "chrome/test/base/in_process_browser_test.h"
#include "chrome/test/base/ui_test_utils.h"
#include "content/public/browser/render_widget_host_view.h"
#include "content/public/browser/render_frame_host.h"
#include "content/public/browser/weak_document_ptr.h"
#include "content/public/browser/web_contents.h"
#include "content/public/test/browser_test.h"
#include "content/public/test/browser_test_utils.h"
#include "net/test/embedded_test_server/embedded_test_server.h"
#include "net/test/embedded_test_server/http_request.h"
#include "net/test/embedded_test_server/http_response.h"
#include "testing/gtest/include/gtest/gtest.h"
#include "ui/gfx/codec/png_codec.h"
#include "ui/base/base_window.h"
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
class NativePersonCaptureControllerTestPeer {
 public:
  static bool HasCopiedPixels(NativePersonCaptureController* owner) { return !owner->png_.empty(); }
};
namespace {
struct CaptureGuardLifetime { bool active = true; };
class OriginalCaptureNavigationObserver final : public content::WebContentsObserver {
 public:
  OriginalCaptureNavigationObserver(content::WebContents* page, const GURL& expected,
                                    base::DictValue* facts)
      : content::WebContentsObserver(page), expected_(expected), facts_(facts) {}
  void DidStartNavigation(content::NavigationHandle* navigation) override {
    if (original_id_ || !navigation->IsInPrimaryMainFrame() ||
        navigation->GetURL() != expected_) return;
    original_id_ = navigation->GetNavigationId();
    facts_->Set("originalNavigationId", base::NumberToString(*original_id_));
    facts_->Set("originalAttemptURL", navigation->GetURL().spec());
  }
  void DidFinishNavigation(content::NavigationHandle* navigation) override {
    if (!original_id_ || navigation->GetNavigationId() != *original_id_ ||
        !navigation->IsInPrimaryMainFrame()) return;
    facts_->Set("originalAttemptFinished", true);
    facts_->Set("originalFinishedURL", navigation->GetURL().spec());
    facts_->Set("originalHasCommitted", navigation->HasCommitted());
    facts_->Set("originalIsErrorPage", navigation->IsErrorPage());
    facts_->Set("originalNetErrorCode", navigation->GetNetErrorCode());
    const auto discard_reason = navigation->GetNavigationDiscardReason();
    facts_->Set("originalDiscardReasonPresent", discard_reason.has_value());
    if (discard_reason)
      facts_->Set("originalDiscardReason", static_cast<int>(*discard_reason));
    if (navigation->GetNetErrorCode() == net::ERR_ABORTED)
      facts_->Set("originalDidFinishAbortStack", base::debug::StackTrace(16).ToString());
  }
 private:
  const GURL expected_;
  raw_ptr<base::DictValue> facts_;
  std::optional<int64_t> original_id_;
};

constexpr char kStyle[] = "position:absolute;left:20px;top:20px;width:160px;height:60px;border:0;padding:0;background:rgb(255,0,0)";
std::unique_ptr<net::test_server::HttpResponse> Fixture(const net::test_server::HttpRequest& request) {
  auto response = std::make_unique<net::test_server::BasicHttpResponse>();
  response->set_content_type("text/html");
  std::string html = std::string("<body style='margin:0;background:rgb(12,34,56)'><input id='secret' value='private' style=\"") + kStyle + "\"><div style='position:absolute;left:260px;top:20px;width:40px;height:40px;background:rgb(0,255,0)'></div>";
  if (request.relative_url == "/frame-child") html += "<div style='position:absolute;left:170px;top:65px;width:20px;height:20px;background:rgb(0,255,0)'></div>";
  if (request.relative_url == "/frame-parent") html += "<iframe src='/frame-child' style='position:absolute;left:20px;top:110px;width:200px;height:100px;border:0'></iframe>";
  if (request.relative_url == "/frame-cross-parent") html += "<iframe src='http://b.test:" + std::to_string(request.GetURL().IntPort()) + "/frame-child' style='position:absolute;left:20px;top:110px;width:200px;height:100px;border:0'></iframe>";
  response->set_content(html); return response;
}
}  // namespace
class NativePersonCaptureControllerBrowserTest : public InProcessBrowserTest,
                                               public ProfileManagerObserver {
 protected:
  void SetUpInProcessBrowserTestFixture() override {
    InProcessBrowserTest::SetUpInProcessBrowserTestFixture();
    profile_creation_ = BrowserContextDependencyManager::GetInstance()
        ->RegisterCreateServicesCallbackForTesting(base::BindRepeating(
            [](NativePersonCaptureControllerBrowserTest* fixture, content::BrowserContext*) {
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
  void SetUpCommandLine(base::CommandLine* command_line) override { command_line->AppendSwitch(switches::kSitePerProcess); }
  void SetUpOnMainThread() override {
    host_resolver()->AddRule("*","127.0.0.1");
    embedded_test_server()->RegisterRequestHandler(base::BindRepeating(&Fixture));
    ASSERT_TRUE(embedded_test_server()->Start());
    OriginalCaptureNavigationObserver original_attempt(
        browser()->tab_strip_model()->GetActiveWebContents(),
        embedded_test_server()->GetURL("/frame-parent"), &original_navigation_facts_);
    auto* original_navigation = ui_test_utils::NavigateToURL(browser(), embedded_test_server()->GetURL("/frame-parent"));
    ASSERT_TRUE(original_navigation);
    original_navigation_document_ = original_navigation->GetWeakDocumentPtr();
    page_ = browser()->tab_strip_model()->GetActiveWebContents();
    NativePersonCaptureController::CreateForWebContents(page_);
    owner_ = NativePersonCaptureController::FromWebContents(page_);
  }
  std::string OriginalFixtureScope() {
    base::DictValue scope;
    auto* original = original_navigation_document_.AsRenderFrameHostIfValid();
    auto* current = page_ ? page_->GetPrimaryMainFrame() : nullptr;
    scope.Set("originalNavigationDocumentLive", original != nullptr);
    scope.Set("originalNavigationAttempt", original_navigation_facts_.Clone());
    if (current) scope.Set("selectedCommittedURL", current->GetLastCommittedURL().spec());
    scope.Set("selectedPrimaryIsOriginalNavigation", current && current == original);
    scope.Set("selectedPageIsActive", page_ && browser()->tab_strip_model()->GetActiveWebContents() == page_);
    scope.Set("selectedOriginalFixtureURL", current && current->GetLastCommittedURL() == embedded_test_server()->GetURL("/frame-parent"));
    scope.Set("selectedFrameActive", current && current->IsActive());
    scope.Set("selectedFrameLive", current && current->IsRenderFrameLive());
    if (current && current->IsActive() && current->IsRenderFrameLive()) {
      auto secret = content::EvalJs(current, "!!document.querySelector('#secret')");
      auto iframe = content::EvalJs(current, "!!document.querySelector('iframe')");
      scope.Set("originalSecretQuerySucceeded", secret.is_bool());
      scope.Set("originalSecretPresent", secret.is_bool() && secret.ExtractBool());
      scope.Set("originalIframeQuerySucceeded", iframe.is_bool());
      scope.Set("originalIframePresent", iframe.is_bool() && iframe.ExtractBool());
    }
    return scope.DebugString();
  }
  // This component fixture supplies an original local guard. It does not
  // qualify authenticated runtime/Egress admission or external App ownership.
  base::DictValue Capture(base::RepeatingCallback<bool()> guard) {
    const std::string original_scope = OriginalFixtureScope();
    base::test::TestFuture<base::DictValue> reply;
    owner_->Capture({}, base::BindRepeating([](std::shared_ptr<CaptureGuardLifetime> lifetime, base::RepeatingCallback<bool()> original) {
      return lifetime->active && original.Run();
    }, lifetime_,std::move(guard)), reply.GetCallback());
    auto original_reply = reply.Take();
    if (original_reply.FindDict("error"))
      LOG(ERROR) << "Original Capture reply " << original_reply.DebugString()
                 << " before=" << original_scope << " after=" << OriginalFixtureScope();
    return original_reply;
  }
  bool Masked() { return content::EvalJs(page_, "document.querySelector('#secret').style.opacity === '0'").ExtractBool(); }
  void TearDownOnMainThread() override {
    // Retire the original guard before any fixture-local owner disappears.
    // Navigation genuinely destroys the original document/mask state; it does
    // not claim to repair foreign style debt on the retained old document.
    lifetime_->active = false;
    const bool original_active = page_ && browser()->tab_strip_model()->GetActiveWebContents() == page_;
    if (owner_) owner_->Retire();
    owner_ = nullptr; page_ = nullptr;
    if (original_active) EXPECT_TRUE(ui_test_utils::NavigateToURL(browser(), GURL("about:blank")));
    InProcessBrowserTest::TearDownOnMainThread();
  }
  std::shared_ptr<CaptureGuardLifetime> lifetime_ = std::make_shared<CaptureGuardLifetime>();
  base::DictValue original_navigation_facts_;
  content::WeakDocumentPtr original_navigation_document_;
  raw_ptr<content::WebContents> page_ = nullptr;
  raw_ptr<NativePersonCaptureController> owner_ = nullptr;
};
IN_PROC_BROWSER_TEST_F(NativePersonCaptureControllerBrowserTest, SameWidgetFramesMaskEditablePixelsAndRestoreOriginalStyles) {
  auto reply = Capture(base::BindRepeating([] { return true; }));
  auto* result = reply.FindDict("result"); ASSERT_TRUE(result);
  const auto* encoded = result->FindString("pngBase64"); ASSERT_TRUE(encoded);
  std::string bytes; ASSERT_TRUE(base::Base64Decode(*encoded, &bytes));
  auto bitmap = gfx::PNGCodec::Decode(base::as_byte_span(bytes)); ASSERT_FALSE(bitmap.drawsNothing());
  const int css_width = result->FindInt("width").value_or(0); ASSERT_GT(css_width, 300);
  auto pixel = [&](int x, int y) { return bitmap.getColor(x * bitmap.width() / css_width, y * bitmap.height() / result->FindInt("height").value()); };
  EXPECT_EQ(SkColorSetRGB(12,34,56), pixel(32,32));
  EXPECT_EQ(SkColorSetRGB(12,34,56), pixel(52,142));
  EXPECT_EQ(SkColorSetRGB(0,255,0), pixel(270,30));
  EXPECT_EQ(SkColorSetRGB(0,255,0), pixel(195,180));
  EXPECT_EQ(kStyle, content::EvalJs(page_, "document.querySelector('#secret').getAttribute('style')").ExtractString());
  EXPECT_EQ(kStyle, content::EvalJs(page_, "document.querySelector('iframe').contentDocument.querySelector('#secret').getAttribute('style')").ExtractString());
}
IN_PROC_BROWSER_TEST_F(NativePersonCaptureControllerBrowserTest, NewEditableMutationRefusesPixelsButRestoresOriginalMask) {
  auto changed = std::make_shared<bool>(false);
  auto reply = Capture(base::BindLambdaForTesting([this,changed] {
    if (!*changed && Masked()) { *changed = true; EXPECT_TRUE(content::ExecJs(page_, "document.body.append(document.createElement('textarea'))")); }
    return true;
  }));
  EXPECT_TRUE(*changed); EXPECT_TRUE(reply.FindDict("error"));
  EXPECT_EQ(kStyle, content::EvalJs(page_, "document.querySelector('#secret').getAttribute('style')").ExtractString());
}
IN_PROC_BROWSER_TEST_F(NativePersonCaptureControllerBrowserTest, ForeignStyleRetainsMaskRestorationDebtAndBlocksNextCapture) {
  auto changed = std::make_shared<bool>(false);
  auto reply = Capture(base::BindLambdaForTesting([this,changed] {
    if (!*changed && Masked()) { *changed = true; EXPECT_TRUE(content::ExecJs(page_, "document.querySelector('#secret').setAttribute('style','color:yellow')")); }
    return true;
  }));
  EXPECT_TRUE(*changed); EXPECT_TRUE(reply.FindDict("error"));
  EXPECT_EQ("color:yellow", content::EvalJs(page_, "document.querySelector('#secret').getAttribute('style')").ExtractString());
  auto guard_calls = std::make_shared<int>(0); auto refused = Capture(base::BindLambdaForTesting([guard_calls] { ++*guard_calls; return true; }));
  EXPECT_TRUE(refused.FindDict("error")); EXPECT_EQ(0, *guard_calls);
}
IN_PROC_BROWSER_TEST_F(NativePersonCaptureControllerBrowserTest, OriginalDocumentAndWidgetRetirementDoesNotRestoreReplacementDocument) {
  auto navigated = std::make_shared<bool>(false);
  auto reply = Capture(base::BindLambdaForTesting([this,navigated] {
    if (!*navigated && Masked()) { *navigated = true; EXPECT_TRUE(ui_test_utils::NavigateToURL(browser(), embedded_test_server()->GetURL("b.test","/replacement"))); }
    return true;
  }));
  EXPECT_TRUE(*navigated); EXPECT_TRUE(reply.FindDict("error"));
  EXPECT_EQ(kStyle, content::EvalJs(page_, "document.querySelector('#secret').getAttribute('style')").ExtractString());
}
IN_PROC_BROWSER_TEST_F(NativePersonCaptureControllerBrowserTest, ActualViewportChangeAfterCopyRefusesExportAndRestoresMask) {
  auto resized = std::make_shared<bool>(false);
  auto attempted = std::make_shared<bool>(false);
  auto reply = Capture(base::BindLambdaForTesting([this,resized,attempted] {
    if (!*attempted && NativePersonCaptureControllerTestPeer::HasCopiedPixels(owner_)) {
      *attempted = true; auto* view = page_->GetRenderWidgetHostView(); auto size = view->GetVisibleViewportSize();
      const auto original_page = page_->GetWeakPtr();
      const auto original_document = page_->GetPrimaryMainFrame()->GetWeakDocumentPtr();
      content::RenderFrameSubmissionObserver viewport(page_);
      auto bounds = browser()->GetWindow()->GetBounds();
      bounds.set_width(bounds.width() - 80);
      bounds.set_height(bounds.height() - 40);
      ui_test_utils::SetAndWaitForBounds(*browser(), bounds);
      // Failure detail only: observe the first false original short-circuit
      // predicate at the same reads; never query a replacement or stale view.
      int viewport_exit = 0;
      const auto unchanged_original_view = [&] {
        if (!original_page) { viewport_exit = 1; return false; }
        if (original_document.AsRenderFrameHostIfValid() != original_page->GetPrimaryMainFrame()) {
          viewport_exit = 2; return false;
        }
        if (original_page->GetRenderWidgetHostView() != view) {
          viewport_exit = 3; return false;
        }
        if (view->GetVisibleViewportSize() != size) {
          viewport_exit = 4; return false;
        }
        return true;
      };
      while (unchanged_original_view())
        viewport.WaitForMetadataChange();
      *resized = original_page &&
          original_document.AsRenderFrameHostIfValid() == original_page->GetPrimaryMainFrame() &&
          original_page->GetRenderWidgetHostView() == view &&
          view->GetVisibleViewportSize() != size;
      EXPECT_TRUE(*resized) << "viewport-observation-exit=" << viewport_exit;
    }
    return true;
  }));
  EXPECT_TRUE(*resized); EXPECT_TRUE(reply.FindDict("error"));
  EXPECT_EQ(kStyle, content::EvalJs(page_, "document.querySelector('#secret').getAttribute('style')").ExtractString());
}
IN_PROC_BROWSER_TEST_F(NativePersonCaptureControllerBrowserTest, ActiveTransitionAndAnimationCannotExposeEditablePixels) {
  ASSERT_TRUE(content::ExecJs(page_, R"(
    (async () => {
    const input = document.querySelector('#secret');
    const style = document.createElement('style');
    style.textContent = '@keyframes expose { from { opacity:1 } to { opacity:1 } }';
    document.head.append(style);
    input.style.animation = 'expose 30s infinite'; input.style.transition = 'opacity 30s';
    input.style.opacity = '.9'; await new Promise(requestAnimationFrame); input.style.opacity = '1';
    })()
  )"));
  const auto original = content::EvalJs(page_, "document.querySelector('#secret').getAttribute('style')").ExtractString();
  auto reply = Capture(base::BindRepeating([] { return true; }));
  auto* result = reply.FindDict("result"); ASSERT_TRUE(result);
  std::string bytes; ASSERT_TRUE(base::Base64Decode(*result->FindString("pngBase64"), &bytes));
  auto bitmap = gfx::PNGCodec::Decode(base::as_byte_span(bytes)); ASSERT_FALSE(bitmap.drawsNothing());
  EXPECT_EQ(SkColorSetRGB(12,34,56), bitmap.getColor(32*bitmap.width()/result->FindInt("width").value(),32*bitmap.height()/result->FindInt("height").value()));
  EXPECT_EQ(original, content::EvalJs(page_, "document.querySelector('#secret').getAttribute('style')").ExtractString());
}
IN_PROC_BROWSER_TEST_F(NativePersonCaptureControllerBrowserTest, RealCustomElementMaskReactionCannotInsertUnmaskedEditableContent) {
  ASSERT_TRUE(content::ExecJs(page_, R"(
    customElements.define('x-inserter',class extends HTMLElement {
      static get observedAttributes(){return ['style'];}
      attributeChangedCallback(){if(!this.hasAttribute('inserted')){this.setAttribute('inserted','yes');document.body.append(document.createElement('textarea'));}}
    }); document.body.append(document.createElement('x-inserter'));
  )"));
  auto reply = Capture(base::BindRepeating([] { return true; }));
  EXPECT_TRUE(reply.FindDict("error"));
  EXPECT_EQ(1, content::EvalJs(page_, "document.querySelectorAll('textarea').length").ExtractInt());
  EXPECT_TRUE(content::EvalJs(page_, "document.querySelector('x-inserter').getAttribute('style') === null").ExtractBool());
  EXPECT_EQ(kStyle, content::EvalJs(page_, "document.querySelector('#secret').getAttribute('style')").ExtractString());
}
IN_PROC_BROWSER_TEST_F(NativePersonCaptureControllerBrowserTest, RealCustomElementForeignStyleRetainsOriginalDebt) {
  ASSERT_TRUE(content::ExecJs(page_, R"(
    let changed = false;
    customElements.define('x-styler',class extends HTMLElement {
      static get observedAttributes(){return ['style'];}
      attributeChangedCallback(){if(!changed){changed=true;this.style.color='yellow';}}
    }); document.body.append(document.createElement('x-styler'));
  )"));
  auto reply = Capture(base::BindRepeating([] { return true; })); EXPECT_TRUE(reply.FindDict("error"));
  EXPECT_EQ("yellow", content::EvalJs(page_, "document.querySelector('x-styler').style.color").ExtractString());
  auto guards = std::make_shared<int>(0); auto refused = Capture(base::BindLambdaForTesting([guards] { ++*guards; return true; }));
  EXPECT_TRUE(refused.FindDict("error")); EXPECT_EQ(0, *guards);
}
IN_PROC_BROWSER_TEST_F(NativePersonCaptureControllerBrowserTest, RestorationAuthorReactionDoesNotOverwriteLaterOriginalNode) {
  ASSERT_TRUE(content::ExecJs(page_, R"(
    customElements.define('x-restorer',class extends HTMLElement {
      static get observedAttributes(){return ['style'];}
      attributeChangedCallback(){if(this.style.opacity!=='0')document.querySelector('#later').setAttribute('style','color:blue');}
    }); document.body.append(document.createElement('x-restorer'));
    const later=document.createElement('input');later.id='later';later.setAttribute('style','color:red');document.body.append(later);
  )"));
  auto reply = Capture(base::BindRepeating([] { return true; })); EXPECT_TRUE(reply.FindDict("error"));
  EXPECT_EQ("color:blue", content::EvalJs(page_, "document.querySelector('#later').getAttribute('style')").ExtractString());
  auto guards = std::make_shared<int>(0); auto refused = Capture(base::BindLambdaForTesting([guards] { ++*guards; return true; }));
  EXPECT_TRUE(refused.FindDict("error")); EXPECT_EQ(0, *guards);
}
IN_PROC_BROWSER_TEST_F(NativePersonCaptureControllerBrowserTest, StyleABABeforeRestoreRetainsOriginalDebt) {
  auto changed = std::make_shared<bool>(false);
  auto reply = Capture(base::BindLambdaForTesting([this,changed] {
    if (!*changed && NativePersonCaptureControllerTestPeer::HasCopiedPixels(owner_)) {
      *changed=true; EXPECT_TRUE(content::ExecJs(page_, R"(
        const input=document.querySelector('#secret');const originalMask=input.getAttribute('style');
        input.setAttribute('style','color:blue');input.setAttribute('style',originalMask);
      )"));
    }
    return true;
  }));
  EXPECT_TRUE(*changed); EXPECT_TRUE(reply.FindDict("error"));
  EXPECT_NE(kStyle, content::EvalJs(page_, "document.querySelector('#secret').getAttribute('style')").ExtractString());
  auto guards = std::make_shared<int>(0); auto refused = Capture(base::BindLambdaForTesting([guards] { ++*guards; return true; }));
  EXPECT_TRUE(refused.FindDict("error")); EXPECT_EQ(0, *guards);
}
IN_PROC_BROWSER_TEST_F(NativePersonCaptureControllerBrowserTest, OOPIFOriginalChosenChildKeepsPublicPixelsAndMasksEditablePixels) {
  ASSERT_TRUE(ui_test_utils::NavigateToURL(browser(), embedded_test_server()->GetURL("a.test","/frame-cross-parent")));
  ASSERT_NE(page_->GetPrimaryMainFrame()->GetRenderWidgetHost(), content::ChildFrameAt(page_->GetPrimaryMainFrame(),0)->GetRenderWidgetHost());
  auto reply = Capture(base::BindRepeating([] { return true; }));
  auto* result = reply.FindDict("result"); ASSERT_TRUE(result);
  std::string bytes; ASSERT_TRUE(base::Base64Decode(*result->FindString("pngBase64"), &bytes));
  auto bitmap = gfx::PNGCodec::Decode(base::as_byte_span(bytes)); ASSERT_FALSE(bitmap.drawsNothing());
  auto pixel = [&](int x,int y){return bitmap.getColor(x*bitmap.width()/result->FindInt("width").value(),y*bitmap.height()/result->FindInt("height").value());};
  EXPECT_EQ(SkColorSetRGB(12,34,56),pixel(52,142));
  EXPECT_EQ(SkColorSetRGB(0,255,0),pixel(195,180));
  EXPECT_EQ(SkColorSetRGB(0,255,0),pixel(270,30));
  auto* child=content::ChildFrameAt(page_->GetPrimaryMainFrame(),0);
  EXPECT_EQ(kStyle,content::EvalJs(child,"document.querySelector('#secret').getAttribute('style')").ExtractString());
}
}  // namespace aux
