// Copyright 2026 Aux Authors. BSD-style license: see //LICENSE.
#include "chrome/browser/ui/views/frame/aux_chat_navigation.h"
#include <string>
#include "chrome/browser/aux/component_bootstrap.h"
#include "chrome/browser/browser_process.h"
#include "chrome/browser/profiles/profile.h"
#include "chrome/browser/profiles/profile_manager.h"
#include "chrome/browser/profiles/profile_attributes_storage.h"
#include "chrome/browser/profiles/profile_attributes_entry.h"
#include "chrome/browser/ui/browser_window/public/browser_window_interface.h"
#include "chrome/browser/ui/navigator/browser_navigator.h"
#include "chrome/browser/ui/navigator/browser_navigator_params.h"
#include "chrome/browser/ui/tabs/tab_strip_model.h"
#include "chrome/browser/ui/tabs/tab_strip_user_gesture_details.h"
#include "components/prefs/pref_service.h"
#include "content/public/browser/navigation_controller.h"
#include "content/public/browser/navigation_entry.h"
#include "content/public/browser/web_contents.h"
#include "extensions/browser/extension_registry.h"
#include "ui/base/page_transition_types.h"
#include "ui/base/window_open_disposition.h"
#include "url/gurl.h"

namespace aux {
namespace {
bool MatchesEntry(content::NavigationEntry* entry, const GURL& target) {
  return entry && (entry->GetURL() == target || entry->GetVirtualURL() == target);
}
bool MatchesTarget(content::WebContents* contents, const GURL& target) {
  if (!contents) return false;
  auto& controller = contents->GetController();
  // Original4564b14 compares complete serialized URLs; no task-ID, query or
  // trailing-slash normalization is appropriate for reusing this exact page.
  return contents->GetVisibleURL() == target ||
      contents->GetLastCommittedURL() == target ||
      MatchesEntry(controller.GetVisibleEntry(), target) ||
      MatchesEntry(controller.GetPendingEntry(), target) ||
      MatchesEntry(controller.GetLastCommittedEntry(), target);
}
}  // namespace
int ChatAccountForProfile(Profile& profile) {
  if (!profile.IsOffTheRecord()) {
    if (auto* prefs = profile.GetPrefs();
        prefs && prefs->FindPreference("aside.account_id")) {
      const int id = prefs->GetInteger("aside.account_id");
      if (id >= 0) return id;
    }
    if (auto* manager = g_browser_process->profile_manager()) {
      const auto entries = manager->GetProfileAttributesStorage()
          .GetAllProfilesAttributesSortedForDisplay();
      for (size_t i = 0; i < entries.size(); ++i)
        if (entries[i]->GetPath() == profile.GetPath()) return static_cast<int>(i);
    }
  }
  return 0;
}
bool IsNewChatDocument(content::WebContents& contents, Profile& profile) {
  const GURL target(std::string("chrome-extension://") + kAgentExtensionId +
      "/main.html#/u/" + std::to_string(ChatAccountForProfile(profile)) +
      "/tasks/new");
  return target.is_valid() && MatchesTarget(&contents, target);
}
bool CanOpenNewChat(BrowserWindowInterface& browser) {
  auto* registry = extensions::ExtensionRegistry::Get(browser.GetProfile());
  return browser.GetType() == BrowserWindowInterface::Type::TYPE_NORMAL &&
      registry && registry->GetExtensionById(kAgentExtensionId,
          extensions::ExtensionRegistry::EVERYTHING);
}
void ShowAllChats(BrowserWindowInterface& browser) {
  auto* model = browser.GetTabStripModel();
  if (!model) return;
  const GURL target(std::string("chrome-extension://") + kAgentExtensionId +
      "/main.html#/u/" + std::to_string(ChatAccountForProfile(*browser.GetProfile())) +
      "/tasks?view=list&filter=all&order=desc");
  // Original462f3d8 reuses the first model-order matching page, rather than
  // preferring the active tab as the separate New Chat command does.
  if (target.is_valid()) {
    for (int index = 0; index < model->count(); ++index) {
      if (MatchesTarget(model->GetWebContentsAt(index), target)) {
        model->ActivateTabAt(index, TabStripUserGestureDetails(
            TabStripUserGestureDetails::GestureType::kNone));
        return;
      }
    }
  }
  auto* registry = extensions::ExtensionRegistry::Get(browser.GetProfile());
  if (registry && registry->GetExtensionById(kAgentExtensionId,
          extensions::ExtensionRegistry::EVERYTHING)) {
    // Actual155's public BWI convenience invokes the real PageNavigator with
    // LINK and renderer_initiated=false, matching the supplied OpenURL call.
    browser.OpenGURL(target, WindowOpenDisposition::NEW_FOREGROUND_TAB);
  }
}
void OpenNewChat(BrowserWindowInterface& browser) {
  if (!CanOpenNewChat(browser)) return;
  const GURL target(std::string("chrome-extension://") + kAgentExtensionId +
      "/main.html#/u/" + std::to_string(ChatAccountForProfile(*browser.GetProfile())) +
      "/tasks/new");
  if (!target.is_valid()) return;
  auto* model = browser.GetTabStripModel();
  if (!model) return;
  const int active = model->active_index();
  if (active != TabStripModel::kNoTab &&
      MatchesTarget(model->GetWebContentsAt(active), target)) {
    model->ActivateTabAt(active, TabStripUserGestureDetails(
        TabStripUserGestureDetails::GestureType::kNone));
    return;
  }
  for (int index = 0; index < model->count(); ++index) {
    if (index != active && MatchesTarget(model->GetWebContentsAt(index), target)) {
      model->ActivateTabAt(index, TabStripUserGestureDetails(
          TabStripUserGestureDetails::GestureType::kNone));
      return;
    }
  }
  NavigateParams params(&browser, target, ui::PAGE_TRANSITION_LINK);
  params.disposition = WindowOpenDisposition::NEW_FOREGROUND_TAB;
  params.source_contents = model->GetActiveWebContents();
  params.window_action = NavigateParams::WindowAction::kShowWindow;
  // The supplied vertical insertion/group handling is already ported into
  // actual155 Navigate; do not duplicate or bypass its existing normalization.
  Navigate(&params);
}
}  // namespace aux
