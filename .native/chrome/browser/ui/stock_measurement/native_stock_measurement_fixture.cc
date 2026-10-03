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
#include "base/timer/timer.h"
#include "chrome/browser/ui/aux/journey_fixture_path.h"
#include "chrome/browser/ui/browser_window/public/browser_window_interface.h"
#include "chrome/browser/ui/stock_measurement/native_stock_memory_sampler.h"
#include "chrome/browser/ui/stock_measurement/native_stock_startup_coordinator.h"
#include "chrome/browser/ui/stock_measurement/native_stock_warm_owner.h"
#include "chrome/browser/ui/stock_measurement/native_stock_warm_creation_ticket.h"
#include "chrome/browser/ui/stock_measurement/native_stock_warm_session.h"
#include "chrome/browser/ui/views/frame/browser_view.h"
#include "chrome/browser/ui/stock_measurement/native_stock_measurement_request.h"
#include "content/public/browser/browser_thread.h"
#include "components/sessions/core/session_id.h"
namespace aux {
namespace {
constexpr char kRequest[] = "performance-request.json";
constexpr char kOperation[] = "sampleStockProcessMemory";
constexpr char kPrepareWarm[] = "prepareStockWarmWindow";
constexpr char kCompleteWarm[] = "completeStockWarmWindow";
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
        profile_device_(profile_device), profile_inode_(profile_inode), watch_(content::GetIOThreadTaskRunner({})) {
    if (NativeStartupObservationEnabled()) {
      startup_ = std::make_unique<NativeStockStartupCoordinator>();
      startup_->Start(base::BindOnce(&Fixture::StartupFinished, weak_factory_.GetWeakPtr()),
          base::BindOnce(&Fixture::WarmRetained, weak_factory_.GetWeakPtr()));
    }
  }
  ~Fixture() { weak_factory_.InvalidateWeakPtrs(); }
  void Next() {
    DCHECK_CURRENTLY_ON(content::BrowserThread::UI);
    if (failed_ || sequence_ >= 4000) return;
    if (!NativeStockObservationMetadataEnabled()) { Refuse(); return; }
    watch_.AsyncCall(&Watch::Wait).WithArgs(root_, root_device_, root_inode_, sequence_,
        base::BindPostTaskToCurrentDefault(base::BindOnce(&Fixture::Received, weak_factory_.GetWeakPtr())));
  }
 private:
  void WarmRetained(std::unique_ptr<NativeStockWarmOwner> original) {
    // A native lease continuation only. A raw JSON record never grants warm
    // authority. A failed admission leaves the future preparation unavailable.
    warm_owner_ = std::move(original);
  }
  void StartupFinished(base::DictValue record) {
    const auto json = base::WriteJsonWithOptions(
        record, base::OPTIONS_OMIT_DOUBLE_TYPE_PRESERVATION);
    if (!json || json->size() > 16 * 1024) return;
    fprintf(stderr, "AUX_NATIVE_STOCK_STARTUP_V1 %s\n", json->c_str()); fflush(stderr);
  }
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
    if (!NativeStockObservationMetadataEnabled() || !request || !request->Current() || !operation || (*operation != kOperation && *operation != kPrepareWarm && *operation != kCompleteWarm) || !raw_sequence ||
        !base::StringToUint64(*raw_sequence, &next) || next != sequence_ + 1 ||
        !Directory(root_, root_device_, root_inode_) || !Directory(profile_, profile_device_, profile_inode_)) { Refuse(); return; }
    sequence_ = next;
    if (*operation == kPrepareWarm) { PrepareWarm(std::move(*request)); return; }
    if (*operation == kCompleteWarm) { CompleteWarm(std::move(*request)); return; }
    const auto browser = ReadNativeStockMeasurementOwner();
    if (!browser || (owner_selected_ && (!owner_ || owner_.get() != browser.get()))) { Refuse(); return; }
    owner_ = browser; owner_selected_ = true;
    const auto record = sampler_.Sample();
    const auto final_owner = ReadNativeStockMeasurementOwner();
    if (!NativeStockObservationMetadataEnabled() || !request->Current() || !owner_ || !final_owner || final_owner.get() != owner_.get() ||
        !Directory(root_, root_device_, root_inode_) || !Directory(profile_, profile_device_, profile_inode_)) { Refuse(); return; }
    const auto json = base::WriteJson(base::DictValue().Set("producer", "aux-native-fixture-reply").Set("version", 1)
        .Set("pid", static_cast<int>(getpid())).Set("windowId", owner_->GetSessionID().id())
        .Set("sequence", base::NumberToString(sequence_)).Set("operation", kOperation).Set("record", record.Clone()));
    if (!json || json->size() > 16 * 1024) { Refuse(); return; }
    fprintf(stderr, "AUX_NATIVE_FIXTURE_REPLY_V1 %s\n", json->c_str()); fflush(stderr); Next();
  }
  void PrepareWarm(NativeStockMeasurementRequest request) {
    // One warm window per admitted original cold lifetime; >=20 independent
    // trials require >=20 genuine retained lifetimes, never reset a used ticket.
    if (!NativeStartupObservationEnabled() || warm_used_ || !warm_owner_ ||
        !warm_owner_->BeforeCreation() || !request.Current()) { Refuse(); return; }
    warm_used_ = true;
    warm_original_ = warm_owner_->original_browser();
    warm_ticket_ = std::make_unique<NativeStockWarmCreationTicket>(std::move(warm_owner_),
        base::BindOnce(&Fixture::WarmCreated, weak_factory_.GetWeakPtr()),
        base::BindOnce(&Fixture::WarmCreationRefused, weak_factory_.GetWeakPtr()));
    if (!warm_ticket_->Prepare() || !warm_ticket_->owner() || !warm_original_) { Refuse(); return; }
    const auto preparation_deadline = warm_ticket_->prepared_at() + base::Seconds(5);
    const auto preparation_now = base::TimeTicks::Now();
    if (preparation_now >= preparation_deadline || !warm_ticket_->owner()->BeforeCreation()) { Refuse(); return; }
    warm_preparation_timeout_.Start(FROM_HERE, preparation_deadline - preparation_now,
        base::BindOnce(&Fixture::WarmPreparationExpired, weak_factory_.GetWeakPtr()));
    const auto& process = warm_ticket_->owner()->original_process();
    const auto& launch = warm_ticket_->owner()->original_launch();
    auto record = base::DictValue().Set("producer", "aux-native-stock-warm-ready").Set("version", 1)
        .Set("status", "ready").Set("nonce", warm_ticket_->nonce().ToString())
        .Set("preparedUs", base::NumberToString(warm_ticket_->prepared_at().since_origin().InMicroseconds()))
        .Set("browserPid", process.pid).Set("browserProcessUuid", process.process_uuid)
        .Set("browserProcessStart", base::NumberToString(process.process_start_absolute))
        .Set("originalBrowserWindowId", warm_ticket_->owner()->original_browser_window_id())
        .Set("trial", launch.trial).Set("launchReceiptNonce", launch.receipt_nonce)
        .Set("launchReceiptSha256", launch.original_receipt_sha256)
        .Set("helperBinarySha256", launch.helper_sha256).Set("helperSourceSha256", launch.helper_source_sha256);
    ReplyWarm(request, kPrepareWarm, std::move(record));
  }
  void WarmPreparationExpired() {
    if (warm_ticket_) warm_ticket_->Cancel("warm_preparation_deadline_elapsed");
  }
  void WarmCreated(base::WeakPtr<BrowserView> actual) {
    warm_preparation_timeout_.Stop();
    if (failed_ || !actual || !warm_ticket_ || warm_session_) { Refuse(); return; }
    warm_session_ = std::make_unique<NativeStockWarmSession>(actual.get());
    warm_session_->Start(warm_ticket_->GetWeakPtr(),
        base::BindOnce(&Fixture::WarmFinished, weak_factory_.GetWeakPtr()));
  }
  void WarmCreationRefused(const char* reason) {
    if (warm_record_) { Refuse(); return; }
    WarmFinished(base::DictValue().Set("producer", "aux-native-stock-warm-presentation").Set("version", 1)
        .Set("status", "refused").Set("reason", reason)
        .Set("measured", false).Set("earliestPresentationProven", false).Set("inputLineageProven", false));
  }
  void WarmFinished(base::DictValue record) {
    warm_preparation_timeout_.Stop();
    if (failed_) return;
    if (warm_record_) { Refuse(); return; }
    warm_record_ = std::move(record);
    if (warm_pending_) {
      auto pending = std::move(*warm_pending_); warm_pending_.reset();
      DeliverWarm(std::move(pending));
    }
  }
  void CompleteWarm(NativeStockMeasurementRequest request) {
    if (!NativeStartupObservationEnabled() || !warm_used_ || warm_completed_ ||
        !warm_ticket_ || warm_pending_ || !request.Current()) { Refuse(); return; }
    warm_completed_ = true;
    if (warm_record_) { DeliverWarm(std::move(request)); return; }
    // No JS timer runs while input/painting is measured. Original OS file
    // event awakens this one pending read; the native session owns its deadline.
    warm_pending_ = std::move(request);
  }
  void DeliverWarm(NativeStockMeasurementRequest request) {
    if (!warm_record_) { Refuse(); return; }
    const auto* status = warm_record_->FindString("status");
    if (status && *status == "measured" &&
        (!warm_ticket_ || !warm_ticket_->Confirmed())) {
      warm_record_ = base::DictValue().Set("producer", "aux-native-stock-warm-presentation").Set("version", 1)
          .Set("status", "refused").Set("reason", "warm_scope_lost_before_delivery")
          .Set("measured", false).Set("earliestPresentationProven", false).Set("inputLineageProven", false);
    }
    auto record = std::move(*warm_record_); warm_record_.reset();
    ReplyWarm(request, kCompleteWarm, std::move(record));
  }
  void ReplyWarm(const NativeStockMeasurementRequest& request, const char* operation, base::DictValue record) {
    if (!NativeStockObservationMetadataEnabled() || !NativeStartupObservationEnabled() ||
        !request.Current() || !warm_original_ ||
        !Directory(root_, root_device_, root_inode_) || !Directory(profile_, profile_device_, profile_inode_)) {
      Refuse(); return;
    }
    const auto json = base::WriteJsonWithOptions(base::DictValue().Set("producer", "aux-native-fixture-reply").Set("version", 1)
        .Set("pid", static_cast<int>(getpid())).Set("windowId", warm_original_->GetSessionID().id())
        .Set("sequence", base::NumberToString(sequence_)).Set("operation", operation).Set("record", std::move(record)),
        base::OPTIONS_OMIT_DOUBLE_TYPE_PRESERVATION);
    if (!json || json->size() > 16 * 1024) { Refuse(); return; }
    // Final Ready remains bound to the original preparation deadline and
    // retained native owner, not merely a delayed timer task on the UI queue.
    if (operation == kPrepareWarm && (!warm_ticket_ || !warm_ticket_->owner() ||
        base::TimeTicks::Now() > warm_ticket_->prepared_at() + base::Seconds(5) ||
        !warm_ticket_->owner()->BeforeCreation())) { Refuse(); return; }
    if (!request.Current()) { Refuse(); return; }
    fprintf(stderr, "AUX_NATIVE_FIXTURE_REPLY_V1 %s\n", json->c_str()); fflush(stderr); Next();
  }
  void Refuse() {
    if (std::exchange(failed_, true)) return;
    warm_preparation_timeout_.Stop();
    if (warm_session_) warm_session_->Cancel("stock_fixture_retired");
    if (warm_ticket_) warm_ticket_->Cancel("stock_fixture_retired");
    const auto json = base::WriteJson(base::DictValue().Set("producer", "aux-native-fixture-refusal").Set("version", 1)
        .Set("pid", static_cast<int>(getpid())).Set("status", "refused").Set("reason", "invalid_private_mailbox"));
    if (json) { fprintf(stderr, "AUX_NATIVE_FIXTURE_REFUSAL_V1 %s\n", json->c_str()); fflush(stderr); }
  }
  base::FilePath root_, profile_; const uint64_t root_device_, root_inode_, profile_device_, profile_inode_;
  base::WeakPtr<BrowserWindowInterface> owner_; NativeStockMemorySampler sampler_;
  uint64_t sequence_ = 0; bool failed_ = false, owner_selected_ = false;
  base::SequenceBound<Watch> watch_;
  std::unique_ptr<NativeStockStartupCoordinator> startup_;
  std::unique_ptr<NativeStockWarmOwner> warm_owner_;
  base::WeakPtr<BrowserWindowInterface> warm_original_;
  std::unique_ptr<NativeStockWarmCreationTicket> warm_ticket_;
  std::unique_ptr<NativeStockWarmSession> warm_session_;
  std::optional<base::DictValue> warm_record_;
  std::optional<NativeStockMeasurementRequest> warm_pending_;
  bool warm_used_ = false, warm_completed_ = false;
  base::OneShotTimer warm_preparation_timeout_;
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
