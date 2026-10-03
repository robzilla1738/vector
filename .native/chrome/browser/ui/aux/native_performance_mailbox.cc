// Copyright 2026 The Aux Authors
#include "chrome/browser/ui/aux/native_performance_mailbox.h"
#if BUILDFLAG(IS_MAC) && BUILDFLAG(AUX_ALLOW_REMOTE_DEBUGGING_FOR_TESTS)
#include <fcntl.h>
#include <cmath>
#include <atomic>
#include <cerrno>
#include <memory>
#include <sys/stat.h>
#include <unistd.h>
#include <cstdio>
#include <utility>
#include "base/command_line.h"
#include "base/files/file_path_watcher.h"
#include "base/functional/bind.h"
#include "base/json/json_reader.h"
#include "base/json/json_writer.h"
#include "base/posix/eintr_wrapper.h"
#include "base/strings/string_number_conversions.h"
#include "base/task/bind_post_task.h"
#include "base/task/thread_pool.h"
#include "chrome/browser/profiles/profile.h"
#include "components/sessions/core/session_id.h"
#include "chrome/browser/ui/aux/journey_fixture_path.h"
#include "chrome/browser/ui/aux/native_performance_observer.h"
#include "chrome/browser/ui/aux/little_window_controller.h"
#include "chrome/browser/ui/aux/quick_ask_controller.h"
#include "chrome/browser/ui/browser_window/public/browser_window_interface.h"
#include "chrome/browser/ui/browser_window/public/browser_window_interface_iterator.h"
#include "chrome/browser/ui/webui_browser/webui_browser_ui.h"
#include "chrome/browser/ui/webui_browser/webui_browser_window.h"
#include "content/public/browser/browser_thread.h"
#include "content/public/browser/render_frame_host.h"
#include "content/public/browser/web_contents.h"
#include "content/public/browser/web_ui.h"
namespace aux {
namespace {
constexpr char kMailbox[] = "performance-request.json";
bool AdmitRecord() {
  static std::atomic<unsigned> count{0};
  unsigned previous = count.load(std::memory_order_relaxed);
  while (previous < 4000 && !count.compare_exchange_weak(previous, previous + 1, std::memory_order_relaxed)) {}
  return previous < 4000;
}
bool PrivateDirectory(const base::FilePath& path, struct stat* info) {
  return lstat(path.value().c_str(), info) == 0 && S_ISDIR(info->st_mode) &&
      info->st_uid == geteuid() && (info->st_mode & 0777) == 0700;
}
base::DictValue Invalid() {
  // Diagnostic only: never invent a window, nonce or measured request scope.
  if (NativePerformanceObservationEnabled() && AdmitRecord()) {
    const auto json = base::WriteJson(base::DictValue().Set("producer", "aux-native-fixture-refusal")
        .Set("version", 1).Set("pid", static_cast<int>(getpid()))
        .Set("status", "refused").Set("reason", "invalid_private_mailbox"));
    if (json && json->size() <= 512) {
      fprintf(stderr, "AUX_NATIVE_FIXTURE_REFUSAL_V1 %s\n", json->c_str()); fflush(stderr);
    }
  }
  return base::DictValue().Set("status", "refused").Set("reason", "invalid_private_mailbox");
}
std::optional<NativeGuestStageOwnedSnapshot> UniqueOwner(base::WeakPtr<WebUIBrowserUI> ui) {
  auto owner = ReadNativeGuestStageShellOwner(ui);
  if (!owner || !ui || !ui->web_ui()) return std::nullopt;
  auto* profile = Profile::FromWebUI(ui->web_ui());
  if (!profile || profile->IsOffTheRecord()) return std::nullopt;
  const base::FilePath selected(base::CommandLine::ForCurrentProcess()->GetSwitchValueASCII("user-data-dir"));
  auto* origin = ui->browser();
  const auto permitted_little = ui->NativeLittleCleanupWindowForTesting();
#if BUILDFLAG(ENABLE_AUX_SHELL)
  const auto permitted_warm = ui->NativeWarmCleanupWindowForTesting();
#endif
  std::vector<BrowserWindowInterface*> observed;
  ForEachCurrentBrowserWindowInterfaceOrderedByActivation(
      [&observed, selected](BrowserWindowInterface* browser) {
        if (browser->GetProfile() && browser->GetProfile()->GetPath().DirName() == selected) {
          auto* window = WebUIBrowserWindow::FromBrowser(browser);
          if (window && window->GetWebUIBrowserUI()) observed.push_back(browser);
        }
        return true;
      });
#if BUILDFLAG(ENABLE_AUX_SHELL)
  if (permitted_warm) {
    // Only the native exact creation ticket can expose this capability. It
    // cannot authorize another normal window or coexist with a Little lease.
    if (permitted_little || observed.size() != 2 || !origin ||
        origin == permitted_warm.get() || permitted_warm->GetProfile() != profile ||
        origin->GetType() != BrowserWindowInterface::TYPE_NORMAL ||
        permitted_warm->GetType() != BrowserWindowInterface::TYPE_NORMAL ||
        IsLittleWindow(origin) || IsQuickAskWindow(origin) ||
        IsLittleWindow(permitted_warm.get()) || IsQuickAskWindow(permitted_warm.get())) return std::nullopt;
    unsigned original_count = 0, child_count = 0;
    for (auto* current : observed) {
      if (current == origin) ++original_count;
      else if (current == permitted_warm.get()) ++child_count;
      else return std::nullopt;
    }
    return original_count == 1 && child_count == 1 && ui && permitted_warm &&
        ui->NativeWarmCleanupWindowForTesting().get() == permitted_warm.get() &&
        ReadNativeGuestStageShellOwner(ui) == owner ? owner : std::nullopt;
  }
#endif
  return NativePerformanceOwnerInventoryMatches(origin, permitted_little, observed) &&
      ui && ReadNativeGuestStageShellOwner(ui) == owner ? owner : std::nullopt;
}
}  // namespace
bool NativePerformanceOwnerInventoryMatches(BrowserWindowInterface* origin,
    base::WeakPtr<BrowserWindowInterface> permitted_little,
    const std::vector<BrowserWindowInterface*>& observed) {
  auto* profile = origin ? origin->GetProfile() : nullptr;
  if (!profile || profile->IsOffTheRecord() || IsLittleWindow(origin) || IsQuickAskWindow(origin) ||
      origin->GetType() != BrowserWindowInterface::TYPE_NORMAL ||
      (permitted_little && (permitted_little.get() == origin ||
          permitted_little->GetProfile() != profile || !IsLittleWindow(permitted_little.get())))) return false;
  unsigned ordinary = 0, created = 0;
  for (auto* window : observed) {
    if (window == origin) ++ordinary;
    else if (permitted_little && window == permitted_little.get()) ++created;
    else return false;
    if (ordinary > 1 || created > 1) return false;
  }
  return ordinary == 1;
}
bool IsNativePerformanceMailboxOperation(const std::string& operation) {
  return operation == "prepareCdpStopMeasurement" || operation == "prepareCdpTakeoverMeasurement" ||
      operation == "completeCdpRetirementMeasurement" || operation == "prepareGuestSplitDropPresentation" ||
      operation == "prepareGuestDividerFramePresentation" ||
      operation == "prepareGuestTabSwitchPresentation" || operation == "completeGuestPresentation" ||
      operation == "sampleShellMemory" || operation == "sampleProcessMemory" ||
      operation == "prepareSubagentMemoryWorkload" ||
      operation == "prepareAuxWarmWindow" || operation == "completeAuxWarmWindow" ||
      operation == "prepareLittleWindowPresentation" || operation == "completeLittleWindowPresentation" ||
      operation == "prepareOrganizationAutoArchiveWork" ||
      operation == "prepareOrganizationLiveFolderWork" || operation == "completeOrganizationWork";
}
std::optional<base::DictValue> ReadNativePerformanceMailboxFile(const base::FilePath& root,
                                                             uint64_t last_sequence, uint64_t root_device, uint64_t root_inode) {
  // Called on a MayBlock worker, not the UI or IO thread. No Profile contents.
  if (!OwnedJourneyFixtureRoot(root.value())) return Invalid();
  const int directory = HANDLE_EINTR(open(root.value().c_str(), O_RDONLY | O_DIRECTORY | O_NOFOLLOW | O_CLOEXEC));
  if (directory < 0) return Invalid();
  struct stat path_info, directory_info;
  const bool same = lstat(root.value().c_str(), &path_info) == 0 && fstat(directory, &directory_info) == 0 &&
      path_info.st_dev == directory_info.st_dev && path_info.st_ino == directory_info.st_ino &&
      static_cast<uint64_t>(directory_info.st_dev) == root_device && static_cast<uint64_t>(directory_info.st_ino) == root_inode;
  const int file = same ? HANDLE_EINTR(openat(directory, kMailbox, O_RDONLY | O_NOFOLLOW | O_NONBLOCK | O_CLOEXEC)) : -1;
  const int open_error = errno; close(directory);
  if (file < 0) return same && open_error == ENOENT ? std::nullopt : std::optional(Invalid());
  struct stat before, after;
  bool valid = fstat(file, &before) == 0 && S_ISREG(before.st_mode) && before.st_uid == geteuid() &&
      (before.st_mode & 0777) == 0600 && before.st_nlink == 1 && before.st_size > 0 && before.st_size <= 512;
  char bytes[513]; ssize_t size = valid ? HANDLE_EINTR(read(file, bytes, sizeof(bytes))) : -1;
  valid = valid && size == before.st_size && fstat(file, &after) == 0 &&
      before.st_dev == after.st_dev && before.st_ino == after.st_ino && before.st_size == after.st_size &&
      before.st_mode == after.st_mode && before.st_uid == after.st_uid && before.st_nlink == after.st_nlink &&
      before.st_ctimespec.tv_sec == after.st_ctimespec.tv_sec && before.st_ctimespec.tv_nsec == after.st_ctimespec.tv_nsec &&
      before.st_mtimespec.tv_sec == after.st_mtimespec.tv_sec && before.st_mtimespec.tv_nsec == after.st_mtimespec.tv_nsec;
  close(file);
  if (!valid) return Invalid();
  auto request = base::JSONReader::ReadDict(std::string_view(bytes, size), base::JSON_PARSE_RFC);
  const std::string* operation = request ? request->FindString("operation") : nullptr;
  const std::string* sequence = request ? request->FindString("sequence") : nullptr;
  uint64_t number = 0;
  if (!request || request->size() != 2 || !operation || !IsNativePerformanceMailboxOperation(*operation) ||
      !sequence || !base::StringToUint64(*sequence, &number) || *sequence != base::NumberToString(number) ||
      number == 0 || number > 4000 || number < last_sequence || number > last_sequence + 1) return Invalid();
  return number == last_sequence ? std::nullopt : std::move(request);
}
class NativePerformanceMailbox::WatchState {
 public:
  WatchState();
  ~WatchState();
  void Wait(base::FilePath root, uint64_t sequence, uint64_t device, uint64_t inode, Reply reply) {
    DCHECK_CURRENTLY_ON(content::BrowserThread::IO);
    if (failed_ || pending_) { std::move(reply).Run(Invalid()); return; }
    root_ = std::move(root); sequence_ = sequence; device_ = device; inode_ = inode; pending_ = std::move(reply);
    if (!watcher_) {
      watcher_ = std::make_unique<base::FilePathWatcher>();
      if (!watcher_->Watch(root_.AppendASCII(kMailbox), base::FilePathWatcher::Type::kNonRecursive,
          base::BindRepeating(&WatchState::Changed, weak_factory_.GetWeakPtr()))) {
        std::move(pending_).Run(Invalid()); return;
      }
    }
    if (sequence == 0 || dirty_) Read();
  }
 private:
  void Changed(const base::FilePath&, bool error) {
    if (error) { failed_ = true; if (pending_) std::move(pending_).Run(Invalid()); return; }
    dirty_ = true;
    if (reading_) { reread_ = true; return; } Read();
  }
  void Read() {
    if (!pending_ || reading_) return;
    reading_ = true; dirty_ = false;
    base::ThreadPool::PostTaskAndReplyWithResult(FROM_HERE, {base::MayBlock()},
        base::BindOnce(&ReadNativePerformanceMailboxFile, root_, sequence_, device_, inode_),
        base::BindOnce(&WatchState::ReadDone, weak_factory_.GetWeakPtr()));
  }
  void ReadDone(std::optional<base::DictValue> value) {
    reading_ = false;
    if (pending_ && value) { std::move(pending_).Run(std::move(value)); reread_ = false; }
    else if (std::exchange(reread_, false)) Read();
  }
  base::FilePath root_;
  uint64_t sequence_ = 0, device_ = 0, inode_ = 0;
  Reply pending_;
  bool reading_ = false, reread_ = false, dirty_ = false, failed_ = false;
  std::unique_ptr<base::FilePathWatcher> watcher_;
  base::WeakPtrFactory<WatchState> weak_factory_{this};
};
NativePerformanceMailbox::WatchState::WatchState() = default;
NativePerformanceMailbox::WatchState::~WatchState() { weak_factory_.InvalidateWeakPtrs(); }
NativePerformanceMailbox::NativePerformanceMailbox(base::WeakPtr<WebUIBrowserUI> ui)
    : ui_(ui), watcher_(content::GetIOThreadTaskRunner({})) {}
NativePerformanceMailbox::~NativePerformanceMailbox() { weak_factory_.InvalidateWeakPtrs(); timeout_.Stop(); }
bool NativePerformanceMailbox::Stable() const {
  if (!NativePerformanceObservationEnabled() || !owner_ || !ui_ || !document_.AsRenderFrameHostIfValid()) return false;
  auto current = UniqueOwner(ui_);
  if (!current || current != owner_ || !ui_ || !ui_->web_ui() ||
      ui_->web_ui()->GetRenderFrameHost() != document_.AsRenderFrameHostIfValid()) return false;
  struct stat root, profile;
  return PrivateDirectory(root_, &root) && PrivateDirectory(root_.AppendASCII("profile"), &profile) &&
      static_cast<uint64_t>(root.st_dev) == root_device_ && static_cast<uint64_t>(root.st_ino) == root_inode_ &&
      static_cast<uint64_t>(profile.st_dev) == profile_device_ && static_cast<uint64_t>(profile.st_ino) == profile_inode_;
}
void NativePerformanceMailbox::Next(Reply reply) {
  if (failed_ || pending_ || expected_ || running_ || sequence_ >= 4000) { std::move(reply).Run(Invalid()); return; }
  if (!owner_) {
    owner_ = UniqueOwner(ui_);
    const base::FilePath profile(base::CommandLine::ForCurrentProcess()->GetSwitchValueASCII("user-data-dir"));
    root_ = profile.DirName(); struct stat root, metadata;
    if (!owner_ || !OwnedJourneyFixtureRoot(root_.value()) || !PrivateDirectory(root_, &root) || !PrivateDirectory(profile, &metadata)) { std::move(reply).Run(Invalid()); return; }
    root_device_ = root.st_dev; root_inode_ = root.st_ino; profile_device_ = metadata.st_dev; profile_inode_ = metadata.st_ino;
    document_ = ui_->web_ui()->GetRenderFrameHost()->GetWeakDocumentPtr();
  }
  if (!Stable()) { std::move(reply).Run(Invalid()); return; }
  pending_ = std::move(reply);
  timeout_.Start(FROM_HERE, base::Seconds(30), base::BindOnce(&NativePerformanceMailbox::Refuse, weak_factory_.GetWeakPtr()));
  watcher_.AsyncCall(&WatchState::Wait).WithArgs(root_, sequence_, root_device_, root_inode_,
      base::BindPostTaskToCurrentDefault(base::BindOnce(&NativePerformanceMailbox::Received, weak_factory_.GetWeakPtr())));
}
void NativePerformanceMailbox::Received(std::optional<base::DictValue> request) {
  if (!pending_) return;
  if (!request || !Stable() || !request->FindString("operation") || !request->FindString("sequence")) { Refuse(); return; }
  uint64_t sequence = 0;
  if (!base::StringToUint64(*request->FindString("sequence"), &sequence) || sequence != sequence_ + 1) { Refuse(); return; }
  sequence_ = sequence; expected_ = *request->FindString("operation"); timeout_.Stop();
  std::move(pending_).Run(std::move(request));
}
std::optional<uint64_t> NativePerformanceMailbox::TakeExpected(const std::string& operation) {
  const auto cleanup = ui_ ? ui_->NativeLittleCleanupWindowForTesting() : base::WeakPtr<BrowserWindowInterface>();
#if BUILDFLAG(ENABLE_AUX_SHELL)
  const auto warm_cleanup = ui_ ? ui_->NativeWarmCleanupWindowForTesting() : base::WeakPtr<BrowserWindowInterface>();
  if (warm_cleanup && operation != "completeAuxWarmWindow") { Refuse(); return std::nullopt; }
#endif
  if ((cleanup && operation != "completeLittleWindowPresentation") || !Stable() || !expected_ || *expected_ != operation || running_ ||
      (sample_completion_ ? operation != *sample_completion_ :
          (operation == "completeCdpRetirementMeasurement" || operation == "completeGuestPresentation" || operation == "completeOrganizationWork" ||
           operation == "completeLittleWindowPresentation" || operation == "completeAuxWarmWindow"))) { Refuse(); return std::nullopt; }
  running_ = std::move(expected_); expected_.reset(); return sequence_;
}
bool NativePerformanceMailbox::EmitReply(uint64_t sequence, const std::string& operation, const base::DictValue& record) {
  if (!Stable() || !running_ || *running_ != operation || sequence != sequence_) { Refuse(); return false; }
  const auto* producer = record.FindString("producer");
  const auto* status = record.FindString("status");
  const bool cdp_prepare = operation == "prepareCdpStopMeasurement" || operation == "prepareCdpTakeoverMeasurement";
  const bool cdp = cdp_prepare || operation == "completeCdpRetirementMeasurement";
  const bool warm = operation == "prepareAuxWarmWindow" || operation == "completeAuxWarmWindow";
  const bool little = operation == "prepareLittleWindowPresentation" || operation == "completeLittleWindowPresentation";
  const bool preparation = operation == "prepareSubagentMemoryWorkload";
  const bool process_memory = operation == "sampleProcessMemory";
  const bool memory = operation == "sampleShellMemory" || process_memory;
  const bool prepare_work = operation == "prepareOrganizationAutoArchiveWork" ||
      operation == "prepareOrganizationLiveFolderWork";
  const bool organization = prepare_work || operation == "completeOrganizationWork";
  std::optional<int> measured_window_id = owner_->window_id;
#if BUILDFLAG(ENABLE_AUX_SHELL)
  if (warm && status && *status == "measured") {
    const auto child = ui_->NativeWarmCleanupWindowForTesting();
    auto* child_window = child ? WebUIBrowserWindow::FromBrowser(child.get()) : nullptr;
    const auto child_ui = child_window && child_window->GetWebUIBrowserUI() ?
        child_window->GetWebUIBrowserUI()->GetWeakPtr() : base::WeakPtr<WebUIBrowserUI>();
    const auto child_owner = ReadNativeGuestStageShellOwner(child_ui);
    if (!child || !child_owner || !ui_ || !child_ui ||
        record.FindInt("preparedWindowId") != owner_->window_id ||
        ui_->NativeWarmCleanupWindowForTesting().get() != child.get() ||
        ReadNativeGuestStageShellOwner(child_ui) != child_owner) { Refuse(); return false; }
    measured_window_id = child_owner->window_id;
  }
#endif
  if (!producer || *producer != (cdp ? "aux-native-cdp-retirement" : warm ? "aux-native-warm-window" : preparation ? "aux-native-subagent-preparation" : process_memory ? "aux-native-process-memory" : memory ? "aux-native-shell-memory" :
          organization ? "aux-native-organization-work-v1" :
          little ? "aux-native-little-presentation-upperbound" : "aux-native-guest-presentation") ||
      record.FindInt("version") != 1 || !status ||
      (cdp ? (*status != "armed" && *status != "sampled" && *status != "refused") : preparation ? (*status != "ready" && *status != "refused") : memory ? (*status != "sampled" && *status != "refused") :
          (*status != "ready" && *status != "measured" && *status != "refused")) ||
      (!cdp && *status != "refused" && record.FindInt("windowId") != measured_window_id)) {
    Refuse(); return false;
  }
  if (cdp && *status != "refused") {
    const auto* mode = record.FindString("mode");
    const auto* nonce = record.FindString("nonce");
    const auto* family = record.FindList("registeredRuns");
    const auto* pages = record.FindList("pages");
    const auto* root = record.FindString("rootRunId");
    const auto* incarnation = record.FindString("hostIncarnation");
    const auto generation = record.FindDouble("connectionGeneration");
    const auto* producer_sequence = record.FindString("sequence");
    const auto* armed = record.FindString("armedUs");
    if (record.FindInt("pid") != getpid() ||
        record.FindInt("browserWindowId") != ui_->browser()->GetSessionID().id() ||
        !mode || !nonce || nonce->empty() || !family || family->empty() || family->size() > 128 ||
        !pages || pages->empty() || pages->size() > 20 || !root || root->empty() ||
        !incarnation || incarnation->empty() || !generation || !std::isfinite(*generation) || *generation < 1 || std::floor(*generation) != *generation || !producer_sequence || !armed ||
        (cdp_prepare ? (*status != "armed" || *mode !=
            (operation == "prepareCdpStopMeasurement" ? "stop" : "takeover")) :
            (*status != "sampled" || !sample_scope_))) { Refuse(); return false; }
    auto identity = base::DictValue().Set("mode", *mode).Set("nonce", *nonce)
        .Set("registeredRuns", family->Clone()).Set("rootRunId", *root)
        .Set("hostIncarnation", *incarnation).Set("connectionGeneration", *generation)
        .Set("sequence", *producer_sequence).Set("armedUs", *armed)
        .Set("browserWindowId", *record.FindInt("browserWindowId"));
    if (!cdp_prepare && identity != *sample_scope_) { Refuse(); return false; }
    if (cdp_prepare) sample_scope_ = std::move(identity);
  }
  if (organization && *status != "refused") {
    const auto* scope = record.FindDict("scope");
    const auto* metric = scope ? scope->FindString("metric") : nullptr;
    const char* expected = operation == "prepareOrganizationAutoArchiveWork" ? "auto-archive" : "live-folder-refresh";
    if (record.FindInt("pid") != getpid() || !scope || !metric ||
        scope->FindInt("windowId") != owner_->window_id ||
        (prepare_work ? (*status != "ready" || *metric != expected) :
            (*status != "measured" || !sample_scope_ || *scope != *sample_scope_))) {
      Refuse(); return false;
    }
  }
  auto wrapper = base::DictValue().Set("producer", "aux-native-fixture-reply").Set("version", 1)
      .Set("pid", static_cast<int>(getpid())).Set("windowId", owner_->window_id)
      .Set("sequence", base::NumberToString(sequence)).Set("operation", operation).Set("record", record.Clone());
  std::optional<std::string> json;
  if (warm) {
    std::string canonical;
    if (base::JSONWriter::WriteWithOptions(wrapper,
        base::JSONWriter::OPTIONS_OMIT_DOUBLE_TYPE_PRESERVATION, &canonical)) json = std::move(canonical);
  } else json = base::WriteJson(wrapper);
  if (!json || json->size() > 16000 || !AdmitRecord()) { Refuse(); return false; }
  if (preparation || memory || operation == "completeCdpRetirementMeasurement" || operation == "completeGuestPresentation" || operation == "completeOrganizationWork" ||
      operation == "completeLittleWindowPresentation" || operation == "completeAuxWarmWindow" ||
      *status == "refused") { sample_completion_.reset(); sample_scope_.reset(); }
  else {
    sample_completion_ = cdp ? "completeCdpRetirementMeasurement" : warm ? "completeAuxWarmWindow" : organization ? "completeOrganizationWork" :
        little ? "completeLittleWindowPresentation" : "completeGuestPresentation";
    if (organization) sample_scope_ = record.FindDict("scope")->Clone();
  }
  running_.reset(); fprintf(stderr, "AUX_NATIVE_FIXTURE_REPLY_V1 %s\n", json->c_str()); fflush(stderr); return true;
}
void NativePerformanceMailbox::Refuse() {
  failed_ = true; timeout_.Stop(); watcher_.Reset();
  auto refusal = Invalid();
  if (pending_) std::move(pending_).Run(std::move(refusal));
}
}  // namespace aux
#endif
