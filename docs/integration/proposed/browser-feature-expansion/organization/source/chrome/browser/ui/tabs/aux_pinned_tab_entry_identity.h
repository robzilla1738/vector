// Copyright 2026 The Aux Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
#ifndef CHROME_BROWSER_UI_TABS_AUX_PINNED_TAB_ENTRY_IDENTITY_H_
#define CHROME_BROWSER_UI_TABS_AUX_PINNED_TAB_ENTRY_IDENTITY_H_
#include <optional>
#include <string>
#include "url/gurl.h"
namespace content {
class WebContents;
}
namespace aux {
void RememberPinnedTabEntryId(content::WebContents&, const std::string& id);
std::optional<std::string> GetRememberedPinnedTabEntryId(const content::WebContents&);
void ClearRememberedPinnedTabEntryId(content::WebContents&);
void RememberPinnedTabEntryUrl(content::WebContents& contents, const GURL& url);
std::optional<GURL> GetRememberedPinnedTabEntryUrl(
    const content::WebContents& contents);
void ClearRememberedPinnedTabEntryUrl(content::WebContents& contents);
}  // namespace aux
#endif  // CHROME_BROWSER_UI_TABS_AUX_PINNED_TAB_ENTRY_IDENTITY_H_
