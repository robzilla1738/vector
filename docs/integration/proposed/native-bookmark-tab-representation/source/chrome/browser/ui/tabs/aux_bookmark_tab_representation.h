// Copyright 2026 The Aux Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
#ifndef CHROME_BROWSER_UI_TABS_AUX_BOOKMARK_TAB_REPRESENTATION_H_
#define CHROME_BROWSER_UI_TABS_AUX_BOOKMARK_TAB_REPRESENTATION_H_

#include <cstdint>
#include <map>
#include <optional>
#include <string>

namespace content {
class WebContents;
}

namespace aux {

// Original bookmark representation metadata, independent of the current URL.
struct BookmarkTabRepresentation {
  int64_t node_id;
  std::string host;
  bool operator==(const BookmarkTabRepresentation&) const = default;
};

inline constexpr char kBookmarkTabRepresentationNodeId[] =
    "bookmark_tab_representation_node_id";
inline constexpr char kBookmarkTabRepresentationHost[] =
    "bookmark_tab_representation_host";

std::optional<BookmarkTabRepresentation> GetBookmarkTabRepresentation(
    const content::WebContents* contents);
void SetBookmarkTabRepresentation(content::WebContents* contents,
                                  int64_t node_id,
                                  std::string host);
void ClearBookmarkTabRepresentation(content::WebContents* contents);
void PopulateBookmarkTabRepresentationExtraData(
    const content::WebContents* contents,
    std::map<std::string, std::string>* extra_data);
void RestoreBookmarkTabRepresentationFromExtraData(
    content::WebContents* contents,
    const std::map<std::string, std::string>& extra_data);

}  // namespace aux

#endif  // CHROME_BROWSER_UI_TABS_AUX_BOOKMARK_TAB_REPRESENTATION_H_
