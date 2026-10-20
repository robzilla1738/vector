// Copyright 2026 Aux Authors. All rights reserved.
#include "chrome/browser/ui/views/frame/aux_profile_preview_region_owner.h"

#include <memory>
#include <utility>
#include <vector>

#include "base/check.h"
#include "base/functional/bind.h"
#include "chrome/browser/bookmarks/bookmark_model_factory.h"
#include "chrome/browser/browser_process.h"
#include "chrome/browser/profiles/profile.h"
#include "chrome/browser/profiles/profile_attributes_entry.h"
#include "chrome/browser/profiles/profile_attributes_storage.h"
#include "chrome/browser/profiles/profile_avatar_icon_util.h"
#include "chrome/browser/profiles/profile_manager.h"
#include "chrome/browser/ui/aux_profile_preview_data.h"
#include "chrome/browser/ui/browser.h"
#include "chrome/browser/ui/browser_init_state.h"
#include "chrome/browser/ui/browser_window/public/profile_browser_collection.h"
#include "chrome/browser/ui/unload_controller.h"
#include "chrome/browser/ui/views/frame/aux_profile_preview_page.h"
#include "chrome/browser/ui/views/frame/aux_profile_switch_workspaces.h"
#include "chrome/browser/ui/views/frame/browser_view.h"
#include "chrome/browser/ui/views/frame/vertical_tab_strip_region_view.h"
#include "chrome/browser/ui/views/profiles/aux_profile_display_label.h"
#include "components/bookmarks/browser/bookmark_model.h"
#include "components/bookmarks/browser/bookmark_node.h"
#include "ui/views/view.h"
#include "ui/views/view_utils.h"

namespace aux {
namespace {
// Original4655d50/46835d8: do not create a hidden preview cache when the
// target already has another genuine nonclosing normal window. Existing owned
// caches take precedence in the caller, exactly as original4657cd0.
bool HasOtherNormalWindow(BrowserWindowInterface& source, Profile& target) {
  auto* collection = ProfileBrowserCollection::GetForProfile(
      target.GetOriginalProfile());
  bool found = false;
  if (collection) {
    collection->ForEach([&](BrowserWindowInterface* candidate) {
      auto* init = candidate ? BrowserInitState::From(candidate) : nullptr;
      auto* unload = candidate ? UnloadController::From(candidate) : nullptr;
      if (!candidate || candidate == &source || !init || !unload ||
          init->is_aux_profile_switch_cache() ||
          unload->is_attempting_to_close_browser() ||
          candidate->GetType() != BrowserWindowInterface::TYPE_NORMAL ||
          !candidate->GetProfile() ||
          candidate->GetProfile()->GetOriginalProfile()->GetPath() !=
              target.GetOriginalProfile()->GetPath()) {
        return true;
      }
      found = true;
      return false;
    });
  }
  return found;
}

std::vector<std::u16string> BookmarkTitles(Profile* loaded) {
  std::vector<std::u16string> result;
  auto* model = loaded ? BookmarkModelFactory::GetForBrowserContext(
                             loaded->GetOriginalProfile()) : nullptr;
  if (!model || !model->loaded() || !model->bookmark_bar_node()) {
    return result;
  }
  for (const auto& node : model->bookmark_bar_node()->children()) {
    if (result.size() == 4) {
      break;
    }
    if (node) {
      result.push_back(node->GetTitle());
    }
  }
  return result;
}
}  // namespace

ProfilePreviewRegionOwner::ProfilePreviewRegionOwner(
    Browser& browser, VerticalTabStripRegionView& region)
    : browser_(browser.GetWeakPtr()), region_(&region),
      presentation_(region, region.GetAuxProfilePreviewSurfaces(),
                    region.GetAuxProfilePreviewTopBoundary()),
      request_(browser, presentation_.borrowed_views()) {}

ProfilePreviewRegionOwner::~ProfilePreviewRegionOwner() {
  request_.CancelPendingPreviewCommit();
  presentation_.Reset(false);
}

ProfilePagePreviewPageView* ProfilePreviewRegionOwner::GetPage(
    const base::FilePath& target) {
  auto* region = region_.view();
  if (!region || target.empty()) {
    return nullptr;
  }
  if (auto found = pages_.find(target); found != pages_.end()) {
    if (auto* page = views::AsViewClass<ProfilePagePreviewPageView>(
            found->second.view())) {
      return page;
    }
    pages_.erase(found);
  }
  auto alive = weak_factory_.GetWeakPtr();
  auto owned = std::make_unique<ProfilePagePreviewPageView>();
  views::ViewTracker page_lifetime(owned.get());
  auto* page = region->AddChildView(std::move(owned));
  if (!alive || !page_lifetime.view()) {
    return nullptr;
  }
  pages_.try_emplace(target, page);
  return page;
}

bool ProfilePreviewRegionOwner::Begin(const base::FilePath& target,
                                      int direction) {
  auto* source = browser_.get();
  auto* region = views::AsViewClass<VerticalTabStripRegionView>(region_.view());
  if (committing_ || !source || !region || target.empty() ||
      (direction != -1 && direction != 1) || !g_browser_process ||
      !g_browser_process->profile_manager() || !source->GetProfile() ||
      source->GetProfile()->IsOffTheRecord() ||
      source->GetProfile()->GetOriginalProfile()->GetPath() == target) {
    return false;
  }
  auto alive = weak_factory_.GetWeakPtr();
  request_.CancelPendingPreviewCommit();
  presentation_.Reset(true);
  if (!alive) {
    return false;
  }
  auto* manager = g_browser_process->profile_manager();
  auto* loaded = manager->GetProfileByPath(target);
  auto& storage = manager->GetProfileAttributesStorage();
  auto* entry = storage.GetProfileAttributesWithPath(target);
  size_t roster_size = 0;
  for (auto* candidate : storage.GetAllProfilesAttributesSortedForDisplay()) {
    if (candidate && !candidate->IsOmitted()) {
      ++roster_size;
    }
  }
  auto* page = GetPage(target);
  if (!page) {
    return false;
  }
  gfx::ImageSkia avatar;
  if (entry && entry->GetAvatarIconIndex() != profiles::GetPlaceholderAvatarIndex()) {
    avatar = entry->GetAvatarIcon(20).AsImageSkia();
  }
  views::ViewTracker page_lifetime(page);
  page->SetProfile(ProfileDisplayLabel(entry, loaded, roster_size), avatar);
  if (!alive || !page_lifetime.view()) {
    return false;
  }
  auto tabs = GetProfilePreviewData(*source, target).tabs;
  auto bookmarks = BookmarkTitles(loaded);
  if (!alive || !page_lifetime.view()) {
    return false;
  }
  page->SetFallbackData(std::move(tabs), std::move(bookmarks));
  if (!alive || !page_lifetime.view()) {
    return false;
  }
  // Original4654740 can render the real metadata fallback while the target
  // profile/cache is not ready; it does not fabricate a borrowed live view.
  bool live = false;
  if (loaded) {
    auto* cache = FindProfileSwitchWorkspace(source, target);
    if (!cache && !HasOtherNormalWindow(*source, *loaded)) {
      cache = GetOrCreateProfileSwitchWorkspace(source, loaded, false);
    }
    if (!alive || !page_lifetime.view() || !browser_) {
      return false;
    }
    auto* view = cache ? BrowserView::GetBrowserViewForBrowser(cache) : nullptr;
    auto* target_region = view ? view->vertical_tab_strip_region_view() : nullptr;
    if (target_region && target_region != region) {
      views::ViewTracker target_lifetime(target_region);
      target_region->SetSize(region->size());
      if (!alive || !target_lifetime.view() || !page_lifetime.view()) {
        return false;
      }
      target_region->DeprecatedLayoutImmediately();
      if (!alive || !target_lifetime.view() || !page_lifetime.view()) {
        return false;
      }
      live = presentation_.BindPreview(
          *target_region, target_region->GetAuxProfilePreviewSurfaces(),
          target_region->GetAuxProfilePreviewTopBoundary(), *page,
          *page->live_host(), direction);
    }
  }
  if (!alive || !page_lifetime.view()) {
    return false;
  }
  page->ShowLiveContent(live);
  if (!alive || !page_lifetime.view()) {
    return false;
  }
  if (!live && !presentation_.BindFallback(*page, direction)) {
    return false;
  }
  target_ = target;
  return true;
}

void ProfilePreviewRegionOwner::Update(float progress) {
  presentation_.Update(progress);
}
void ProfilePreviewRegionOwner::OnPreviewFrame() {
  request_.OnPreviewFrame();
}
bool ProfilePreviewRegionOwner::Commit(
    ProfileSwitchRequest::Completion completion) {
  CHECK(completion);
  if (committing_ || target_.empty() || !browser_ || !region_.view()) {
    return false;
  }
  committing_ = true;
  auto done = base::BindOnce(&ProfilePreviewRegionOwner::Complete,
      weak_factory_.GetWeakPtr(), std::move(completion));
  if (presentation_.borrowed_views().empty()) {
    // Original4656178..46561fc: metadata-only/non-live path dispatches the
    // actual asynchronous load immediately; loaded Profile is not success.
    request_.Start(target_, std::move(done));
  } else {
    // Original4656258 plus actual frame settlement retains the live preview
    // until its real frame owner schedules the50ms generation-bound handoff.
    request_.QueuePreviewCommit(target_, std::move(done));
  }
  return true;
}
void ProfilePreviewRegionOwner::Complete(
    ProfileSwitchRequest::Completion completion, Browser* result) {
  committing_ = false;
  target_.clear();
  auto sender = browser_;
  presentation_.Reset(false);
  // Reset or completion may close this actual owner. No member access follows
  // reset, and original completion never returns a destroyed sender Browser.
  std::move(completion).Run(sender ? result : nullptr);
}
void ProfilePreviewRegionOwner::Cancel() {
  if (committing_) {
    return;
  }
  request_.CancelPendingPreviewCommit();
  presentation_.Reset(false);
  target_.clear();
}
}  // namespace aux
