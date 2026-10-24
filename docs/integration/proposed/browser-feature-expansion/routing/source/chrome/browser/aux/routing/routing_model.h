// Copyright 2026 Aux Authors. BSD-style license: see //LICENSE.
#ifndef CHROME_BROWSER_AUX_ROUTING_ROUTING_MODEL_H_
#define CHROME_BROWSER_AUX_ROUTING_ROUTING_MODEL_H_
#include <optional>
#include <string>
#include <vector>
#include "base/values.h"
#include "url/gurl.h"
namespace aux::routing {
struct Destination { std::string profile_id; std::string space_id; };
struct Rule {
  std::string id, host, path;
  bool enabled = true, subdomains = false;
  int priority = 0;
  Destination destination;
};
struct Configuration { std::string revision; std::vector<Rule> rules; };
struct Decoded { std::optional<Configuration> config; std::string error; };
// Versioned, bounded and strict. Unknown fields are refused, not discarded.
Decoded DecodeConfiguration(const base::DictValue&);
base::DictValue EncodeConfiguration(const Configuration&);
bool RoutableUrl(const GURL&);
// A matched destination is returned even when unavailable. Availability belongs
// to the native owner and may never cause selection of another rule/profile.
const Rule* Match(const Configuration&, const GURL&);
}  // namespace aux::routing
#endif
