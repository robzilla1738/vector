// Copyright 2026 Aux Authors. All rights reserved.
#include "chrome/browser/devtools/aux_cdp_authority.h"

#include "base/base64.h"
#include "base/functional/bind.h"
#include "base/json/json_reader.h"
#include "base/json/json_writer.h"
#include "base/strings/string_number_conversions.h"
#include "base/strings/string_util.h"
#include "base/uuid.h"
#include "chrome/browser/aux/installation_auth.h"
#include "crypto/random.h"
namespace aux {
namespace {
CdpResponse Error(int status, std::string_view code, std::string_view message) {
  base::DictValue error;
  error.Set("code", code);
  error.Set("message", message);
  base::DictValue body;
  body.Set("error", std::move(error));
  return {status, base::WriteJson(body).value_or("{}")};
}
bool ValidHost(std::string_view host, uint16_t port) {
  for (std::string_view name : {"localhost", "127.0.0.1", "[::1]"}) {
    if (host == name ||
        host == std::string(name) + ":" + base::NumberToString(port)) {
      return true;
    }
  }
  return false;
}
} // namespace
CdpAuthority::CdpAuthority(crypto::keypair::PublicKey key, uint16_t port,
                           std::set<std::string> origins)
    : key_(std::move(key)), port_(port), origins_(std::move(origins)) {}
CdpAuthority::~CdpAuthority() = default;
void CdpAuthority::Prune(base::TimeTicks now) {
  std::erase_if(challenges_,
                [now](const auto &item) { return item.second.expires <= now; });
  std::erase_if(sessions_,
                [now](const auto &item) { return item.second <= now; });
}
std::optional<CdpResponse>
CdpAuthority::Filter(const net::HttpServerRequestInfo &request,
                     bool websocket) {
  if (!request.peer.address().IsLoopback() ||
      !ValidHost(request.GetHeaderValue("host"), port_)) {
    return Error(403, "FORBIDDEN", "Loopback host required");
  }
  const auto origin = request.GetHeaderValue("origin");
  if (!origin.empty() && !origins_.contains(origin)) {
    return Error(403, "FORBIDDEN", "Origin is not allowed");
  }
  const auto query = request.path.find('?');
  const std::string path = request.path.substr(0, query);
  base::AutoLock guard(lock_);
  const auto now = base::TimeTicks::Now();
  Prune(now);
  if (!websocket && path == "/json/challenge") {
    if (request.method != "GET") {
      return Error(400, "BAD_REQUEST", "GET required");
    }
    if (challenges_.size() >= 1024) {
      auto oldest =
          std::min_element(challenges_.begin(), challenges_.end(),
                           [](const auto &a, const auto &b) {
                             return a.second.expires < b.second.expires;
                           });
      challenges_.erase(oldest);
    }
    const std::string id = base::Uuid::GenerateRandomV4().AsLowercaseString();
    const std::string bytes = base::Base64Encode(crypto::RandBytesAsVector(32));
    challenges_.emplace(id, Challenge{bytes, now + base::Seconds(30)});
    base::DictValue body;
    body.Set("challengeId", id);
    body.Set("challenge", bytes);
    return CdpResponse{200, base::WriteJson(body).value_or("{}")};
  }
  if (!websocket && path == "/json/auth/session") {
    if (request.method != "POST" || request.data.size() > 16384) {
      return Error(400, "BAD_REQUEST", "Invalid session request");
    }
    auto input = base::JSONReader::ReadDict(request.data, base::JSON_PARSE_RFC);
    const std::string *id = input ? input->FindString("challengeId") : nullptr;
    const std::string *signature =
        input ? input->FindString("signedChallenge") : nullptr;
    if (!id || !signature) {
      return Error(400, "BAD_REQUEST", "Challenge and signature required");
    }
    auto found = challenges_.find(*id);
    if (found == challenges_.end()) {
      return Error(401, "UNAUTHORIZED", "Challenge is invalid or expired");
    }
    const auto challenge = std::move(found->second);
    challenges_.erase(found);
    if (!VerifyCdpChallenge(key_, challenge.bytes, *signature)) {
      return Error(401, "UNAUTHORIZED", "Signature could not be verified");
    }
    if (sessions_.size() >= 1024) {
      return Error(503, "SERVICE_UNAVAILABLE", "Session capacity reached");
    }
    const std::string token = base::Base64Encode(crypto::RandBytesAsVector(32));
    sessions_[token] = now + base::Hours(24);
    base::DictValue body;
    body.Set("token_type", "AuxSessionToken");
    body.Set("access_token", token);
    body.Set("expiresInSeconds", 86400);
    return CdpResponse{200, base::WriteJson(body).value_or("{}")};
  }
  const std::string authorization = request.GetHeaderValue("authorization");
  constexpr std::string_view prefix = "AuxSessionToken ";
  if (!base::StartsWith(authorization, prefix) ||
      !sessions_.contains(authorization.substr(prefix.size()))) {
    return Error(401, "UNAUTHORIZED", "Browser authorization required");
  }
  return std::nullopt;
}
CdpRequestFilter
CreateCdpRequestFilter(std::shared_ptr<CdpAuthority> authority) {
  return base::BindRepeating(
      [](std::shared_ptr<CdpAuthority> authority,
         const net::HttpServerRequestInfo &request,
         bool websocket) -> std::optional<net::HttpServerResponseInfo> {
        auto result = authority->Filter(request, websocket);
        if (!result) {
          return std::nullopt;
        }
        net::HttpServerResponseInfo response(
            static_cast<net::HttpStatusCode>(result->status));
        response.AddHeader("Cache-Control", "no-store");
        response.AddHeader("Content-Security-Policy", "default-src 'none'");
        response.SetBody(result->body, result->mime_type);
        return response;
      },
      std::move(authority));
}
} // namespace aux
