// Copyright 2026 The Aux Authors. BSD-style license: see //LICENSE.
#include "chrome/browser/ui/aux_recent_files_service.h"
#include <algorithm>
#include <cstdint>
#include <vector>
#include <map>
#include <memory>
#include <utility>
#include "base/functional/bind.h"
#include "base/memory/weak_ptr.h"
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
  base::RepeatingClosureList settled;
  uint64_t owner_epoch = 0;
  bool pending = false;
  bool alive = true;
  bool Current() const { return alive && profile && current && current.Run(); }
  Item* Find(const std::string& guid) {
    return alive && profile ? profile->GetDownloadManager()->GetDownloadByGuid(guid) : nullptr;
  }
};
struct OwnerData : base::SupportsUserData::Data {
  explicit OwnerData(Profile* profile) : state(std::make_shared<State>()) {
    state->profile = profile->GetWeakPtr();
  }
  ~OwnerData() override { state->alive = false; state->candidates.clear(); }
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
  int attempt = 1;
  Result result = Result::FAILURE_UNKNOWN;
  Item* item = nullptr;
  Reply reply;
  ~Rename() override { if (item) item->RemoveObserver(this); }
  void OnDownloadDestroyed(Item* destroyed) override { item = nullptr; MaybeFinish(); }
  void OnDownloadRemoved(Item* removed) override { /* The actual destroy/task decides settlement. */ }
  void Finish(base::DictValue value) {
    if (!reply) return;
    if (item) { item->RemoveObserver(this); item = nullptr; }
    auto done = std::move(reply);
    state->pending = false;
    state->settled.Notify();
    std::move(done).Run(std::move(value));
  }
  void Start() {
    auto* found = state->Find(candidate.guid);
    if (!state->Current() || !Eligible(found) || found->GetTargetFilePath() != candidate.path) {
      Finish(Error("Download or profile changed; nothing was renamed.")); return;
    }
    filename = undo ? original : stem + (attempt == 1 ? "" : " (" + base::NumberToString(attempt) + ")") + candidate.path.Extension();
    if (filename == candidate.path.BaseName().AsUTF8Unsafe()) {
      Finish(Error("The download already has that name.")); return;
    }
    base::DictValue receipt;
    receipt.Set("downloadGuid", candidate.guid);
    receipt.Set("originalName", original);
    receipt.Set("filename", filename);
    receipt.Set("fingerprint", candidate.fingerprint.Clone());
    receipt.Set("phase", undo ? "undo-planned" : "planned");
    receipt.Set("expiresAt", static_cast<double>((base::Time::Now() + base::Days(7)).InMillisecondsSinceUnixEpoch()));
    state->receipts.Set(receipt_id, std::move(receipt));
    state->persist.Run(state->receipts.Clone(), base::BindOnce(&Rename::Prepared, shared_from_this()));
  }
  void Prepared(bool durable) {
    auto* found = state->Find(candidate.guid);
    if (!durable || !state->Current() || !Eligible(found) || found->GetTargetFilePath() != candidate.path) {
      Finish(Error("The rename could not be safely prepared.")); return;
    }
    item = found; item->AddObserver(this);
    auto ui = base::SequencedTaskRunner::GetCurrentDefault();
    item->RenameWithMove(base::FilePath::FromUTF8Unsafe(filename),
      base::BindOnce([](std::shared_ptr<Rename> operation,
                       scoped_refptr<base::SequencedTaskRunner> ui,
                       const base::FilePath& source, const base::FilePath& destination) {
        auto result = static_cast<Result>(MoveRegularFileExclusive(
            operation->candidate.fingerprint, operation->candidate.path, source, destination));
        ui->PostTask(FROM_HERE, base::BindOnce(&Rename::PhysicalDone, operation, result));
        return result;
      }, shared_from_this(), ui),
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
    if (result != Result::SUCCESS) {
      Finish(Error(result == Result::FAILURE_NAME_CONFLICT ? "That filename is already in use." : "The file changed or is no longer available.")); return;
    }
    if (!durable) { Finish(Error("File renamed; its prepared receipt requires recovery.")); return; }
    Finish(base::DictValue().Set("success", true).Set("filename", filename)
        .Set("receiptId", receipt_id).Set("undone", undo));
  }
};
}  // namespace
void SetWriteOwner(Profile* profile, base::RepeatingCallback<bool()> current,
                   Persist persist, base::DictValue restored) {
  auto state = Get(profile);
  if (!state || state->pending) return;
  ++state->owner_epoch;
  state->current = std::move(current); state->persist = std::move(persist);
  state->receipts = std::move(restored); state->candidates.clear();
}
bool HasPendingWrite(Profile* profile) {
  auto state = Get(profile, false); return state && state->pending;
}
base::CallbackListSubscription ObserveSettled(Profile* profile, base::RepeatingClosure callback) {
  auto state = Get(profile); return state ? state->settled.Add(std::move(callback)) : base::CallbackListSubscription();
}
base::DictValue ListRecentFiles(Profile* profile) {
  auto state = Get(profile);
  if (!state) return Error("Recent files are unavailable in this profile.");
  download::SimpleDownloadManager::DownloadVector items;
  profile->GetDownloadManager()->GetAllDownloads(&items);
  std::ranges::sort(items, [](const Item* a, const Item* b) { return a->GetEndTime() > b->GetEndTime(); });
  base::ListValue rows;
  for (auto* item : items) {
    if (item->GetState() != Item::COMPLETE || item->IsDangerous()) continue;
    rows.Append(base::DictValue().Set("id", item->GetGuid())
        .Set("name", item->GetTargetFilePath().BaseName().AsUTF8Unsafe())
        .Set("mime", item->GetMimeType()).Set("sourceHost", item->GetURL().host())
        .Set("available", Eligible(item)).Set("source", "download"));
    if (rows.size() >= 50) break;
  }
  base::ListValue receipts;
  for (const auto [id, value] : state->receipts) {
    const auto* receipt = value.GetIfDict();
    if (!receipt) continue;
    const auto* phase = receipt->FindString("phase");
    if (!phase || (*phase != "complete" && *phase != "planned" && *phase != "undo-planned")) continue;
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
  request->reply = std::move(reply); state->pending = true; request->Start();
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
  request->reply = std::move(reply); state->pending = true; request->Start();
}
base::DictValue DragRecentDownload(Profile* profile, const std::string& guid,
                                   gfx::NativeView view) {
  auto state = Get(profile); auto* item = state ? state->Find(guid) : nullptr;
  if (!Eligible(item) || !view) return Error("The downloaded file is unavailable.");
  DragDownloadItem(item, nullptr, view);
  return base::DictValue().Set("success", true);
}
}  // namespace aux::files
