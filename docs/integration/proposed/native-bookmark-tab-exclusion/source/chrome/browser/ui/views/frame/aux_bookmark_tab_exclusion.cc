// Copyright 2026 Aux Authors. BSD-style license: see //LICENSE.
#include "chrome/browser/ui/views/frame/aux_bookmark_tab_exclusion.h"

#include <memory>
#include "base/supports_user_data.h"
#include "chrome/browser/ui/tabs/tab_group_features.h"
#include "chrome/browser/ui/tabs/tab_group_model.h"
#include "chrome/browser/ui/tabs/tab_strip_model.h"
#include "components/tabs/public/tab_group.h"
#include "components/tabs/public/tab_interface.h"
#include "content/public/browser/web_contents.h"

namespace aux {
namespace {
const char kRetainedTabGroupKey = 0;
class RetainedTabGroupData final : public base::SupportsUserData::Data {
 public:
  explicit RetainedTabGroupData(const RetainedTabGroup& value) : value(value) {}
  RetainedTabGroup value;
};
}  // namespace

void SetRetainedTabGroup(content::WebContents& contents,
                         const RetainedTabGroup& group) {
  contents.SetUserData(&kRetainedTabGroupKey,
                      std::make_unique<RetainedTabGroupData>(group));
}
std::optional<RetainedTabGroup> GetRetainedTabGroup(
    content::WebContents& contents) {
  const auto* data = static_cast<const RetainedTabGroupData*>(
      contents.GetUserData(&kRetainedTabGroupKey));
  return data ? std::make_optional(data->value) : std::nullopt;
}
void ClearRetainedTabGroup(content::WebContents& contents) {
  contents.RemoveUserData(&kRetainedTabGroupKey);
}

bool IsBookmarkTabExcluded(tabs::TabInterface* tab,
                            const TabStripModel* model) {
  // Original412775c..60 requires both inputs before inspecting userdata.
  if (!tab || !model) return false;
  if (auto* contents = tab->GetContents();
      contents && contents->GetUserData(&kRetainedTabGroupKey)) {
    return true;
  }
  const auto group_id = tab->GetGroup();
  const auto* groups = model->group_model();
  const auto* group = groups && group_id ? groups->GetTabGroup(*group_id) : nullptr;
  const auto* features = group ? group->GetTabGroupFeatures() : nullptr;
  // Original group+b8 points to actual TabGroupFeatures, marker byte+11.
  return features && features->is_agent_group();
}
}  // namespace aux
