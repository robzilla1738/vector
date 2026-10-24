// Copyright 2026 The Aux Authors. BSD-style license: see //LICENSE.
#include "chrome/browser/ui/aux_recent_files_service.h"
#include "chrome/browser/ui/aux_file_operation_lifetime.h"
#include "chrome/browser/ui/aux_chosen_files_service.h"
#include <algorithm>
#include <cstdint>
#include <vector>
#include <map>
#include <memory>
#include <utility>
#include "base/functional/bind.h"
#include "base/memory/weak_ptr.h"
#include "base/memory/raw_ptr.h"
#include "base/strings/string_number_conversions.h"
#include "base/strings/string_util.h"
#include "base/strings/utf_string_conversions.h"
#include "base/supports_user_data.h"
#include "base/task/sequenced_task_runner.h"
#include "base/task/thread_pool.h"
#include "base/time/time.h"
#include "base/uuid.h"
#include "chrome/browser/download/drag_download_item.h"
#include "chrome/browser/profiles/profile.h"
#include "components/download/public/common/download_item.h"
#include "content/public/browser/download_manager.h"
#include "third_party/icu/source/common/unicode/uchar.h"
namespace aux::files {
namespace {
using Item = download::DownloadItem;
using Result = Item::DownloadRenameResult;
constexpr char kStateKey = 0;
base::DictValue Error(const char* message) {
  return base::DictValue().Set("success", false).Set("error", message);
}
bool Eligible(Item* item) {
  return item && item->GetState() == Item::COMPLETE && !item->IsDangerous() &&
      item->GetInsecureDownloadStatus() == Item::SAFE &&
      !item->GetFileExternallyRemoved() && !item->IsSavePackageDownload() &&
      !item->GetTargetFilePath().empty();
}
bool SafeStem(const std::string& value) {
  if (value.empty() || value.size() > 300 || value.front() == '.' ||
      !base::IsStringUTF8(value) || base::TrimWhitespaceASCII(value, base::TRIM_ALL) != value)
    return false;
  auto utf16 = base::UTF8ToUTF16(value);
  if (utf16.size() > 100) return false;
  for (char16_t c : utf16)
    if (u_charType(c) == U_CONTROL_CHAR || u_charType(c) == U_FORMAT_CHAR ||
        c == '/' || c == '\\' || c == ':') return false;
  return true;
}
struct Candidate {
  std::string guid;
  base::FilePath path;
  base::DictValue fingerprint;
  base::Time expires;
};
struct State {
  base::WeakPtr<Profile> profile;
  base::RepeatingCallback<bool()> current;
  Persist persist;
  base::DictValue receipts;
  std::map<std::string, Candidate> candidates;
  std::shared_ptr<FileOperationLifetime> lifetime;
  void SetPending(bool value) {
    if (pending == value) return;
    pending = value;
    if (value) lifetime->Begin(); else lifetime->End();
  }
  uint64_t owner_epoch = 0;
  bool pending = false;
  bool alive = true;
  bool journal_ready = true;
  bool Current() const { return alive && journal_ready && profile && current && current.Run(); }
  Item* Find(const std::string& guid) {
    return alive && profile ? profile->GetDownloadManager()->GetDownloadByGuid(guid) : nullptr;
  }
};
struct OwnerData : base::SupportsUserData::Data {
  explicit OwnerData(Profile* profile) : state(std::make_shared<State>()) {
    state->profile = profile->GetWeakPtr();
    state->lifetime = std::make_shared<FileOperationLifetime>(profile->GetPath());
  }
  ~OwnerData() override { state->lifetime->Revoke(); state->alive = false; state->candidates.clear(); }
  std::shared_ptr<State> state;
};
std::shared_ptr<State> Get(Profile* profile, bool create = true) {
  if (!profile || profile->IsOffTheRecord()) return nullptr;
  auto* data = static_cast<OwnerData*>(profile->GetUserData(&kStateKey));
  if (!data && create) {
    auto owned = std::make_unique<OwnerData>(profile);
    data = owned.get(); profile->SetUserData(&kStateKey, std::move(owned));
  }
  return data ? data->state : nullptr;
}
// The move task has its own completion receipt. DownloadItem's weak reply may
// disappear on removal; that is not a false indication the physical task ended.
struct Rename : Item::Observer, std::enable_shared_from_this<Rename> {
  std::shared_ptr<State> state;
  Candidate candidate;
  std::string stem, receipt_id, original, filename;
  bool undo = false, physical_done = false, item_reply = false;
  bool recover_only = false, keep_pending = false;
  int attempt = 1;
  Result result = Result::FAILURE_UNKNOWN;
  raw_ptr<Item> item = nullptr;
  Reply reply;
  ~Rename() override { if (item) item->RemoveObserver(this); }
  void OnDownloadDestroyed(Item* destroyed) override { item = nullptr; MaybeFinish(); }
  void OnDownloadRemoved(Item* removed) override { /* The actual destroy/task decides settlement. */ }
  void Finish(base::DictValue value) {
    if (!reply) return;
    if (item) { item->RemoveObserver(this); item = nullptr; }
    auto done = std::move(reply);
    if (!keep_pending) { state->SetPending(false); }
    std::move(done).Run(std::move(value));
  }
  void Start() {
    auto* found = state->Find(candidate.guid);
    if (!state->Current() || !Eligible(found) || found->GetTargetFilePath() != candidate.path) {
      Finish(Error("Download or profile changed; nothing was renamed.")); return;
    }
    filename = recover_only ? filename : undo ? original : stem + (attempt == 1 ? "" : " (" + base::NumberToString(attempt) + ")") + candidate.path.Extension();
    if (filename == candidate.path.BaseName().AsUTF8Unsafe()) {
      Finish(Error("The download already has that name.")); return;
    }
    base::DictValue receipt;
    receipt.Set("downloadGuid", candidate.guid);
    receipt.Set("originalName", original);
    receipt.Set("sourceName", candidate.path.BaseName().AsUTF8Unsafe());
    receipt.Set("filename", filename);
    receipt.Set("fingerprint", candidate.fingerprint.Clone());
    receipt.Set("phase", undo ? "undo-planned" : "planned");
    receipt.Set("expiresAt", static_cast<double>((base::Time::Now() + base::Days(7)).InMillisecondsSinceUnixEpoch()));
    state->receipts.Set(receipt_id, std::move(receipt));
    state->persist.Run(state->receipts.Clone(), base::BindOnce(&Rename::Prepared, shared_from_this()));
  }
  void Prepared(bool durable) {
    if (!durable) state->journal_ready = false;
    auto* found = state->Find(candidate.guid);
    if (!durable || !state->Current() || !Eligible(found) || found->GetTargetFilePath() != candidate.path) {
      Finish(Error("The rename could not be safely prepared.")); return;
    }
    item = found; item->AddObserver(this);
    auto ui = base::SequencedTaskRunner::GetCurrentDefault();
    item->RenameWithMove(base::FilePath::FromUTF8Unsafe(filename),
      base::BindOnce([](std::shared_ptr<Rename> operation,
                       scoped_refptr<base::SequencedTaskRunner> ui,
                       std::shared_ptr<const std::atomic_bool> authorization,
                       const base::FilePath& source, const base::FilePath& destination) {
        auto result = !authorization->load(std::memory_order_acquire) ? Result::FAILURE_UNAVAILABLE : operation->recover_only
            ? (InspectRegularFileMove(operation->candidate.fingerprint, source, destination) == 1
                ? Result::SUCCESS : Result::FAILURE_UNAVAILABLE)
            : static_cast<Result>(MoveRegularFileExclusive(
                operation->candidate.fingerprint, operation->candidate.path, source, destination,
                authorization));
        ui->PostTask(FROM_HERE, base::BindOnce(&Rename::PhysicalDone, operation, result));
        return result;
      }, shared_from_this(), ui, state->lifetime->authorization()),
      base::BindOnce(&Rename::ItemDone, shared_from_this()));
  }
  void PhysicalDone(Result value) { physical_done = true; result = value; MaybeFinish(); }
  void ItemDone(Result value) { item_reply = true; result = value; MaybeFinish(); }
  void MaybeFinish() {
    if (!physical_done || (!item_reply && item)) return;
    if (item) { item->RemoveObserver(this); item = nullptr; }
    if (result == Result::FAILURE_NAME_CONFLICT && !undo && attempt < 20 && state->Current()) {
      ++attempt; physical_done = false; item_reply = false; Start(); return;
    }
    auto* receipt = state->receipts.FindDict(receipt_id);
    if (receipt) receipt->Set("phase", result == Result::SUCCESS ? (undo ? "undone" : "complete") : "failed");
    if (!state->Current()) {
      Finish(Error("Profile closed; the prepared rename receipt requires recovery.")); return;
    }
    state->persist.Run(state->receipts.Clone(), base::BindOnce(&Rename::Recorded, shared_from_this()));
  }
  void Recorded(bool durable) {
    if (!durable) state->journal_ready = false;
    if (result != Result::SUCCESS) {
      Finish(Error(result == Result::FAILURE_NAME_CONFLICT ? "That filename is already in use." : "The file changed or is no longer available.")); return;
    }
    if (!durable) { Finish(Error("File renamed; its prepared receipt requires recovery.")); return; }
    Finish(base::DictValue().Set("success", true).Set("filename", filename)
        .Set("receiptId", receipt_id).Set("undone", undo));
  }
};
// Reconcile only native DownloadManager GUIDs and the previously journaled
// same-directory names. Never guess a new path or move an unrelated replacement.
struct Recovery : content::DownloadManager::Observer, std::enable_shared_from_this<Recovery> {
  std::shared_ptr<State> state;
  std::vector<std::string> ids;
  size_t index = 0;
  bool changed = false;
  uint64_t epoch = 0;
  raw_ptr<content::DownloadManager> waiting_manager = nullptr;
  std::shared_ptr<Recovery> waiting_self;
  ~Recovery() override { if (waiting_manager) waiting_manager->RemoveObserver(this); }
  void Start() {
    if (!Current()) { Finish(); return; }
    auto* manager = state->profile->GetDownloadManager();
    if (manager->IsManagerInitialized()) { Next(); return; }
    waiting_self = shared_from_this(); waiting_manager = manager;
    manager->AddObserver(this);
  }
  void OnManagerInitialized() override {
    auto keep_alive = std::move(waiting_self);
    waiting_manager->RemoveObserver(this); waiting_manager = nullptr;
    Next();
  }
  void ManagerGoingDown(content::DownloadManager* manager) override {
    auto keep_alive = std::move(waiting_self);
    manager->RemoveObserver(this); waiting_manager = nullptr;
    // No file operation was dispatched while history was unavailable.
    Finish();
  }
  void Finish() {
    state->SetPending(false);
  }
  bool Current() const { return state->Current() && state->owner_epoch == epoch; }
  void Next() {
    if (!Current()) { Finish(); return; }
    if (index == ids.size()) {
      if (changed) state->persist.Run(state->receipts.Clone(), base::BindOnce(
          [](std::shared_ptr<Recovery> recovery, bool durable) {
            if (!durable) recovery->state->journal_ready = false;
            recovery->Finish(); }, shared_from_this()));
      else Finish();
      return;
    }
    const auto id = ids[index++];
    auto* receipt = state->receipts.FindDict(id);
    const auto* guid = receipt ? receipt->FindString("downloadGuid") : nullptr;
    const auto* original = receipt ? receipt->FindString("originalName") : nullptr;
    const auto* target_name = receipt ? receipt->FindString("filename") : nullptr;
    const auto* phase = receipt ? receipt->FindString("phase") : nullptr;
    const auto* source_name = receipt ? receipt->FindString("sourceName") : nullptr;
    const auto* fingerprint = receipt ? receipt->FindDict("fingerprint") : nullptr;
    if (!source_name && phase && *phase == "planned") source_name = original;
    auto* item = guid ? state->Find(*guid) : nullptr;
    auto safe = [](const std::string* name) {
      return name && !name->empty() && *name != "." && *name != ".." &&
          base::FilePath::FromUTF8Unsafe(*name).BaseName().AsUTF8Unsafe() == *name;
    };
    if (!Eligible(item) || !safe(source_name) || !safe(target_name) ||
        !safe(original) || !fingerprint || !phase) { Conflict(id); return; }
    const auto path = item->GetTargetFilePath();
    const auto source = path.DirName().Append(base::FilePath::FromUTF8Unsafe(*source_name));
    const auto destination = path.DirName().Append(base::FilePath::FromUTF8Unsafe(*target_name));
    if (path != source && path != destination) { Conflict(id); return; }
    base::ThreadPool::PostTaskAndReplyWithResult(FROM_HERE, {base::MayBlock()},
        base::BindOnce(&InspectRegularFileMove, fingerprint->Clone(), source, destination),
        base::BindOnce(&Recovery::Inspected, shared_from_this(), id, *guid,
                       path, source, destination, fingerprint->Clone(), *original,
                       *phase == "undo-planned"));
  }
  void Conflict(const std::string& id) {
    if (auto* receipt = state->receipts.FindDict(id)) receipt->Set("phase", "needs-review");
    changed = true; Next();
  }
  void Inspected(std::string id, std::string guid, base::FilePath captured,
                 base::FilePath source, base::FilePath destination,
                 base::DictValue fingerprint, std::string original, bool undo,
                 int outcome) {
    if (!Current()) { Finish(); return; }
    auto* item = state->Find(guid);
    if (!Eligible(item) || item->GetTargetFilePath() != captured) { Conflict(id); return; }
    if (outcome == 0 && captured == source) {
      state->receipts.FindDict(id)->Set("phase", "failed"); changed = true; Next(); return;
    }
    if (outcome != 1) { Conflict(id); return; }
    if (captured == destination) {
      state->receipts.FindDict(id)->Set("phase", undo ? "undone" : "complete");
      changed = true; Next(); return;
    }
    auto request = std::make_shared<Rename>(); request->state = state;
    request->candidate = Candidate{guid, source, std::move(fingerprint), base::Time::Now() + base::Minutes(1)};
    request->filename = destination.BaseName().AsUTF8Unsafe(); request->original = original;
    request->receipt_id = id; request->undo = undo; request->recover_only = true; request->keep_pending = true;
    request->reply = base::BindOnce([](std::shared_ptr<Recovery> recovery, base::DictValue result) {
      recovery->Next();
    }, shared_from_this());
    request->Start();
  }
};
void RecoverPending(const std::shared_ptr<State>& state) {
  if (!state->Current() || !state->persist || state->pending) return;
  auto recovery = std::make_shared<Recovery>(); recovery->state = state; recovery->epoch = state->owner_epoch;
  for (const auto [id, value] : state->receipts) {
    const auto* receipt = value.GetIfDict(); const auto* phase = receipt ? receipt->FindString("phase") : nullptr;
    if (phase && (*phase == "planned" || *phase == "undo-planned")) recovery->ids.push_back(id);
  }
  if (recovery->ids.empty()) return;
  state->SetPending(true); recovery->Start();
}
}  // namespace
void SetWriteOwner(Profile* profile, base::RepeatingCallback<bool()> current,
                   Persist persist, base::DictValue restored) {
  auto state = Get(profile);
  if (!state) return;
  state->lifetime->Revoke();
  if (HasFileOperationsPending(profile->GetPath())) return;
  state->lifetime = std::make_shared<FileOperationLifetime>(profile->GetPath());
  ++state->owner_epoch; state->journal_ready = true;
  state->current = std::move(current); state->persist = std::move(persist);
  state->receipts = std::move(restored); state->candidates.clear();
  RecoverPending(state);
}
bool HasPendingWrite(Profile* profile) {
  return profile && HasFileOperationsPending(profile->GetPath());
}
base::CallbackListSubscription ObserveSettled(Profile* profile, base::RepeatingClosure callback) {
  return profile ? ObserveFileOperationsSettled(profile->GetPath(), std::move(callback)) : base::CallbackListSubscription();
}
base::DictValue ListRecentFiles(Profile* profile) {
  auto state = Get(profile);
  if (!state) return Error("Recent files are unavailable in this profile.");
  download::SimpleDownloadManager::DownloadVector items;
  profile->GetDownloadManager()->GetAllDownloads(&items);
  std::ranges::sort(items, [](const Item* a, const Item* b) { return a->GetEndTime() > b->GetEndTime(); });
  base::ListValue rows = ListChosenFiles(profile);
  int download_count = 0;
  for (Item* item : items) {
    if (item->GetState() != Item::COMPLETE || item->IsDangerous()) continue;
    rows.Append(base::DictValue().Set("id", item->GetGuid())
        .Set("name", item->GetTargetFilePath().BaseName().AsUTF8Unsafe())
        .Set("mime", item->GetMimeType()).Set("sourceHost", item->GetURL().host())
        .Set("selectedAt", static_cast<double>(item->GetEndTime().InMillisecondsSinceUnixEpoch()))
        .Set("available", Eligible(item)).Set("source", "download"));
    if (++download_count >= 50) break;
  }
  std::ranges::sort(rows, [](const base::Value& a, const base::Value& b) {
    return a.GetDict().FindDouble("selectedAt").value_or(0) > b.GetDict().FindDouble("selectedAt").value_or(0);
  });
  while (rows.size() > 50) rows.erase(rows.end() - 1);
  base::ListValue receipts;
  for (const auto [id, value] : state->receipts) {
    const auto* receipt = value.GetIfDict();
    if (!receipt) continue;
    const auto* phase = receipt->FindString("phase");
    if (!phase || (*phase != "complete" && *phase != "planned" && *phase != "undo-planned" && *phase != "needs-review")) continue;
    auto visible = receipt->Clone(); visible.Remove("fingerprint"); visible.Set("id", id);
    receipts.Append(std::move(visible));
  }
  return base::DictValue().Set("success", true).Set("files", std::move(rows))
      .Set("renameAvailable", state->Current() && !!state->persist && !state->pending)
      .Set("receipts", std::move(receipts));
}
void PrepareDownloadRename(Profile* profile, const std::string& guid, Reply reply) {
  auto state = Get(profile);
  auto* item = state ? state->Find(guid) : nullptr;
  if (!state || !state->Current() || !state->persist || state->pending || !Eligible(item)) {
    std::move(reply).Run(Error("This download cannot be renamed right now.")); return;
  }
  const auto path = item->GetTargetFilePath();
  const uint64_t owner_epoch = state->owner_epoch;
  const auto metadata = base::DictValue().Set("downloadId", guid)
      .Set("filename", path.BaseName().AsUTF8Unsafe())
      .Set("mime", item->GetMimeType()).Set("sourceHost", item->GetURL().host())
      .Set("extension", path.Extension());
  base::ThreadPool::PostTaskAndReplyWithResult(FROM_HERE, {base::MayBlock()},
    base::BindOnce(&FingerprintRegularFile, path),
    base::BindOnce([](std::shared_ptr<State> state, std::string guid, base::FilePath path,
                     base::DictValue metadata, uint64_t owner_epoch, Reply reply,
                     std::optional<base::DictValue> fingerprint) {
      auto* item = state->Find(guid);
      if (!fingerprint || state->owner_epoch != owner_epoch || !state->Current() || !Eligible(item) || item->GetTargetFilePath() != path) {
        std::move(reply).Run(Error("The file moved or is unavailable.")); return;
      }
      std::erase_if(state->candidates, [](const auto& entry) { return entry.second.expires < base::Time::Now(); });
      if (state->candidates.size() >= 64) { std::move(reply).Run(Error("Too many pending file reviews.")); return; }
      auto token = base::Uuid::GenerateRandomV4().AsLowercaseString();
      state->candidates.emplace(token, Candidate{guid, path, std::move(*fingerprint), base::Time::Now() + base::Minutes(10)});
      metadata.Set("capability", token); metadata.Set("success", true);
      std::move(reply).Run(std::move(metadata));
    }, state, guid, path, metadata.Clone(), owner_epoch, std::move(reply)));
}
void ApplyDownloadRename(Profile* profile, const std::string& capability,
                         const std::string& stem, Reply reply) {
  auto state = Get(profile, false);
  auto found = state ? state->candidates.find(capability) : std::map<std::string, Candidate>::iterator();
  if (!state || !state->Current() || !state->persist || state->pending ||
      found == state->candidates.end() || found->second.expires < base::Time::Now() || !SafeStem(stem)) {
    std::move(reply).Run(Error("Rename review expired or the name is invalid.")); return;
  }
  std::vector<std::string> expired;
  for (const auto [id, value] : state->receipts) {
    const auto* receipt = value.GetIfDict();
    const auto expiry = receipt ? receipt->FindDouble("expiresAt") : std::nullopt;
    const auto* phase = receipt ? receipt->FindString("phase") : nullptr;
    if (expiry && phase && *phase != "planned" && *phase != "undo-planned" &&
        *expiry < base::Time::Now().InMillisecondsSinceUnixEpoch()) expired.push_back(id);
  }
  for (const auto& id : expired) state->receipts.Remove(id);
  if (state->receipts.size() >= 1000) { std::move(reply).Run(Error("Rename receipt storage is full.")); return; }
  auto request = std::make_shared<Rename>(); request->state = state;
  request->candidate = std::move(found->second); state->candidates.erase(found);
  request->original = request->candidate.path.BaseName().AsUTF8Unsafe();
  request->stem = stem; request->receipt_id = base::Uuid::GenerateRandomV4().AsLowercaseString();
  request->reply = std::move(reply); state->SetPending(true); request->Start();
}
void UndoDownloadRename(Profile* profile, const std::string& id, Reply reply) {
  auto state = Get(profile, false);
  const auto* receipt = state ? state->receipts.FindDict(id) : nullptr;
  const auto* guid = receipt ? receipt->FindString("downloadGuid") : nullptr;
  const auto* original = receipt ? receipt->FindString("originalName") : nullptr;
  const auto* filename = receipt ? receipt->FindString("filename") : nullptr;
  const auto* phase = receipt ? receipt->FindString("phase") : nullptr;
  const auto* fingerprint = receipt ? receipt->FindDict("fingerprint") : nullptr;
  auto expires = receipt ? receipt->FindDouble("expiresAt") : std::nullopt;
  auto* item = guid && state ? state->Find(*guid) : nullptr;
  if (!state || !state->Current() || !state->persist || state->pending || !Eligible(item) ||
      !original || original->empty() || *original == "." || *original == ".." ||
      !filename || !phase || *phase != "complete" || !fingerprint ||
      !expires || *expires < base::Time::Now().InMillisecondsSinceUnixEpoch() ||
      item->GetTargetFilePath().BaseName().AsUTF8Unsafe() != *filename ||
      base::FilePath::FromUTF8Unsafe(*original).BaseName().AsUTF8Unsafe() != *original) {
    std::move(reply).Run(Error("Undo is unavailable; the download or receipt changed.")); return;
  }
  auto request = std::make_shared<Rename>(); request->state = state;
  request->candidate = Candidate{*guid, item->GetTargetFilePath(), fingerprint->Clone(), base::Time::Now() + base::Minutes(1)};
  request->original = *original; request->receipt_id = id; request->undo = true;
  request->reply = std::move(reply); state->SetPending(true); request->Start();
}
base::DictValue DragRecentDownload(Profile* profile, const std::string& guid,
                                   gfx::NativeView view) {
  if (guid.starts_with("chosen:")) return DragChosenFile(profile, guid, view);
  auto state = Get(profile); auto* item = state ? state->Find(guid) : nullptr;
  if (!Eligible(item) || !view) return Error("The downloaded file is unavailable.");
  DragDownloadItem(item, nullptr, view);
  return base::DictValue().Set("success", true);
}
base::DictValue RevealRecentFile(Profile* profile, const std::string& id) {
  if (id.starts_with("chosen:")) return RevealChosenFile(profile, id);
  auto state = Get(profile); auto* item = state ? state->Find(id) : nullptr;
  if (!Eligible(item) || !item->CanShowInFolder()) return Error("The downloaded file is unavailable.");
  item->ShowDownloadInShell();
  return base::DictValue().Set("success", true);
}
}  // namespace aux::files
