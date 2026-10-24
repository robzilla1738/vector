// Copyright 2026 The Aux Authors. BSD-style license: see //LICENSE.
#include "chrome/browser/aux/feature_store/feature_write_participant.h"
#include <limits>
#include <map>
#include <mutex>
#include <utility>
#include <vector>
#include <unistd.h>
#include "base/functional/bind.h"
#include "base/location.h"
#include "base/no_destructor.h"
#include "base/task/sequenced_task_runner.h"
namespace aux::features {
namespace {
struct Record {
  base::FilePath profile_path;
  NativeFeatureIoKind kind;
  std::weak_ptr<std::atomic_bool> authorization;
  bool abandoned = false;
};
struct Waiter {
  scoped_refptr<base::SequencedTaskRunner> runner;
  base::OnceCallback<void(NativeFeatureWriteObservation)> callback;
};
struct Registry {
  const pid_t process = getpid();
  std::mutex mutex;
  uint64_t next_id = 1;
  NativeFeatureWriteObservation observation;
  std::map<uint64_t, Record> records;
  std::vector<Waiter> waiters;
};
Registry& State() { static base::NoDestructor<Registry> state; return *state; }
void ReportSettled() {
  auto& state = State();
  if (getpid() != state.process) return;
  std::vector<Waiter> waiters;
  NativeFeatureWriteObservation observation;
  {
    std::lock_guard<std::mutex> guard(state.mutex);
    if (!state.observation.admission_closed || state.observation.pending) return;
    observation = state.observation;
    waiters = std::exchange(state.waiters, {});
  }
  for (auto& waiter : waiters)
    waiter.runner->PostTask(FROM_HERE,
        base::BindOnce(std::move(waiter.callback), observation));
}
}  // namespace
NativeFeatureIoTicket::NativeFeatureIoTicket(uint64_t id) : id_(id) {}
NativeFeatureIoTicket::~NativeFeatureIoTicket() {
  if (settled_.load()) return;
  auto& state = State();
  if (getpid() != state.process) return;
  std::lock_guard<std::mutex> guard(state.mutex);
  const auto found = state.records.find(id_);
  if (found != state.records.end() && !found->second.abandoned) {
    found->second.abandoned = true;
    ++state.observation.abandoned;
    // Keep pending: losing a completion is not evidence that I/O stopped.
  }
}
bool NativeFeatureIoTicket::IsCancelled() const {
  return settled_.load() || IsNativeFeatureIoAdmissionClosed();
}
void NativeFeatureIoTicket::Settle(NativeFeatureIoOutcome outcome) {
  if (settled_.exchange(true)) return;
  auto& state = State();
  if (getpid() != state.process) return;
  {
    std::lock_guard<std::mutex> guard(state.mutex);
    const auto found = state.records.find(id_);
    if (found == state.records.end()) { ++state.observation.uncertain; return; }
    state.records.erase(found);
    --state.observation.pending;
    ++state.observation.settled;
    if (outcome == NativeFeatureIoOutcome::kRefused) ++state.observation.refused;
    if (outcome == NativeFeatureIoOutcome::kUncertain) ++state.observation.uncertain;
  }
  ReportSettled();
}
std::shared_ptr<NativeFeatureIoTicket> BeginNativeFeatureIo(
    const base::FilePath& native_profile_path, NativeFeatureIoKind kind,
    std::shared_ptr<std::atomic_bool> write_authorization) {
  auto& state = State();
  if (getpid() != state.process || native_profile_path.empty() || !native_profile_path.IsAbsolute()) return {};
  std::lock_guard<std::mutex> guard(state.mutex);
  if (state.observation.admission_closed || state.next_id == std::numeric_limits<uint64_t>::max()) return {};
  // A replacement receiver cannot overtake an older snapshot task for the
  // same native profile, even after the old Profile/KeyedService disappears.
  if (kind == NativeFeatureIoKind::kOrganization || kind == NativeFeatureIoKind::kFeatureState)
    for (const auto& [id, record] : state.records)
      if (record.profile_path == native_profile_path && record.kind == kind) return {};
  const uint64_t id = state.next_id++;
  state.records.emplace(id, Record{native_profile_path, kind, write_authorization});
  ++state.observation.pending;
  return std::shared_ptr<NativeFeatureIoTicket>(new NativeFeatureIoTicket(id));
}
void CloseNativeFeatureIoAdmission() {
  auto& state = State();
  if (getpid() != state.process) return;
  {
    std::lock_guard<std::mutex> guard(state.mutex);
    state.observation.admission_closed = true;
    for (const auto& [id, record] : state.records)
      if (auto authorization = record.authorization.lock()) authorization->store(false, std::memory_order_release);
  }
  ReportSettled();
}
bool IsNativeFeatureIoAdmissionClosed() {
  auto& state = State();
  if (getpid() != state.process) return true;
  std::lock_guard<std::mutex> guard(state.mutex);
  return state.observation.admission_closed;
}
bool IsNativeFeatureIoPendingForProfilePath(const base::FilePath& native_profile_path) {
  auto& state = State();
  if (getpid() != state.process) return true;
  std::lock_guard<std::mutex> guard(state.mutex);
  for (const auto& [id, record] : state.records)
    if (record.profile_path == native_profile_path) return true;
  return false;
}
NativeFeatureWriteObservation InspectNativeFeatureWrites() {
  auto& state = State();
  if (getpid() != state.process) return {.wrong_process = true};
  std::lock_guard<std::mutex> guard(state.mutex);
  return state.observation;
}
void CloseNativeFeatureWritesForMigration(
    base::OnceCallback<void(NativeFeatureWriteObservation)> done) {
  auto runner = base::SequencedTaskRunner::GetCurrentDefault();
  auto& state = State();
  if (getpid() != state.process) {
    runner->PostTask(FROM_HERE, base::BindOnce(std::move(done), NativeFeatureWriteObservation{.wrong_process = true}));
    return;
  }
  {
    std::lock_guard<std::mutex> guard(state.mutex);
    state.observation.admission_closed = true;
    for (const auto& [id, record] : state.records)
      if (auto authorization = record.authorization.lock()) authorization->store(false, std::memory_order_release);
    state.waiters.push_back({std::move(runner), std::move(done)});
  }
  ReportSettled();
}
}  // namespace aux::features
