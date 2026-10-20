// Copyright 2026 The Aux Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
#include "chrome/browser/ui/views/tabs/vertical/aux_pinned_tab_entry_actions.h"

#include "chrome/browser/ui/browser_window/public/browser_window_interface.h"
#include "chrome/browser/ui/navigator/browser_navigator.h"
#include "chrome/browser/ui/navigator/browser_navigator_params.h"
#include "chrome/browser/ui/tabs/aux_pinned_tab_entry_identity.h"
#include "chrome/browser/ui/tabs/tab_enums.h"
#include "chrome/browser/ui/tabs/tab_strip_model.h"
#include "chrome/browser/ui/tabs/tab_strip_user_gesture_details.h"
#include "content/public/browser/web_contents.h"

namespace aux {
std::optional<int> FindPinnedTabEntry(const TabStripModel& model,
                                      const GURL& url) {
  if (!url.is_valid()) {
    return std::nullopt;
  }
  std::optional<int> first;
  for (int index = 0; index < model.count(); ++index) {
    if (!model.IsTabPinned(index)) {
      continue;
    }
    auto* contents = model.GetWebContentsAt(index);
    if (!contents) {
      continue;
    }
    const auto remembered = GetRememberedPinnedTabEntryUrl(*contents);
    const GURL& candidate = remembered && remembered->is_valid()
                                ? *remembered
                                : contents->GetVisibleURL();
    if (!candidate.is_valid() || candidate != url) {
      continue;
    }
    if (index == model.active_index()) {
      return index;
    }
    if (!first) {
      first = index;
    }
  }
  return first;
}

void OpenPinnedTabEntry(BrowserWindowInterface& browser, const GURL& url) {
  if (!url.is_valid()) {
    return;
  }
  if (auto* model = browser.GetTabStripModel()) {
    if (auto index = FindPinnedTabEntry(*model, url)) {
      model->ActivateTabAt(*index,
                           TabStripUserGestureDetails(
                               TabStripUserGestureDetails::GestureType::kNone));
      return;
    }
  }
  NavigateParams params(&browser, url, ui::PAGE_TRANSITION_AUTO_BOOKMARK);
  params.disposition = WindowOpenDisposition::NEW_FOREGROUND_TAB;
  params.tabstrip_add_types = AddTabTypes::ADD_PINNED;
  Navigate(&params);
  if (params.navigated_or_inserted_contents) {
    RememberPinnedTabEntryUrl(*params.navigated_or_inserted_contents, url);
  }
}

}  // namespace aux
