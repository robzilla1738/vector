// Copyright 2026 Aux Authors. All rights reserved.
// Supplied040fd7f4 and4657a84/4658520, adapted to Chromium155 ownership APIs.
#ifndef CHROME_BROWSER_UI_VIEWS_FRAME_AUX_PROFILE_SWITCH_OWNER_H_
#define CHROME_BROWSER_UI_VIEWS_FRAME_AUX_PROFILE_SWITCH_OWNER_H_

#include <memory>
#include <vector>

#include "base/files/file_path.h"
#include "ui/gfx/geometry/rect.h"

class PrefRegistrySimple;
class PrefService;
class ProfileAttributesStorage;
namespace views {
class View;
}
namespace aux {
// This supplied internal key lives only in Aux's isolated browser local state.
inline constexpr char kHorizontalProfileOrder[] =
    "aux.vertical_tabs.profile_order";
void RegisterProfileSwitchLocalStatePrefs(PrefRegistrySimple* registry);
// Returns only paths from the actual registry. Preference strings cannot
// introduce/load a new filesystem path. This order is NOT profileIndex.
std::vector<base::FilePath> HorizontalProfileOrder(
    const ProfileAttributesStorage& storage,
    const PrefService& local_state);

// Owns the original temporary reparenting transaction, not the borrowed Views.
// The preview owner must restore BEFORE its live host is destroyed. Deletion
// trackers tolerate a closed source/parent without dereferencing stale Views.
class ProfilePreviewViews {
 public:
  ProfilePreviewViews();
  ~ProfilePreviewViews();
  ProfilePreviewViews(const ProfilePreviewViews&) = delete;
  ProfilePreviewViews& operator=(const ProfilePreviewViews&) = delete;
  bool Borrow(views::View* view,
              views::View* host,
              const gfx::Rect& preview_bounds);
  void Restore(bool invalidate_before_restore);
  bool empty() const { return records_.empty(); }

 private:
  struct Record;
  std::vector<std::unique_ptr<Record>> records_;
};
}  // namespace aux
#endif  // CHROME_BROWSER_UI_VIEWS_FRAME_AUX_PROFILE_SWITCH_OWNER_H_
