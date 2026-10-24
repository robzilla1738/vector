// Copyright 2026 The Aux Authors. BSD-style license: see //LICENSE.
#include "chrome/browser/ui/aux_chosen_files_service.h"
#include "chrome/browser/ui/aux_file_operation_lifetime.h"
#include <algorithm>
#include <memory>
#include <utility>
#include "base/functional/bind.h"
#include "base/memory/weak_ptr.h"
#include "base/supports_user_data.h"
#include "base/task/thread_pool.h"
#include "base/time/time.h"
#include "base/uuid.h"
#include "chrome/browser/aux/component_bootstrap.h"
#include "chrome/browser/platform_util.h"
#include "chrome/browser/profiles/profile.h"
#include "content/public/browser/render_frame_host.h"
#include "extensions/browser/extension_registry.h"
#include "extensions/common/constants.h"
namespace aux::files {
namespace {
constexpr char kChosenKey = 0;
base::DictValue Error() { return base::DictValue().Set("success", false).Set("error", "The selected file is no longer available; attach it again."); }
struct State {
  base::WeakPtr<Profile> profile;
  base::RepeatingCallback<bool()> current;
  Persist persist;
  base::DictValue files;
  base::RepeatingClosureList changed;
  std::shared_ptr<FileOperationLifetime> lifetime;
  bool SetPending(bool value, aux::features::NativeFeatureIoOutcome outcome =
                                 aux::features::NativeFeatureIoOutcome::kCompleted) {
    if (pending == value) return true;
    if (value && !lifetime->Begin()) return false;
    pending = value;
    if (!value) lifetime->End(outcome);
    return true;
  }
  uint64_t epoch = 0;
  bool pending = false, ready = true;
  bool Current() const { return profile && ready && current && current.Run(); }
};
struct Owner : base::SupportsUserData::Data {
  explicit Owner(Profile* profile) : state(std::make_shared<State>()) { state->profile = profile->GetWeakPtr(); state->lifetime = std::make_shared<FileOperationLifetime>(profile->GetPath()); }
  ~Owner() override { state->lifetime->Revoke(); state->current.Reset(); state->ready = false; }
  std::shared_ptr<State> state;
};
std::shared_ptr<State> Get(Profile* profile, bool create = true) {
  if (!profile || profile->IsOffTheRecord()) return nullptr;
  auto* owner = static_cast<Owner*>(profile->GetUserData(&kChosenKey));
  if (!owner && create) { auto value = std::make_unique<Owner>(profile); owner = value.get(); profile->SetUserData(&kChosenKey, std::move(value)); }
  return owner ? owner->state : nullptr;
}
Profile* AgentProfile(content::WeakDocumentPtr document) {
  auto* frame = document.AsRenderFrameHostIfValid();
  if (!frame) return nullptr;
  const auto& origin = frame->GetLastCommittedOrigin();
  auto* profile = Profile::FromBrowserContext(frame->GetBrowserContext());
  if (!profile || profile->IsOffTheRecord() || origin.scheme() != extensions::kExtensionScheme ||
      origin.host() != aux::kAgentExtensionId) return nullptr;
  auto* registry = extensions::ExtensionRegistry::Get(profile);
  return registry && registry->enabled_extensions().Contains(aux::kAgentExtensionId) ? profile : nullptr;
}
bool ValidEntry(const base::DictValue& file) {
  const auto* path = file.FindString("path");
  const auto* fp = file.FindDict("fingerprint");
  if (!path || path->size() > 16384 || !fp || !file.FindDouble("selectedAt")) return false;
  const auto native = base::FilePath::FromUTF8Unsafe(*path);
  if (!native.IsAbsolute() || native.ReferencesParent() || native.BaseName().empty()) return false;
  for (const char* field : {"device", "inode", "size", "modifiedSeconds", "modifiedNanos"})
    if (!fp->FindString(field) || fp->FindString(field)->size() > 24) return false;
  return true;
}
const base::DictValue* Find(const std::shared_ptr<State>& state, const std::string& id) {
  if (!state || !state->Current() || !id.starts_with("chosen:")) return nullptr;
  const auto* file = state->files.FindDict(id.substr(7));
  return file && ValidEntry(*file) ? file : nullptr;
}
base::DictValue FingerprintSelection(std::vector<base::FilePath> paths) {
  base::DictValue selected;
  for (const auto& path : paths) {
    auto fingerprint = FingerprintRegularFile(path);
    if (!fingerprint) continue;
    selected.Set(base::Uuid::GenerateRandomV4().AsLowercaseString(),
        base::DictValue().Set("path", path.AsUTF8Unsafe()).Set("fingerprint", std::move(*fingerprint))
            .Set("selectedAt", static_cast<double>(base::Time::Now().InMillisecondsSinceUnixEpoch())));
  }
  return selected;
}
}  // namespace
void SetChosenFilesWriteOwner(Profile* profile, base::RepeatingCallback<bool()> current,
                              Persist persist, base::DictValue restored) {
  auto state = Get(profile); if (!state) return;
  state->lifetime->Revoke();
  if (state->pending) return;
  state->lifetime = std::make_shared<FileOperationLifetime>(profile->GetPath());
  state->epoch++; state->current = std::move(current); state->persist = std::move(persist);
  state->files.clear(); state->ready = true;
  for (auto [id, value] : restored) {
    const auto* file = value.GetIfDict();
    if (base::Uuid::ParseLowercase(id).is_valid() && file && ValidEntry(*file))
      state->files.Set(id, file->Clone());
    if (state->files.size() == 50) break;
  }
  state->changed.Notify();
}
bool HasChosenFilesWritePending(Profile* profile) {
  return profile && HasFileOperationsPending(profile->GetPath());
}
base::CallbackListSubscription ObserveChosenFilesSettled(Profile* profile, base::RepeatingClosure callback) {
  return profile ? ObserveFileOperationsSettled(profile->GetPath(), std::move(callback)) : base::CallbackListSubscription();
}
base::CallbackListSubscription ObserveChosenFilesChanged(Profile* profile, base::RepeatingClosure callback) {
  auto state = Get(profile); return state ? state->changed.Add(std::move(callback)) : base::CallbackListSubscription();
}
void RegisterChosenFiles(content::WeakDocumentPtr document,
    blink::mojom::FileChooserParams::Mode mode,
    const std::vector<blink::mojom::FileChooserFileInfoPtr>& selection) {
  using Mode = blink::mojom::FileChooserParams::Mode;
  if (mode != Mode::kOpen && mode != Mode::kOpenMultiple) return;
  Profile* profile = AgentProfile(document);
  auto state = Get(profile);
  if (!state || !state->Current() || !state->persist || state->pending) return;
  std::vector<base::FilePath> paths;
  for (const auto& entry : selection) {
    if (!entry || !entry->is_native_file()) continue;
    const auto& path = entry->get_native_file()->file_path;
    if (!path.IsAbsolute() || path.ReferencesParent()) continue;
    paths.push_back(path);
    if (paths.size() == 50) break;
  }
  if (paths.empty()) return;
  if (!state->SetPending(true)) return;
  const uint64_t epoch = state->epoch;
  const bool posted = base::ThreadPool::PostTaskAndReplyWithResult(
    FROM_HERE, {base::MayBlock()},
    base::BindOnce(&FingerprintSelection, std::move(paths)),
    base::BindOnce([](std::shared_ptr<State> state, uint64_t epoch,
                     content::WeakDocumentPtr document, base::DictValue selected) {
      if (!state->Current() || epoch != state->epoch || AgentProfile(document) != state->profile.get()) {
        state->SetPending(false); return;
      }
      auto merged = state->files.Clone();
      for (auto [id, value] : selected) {
        const auto* path = value.GetDict().FindString("path");
        std::vector<std::string> duplicates;
        for (const auto [existing_id, existing] : merged)
          if (existing.GetDict().FindString("path") && *existing.GetDict().FindString("path") == *path)
            duplicates.push_back(existing_id);
        for (const auto& old : duplicates) merged.Remove(old);
        merged.Set(id, value.Clone());
      }
      std::vector<std::pair<double, std::string>> order;
      for (const auto [id, value] : merged) order.emplace_back(value.GetDict().FindDouble("selectedAt").value_or(0), id);
      std::ranges::sort(order);
      while (order.size() > 50) { merged.Remove(order.front().second); order.erase(order.begin()); }
      auto saved = merged.Clone();
      state->persist.Run(std::move(saved), base::BindOnce([](std::shared_ptr<State> state,
          uint64_t epoch, base::DictValue merged, bool durable) {
        state->ready = durable;
        if (durable && epoch == state->epoch && state->profile) state->files = std::move(merged);
        state->changed.Notify();
        state->SetPending(false);
      }, state, epoch, std::move(merged)));
    }, state, epoch, document));
  if (!posted) {
    // ThreadPool documents false as a definite non-start. Its relay destroys
    // the task/reply on this origin sequence without invoking either; this
    // local shared owner remains valid. No fingerprint or persistence task
    // was submitted, so release only this known refusal. A true result leaves
    // all accounting to the existing actual completion/persistence callbacks.
    state->SetPending(false, aux::features::NativeFeatureIoOutcome::kRefused);
  }
}
base::ListValue ListChosenFiles(Profile* profile) {
  base::ListValue result;
  auto state = Get(profile, false);
  if (!state || !state->Current()) return result;
  std::vector<std::pair<double, std::string>> order;
  for (const auto [id, value] : state->files) order.emplace_back(value.GetDict().FindDouble("selectedAt").value_or(0), id);
  std::ranges::sort(order, std::greater<>());
  for (const auto& [time, id] : order) {
    const auto& file = *state->files.FindDict(id);
    const auto path = base::FilePath::FromUTF8Unsafe(*file.FindString("path"));
    result.Append(base::DictValue().Set("id", "chosen:" + id).Set("name", path.BaseName().AsUTF8Unsafe())
        .Set("source", "chosen").Set("available", true).Set("selectedAt", time)
        .Set("sourceHost", "Selected in Aux"));
  }
  return result;
}
base::DictValue DragChosenFile(Profile* profile, const std::string& id, gfx::NativeView view) {
  auto state = Get(profile, false); const auto* file = Find(state, id);
  if (!file || !view || !BeginVerifiedFileDrag(base::FilePath::FromUTF8Unsafe(*file->FindString("path")),
                                               *file->FindDict("fingerprint"), view)) return Error();
  return base::DictValue().Set("success", true);
}
base::DictValue RevealChosenFile(Profile* profile, const std::string& id) {
  auto state = Get(profile, false); const auto* file = Find(state, id);
  if (!file) return Error();
  const auto path = base::FilePath::FromUTF8Unsafe(*file->FindString("path"));
  auto actual = FingerprintRegularFile(path);
  if (!actual || *actual != *file->FindDict("fingerprint")) return Error();
  platform_util::ShowItemInFolder(profile, path);
  return base::DictValue().Set("success", true);
}
}  // namespace aux::files
