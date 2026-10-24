// Copyright 2026 The Aux Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
#ifndef CHROME_BROWSER_UI_TABS_AUX_PINNED_TAB_ENTRIES_H_
#define CHROME_BROWSER_UI_TABS_AUX_PINNED_TAB_ENTRIES_H_

#include <optional>
#include <string>
#include <vector>

#include "base/containers/span.h"
#include "base/values.h"
#include "url/gurl.h"

class PrefRegistrySimple;
class PrefService;

namespace aux {

inline constexpr char kPinnedTabEntriesPref[] = "pinned_tabs";

// The supplied persistent entry is distinct from a live pinned browser tab.
struct PinnedTabEntry {
  GURL url;
  std::u16string title;
  // Empty only for the historical preference before native migration is ready.
  std::string logical_id;
};

struct PinnedTabEntryCandidate {
  GURL visible_url;
  std::vector<GURL> history_urls;
};

// Original one-to-one adoption: reserve existing identities, then match all
// current URLs, all history URLs, then all registry-controlled domains.
std::vector<std::optional<size_t>> MatchPinnedTabEntryCandidates(
    base::span<const PinnedTabEntry> entries,
    base::span<const GURL> remembered_urls,
    base::span<const PinnedTabEntryCandidate> candidates);

// Source mutations preserve existing title/order and remove only first match.
void AddPinnedTabEntryIfAbsent(PrefService& prefs,
                               const GURL& url,
                               const std::u16string& title);
void RemoveFirstPinnedTabEntry(PrefService& prefs, const GURL& url);

void RegisterPinnedTabEntriesPrefs(PrefRegistrySimple* registry);
std::vector<PinnedTabEntry> ParsePinnedTabEntries(
    const base::ListValue& values);
base::ListValue SerializePinnedTabEntries(
    base::span<const PinnedTabEntry> entries);
std::vector<PinnedTabEntry> ReadPinnedTabEntries(const PrefService& prefs);
void WritePinnedTabEntries(PrefService& prefs,
                           base::span<const PinnedTabEntry> entries);

}  // namespace aux
#endif  // CHROME_BROWSER_UI_TABS_AUX_PINNED_TAB_ENTRIES_H_
