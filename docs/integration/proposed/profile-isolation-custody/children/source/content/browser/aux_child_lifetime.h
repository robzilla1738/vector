// Copyright 2026 Aux contributors. Chromium integration retains upstream notices.
#pragma once
#include "base/process/kill.h"
#include <algorithm>
#include <memory>
#include <mutex>
#include <vector>
#include <unistd.h>

namespace content::internal {
// Retained evidence for launches through the mac content helper only. This is
// not a process-tree census, filesystem authority, or whole-writer certificate.
struct AuxChildLifetime final {
  struct Snapshot { size_t unresolved; bool all_writer_coverage = false; };
  static std::shared_ptr<AuxChildLifetime> Reserve() {
    auto entry = std::shared_ptr<AuxChildLifetime>(new AuxChildLifetime);
    std::lock_guard<std::mutex> lock(RegistryMutex());
    Registry().push_back(entry);  // Reserve before the actual spawn.
    return entry;
  }
  void BindLaunch(pid_t pid, base::Time creation) {
    std::lock_guard<std::mutex> lock(mutex);
    if (getpid() != owner || bound) { uncertain = true; return; }
    bound = true;
    child = pid;
    birth = creation;
    if (pid > 0 && birth.is_null()) uncertain = true;
    if (pid <= 0) ReleaseLocked();  // Actual LaunchProcess returned invalid.
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
  static Snapshot Inspect() {
    std::lock_guard<std::mutex> lock(RegistryMutex());
    return {Registry().size(), false};
  }
  std::mutex mutex;
 private:
  AuxChildLifetime() = default;
  static std::mutex& RegistryMutex() { static auto* m = new std::mutex; return *m; }
  static std::vector<std::shared_ptr<AuxChildLifetime>>& Registry() {
    static auto* r = new std::vector<std::shared_ptr<AuxChildLifetime>>;
    return *r;
  }
  void ReleaseLocked() {
    std::lock_guard<std::mutex> lock(RegistryMutex());
    std::erase_if(Registry(), [this](const auto& entry) { return entry.get() == this; });
  }
  const pid_t owner = getpid();
  pid_t child = -1;
  base::Time birth;
  bool bound = false;
  bool uncertain = false;
};
}
