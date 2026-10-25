#include "AuxTaskDescendantObserver.h"
#include <EndpointSecurity/EndpointSecurity.h>
#include <bsm/libbsm.h>
#include <dispatch/dispatch.h>
#include <fcntl.h>
#include <mach/mach.h>
#include <mach/mach_time.h>
#include <sys/stat.h>
#include <unistd.h>
#include <algorithm>
#include <array>
#include <condition_variable>
#include <chrono>
#include <compare>
#include <cstdlib>
#include <cstring>
#include <limits>
#include <map>
#include <mutex>
#include <vector>

namespace aux::descendants {
namespace {
constexpr size_t kLimit = 16384;
const pid_t kImageProcess = getpid();
struct Identity {
  pid_t pid = 0;
  uint32_t version = 0;
  auto operator<=>(const Identity&) const = default;
};
Identity Id(const audit_token_t& token) {
  return {audit_token_to_pid(token),
          static_cast<uint32_t>(audit_token_to_pidversion(token))};
}
struct Birth {
  Identity id;
  uint64_t time = 0;
};
}  // namespace

class Cohort final {
 public:
  Cohort(uint64_t owner, uint64_t time, std::function<void()> done)
      : owner(owner), reserved_at(time), done(std::move(done)) {}
  const uint64_t owner;
  const uint64_t reserved_at;
  uint64_t published_at = 0;
  pid_t child = -1;
  bool publication_pending = true;
  bool failed_before_child = false;
  bool original_reaped = false;
  bool unknown = false;
  bool settled = false;
  std::function<void()> done;
};

namespace {
struct Observer {
  std::mutex mutex;
  std::condition_variable changed;
  bool initialized = false;
  bool ready = false;
  bool closed = true;
  bool unknown = false;
  bool baseline_seen = false;
  bool fence_scheduled = false;
  bool shutdown_fenced = false;
  uint64_t last_sequence = 0;
  uint64_t epoch = 0;
  uint64_t pulse_started = 0;
  uint64_t pulse_number = 0;
  uint64_t pulse_seen = 0;
  uint64_t fenced_pulse = 0;
  Identity self;
  int pulse_fd = -1;
  struct stat pulse_stat {};
  es_client_t* client = nullptr;
  // Deliberately retained through process exit. No destructor/client deletion
  // can run a sync callback and accidentally manufacture a successful fence.
  dispatch_queue_t queue = dispatch_queue_create(
      "dev.aux.task-descendant-fence", DISPATCH_QUEUE_SERIAL);
  std::map<Identity, uint64_t> live;
  // Stable first self-child birth for each live kernel audit identity. Keep it
  // through fork, exec identity changes and reparenting; never a PID census.
  std::map<Identity, Identity> lineage;
  std::vector<Birth> roots;
  std::vector<Ticket> cohorts;
};
Observer& State() {
  static Observer* state = new Observer;
  return *state;
}
void UnknownLocked(Observer& s) {
  s.unknown = true;
  s.ready = false;
  s.closed = true;
  s.changed.notify_all();
}
bool SameProcess() { return getpid() == kImageProcess; }
void ScheduleFenceLocked(Observer&);

bool QuiescentLocked(const Observer& s) {
  if (s.unknown || !s.baseline_seen || !s.live.empty() || !s.lineage.empty()) return false;
  for (const auto& cohort : s.cohorts) {
    if (cohort->unknown || cohort->publication_pending ||
        (!cohort->failed_before_child && !cohort->original_reaped)) return false;
  }
  return true;
}
bool MatchBirthLocked(const Observer& s, const Cohort& c) {
  if (c.failed_before_child) return true;
  size_t matched = 0;
  for (const auto& birth : s.roots) {
    if (birth.id.pid == c.child && birth.time >= c.reserved_at &&
        birth.time <= c.published_at) ++matched;
  }
  // Retain tombstones for children that exit before native spawn publication.
  // PID reuse producing two births in this interval is ambiguous, not success.
  return matched == 1;
}
bool RecordRootLocked(Observer& s, Identity child, uint64_t time) {
  if (s.roots.size() >= kLimit ||
      std::none_of(s.cohorts.begin(), s.cohorts.end(), [&](const Ticket& c) {
        return c->reserved_at <= time &&
            (c->publication_pending ||
             (!c->failed_before_child && c->child == child.pid &&
              time <= c->published_at));
      })) return false;
  s.roots.push_back({child, time});
  return true;
}

bool IsPulse(const Observer& s, const es_message_t& m) {
  if (m.event_type != ES_EVENT_TYPE_NOTIFY_DUP || !m.process ||
      Id(m.process->audit_token) != s.self || !m.event.dup.target ||
      m.mach_time < s.pulse_started) return false;
  const auto& st = m.event.dup.target->stat;
  return st.st_dev == s.pulse_stat.st_dev && st.st_ino == s.pulse_stat.st_ino;
}

void Event(es_client_t* client, const es_message_t* message) noexcept {
  if (!SameProcess()) return;
  auto& s = State();
  try {
    std::lock_guard<std::mutex> lock(s.mutex);
    if (s.unknown || !message || !message->process || message->version < 5 ||
        (s.client && s.client != client)) { UnknownLocked(s); return; }
    const auto& m = *message;
    if (s.baseline_seen) {
      if (s.last_sequence == std::numeric_limits<uint64_t>::max() ||
          m.global_seq_num != s.last_sequence + 1) {
        UnknownLocked(s); return;
      }
    } else if (!IsPulse(s, m)) {
      // No task may exist before the first native self pulse. Other native
      // DUP operations are harmless but cannot establish the starting fence.
      if (m.event_type != ES_EVENT_TYPE_NOTIFY_DUP) UnknownLocked(s);
      return;
    }
    s.last_sequence = m.global_seq_num;
    if (IsPulse(s, m)) {
      s.baseline_seen = true;
      s.pulse_seen = s.pulse_number;
    }
    const Identity process = Id(m.process->audit_token);
    switch (m.event_type) {
      case ES_EVENT_TYPE_NOTIFY_FORK: {
        if (!m.event.fork.child) { UnknownLocked(s); return; }
        const auto child = Id(m.event.fork.child->audit_token);
        if (child.pid <= 0 || child == s.self || s.live.size() >= kLimit ||
            s.live.contains(child) ||
            (process != s.self && !s.live.contains(process))) {
          UnknownLocked(s); return;
        }
        Identity root = child;
        if (process != s.self) {
          auto inherited = s.lineage.find(process);
          if (inherited == s.lineage.end()) { UnknownLocked(s); return; }
          root = inherited->second;
        }
        if (!s.lineage.emplace(child, root).second) { UnknownLocked(s); return; }
        s.live.emplace(child, m.mach_time);
        if (process == s.self && !RecordRootLocked(s, child, m.mach_time)) {
          UnknownLocked(s); return;
        }
        ++s.epoch;
        break;
      }
      case ES_EVENT_TYPE_NOTIFY_EXEC: {
        if (!m.event.exec.target || process == s.self) {
          UnknownLocked(s); return;
        }
        const auto target = Id(m.event.exec.target->audit_token);
        auto previous = s.live.find(process);
        if (target.pid <= 0 || target.pid != process.pid ||
            (target != process && s.live.contains(target))) {
          UnknownLocked(s); return;
        }
        if (previous == s.live.end()) {
          // posix_spawn may first appear as EXEC. The kernel-supplied old/new
          // audit identities and parent audit identity establish this birth;
          // no PID census or renderer-supplied parent is used. The SDK places
          // this event after kernel exec but before the new image runs.
          const auto parent = Id(m.process->parent_audit_token);
          if (s.live.size() >= kLimit ||
              (parent != s.self && !s.live.contains(parent)) ||
              (parent == s.self && !RecordRootLocked(s, process, m.mach_time))) {
            UnknownLocked(s); return;
          }
          Identity root = process;
          if (parent != s.self) {
            auto inherited = s.lineage.find(parent);
            if (inherited == s.lineage.end()) { UnknownLocked(s); return; }
            root = inherited->second;
          }
          if (!s.lineage.emplace(target, root).second) { UnknownLocked(s); return; }
          s.live.emplace(target, m.mach_time);
        } else {
          auto inherited = s.lineage.find(process);
          if (inherited == s.lineage.end()) { UnknownLocked(s); return; }
          const Identity root = inherited->second;
          const uint64_t born = previous->second;
          s.lineage.erase(inherited);
          if (!s.lineage.emplace(target, root).second) { UnknownLocked(s); return; }
          s.live.erase(previous);
          s.live.emplace(target, born);
        }
        ++s.epoch;
        break;
      }
      case ES_EVENT_TYPE_NOTIFY_EXIT:
        if (process == s.self || s.live.erase(process) != 1 || s.lineage.erase(process) != 1) {
          UnknownLocked(s); return;
        }
        ++s.epoch;
        break;
      case ES_EVENT_TYPE_NOTIFY_DUP:
        break;
      default:
        UnknownLocked(s); return;
    }
    if (s.ready && QuiescentLocked(s)) ScheduleFenceLocked(s);
    s.changed.notify_all();
  } catch (...) {
    std::lock_guard<std::mutex> lock(s.mutex);
    UnknownLocked(s);
  }
}

// Called on a separate native queue, never within the ES handler. SDK explicitly
// forbids invoking es_sync_client from that handler.
void Fence(bool initial) noexcept {
  auto& s = State();
  uint64_t epoch = 0;
  uint64_t pulse = 0;
  es_client_t* client = nullptr;
  {
    std::lock_guard<std::mutex> lock(s.mutex);
    if (s.unknown || !s.client || (!initial && !QuiescentLocked(s))) {
      s.fence_scheduled = false; return;
    }
    client = s.client;
    epoch = s.epoch;
    pulse = ++s.pulse_number;
    s.pulse_started = mach_absolute_time();
    // Read-only native FD; no arguments, credentials or owner files involved.
    const int copy = dup(s.pulse_fd);
    if (copy < 0) { UnknownLocked(s); return; }
    close(copy);
  }
  if (__builtin_available(macOS 27.0, *)) {
    const auto submitted = es_sync_client(client, ^{
      std::vector<std::function<void()>> completions;
      try {
        {
          std::lock_guard<std::mutex> lock(s.mutex);
          s.fence_scheduled = false;
          if (s.unknown || s.client != client || s.pulse_seen != pulse) {
            UnknownLocked(s); return;
          }
          s.fenced_pulse = pulse;
          if (initial) {
            if (s.epoch || !s.live.empty() || !s.lineage.empty() || !s.cohorts.empty()) {
              UnknownLocked(s); return;
            }
            s.ready = true;
            s.closed = false;
          } else if (s.epoch == epoch && QuiescentLocked(s)) {
            for (const auto& c : s.cohorts) {
              if (!MatchBirthLocked(s, *c)) { UnknownLocked(s); return; }
            }
            // Every observed self birth must belong to exactly one actual
            // successful native spawn, including births buffered while another
            // reservation was still awaiting publication. A forward-only check
            // can silently omit an unrelated short-lived root.
            for (const auto& birth : s.roots) {
              size_t owners = 0;
              for (const auto& c : s.cohorts)
                if (!c->failed_before_child && !c->publication_pending &&
                    c->child == birth.id.pid && birth.time >= c->reserved_at &&
                    birth.time <= c->published_at) ++owners;
              if (owners != 1) { UnknownLocked(s); return; }
            }
            completions.reserve(s.cohorts.size());
            for (const auto& c : s.cohorts) {
              c->settled = true;
              completions.push_back(std::move(c->done));
            }
            s.cohorts.clear();
            s.roots.clear();
            if (s.closed) s.shutdown_fenced = true;
          } else if (QuiescentLocked(s)) {
            ScheduleFenceLocked(s);
          }
          s.changed.notify_all();
        }
        // Never invoke owner callbacks under the observer mutex or inside the
        // ES event handler. Each capability's completion is consumed once.
        for (auto& done : completions) if (done) done();
      } catch (...) {
        std::lock_guard<std::mutex> lock(s.mutex);
        UnknownLocked(s);
      }
    });
    if (submitted != ES_RETURN_SUCCESS) {
      std::lock_guard<std::mutex> lock(s.mutex); UnknownLocked(s);
    }
  } else {
    std::lock_guard<std::mutex> lock(s.mutex); UnknownLocked(s);
  }
}
void ScheduleFenceLocked(Observer& s) {
  if (s.fence_scheduled || (s.cohorts.empty() && !s.closed) ||
      (s.closed && s.shutdown_fenced)) return;
  s.fence_scheduled = true;
  dispatch_async(s.queue, ^{ Fence(false); });
}
}  // namespace

int InitializeAtFreshDaemonEntry() noexcept {
  if (!SameProcess()) return -1;
  if (__builtin_available(macOS 27.0, *)) {
    auto& s = State();
    try {
      {
        std::lock_guard<std::mutex> lock(s.mutex);
        if (s.initialized) return -1;
        s.initialized = true;
        audit_token_t token{};
        mach_msg_type_number_t count = TASK_AUDIT_TOKEN_COUNT;
        if (task_info(mach_task_self(), TASK_AUDIT_TOKEN,
                      reinterpret_cast<task_info_t>(&token), &count) != KERN_SUCCESS) {
          UnknownLocked(s); return -1;
        }
        s.self = Id(token);
        if (s.self.pid != getpid()) { UnknownLocked(s); return -1; }
        s.pulse_fd = open("/dev/null", O_RDONLY | O_CLOEXEC);
        if (s.pulse_fd < 0 || fstat(s.pulse_fd, &s.pulse_stat) != 0) {
          UnknownLocked(s); return -1;
        }
      }
      es_client_t* client = nullptr;
      const auto result = es_new_descendants_client(&client,
          ^(es_client_t* sender, const es_message_t* event) { Event(sender, event); });
      {
        std::lock_guard<std::mutex> lock(s.mutex);
        if (result != ES_NEW_CLIENT_RESULT_SUCCESS || !client) {
          UnknownLocked(s); return static_cast<int>(result) + 1;
        }
        s.client = client;
      }
      const es_event_type_t required[] = {ES_EVENT_TYPE_NOTIFY_FORK,
          ES_EVENT_TYPE_NOTIFY_EXEC, ES_EVENT_TYPE_NOTIFY_EXIT,
          ES_EVENT_TYPE_NOTIFY_DUP};
      if (es_unmute_all_paths(client) != ES_RETURN_SUCCESS ||
          es_unmute_all_target_paths(client) != ES_RETURN_SUCCESS ||
          es_subscribe(client, required, std::size(required)) != ES_RETURN_SUCCESS) {
        std::lock_guard<std::mutex> lock(s.mutex); UnknownLocked(s); return -1;
      }
      size_t count = 0;
      es_event_type_t* actual = nullptr;
      const auto inspected = es_subscriptions(client, &count, &actual);
      bool exact = inspected == ES_RETURN_SUCCESS && actual && count == std::size(required);
      if (exact) for (auto type : required)
        exact = exact && std::find(actual, actual + count, type) != actual + count;
      free(actual);
      if (!exact) { std::lock_guard<std::mutex> lock(s.mutex); UnknownLocked(s); return -1; }
      Fence(true);
      std::unique_lock<std::mutex> lock(s.mutex);
      if (!s.changed.wait_for(lock, std::chrono::seconds(2), [&] { return s.ready || s.unknown; }))
        UnknownLocked(s);
      return s.ready && !s.unknown ? 0 : -1;
    } catch (...) {
      std::lock_guard<std::mutex> lock(s.mutex); UnknownLocked(s); return -1;
    }
  }
  return -1;
}

Ticket Reserve(uint64_t owner, std::function<void()> done) noexcept {
  if (!SameProcess() || !owner || !done) return {};
  auto& s = State();
  try {
    std::lock_guard<std::mutex> lock(s.mutex);
    if (!s.ready || s.closed || s.unknown || s.cohorts.size() >= kLimit) return {};
    auto ticket = std::make_shared<Cohort>(owner, mach_absolute_time(), std::move(done));
    s.cohorts.push_back(ticket);
    ++s.epoch;
    return ticket;
  } catch (...) { std::lock_guard<std::mutex> lock(s.mutex); UnknownLocked(s); return {}; }
}
bool MaySpawn(const Ticket& c) noexcept {
  if (!SameProcess() || !c) return false;
  auto& s = State();
  std::lock_guard<std::mutex> lock(s.mutex);
  return s.ready && !s.closed && !s.unknown && c->publication_pending && !c->unknown;
}
void DidCreate(const Ticket& c, int64_t pid) noexcept {
  if (!SameProcess() || !c) return;
  auto& s = State(); std::lock_guard<std::mutex> lock(s.mutex);
  if (!c->publication_pending || pid <= 0 || pid > std::numeric_limits<pid_t>::max()) {
    c->unknown = true; UnknownLocked(s); return;
  }
  c->publication_pending = false;
  c->published_at = mach_absolute_time();
  c->child = static_cast<pid_t>(pid);
  ++s.epoch;
}
void DidFailBeforeChild(const Ticket& c) noexcept {
  if (!SameProcess() || !c) return;
  auto& s = State(); std::lock_guard<std::mutex> lock(s.mutex);
  if (!c->publication_pending) { c->unknown = true; UnknownLocked(s); return; }
  c->publication_pending = false;
  c->failed_before_child = true;
  ++s.epoch;
  ScheduleFenceLocked(s);
}
void DidObserveOriginalReap(const Ticket& c, bool matched) noexcept {
  if (!SameProcess() || !c) return;
  auto& s = State(); std::lock_guard<std::mutex> lock(s.mutex);
  if (c->publication_pending || c->failed_before_child || c->original_reaped || !matched) {
    c->unknown = true; UnknownLocked(s); return;
  }
  c->original_reaped = true;
  ++s.epoch;
  ScheduleFenceLocked(s);
}
Result Inspect(const Ticket& c) noexcept {
  if (!SameProcess() || !c) return Result::refused;
  auto& s = State(); std::lock_guard<std::mutex> lock(s.mutex);
  if (c->settled) return Result::settled;
  if (s.unknown || c->unknown) return Result::unknown;
  if (QuiescentLocked(s)) ScheduleFenceLocked(s);
  return Result::pending;
}
Ticket RetainActualClientCohort(const audit_token_t& kernel_peer) noexcept {
  if (!SameProcess()) return {};
  auto& s = State();
  try {
    std::lock_guard<std::mutex> lock(s.mutex);
    if (!s.initialized || !s.ready || s.closed || s.unknown) return {};
    const Identity client = Id(kernel_peer);
    if (client.pid <= 0 || client == s.self || !s.live.contains(client)) return {};
    auto lineage = s.lineage.find(client);
    if (lineage == s.lineage.end()) return {};
    const Birth* root = nullptr;
    for (const auto& birth : s.roots) {
      if (birth.id != lineage->second) continue;
      if (root) return {};  // Ambiguous native birth is never membership.
      root = &birth;
    }
    if (!root) return {};
    Ticket captured;
    for (const auto& cohort : s.cohorts) {
      // A publication still in flight may own this recorded birth. Observe
      // again later; do not infer absence or select another published owner.
      if (cohort->publication_pending && cohort->reserved_at <= root->time) return {};
      if (cohort->failed_before_child || cohort->publication_pending || cohort->unknown ||
          cohort->settled || cohort->child != root->id.pid ||
          root->time < cohort->reserved_at || root->time > cohort->published_at) continue;
      if (!MatchBirthLocked(s, *cohort) || captured) return {};
      captured = cohort;
    }
    // The real WorkerHost must additionally join this exact shared Ticket to
    // its retained ExecReservation/Owner and genuine immutable task grant.
    return captured;
  } catch (...) { return {}; }
}
Result InspectStream() noexcept {
  if (!SameProcess()) return Result::refused;
  auto& s = State(); std::lock_guard<std::mutex> lock(s.mutex);
  if (s.unknown) return Result::unknown;
  if (!s.initialized || !s.ready) return Result::refused;
  if (!s.cohorts.empty() || !s.live.empty() ||
      (s.closed && !s.shutdown_fenced)) {
    if (QuiescentLocked(s)) ScheduleFenceLocked(s);
    return Result::pending;
  }
  return Result::settled;
}
void CloseAdmission() noexcept {
  if (!SameProcess()) return;
  auto& s = State(); std::lock_guard<std::mutex> lock(s.mutex);
  if (!s.closed) { s.closed = true; ++s.epoch; }
  if (QuiescentLocked(s)) ScheduleFenceLocked(s);
}
}  // namespace aux::descendants
