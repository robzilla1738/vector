#include "chrome/browser/ui/aux_tab_mention_spaces.h"
#include <map>
#include <set>
#include <string>
#include "base/strings/string_number_conversions.h"
#include "chrome/browser/aux/organization/organization_profile_service.h"
#include "chrome/browser/aux/profile_identity.h"
#include "chrome/browser/profiles/profile.h"
#include "chrome/browser/ui/aux_feature_lifecycle.h"
#include "chrome/browser/ui/aux_tab_reference_context.h"
#include "chrome/browser/ui/browser_window/public/browser_window_interface.h"
#include "chrome/browser/ui/browser_window/public/browser_window_interface_iterator.h"
#include "chrome/browser/ui/views/frame/aux_organization_window_controller.h"
#include "components/prefs/pref_service.h"
#include "content/public/browser/web_contents.h"
#include "url/gurl.h"
namespace {
namespace org = aux::organization;
base::DictValue Failure(const char* message) {
  return base::DictValue().Set("success", false).Set("error", message);
}
}
base::DictValue GetAuxTabMentionSpaces(content::WebContents* sender) {
  auto* profile = sender ? Profile::FromBrowserContext(sender->GetBrowserContext()) : nullptr;
  if (!profile || profile->IsOffTheRecord() || !aux::IsAuxLocalProfileAdmitted(profile))
    return Failure("Profile context is unavailable.");
  auto* owner = org::OrganizationProfileServiceFactory::GetForProfile(profile);
  auto* service = owner ? owner->model() : nullptr;
  if (!service || service->blocked() || service->pending())
    return Failure("Spaces are still restoring or saving.");
  const auto& snapshot = service->snapshot();
  base::ListValue views;
  std::set<std::string> targets, loaded;
  for (auto* browser : GetAllBrowserWindowInterfaces()) {
    if (browser->GetProfile() != profile || browser->GetType() != BrowserWindowInterface::TYPE_NORMAL) continue;
    auto* controller = aux::AuxOrganizationWindowController::FromBrowser(browser);
    if (!controller || !controller->ready()) return Failure("Spaces are still restoring or saving.");
    for (const auto& item : controller->SnapshotViews()) {
      const auto& view = item.GetDict();
      const auto* id = view.FindString("id");
      const auto* target = view.FindString("targetId");
      const auto* url = view.FindString("url");
      if (!id || !target || !url || !GURL(*url).SchemeIsHTTPOrHTTPS()) continue;
      auto entry = snapshot.entries.find(*id);
      if (entry == snapshot.entries.end() || entry->second.archived ||
          entry->second.kind == org::EntryKind::kFolder || !targets.insert(*target).second) continue;
      loaded.insert(*id);
      auto row = view.Clone();
      auto space = snapshot.spaces.find(entry->second.space_id);
      row.Set("spaceLabel", space == snapshot.spaces.end() ? "Pinned in every Space" : space->second.name);
      views.Append(std::move(row));
    }
  }
  base::ListValue spaces;
  for (const auto& [id, space] : snapshot.spaces) {
    int unloaded = 0;
    for (const auto& [entry_id, entry] : snapshot.entries)
      if (!entry.archived && entry.kind != org::EntryKind::kFolder &&
          entry.space_id == id && !loaded.contains(entry_id)) ++unloaded;
    spaces.Append(base::DictValue().Set("id", id).Set("title", space.name)
      .Set("order", base::NumberToString(space.order)).Set("unloaded", unloaded));
  }
  return base::DictValue().Set("success", true)
    .Set("accountId", profile->GetPrefs()->GetInteger("aux.account_id"))
    .Set("ownerGeneration", aux::GetProfileCookieBindingEpoch(profile))
    .Set("revision", base::NumberToString(snapshot.revision))
    .Set("spaces", std::move(spaces)).Set("tabs", std::move(views));
}
base::DictValue CaptureAuxTabMentionSpace(content::WebContents* sender,
                                         const base::DictValue& request) {
  if (request.size() != 4) return Failure("Invalid Space selection.");
  const auto* id = request.FindString("spaceId");
  const auto* epoch = request.FindString("ownerGeneration");
  const auto* revision = request.FindString("revision");
  const auto* references = request.FindList("references");
  if (!id || id->size() > 128 || !epoch || epoch->size() > 128 || !revision ||
      revision->size() > 32 || !references || references->empty() || references->size() > 64)
    return Failure("Open between one and 64 tabs in this Space before attaching it.");
  auto snapshot = GetAuxTabMentionSpaces(sender);
  if (!snapshot.FindBool("success").value_or(false)) return snapshot;
  const auto* current_epoch = snapshot.FindString("ownerGeneration");
  const auto* current_revision = snapshot.FindString("revision");
  if (!current_epoch || !current_revision || *current_epoch != *epoch || *current_revision != *revision)
    return Failure("Spaces changed; select the Space again.");
  bool found = false;
  for (const auto& space : *snapshot.FindList("spaces"))
    if (*space.GetDict().FindString("id") == *id) found = true;
  if (!found) return Failure("This Space is no longer available.");
  std::map<std::string, std::string> expected;
  for (const auto& tab : *snapshot.FindList("tabs")) {
    const auto& row = tab.GetDict();
    if (*row.FindString("spaceId") == *id)
      expected.emplace(*row.FindString("targetId"), *row.FindString("url"));
  }
  if (expected.size() != references->size()) return Failure("Space tabs changed; select the Space again.");
  std::set<std::string> selected;
  for (const auto& item : *references) {
    const auto* row = item.GetIfDict();
    const auto* target = row ? row->FindString("targetId") : nullptr;
    const auto* url = row ? row->FindString("url") : nullptr;
    if (!row || row->size() != 2 || !target || !url || !selected.insert(*target).second ||
        !expected.contains(*target) || expected.at(*target) != *url)
      return Failure("Space tabs changed; select the Space again.");
  }
  // No async gap between membership inspection and native document capture.
  return CaptureAuxTabReferences(sender, *references);
}
