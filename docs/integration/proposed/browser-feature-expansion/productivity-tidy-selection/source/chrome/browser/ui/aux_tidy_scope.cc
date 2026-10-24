#include "chrome/browser/ui/aux_tidy_scope.h"
#include <map>
#include <set>
#include "base/memory/weak_ptr.h"
#include "base/no_destructor.h"
#include "base/strings/string_number_conversions.h"
#include "base/time/time.h"
#include "base/uuid.h"
#include "chrome/browser/aux/organization/organization_profile_service.h"
#include "chrome/browser/aux/profile_identity.h"
#include "chrome/browser/profiles/profile.h"
#include "chrome/browser/ui/aux_feature_lifecycle.h"
#include "chrome/browser/ui/browser_window/public/browser_window_interface.h"
#include "chrome/browser/ui/tabs/tab_strip_model.h"
#include "chrome/browser/ui/views/frame/aux_organization_window_controller.h"
#include "components/sessions/content/session_tab_helper.h"
namespace {
namespace org = aux::organization;
std::set<std::string> Selected(BrowserWindowInterface* browser) {
  std::set<std::string> ids;
  auto* controller = browser ? aux::AuxOrganizationWindowController::FromBrowser(browser) : nullptr;
  auto* model = browser ? browser->GetTabStripModel() : nullptr;
  if (!controller || !controller->ready() || !model) return ids;
  std::set<int> native_ids;
  for (int index = 0; index < model->count(); ++index)
    if (model->IsTabSelected(index))
      native_ids.insert(sessions::SessionTabHelper::IdForTab(model->GetWebContentsAt(index)).id());
  for (const auto& item : controller->SnapshotViews()) {
    const auto& row = item.GetDict();
    if (row.FindInt("nativeTabId") && native_ids.contains(*row.FindInt("nativeTabId")) &&
        row.FindString("spaceId") && *row.FindString("spaceId") == controller->ActiveSpaceId())
      ids.insert(*row.FindString("id"));
  }
  return ids;
}
struct Scope {
  base::WeakPtr<BrowserWindowInterface> browser;
  base::WeakPtr<Profile> profile;
  std::string epoch, revision, space;
  std::set<std::string> selection;
  base::TimeTicks expires;
  bool selected = false;
};
std::map<std::string, Scope>& Scopes() {
  static base::NoDestructor<std::map<std::string, Scope>> scopes;
  return *scopes;
}
org::OrganizationService* Model(BrowserWindowInterface* browser) {
  auto* profile = browser ? browser->GetProfile() : nullptr;
  if (!profile || profile->IsOffTheRecord() || !IsAuxLocalProfileAdmitted(profile)) return nullptr;
  auto* owner = org::OrganizationProfileServiceFactory::GetForProfile(profile);
  auto* model = owner ? owner->model() : nullptr;
  return model && !model->pending() && !model->blocked() ? model : nullptr;
}
bool Current(const Scope& scope) {
  if (!scope.browser || !scope.profile || scope.browser->GetProfile() != scope.profile.get() ||
      scope.expires <= base::TimeTicks::Now() ||
      scope.epoch != aux::GetProfileCookieBindingEpoch(scope.profile.get())) return false;
  auto* model = Model(scope.browser.get());
  auto* controller = aux::AuxOrganizationWindowController::FromBrowser(scope.browser.get());
  return model && controller && controller->ready() && controller->ActiveSpaceId() == scope.space && base::NumberToString(model->snapshot().revision) == scope.revision &&
      (!scope.selected || Selected(scope.browser.get()) == scope.selection);
}
}
bool CanCreateAuxTidyScope(BrowserWindowInterface* browser) {
  auto* controller = browser ? aux::AuxOrganizationWindowController::FromBrowser(browser) : nullptr;
  return Model(browser) && controller && controller->ready() && !controller->ActiveSpaceId().empty();
}
size_t GetAuxTidySelectedCount(BrowserWindowInterface* browser) {
  return Model(browser) ? Selected(browser).size() : 0;
}
std::string CreateAuxTidyScope(BrowserWindowInterface* browser, bool selected) {
  auto* model = Model(browser); if (!model || !CanCreateAuxTidyScope(browser)) return {};
  auto ids = Selected(browser); if (selected && ids.size() < 2) return {};
  for (auto it = Scopes().begin(); it != Scopes().end();)
    if (!Current(it->second) || it->second.browser.get() == browser) it = Scopes().erase(it);
    else ++it;
  if (Scopes().size() >= 32) return {};
  std::string token = base::Uuid::GenerateRandomV4().AsLowercaseString();
  Scope scope; scope.browser = browser->GetWeakPtr(); scope.profile = browser->GetProfile()->GetWeakPtr();
  scope.epoch = aux::GetProfileCookieBindingEpoch(browser->GetProfile());
  scope.revision = base::NumberToString(model->snapshot().revision);
  scope.space = aux::AuxOrganizationWindowController::FromBrowser(browser)->ActiveSpaceId();
  scope.selection = std::move(ids); scope.selected = selected;
  scope.expires = base::TimeTicks::Now() + base::Minutes(10);
  Scopes().emplace(token, std::move(scope)); return token;
}
BrowserWindowInterface* GetAuxTidyScopeBrowser(Profile* profile, const std::string& token) {
  auto found = Scopes().find(token);
  if (found == Scopes().end() || found->second.profile.get() != profile) return nullptr;
  if (!Current(found->second)) { Scopes().erase(found); return nullptr; }
  return found->second.browser.get();
}
base::DictValue ConstrainAuxTidySnapshot(Profile* profile, const std::string& token,
                                        base::DictValue snapshot) {
  if (!snapshot.FindBool("success").value_or(false)) return snapshot;
  if (!GetAuxTidyScopeBrowser(profile, token))
    return base::DictValue().Set("success", false).Set("error", "Tidy scope changed; choose the scope again.");
  const auto& scope = Scopes().at(token);
  auto* tabs = snapshot.FindList("tabs");
  if (!tabs) return base::DictValue().Set("success", false).Set("error", "Tab scope is unavailable.");
  if (scope.selected) {
    base::ListValue selected;
    for (const auto& tab : *tabs) {
      const auto* id = tab.GetDict().FindString("id");
      if (id && scope.selection.contains(*id)) selected.Append(tab.Clone());
    }
    snapshot.Set("tabs", std::move(selected));
  }
  snapshot.Set("scopeToken", token);
  snapshot.Set("scope", scope.selected ? "selected-tabs" : "current-space");
  return snapshot;
}
