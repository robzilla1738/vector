// Copyright 2026 The Aux Authors
#include "chrome/browser/ui/aux/native_person_observer_controller.h"

#include <algorithm>
#include <array>
#include <memory>
#include "components/keyed_service/content/browser_context_dependency_manager.h"
#include "chrome/browser/profiles/profile_manager_observer.h"
#include "chrome/browser/profiles/profile_manager.h"
#include "chrome/browser/browser_process.h"
#include "base/scoped_observation.h"
#include "base/json/json_reader.h"
#include "base/callback_list.h"
#include "base/functional/bind.h"
#include "base/functional/callback_helpers.h"
#include "base/memory/raw_ptr.h"
#include "base/test/bind.h"
#include "base/test/test_future.h"
#include "base/uuid.h"
#include "chrome/browser/profiles/profile.h"
#include "chrome/browser/ui/aux/egress_controller.h"
#include "chrome/browser/ui/aux/page_identity.h"
#include "chrome/browser/ui/aux/runtime_host.h"
#include "chrome/browser/ui/aux/tab_catalog.h"
#include "chrome/browser/ui/browser.h"
#include "chrome/browser/ui/browser_window/public/browser_window_interface.h"
#include "chrome/browser/ui/tabs/tab_strip_model.h"
#include "chrome/test/base/in_process_browser_test.h"
#include "chrome/test/base/testing_profile.h"
#include "chrome/test/base/ui_test_utils.h"
#include "components/profile_metrics/browser_profile_type.h"
#include "content/public/browser/web_contents.h"
#include "content/public/browser/render_frame_host.h"
#include "content/public/browser/navigation_controller.h"
#include "content/public/common/referrer.h"
#include "content/public/test/browser_test.h"
#include "content/public/test/test_navigation_observer.h"
#include "net/http/http_status_code.h"
#include "net/test/embedded_test_server/embedded_test_server.h"
#include "net/test/embedded_test_server/http_request.h"
#include "net/test/embedded_test_server/http_response.h"
#include "testing/gtest/include/gtest/gtest.h"
#include "ui/base/page_transition_types.h"

// This peer drives original host publication/retirement transitions. The
// generation is synthetic; these cases do not qualify Worker socket/hello.
class NativePersonReadHostTestPeer {
 public:
  static AuxRuntimeHost* Install(Profile* profile) {
    return AuxRuntimeHost::InstallTestDispatch(profile, base::BindRepeating(
        [](bool, std::string, std::string, AuxRuntimeHost::ResponseCallback done) {
          std::move(done).Run({false, "", "unsupported", "fixture transport unavailable"});
        }));
  }
  static void Remove(Profile* profile) {
    AuxRuntimeHost::RemoveTestDispatch(profile);
  }
  static base::WeakPtr<AuxRuntimeHost> Weak(AuxRuntimeHost* host) {
    return host->weak_factory_.GetWeakPtr();
  }
  static std::string Incarnation(AuxRuntimeHost* host) {
    return host->native_owner_incarnation_;
  }
  static uint64_t PublishNext(AuxRuntimeHost* host) {
    const uint64_t generation = std::max(host->admitted_native_generation_,
                                        host->retired_native_generation_) + 1;
    host->NativeConnectionPublished(generation);
    return generation;
  }
  static void Publish(AuxRuntimeHost* host, uint64_t generation) {
    host->NativeConnectionPublished(generation);
  }
  static void Retire(AuxRuntimeHost* host, uint64_t generation) {
    host->NativeConnectionRetired(generation);
  }
  static size_t Pending(AuxRuntimeHost* host) {
    return host->native_person_reads_.size();
  }
  static void Call(AuxRuntimeHost* host, uint64_t generation,
                   std::string method, base::DictValue params,
                   base::OnceCallback<void(base::DictValue)> reply) {
    host->HandleNativePersonReadCall(method, params, generation, std::move(reply));
  }
};

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
class NativePersonObserverControllerBrowserTest : public InProcessBrowserTest,
                                                  public ProfileManagerObserver {
 protected:
  void SetUpInProcessBrowserTestFixture() override {
    InProcessBrowserTest::SetUpInProcessBrowserTestFixture();
    profile_creation_ = BrowserContextDependencyManager::GetInstance()
        ->RegisterCreateServicesCallbackForTesting(base::BindRepeating(
            [](NativePersonObserverControllerBrowserTest* fixture, content::BrowserContext*) {
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
  base::DictValue OriginalReadScope() {
    auto* page = page_.get();
    auto* frame = page ? page->GetPrimaryMainFrame() : nullptr;
    const auto* identity = page ? PageIdentity::FromWebContents(page) : nullptr;
    auto* profile = browser()->GetProfile();
    auto* catalog = TabCatalog::GetForProfile(profile);
    auto* authority = EgressController::ForProfile(profile);
    return base::DictValue()
        .Set("same_profile", page && page->GetBrowserContext() == profile)
        .Set("off_record", profile->IsOffTheRecord())
        .Set("pending_owner", authority->owner_mutations().pending())
        .Set("identity_present", identity != nullptr)
        .Set("runtime_owned", identity && identity->runtime_owned())
        .Set("frame_active", frame && frame->IsActive())
        .Set("frame_live", frame && frame->IsRenderFrameLive())
        .Set("same_catalog_page", identity && catalog && catalog->FindPage(identity->id()) == page)
        .Set("isolated_page", authority->IsIsolatedPage(page))
        .Set("http_url", page && page->GetLastCommittedURL().SchemeIsHTTPOrHTTPS())
        .Set("original_opener", page && page->GetFirstWebContentsInLiveOriginalOpenerChain() != nullptr);
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
  const auto original_scope = OriginalReadScope();
  auto reply = Read();
  auto* result = reply.FindDict("result");
  ASSERT_NE(result, nullptr) << reply.DebugString() << " original_scope=" << original_scope.DebugString();
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
  base::test::TestFuture<base::DictValue> replacement;
  reader_->Read(2, Observe(), replacement.GetCallback());
  reader_->Disconnect(1);
  ASSERT_NE(replacement.Take().FindDict("result"), nullptr);
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
IN_PROC_BROWSER_TEST_F(NativePersonObserverControllerBrowserTest,
                       NativeReadSessionRetainsOriginalDocumentAndConnection) {
  const auto original_scope = OriginalReadScope();
  auto* authority = EgressController::ForProfile(browser()->GetProfile());
  auto receipt = authority->CapturePersonRead(page_);
  ASSERT_TRUE(receipt) << " original_scope=" << original_scope.DebugString();
  const auto connection = base::Uuid::GenerateRandomV4().AsLowercaseString();
  auto first = NativePersonObserverController::Describe(*receipt, connection);
  auto repeated = NativePersonObserverController::Describe(*receipt, connection);
  ASSERT_NE(first.FindDict("result"), nullptr);
  ASSERT_NE(repeated.FindDict("result"), nullptr);
  const auto* session = first.FindDict("result")->FindString("sessionId");
  ASSERT_NE(session, nullptr);
  ASSERT_NE(repeated.FindDict("result")->FindString("sessionId"), nullptr);
  EXPECT_EQ(*repeated.FindDict("result")->FindString("sessionId"), *session);
  EXPECT_EQ(first.FindDict("result")->FindDict("value"), nullptr);
  auto replacement = NativePersonObserverController::Describe(*receipt,
      base::Uuid::GenerateRandomV4().AsLowercaseString());
  ASSERT_NE(replacement.FindDict("result"), nullptr);
  ASSERT_NE(replacement.FindDict("result")->FindString("sessionId"), nullptr);
  EXPECT_NE(*replacement.FindDict("result")->FindString("sessionId"), *session);
  ASSERT_NE(replacement.FindDict("result")->FindString("documentId"), nullptr);
  ASSERT_NE(first.FindDict("result")->FindString("documentId"), nullptr);
  EXPECT_EQ(*replacement.FindDict("result")->FindString("documentId"),
            *first.FindDict("result")->FindString("documentId"));
}
IN_PROC_BROWSER_TEST_F(NativePersonObserverControllerBrowserTest,
                       SettledOwnerMutationRotatesNativeReadSession) {
  auto* authority = EgressController::ForProfile(browser()->GetProfile());
  auto receipt = authority->CapturePersonRead(page_);
  ASSERT_TRUE(receipt);
  const auto connection = base::Uuid::GenerateRandomV4().AsLowercaseString();
  auto first = NativePersonObserverController::Describe(*receipt, connection);
  ASSERT_NE(first.FindDict("result"), nullptr);
  ASSERT_NE(first.FindDict("result")->FindString("sessionId"), nullptr);
  const std::string original_session = *first.FindDict("result")->FindString("sessionId");
  auto mutation = authority->owner_mutations().Begin();
  ASSERT_TRUE(mutation);
  ASSERT_TRUE(authority->owner_mutations().End(*mutation, true));
  EXPECT_FALSE(authority->MayReadPerson(*receipt));
  EXPECT_NE(NativePersonObserverController::Describe(*receipt, connection).FindDict("error"), nullptr);
  auto current = authority->CapturePersonRead(page_);
  ASSERT_TRUE(current);
  auto replacement = NativePersonObserverController::Describe(*current, connection);
  ASSERT_NE(replacement.FindDict("result"), nullptr);
  ASSERT_NE(replacement.FindDict("result")->FindString("sessionId"), nullptr);
  EXPECT_NE(*replacement.FindDict("result")->FindString("sessionId"), original_session);
}
}  // namespace aux

namespace aux {
IN_PROC_BROWSER_TEST_F(NativePersonObserverControllerBrowserTest,
                       OriginalHostPublicationIsIdempotentAndRetiredGenerationRefuses) {
  auto* host = AuxRuntimeHost::ForProfile(browser()->GetProfile());
  ASSERT_NE(host, nullptr);
  const auto generation = NativePersonReadHostTestPeer::PublishNext(host);
  auto receipt = EgressController::ForProfile(browser()->GetProfile())->CapturePersonRead(page_);
  ASSERT_TRUE(receipt);
  const auto id = receipt->page_id();
  auto describe = [&](uint64_t current) {
    base::test::TestFuture<base::DictValue> reply;
    NativePersonReadHostTestPeer::Call(host, current, "native.personReadContext",
        base::DictValue().Set("pageId", id), reply.GetCallback());
    return reply.Take();
  };
  auto first = describe(generation);
  ASSERT_NE(first.FindDict("result"), nullptr);
  ASSERT_NE(first.FindDict("result")->FindString("sessionId"), nullptr);
  const auto session = *first.FindDict("result")->FindString("sessionId");
  NativePersonReadHostTestPeer::Publish(host, generation);
  auto duplicate = describe(generation);
  ASSERT_NE(duplicate.FindDict("result"), nullptr);
  ASSERT_NE(duplicate.FindDict("result")->FindString("sessionId"), nullptr);
  EXPECT_EQ(*duplicate.FindDict("result")->FindString("sessionId"), session);
  NativePersonReadHostTestPeer::Retire(host, generation);
  EXPECT_NE(describe(generation).FindDict("error"), nullptr);
  const auto replacement = NativePersonReadHostTestPeer::PublishNext(host);
  NativePersonReadHostTestPeer::Retire(host, generation);
  auto fresh = describe(replacement);
  ASSERT_NE(fresh.FindDict("result"), nullptr);
  ASSERT_NE(fresh.FindDict("result")->FindString("sessionId"), nullptr);
  EXPECT_NE(*fresh.FindDict("result")->FindString("sessionId"), session);
}

IN_PROC_BROWSER_TEST_F(NativePersonObserverControllerBrowserTest,
                       ActualEightPendingHostReadsRefuseNinthAndRetirementClearsAll) {
  std::array<std::string, 8> ids;
  for (size_t index = 0; index < ids.size(); ++index) {
    if (index) ASSERT_NE(ui_test_utils::NavigateToURLWithDisposition(browser(),
        embedded_test_server()->GetURL("/ordinary-read"),
        WindowOpenDisposition::NEW_FOREGROUND_TAB,
        ui_test_utils::BROWSER_TEST_WAIT_FOR_LOAD_STOP), nullptr);
    auto* page = browser()->tab_strip_model()->GetActiveWebContents();
    PageIdentity::GetOrCreate(browser()->GetProfile(), page);
    TabCatalog::GetForProfile(browser()->GetProfile())->Snapshot();
    auto receipt = EgressController::ForProfile(browser()->GetProfile())->CapturePersonRead(page);
    ASSERT_TRUE(receipt);
    ids[index] = receipt->page_id();
  }
  auto* host = AuxRuntimeHost::ForProfile(browser()->GetProfile());
  ASSERT_NE(host, nullptr);
  const auto generation = NativePersonReadHostTestPeer::PublishNext(host);
  std::array<base::test::TestFuture<base::DictValue>, 8> replies;
  // No task drain: all actual renderer requests remain pending concurrently.
  for (size_t index = 0; index < ids.size(); ++index) {
    NativePersonReadHostTestPeer::Call(host, generation, "native.personRead",
        base::DictValue().Set("pageId", ids[index]).Set("request", Observe()),
        replies[index].GetCallback());
    ASSERT_FALSE(replies[index].IsReady());
  }
  EXPECT_EQ(NativePersonReadHostTestPeer::Pending(host), 8u);
  base::test::TestFuture<base::DictValue> ninth;
  NativePersonReadHostTestPeer::Call(host, generation, "native.personRead",
      base::DictValue().Set("pageId", ids[0]).Set("request", Observe()), ninth.GetCallback());
  auto refused = ninth.Take();
  ASSERT_NE(refused.FindDict("error"), nullptr);
  ASSERT_NE(refused.FindDict("error")->FindString("code"), nullptr);
  EXPECT_EQ(*refused.FindDict("error")->FindString("code"), "conflict");
  NativePersonReadHostTestPeer::Retire(host, generation);
  EXPECT_EQ(NativePersonReadHostTestPeer::Pending(host), 0u);
  for (auto& reply : replies) {
    auto result = reply.Take();
    ASSERT_NE(result.FindDict("error"), nullptr);
    ASSERT_NE(result.FindDict("error")->FindString("code"), nullptr);
    EXPECT_EQ(*result.FindDict("error")->FindString("code"), "target_detached");
    EXPECT_EQ(result.FindDict("result"), nullptr);
  }
}

IN_PROC_BROWSER_TEST_F(NativePersonObserverControllerBrowserTest,
                       OriginalRetirementCallbackRetainsReentrantReplacementRead) {
  auto* host = AuxRuntimeHost::ForProfile(browser()->GetProfile());
  ASSERT_NE(host, nullptr);
  auto receipt = EgressController::ForProfile(browser()->GetProfile())->CapturePersonRead(page_);
  ASSERT_TRUE(receipt);
  const auto id = receipt->page_id();
  const auto generation = NativePersonReadHostTestPeer::PublishNext(host);
  base::test::TestFuture<base::DictValue> original, replacement;
  uint64_t fresh_generation = 0;
  // Retire pending continuations while every captured local is still alive,
  // including an early ASSERT return before the explicit retirement below.
  base::ScopedClosureRunner retire_pending(base::BindLambdaForTesting([&] {
    NativePersonReadHostTestPeer::Retire(host, generation);
    if (fresh_generation)
      NativePersonReadHostTestPeer::Retire(host, fresh_generation);
  }));
  NativePersonReadHostTestPeer::Call(host, generation, "native.personRead",
      base::DictValue().Set("pageId", id).Set("request", Observe()),
      base::BindLambdaForTesting([&](base::DictValue result) {
        original.SetValue(std::move(result));
        fresh_generation = NativePersonReadHostTestPeer::PublishNext(host);
        NativePersonReadHostTestPeer::Call(host, fresh_generation, "native.personRead",
            base::DictValue().Set("pageId", id).Set("request", Observe()), replacement.GetCallback());
      }));
  ASSERT_FALSE(original.IsReady());
  NativePersonReadHostTestPeer::Retire(host, generation);
  EXPECT_NE(original.Take().FindDict("error"), nullptr);
  ASSERT_GT(fresh_generation, generation);
  EXPECT_EQ(NativePersonReadHostTestPeer::Pending(host), 1u);
  NativePersonReadHostTestPeer::Retire(host, generation);
  auto fresh = replacement.Take();
  ASSERT_NE(fresh.FindDict("result"), nullptr);
  EXPECT_NE(fresh.FindDict("result")->FindString("sessionId"), nullptr);
  EXPECT_EQ(NativePersonReadHostTestPeer::Pending(host), 0u);
}
}  // namespace aux

namespace aux {
namespace {
class NativeConnectionTeardownProfile : public TestingProfile {
 public:
  NativeConnectionTeardownProfile();
  ~NativeConnectionTeardownProfile() override;
  void ClearOriginalUserData() { ClearAllUserData(); }
  size_t OriginalUserDataCount() const { return UserDataCount(); }

 private:
  const profile_metrics::BrowserProfileType original_profile_type_;
};
NativeConnectionTeardownProfile::NativeConnectionTeardownProfile()
    : original_profile_type_(profile_metrics::GetBrowserProfileType(this)) {}
NativeConnectionTeardownProfile::~NativeConnectionTeardownProfile() {
  // The tests observe genuinely empty user data after retirement. Restore only
  // original lifecycle metadata required by TestingProfile service shutdown.
  profile_metrics::SetBrowserProfileType(this, original_profile_type_);
}
}  // namespace

IN_PROC_BROWSER_TEST_F(NativePersonObserverControllerBrowserTest,
                       ProfileUserDataClearRetiresOriginalPublishedConnection) {
  NativeConnectionTeardownProfile profile;
  auto* host = NativePersonReadHostTestPeer::Install(&profile);
  const auto original_host = NativePersonReadHostTestPeer::Weak(host);
  const auto original_egress = EgressController::ForProfile(&profile)->GetWeakPtr();
  ASSERT_NE(NativePersonReadHostTestPeer::PublishNext(host), 0u);
  ASSERT_TRUE(original_egress);
  profile.ClearOriginalUserData();
  EXPECT_FALSE(original_host);
  EXPECT_FALSE(original_egress);
  EXPECT_EQ(profile.OriginalUserDataCount(), 0u);
}

IN_PROC_BROWSER_TEST_F(NativePersonObserverControllerBrowserTest,
                       HostFirstDestructionRetiresExistingControllerAuthority) {
  NativeConnectionTeardownProfile profile;
  auto* host = NativePersonReadHostTestPeer::Install(&profile);
  const auto original_host = NativePersonReadHostTestPeer::Weak(host);
  const auto original_egress = EgressController::ForProfile(&profile)->GetWeakPtr();
  const auto incarnation = NativePersonReadHostTestPeer::Incarnation(host);
  const auto generation = NativePersonReadHostTestPeer::PublishNext(host);
  ASSERT_TRUE(original_egress);
  EXPECT_FALSE(original_egress->AdmitRuntimeConnection(generation + 1, incarnation));
  NativePersonReadHostTestPeer::Remove(&profile);
  EXPECT_FALSE(original_host);
  ASSERT_TRUE(original_egress);
  EXPECT_TRUE(original_egress->AdmitRuntimeConnection(generation + 1, incarnation));
  original_egress->Disconnect();
  profile.ClearOriginalUserData();
  EXPECT_FALSE(original_egress);
  EXPECT_EQ(profile.OriginalUserDataCount(), 0u);
}

IN_PROC_BROWSER_TEST_F(NativePersonObserverControllerBrowserTest,
                       UnpublishedHostUserDataClearDoesNotCreateAuthority) {
  NativeConnectionTeardownProfile profile;
  auto* host = NativePersonReadHostTestPeer::Install(&profile);
  const auto original_host = NativePersonReadHostTestPeer::Weak(host);
  const auto original_egress = EgressController::ForProfile(&profile)->GetWeakPtr();
  profile.ClearOriginalUserData();
  EXPECT_FALSE(original_host);
  EXPECT_FALSE(original_egress);
  EXPECT_EQ(profile.OriginalUserDataCount(), 0u);
}
}  // namespace aux
