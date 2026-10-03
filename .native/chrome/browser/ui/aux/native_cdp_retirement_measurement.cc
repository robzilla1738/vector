// Copyright 2026 The Aux Authors
#include "chrome/browser/ui/aux/native_cdp_retirement_measurement.h"
#include <limits>
#include <utility>
#include "base/strings/string_number_conversions.h"
#include "base/unguessable_token.h"
namespace aux {
namespace {
base::DictValue Identity(const base::DictValue& lease) {
  auto identity = lease.Clone();
  identity.Remove("expiresAt");
  return identity;
}
std::string Ticks(base::TimeTicks ticks) {
  return base::NumberToString(ticks.since_origin().InMicroseconds());
}
}  // namespace
NativeCdpRetirementMeasurement::NativeCdpRetirementMeasurement(Mode mode,
    std::string root_run, std::string owner_incarnation, uint64_t generation,
    std::vector<std::string> registered_runs,
    std::map<std::string, OriginalPage> pages)
    : mode_(mode), root_run_(std::move(root_run)),
      owner_incarnation_(std::move(owner_incarnation)),
      connection_generation_(generation), registered_runs_(std::move(registered_runs)),
      original_pages_(std::move(pages)),
      nonce_(base::UnguessableToken::Create().ToString()) {
  if (root_run_.empty() || owner_incarnation_.empty() || !generation ||
      registered_runs_.empty() || registered_runs_.size() > 128 ||
      original_pages_.empty() || original_pages_.size() > 20 ||
      (mode == Mode::kTakeover && original_pages_.size() != 1)) refused_ = true;
  for (const auto& [id, original] : original_pages_) {
    auto& page = pages_[id];
    page.current_count = original.dispatch_count;
    if (id.empty() || !original.lease.FindString("leaseId") || original.lease.FindString("leaseId")->empty()) refused_ = true;
  }
}
NativeCdpRetirementMeasurement::~NativeCdpRetirementMeasurement() = default;
void NativeCdpRetirementMeasurement::ApprovedDispatch(const std::string& id,
    const base::DictValue& lease, base::TimeTicks dispatched, uint64_t count) {
  const auto original = original_pages_.find(id);
  auto page = pages_.find(id);
  if (consumed_ || refused_) return;
  if (original == original_pages_.end() || page == pages_.end() ||
      Identity(original->second.lease) != Identity(lease) ||
      page->second.current_count == std::numeric_limits<uint64_t>::max() ||
      count != page->second.current_count + 1 || dispatched < armed_) {
    Refuse(); return;
  }
  page->second.current_count = count;
  page->second.last = dispatched;
}
void NativeCdpRetirementMeasurement::RetiredPage(const std::string& id,
    const base::DictValue& lease, const base::DictValue& scope,
    base::TimeTicks event, base::TimeTicks admitted, base::TimeTicks last,
    uint64_t count, bool original_clock_valid) {
  const auto original = original_pages_.find(id);
  auto page = pages_.find(id);
  if (consumed_ || refused_) return;
  if (original == original_pages_.end() || page == pages_.end() || page->second.retired ||
      Identity(original->second.lease) != Identity(lease) ||
      count != page->second.current_count || last != page->second.last ||
      event < armed_ || admitted < event) { Refuse(); return; }
  page->second.retired_scope = scope.Clone();
  page->second.event = event; page->second.admitted = admitted;
  page->second.retired_count = count; page->second.retired = true;
  page->second.clock_valid = original_clock_valid;
}
void NativeCdpRetirementMeasurement::DocumentDestroyed(const std::string& id,
    base::TimeTicks destroyed) {
  auto page = pages_.find(id);
  if (consumed_ || refused_) return;
  if (mode_ != Mode::kStop || page == pages_.end() || !page->second.retired ||
      destroyed.is_null() || destroyed < page->second.admitted ||
      !page->second.destroyed.is_null()) { Refuse(); return; }
  page->second.destroyed = destroyed;
}
void NativeCdpRetirementMeasurement::Refuse() { refused_ = true; }
bool NativeCdpRetirementMeasurement::HasFreshDispatches() const {
  if (!current()) return false;
  for (const auto& [id, original] : original_pages_) {
    const auto page = pages_.find(id);
    if (page == pages_.end() || page->second.retired ||
        page->second.current_count <= original.dispatch_count || page->second.last < armed_) return false;
  }
  return true;
}
base::DictValue NativeCdpRetirementMeasurement::ArmedRecord() const {
  if (refused_ || consumed_) return base::DictValue().Set("producer", "aux-native-cdp-retirement")
      .Set("version", 1).Set("status", "refused");
  base::ListValue pages;
  for (const auto& [id, original] : original_pages_) {
    base::DictValue scope;
    for (const auto* field : {"profileId", "tabId", "isolationId", "runId", "taskId", "taskRevision",
         "frameId", "documentToken", "sourceOrigin", "controlGeneration"}) {
      if (const auto* value = original.lease.Find(field)) scope.Set(field, value->Clone());
    }
    pages.Append(base::DictValue().Set("scope", std::move(scope))
        .Set("leaseId", *original.lease.FindString("leaseId"))
        .Set("initialCount", base::NumberToString(original.dispatch_count)));
  }
  base::ListValue runs;
  for (const auto& run : registered_runs_) runs.Append(run);
  return base::DictValue().Set("producer", "aux-native-cdp-retirement").Set("version", 1)
      .Set("status", "armed").Set("mode", mode_ == Mode::kStop ? "stop" : "takeover")
      .Set("nonce", nonce_).Set("hostIncarnation", owner_incarnation_)
      .Set("connectionGeneration", static_cast<double>(connection_generation_))
      .Set("rootRunId", root_run_).Set("registeredRuns", std::move(runs))
      .Set("armedUs", Ticks(armed_)).Set("pages", std::move(pages));
}
base::DictValue NativeCdpRetirementMeasurement::Complete(bool original_current) {
  const auto now = base::TimeTicks::Now();
  const bool consumed = consumed_; consumed_ = true;
  if (consumed || refused_ || !original_current || now - armed_ >= base::Seconds(5))
    return base::DictValue().Set("producer", "aux-native-cdp-retirement")
        .Set("version", 1).Set("status", "refused");
  base::ListValue pages;
  for (const auto& [id, page] : pages_) {
    if (!page.retired || !page.clock_valid || page.last < armed_ ||
        page.last > page.admitted || page.current_count != page.retired_count ||
        page.retired_count <= original_pages_.at(id).dispatch_count ||
        now <= page.admitted)
      return base::DictValue().Set("producer", "aux-native-cdp-retirement")
          .Set("version", 1).Set("status", "refused");
    pages.Append(base::DictValue().Set("scope", page.retired_scope.Clone())
        .Set("leaseId", *original_pages_.at(id).lease.FindString("leaseId"))
        .Set("initialCount", base::NumberToString(original_pages_.at(id).dispatch_count))
        .Set("eventUs", Ticks(page.event)).Set("admittedUs", Ticks(page.admitted))
        .Set("lastDispatchUs", Ticks(page.last)).Set("retiredCount", base::NumberToString(page.retired_count))
        .Set("observedCount", base::NumberToString(page.current_count)).Set("originalClockValid", true)
        .Set("documentState", page.destroyed.is_null() ? "retained" : "destroyed")
        .Set("destroyedUs", page.destroyed.is_null() ? "0" : Ticks(page.destroyed)));
  }
  base::ListValue runs;
  for (const auto& run : registered_runs_) runs.Append(run);
  return base::DictValue().Set("producer", "aux-native-cdp-retirement").Set("version", 1)
      .Set("status", "sampled").Set("mode", mode_ == Mode::kStop ? "stop" : "takeover")
      .Set("nonce", nonce_).Set("hostIncarnation", owner_incarnation_)
      .Set("connectionGeneration", static_cast<double>(connection_generation_))
      .Set("rootRunId", root_run_).Set("registeredRuns", std::move(runs))
      .Set("armedUs", Ticks(armed_)).Set("observedUs", Ticks(now)).Set("pages", std::move(pages));
}
}  // namespace aux
