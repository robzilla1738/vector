// Copyright 2026 The Aux Authors. BSD-style license: see //LICENSE.
#include "chrome/browser/ui/aux_feature_commands.h"
#include <algorithm>
#include <limits>
#include <utility>
#include "base/functional/bind.h"
#include "base/functional/callback_helpers.h"
#include "base/strings/utf_string_conversions.h"
#include "base/uuid.h"
#include "chrome/browser/aux/organization/organization_profile_service.h"
#include "chrome/browser/profiles/profile.h"
#include "chrome/browser/ui/aux_feature_lifecycle.h"
#include "chrome/browser/ui/aux_developer_commands.h"
#include "chrome/browser/ui/aux_page_capture.h"
#include "chrome/browser/ui/aux_media_commands.h"
#include "chrome/browser/ui/aux_preview/aux_preview_controller.h"
#include "chrome/browser/ui/browser_window/public/browser_window_interface.h"
#include "chrome/browser/ui/tabs/tab_strip_model.h"
#include "chrome/browser/ui/views/frame/aux_chat_navigation.h"
#include "chrome/browser/ui/views/frame/aux_organization_ui_commands.h"
#include "chrome/browser/ui/views/frame/aux_organization_window_controller.h"
#include "chrome/browser/ui/views/frame/aux_split_commands.h"
#include "chrome/browser/ui/views/frame/browser_view.h"
#include "components/constrained_window/constrained_window_views.h"
#include "components/prefs/pref_service.h"
#include "components/tabs/public/tab_interface.h"
#include "ui/base/models/dialog_model.h"
#include "ui/views/widget/widget.h"
#include "content/public/browser/web_contents.h"
namespace aux {
namespace {
namespace org = organization;
org::OrganizationService* Model(BrowserWindowInterface& browser) {
  auto* owner = org::OrganizationProfileServiceFactory::GetForProfileIfExists(browser.GetProfile());
  auto* model = owner ? owner->model() : nullptr;
  return model && !model->blocked() && !model->pending() ? model : nullptr;
}
void Error(base::WeakPtr<BrowserWindowInterface> browser, std::u16string reason) {
  if (!browser || reason.empty()) return;
  auto* view = BrowserView::GetBrowserViewForBrowser(browser.get());
  if (!view || !view->GetWidget()) return;
  auto dialog = ui::DialogModel::Builder().SetTitle(u"Couldn’t complete that action")
      .AddParagraph(ui::DialogModelLabel(std::move(reason))).AddOkButton(base::DoNothing()).Build();
  constrained_window::ShowBrowserModal(std::move(dialog), view->GetWidget()->GetNativeWindow());
}
bool TogglePref(BrowserWindowInterface& browser, const char* name) {
  auto* prefs = browser.GetProfile()->GetPrefs();
  const auto* pref = prefs->FindPreference(name);
  if (!pref || !pref->IsUserModifiable()) return false;
  prefs->SetBoolean(name, !prefs->GetBoolean(name));
  return true;
}
void Commit(base::WeakPtr<BrowserWindowInterface> browser, org::Context context,
            org::Command command, bool select_created_space = false) {
  const auto id = command.id;
  const auto profile_id = context.profile_id;
  const auto owner_generation = context.owner_generation;
  ExecuteOrganizationCommand(browser, std::move(context), std::move(command),
      base::BindOnce([](base::WeakPtr<BrowserWindowInterface> browser, std::string id,
                       std::string profile_id, std::string generation,
                       bool select, org::CommitResult result) {
        if (!browser) return;
        auto* owner = org::OrganizationProfileServiceFactory::GetForProfileIfExists(browser->GetProfile());
        if (!owner || owner->owner_generation() != generation || !owner->model() ||
            owner->model()->snapshot().profile_id != profile_id) return;
        if (result.error != org::Error::kNone && result.error != org::Error::kReplay) {
          Error(browser, OrganizationErrorMessage(result.error)); return;
        }
        if (select) if (auto* controller = AuxOrganizationWindowController::FromBrowser(browser.get()))
          if (!controller->SelectSpace(id)) Error(browser, u"The Space was saved, but this window changed. Select it from the sidebar.");
      }, browser, id, profile_id, owner_generation, select_created_space));
}
bool Edit(BrowserWindowInterface& browser, bool space) {
  auto context = CaptureOrganizationContext(browser);
  auto* view = BrowserView::GetBrowserViewForBrowser(&browser);
  auto* controller = AuxOrganizationWindowController::FromBrowser(&browser);
  if (!context || !view || !view->GetWidget() || !controller) return false;
  const auto current_space = controller->ActiveSpaceId();
  ShowOrganizationNameDialog(*view, space ? u"New Space" : u"New folder", {},
      space ? std::make_optional<std::u16string>(u"◉") : std::nullopt,
      base::BindOnce([](base::WeakPtr<BrowserWindowInterface> browser, org::Context context,
          std::string current_space, bool space, std::u16string name, std::u16string icon) {
        if (!browser || name.empty()) return;
        org::Command command; command.action = space ? org::Action::kCreateSpace : org::Action::kCreateFolder;
        command.id = base::Uuid::GenerateRandomV4().AsLowercaseString();
        command.space_id = space ? std::string() : current_space;
        command.title = base::UTF16ToUTF8(name); command.icon = base::UTF16ToUTF8(icon);
        command.index = std::numeric_limits<uint64_t>::max();
        Commit(browser, std::move(context), std::move(command), space);
      }, browser.GetWeakPtr(), std::move(*context), current_space, space));
  return true;
}
bool CycleSpace(BrowserWindowInterface& browser, int direction) {
  auto* model = Model(browser);
  auto* controller = AuxOrganizationWindowController::FromBrowser(&browser);
  if (!model || !controller) return false;
  std::vector<org::Space> spaces;
  for (const auto& [id, space] : model->snapshot().spaces) spaces.push_back(space);
  std::ranges::sort(spaces, {}, &org::Space::order);
  const auto current = std::ranges::find(spaces, controller->ActiveSpaceId(), &org::Space::id);
  if (spaces.size() < 2 || current == spaces.end()) return false;
  const int count = static_cast<int>(spaces.size());
  const int index = (static_cast<int>(current - spaces.begin()) + (direction > 0 ? 1 : count - 1)) % count;
  return controller->SelectSpace(spaces[index].id);
}
}
bool IsAuxFeatureCommand(int command) { return command >= 34120 && command <= 34139; }
bool IsAuxFeatureCommandEnabled(BrowserWindowInterface* browser, int command) {
  if (!IsAuxFeatureCommand(command) || !browser ||
      browser->GetType() != BrowserWindowInterface::TYPE_NORMAL ||
      !IsAuxLocalProfileAdmitted(browser->GetProfile())) return false;
  auto* strip = browser->GetTabStripModel();
  if (!strip || strip->closing_all()) return false;
  auto* active = strip->GetActiveTab();
  auto* pane = active ? active->GetContents() : nullptr;
  auto* controller = AuxOrganizationWindowController::FromBrowser(browser);
  auto* model = Model(*browser);
  if (command == 34120 || command == 34121) {
    const auto* pref = browser->GetProfile()->GetPrefs()->FindPreference(
        command == 34120 ? "aux.minimal_ui_enabled" : "aux.sidebar_navigation_enabled");
    return pref && pref->IsUserModifiable();
  }
  if (command >= 34122 && command <= 34129) {
    if (!model || !controller || !controller->ready()) return false;
    if (command == 34123 || command == 34124) return model->snapshot().spaces.size() > 1;
    if (command == 34122 || command == 34125) return BrowserView::GetBrowserViewForBrowser(browser) != nullptr;
    const auto id = controller->SelectedLogicalTabId();
    const auto found = model->snapshot().entries.find(id);
    if (found == model->snapshot().entries.end() || found->second.archived ||
        found->second.kind != org::EntryKind::kTab) return false;
    // Retention protects against archive, not explicit unpin or unload.
    // Metadata moves never close or navigate a page. Unload performs its
    // actual beforeunload/actor/split/download checks in the controller.
    if (command == 34126) return true;
    if (command == 34127) return !org::IsGlobalPin(found->second);
    if (command == 34129) return true;
    return !controller->IsLogicalEntryProtected(id);
  }
  if (command >= 34130 && command <= 34134) {
    if (!active) return false;
    if (active->GetSplit()) return true;
    if (command != 34132 && command != 34133) return false;
    return strip->count() > 1 && CanJoinNativeSplit(*browser, active,
        strip->GetTabAtIndex((strip->active_index() + 1) % strip->count()));
  }
  if (command == 34135) return preview::CanOpenQuick(browser);
  if (command == 34136) return pane && CanAuxCapturePage(pane);
  if (command == 34137) return pane && GetAuxVideoPictureInPictureState(pane).FindBool("available").value_or(false);
  if (command == 34138) return GetAuxDeveloperSettings(browser->GetProfile()).FindBool("canChange").value_or(false);
  return command == 34139;
}
bool ExecuteAuxFeatureCommand(BrowserWindowInterface* browser, int command) {
  if (!IsAuxFeatureCommandEnabled(browser, command)) return false;
  auto* strip = browser->GetTabStripModel();
  auto* controller = AuxOrganizationWindowController::FromBrowser(browser);
  const auto weak = browser->GetWeakPtr();
  if (command == 34120 || command == 34121) return TogglePref(*browser,
      command == 34120 ? "aux.minimal_ui_enabled" : "aux.sidebar_navigation_enabled");
  if (command == 34122 || command == 34125) return Edit(*browser, command == 34122);
  if (command == 34123 || command == 34124) return CycleSpace(*browser, command == 34123 ? 1 : -1);
  if (command >= 34126 && command <= 34129) {
    const auto id = controller->SelectedLogicalTabId();
    if (command == 34128 || command == 34129) {
      auto done = base::BindOnce([](base::WeakPtr<BrowserWindowInterface> browser, bool ok) {
        if (!ok) Error(browser, u"This tab is busy or changed. Try again when its work has finished.");
      }, weak);
      if (command == 34128) controller->ArchiveLogicalEntry(id, std::move(done));
      else controller->UnloadLogicalTab(id, std::move(done));
      return true;
    }
    auto context = CaptureOrganizationContext(*browser);
    auto* model = Model(*browser);
    if (!context || !model) return false;
    const auto found = model->snapshot().entries.find(id);
    if (found == model->snapshot().entries.end()) return false;
    org::Command operation; operation.id = id;
    if (command == 34127) { operation.action = org::Action::kSetKeepInSpace; operation.value = !found->second.keep_in_space; }
    else { operation.action = org::Action::kMoveEntry;
      operation.space_id = org::IsGlobalPin(found->second) ? controller->ActiveSpaceId() : std::string();
      operation.index = std::numeric_limits<uint64_t>::max(); }
    Commit(weak, std::move(*context), std::move(operation)); return true;
  }
  if (command == 34130 || command == 34131) return CycleNativeSplitPane(*browser, command == 34130 ? 1 : -1);
  if (command == 34132 || command == 34133) {
    const auto axis = command == 34132 ? split_tabs::SplitPaneTree::Axis::kHorizontal : split_tabs::SplitPaneTree::Axis::kVertical;
    if (strip->GetActiveTab()->GetSplit()) return SetNativeSplitOrientation(*browser, axis);
    return JoinNativeSplit(*browser, strip->GetActiveTab(), strip->GetTabAtIndex((strip->active_index()+1)%strip->count()), axis, false);
  }
  if (command == 34134) { strip->RemoveSplit(*strip->GetActiveTab()->GetSplit()); return true; }
  if (command == 34135) return preview::OpenQuick(browser, GURL()).browser != nullptr;
  if (command == 34136) return ShowAuxPageCapture(browser);
  if (command == 34137) return ToggleAuxVideoPictureInPicture(strip->GetActiveWebContents()).FindBool("success").value_or(false);
  if (command == 34138) {
    const auto state = GetAuxDeveloperSettings(browser->GetProfile());
    return SetAuxDeveloperMode(browser->GetProfile(), !state.FindBool("developerMode").value_or(false)).FindBool("success").value_or(false);
  }
  if (command == 34139) { OpenAccountRoute(*browser, "/settings/appearance"); return true; }
  return false;
}
}  // namespace aux
