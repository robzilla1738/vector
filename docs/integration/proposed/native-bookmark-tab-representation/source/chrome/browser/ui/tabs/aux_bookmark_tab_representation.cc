// Copyright 2026 The Aux Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
#include "chrome/browser/ui/tabs/aux_bookmark_tab_representation.h"

#include <memory>
#include <utility>

#include "base/strings/string_number_conversions.h"
#include "base/supports_user_data.h"
#include "content/public/browser/web_contents.h"

namespace aux {
namespace {

const char kBookmarkTabRepresentationKey = 0;

class BookmarkTabRepresentationData : public base::SupportsUserData::Data {
 public:
  BookmarkTabRepresentationData(int64_t node_id, std::string host)
      : value{node_id, std::move(host)} {}
  const BookmarkTabRepresentation value;
};

}  // namespace

std::optional<BookmarkTabRepresentation> GetBookmarkTabRepresentation(
    const content::WebContents* contents) {
  if (!contents) {
    return std::nullopt;
  }
  const auto* data = static_cast<const BookmarkTabRepresentationData*>(
      contents->GetUserData(&kBookmarkTabRepresentationKey));
  return data ? std::make_optional(data->value) : std::nullopt;
}

void SetBookmarkTabRepresentation(content::WebContents* contents,
                                  int64_t node_id,
                                  std::string host) {
  // The supplied setter rejects zero, not all non-positive integer IDs.
  if (!contents || !node_id || host.empty()) {
    return;
  }
  contents->SetUserData(&kBookmarkTabRepresentationKey,
                        std::make_unique<BookmarkTabRepresentationData>(
                            node_id, std::move(host)));
}

void ClearBookmarkTabRepresentation(content::WebContents* contents) {
  if (contents) {
    contents->RemoveUserData(&kBookmarkTabRepresentationKey);
  }
}

void PopulateBookmarkTabRepresentationExtraData(
    const content::WebContents* contents,
    std::map<std::string, std::string>* extra_data) {
  if (!extra_data) {
    return;
  }
  const auto representation = GetBookmarkTabRepresentation(contents);
  if (!representation || representation->host.empty()) {
    return;
  }
  (*extra_data)[kBookmarkTabRepresentationNodeId] =
      base::NumberToString(representation->node_id);
  (*extra_data)[kBookmarkTabRepresentationHost] = representation->host;
}

void RestoreBookmarkTabRepresentationFromExtraData(
    content::WebContents* contents,
    const std::map<std::string, std::string>& extra_data) {
  if (!contents) {
    return;
  }
  const auto id = extra_data.find(kBookmarkTabRepresentationNodeId);
  const auto host = extra_data.find(kBookmarkTabRepresentationHost);
  int64_t node_id = 0;
  if (id == extra_data.end() || host == extra_data.end() ||
      host->second.empty() || !base::StringToInt64(id->second, &node_id) ||
      !node_id) {
    return;
  }
  SetBookmarkTabRepresentation(contents, node_id, host->second);
}

}  // namespace aux
