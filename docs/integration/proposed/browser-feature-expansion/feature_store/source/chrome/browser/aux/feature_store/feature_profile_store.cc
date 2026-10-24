// Copyright 2026 Aux Authors. BSD-style license: see //LICENSE.
#include "chrome/browser/aux/feature_store/feature_profile_store.h"
#include <array>
#include <atomic>
#include <cerrno>
#include <fcntl.h>
#include <limits>
#include <limits.h>
#include <map>
#include <memory>
#include <sys/stat.h>
#include <unistd.h>
#include <utility>
#include "base/files/file_path.h"
#include "base/files/file_util.h"
#include "base/files/important_file_writer.h"
#include "base/files/scoped_file.h"
#include "base/functional/bind.h"
#include "base/functional/callback_helpers.h"
#include "base/json/json_reader.h"
#include "base/json/json_writer.h"
#include "base/memory/weak_ptr.h"
#include "base/no_destructor.h"
#include "base/strings/string_number_conversions.h"
#include "base/supports_user_data.h"
#include "base/task/sequenced_task_runner.h"
#include "base/task/thread_pool.h"
#include "base/uuid.h"
#include "chrome/browser/aux/AuxBrowserPrivateRoots.h"
#include "chrome/browser/aux/AuxSelectedStateHome.h"
#include "chrome/browser/aux/profile_identity.h"
#include "chrome/browser/profiles/profile.h"
#include "content/public/browser/browser_thread.h"
namespace aux::features {
namespace {
constexpr char kDataKey[] = "aux.feature-profile-store.v1";
constexpr size_t kMaximumBytes = 8 * 1024 * 1024;
bool Allowed(std::string_view name) { return name == "downloads"; }
bool Regular(Profile* p) {
  return p && p->IsRegularProfile() && !p->IsOffTheRecord() &&
      p == p->GetOriginalProfile();
}
struct Lease {
  std::atomic_bool revoked{false};
  std::shared_ptr<const aux::peer::BrowserPrivateRoots> roots;
  std::string profile_id, epoch;
  uint64_t generation = 0;
};
// UI-only pending/observers survive a Profile's user-data receiver. Actual I/O
// retains Lease, roots and task runner; a new receiver cannot overtake it.
struct Slot {
  std::shared_ptr<Lease> lease;
  bool pending = false;
  base::RepeatingClosureList settled;
  base::RepeatingClosureList ready;
};
auto& Slots() {
  static base::NoDestructor<std::map<base::FilePath, std::shared_ptr<Slot>>> slots;
  return *slots;
}
std::shared_ptr<Slot> SlotFor(Profile* p) {
  DCHECK_CURRENTLY_ON(content::BrowserThread::UI);
  auto& slot = Slots()[p->GetPath()];
  if (!slot) slot = std::make_shared<Slot>();
  return slot;
}
bool ValidEnvelope(const base::DictValue& d, const std::string& profile_id) {
  if (d.size() != 4 || !d.FindString("format") ||
      *d.FindString("format") != "aux.features.v1" ||
      !d.FindString("profileId") || *d.FindString("profileId") != profile_id)
    return false;
  const auto* revision = d.FindString("revision");
  uint64_t number;
  if (!revision || !base::StringToUint64(*revision, &number) ||
      base::NumberToString(number) != *revision) return false;
  const auto* namespaces = d.FindDict("namespaces");
  if (!namespaces) return false;
  for (const auto row : *namespaces)
    if (!Allowed(row.first) || !row.second.is_dict()) return false;
  return true;
}
base::DictValue EmptyEnvelope(const std::string& id) {
  return base::DictValue().Set("format", "aux.features.v1").Set("profileId", id)
      .Set("revision", "0").Set("namespaces", base::DictValue());
}
bool ValidPath(const base::FilePath& path, const Lease& lease) {
  if (lease.revoked.load() || !lease.roots || !lease.roots->Revalidate() ||
      path.BaseName().value() != "Aux Feature State.json") return false;
  base::ScopedFD root(lease.roots->DuplicateRevalidatedRoot(1));
  if (!root.is_valid()) return false;
  std::array<char, PATH_MAX> buffer{};
  if (fcntl(root.get(), F_GETPATH, buffer.data()) != 0 || buffer.back() != 0 ||
      buffer.front() != '/') return false;
  const base::FilePath actual_root(buffer.data());
  return actual_root.IsParent(path.DirName()) &&
      base::MakeAbsoluteFilePath(path.DirName()) == path.DirName() &&
      lease.roots->Revalidate() && !lease.revoked.load();
}
struct ReadResult {
  std::optional<base::DictValue> value;
  bool missing = false;
};
ReadResult Read(const base::FilePath& path, const std::shared_ptr<Lease>& lease) {
  if (!ValidPath(path, *lease)) return {};
  base::ScopedFD fd(open(path.value().c_str(), O_RDONLY | O_CLOEXEC | O_NOFOLLOW));
  if (!fd.is_valid()) {
    const int reason = errno;
    if (reason == ENOENT && base::DirectoryExists(path.DirName()) &&
        ValidPath(path, *lease)) return {.missing = true};
    return {};
  }
  struct stat before{};
  if (fstat(fd.get(), &before) || !S_ISREG(before.st_mode) || before.st_nlink != 1 ||
      before.st_size <= 0 || static_cast<uint64_t>(before.st_size) > kMaximumBytes)
    return {};
  std::string text(static_cast<size_t>(before.st_size), '\0');
  size_t offset = 0;
  while (offset < text.size()) {
    const auto count = read(fd.get(), text.data() + offset, text.size() - offset);
    if (count < 0 && errno == EINTR) continue;
    if (count <= 0) return {};
    offset += static_cast<size_t>(count);
  }
  struct stat after{};
  if (fstat(fd.get(), &after) || after.st_size != before.st_size ||
      after.st_mtimespec.tv_sec != before.st_mtimespec.tv_sec ||
      after.st_mtimespec.tv_nsec != before.st_mtimespec.tv_nsec ||
      !ValidPath(path, *lease)) return {};
  auto value = base::JSONReader::ReadDict(text, base::JSON_PARSE_RFC);
  if (!value || !ValidEnvelope(*value, lease->profile_id)) return {};
  return {.value = std::move(value)};
}
bool Write(const base::FilePath& path, const std::shared_ptr<Lease>& lease,
           bool expected_missing, const base::DictValue& expected,
           const std::string& bytes) {
  const auto before = Read(path, lease);
  if (before.missing != expected_missing ||
      (!expected_missing && (!before.value || *before.value != expected)) ||
      !ValidPath(path, *lease)) return false;
  // Actual completed atomic replacement, not a queued preference flush. The
  // broader native custody/race guarantees remain separate integration gates.
  return base::ImportantFileWriter::WriteFileAtomically(path, bytes) &&
      ValidPath(path, *lease);
}
class Store final : public base::SupportsUserData::Data {
 public:
  explicit Store(Profile* p)
      : profile_(p->GetWeakPtr()), slot_(SlotFor(p)),
        path_(p->GetPath().AppendASCII("Aux Feature State.json")),
        runner_(base::ThreadPool::CreateSequencedTaskRunner(
            {base::MayBlock(), base::TaskPriority::USER_VISIBLE,
             base::TaskShutdownBehavior::BLOCK_SHUTDOWN})) {}
  ~Store() override { if (lease_) lease_->revoked.store(true); }
  void Initialize() {
    if (slot_->pending || (ready_ && Current())) return;
    ready_ = false;
    if (lease_) lease_->revoked.store(true);
    if (!Regular(profile_.get()) || aux::IsProfileCookieRestorePending(profile_.get())) return;
    auto lease = std::make_shared<Lease>();
    lease->roots = aux::peer::CaptureActualChromiumBrowserRoots();
    const auto native = aux::peer::InspectNativeBrowserShutdown();
    if (!lease->roots || !lease->roots->Revalidate() || !native.admitted_generation ||
        native.wrong_process || native.admission_closed || native.sequence_uncertain) return;
    lease->profile_id = aux::GetProfileId(profile_.get());
    lease->epoch = aux::GetProfileCookieBindingEpoch(profile_.get());
    lease->generation = native.admitted_generation;
    if (!base::Uuid::ParseLowercase(lease->profile_id).is_valid() || lease->epoch.empty()) return;
    if (slot_->lease) slot_->lease->revoked.store(true);
    slot_->lease = lease_ = std::move(lease);
    slot_->pending = true;
    const bool posted = runner_->PostTaskAndReplyWithResult(FROM_HERE,
        base::BindOnce(&Read, path_, lease_),
        base::BindOnce([](std::shared_ptr<Slot> slot, base::WeakPtr<Store> owner,
                          ReadResult result) {
          slot->pending = false;
          if (owner) owner->Loaded(std::move(result));
          slot->ready.Notify();
          slot->settled.Notify();
        }, slot_, weak_.GetWeakPtr()));
    if (!posted) {
      auto slot = slot_;
      slot->pending = false; slot->ready.Notify(); slot->settled.Notify();
    }
  }
  std::optional<base::DictValue> Get(std::string_view name) const {
    if (!Allowed(name) || !ready_ || !Current()) return std::nullopt;
    const auto* value = snapshot_.FindDict("namespaces")->FindDict(name);
    return value ? value->Clone() : base::DictValue();
  }
  void Commit(std::string_view name, base::DictValue value,
              base::OnceCallback<void(bool)> done) {
    if (!Allowed(name) || !ready_ || slot_->pending || !Current()) {
      std::move(done).Run(false); return;
    }
    uint64_t revision = 0;
    if (!base::StringToUint64(*snapshot_.FindString("revision"), &revision) ||
        revision == std::numeric_limits<uint64_t>::max()) {
      std::move(done).Run(false); return;
    }
    auto next = snapshot_.Clone();
    next.FindDict("namespaces")->Set(name, std::move(value));
    next.Set("revision", base::NumberToString(revision + 1));
    std::string bytes;
    if (!ValidEnvelope(next, lease_->profile_id) ||
        !base::JSONWriter::Write(next, &bytes) || bytes.size() > kMaximumBytes) {
      std::move(done).Run(false); return;
    }
    slot_->pending = true;
    auto callbacks = base::SplitOnceCallback(std::move(done));
    const bool posted = runner_->PostTaskAndReplyWithResult(FROM_HERE,
        base::BindOnce(&Write, path_, lease_, missing_, snapshot_.Clone(), std::move(bytes)),
        base::BindOnce([](std::shared_ptr<Slot> slot, base::WeakPtr<Store> owner,
                          base::DictValue next, base::OnceCallback<void(bool)> done,
                          bool written) {
          slot->pending = false;
          const bool accepted = owner && owner->Completed(std::move(next), written);
          // The owner check immediately precedes its receipt. Notify observers
          // afterward: an observer can switch profiles or destroy the receiver.
          std::move(done).Run(accepted);
          slot->settled.Notify();
        }, slot_, weak_.GetWeakPtr(), std::move(next), std::move(callbacks.first)));
    if (!posted) {
      slot_->pending = false; ready_ = false;
      auto slot = slot_;
      std::move(callbacks.second).Run(false);
      slot->settled.Notify();
    }
  }
 private:
  bool Current() const {
    if (!Regular(profile_.get()) || !lease_ || lease_ != slot_->lease ||
        lease_->revoked.load() || !lease_->roots || !lease_->roots->Revalidate() ||
        aux::IsProfileCookieRestorePending(profile_.get()) ||
        aux::GetProfileId(profile_.get()) != lease_->profile_id ||
        aux::GetProfileCookieBindingEpoch(profile_.get()) != lease_->epoch) return false;
    const auto native = aux::peer::InspectNativeBrowserShutdown();
    return !native.wrong_process && !native.admission_closed && !native.sequence_uncertain &&
        native.admitted_generation == lease_->generation;
  }
  void Loaded(ReadResult result) {
    if (!Current() || (!result.value && !result.missing)) { ready_ = false; return; }
    missing_ = result.missing;
    snapshot_ = result.value ? std::move(*result.value) : EmptyEnvelope(lease_->profile_id);
    ready_ = true;
  }
  bool Completed(base::DictValue next, bool written) {
    if (!written || !Current()) { ready_ = false; return false; }
    snapshot_ = std::move(next); missing_ = false; ready_ = true;
    return true;
  }
  base::WeakPtr<Profile> profile_;
  std::shared_ptr<Slot> slot_;
  std::shared_ptr<Lease> lease_;
  const base::FilePath path_;
  const scoped_refptr<base::SequencedTaskRunner> runner_;
  base::DictValue snapshot_;
  bool ready_ = false, missing_ = false;
  base::WeakPtrFactory<Store> weak_{this};
};
Store* Find(Profile* p) {
  return Regular(p) ? static_cast<Store*>(p->GetUserData(kDataKey)) : nullptr;
}
}  // namespace
void InitializeForProfile(Profile* p) {
  DCHECK_CURRENTLY_ON(content::BrowserThread::UI);
  if (!Regular(p)) return;
  if (!Find(p)) p->SetUserData(kDataKey, std::make_unique<Store>(p));
  Find(p)->Initialize();
}
bool IsWritePending(Profile* p) {
  DCHECK_CURRENTLY_ON(content::BrowserThread::UI);
  if (!Regular(p)) return false;
  const auto found = Slots().find(p->GetPath());
  return found != Slots().end() && found->second->pending;
}
base::CallbackListSubscription ObserveSettled(Profile* p, base::RepeatingClosure callback) {
  DCHECK_CURRENTLY_ON(content::BrowserThread::UI);
  return Regular(p) ? SlotFor(p)->settled.Add(std::move(callback)) : base::CallbackListSubscription();
}
base::CallbackListSubscription ObserveReady(Profile* p, base::RepeatingClosure callback) {
  DCHECK_CURRENTLY_ON(content::BrowserThread::UI);
  return Regular(p) ? SlotFor(p)->ready.Add(std::move(callback)) : base::CallbackListSubscription();
}
std::optional<base::DictValue> GetNamespace(Profile* p, std::string_view name) {
  DCHECK_CURRENTLY_ON(content::BrowserThread::UI);
  auto* store = Find(p);
  return store ? store->Get(name) : std::nullopt;
}
void CommitNamespace(Profile* p, std::string_view name, base::DictValue value,
                     base::OnceCallback<void(bool)> done) {
  DCHECK_CURRENTLY_ON(content::BrowserThread::UI);
  if (auto* store = Find(p)) store->Commit(name, std::move(value), std::move(done));
  else std::move(done).Run(false);
}
}  // namespace aux::features
