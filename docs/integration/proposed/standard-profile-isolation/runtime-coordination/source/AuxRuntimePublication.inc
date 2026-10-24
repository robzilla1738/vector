// Include after the immutable cache inspector and pin inventory in WorkerHost.
// Standard cooperative isolation only: nonparticipating same-UID code is outside
// this contract. Every participating mutator must retain a Lease on the task FD.
namespace aux_runtime_publication {
using aux_runtime_cache::Fd;
using aux_runtime_cache::Pin;
constexpr char kDestination[] = "runtime";
constexpr char kSeedPrefix[] = ".aux-runtime-seed-";
constexpr char kNpmrc[] = "fund=false\naudit=false\nupdate-notifier=false\n";
constexpr char kBundledTextRoot[] = "/Users/rcourson/Documents/Vibe/web/out/provided-candidate-final-local-completion-20261023/Aux.app/Contents/Resources/aux/agent-runtime";
enum class Status { kRefused, kCancelled, kRetained, kPublished, kUnknown };
struct Outcome {
  Status status = Status::kRefused;
  bool renamed = false;
  bool cleanup_unknown = false;
  size_t relocated = 0;
};
// The task-directory flock is the admission gate; the fixed private use-lock
// inode is never unlinked by participating code. Independent open descriptions
// also exclude two workers in the same process (dup is NOT enough).
enum class Mode { kSharedUse, kExclusiveMutation };
struct Lease {
  Fd task, use_lock, stage;
  std::string stage_name;
  struct stat task_identity{}, stage_identity{};
  bool locked = false;
  bool admission_locked = false;
  Mode mode = Mode::kExclusiveMutation;
  bool stage_created = false;
  bool renamed = false;
  bool mutators_closed = false;
  bool commit_uncertain = false;
  Lease() = default;
  Lease(const Lease&) = delete;
  Lease& operator=(const Lease&) = delete;
  ~Lease() {
    if (locked) flock(use_lock.fd, LOCK_UN);
    if (admission_locked) flock(task.fd, LOCK_UN);
  }
  bool Acquire(int authenticated_task, const std::function<bool()>& current,
               Mode requested = Mode::kExclusiveMutation, unsigned maximum_attempts = 3000) {
    mode = requested;
    task.fd = openat(authenticated_task, ".", aux_runtime_cache::kRead | O_DIRECTORY);
    struct stat original{};
    if (task.fd < 0 || fstat(task.fd, &task_identity) || fstat(authenticated_task, &original) ||
        !S_ISDIR(task_identity.st_mode) || !aux_runtime_cache::Private(task_identity) ||
        (task_identity.st_mode & 07777) != 0700 ||
        task_identity.st_dev != original.st_dev || task_identity.st_ino != original.st_ino) return false;
    auto lock = [&](int fd, int operation) {
      // Waiting remains native pending work. Admission closure cancels waiting;
      // neither timeout nor cancellation releases another holder's native job.
      for (unsigned attempt = 0; attempt < maximum_attempts && current(); ++attempt) {
        if (!flock(fd, operation | LOCK_NB)) return true;
        if (errno != EWOULDBLOCK && errno != EAGAIN && errno != EINTR) return false;
        struct timespec delay{0, 10000000}; nanosleep(&delay, nullptr);
      }
      return false;
    };
    if (!lock(task.fd, LOCK_EX)) return false;
    admission_locked = true;
    // Never unlink this coordination inode, including after failure. Every
    // cooperating creator/installer/use holder opens the same fixed task leaf.
    bool created = false;
    use_lock.fd = openat(task.fd, ".aux-runtime-use.lock", O_RDWR | O_CREAT | O_EXCL | O_CLOEXEC | O_NOFOLLOW, 0600);
    if (use_lock.fd >= 0) created = true;
    else if (errno == EEXIST)
      use_lock.fd = openat(task.fd, ".aux-runtime-use.lock", O_RDWR | O_CLOEXEC | O_NOFOLLOW | O_NONBLOCK);
    struct stat held{}, named{};
    if (use_lock.fd < 0 || (created && (fchmod(use_lock.fd, 0600) || fsync(use_lock.fd) || fsync(task.fd))) ||
        fstat(use_lock.fd, &held) || !S_ISREG(held.st_mode) || held.st_nlink != 1 || held.st_size != 0 ||
        held.st_uid != geteuid() || (held.st_mode & 07777) != 0600 ||
        fstatat(task.fd, ".aux-runtime-use.lock", &named, AT_SYMLINK_NOFOLLOW) ||
        held.st_dev != named.st_dev || held.st_ino != named.st_ino ||
        !lock(use_lock.fd, mode == Mode::kSharedUse ? LOCK_SH : LOCK_EX)) return false;
    locked = true;
    if (mode == Mode::kSharedUse) {
      if (flock(task.fd, LOCK_UN)) return false;
      admission_locked = false;
    }
    return current();
  }
  bool SameStage() const {
    struct stat named{}, held{};
    return stage_created && !renamed && stage.fd >= 0 &&
      fstat(stage.fd, &held) == 0 && fstatat(task.fd, stage_name.c_str(), &named, AT_SYMLINK_NOFOLLOW) == 0 &&
      S_ISDIR(named.st_mode) && named.st_uid == geteuid() &&
      held.st_dev == stage_identity.st_dev && held.st_ino == stage_identity.st_ino &&
      named.st_dev == held.st_dev && named.st_ino == held.st_ino;
  }
  bool SamePublished() const {
    struct stat named{}, held{};
    return renamed && stage.fd >= 0 && fstat(stage.fd, &held) == 0 &&
      fstatat(task.fd, kDestination, &named, AT_SYMLINK_NOFOLLOW) == 0 &&
      S_ISDIR(named.st_mode) && named.st_dev == stage_identity.st_dev &&
      named.st_ino == stage_identity.st_ino && held.st_dev == named.st_dev && held.st_ino == named.st_ino;
  }
  bool CreateStage() {
    if (!locked || mode != Mode::kExclusiveMutation || !admission_locked || mutators_closed || stage_created) return false;
    // Name is generated natively and never returned to JS. Each mkdir is EXCL.
    for (unsigned attempt = 0; attempt < 8; ++attempt) {
      std::array<unsigned char, 16> random{}; arc4random_buf(random.data(), random.size());
      stage_name = kSeedPrefix;
      constexpr char hex[] = "0123456789abcdef";
      for (auto value : random) { stage_name += hex[value >> 4]; stage_name += hex[value & 15]; }
      if (mkdirat(task.fd, stage_name.c_str(), 0700)) { if (errno == EEXIST) continue; return false; }
      stage_created = true;
      stage.fd = openat(task.fd, stage_name.c_str(), aux_runtime_cache::kRead | O_DIRECTORY);
      return stage.fd >= 0 && fstat(stage.fd, &stage_identity) == 0 && SameStage();
    }
    return false;
  }
};
bool WriteAll(int fd, const char* bytes, size_t size, const std::function<bool()>& current) {
  while (size) {
    if (!current()) return false;
    ssize_t written = write(fd, bytes, size);
    if (written < 0 && errno == EINTR) continue;
    if (written <= 0) return false;
    bytes += written; size -= static_cast<size_t>(written);
  }
  return true;
}
bool Relocate(std::string* text, const Pin& pin, const std::string& runtime) {
  for (size_t i = 0; i < pin.anchor_count; ++i) {
    const auto& a = pin.anchors[i];
    const std::string find(a.find), replacement = a.runtime_root ? runtime : a.replacement;
    if (find.empty()) return false;
    size_t count = 0, offset = 0;
    while ((offset = text->find(find, offset)) != std::string::npos) { ++count; offset += find.size(); }
    if (count != a.count) return false;
    offset = 0;
    while ((offset = text->find(find, offset)) != std::string::npos) {
      text->replace(offset, find.size(), replacement); offset += replacement.size();
    }
  }
  return true;
}
bool CopyPinned(int source, int destination, const Pin& pin,
                const std::string& runtime, const std::function<bool()>& current) {
  Fd source_parent(aux_runtime_cache::Parent(source, pin.path));
  Fd destination_parent(aux_runtime_cache::Parent(destination, pin.path));
  if (source_parent.fd < 0 || destination_parent.fd < 0) return false;
  const char* name = aux_runtime_cache::Leaf(pin.path);
  Fd output(openat(destination_parent.fd, name, O_WRONLY | O_CREAT | O_EXCL | O_CLOEXEC | O_NOFOLLOW, 0600));
  if (output.fd < 0) return false;
  if (pin.anchor_count) {
    uint64_t maximum = pin.size;
    for (size_t i = 0; i < pin.anchor_count; ++i) {
      const auto& a = pin.anchors[i]; const size_t width = a.runtime_root ? strlen(kBundledTextRoot) : strlen(a.replacement);
      if (width > strlen(a.find)) maximum += (width - strlen(a.find)) * a.count;
    }
    auto input = aux_runtime_cache::File(source_parent.fd, name, maximum, true, current);
    if (!input.ok || input.oversize ||
        !aux_runtime_cache::ReverseText(&input.text, pin, kBundledTextRoot) ||
        input.text.size() != pin.size || aux_runtime_cache::Hash(input.text) != pin.sha256 ||
        !Relocate(&input.text, pin, runtime) || !WriteAll(output.fd, input.text.data(), input.text.size(), current)) return false;
  } else {
    Fd input(openat(source_parent.fd, name, aux_runtime_cache::kRead));
    struct stat before{}, after{};
    if (input.fd < 0 || fstat(input.fd, &before) || !S_ISREG(before.st_mode) ||
        !aux_runtime_cache::Private(before) || before.st_nlink != 1 || before.st_size < 0 ||
        static_cast<uint64_t>(before.st_size) != pin.size) return false;
    CC_SHA256_CTX hash; CC_SHA256_Init(&hash);
    std::array<char, 65536> buffer{}; uint64_t total = 0;
    for (;;) {
      if (!current()) return false;
      ssize_t size = read(input.fd, buffer.data(), buffer.size());
      if (size < 0 && errno == EINTR) continue;
      if (size < 0 || static_cast<uint64_t>(size) > pin.size - total) return false;
      if (!size) break;
      total += size; CC_SHA256_Update(&hash, buffer.data(), static_cast<CC_LONG>(size));
      if (!WriteAll(output.fd, buffer.data(), size, current)) return false;
    }
    std::array<unsigned char, CC_SHA256_DIGEST_LENGTH> digest{}; CC_SHA256_Final(digest.data(), &hash);
    constexpr char hex[] = "0123456789abcdef"; std::string actual;
    for (auto value : digest) { actual += hex[value >> 4]; actual += hex[value & 15]; }
    if (total != pin.size || actual != pin.sha256 || fstat(input.fd, &after) ||
        !aux_runtime_cache::Same(before, after)) return false;
  }
  // Creation/copy/chmod and physical flush all occur under the same native lease.
  return current() && fchmod(output.fd, pin.mode) == 0 && fsync(output.fd) == 0;
}
bool SimpleFile(int root, const char* name, const char* bytes,
                const std::function<bool()>& current) {
  Fd file(openat(root, name, O_WRONLY | O_CREAT | O_EXCL | O_CLOEXEC | O_NOFOLLOW, 0600));
  return file.fd >= 0 && WriteAll(file.fd, bytes, strlen(bytes), current) &&
         fchmod(file.fd, 0600) == 0 && fsync(file.fd) == 0;
}
// Enumerate without following links. Used for exact final namespace verification
// and native-only cleanup. No caller callback/Promise can create another writer.
bool Walk(int root, const std::string& prefix, size_t* count, bool remove,
          const std::unordered_map<std::string, char>& expected) {
  if (prefix.size() > 4096 || *count > std::size(kAuxRuntimePins) + 2) return false;
  Fd scan(openat(root, ".", aux_runtime_cache::kRead | O_DIRECTORY));
  if (scan.fd < 0) return false;
  DIR* raw = fdopendir(scan.fd); if (!raw) return false; scan.release();
  const std::unique_ptr<DIR, int(*)(DIR*)> directory(raw, closedir);
  errno = 0;
  while (auto* entry = readdir(raw)) {
    const std::string name(entry->d_name);
    if (name == "." || name == "..") { errno = 0; continue; }
    if (++*count > std::size(kAuxRuntimePins) + 2) return false;
    const auto full = prefix + name;
    struct stat st{}; if (fstatat(root, name.c_str(), &st, AT_SYMLINK_NOFOLLOW)) return false;
    if (!remove) {
      auto found = expected.find(full);
      if (found == expected.end() ||
          (found->second == 'd' && !S_ISDIR(st.st_mode)) ||
          (found->second == 'f' && !S_ISREG(st.st_mode)) ||
          (found->second == 'l' && !S_ISLNK(st.st_mode))) return false;
    }
    if (S_ISDIR(st.st_mode)) {
      Fd child(openat(root, name.c_str(), aux_runtime_cache::kRead | O_DIRECTORY));
      struct stat held{}, named{};
      if (child.fd < 0 || fstat(child.fd, &held) || held.st_dev != st.st_dev || held.st_ino != st.st_ino ||
          !Walk(child.fd, full + "/", count, remove, expected)) return false;
      if (remove) {
        if (fstatat(root, name.c_str(), &named, AT_SYMLINK_NOFOLLOW) ||
            named.st_dev != held.st_dev || named.st_ino != held.st_ino ||
            unlinkat(root, name.c_str(), AT_REMOVEDIR)) return false;
      } else if (fsync(child.fd)) return false;
    } else if (remove && unlinkat(root, name.c_str(), 0)) return false;
    errno = 0;
  }
  return errno == 0;
}
bool Cleanup(Lease& lease) {
  if (!lease.stage_created || lease.renamed || lease.commit_uncertain) return true;
  if (!lease.locked || !lease.SameStage()) return false;
  size_t count = 0; const std::unordered_map<std::string, char> unused;
  if (!Walk(lease.stage.fd, "", &count, true, unused) || !lease.SameStage() ||
      unlinkat(lease.task.fd, lease.stage_name.c_str(), AT_REMOVEDIR) || fsync(lease.task.fd)) return false;
  lease.stage_created = false; return true;
}
void PopulateAndPublish(Lease& lease, int distribution, const std::string& runtime,
                        const std::function<bool()>& current,
                        const std::function<bool(const std::function<void()>&)>& admitted_commit,
                        Outcome& outcome) {
  struct stat existing{};
  if (fstatat(lease.task.fd, kDestination, &existing, AT_SYMLINK_NOFOLLOW) == 0) {
    outcome.status = S_ISDIR(existing.st_mode) && aux_runtime_cache::Private(existing)
      ? Status::kRetained : Status::kRefused;
    return; // Existing cache is never overwritten, cleaned or repaired here.
  }
  if (errno != ENOENT || !current() || !lease.CreateStage()) return;
  std::unordered_map<std::string, char> expected;
  std::vector<const Pin*> directories;
  for (const auto& pin : kAuxRuntimePins) {
    if (!expected.emplace(pin.path, pin.type).second) return;
    if (pin.type == 'd') directories.push_back(&pin);
  }
  std::sort(directories.begin(), directories.end(), [](const Pin* a, const Pin* b) { return strlen(a->path) < strlen(b->path); });
  for (const auto* pin : directories) {
    if (!current()) return;
    Fd parent(aux_runtime_cache::Parent(lease.stage.fd, pin->path));
    if (parent.fd < 0 || mkdirat(parent.fd, aux_runtime_cache::Leaf(pin->path), pin->mode)) return;
    Fd created(openat(parent.fd, aux_runtime_cache::Leaf(pin->path), aux_runtime_cache::kRead | O_DIRECTORY));
    if (created.fd < 0 || fchmod(created.fd, pin->mode)) return;
  }
  for (const auto& pin : kAuxRuntimePins) {
    if (!current()) return;
    if (pin.type == 'f') {
      if (!CopyPinned(distribution, lease.stage.fd, pin, runtime, current)) return;
      if (pin.anchor_count) ++outcome.relocated;
    } else if (pin.type == 'l') {
      Fd source_parent(aux_runtime_cache::Parent(distribution, pin.path));
      Fd target_parent(aux_runtime_cache::Parent(lease.stage.fd, pin.path));
      std::array<char, 4096> target{};
      if (source_parent.fd < 0 || target_parent.fd < 0) return;
      ssize_t size = readlinkat(source_parent.fd, aux_runtime_cache::Leaf(pin.path), target.data(), target.size());
      if (size < 0 || static_cast<size_t>(size) != strlen(pin.target) || pin.target[0] == '/' ||
          memcmp(target.data(), pin.target, size) || symlinkat(pin.target, target_parent.fd, aux_runtime_cache::Leaf(pin.path))) return;
    }
  }
  if (!current() || mkdirat(lease.stage.fd, "tmp", 0700) || !SimpleFile(lease.stage.fd, ".npmrc", kNpmrc, current)) return;
  expected.emplace("tmp", 'd'); expected.emplace(".npmrc", 'f');
  lease.mutators_closed = true;
  // The single worker has returned from every native mutation; no async writes,
  // shared JS handles or child copy processes exist to outlive this boundary.
  auto verified = aux_runtime_cache::Inspect(lease.stage.fd, runtime, kAuxRuntimePins,
      std::size(kAuxRuntimePins), kAuxRuntimeSourceVersion, current);
  size_t count = 0;
  if (verified.status != aux_runtime_cache::Status::kMatchingSeed ||
      verified.checked != std::size(kAuxRuntimePins) ||
      !Walk(lease.stage.fd, "", &count, false, expected) || count != expected.size() ||
      fsync(lease.stage.fd) || !current() || !lease.SameStage()) return;
  // Exactly one exclusive whole-tree commit. No per-child publication, ordinary
  // rename fallback, destination removal or post-commit rollback is allowed.
  int rename_error = 0;
  if (!admitted_commit([&] {
    if (renameatx_np(lease.task.fd, lease.stage_name.c_str(), lease.task.fd, kDestination, RENAME_EXCL)) {
      rename_error = errno; return;
    }
    lease.renamed = true; outcome.renamed = true; outcome.status = Status::kUnknown;
  })) { outcome.status = Status::kCancelled; return; }
  if (rename_error) {
    if (rename_error == EEXIST) outcome.status = Status::kRetained;
    else {
      // A syscall error is not blanket proof that publication did not happen.
      // Keep both names untouched and require reconciliation of uncertain I/O.
      lease.commit_uncertain = true; outcome.status = Status::kUnknown;
    }
    return;
  }
  if (fsync(lease.task.fd) == 0 && current() && lease.SamePublished()) outcome.status = Status::kPublished;
}
} // namespace aux_runtime_publication
