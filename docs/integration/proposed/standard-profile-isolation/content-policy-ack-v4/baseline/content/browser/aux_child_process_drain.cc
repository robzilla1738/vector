// Copyright 2026 The Aux Authors
#include "content/public/browser/aux_child_process_drain.h"
#include "content/browser/aux_child_lifetime.h"
#include <atomic>
namespace content::aux_migration {
namespace {
std::atomic<void (*)()> completion{nullptr};
std::atomic_bool delivered{false};
}
bool RegisterBrowserShutdownCompletion(void (*completed)()) {
  if (!completed || delivered.load()) return false;
  void (*expected)() = nullptr;
  return completion.compare_exchange_strong(expected, completed) || expected == completed;
}
void ObserveBrowserMainLoopDestroyedForDrain() {
  if (delivered.exchange(true)) return;
  if (auto completed = completion.load()) completed();
}
void CloseContentChildLaunchAdmission() {
  internal::AuxChildLifetime::CloseAdmission();
}
ChildProcessDrainSnapshot InspectContentChildDrain() {
  const auto value = internal::AuxChildLifetime::Inspect();
  return {value.admission_closed, value.wrong_process, value.accounting_unknown,
          value.unresolved, value.unbound, value.uncertain, value.settled,
          value.unobserved_descendant_cohorts};
}
}
