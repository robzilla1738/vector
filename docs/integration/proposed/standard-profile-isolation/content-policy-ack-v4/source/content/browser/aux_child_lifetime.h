// Copyright 2026 Aux contributors. Chromium integration retains upstream notices.
#pragma once
#include "base/process/kill.h"
#include "content/public/browser/aux_sandbox_launch_binding.h"
#include <algorithm>
#include <cstdint>
#include <memory>
#include <mutex>
#include <vector>
#include <unistd.h>

namespace content::internal {
// Retained evidence for launches through the mac content helper only. This is
// not a process-tree census, filesystem authority, or whole-writer certificate.
struct AuxChildLifetime final {
  struct Snapshot {
    size_t unresolved = 0;
    bool all_writer_coverage = false;  // This participant is never a census.
    bool admission_closed = false;
    bool wrong_process = false;
    bool accounting_unknown = false;
    size_t unbound = 0;
    size_t uncertain = 0;
    uint64_t settled = 0;
    uint64_t unobserved_descendant_cohorts = 0;
  };
  static std::shared_ptr<AuxChildLifetime> Reserve() {
    auto entry = std::shared_ptr<AuxChildLifetime>(new AuxChildLifetime);
    std::lock_guard<std::mutex> lock(RegistryMutex());
    if (getpid() != RegistryOwner() || Closed() || Registry().size() >= 4096) {
      if (getpid() != RegistryOwner() || Registry().size() >= 4096)
        AccountingUnknown() = true;
      return nullptr;
    }
    Registry().push_back(entry);  // Reserve before the actual spawn.
    return entry;
  }
  void BindLaunch(pid_t pid, base::Time creation) {
    std::lock_guard<std::mutex> lock(mutex);
    if (getpid() != owner || bound) { uncertain = true; return; }
    bound = true;
    child = pid;
    birth = creation;
    if (pid > 0) {
      // A genuine direct-child reap does not prove that descendants stopped.
      // Retain the cohort unless this exact launch receives the authenticated
      // applied renderer no-fork receipt AND the sole original reap completes.
      // Callback loss or direct reap alone never clears it.
      std::lock_guard<std::mutex> registry_lock(RegistryMutex());
      if (UnobservedDescendantCohorts() == UINT64_MAX) AccountingUnknown() = true;
      else ++UnobservedDescendantCohorts();
      if (birth.is_null()) uncertain = true;
    }
    if (pid <= 0) ReleaseLocked();  // Actual LaunchProcess returned invalid.
  }
  void ObserveAppliedPolicy(
      const content::AuxSandboxLaunchBinding& authority, bool renderer_no_fork) {
    std::lock_guard<std::mutex> lock(mutex);
    if (getpid() != owner || !bound || released || uncertain || child <= 0 ||
        birth.is_null() || !authority.generation()) return;
    // Mutex excludes the sole original reap while native birth/code/root
    // validation runs. No global browser pointer is retained by the reader.
    if (authority.Validate(child, birth)) {
      applied_policy_generation = authority.generation();
      descendants_denied = renderer_no_fork;
    }
    // Renderer no-fork covers descendants only. Delegated/browser-side work
    // remains with its actual writer participants; this is never all-writer coverage.
  }
  uint64_t AppliedPolicyGenerationForReview() {
    std::lock_guard<std::mutex> lock(mutex);
    return getpid() == owner ? applied_policy_generation : 0;
  }
  void ValidateBeforeWaitLocked(pid_t pid, base::Time creation) {
    if (getpid() != owner || !bound || pid != child || birth.is_null() ||
        creation.is_null() || creation != birth) uncertain = true;
  }
  // Caller holds mutex across the existing native wait; no second reaper.
  void ObserveLocked(pid_t pid, base::AuxChildReapEvidence evidence) {
    if (getpid() != owner || !bound || pid <= 0 || pid != child) {
      uncertain = true;
      return;
    }
    if (evidence == base::AuxChildReapEvidence::unknown) uncertain = true;
    if (evidence == base::AuxChildReapEvidence::reaped && !uncertain)
      ReleaseLocked();
  }
  static void CloseAdmission() {
    std::lock_guard<std::mutex> lock(RegistryMutex());
    Closed() = true;
    if (getpid() != RegistryOwner()) AccountingUnknown() = true;
  }
  static Snapshot Inspect() {
    Snapshot result;
    std::vector<std::shared_ptr<AuxChildLifetime>> entries;
    {
      std::lock_guard<std::mutex> lock(RegistryMutex());
      result.admission_closed = Closed();
      result.wrong_process = getpid() != RegistryOwner();
      result.accounting_unknown = AccountingUnknown();
      result.settled = Settled();
      result.unobserved_descendant_cohorts = UnobservedDescendantCohorts();
      entries = Registry();
    }
    // Never hold the registry mutex while acquiring an entry mutex: the sole
    // original reaper releases an entry in the opposite order.
    for (const auto& entry : entries) {
      std::lock_guard<std::mutex> lock(entry->mutex);
      if (entry->released) continue;
      ++result.unresolved;
      if (!entry->bound) ++result.unbound;
      if (entry->uncertain) ++result.uncertain;
    }
    {
      // A copied unbound entry may bind and be reaped before its entry scan.
      // Read the sticky cohort evidence AFTER scanning so that release cannot
      // hide that launch. Keep admission_closed from the original copy: an
      // open-to-closed transition cannot make an incomplete copy authoritative.
      std::lock_guard<std::mutex> lock(RegistryMutex());
      result.accounting_unknown |= AccountingUnknown();
      result.unobserved_descendant_cohorts = UnobservedDescendantCohorts();
    }
    return result;
  }
  std::mutex mutex;
 private:
  AuxChildLifetime();
  static pid_t RegistryOwner() { static const pid_t owner = getpid(); return owner; }
  static bool& Closed() { static bool closed = false; return closed; }
  static bool& AccountingUnknown() { static bool unknown = false; return unknown; }
  static uint64_t& Settled() { static uint64_t settled = 0; return settled; }
  static uint64_t& UnobservedDescendantCohorts() { static uint64_t count = 0; return count; }
  static std::mutex& RegistryMutex() { static auto* m = new std::mutex; return *m; }
  static std::vector<std::shared_ptr<AuxChildLifetime>>& Registry() {
    static auto* r = new std::vector<std::shared_ptr<AuxChildLifetime>>;
    return *r;
  }
  void ReleaseLocked() {
    std::lock_guard<std::mutex> lock(RegistryMutex());
    if (released || uncertain) return;
    released = true;
    if (descendants_denied) {
      if (UnobservedDescendantCohorts() == 0) AccountingUnknown() = true;
      else --UnobservedDescendantCohorts();
    }
    if (Settled() == UINT64_MAX) AccountingUnknown() = true;
    else ++Settled();
    std::erase_if(Registry(), [this](const auto& entry) { return entry.get() == this; });
  }
  const pid_t owner = getpid();
  pid_t child = -1;
  base::Time birth;
  bool bound = false;
  bool uncertain = false;
  bool released = false;
  uint64_t applied_policy_generation = 0;
  bool descendants_denied = false;
};
}
