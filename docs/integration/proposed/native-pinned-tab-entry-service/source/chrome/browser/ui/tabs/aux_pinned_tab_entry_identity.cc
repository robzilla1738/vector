// Copyright 2026 The Aux Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
#include "chrome/browser/ui/tabs/aux_pinned_tab_entry_identity.h"
#include <memory>
#include "base/supports_user_data.h"
#include "content/public/browser/web_contents.h"
namespace aux {
namespace {

const char kPinnedTabEntryUrlKey = 0;

class PinnedTabEntryUrlData : public base::SupportsUserData::Data {
 public:
  explicit PinnedTabEntryUrlData(const GURL& value) : url(value) {}
  const GURL url;
};

}  // namespace

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
