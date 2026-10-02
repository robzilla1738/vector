// Copyright 2026 The Aux Authors
#include "chrome/browser/ui/aux/native_startup_admission_waiter.h"
#if BUILDFLAG(IS_MAC) && BUILDFLAG(AUX_ALLOW_REMOTE_DEBUGGING_FOR_TESTS)
#include <cerrno>
#include <fcntl.h>
#include <sys/stat.h>
#include <unistd.h>
#include <memory>
#include <utility>
#include "base/command_line.h"
#include "base/files/file_path_watcher.h"
#include "base/files/scoped_file.h"
#include "base/functional/bind.h"
#include "base/task/bind_post_task.h"
#include "base/task/thread_pool.h"
#include "chrome/browser/ui/aux/journey_fixture_path.h"
#include "chrome/browser/ui/aux/native_performance_observer.h"
#include "content/public/browser/browser_task_traits.h"
#include "content/public/browser/browser_thread.h"
namespace aux {
class NativeStartupAdmissionWaiter::State {
 public:
  State();
  ~State();
  void Wait(Reply reply) {
    DCHECK_CURRENTLY_ON(content::BrowserThread::IO);
    if (reply.is_null()) return;
    if (used_ || !NativeStartupObservationEnabled()) { std::move(reply).Run(std::nullopt); return; }
    used_ = true; reply_ = std::move(reply);
    const base::FilePath profile(base::CommandLine::ForCurrentProcess()->GetSwitchValueASCII("user-data-dir"));
    root_path_ = profile.DirName();
    if (profile.BaseName().value() != "profile" || !OwnedJourneyFixtureRoot(root_path_.value())) { Finish(std::nullopt); return; }
    parent_.reset(open("/private/tmp", O_RDONLY | O_DIRECTORY | O_NOFOLLOW | O_CLOEXEC));
    root_.reset(parent_.is_valid() ? openat(parent_.get(), root_path_.BaseName().value().c_str(), O_RDONLY | O_DIRECTORY | O_NOFOLLOW | O_CLOEXEC) : -1);
    profile_.reset(root_.is_valid() ? openat(root_.get(), "profile", O_RDONLY | O_DIRECTORY | O_NOFOLLOW | O_CLOEXEC) : -1);
    metadata_.reset(root_.is_valid() ? openat(root_.get(), "startup-build.json", O_RDONLY | O_NOFOLLOW | O_CLOEXEC) : -1);
    if (!parent_.is_valid() || !root_.is_valid() || !profile_.is_valid() || !metadata_.is_valid() ||
        fstat(root_.get(), &root_identity_) || fstat(profile_.get(), &profile_identity_) ||
        fstat(metadata_.get(), &metadata_identity_) || !Stable()) { Finish(std::nullopt); return; }
    watcher_ = std::make_unique<base::FilePathWatcher>();
    // Install before the initial read: atomic helper publication cannot fall
    // into a read-then-watch gap. Only one fixed filename is watched.
    if (!watcher_->Watch(root_path_.AppendASCII("startup-launch-receipt.json"),
        base::FilePathWatcher::Type::kNonRecursive,
        base::BindRepeating(&State::Changed, weak_factory_.GetWeakPtr()))) { Finish(std::nullopt); return; }
    Read();
  }
 private:
  bool Stable() const {
    auto directory = [](const struct stat& value) {
      return S_ISDIR(value.st_mode) && value.st_uid == geteuid() && (value.st_mode & 0777) == 0700;
    };
    struct stat root{}, root_path{}, profile{}, profile_path{}, metadata{}, metadata_path{};
    if (!NativeStartupObservationEnabled() || fstat(root_.get(), &root) ||
        fstatat(parent_.get(), root_path_.BaseName().value().c_str(), &root_path, AT_SYMLINK_NOFOLLOW) ||
        fstat(profile_.get(), &profile) || fstatat(root_.get(), "profile", &profile_path, AT_SYMLINK_NOFOLLOW) ||
        fstat(metadata_.get(), &metadata) || fstatat(root_.get(), "startup-build.json", &metadata_path, AT_SYMLINK_NOFOLLOW)) return false;
    auto same_directory = [&](const struct stat& a, const struct stat& b) {
      return directory(a) && directory(b) && a.st_dev == b.st_dev && a.st_ino == b.st_ino;
    };
    auto same_file = [](const struct stat& a, const struct stat& b) {
      return S_ISREG(a.st_mode) && a.st_uid == geteuid() && (a.st_mode & 0777) == 0600 && a.st_nlink == 1 &&
          a.st_size > 0 && a.st_size <= 2048 && a.st_dev == b.st_dev && a.st_ino == b.st_ino &&
          a.st_mode == b.st_mode && a.st_uid == b.st_uid && a.st_nlink == b.st_nlink && a.st_size == b.st_size &&
          a.st_mtimespec.tv_sec == b.st_mtimespec.tv_sec && a.st_mtimespec.tv_nsec == b.st_mtimespec.tv_nsec &&
          a.st_ctimespec.tv_sec == b.st_ctimespec.tv_sec && a.st_ctimespec.tv_nsec == b.st_ctimespec.tv_nsec;
    };
    return same_directory(root, root_identity_) && same_directory(root_path, root_identity_) &&
        same_directory(profile, profile_identity_) && same_directory(profile_path, profile_identity_) &&
        same_file(metadata, metadata_identity_) && same_file(metadata_path, metadata_identity_);
  }
  void Changed(const base::FilePath&, bool error) {
    if (!reply_) return;
    if (error || !Stable()) { Finish(std::nullopt); return; }
    if (reading_) { dirty_ = true; return; }
    Read();
  }
  void Read() {
    if (!reply_ || reading_) return;
    if (!Stable()) { Finish(std::nullopt); return; }
    reading_ = true;
    base::ThreadPool::PostTaskAndReplyWithResult(FROM_HERE, {base::MayBlock(), base::TaskPriority::USER_BLOCKING},
        base::BindOnce(&ReadNativeStartupLaunchReceipt), base::BindOnce(&State::ReadDone, weak_factory_.GetWeakPtr()));
  }
  void ReadDone(std::optional<NativeStartupLaunchReceipt> receipt) {
    reading_ = false;
    if (!reply_) return;
    if (!Stable() || (receipt && (!receipt->lease || !receipt->lease->MatchesInitialFiles(
        root_identity_, profile_identity_, metadata_identity_)))) { Finish(std::nullopt); return; }
    if (receipt) { Finish(std::move(receipt)); return; }
    struct stat present{};
    // A present invalid/unsafe receipt is a refusal, not a retry-until-green.
    if (fstatat(root_.get(), "startup-launch-receipt.json", &present, AT_SYMLINK_NOFOLLOW) == 0 || errno != ENOENT) {
      Finish(std::nullopt); return;
    }
    if (std::exchange(dirty_, false)) Read();
  }
  void Finish(std::optional<NativeStartupLaunchReceipt> receipt) {
    weak_factory_.InvalidateWeakPtrs(); watcher_.reset();
    if (reply_) std::move(reply_).Run(std::move(receipt));
  }
  Reply reply_;
  bool used_ = false, reading_ = false, dirty_ = false;
  base::FilePath root_path_;
  base::ScopedFD parent_, root_, profile_, metadata_;
  struct stat root_identity_{}, profile_identity_{}, metadata_identity_{};
  std::unique_ptr<base::FilePathWatcher> watcher_;
  base::WeakPtrFactory<State> weak_factory_{this};
};
NativeStartupAdmissionWaiter::State::State() = default;
NativeStartupAdmissionWaiter::State::~State() { weak_factory_.InvalidateWeakPtrs(); }
NativeStartupAdmissionWaiter::NativeStartupAdmissionWaiter() : state_(content::GetIOThreadTaskRunner({})) {}
NativeStartupAdmissionWaiter::~NativeStartupAdmissionWaiter() {
  weak_factory_.InvalidateWeakPtrs(); timeout_.Stop(); state_.Reset();
}
void NativeStartupAdmissionWaiter::Wait(Reply reply) {
  if (reply.is_null()) return;
  if (used_ || !NativeStartupObservationEnabled()) { std::move(reply).Run(std::nullopt); return; }
  used_ = true; reply_ = std::move(reply);
  timeout_.Start(FROM_HERE, base::Seconds(5), base::BindOnce(&NativeStartupAdmissionWaiter::Cancel, weak_factory_.GetWeakPtr()));
  state_.AsyncCall(&State::Wait).WithArgs(base::BindPostTaskToCurrentDefault(
      base::BindOnce(&NativeStartupAdmissionWaiter::Received, weak_factory_.GetWeakPtr())));
}
void NativeStartupAdmissionWaiter::Received(std::optional<NativeStartupLaunchReceipt> receipt) {
  if (!reply_) return;
  timeout_.Stop(); weak_factory_.InvalidateWeakPtrs(); state_.Reset();
  std::move(reply_).Run(std::move(receipt));
}
void NativeStartupAdmissionWaiter::Cancel() { Received(std::nullopt); }
}  // namespace aux
#endif
