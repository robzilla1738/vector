// Copyright 2026 Aux Authors. BSD-style license: see //LICENSE.
#include "chrome/browser/aux/routing/routing_model.h"
#include <set>
#include <tuple>
#include "base/strings/string_util.h"
#include "base/uuid.h"
namespace aux::routing {
namespace {
bool Keys(const base::DictValue& d, std::initializer_list<std::string_view> keys) {
  for (const auto item : d) {
    bool found = false;
    for (auto key : keys) found |= item.first == key;
    if (!found) return false;
  }
  return true;
}
bool Id(const std::string* s) {
  return s && base::Uuid::ParseLowercase(*s).is_valid();
}
bool PathMatches(const std::string& path, const GURL& url) {
  return path.empty() || path == "/" || url.path_piece() == path ||
      (base::StartsWith(url.path_piece(), path) &&
       (path.back() == '/' || url.path_piece()[path.size()] == '/'));
}
}  // namespace
bool RoutableUrl(const GURL& url) {
  return url.is_valid() && url.SchemeIsHTTPOrHTTPS() &&
         !url.has_username() && !url.has_password() &&
         url.spec().size() <= 16384;
}
Decoded DecodeConfiguration(const base::DictValue& value) {
  if (!Keys(value, {"version", "revision", "rules"}) ||
      value.FindInt("version") != 1 || !Id(value.FindString("revision")))
    return {.error = "Unsupported or invalid routing configuration"};
  const auto* rows = value.FindList("rules");
  if (!rows || rows->size() > 200)
    return {.error = "Routing requires at most 200 rules"};
  Configuration result{.revision = *value.FindString("revision")};
  std::set<std::string> ids;
  for (const auto& item : *rows) {
    const auto* d = item.GetIfDict();
    if (!d || !Keys(*d, {"id", "enabled", "host", "subdomains", "path",
                         "priority", "profileId", "spaceId"}) ||
        !Id(d->FindString("id")) || !Id(d->FindString("profileId")) ||
        !d->FindBool("enabled") || !d->FindBool("subdomains") ||
        !d->FindInt("priority"))
      return {.error = "Invalid routing rule fields"};
    const auto* host = d->FindString("host");
    const auto* path = d->FindString("path");
    const auto* space = d->FindString("spaceId");
    if (!host || host->empty() || host->size() > 253 || !path ||
        path->size() > 2048 || !space || (!space->empty() && !Id(space)) ||
        !ids.insert(*d->FindString("id")).second)
      return {.error = "Invalid or duplicated routing identity"};
    const GURL parsed("https://" + *host + "/");
    if (!RoutableUrl(parsed) || parsed.has_port() || parsed.has_query() ||
        parsed.has_ref() || parsed.path() != "/" || parsed.host() != *host ||
        host->find_first_of("/*?#@\\") != std::string::npos)
      return {.error = "Use a normalized hostname without a scheme or port"};
    const GURL path_url("https://" + *host + (path->empty() ? "/" : *path));
    if ((!path->empty() && (path->front() != '/' ||
         path_url.path() != *path)) || path_url.has_query() ||
        path_url.has_ref() || path_url.host() != *host ||
        *d->FindInt("priority") < -10000 || *d->FindInt("priority") > 10000)
      return {.error = "Use a normalized path without query or fragment"};
    result.rules.push_back({.id = *d->FindString("id"), .host = *host,
        .path = *path, .enabled = *d->FindBool("enabled"),
        .subdomains = *d->FindBool("subdomains"),
        .priority = *d->FindInt("priority"),
        .destination = {*d->FindString("profileId"), *space}});
  }
  return {.config = std::move(result)};
}
base::DictValue EncodeConfiguration(const Configuration& config) {
  base::ListValue rules;
  for (const auto& r : config.rules) {
    rules.Append(base::DictValue().Set("id", r.id).Set("enabled", r.enabled)
        .Set("host", r.host).Set("path", r.path).Set("subdomains", r.subdomains)
        .Set("priority", r.priority).Set("profileId", r.destination.profile_id)
        .Set("spaceId", r.destination.space_id));
  }
  return base::DictValue().Set("version", 1).Set("revision", config.revision)
      .Set("rules", std::move(rules));
}
const Rule* Match(const Configuration& config, const GURL& url) {
  if (!RoutableUrl(url)) return nullptr;
  const Rule* winner = nullptr;
  auto rank = [](const Rule& r) {
    return std::tuple(r.priority, r.path.size(), !r.subdomains, r.host.size());
  };
  for (const auto& r : config.rules) {
    if (!r.enabled || !PathMatches(r.path, url) ||
        !(url.host() == r.host || (r.subdomains &&
          base::EndsWith(url.host_piece(), "." + r.host)))) continue;
    // Equal ranks retain user order; no dependence on hash/map iteration.
    if (!winner || rank(r) > rank(*winner)) winner = &r;
  }
  return winner;
}
}  // namespace aux::routing
