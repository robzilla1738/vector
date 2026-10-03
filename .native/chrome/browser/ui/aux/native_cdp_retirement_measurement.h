// Copyright 2026 The Aux Authors
#ifndef CHROME_BROWSER_UI_AUX_NATIVE_CDP_RETIREMENT_MEASUREMENT_H_
#define CHROME_BROWSER_UI_AUX_NATIVE_CDP_RETIREMENT_MEASUREMENT_H_
#include <cstdint>
#include <map>
#include <string>
#include <vector>
#include "base/time/time.h"
#include "base/values.h"
namespace aux {
// Measurement only. Original leases come from the native Egress current path;
// this record cannot install/rearm/authorize an effect or construct a receipt.
class NativeCdpRetirementMeasurement final {
 public:
  enum class Mode { kStop, kTakeover };
  struct OriginalPage {
    base::DictValue lease;
    uint64_t dispatch_count = 0;
  };
  NativeCdpRetirementMeasurement(Mode mode, std::string root_run,
      std::string owner_incarnation, uint64_t connection_generation,
      std::vector<std::string> registered_runs,
      std::map<std::string, OriginalPage> pages);
  ~NativeCdpRetirementMeasurement();
  NativeCdpRetirementMeasurement(const NativeCdpRetirementMeasurement&) = delete;
  void ApprovedDispatch(const std::string& page_id,
      const base::DictValue& original_lease, base::TimeTicks dispatched,
      uint64_t count);
  void RetiredPage(const std::string& page_id,
      const base::DictValue& original_lease,
      const base::DictValue& original_scope, base::TimeTicks original_event,
      base::TimeTicks admitted, base::TimeTicks last_dispatch,
      uint64_t count, bool original_clock_valid);
  void DocumentDestroyed(const std::string& page_id, base::TimeTicks original_destroyed);
  void Refuse();
  bool HasFreshDispatches() const;
  base::DictValue ArmedRecord() const;
  base::DictValue Complete(bool original_family_current);
  const std::string& root_run() const { return root_run_; }
  const std::vector<std::string>& registered_runs() const { return registered_runs_; }
  const std::map<std::string, OriginalPage>& original_pages() const { return original_pages_; }
  const std::string& owner_incarnation() const { return owner_incarnation_; }
  uint64_t connection_generation() const { return connection_generation_; }
  Mode mode() const { return mode_; }
  base::TimeTicks deadline() const { return armed_ + base::Seconds(5); }
  bool current() const {
    return !refused_ && !consumed_ && base::TimeTicks::Now() < deadline();
  }
 private:
  struct Page {
    base::DictValue retired_scope;
    base::TimeTicks event, admitted, last, destroyed;
    uint64_t current_count = 0, retired_count = 0;
    bool retired = false, clock_valid = false;
  };
  const Mode mode_;
  const std::string root_run_;
  const std::string owner_incarnation_;
  const uint64_t connection_generation_;
  const std::vector<std::string> registered_runs_;
  const std::map<std::string, OriginalPage> original_pages_;
  const base::TimeTicks armed_ = base::TimeTicks::Now();
  const std::string nonce_;
  std::map<std::string, Page> pages_;
  bool refused_ = false;
  bool consumed_ = false;
};
}  // namespace aux
#endif
