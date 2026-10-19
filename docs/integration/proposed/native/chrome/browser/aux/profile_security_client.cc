// Copyright 2026 Aux Authors. All rights reserved.
#include "chrome/browser/aux/profile_security_client.h"
#include "base/functional/bind.h"
#include "base/json/json_reader.h"
#include "base/json/json_writer.h"
#include "base/memory/ref_counted.h"
#include "base/strings/string_number_conversions.h"
#include "base/task/thread_pool.h"
#include "base/time/time.h"
#include "base/values.h"
#include "url/gurl.h"
#include "net/base/escape.h"
#include "net/http/http_status_code.h"
#include "net/http/http_response_headers.h"
#include "net/traffic_annotation/network_traffic_annotation.h"
#include "services/network/public/cpp/resource_request.h"
#include "services/network/public/cpp/simple_url_loader.h"
#include "services/network/public/mojom/url_response_head.mojom.h"
namespace aux {
namespace {
constexpr auto kAnnotation = net::DefineNetworkTrafficAnnotation(
    "aux_supplied_vault_status",
    R"(semantics {sender:"Aux native browser" description:"Verify the supplied daemon's actual account Vault lock state for the registered browser profile." trigger:"Native profile gate or private API authorization." data:"Numeric local account identifier and ephemeral installation authorization. No Vault secret values." destination:LOCAL} policy {cookies_allowed:NO setting:"Required profile security check." policy_exception_justification:"Authenticated browser-owned loopback daemon only."})");
class StatusRequest : public base::RefCounted<StatusRequest> {
 public:
  StatusRequest(base::FilePath home, base::FilePath path,
                scoped_refptr<network::SharedURLLoaderFactory> factory,
                uint16_t port, std::string authorization,
                base::OnceCallback<void(ProfileSecurityState)> done)
      : home_(std::move(home)), path_(std::move(path)),
        factory_(std::move(factory)), port_(port),
        authorization_(std::move(authorization)), done_(std::move(done)) {}
  void Start() {
    base::ThreadPool::PostTaskAndReplyWithResult(
        FROM_HERE, {base::MayBlock()},
        base::BindOnce(&ReadProfileSecurity, home_, path_),
        base::BindOnce(&StatusRequest::DidRead, base::WrapRefCounted(this)));
  }
 private:
  friend class base::RefCounted<StatusRequest>;
  ~StatusRequest() = default;
  void DidRead(ProfileSecurityState state) {
    state_ = std::move(state);
    if (!state_.bound || !state_.account_id || !factory_ || !port_ ||
        !authorization_.starts_with("AuxDaemonSessionToken ")) {
      Finish(std::move(state_));
      return;
    }
    base::DictValue input;
    input.Set("accountId", *state_.account_id);
    // Omission of profileId intentionally selects supplied app-account:N scope.
    const auto encoded = net::EscapeQueryParamValue(
        base::WriteJson(input).value_or("{}"), true);
    auto request = std::make_unique<network::ResourceRequest>();
    request->url = GURL("http://127.0.0.1:" + base::NumberToString(port_) +
        "/trpc/passwordManager.auth.status?input=" + encoded);
    request->credentials_mode = network::mojom::CredentialsMode::kOmit;
    request->redirect_mode = network::mojom::RedirectMode::kError;
    request->headers.SetHeader("Authorization", authorization_);
    loader_ = network::SimpleURLLoader::Create(std::move(request), kAnnotation);
    loader_->SetTimeoutDuration(base::Seconds(2));
    loader_->DownloadToString(
        factory_.get(),
        base::BindOnce(&StatusRequest::DidFetch, base::WrapRefCounted(this)),
        65536);
  }
  void DidFetch(std::optional<std::string> body) {
    const bool ok = loader_->ResponseInfo() &&
        loader_->ResponseInfo()->headers &&
        loader_->ResponseInfo()->headers->response_code() == net::HTTP_OK;
    loader_.reset();
    auto reply = body && ok ? base::JSONReader::ReadDict(
        *body, base::JSON_PARSE_RFC) : std::nullopt;
    const auto* result = reply ? reply->FindDict("result") : nullptr;
    const auto* data = result ? result->FindDict("data") : nullptr;
    const auto initialized = data ? data->FindBool("isInitialized") : std::nullopt;
    const auto locked = data ? data->FindBool("isLocked") : std::nullopt;
    const auto verification = data ? data->FindBool("requiresPasswordVerification") : std::nullopt;
    if (!initialized || !locked || !verification) {
      state_.error = "Authenticated Vault status is unavailable";
      Finish(std::move(state_));
      return;
    }
    state_.configured = *initialized;
    state_.locked = !*initialized || *locked || *verification;
    state_.error.clear();
    // Rebinding/account deletion while status was in flight invalidates it.
    base::ThreadPool::PostTaskAndReplyWithResult(
        FROM_HERE, {base::MayBlock()},
        base::BindOnce(&ReadProfileSecurity, home_, path_),
        base::BindOnce(&StatusRequest::DidRevalidate, base::WrapRefCounted(this)));
  }
  void DidRevalidate(ProfileSecurityState current) {
    if (!current.bound || current.account_id != state_.account_id ||
        current.onboarding_complete != state_.onboarding_complete ||
        current.local_anonymous != state_.local_anonymous ||
        current.bound_user_id != state_.bound_user_id) {
      current.error = "Profile account changed during Vault verification";
      Finish(std::move(current));
      return;
    }
    Finish(std::move(state_));
  }
  void Finish(ProfileSecurityState state) {
    if (done_) std::move(done_).Run(std::move(state));
  }
  const base::FilePath home_, path_;
  const scoped_refptr<network::SharedURLLoaderFactory> factory_;
  const uint16_t port_;
  const std::string authorization_;
  base::OnceCallback<void(ProfileSecurityState)> done_;
  ProfileSecurityState state_;
  std::unique_ptr<network::SimpleURLLoader> loader_;
};
}  // namespace
void FetchProfileSecurity(
    const base::FilePath& home, const base::FilePath& profile_path,
    scoped_refptr<network::SharedURLLoaderFactory> factory, uint16_t port,
    std::string authorization,
    base::OnceCallback<void(ProfileSecurityState)> done) {
  base::MakeRefCounted<StatusRequest>(home, profile_path, std::move(factory),
      port, std::move(authorization), std::move(done))->Start();
}
}  // namespace aux
