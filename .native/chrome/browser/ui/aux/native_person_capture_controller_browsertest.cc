// Copyright 2026 The Aux Authors
#include "chrome/browser/ui/aux/native_person_capture_controller.h"
#include "base/base64.h"
#include <memory>
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
#include "content/public/browser/web_contents.h"
#include "content/public/test/browser_test.h"
#include "content/public/test/browser_test_utils.h"
#include "net/test/embedded_test_server/embedded_test_server.h"
#include "net/test/embedded_test_server/http_request.h"
#include "net/test/embedded_test_server/http_response.h"
#include "testing/gtest/include/gtest/gtest.h"
#include "ui/gfx/codec/png_codec.h"
namespace aux {
class NativePersonCaptureControllerTestPeer {
 public:
  static bool HasCopiedPixels(NativePersonCaptureController* owner) { return !owner->png_.empty(); }
};
namespace {
struct CaptureGuardLifetime { bool active = true; };
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
class NativePersonCaptureControllerBrowserTest : public InProcessBrowserTest {
 protected:
  void SetUpCommandLine(base::CommandLine* command_line) override { command_line->AppendSwitch(switches::kSitePerProcess); }
  void SetUpOnMainThread() override {
    host_resolver()->AddRule("*","127.0.0.1");
    embedded_test_server()->RegisterRequestHandler(base::BindRepeating(&Fixture));
    ASSERT_TRUE(embedded_test_server()->Start());
    ASSERT_TRUE(ui_test_utils::NavigateToURL(browser(), embedded_test_server()->GetURL("/frame-parent")));
    page_ = browser()->tab_strip_model()->GetActiveWebContents();
    NativePersonCaptureController::CreateForWebContents(page_);
    owner_ = NativePersonCaptureController::FromWebContents(page_);
  }
  // This component fixture supplies an original local guard. It does not
  // qualify authenticated runtime/Egress admission or external App ownership.
  base::DictValue Capture(base::RepeatingCallback<bool()> guard) {
    base::test::TestFuture<base::DictValue> reply;
    owner_->Capture({}, base::BindRepeating([](std::shared_ptr<CaptureGuardLifetime> lifetime, base::RepeatingCallback<bool()> original) {
      return lifetime->active && original.Run();
    }, lifetime_,std::move(guard)), reply.GetCallback()); return reply.Take();
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
  auto reply = Capture(base::BindLambdaForTesting([this,resized] {
    if (!*resized && NativePersonCaptureControllerTestPeer::HasCopiedPixels(owner_)) {
      *resized = true; auto* view = page_->GetRenderWidgetHostView(); auto size = view->GetVisibleViewportSize();
      view->SetSize(gfx::Size(size.width()+80,size.height()+40));
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
