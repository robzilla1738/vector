#include "base/process/mac/aux_browser_descendant_engine.h"
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

namespace aux::browser_descendants {
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
struct Live { uint64_t born = 0; Identity root; };
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
  uint32_t family = 0;
  uint64_t transferred_generation = 0;
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
  bool browser_scope_fenced = false;
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
      "dev.aux.browser-descendant-fence", DISPATCH_QUEUE_SERIAL);
  std::map<Identity, Live> live;
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

bool QuiescentLocked(const Observer& s);
bool CohortQuietLocked(const Observer& s, const Cohort& c);
bool FenceUsefulLocked(const Observer& s);
bool BrowserScopeQuietLocked(const Observer& s);
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
bool CohortQuietLocked(const Observer& s, const Cohort& c) {
  if (s.unknown || !s.baseline_seen || c.unknown || c.publication_pending ||
      (!c.failed_before_child && !c.original_reaped) || !MatchBirthLocked(s,c)) return false;
  if (c.failed_before_child) return true;
  for (const auto& birth : s.roots) if (birth.id.pid == c.child &&
      birth.time >= c.reserved_at && birth.time <= c.published_at)
    for (const auto& [id,live] : s.live) if (live.root == birth.id) return false;
  return true;
}
bool QuiescentLocked(const Observer& s) {
  if (s.unknown || !s.baseline_seen || !s.live.empty()) return false;
  return std::all_of(s.cohorts.begin(),s.cohorts.end(),[&](const Ticket& c){return CohortQuietLocked(s,*c);});
}
bool BrowserScopeQuietLocked(const Observer& s) {
  if (s.unknown || !s.closed || !s.baseline_seen) return false;
  for (const auto& c : s.cohorts) if (c->family != 3 || !c->transferred_generation ||
      c->unknown || c->publication_pending || c->failed_before_child) return false;
  for (const auto& birth : s.roots) {
    size_t owners = 0;
    for (const auto& c : s.cohorts) if (c->family == 3 && c->transferred_generation &&
        c->child == birth.id.pid && birth.time >= c->reserved_at && birth.time <= c->published_at) ++owners;
    if (owners != 1) return false;
  }
  return true;
}
bool FenceUsefulLocked(const Observer& s) {
  return !s.unknown && s.baseline_seen && (QuiescentLocked(s) ||
      (BrowserScopeQuietLocked(s) && !s.browser_scope_fenced) ||
      std::any_of(s.cohorts.begin(),s.cohorts.end(),[&](const Ticket& c){return CohortQuietLocked(s,*c);}));
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
        s.live.emplace(child, Live{m.mach_time, process == s.self ? child : s.live.at(process).root});
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
          s.live.emplace(target, Live{m.mach_time, parent == s.self ? process : s.live.at(parent).root});
        } else {
          const Live born = previous->second;
          s.live.erase(previous);
          s.live.emplace(target, born);
        }
        ++s.epoch;
        break;
      }
      case ES_EVENT_TYPE_NOTIFY_EXIT:
        if (process == s.self || s.live.erase(process) != 1) {
          UnknownLocked(s); return;
        }
        ++s.epoch;
        break;
      case ES_EVENT_TYPE_NOTIFY_DUP:
        break;
      default:
        UnknownLocked(s); return;
    }
    if (s.ready && FenceUsefulLocked(s)) ScheduleFenceLocked(s);
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
    if (s.unknown || !s.client || (!initial && !FenceUsefulLocked(s))) {
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
            if (s.epoch || !s.live.empty() || !s.cohorts.empty()) {
              UnknownLocked(s); return;
            }
            s.ready = true;
            s.closed = false;
          } else if (s.epoch == epoch && FenceUsefulLocked(s)) {
            const bool published = std::none_of(s.cohorts.begin(),s.cohorts.end(),
                [](const Ticket& c){return c->publication_pending;});
            if (published) for (const auto& birth : s.roots) {
              size_t owners = 0;
              for (const auto& c : s.cohorts)
                if (!c->failed_before_child && c->child == birth.id.pid &&
                    birth.time >= c->reserved_at && birth.time <= c->published_at) ++owners;
              if (owners != 1) { UnknownLocked(s); return; }
            }
            completions.reserve(s.cohorts.size());
            for (const auto& c : s.cohorts) if (CohortQuietLocked(s,*c)) {
              c->settled = true;
              completions.push_back(std::move(c->done));
            }
            // Each completed family is independent of other live browser
            // families. Its last descendant has exited at this real ES fence.
            std::erase_if(s.roots,[&](const Birth& birth){return std::any_of(
                s.cohorts.begin(),s.cohorts.end(),[&](const Ticket& c){return
                c->settled && !c->failed_before_child && c->child == birth.id.pid &&
                birth.time >= c->reserved_at && birth.time <= c->published_at;});});
            std::erase_if(s.cohorts,[](const Ticket& c){return c->settled;});
            if (s.closed && QuiescentLocked(s)) s.shutdown_fenced = true;
            if (BrowserScopeQuietLocked(s)) s.browser_scope_fenced = true;
          } else if (FenceUsefulLocked(s)) {
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

int InitializeAtFreshBrowserEntry() noexcept {
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

Ticket Reserve(uint32_t family, std::function<void()> done) noexcept {
  if (!SameProcess() || family < 1 || family > 4 || !done) return {};
  auto& s = State();
  try {
    std::lock_guard<std::mutex> lock(s.mutex);
    if (!s.ready || s.closed || s.unknown || s.cohorts.size() >= kLimit) return {};
    const uint64_t bootstrap = (static_cast<uint64_t>(static_cast<uint32_t>(s.self.pid)) << 32) | s.self.version;
    auto ticket = std::make_shared<Cohort>(bootstrap, mach_absolute_time(), std::move(done));
    ticket->family = family;
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
  if (FenceUsefulLocked(s)) ScheduleFenceLocked(s);
  return Result::pending;
}
Result InspectStream() noexcept {
  if (!SameProcess()) return Result::refused;
  auto& s = State(); std::lock_guard<std::mutex> lock(s.mutex);
  if (s.unknown) return Result::unknown;
  if (!s.initialized || !s.ready) return Result::refused;
  if (!s.cohorts.empty() || !s.live.empty() ||
      (s.closed && !s.shutdown_fenced)) {
    if (FenceUsefulLocked(s)) ScheduleFenceLocked(s);
    return Result::pending;
  }
  return Result::settled;
}
bool TransferDaemon(const Ticket& c, uint64_t generation) noexcept {
  if (!SameProcess() || !c || !generation) return false;
  auto& s = State(); std::lock_guard<std::mutex> lock(s.mutex);
  if (!s.ready || s.closed || s.unknown || c->family != 3 || c->publication_pending ||
      c->failed_before_child || c->original_reaped || c->unknown || c->settled ||
      (c->transferred_generation && c->transferred_generation != generation)) return false;
  for (const auto& other : s.cohorts)
    if (other != c && other->transferred_generation) return false;
  c->transferred_generation = generation; return true;
}
Result InspectBrowserScope(uint64_t generation) noexcept {
  if (!SameProcess() || !generation) return Result::refused;
  auto& s = State(); std::lock_guard<std::mutex> lock(s.mutex);
  if (s.unknown) return Result::unknown;
  if (!s.ready || !s.closed || !s.browser_scope_fenced) {
    if (FenceUsefulLocked(s)) ScheduleFenceLocked(s);
    return Result::pending;
  }
  // A transferred daemon is owned by the authenticated CLEAN/ACK + original
  // reaper chain. It remains present for the final all-family native fence.
  for (const auto& c : s.cohorts) {
    if (c->family == 3 && c->transferred_generation == generation &&
        !c->unknown && !c->publication_pending && !c->failed_before_child) continue;
    return Result::pending;
  }
  // Any buffered root lacking a transferred owner is unresolved even if short
  // lived. Do not exclude arbitrary descendants by process name or executable.
  for (const auto& birth : s.roots) {
    size_t owners = 0;
    for (const auto& c : s.cohorts) if (c->family == 3 &&
        c->transferred_generation == generation && c->child == birth.id.pid &&
        birth.time >= c->reserved_at && birth.time <= c->published_at) ++owners;
    if (owners != 1) return Result::unknown;
  }
  return Result::settled;
}
void CloseAdmission() noexcept {
  if (!SameProcess()) return;
  auto& s = State(); std::lock_guard<std::mutex> lock(s.mutex);
  if (!s.closed) { s.closed = true; ++s.epoch; }
  if (FenceUsefulLocked(s)) ScheduleFenceLocked(s);
}
}  // namespace aux::browser_descendants
