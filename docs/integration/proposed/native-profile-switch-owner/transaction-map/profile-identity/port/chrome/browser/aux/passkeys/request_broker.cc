// Copyright 2026 Aux Authors. All rights reserved.
// Original browser boundary adapter; upstream WebAuthn3 and Chromium155 APIs.
#include "chrome/browser/aux/passkeys/request_broker.h"

#include <algorithm>
#include <map>
#include <memory>
#include <variant>

#include "base/base64.h"
#include "base/base64url.h"
#include "base/containers/span.h"
#include "base/functional/bind.h"
#include "base/json/json_writer.h"
#include "base/memory/raw_ptr.h"
#include "base/no_destructor.h"
#include "base/scoped_observation.h"
#include "base/strings/string_number_conversions.h"
#include "base/strings/utf_string_conversions.h"
#include "base/task/single_thread_task_runner.h"
#include "base/task/thread_pool.h"
#include "base/time/time.h"
#include "base/uuid.h"
#include "chrome/browser/aux/component_bootstrap.h"
#include "chrome/browser/aux/installation_auth.h"
#include "chrome/browser/aux/passkeys/private_session_cleanup.h"
#include "chrome/browser/aux/profile_state.h"
#include "chrome/browser/aux/profile_identity.h"
#include "chrome/browser/buildflags.h"
#include "chrome/browser/profiles/profile.h"
#include "chrome/browser/profiles/profile_observer.h"
#include "chrome/browser/ui/navigator/browser_navigator.h"
#include "chrome/browser/ui/navigator/browser_navigator_params.h"
#include "chrome/browser/ui/tab_modal_confirm_dialog.h"
#include "components/webauthn/core/browser/client_data_json.h"
#include "components/webauthn/json/value_conversions.h"
#include "content/public/browser/render_frame_host.h"
#include "content/public/browser/weak_document_ptr.h"
#include "content/public/browser/web_contents.h"
#include "content/public/browser/web_contents_delegate.h"
#include "crypto/sha2.h"
#include "crypto/sign.h"

namespace aux::passkeys {
namespace {
constexpr char kDomain[] = "Aux Passkey Request v1\n";
struct Pending {
  content::WeakDocumentPtr document;
  raw_ptr<Profile> profile;
  url::Origin origin;
  url::Origin top_origin;
  base::Time deadline;
  base::DictValue request;
  std::variant<CreateCallback, GetCallback> callback;
  std::optional<int> account;
};
using Requests = std::map<std::string, std::unique_ptr<Pending>>;
Requests& requests() {
  static base::NoDestructor<Requests> value;
  return *value;
}
class ProfileSession;
using Sessions = std::map<Profile*, std::unique_ptr<ProfileSession>>;
Sessions& sessions() {
  static base::NoDestructor<Sessions> value;
  return *value;
}
class ProfileSession : public ProfileObserver {
 public:
  explicit ProfileSession(Profile* profile)
      : profile_id(GetProfileId(profile)),
        incognito(profile->IsOffTheRecord()) {
    observation_.Observe(profile);
  }
  const std::string id = base::Uuid::GenerateRandomV4().AsLowercaseString();
  const std::string profile_id;
  const bool incognito;
  std::optional<int> account;

 private:
  void OnProfileWillBeDestroyed(Profile* profile) override {
    if (incognito && account) {
      RetirePrivateSession(*account, profile_id, id);
    }
    std::vector<std::string> ids;
    for (const auto& [request_id, pending] : requests()) {
      if (pending->profile == profile) {
        ids.push_back(request_id);
      }
    }
    for (const auto& request_id : ids) {
      Abandon(request_id);
    }
    observation_.Reset();
    sessions().erase(profile);
  }
  base::ScopedObservation<Profile, ProfileObserver> observation_{this};
};
std::string ProfileSessionId(Profile* profile) {
  auto& session = sessions()[profile];
  if (!session) {
    session = std::make_unique<ProfileSession>(profile);
  }
  return session->id;
}
Pending* Find(Profile* profile, const std::string& id) {
  auto it = requests().find(id);
  if (it == requests().end()) {
    return nullptr;
  }
  auto* pending = it->second.get();
  auto* frame = pending->document.AsRenderFrameHostIfValid();
  const auto* profile_id = pending->request.FindString("profileId");
  if (!profile_id || *profile_id != GetProfileId(profile) ||
      !frame || !frame->IsActive() || pending->profile != profile ||
      frame->GetBrowserContext() != profile ||
      frame->GetLastCommittedOrigin() != pending->origin ||
      frame->GetMainFrame()->GetLastCommittedOrigin() != pending->top_origin ||
      base::Time::Now() >= pending->deadline) {
    Cancel(id);
    return nullptr;
  }
  return pending;
}
bool MatchesRequest(const Pending& pending,
                    const blink::mojom::CommonCredentialInfo& info) {
  std::string expected;
  if (!base::Base64UrlDecode(*pending.request.FindString("clientDataJSON"),
                             base::Base64UrlDecodePolicy::DISALLOW_PADDING,
                             &expected) ||
      !std::ranges::equal(info.client_data_json,
                          base::as_byte_span(expected)) ||
      info.authenticator_data.size() < 37 || info.raw_id.empty() ||
      info.raw_id.size() > 1024) {
    return false;
  }
  const auto rp_hash = crypto::SHA256Hash(
      base::as_byte_span(*pending.request.FindString("rpId")));
  const bool create = *pending.request.FindString("kind") == "create";
  if (!std::equal(rp_hash.begin(), rp_hash.end(),
                  info.authenticator_data.begin()) ||
      info.authenticator_data[32] != (create ? 0x45 : 0x05)) {
    return false;
  }
  std::string encoded;
  base::Base64UrlEncode(info.raw_id, base::Base64UrlEncodePolicy::OMIT_PADDING,
                        &encoded);
  if (encoded != info.id) {
    return false;
  }
  const auto* options = pending.request.FindDict("options");
  const auto* descriptors =
      options->FindList(create ? "excludeCredentials" : "allowCredentials");
  const bool listed =
      descriptors &&
      std::ranges::any_of(*descriptors, [&](const base::Value& descriptor) {
        return descriptor.is_dict() && descriptor.GetDict().FindString("id") &&
               *descriptor.GetDict().FindString("id") == encoded;
      });
  return create ? !listed : !descriptors || descriptors->empty() || listed;
}
void ActivateRequester(Pending& pending) {
  auto* frame = pending.document.AsRenderFrameHostIfValid();
  auto* contents =
      frame ? content::WebContents::FromRenderFrameHost(frame) : nullptr;
  if (contents && contents->GetDelegate()) {
    contents->GetDelegate()->ActivateContents(contents);
  }
}
struct Proof {
  ProfileSecurityState security;
  std::optional<std::string> signature;
};
Proof SignRequest(base::FilePath path, std::string profile_id,
                  std::string payload) {
  Proof result;
  result.security = ReadProfileSecurity(StateHome(), path, profile_id);
  if (!result.security.allows_browsing()) {
    return result;
  }
  auto key = LoadInstallationPrivateKey(StateHome());
  if (!key) {
    return result;
  }
  result.signature = base::Base64Encode(
      crypto::sign::Sign(crypto::sign::ECDSA_SHA256, *key,
                         base::as_byte_span(std::string(kDomain) + payload)));
  return result;
}
class ProviderDialog final : public TabModalConfirmDialogDelegate {
 public:
  ProviderDialog(content::WebContents* contents,
                 std::u16string origin,
                 base::OnceCallback<void(bool)> callback)
      : TabModalConfirmDialogDelegate(contents),
        origin_(std::move(origin)),
        callback_(std::move(callback)) {}
  std::u16string GetTitle() override { return u"Choose a passkey provider"; }
  std::u16string GetDialogMessage() override {
    return u"Passkey request from " + origin_ +
           u". Use Aux Vault, or continue with other browser providers.";
  }
  std::u16string GetAcceptButtonTitle() override { return u"Aux Vault"; }
  std::u16string GetCancelButtonTitle() override { return u"Other providers"; }
  base::OnceClosure Cancellation() {
    return base::BindOnce(
        [](base::WeakPtr<ProviderDialog> self) {
          if (self) {
            self->Close();
          }
        },
        weak_factory_.GetWeakPtr());
  }

 private:
  void OnAccepted() override { std::move(callback_).Run(true); }
  void OnCanceled() override { std::move(callback_).Run(false); }
  void OnClosed() override { std::move(callback_).Run(false); }
  const std::u16string origin_;
  base::OnceCallback<void(bool)> callback_;
  base::WeakPtrFactory<ProviderDialog> weak_factory_{this};
};
std::string Begin(content::RenderFrameHost* frame,
                  const url::Origin& caller,
                  std::string rp_id,
                  std::vector<uint8_t> challenge,
                  base::Value options,
                  bool create,
                  std::variant<CreateCallback, GetCallback> callback) {
  CHECK(frame);
  CHECK(!caller.opaque());
  CHECK_EQ(caller, frame->GetLastCommittedOrigin());
  const auto id = base::Uuid::GenerateRandomV4().AsLowercaseString();
  auto top = frame->GetMainFrame()->GetLastCommittedOrigin();
  auto* profile = Profile::FromBrowserContext(frame->GetBrowserContext());
  const auto deadline = base::Time::Now() + base::Minutes(2);
  std::string client_data = webauthn::BuildClientDataJson(
      webauthn::ClientDataJsonParams(
          create ? webauthn::ClientDataRequestType::kWebAuthnCreate
                 : webauthn::ClientDataRequestType::kWebAuthnGet,
          caller, top, challenge, caller != top),
      std::nullopt);
  std::string encoded;
  base::Base64UrlEncode(client_data, base::Base64UrlEncodePolicy::OMIT_PADDING,
                        &encoded);
  base::DictValue request;
  request.Set("version", 1);
  request.Set("id", id);
  request.Set("kind", create ? "create" : "get");
  request.Set("profileId",
              GetProfileId(profile));
  request.Set("profileSession", ProfileSessionId(profile));
  request.Set("browserMode",
              profile->IsOffTheRecord() ? "incognito" : "default");
  request.Set("origin", caller.Serialize());
  request.Set("frameId",
              base::NumberToString(frame->GetGlobalId().child_id.value()) +
                  ":" +
                  base::NumberToString(frame->GetGlobalId().frame_routing_id));
  request.Set("topOrigin", top.Serialize());
  request.Set("rpId", rp_id);
  request.Set("clientDataJSON", encoded);
  request.Set("options", std::move(options));
  request.Set("expiresAt", deadline.InMillisecondsFSinceUnixEpoch());
  requests().emplace(
      id, std::make_unique<Pending>(Pending{
              frame->GetWeakDocumentPtr(), profile, caller, top, deadline,
              std::move(request), std::move(callback), std::nullopt}));
  NavigateParams navigation(
      profile,
      GURL(std::string("chrome-extension://") + kVaultExtensionId +
           "/index.html#/passkeys/" + id),
      ui::PAGE_TRANSITION_AUTO_TOPLEVEL);
  navigation.disposition = WindowOpenDisposition::NEW_POPUP;
  Navigate(&navigation);
  base::SingleThreadTaskRunner::GetCurrentDefault()->PostDelayedTask(
      FROM_HERE, base::BindOnce(&Cancel, id), base::Minutes(2));
  return id;
}
}  // namespace
base::OnceClosure ChooseProvider(content::RenderFrameHost* frame,
                                 base::OnceCallback<void(bool)> callback) {
#if !BUILDFLAG(ENABLE_AUX_BROWSER)
  std::move(callback).Run(false);
  return {};
#else
  auto* contents = content::WebContents::FromRenderFrameHost(frame);
  auto dialog = std::make_unique<ProviderDialog>(
      contents, base::UTF8ToUTF16(frame->GetLastCommittedOrigin().Serialize()),
      std::move(callback));
  auto cancellation = dialog->Cancellation();
  TabModalConfirmDialog::Create(std::move(dialog), contents);
  return cancellation;
#endif
}
std::string BeginCreate(
    content::RenderFrameHost* frame,
    const url::Origin& caller,
    const blink::mojom::PublicKeyCredentialCreationOptionsPtr& options,
    CreateCallback callback) {
  return Begin(frame, caller, options->relying_party.id, options->challenge,
               webauthn::ToValue(options), true, std::move(callback));
}
std::string BeginGet(
    content::RenderFrameHost* frame,
    const url::Origin& caller,
    const blink::mojom::PublicKeyCredentialRequestOptionsPtr& options,
    GetCallback callback) {
  return Begin(frame, caller, options->relying_party_id, options->challenge,
               webauthn::ToValue(options), false, std::move(callback));
}
void Cancel(const std::string& id) {
  auto it = requests().find(id);
  if (it == requests().end()) {
    return;
  }
  auto pending = std::move(it->second);
  requests().erase(it);
  auto error = blink::mojom::WebAuthnDOMExceptionDetails::New(
      "NotAllowedError", "Aux Vault request ended or was canceled.");
  if (auto* create = std::get_if<CreateCallback>(&pending->callback)) {
    std::move(*create).Run(0, std::move(error), nullptr);
  } else {
    std::move(std::get<GetCallback>(pending->callback))
        .Run(0, std::move(error), nullptr);
  }
}
void Abandon(const std::string& id) {
  requests().erase(id);
}
void ReadRequest(
    Profile* profile,
    const std::string& id,
    base::OnceCallback<void(std::optional<base::DictValue>)> callback) {
  auto* pending = Find(profile, id);
  if (!pending) {
    std::move(callback).Run(std::nullopt);
    return;
  }
  auto request = pending->request.Clone();
  // Account identity comes from the native disk gate, never extension input.
  base::ThreadPool::PostTaskAndReplyWithResult(
      FROM_HERE, {base::MayBlock()},
      base::BindOnce(&ReadProfileSecurity, StateHome(),
                     profile->GetOriginalProfile()->GetPath(), GetProfileId(profile)),
      base::BindOnce(
          [](Profile* profile, std::string id, base::DictValue request,
             base::OnceCallback<void(std::optional<base::DictValue>)> callback,
             ProfileSecurityState security) {
            if (!security.allows_browsing() || !Find(profile, id)) {
              std::move(callback).Run(std::nullopt);
              return;
            }
            auto* pending = Find(profile, id);
            if (pending->account && pending->account != security.account_id) {
              Cancel(id);
              std::move(callback).Run(std::nullopt);
              return;
            }
            pending->account = security.account_id;
            auto& session = *sessions().at(profile);
            if (session.incognito && session.account &&
                session.account != security.account_id) {
              RetirePrivateSession(*session.account, session.profile_id,
                                   session.id);
            }
            session.account = security.account_id;
            request.Set("accountId", *security.account_id);
            auto payload = base::WriteJson(request).value();
            base::ThreadPool::PostTaskAndReplyWithResult(
                FROM_HERE, {base::MayBlock()},
                base::BindOnce(&SignRequest,
                               profile->GetOriginalProfile()->GetPath(),
                               GetProfileId(profile), payload),
                base::BindOnce(
                    [](Profile* profile, std::string id, std::string payload,
                       int account,
                       base::OnceCallback<void(std::optional<base::DictValue>)>
                           callback,
                       Proof proof) {
                      if (!Find(profile, id) || !proof.signature ||
                          proof.security.account_id != account) {
                        std::move(callback).Run(std::nullopt);
                        return;
                      }
                      base::DictValue result;
                      result.Set("payload", payload);
                      result.Set("signature", *proof.signature);
                      std::move(callback).Run(std::move(result));
                    },
                    profile, id, payload, *security.account_id,
                    std::move(callback)));
          },
          profile, id, std::move(request), std::move(callback)));
}
void Complete(Profile* profile,
              const std::string& id,
              base::Value response,
              base::OnceCallback<void(std::optional<std::string>)> callback) {
  if (!Find(profile, id)) {
    std::move(callback).Run("Request is no longer active.");
    return;
  }
  base::ThreadPool::PostTaskAndReplyWithResult(
      FROM_HERE, {base::MayBlock()},
      base::BindOnce(&ReadProfileSecurity, StateHome(),
                     profile->GetOriginalProfile()->GetPath(), GetProfileId(profile)),
      base::BindOnce(
          [](Profile* profile, std::string id, base::Value response,
             base::OnceCallback<void(std::optional<std::string>)> callback,
             ProfileSecurityState security) {
            auto* pending = Find(profile, id);
            if (!pending || !security.allows_browsing() || !pending->account ||
                pending->account != security.account_id) {
              Cancel(id);
              std::move(callback).Run(
                  "Request was canceled or Vault is locked.");
              return;
            }
            if (std::holds_alternative<CreateCallback>(pending->callback)) {
              auto [parsed, error] =
                  webauthn::MakeCredentialResponseFromValue(response);
              if (!parsed) {
                std::move(callback).Run(error);
                return;
              }
              if (!MatchesRequest(*pending, *parsed->info)) {
                std::move(callback).Run(
                    "Passkey result does not match the active browser "
                    "request.");
                return;
              }
              ActivateRequester(*pending);
              if (!Find(profile, id)) {
                std::move(callback).Run(
                    "Request ended while returning to the page.");
                return;
              }
              auto holder = std::move(requests().at(id));
              requests().erase(id);
              std::move(std::get<CreateCallback>(holder->callback))
                  .Run(0, nullptr, std::move(parsed));
            } else {
              auto [parsed, error] =
                  webauthn::GetAssertionResponseFromValue(response);
              if (!parsed) {
                std::move(callback).Run(error);
                return;
              }
              if (!MatchesRequest(*pending, *parsed->info)) {
                std::move(callback).Run(
                    "Passkey result does not match the active browser "
                    "request.");
                return;
              }
              ActivateRequester(*pending);
              if (!Find(profile, id)) {
                std::move(callback).Run(
                    "Request ended while returning to the page.");
                return;
              }
              auto holder = std::move(requests().at(id));
              requests().erase(id);
              std::move(std::get<GetCallback>(holder->callback))
                  .Run(0, nullptr, std::move(parsed));
            }
            std::move(callback).Run(std::nullopt);
          },
          profile, id, std::move(response), std::move(callback)));
}
bool Reject(Profile* profile, const std::string& id) {
  if (!Find(profile, id)) {
    return false;
  }
  Cancel(id);
  return true;
}
}  // namespace aux::passkeys
