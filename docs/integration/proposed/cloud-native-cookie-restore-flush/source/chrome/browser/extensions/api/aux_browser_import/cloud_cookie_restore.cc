// Copyright 2026 Aux Authors. BSD-3-Clause; see //LICENSE.
// Cookie conversion follows Chromium155 NetworkHandler's
// MakeCookieFromProtocolValues; write completion follows the reused native
// Firefox CookieWrites barrier. This adds Aux binding/lifetime serialization.
#include "chrome/browser/extensions/api/aux_browser_import/cloud_cookie_restore.h"

#include <cmath>
#include <memory>
#include <set>
#include <utility>
#include <vector>
#include "base/functional/bind.h"
#include "base/json/json_writer.h"
#include "base/memory/ref_counted.h"
#include "base/memory/weak_ptr.h"
#include "base/strings/string_split.h"
#include "base/strings/string_util.h"
#include "base/time/time.h"
#include "base/timer/timer.h"
#include "chrome/browser/aux/profile_identity.h"
#include "chrome/browser/profiles/profile.h"
#include "chrome/browser/profiles/keep_alive/profile_keep_alive_types.h"
#include "chrome/browser/profiles/keep_alive/scoped_profile_keep_alive.h"
#include "components/prefs/pref_service.h"
#include "content/public/browser/browser_thread.h"
#include "content/public/browser/storage_partition.h"
#include "mojo/public/cpp/bindings/remote.h"
#include "net/base/ip_address.h"
#include "net/cookies/canonical_cookie.h"
#include "net/cookies/cookie_access_result.h"
#include "net/cookies/cookie_options.h"
#include "net/cookies/cookie_partition_key.h"
#include "net/cookies/cookie_util.h"
#include "net/cookies/unique_cookie_key.h"
#include "services/network/public/mojom/cookie_manager.mojom.h"
#include "services/network/public/mojom/network_context.mojom.h"
#include "url/gurl.h"
#include "url/origin.h"

namespace aux_import {
namespace {
constexpr char kReceipt[] = "aux.cloud_cookie_restore";
using Reply = base::OnceCallback<void(std::optional<base::Value>, std::string)>;

bool DomainExcluded(std::string host) {
  host = base::ToLowerASCII(host);
  if (!host.empty() && host.front() == '.') host.erase(0, 1);
  host = std::string(base::TrimString(host, ".", base::TRIM_TRAILING));
  net::IPAddress ip;
  if (ip.AssignFromIPLiteral(host) && ip.IsLoopback()) return true;
  if (host == "[::1]") return true;
  for (const char* root : {"localhost", "getaux.co", "clerk.com",
                           "clerk.accounts.dev", "youtube.com",
                           "googleusercontent.com"}) {
    if (host == root || base::EndsWith(host, std::string(".") + root))
      return true;
  }
  // Exact original google.[a-z]{2,}(.[a-z]{2})? suffix exclusion.
  auto parts = base::SplitString(host, ".", base::KEEP_WHITESPACE,
                                base::SPLIT_WANT_ALL);
  auto letters = [](const std::string& value) {
    return value.size() >= 2 &&
           base::ContainsOnlyChars(value, "abcdefghijklmnopqrstuvwxyz");
  };
  const size_t n = parts.size();
  return (n >= 2 && parts[n-2] == "google" && letters(parts[n-1])) ||
         (n >= 3 && parts[n-3] == "google" && letters(parts[n-2]) &&
          parts[n-1].size() == 2 && letters(parts[n-1]));
}

// Reuses the upstream sanitizing factory and source-scheme/port/partition
// conversion. Never FromStorage: these are untrusted newly ingested cookies.
std::unique_ptr<net::CanonicalCookie> ParseCookie(const base::DictValue& value) {
  const auto* name = value.FindString("name");
  const auto* contents = value.FindString("value");
  const auto* domain = value.FindString("domain");
  if (!name || !contents || !domain || domain->empty()) return nullptr;
  auto typed = [&value](const char* key, auto predicate) {
    const auto* field = value.Find(key);
    return !field || predicate(*field);
  };
  if (!typed("path", [](const base::Value& v) { return v.is_string(); }) ||
      !typed("secure", [](const base::Value& v) { return v.is_bool(); }) ||
      !typed("httpOnly", [](const base::Value& v) { return v.is_bool(); }) ||
      !typed("expires", [](const base::Value& v) { return v.is_int() || v.is_double(); }) ||
      !typed("sourcePort", [](const base::Value& v) { return v.is_int(); }))
    return nullptr;
  const bool secure = value.FindBool("secure").value_or(false);
  std::string host = *domain, normalized_domain = *domain;
  if (host.front() == '.') host.erase(0, 1);
  else normalized_domain.clear();
  GURL url(std::string(secure ? "https://" : "http://") + host);
  if (!url.is_valid() || !url.SchemeIsHTTPOrHTTPS() ||
      url.host() != base::ToLowerASCII(host) || url.has_port() ||
      url.has_username() || url.has_password() || url.has_query() ||
      url.has_ref() || url.path() != "/") return nullptr;
  base::Time expires;
  if (auto seconds = value.FindDouble("expires")) {
    if (!std::isfinite(*seconds)) return nullptr;
    if (*seconds > 0) expires = base::Time::FromSecondsSinceUnixEpoch(*seconds);
  }
  net::CookieSameSite same_site = net::CookieSameSite::UNSPECIFIED;
  if (const auto* field = value.Find("sameSite")) {
    if (!field->is_string()) return nullptr;
    const auto& text = field->GetString();
    if (text == "Lax") same_site = net::CookieSameSite::LAX_MODE;
    else if (text == "Strict") same_site = net::CookieSameSite::STRICT_MODE;
    else if (text == "None") same_site = net::CookieSameSite::NO_RESTRICTION;
    else return nullptr;
  }
  auto priority = net::COOKIE_PRIORITY_MEDIUM;
  if (const auto* field = value.Find("priority")) {
    if (!field->is_string()) return nullptr;
    const auto& text = field->GetString();
    if (text == "High") priority = net::COOKIE_PRIORITY_HIGH;
    else if (text == "Low") priority = net::COOKIE_PRIORITY_LOW;
    else if (text != "Medium") return nullptr;
  }
  std::optional<net::CookiePartitionKey> partition;
  if (const auto* field = value.Find("partitionKey")) {
    if (!field->is_dict() || field->GetDict().size() != 2) return nullptr;
    const auto* site = field->GetDict().FindString("topLevelSite");
    auto cross = field->GetDict().FindBool("hasCrossSiteAncestor");
    if (!site || !cross) return nullptr;
    const GURL top(*site);
    if (!top.SchemeIsHTTPOrHTTPS() || url::Origin::Create(top).Serialize() != *site)
      return nullptr;
    auto parsed = net::CookiePartitionKey::FromUntrustedInput(*site, *cross);
    if (!parsed.has_value()) return nullptr;
    partition = std::move(parsed.value());
  }
  auto cookie = net::CanonicalCookie::CreateSanitizedCookie(
      url, *name, *contents, normalized_domain,
      value.FindString("path") ? *value.FindString("path") : std::string(),
      base::Time(), expires, base::Time(), secure,
      value.FindBool("httpOnly").value_or(false), same_site, priority,
      std::move(partition), nullptr);
  if (!cookie) return nullptr;
  if (const auto* field = value.Find("sourceScheme")) {
    if (!field->is_string()) return nullptr;
    const auto& text = field->GetString();
    net::CookieSourceScheme scheme;
    if (text == "Secure") scheme = net::CookieSourceScheme::kSecure;
    else if (text == "NonSecure") scheme = net::CookieSourceScheme::kNonSecure;
    else if (text == "Unset") scheme = net::CookieSourceScheme::kUnset;
    else return nullptr;
    if (secure && scheme == net::CookieSourceScheme::kNonSecure) return nullptr;
    cookie->SetSourceScheme(scheme);
  }
  if (auto port = value.FindInt("sourcePort")) {
    if (*port < -1 || *port == 0 || *port > 65535) return nullptr;
    cookie->SetSourcePort(*port);
  }
  return cookie;
}

class CookieRestore : public base::RefCounted<CookieRestore> {
 public:
  CookieRestore(Profile* profile, base::DictValue expected,
                std::vector<std::unique_ptr<net::CanonicalCookie>> cookies,
                Reply reply)
      : profile_(profile->GetWeakPtr()), expected_(std::move(expected)),
        cookies_(std::move(cookies)), reply_(std::move(reply)) {}
  bool Current() const {
    if (!profile_ || !profile_->IsRegularProfile() || profile_->IsOffTheRecord())
      return false;
    const auto* prefs = profile_->GetPrefs();
    return aux::GetProfileId(profile_.get()) == *expected_.FindString("profileId") &&
        profile_->UniqueId() == *expected_.FindString("browserContextId") &&
        aux::GetProfileCookieBindingEpoch(profile_.get()) == *expected_.FindString("cookieBindingEpoch") &&
        prefs->GetInteger("aside.account_id") == *expected_.FindInt("accountId") &&
        prefs->GetString("aside.account_user_id") == *expected_.FindString("userId") &&
        prefs->GetBoolean("aside.account_has_persisted_session") &&
        !prefs->GetBoolean("aside.account_auth_paused");
  }
  void Start() {
    DCHECK_CURRENTLY_ON(content::BrowserThread::UI);
    if (!Current()) return Finish(false, "Cookie restore profile binding changed");
    const auto& receipt = profile_->GetPrefs()->GetDict(kReceipt);
    if (receipt.FindString("userId") &&
        *receipt.FindString("userId") == *expected_.FindString("userId") &&
        receipt.FindInt("generation") == expected_.FindInt("generation")) {
      already_applied_ = true;
      return Finish(true, "");
    }
    keep_alive_ = ScopedProfileKeepAlive::TryAcquire(
        profile_.get(), ProfileKeepAliveOrigin::kAuxBrowserImport);
    if (!keep_alive_ || !aux::BeginProfileCookieRestore(
        profile_.get(), *expected_.FindString("cookieBindingEpoch")))
      return Finish(false, "Cookie restore profile is busy or closing");
    lease_ = true;
    timer_.Start(FROM_HERE, base::Seconds(15), base::BindOnce(
        &CookieRestore::Interrupted, base::RetainedRef(this)));
    auto* partition = profile_->GetDefaultStoragePartition();
    partition->GetNetworkContext()->GetCookieManager(manager_.BindNewPipeAndPassReceiver());
    manager_.set_disconnect_handler(base::BindOnce(
        &CookieRestore::Interrupted, weak_.GetWeakPtr()));
    manager_->GetAllCookies(base::BindOnce(&CookieRestore::DidRead,
                                          base::RetainedRef(this)));
  }
 private:
  friend class base::RefCounted<CookieRestore>;
  ~CookieRestore() = default;
  void Interrupted() {
    // Closing the pipe does not cancel cookie writes already queued remotely.
    // Leave the profile gate held if any write lacks acknowledgement.
    Finish(false, "Cookie restoration was interrupted; restart this browser before changing its account");
  }
  void DidRead(const net::CookieList& existing) {
    if (!reply_) return;
    if (!Current()) return Finish(false, "Cookie restore profile binding changed");
    std::set<net::UniqueCookieKey> keys;
    for (const auto& cookie : existing) keys.insert(cookie.UniqueKey());
    std::vector<std::unique_ptr<net::CanonicalCookie>> missing;
    for (auto& cookie : cookies_) {
      if (cookie->IsExpired(base::Time::Now()) ||
          !keys.insert(cookie->UniqueKey()).second) ++skipped_;
      else missing.push_back(std::move(cookie));
    }
    cookies_.clear();
    pending_ = missing.size();
    if (!pending_) return FlushBeforeReceipt();
    issued_writes_ = true;
    // Existing-at-start entries win. Concurrent website writes use the normal
    // store ordering; this is not an atomic compare-and-set or jar replacement.
    for (const auto& cookie : missing) {
      manager_->SetCanonicalCookie(*cookie,
          net::cookie_util::SimulatedCookieSource(*cookie, "https"),
          net::CookieOptions::MakeAllInclusive(),
          base::BindOnce(&CookieRestore::DidWrite, base::RetainedRef(this)));
    }
  }
  void DidWrite(net::CookieAccessResult result) {
    if (!reply_ || !pending_) return;
    if (result.status.IsInclude()) ++imported_;
    else ++failed_;
    if (--pending_) return;
    if (!Current()) return Finish(false, "Cookie restore profile binding changed");
    if (failed_) return Finish(false, "Some cookies could not be restored; existing cookies were retained");
    FlushBeforeReceipt();
  }
  void FlushBeforeReceipt() {
    flush_pending_ = true;
    manager_->FlushCookieStore(base::BindOnce(&CookieRestore::DidFlush,
                                             base::RetainedRef(this)));
  }
  void DidFlush() {
    if (!reply_) return;
    flush_pending_ = false;
    if (!Current()) return Finish(false, "Cookie restore profile binding changed");
    Finish(true, "");
  }
  void Finish(bool success, std::string error) {
    if (!reply_) return;
    auto reply = std::move(reply_);
    timer_.Stop();
    manager_.reset();
    if (success && !already_applied_ && Current()) {
      base::DictValue receipt;
      for (const char* key : {"userId", "generation", "revision", "objectSha256"})
        receipt.Set(key, expected_.Find(key)->Clone());
      profile_->GetPrefs()->SetDict(kReceipt, std::move(receipt));
    }
    if (lease_ && profile_ && (!issued_writes_ || (pending_ == 0 && !flush_pending_)))
      aux::FinishProfileCookieRestore(profile_.get());
    keep_alive_.reset();
    if (!success) { std::move(reply).Run(std::nullopt, std::move(error)); return; }
    base::DictValue result;
    result.Set("complete", true);
    result.Set("alreadyApplied", already_applied_);
    result.Set("imported", imported_);
    result.Set("skipped", skipped_);
    std::move(reply).Run(base::Value(std::move(result)), "");
  }
  base::WeakPtr<Profile> profile_;
  base::DictValue expected_;
  std::vector<std::unique_ptr<net::CanonicalCookie>> cookies_;
  Reply reply_;
  std::unique_ptr<ScopedProfileKeepAlive> keep_alive_;
  mojo::Remote<network::mojom::CookieManager> manager_;
  base::OneShotTimer timer_;
  size_t pending_ = 0;
  int imported_ = 0, skipped_ = 0, failed_ = 0;
  bool lease_ = false, issued_writes_ = false, already_applied_ = false;
  bool flush_pending_ = false;
  base::WeakPtrFactory<CookieRestore> weak_{this};
};
}  // namespace

void RestoreCloudCookies(Profile* profile, const base::DictValue& options,
                        Reply reply) {
  DCHECK_CURRENTLY_ON(content::BrowserThread::UI);
  auto reject = [&reply]() { std::move(reply).Run(std::nullopt, "Invalid regular-profile cookie restore request"); };
  if (!profile || !profile->IsRegularProfile() || profile->IsOffTheRecord()) return reject();
  for (const char* key : {"profileId", "userId", "browserContextId", "cookieBindingEpoch"}) {
    const auto* value = options.FindString(key);
    if (!value || value->empty() || value->size() > 256) return reject();
  }
  auto account = options.FindInt("accountId"), generation = options.FindInt("generation");
  auto revision = options.FindDouble("revision");
  const auto* hash = options.FindString("objectSha256");
  const auto* input = options.FindList("cookies");
  const auto bytes = base::WriteJson(options);
  if (!account || *account < 0 || !generation || *generation < 0 ||
      !revision || !std::isfinite(*revision) || *revision < 1 ||
      *revision > 9007199254740991.0 || std::floor(*revision) != *revision ||
      !hash || hash->size() != 64 || !base::ContainsOnlyChars(*hash, "0123456789abcdef") ||
      !input || input->size() > 20000 || !bytes || bytes->size() > 3145728)
    return reject();
  std::vector<std::unique_ptr<net::CanonicalCookie>> cookies;
  for (const auto& value : *input) {
    if (!value.is_dict()) return reject();
    const auto* domain = value.GetDict().FindString("domain");
    if (!domain) return reject();
    if (DomainExcluded(*domain)) continue;
    auto cookie = ParseCookie(value.GetDict());
    if (!cookie) return reject();
    if (!cookie->IsExpired(base::Time::Now())) cookies.push_back(std::move(cookie));
  }
  auto request = options.Clone();
  request.Remove("cookies");
  auto job = base::MakeRefCounted<CookieRestore>(
      profile, std::move(request), std::move(cookies), std::move(reply));
  job->Start();
}
}  // namespace aux_import
