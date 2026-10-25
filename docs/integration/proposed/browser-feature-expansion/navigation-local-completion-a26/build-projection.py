from pathlib import Path
import hashlib,json,difflib
native=Path('/private/tmp/aux-chromium-recovery-snapshot-20261023/src')
r=Path(__file__).parent
rules={}
sidebar='chrome/browser/ui/views/frame/aux_sidebar_view.cc'
rules[sidebar]=[]
old='''// Native profile menu and browser navigation.
// The primary menu uses the same real ordered/non-omitted registry roster as'''
new='''#if defined(AUX_BROWSER_ONLY_NATIVE_STARTUP)
// The client owns both objects. Destroy the Widget before its non-View delegate
// and defer deletion out of native widget/activation observer iterations.
struct OwnedPrimaryProfileMenu {
  std::unique_ptr<views::BubbleDialogDelegate> delegate;
  std::unique_ptr<views::Widget> widget;
  ~OwnedPrimaryProfileMenu() {
    widget.reset();
    delegate.reset();
  }
};
using OwnedPrimaryProfileMenus =
    std::map<BrowserWindowInterface*, std::unique_ptr<OwnedPrimaryProfileMenu>>;
OwnedPrimaryProfileMenus& PrimaryProfileMenuOwners() {
  static base::NoDestructor<OwnedPrimaryProfileMenus> owners;
  return *owners;
}
void CloseOwnedPrimaryProfileMenu(BrowserWindowInterface* browser,
                                  views::Widget* expected,
                                  views::Widget::ClosedReason) {
  auto& owners = PrimaryProfileMenuOwners();
  const auto found = owners.find(browser);
  if (found == owners.end() || found->second->widget.get() != expected) return;
  auto owner = std::move(found->second);
  owners.erase(found);
  base::SingleThreadTaskRunner::GetCurrentDefault()->DeleteSoon(
      FROM_HERE, std::move(owner));
}
views::Widget* CreateOwnedPrimaryProfileMenu(
    BrowserWindowInterface* browser,
    std::unique_ptr<views::BubbleDialogDelegate> delegate) {
  auto& owners = PrimaryProfileMenuOwners();
  // Retiring/replacing an earlier menu must not synchronously delete a Widget
  // whose native close callback or observer notification is still on-stack.
  if (const auto old = owners.find(browser); old != owners.end()) {
    auto retired = std::move(old->second);
    owners.erase(old);
    base::SingleThreadTaskRunner::GetCurrentDefault()->DeleteSoon(
        FROM_HERE, std::move(retired));
  }
  auto owner = std::make_unique<OwnedPrimaryProfileMenu>();
  owner->delegate = std::move(delegate);
  owner->widget = views::BubbleDialogDelegate::CreateBubble(owner->delegate.get());
  auto* widget = owner->widget.get();
  widget->MakeCloseSynchronous(base::BindOnce(
      &CloseOwnedPrimaryProfileMenu, browser, widget));
  owners.emplace(browser, std::move(owner));
  return widget;
}
#endif

// Native profile menu and browser navigation.
// The primary menu uses the same real ordered/non-omitted registry roster as'''
rules[sidebar].append((old,new))
old='''    auto menu = std::make_unique<AuxProfileMenu>(browser, anchor);
    auto* widget = views::BubbleDialogDelegate::CreateBubbleDeprecated(
        std::move(menu), views::Widget::InitParams::NATIVE_WIDGET_OWNS_WIDGET);
    TrackAuxProfileMenu(browser, widget);'''
new='''    auto menu = std::make_unique<AuxProfileMenu>(browser, anchor);
#if defined(AUX_BROWSER_ONLY_NATIVE_STARTUP)
    auto* widget = CreateOwnedPrimaryProfileMenu(browser, std::move(menu));
#else
    auto* widget = views::BubbleDialogDelegate::CreateBubbleDeprecated(
        std::move(menu), views::Widget::InitParams::NATIVE_WIDGET_OWNS_WIDGET);
#endif
    TrackAuxProfileMenu(browser, widget);'''
rules[sidebar].append((old,new))
nav='chrome/browser/ui/views/frame/aux_chat_navigation.cc'
rules[nav]=[('#include "base/time/time.h"','#include "base/time/time.h"\n#include "base/timer/timer.h"'),('#include "chrome/browser/ui/simple_message_box.h"','#include "chrome/browser/ui/simple_message_box.h"\n#include "chrome/browser/lifetime/browser_shutdown.h"\n#include "chrome/browser/ui/unload_controller.h"')]
s=(native/nav).read_text();start=s.index('class AccountRouteRequest :');end=s.index('\n}  // namespace',start);old=s[start:end]
new='''class AccountRouteRequest : public base::RefCounted<AccountRouteRequest> {
 public:
  AccountRouteRequest(BrowserWindowInterface& browser, std::string suffix)
      : browser_(browser.GetWeakPtr()),
        profile_(browser.GetProfile()->GetWeakPtr()),
        profile_id_(GetProfileId(browser.GetProfile())),
        profile_epoch_(GetProfileCookieBindingEpoch(browser.GetProfile())),
        suffix_(std::move(suffix)) {}
  void Start() {
    if (!Current()) return;
    BeginAuthorization(false);
  }
 private:
  friend class base::RefCounted<AccountRouteRequest>;
  ~AccountRouteRequest() = default;
  bool Current() const {
    const auto* unload = browser_ ? UnloadController::From(browser_.get()) : nullptr;
    return !finished_ && browser_ && profile_ && browser_->GetWindow() && unload &&
        !unload->is_attempting_to_close_browser() && !unload->is_delete_scheduled() &&
        !browser_shutdown::HasShutdownStarted() && !browser_shutdown::IsTryingToQuit() &&
        browser_->GetProfile() == profile_.get() && profile_->IsRegularProfile() &&
        !profile_->IsOffTheRecord() && !profile_id_.empty() && !profile_epoch_.empty() &&
        GetProfileId(profile_.get()) == profile_id_ &&
        GetProfileCookieBindingEpoch(profile_.get()) == profile_epoch_ &&
        !IsProfileCookieRestorePending(profile_.get());
  }
  void BeginAuthorization(bool force) {
    if (!Current()) { Finish(); return; }
    if (!authorization_timeout_.IsRunning()) {
      // This bounded wait observes real supervisor authorization; elapsed time
      // never creates a token or declares the local service ready.
      authorization_timeout_.Start(FROM_HERE, base::Seconds(10), base::BindOnce(
          &AccountRouteRequest::Fail, base::WrapRefCounted(this)));
    }
    if (!authorization_subscription_) {
      // The timeout or in-flight native callback retains this request while
      // this non-inline UI-sequence observer is registered.
      authorization_subscription_ = BrowserPlatform::Get().ObserveDaemonAuthorization(
          base::BindRepeating(&AccountRouteRequest::AuthorizationAvailable,
                              base::Unretained(this)));
    }
    RequestAuthorization(force);
  }
  void AuthorizationAvailable() {
    if (authorization_pending_) {
      authorization_event_pending_ = true;
      return;
    }
    RequestAuthorization(false);
  }
  void RequestAuthorization(bool force) {
    if (!Current()) { Finish(); return; }
    if (authorization_pending_) return;
    authorization_pending_ = true;
    BrowserPlatform::Get().RequestDaemonAuthorization(force, base::BindOnce(
        &AccountRouteRequest::Authorized, base::WrapRefCounted(this)));
  }
  void Authorized(std::optional<std::string> authorization) {
    authorization_pending_ = false;
    if (!Current()) { Finish(); return; }
    if (!authorization || !authorization->starts_with("AuxDaemonSessionToken ") ||
        authorization->size() <= sizeof("AuxDaemonSessionToken ") - 1) {
      // Cover authorization becoming available while an earlier unavailable
      // callback was already queued. Consume that actual event once.
      if (authorization_event_pending_) {
        authorization_event_pending_ = false;
        RequestAuthorization(false);
      }
      // Keep the original route only until an actual event or bounded failure.
      return;
    }
    authorization_ = std::move(*authorization);
    authorization_subscription_ = {};
    authorization_timeout_.Stop();
    Send();
  }
  void Send() {
    if (!Current()) { Finish(); return; }
    unsigned port = 21520;
    if (auto value = base::Environment::Create()->GetVar("AUX_PORT"); value &&
        (!base::StringToUint(*value, &port) || !port || port > 65535)) {
      Fail();
      return;
    }
    // Exact context used by the supplied getProfileContext / ensureProfileAccount
    // flow. The daemon validates/reuses/creates the real binding; no account ID,
    // onboarding completion or Vault unlock state is fabricated here.
    base::DictValue context;
    context.Set("profileId", profile_id_);
    context.Set("profilePath", profile_->GetPath().value());
    if (auto index = GetProfileIndex(profile_.get()))
      context.Set("profileIndex", *index);
    auto* prefs = profile_->GetPrefs();
    if (prefs->FindPreference("aux.account_user_id")) {
      const auto& user = prefs->GetString("aux.account_user_id");
      if (!user.empty()) context.Set("boundUserId", user);
    }
    if (prefs->FindPreference("aux.account_id")) {
      const int id = prefs->GetInteger("aux.account_id");
      if (id >= 0) context.Set("boundAccountId", id);
    }
    auto request = std::make_unique<network::ResourceRequest>();
    request->url = GURL("http://127.0.0.1:" + base::NumberToString(port) +
                       "/trpc/accounts.ensureProfileAccount");
    request->method = "POST";
    request->credentials_mode = network::mojom::CredentialsMode::kOmit;
    request->redirect_mode = network::mojom::RedirectMode::kError;
    request->headers.SetHeader("Authorization", authorization_);
    loader_ = network::SimpleURLLoader::Create(std::move(request),
                                               kAccountRouteAnnotation);
    loader_->AttachStringForUpload(base::WriteJson(context).value_or("{}"),
                                  "application/json");
    loader_->SetTimeoutDuration(base::Seconds(10));
    loader_->DownloadToString(
        profile_->GetDefaultStoragePartition()
            ->GetURLLoaderFactoryForBrowserProcess().get(),
        base::BindOnce(&AccountRouteRequest::Complete, base::WrapRefCounted(this)),
        65536);
  }
  void Complete(std::optional<std::string> body) {
    if (!Current()) { Finish(); return; }
    const int code = loader_->ResponseInfo() && loader_->ResponseInfo()->headers
        ? loader_->ResponseInfo()->headers->response_code() : 0;
    loader_.reset();
    if (code == net::HTTP_UNAUTHORIZED && !authorization_retried_) {
      authorization_retried_ = true;
      BeginAuthorization(true);
      return;
    }
    if (BrowserPlatform::Get().authorization() != authorization_) {
      Finish();
      return;
    }
    auto reply = code == net::HTTP_OK && body ? base::JSONReader::ReadDict(*body,
        base::JSON_PARSE_RFC) : std::nullopt;
    const auto* result = reply ? reply->FindDict("result") : nullptr;
    const auto* data = result ? result->FindDict("data") : nullptr;
    const auto id = data ? data->FindInt("id") : std::nullopt;
    if (!id || *id < 0) {
      Fail();
      return;
    }
    RememberResolvedChatAccount(*profile_, *id);
    Finish();
    NavigateAccountRoute(*browser_, *id, suffix_);
  }
  void Finish() {
    // An observer can be the caller while the timeout is the last owner.
    // Keep this object alive until all member teardown has completed.
    scoped_refptr<AccountRouteRequest> keep_alive(this);
    finished_ = true;
    authorization_subscription_ = {};
    authorization_timeout_.Stop();
    loader_.reset();
  }
  void Fail() {
    const bool report = Current();
    Finish();
    if (report) chrome::ShowWarningMessageBoxAsync(
        browser_->GetWindow()->GetNativeWindow(), u"Aux navigation unavailable",
        u"Aux could not resolve this profile with its local service. Please retry after the browser finishes starting.");
  }
  base::WeakPtr<BrowserWindowInterface> browser_;
  base::WeakPtr<Profile> profile_;
  const std::string profile_id_, profile_epoch_, suffix_;
  std::string authorization_;
  bool authorization_pending_ = false;
  bool authorization_event_pending_ = false;
  bool authorization_retried_ = false;
  bool finished_ = false;
  base::CallbackListSubscription authorization_subscription_;
  base::OneShotTimer authorization_timeout_;
  std::unique_ptr<network::SimpleURLLoader> loader_;
};'''
rules[nav].append((old,new))
manifest={'format':'aux.native.counted-projection.v1','purpose':'Native primary profile menu ownership and bounded authenticated Settings/chat route warm-up','nativeRoot':str(native),'files':[]}
patch=[]
for rel,edits in rules.items():
 before=(native/rel).read_text();after=before;anchors=[]
 for a,b in edits:
  assert after.count(a)==1,(rel,a[:50],after.count(a))
  after=after.replace(a,b,1);anchors.append({'before':a,'after':b,'expectedCount':1})
 o=r/'source'/rel;o.parent.mkdir(parents=True,exist_ok=True);o.write_text(after)
 sha=lambda s:hashlib.sha256(s.encode()).hexdigest()
 manifest['files'].append({'path':rel,'inputSha256':sha(before),'outputSha256':sha(after),'source':str(o),'anchors':anchors})
 patch.extend(difflib.unified_diff(before.splitlines(True),after.splitlines(True),fromfile='a/'+rel,tofile='b/'+rel,n=0))
(r/'source-plan.json').write_text(json.dumps(manifest,indent=2)+'\n')
(r/'navigation-local-completion-a26.patch').write_text(''.join(patch))
print(json.dumps([{k:f[k] for k in ['path','inputSha256','outputSha256']} for f in manifest['files']],indent=2))
