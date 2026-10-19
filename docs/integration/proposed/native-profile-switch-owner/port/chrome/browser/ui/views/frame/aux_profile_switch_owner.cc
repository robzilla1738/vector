// Copyright 2026 Aux Authors. All rights reserved.
#include "chrome/browser/ui/views/frame/aux_profile_switch_owner.h"

#include <algorithm>
#include <map>
#include <optional>
#include <set>
#include <utility>

#include "chrome/browser/profiles/profile_attributes_entry.h"
#include "chrome/browser/profiles/profile_attributes_storage.h"
#include "components/prefs/pref_registry_simple.h"
#include "components/prefs/pref_service.h"
#include "ui/gfx/geometry/point_f.h"
#include "ui/views/controls/scroll_view.h"
#include "ui/views/view.h"
#include "ui/views/view_tracker.h"
#include "ui/views/view_utils.h"

namespace aux {
void RegisterProfileSwitchLocalStatePrefs(PrefRegistrySimple* registry) {
  registry->RegisterListPref(kHorizontalProfileOrder);
}

std::vector<base::FilePath> HorizontalProfileOrder(
    const ProfileAttributesStorage& storage,
    const PrefService& local_state) {
  // Supplied02b3cee0 reads profile.profiles_order and its storage-key map.
  // Do not replace that order with SortedByName or a feature-conditional list.
  const auto entries = storage.GetAllProfilesAttributesSortedForDisplay();
  std::map<std::string, base::FilePath> known;
  for (const auto* entry : entries) {
    if (entry)
      known.emplace(entry->GetPath().BaseName().AsUTF8Unsafe(),
                    entry->GetPath());
  }
  std::vector<base::FilePath> result;
  std::set<std::string> seen;
  if (const auto* preference =
          local_state.FindPreference(kHorizontalProfileOrder)) {
    if (const auto* order = preference->GetValue()->GetIfList()) {
      for (const auto& value : *order) {
        const auto* key = value.GetIfString();
        if (!key)
          continue;
        const auto found = known.find(*key);
        if (found != known.end() && seen.insert(found->first).second)
          result.push_back(found->second);
      }
    }
  }
  // Original preserves the base order for unlisted entries, not map order.
  for (const auto* entry : entries) {
    if (entry && seen.insert(entry->GetPath().BaseName().AsUTF8Unsafe()).second)
      result.push_back(entry->GetPath());
  }
  return result;
}

struct ProfilePreviewViews::Record {
  explicit Record(views::View* view)
      : view(view),
        parent(view->parent()),
        index(view->parent()->GetIndexOf(view).value()),
        bounds(view->bounds()),
        visible(view->GetVisible()) {
    if (const auto* scroll = views::AsViewClass<views::ScrollView>(view)) {
      if (scroll->contents())
        scroll_offset = scroll->CurrentOffset();
    }
  }
  views::ViewTracker view;
  views::ViewTracker parent;
  size_t index;
  gfx::Rect bounds;
  bool visible;
  std::optional<gfx::PointF> scroll_offset;
};

ProfilePreviewViews::ProfilePreviewViews() = default;
ProfilePreviewViews::~ProfilePreviewViews() {
  Restore(false);
}

bool ProfilePreviewViews::Borrow(views::View* view,
                                 views::View* host,
                                 const gfx::Rect& preview_bounds) {
  if (!view || !host || !view->parent() || view == host || view->Contains(host))
    return false;
  for (const auto& record : records_) {
    if (record->view.view() == view)
      return false;
  }
  auto record = std::make_unique<Record>(view);
  host->AddChildView(view);
  view->SetVisible(record->visible);
  view->SetBoundsRect(preview_bounds);
  if (record->scroll_offset) {
    // Supplied4657d70 preserves horizontal position but previews from top.
    views::AsViewClass<views::ScrollView>(view)->ScrollToOffset(
        gfx::PointF(record->scroll_offset->x(), 0));
  }
  records_.push_back(std::move(record));
  return true;
}

void ProfilePreviewViews::Restore(bool invalidate_before_restore) {
  for (const auto& record : records_) {
    auto* view = record->view.view();
    auto* parent = record->parent.view();
    if (!view || !parent)
      continue;
    if (invalidate_before_restore) {
      view->InvalidateLayout();
      view->SchedulePaint();
    }
    parent->AddChildViewAt(view,
                           std::min(record->index, parent->children().size()));
    view->SetVisible(record->visible);
    view->SetBoundsRect(record->bounds);
    if (record->scroll_offset) {
      if (auto* scroll = views::AsViewClass<views::ScrollView>(view))
        scroll->ScrollToOffset(*record->scroll_offset);
    }
  }
  records_.clear();
}
}  // namespace aux
