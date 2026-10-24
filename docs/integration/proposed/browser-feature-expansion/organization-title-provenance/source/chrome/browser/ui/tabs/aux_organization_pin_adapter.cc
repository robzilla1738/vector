// Copyright 2026 The Aux Authors. BSD-style license: see //LICENSE.
#include "chrome/browser/ui/tabs/aux_organization_pin_adapter.h"
#include <limits>
#include <utility>
#include "base/functional/bind.h"
#include "base/strings/utf_string_conversions.h"
#include "base/uuid.h"
#include "chrome/browser/aux/organization/organization_profile_service.h"
#include "chrome/browser/aux/organization/organization_service.h"
namespace aux {
namespace {
using namespace organization;
OrganizationProfileService* Owner(Profile& profile) {
  return OrganizationProfileServiceFactory::GetForProfile(&profile);
}
void Commit(OrganizationProfileService& owner, Command command,
            PinCommitReply reply) {
  auto* model = owner.model();
  if (!model || model->blocked()) {
    std::move(reply).Run(false, {}); return;
  }
  const auto& snapshot = model->snapshot();
  Context context{snapshot.profile_id, owner.owner_generation(), snapshot.revision,
                  base::Uuid::GenerateRandomV4().AsLowercaseString()};
  std::string id = command.id;
  model->Execute(std::move(context), std::move(command),
      base::BindOnce([](PinCommitReply done, std::string id, CommitResult result) {
        const bool success = result.error == Error::kNone || result.error == Error::kReplay;
        std::move(done).Run(success, success ? std::move(id) : std::string());
      }, std::move(reply), std::move(id)));
}
}  // namespace
std::optional<std::vector<PinnedTabEntry>> ReadOrganizationPinnedEntries(Profile& profile, bool include_descendants) {
  auto* owner = Owner(profile);
  auto* model = owner ? owner->model() : nullptr;
  if (!model) return std::nullopt;
  const auto& snapshot = model->snapshot();
  std::vector<PinnedTabEntry> entries;
  for (const auto& id : organization::OrderedChildren(snapshot, "", "")) {
    const auto& entry = snapshot.entries.at(id);
    if (entry.kind == organization::EntryKind::kTab)
      entries.push_back({GURL(entry.launch_url), base::UTF8ToUTF16(entry.title), id});
  }
  if (include_descendants) {
    for (const auto& [id, entry] : snapshot.entries) {
      if (entry.space_id.empty() && !entry.parent_id.empty() && !entry.archived &&
          entry.kind == organization::EntryKind::kTab)
        entries.push_back({GURL(entry.launch_url), base::UTF8ToUTF16(entry.title), id});
    }
  }
  return entries;
}
void CommitOrganizationPin(Profile& profile, const GURL& url,
                           const std::u16string& title, size_t index,
                           std::string existing_id, PinCommitReply reply, bool automatic_title) {
  auto* owner = Owner(profile);
  auto* model = owner ? owner->model() : nullptr;
  if (!model || !url.is_valid()) { std::move(reply).Run(false, {}); return; }
  organization::Command command;
  if (!existing_id.empty()) {
    const auto it = model->snapshot().entries.find(existing_id);
    if (it == model->snapshot().entries.end() || it->second.archived ||
        it->second.kind != organization::EntryKind::kTab) {
      std::move(reply).Run(false, {}); return;
    }
    command.action = organization::Action::kMoveEntry;
    command.id = std::move(existing_id);
  } else {
    command.action = organization::Action::kCreateTab;
    command.id = base::Uuid::GenerateRandomV4().AsLowercaseString();
    command.title = base::UTF16ToUTF8(title); command.url = url.spec();
    if (automatic_title) command.title_mode = organization::TitleMode::kAutomatic;
  }
  command.index = index;
  Commit(*owner, std::move(command), std::move(reply));
}
void ReorderOrganizationPin(Profile& profile, std::string id, size_t index,
                            base::OnceCallback<void(bool)> reply) {
  auto* owner = Owner(profile);
  if (!owner) { std::move(reply).Run(false); return; }
  organization::Command command;
  command.action = organization::Action::kMoveEntry;
  command.id = std::move(id); command.index = index;
  Commit(*owner, std::move(command), base::BindOnce(
      [](base::OnceCallback<void(bool)> done, bool success, std::string) {
        std::move(done).Run(success);
      }, std::move(reply)));
}
void UnpinOrganizationEntry(Profile& profile, std::string id, std::string destination_space,
                            base::OnceCallback<void(bool)> reply) {
  auto* owner = Owner(profile);
  auto* model = owner ? owner->model() : nullptr;
  if (!model) { std::move(reply).Run(false); return; }
  // The initiating native window supplies its Space; never guess from another
  // window or move a pin into a deterministic but unrelated first Space.
  if (!model->snapshot().spaces.contains(destination_space)) {
    std::move(reply).Run(false); return;
  }
  organization::Command command;
  command.action = organization::Action::kMoveEntry;
  command.id = std::move(id); command.space_id = std::move(destination_space);
  command.index = std::numeric_limits<uint64_t>::max();
  Commit(*owner, std::move(command), base::BindOnce(
      [](base::OnceCallback<void(bool)> done, bool success, std::string) {
        std::move(done).Run(success);
      }, std::move(reply)));
}
}  // namespace aux
