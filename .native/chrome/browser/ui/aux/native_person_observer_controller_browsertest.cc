// Copyright 2026 The Aux Authors
#include "chrome/browser/ui/aux/native_person_observer_controller.h"

#include <memory>
#include "base/functional/bind.h"
#include "base/memory/raw_ptr.h"
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
#include "content/public/browser/navigation_controller.h"
#include "content/public/browser/referrer.h"
#include "content/public/test/test_navigation_observer.h"
#include "net/http/http_status_code.h"
#include "net/test/embedded_test_server/embedded_test_server.h"
#include "net/test/embedded_test_server/http_request.h"
#include "net/test/embedded_test_server/http_response.h"
#include "testing/gtest/include/gtest/gtest.h"
#include "ui/base/page_transition_types.h"

namespace aux {
namespace {
std::unique_ptr<net::test_server::HttpResponse> ReadFixture(
    const net::test_server::HttpRequest& request) {
  if (request.relative_url != "/ordinary-read" &&
      request.relative_url != "/replacement-read" &&
      request.relative_url != "/protected-read") return nullptr;
  auto response = std::make_unique<net::test_server::BasicHttpResponse>();
  response->set_code(net::HTTP_OK);
  response->set_content_type("text/html");
  response->set_content(request.relative_url == "/protected-read" ?
      "<!doctype html><title>Protected echo</title><input type=password value=secret><p>Protected echo</p>" :
      "<!doctype html><title>Ordinary fixture</title><h1 id=readable>Readable heading</h1><input name=company value=private-field-value><button>Continue</button>");
  return response;
}
base::DictValue Observe() {
  return base::DictValue().Set("operation", "observe")
      .Set("maxElements", 20).Set("maxTextChars", 1000);
}
}  // namespace
class NativePersonObserverControllerBrowserTest : public InProcessBrowserTest {
 protected:
  void SetUpOnMainThread() override {
    embedded_test_server()->RegisterRequestHandler(base::BindRepeating(&ReadFixture));
    ASSERT_TRUE(embedded_test_server()->Start());
    TabCatalog::EnsureFactoryBuilt();
    ASSERT_TRUE(ui_test_utils::NavigateToURL(browser(),
        embedded_test_server()->GetURL("/ordinary-read")));
    page_ = browser()->tab_strip_model()->GetActiveWebContents();
    ASSERT_NE(page_, nullptr);
    PageIdentity::GetOrCreate(browser()->GetProfile(), page_);
    TabCatalog::GetForProfile(browser()->GetProfile())->Snapshot();
    NativePersonObserverController::CreateForWebContents(page_);
    reader_ = NativePersonObserverController::FromWebContents(page_);
    ASSERT_NE(reader_, nullptr);
  }
  base::DictValue Read(base::DictValue request = Observe()) {
    base::test::TestFuture<base::DictValue> reply;
    reader_->Read(1, std::move(request), reply.GetCallback());
    return reply.Take();
  }
  raw_ptr<content::WebContents> page_ = nullptr;
  raw_ptr<NativePersonObserverController> reader_ = nullptr;
};

IN_PROC_BROWSER_TEST_F(NativePersonObserverControllerBrowserTest,
                       FixedReadReturnsOriginalDocumentWithoutFieldValues) {
  auto reply = Read();
  auto* result = reply.FindDict("result");
  ASSERT_NE(result, nullptr);
  auto* value = result->FindDict("value");
  ASSERT_NE(value, nullptr);
  ASSERT_NE(value->FindString("title"), nullptr);
  EXPECT_EQ(*value->FindString("title"), "Ordinary fixture");
  ASSERT_NE(value->FindString("text"), nullptr);
  EXPECT_EQ(value->FindString("text")->find("private-field-value"), std::string::npos);
  const auto* original_document = result->FindString("documentId");
  ASSERT_NE(original_document, nullptr);
  const std::string id = *original_document;
  auto repeated = Read();
  ASSERT_NE(repeated.FindDict("result"), nullptr);
  ASSERT_NE(repeated.FindDict("result")->FindString("documentId"), nullptr);
  EXPECT_EQ(*repeated.FindDict("result")->FindString("documentId"), id);
}

IN_PROC_BROWSER_TEST_F(NativePersonObserverControllerBrowserTest,
                       ClosedRequestRejectsCallerScriptAndValueAttribute) {
  EXPECT_NE(Read(Observe().Set("script", "document.body.innerText")).FindDict("error"), nullptr);
  base::ListValue fields;
  fields.Append(base::DictValue().Set("name", "field").Set("selector", "input")
      .Set("attribute", "value"));
  EXPECT_NE(Read(base::DictValue().Set("operation", "extract")
      .Set("fields", std::move(fields))).FindDict("error"), nullptr);
  ASSERT_NE(Read().FindDict("result"), nullptr);
}

IN_PROC_BROWSER_TEST_F(NativePersonObserverControllerBrowserTest,
                       ProtectedDocumentRefusesBeforeReturningEchoes) {
  ASSERT_TRUE(ui_test_utils::NavigateToURL(browser(),
      embedded_test_server()->GetURL("/protected-read")));
  auto reply = Read();
  EXPECT_NE(reply.FindDict("error"), nullptr);
  EXPECT_EQ(reply.FindDict("result"), nullptr);
}

IN_PROC_BROWSER_TEST_F(NativePersonObserverControllerBrowserTest,
                       OriginalDisconnectCannotClearReplacementRead) {
  base::test::TestFuture<base::DictValue> original;
  reader_->Read(1, Observe(), original.GetCallback());
  reader_->Disconnect(1);
  ASSERT_NE(original.Take().FindDict("error"), nullptr);
  auto replacement = Read();
  ASSERT_NE(replacement.FindDict("result"), nullptr);
  ASSERT_NE(Read().FindDict("result"), nullptr);
}

IN_PROC_BROWSER_TEST_F(NativePersonObserverControllerBrowserTest,
                       SettledOwnerMutationRetiresPendingOriginalRead) {
  base::test::TestFuture<base::DictValue> original;
  reader_->Read(1, Observe(), original.GetCallback());
  auto* authority = EgressController::ForProfile(browser()->GetProfile());
  auto mutation = authority->owner_mutations().Begin();
  ASSERT_TRUE(mutation);
  ASSERT_TRUE(authority->owner_mutations().End(*mutation, true));
  EXPECT_NE(original.Take().FindDict("error"), nullptr);
  ASSERT_NE(Read().FindDict("result"), nullptr);
}

IN_PROC_BROWSER_TEST_F(NativePersonObserverControllerBrowserTest,
                       NavigationRetiresOriginalBeforeReplacementDocumentRead) {
  base::test::TestFuture<base::DictValue> original;
  reader_->Read(1, Observe(), original.GetCallback());
  content::TestNavigationObserver navigation(page_);
  page_->GetController().LoadURL(embedded_test_server()->GetURL("/replacement-read"),
      content::Referrer(), ui::PAGE_TRANSITION_TYPED, std::string());
  navigation.Wait();
  ASSERT_TRUE(navigation.last_navigation_succeeded());
  EXPECT_NE(original.Take().FindDict("error"), nullptr);
  auto replacement = Read();
  ASSERT_NE(replacement.FindDict("result"), nullptr);
  auto* value = replacement.FindDict("result")->FindDict("value");
  ASSERT_NE(value, nullptr);
  ASSERT_NE(value->FindString("url"), nullptr);
  EXPECT_EQ(*value->FindString("url"), embedded_test_server()->GetURL("/replacement-read").spec());
}
}  // namespace aux
