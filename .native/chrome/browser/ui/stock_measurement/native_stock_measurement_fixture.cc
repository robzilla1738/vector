// Copyright 2026 The Aux Authors
#include "chrome/browser/ui/stock_measurement/native_stock_measurement_fixture.h"
#if BUILDFLAG(IS_MAC) && BUILDFLAG(AUX_ALLOW_REMOTE_DEBUGGING_FOR_TESTS) && !BUILDFLAG(ENABLE_AUX_SHELL)
#include <sys/stat.h>
#include <unistd.h>
#include <cstdio>
#include <utility>
#include "base/command_line.h"
#include "base/files/file_path_watcher.h"
#include "base/functional/bind.h"
#include "base/json/json_writer.h"
#include "base/strings/string_number_conversions.h"
#include "base/task/bind_post_task.h"
#include "base/task/thread_pool.h"
#include "base/threading/sequence_bound.h"
#include "chrome/browser/ui/aux/journey_fixture_path.h"
#include "chrome/browser/ui/browser_window/public/browser_window_interface.h"
#include "chrome/browser/ui/stock_measurement/native_stock_memory_sampler.h"
#include "chrome/browser/ui/stock_measurement/native_stock_measurement_request.h"
#include "content/public/browser/browser_thread.h"
#include "components/sessions/core/session_id.h"
namespace aux {
namespace {
constexpr char kRequest[] = "performance-request.json";
constexpr char kOperation[] = "sampleStockProcessMemory";
using RequestReply = base::OnceCallback<void(std::optional<NativeStockMeasurementRequest>)>;
bool Directory(const base::FilePath& path, uint64_t device, uint64_t inode) {
  struct stat info;
  return lstat(path.value().c_str(), &info) == 0 && S_ISDIR(info.st_mode) && info.st_uid == geteuid() &&
      (info.st_mode & 0777) == 0700 && static_cast<uint64_t>(info.st_dev) == device && static_cast<uint64_t>(info.st_ino) == inode;
}
}  // namespace
class NativeStockMeasurementExtraParts::Fixture {
 public:
  Fixture(base::FilePath profile, uint64_t root_device, uint64_t root_inode, uint64_t profile_device, uint64_t profile_inode)
      : root_(profile.DirName()), profile_(std::move(profile)), root_device_(root_device), root_inode_(root_inode),
        profile_device_(profile_device), profile_inode_(profile_inode), watch_(content::GetIOThreadTaskRunner({})) {}
  ~Fixture() { weak_factory_.InvalidateWeakPtrs(); }
  void Next() {
    DCHECK_CURRENTLY_ON(content::BrowserThread::UI);
    if (failed_ || sequence_ >= 4000) return;
    if (!NativeStockObservationMetadataEnabled()) { Refuse(); return; }
    watch_.AsyncCall(&Watch::Wait).WithArgs(root_, root_device_, root_inode_, sequence_,
        base::BindPostTaskToCurrentDefault(base::BindOnce(&Fixture::Received, weak_factory_.GetWeakPtr())));
  }
 private:
  class Watch {
   public:
    void Wait(base::FilePath root, uint64_t device, uint64_t inode, uint64_t sequence, RequestReply reply) {
      DCHECK_CURRENTLY_ON(content::BrowserThread::IO);
      if (pending_) { std::move(reply).Run(std::nullopt); return; }
      root_ = std::move(root); device_ = device; inode_ = inode; sequence_ = sequence; pending_ = std::move(reply);
      if (!watcher_) {
        watcher_ = std::make_unique<base::FilePathWatcher>();
        if (!watcher_->Watch(root_.AppendASCII(kRequest), base::FilePathWatcher::Type::kNonRecursive,
            base::BindRepeating(&Watch::Changed, weak_factory_.GetWeakPtr()))) {
          std::move(pending_).Run(std::nullopt); return;
        }
      }
      Read();
    }
   private:
    void Changed(const base::FilePath&, bool error) {
      if (error) { failed_ = true; if (pending_) std::move(pending_).Run(std::nullopt); return; }
      if (reading_) { dirty_ = true; return; } Read();
    }
    void Read() {
      if (!pending_ || reading_) return;
      if (failed_) { std::move(pending_).Run(std::nullopt); return; }
      reading_ = true;
      base::ThreadPool::PostTaskAndReplyWithResult(FROM_HERE, {base::MayBlock()},
          base::BindOnce(&NativeStockMeasurementRequest::Read, root_, device_, inode_, sequence_),
          base::BindOnce(&Watch::ReadDone, weak_factory_.GetWeakPtr()));
    }
    void ReadDone(std::optional<NativeStockMeasurementRequest> value) {
      reading_ = false;
      if (pending_ && value) { std::move(pending_).Run(std::move(value)); dirty_ = false; }
      else if (std::exchange(dirty_, false)) Read();
    }
    base::FilePath root_; uint64_t device_ = 0, inode_ = 0, sequence_ = 0;
    RequestReply pending_; bool reading_ = false, dirty_ = false, failed_ = false;
    std::unique_ptr<base::FilePathWatcher> watcher_;
    base::WeakPtrFactory<Watch> weak_factory_{this};
  };
  void Received(std::optional<NativeStockMeasurementRequest> request) {
    DCHECK_CURRENTLY_ON(content::BrowserThread::UI);
    if (failed_) return;
    const auto* operation = request ? request->record().FindString("operation") : nullptr;
    const auto* raw_sequence = request ? request->record().FindString("sequence") : nullptr; uint64_t next = 0;
    if (!NativeStockObservationMetadataEnabled() || !request || !request->Current() || !operation || *operation != kOperation || !raw_sequence ||
        !base::StringToUint64(*raw_sequence, &next) || next != sequence_ + 1 ||
        !Directory(root_, root_device_, root_inode_) || !Directory(profile_, profile_device_, profile_inode_)) { Refuse(); return; }
    sequence_ = next;
    const auto browser = ReadNativeStockMeasurementOwner();
    if (!browser || (owner_selected_ && owner_ != browser)) { Refuse(); return; }
    owner_ = browser; owner_selected_ = true;
    const auto record = sampler_.Sample();
    if (!NativeStockObservationMetadataEnabled() || !request->Current() || !owner_ || ReadNativeStockMeasurementOwner() != owner_ ||
        !Directory(root_, root_device_, root_inode_) || !Directory(profile_, profile_device_, profile_inode_)) { Refuse(); return; }
    const auto json = base::WriteJson(base::DictValue().Set("producer", "aux-native-fixture-reply").Set("version", 1)
        .Set("pid", static_cast<int>(getpid())).Set("windowId", owner_->GetSessionID().id())
        .Set("sequence", base::NumberToString(sequence_)).Set("operation", kOperation).Set("record", record.Clone()));
    if (!json || json->size() > 16 * 1024) { Refuse(); return; }
    fprintf(stderr, "AUX_NATIVE_FIXTURE_REPLY_V1 %s\n", json->c_str()); fflush(stderr); Next();
  }
  void Refuse() {
    failed_ = true;
    const auto json = base::WriteJson(base::DictValue().Set("producer", "aux-native-fixture-refusal").Set("version", 1)
        .Set("pid", static_cast<int>(getpid())).Set("status", "refused").Set("reason", "invalid_private_mailbox"));
    if (json) { fprintf(stderr, "AUX_NATIVE_FIXTURE_REFUSAL_V1 %s\n", json->c_str()); fflush(stderr); }
  }
  base::FilePath root_, profile_; const uint64_t root_device_, root_inode_, profile_device_, profile_inode_;
  base::WeakPtr<BrowserWindowInterface> owner_; NativeStockMemorySampler sampler_;
  uint64_t sequence_ = 0; bool failed_ = false, owner_selected_ = false;
  base::SequenceBound<Watch> watch_;
  base::WeakPtrFactory<Fixture> weak_factory_{this};
};
NativeStockMeasurementExtraParts::NativeStockMeasurementExtraParts() = default;
NativeStockMeasurementExtraParts::~NativeStockMeasurementExtraParts() = default;
void NativeStockMeasurementExtraParts::PreBrowserStart() {
  DCHECK_CURRENTLY_ON(content::BrowserThread::UI);
  const auto& command = *base::CommandLine::ForCurrentProcess();
  const base::FilePath profile(command.GetSwitchValueASCII("user-data-dir")); const auto root = profile.DirName();
  struct stat root_info{}, profile_info{};
  if (!command.HasSwitch("aux-native-stock-measurement-observer") || profile.BaseName().value() != "profile" ||
      !NativeStockObservationMetadataEnabled() || lstat(root.value().c_str(), &root_info) != 0 ||
      lstat(profile.value().c_str(), &profile_info) != 0 || !S_ISDIR(profile_info.st_mode) || profile_info.st_uid != geteuid() ||
      (profile_info.st_mode & 0777) != 0700) return;
  if (!NativeStockObservationMetadataEnabled()) return;
  fixture_ = std::make_unique<Fixture>(profile, root_info.st_dev, root_info.st_ino, profile_info.st_dev, profile_info.st_ino);
  fixture_->Next();
}
void NativeStockMeasurementExtraParts::PostMainMessageLoopRun() { fixture_.reset(); }
}  // namespace aux
#endif
