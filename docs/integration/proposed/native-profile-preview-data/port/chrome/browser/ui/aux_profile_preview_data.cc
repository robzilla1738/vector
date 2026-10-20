// Copyright 2026 Aux Authors. All rights reserved.
#include "chrome/browser/ui/aux_profile_preview_data.h"

#include <algorithm>

#include "chrome/browser/browser_process.h"
#include "chrome/browser/profiles/profile.h"
#include "chrome/browser/profiles/profile_manager.h"
#include "chrome/browser/ui/browser_init_state.h"
#include "chrome/browser/ui/browser_window/public/browser_window_interface.h"
#include "chrome/browser/ui/browser_window/public/profile_browser_collection.h"
#include "chrome/browser/ui/tabs/tab_strip_model.h"
#include "chrome/browser/ui/unload_controller.h"
#include "chrome/browser/ui/views/frame/aux_profile_switch_workspaces.h"
#include "content/public/browser/web_contents.h"

namespace aux {
ProfilePreviewData CaptureProfilePreviewData(const TabStripModel& model) {
  ProfilePreviewData result;
  result.selected_index = std::max(model.active_index(), 0);
  for (int i = 0; i < model.count(); ++i) {
    auto* contents = model.GetWebContentsAt(i);
    if (!contents) {
      continue;
    }
    result.tabs.push_back({contents->GetTitle(),
                           i == result.selected_index,
                           model.IsTabPinned(i)});
  }
  return result;
}

ProfilePreviewData GetProfilePreviewData(
    BrowserWindowInterface& source, const base::FilePath& target_path) {
  if (target_path.empty()) {
    return {};
  }
  auto* source_profile = source.GetProfile();
  if (source_profile &&
      source_profile->GetOriginalProfile()->GetPath() == target_path &&
      source.GetTabStripModel()) {
    return CaptureProfilePreviewData(*source.GetTabStripModel());
  }
  // Original2104368 names BrowserManagerService. Its ForEach visitor455e4ac
  // checks actual window/profile/type, UnloadController and cache state.
  auto* manager = g_browser_process ? g_browser_process->profile_manager() : nullptr;
  auto* loaded = manager ? manager->GetProfileByPath(target_path) : nullptr;
  if (loaded) {
    ProfilePreviewData result;
    auto* collection =
        ProfileBrowserCollection::GetForProfile(loaded->GetOriginalProfile());
    if (collection) {
      collection->ForEach([&](BrowserWindowInterface* candidate) {
          auto* init = candidate ? BrowserInitState::From(candidate) : nullptr;
          auto* unload = candidate ? UnloadController::From(candidate) : nullptr;
          if (!candidate || candidate == &source || !init || !unload ||
              init->is_aux_profile_switch_cache() ||
              unload->is_attempting_to_close_browser() ||
              candidate->GetType() != BrowserWindowInterface::TYPE_NORMAL ||
              !candidate->GetProfile() ||
              candidate->GetProfile()->GetOriginalProfile()->GetPath() != target_path ||
              !candidate->GetTabStripModel()) {
            return true;
          }
          result = CaptureProfilePreviewData(*candidate->GetTabStripModel());
          return result.tabs.empty();
        });
    }
    if (!result.tabs.empty()) {
      return result;
    }
  }
  auto* cached = FindProfileSwitchWorkspace(&source, target_path);
  auto* cache_init = cached ? BrowserInitState::From(cached) : nullptr;
  if (cached && cached != &source && cache_init &&
      cache_init->is_aux_profile_switch_cache() &&
      cached->GetType() == BrowserWindowInterface::TYPE_NORMAL &&
      cached->GetTabStripModel()) {
    auto result = CaptureProfilePreviewData(*cached->GetTabStripModel());
    if (!result.tabs.empty()) {
      return result;
    }
  }
  if (const auto* init = BrowserInitState::From(&source)) {
    if (const auto* saved = init->GetAuxProfilePreviewData(target_path)) {
      return *saved;
    }
  }
  return {};
}
}  // namespace aux
