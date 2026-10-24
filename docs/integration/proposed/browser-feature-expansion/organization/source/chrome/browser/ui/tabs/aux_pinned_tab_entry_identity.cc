// Copyright 2026 The Aux Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
#include "chrome/browser/ui/tabs/aux_pinned_tab_entry_identity.h"
#include <memory>
#include <utility>
#include "chrome/browser/aux/organization/organization_model.h"
#include "base/supports_user_data.h"
#include "content/public/browser/web_contents.h"
namespace aux {
namespace {

const char kPinnedTabEntryUrlKey = 0;
const char kPinnedTabEntryIdKey = 0;
class PinnedTabEntryIdData : public base::SupportsUserData::Data {
 public:
  explicit PinnedTabEntryIdData(std::string value) : id(std::move(value)) {}
  const std::string id;
};

class PinnedTabEntryUrlData : public base::SupportsUserData::Data {
 public:
  explicit PinnedTabEntryUrlData(const GURL& value) : url(value) {}
  const GURL url;
};

}  // namespace

void RememberPinnedTabEntryId(content::WebContents& contents, const std::string& id) {
  if (organization::IsCanonicalId(id))
    contents.SetUserData(&kPinnedTabEntryIdKey, std::make_unique<PinnedTabEntryIdData>(id));
}
std::optional<std::string> GetRememberedPinnedTabEntryId(const content::WebContents& contents) {
  const auto* data = static_cast<const PinnedTabEntryIdData*>(contents.GetUserData(&kPinnedTabEntryIdKey));
  return data ? std::optional<std::string>(data->id) : std::nullopt;
}
void ClearRememberedPinnedTabEntryId(content::WebContents& contents) {
  contents.RemoveUserData(&kPinnedTabEntryIdKey);
}

void RememberPinnedTabEntryUrl(content::WebContents& contents,
                               const GURL& url) {
  if (!url.is_valid()) {
    return;
  }
  contents.SetUserData(&kPinnedTabEntryUrlKey,
                       std::make_unique<PinnedTabEntryUrlData>(url));
}

std::optional<GURL> GetRememberedPinnedTabEntryUrl(
    const content::WebContents& contents) {
  const auto* data = static_cast<const PinnedTabEntryUrlData*>(
      contents.GetUserData(&kPinnedTabEntryUrlKey));
  if (!data) {
    return std::nullopt;
  }
  return data->url;
}

void ClearRememberedPinnedTabEntryUrl(content::WebContents& contents) {
  contents.RemoveUserData(&kPinnedTabEntryUrlKey);
}
}  // namespace aux
