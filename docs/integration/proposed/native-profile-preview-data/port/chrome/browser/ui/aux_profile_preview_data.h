// Copyright 2026 Aux Authors. All rights reserved.
#ifndef CHROME_BROWSER_UI_AUX_PROFILE_PREVIEW_DATA_H_
#define CHROME_BROWSER_UI_AUX_PROFILE_PREVIEW_DATA_H_

#include <string>
#include <vector>

#include "base/files/file_path.h"

class BrowserWindowInterface;
class TabStripModel;
namespace aux {
struct ProfilePreviewTabInfo {
  std::u16string title;
  bool active = false;
  bool pinned = false;
  bool operator==(const ProfilePreviewTabInfo&) const = default;
};
struct ProfilePreviewData {
  std::vector<ProfilePreviewTabInfo> tabs;
  int selected_index = 0;
};

// Original45589b0: genuine live title/active/pinned data only.
ProfilePreviewData CaptureProfilePreviewData(const TabStripModel& model);
// Original455ca00: active source, other real normal window, owned hidden cache,
// then the source window's saved per-path metadata. Does not load a profile.
ProfilePreviewData GetProfilePreviewData(BrowserWindowInterface& source,
                                        const base::FilePath& target_path);
}  // namespace aux
#endif  // CHROME_BROWSER_UI_AUX_PROFILE_PREVIEW_DATA_H_
