// Copyright 2026 The Aux Authors
#include "chrome/browser/ui/aux/native_startup_runtime_hello.h"
#if BUILDFLAG(IS_MAC) && BUILDFLAG(AUX_ALLOW_REMOTE_DEBUGGING_FOR_TESTS)
#include <limits>
#include <utility>
#include "base/functional/bind.h"
#include "base/supports_user_data.h"
#include "base/task/single_thread_task_runner.h"
#include "chrome/browser/profiles/profile.h"
#include "chrome/browser/ui/aux/native_startup_admission_waiter.h"
#include "chrome/browser/ui/aux/runtime_host.h"
namespace aux {
namespace {
const char kStartupHelloStoreKey = 0;
class ProfileHelloState final : public base::SupportsUserData::Data {
 public:
  ProfileHelloState();
  ~ProfileHelloState() override;
  void Schedule() {
    if (!observer || !known) return;
    base::SingleThreadTaskRunner::GetCurrentDefault()->PostTask(FROM_HERE,
        base::BindOnce(&ProfileHelloState::Deliver, weak.GetWeakPtr(), generation));
  }
  void Deliver(uint64_t expected) {
    if (expected != generation || !observer || !known) return;
    // Copy before invocation; the receiver may retire or destroy this store.
    auto callback = observer;
    auto value = actual;
    callback.Run(std::move(value));
  }
  void Cancel(uint64_t expected) {
    if (expected == generation) { observer.Reset(); ++generation; }
  }
  std::optional<NativeStartupRuntimeHello> actual;
  bool known = false;
  uint64_t generation = 0;
  NativeStartupRuntimeHelloStore::Observer observer;
  base::WeakPtrFactory<ProfileHelloState> weak{this};
};
ProfileHelloState::ProfileHelloState() = default;
ProfileHelloState::~ProfileHelloState() = default;
ProfileHelloState* State(Profile* profile, bool create) {
  if (!NativeStartupObservationEnabled() || !profile || profile->IsOffTheRecord() || !profile->GetWeakPtr()) return nullptr;
  auto* state = static_cast<ProfileHelloState*>(profile->GetUserData(&kStartupHelloStoreKey));
  if (!state && create) {
    auto owned = std::make_unique<ProfileHelloState>();
    state = owned.get();
    profile->SetUserData(&kStartupHelloStoreKey, std::move(owned));
  }
  return state;
}
}  // namespace
base::ScopedClosureRunner NativeStartupRuntimeHelloStore::Observe(Profile* profile, Observer observer) {
  auto* state = State(profile, true);
  if (!state || !observer || state->observer ||
      state->generation >= std::numeric_limits<uint64_t>::max() - 1) return {};
  ++state->generation;
  state->observer = std::move(observer);
  auto cancellation = base::ScopedClosureRunner(base::BindOnce(
      &ProfileHelloState::Cancel, state->weak.GetWeakPtr(), state->generation));
  state->Schedule();
  return cancellation;
}
std::optional<NativeStartupRuntimeHello> NativeStartupRuntimeHelloStore::Read(Profile* profile) {
  auto* state = State(profile, false);
  const auto host = AuxRuntimeHost::ExistingForStartup(profile);
  if (!state || !state->actual || !host || !state->actual->host || state->actual->host.get() != host.get() ||
      state->actual->connection_generation != 1 || state->actual->acknowledged.is_null()) return std::nullopt;
  return state->actual;
}
void NativeStartupRuntimeHelloStore::Confirm(Profile* profile,
    const NativeStartupRuntimeHello& expected, base::TimeTicks deadline, base::OnceCallback<void(std::optional<base::TimeTicks>)> reply) {
  const auto current = Read(profile);
  if (deadline.is_null() || base::TimeTicks::Now() > deadline || !current || !current->host || !expected.host || current->host.get() != expected.host.get() || current->peer != expected.peer ||
      current->connection_generation != expected.connection_generation ||
      current->acknowledged != expected.acknowledged) {
    std::move(reply).Run(std::nullopt); return;
  }
  current->host->ConfirmStartupHello(expected.connection_generation, expected.peer, deadline,
      base::BindOnce([](base::WeakPtr<Profile> profile, NativeStartupRuntimeHello expected, base::TimeTicks deadline,
                       base::OnceCallback<void(std::optional<base::TimeTicks>)> reply, std::optional<base::TimeTicks> confirmed) {
        const auto current = profile ? NativeStartupRuntimeHelloStore::Read(profile.get()) : std::nullopt;
        const bool valid = confirmed && base::TimeTicks::Now() <= deadline && *confirmed <= deadline && current && current->host && expected.host && current->host.get() == expected.host.get() &&
            current->peer == expected.peer && current->connection_generation == expected.connection_generation &&
            current->acknowledged == expected.acknowledged;
        std::move(reply).Run(valid ? confirmed : std::nullopt);
      }, profile->GetWeakPtr(), expected, deadline, std::move(reply)));
}
void NativeStartupRuntimeHelloStore::Published(Profile* profile, NativeStartupRuntimeHello actual) {
  auto* state = State(profile, true);
  const auto host = AuxRuntimeHost::ExistingForStartup(profile);
  if (!state || !host || !actual.host || actual.host.get() != host.get() || actual.acknowledged.is_null() ||
      actual.acknowledged > base::TimeTicks::Now() || actual.connection_generation != 1 ||
      actual.peer.pid <= 0 || actual.peer.pid_version <= 0) return;
  // A second publication cannot replace the original handshake endpoint.
  if (state->known) { state->actual.reset(); state->Schedule(); return; }
  state->known = true;
  state->actual = std::move(actual);
  state->Schedule();
}
void NativeStartupRuntimeHelloStore::Retired(Profile* profile,
    base::WeakPtr<AuxRuntimeHost> host, uint64_t connection_generation) {
  auto* state = State(profile, false);
  if (!state || !state->actual || !host || !state->actual->host || state->actual->host.get() != host.get() ||
      state->actual->connection_generation != connection_generation) return;
  state->actual.reset();
  state->known = true;
  state->Schedule();
}
}  // namespace aux
#endif
