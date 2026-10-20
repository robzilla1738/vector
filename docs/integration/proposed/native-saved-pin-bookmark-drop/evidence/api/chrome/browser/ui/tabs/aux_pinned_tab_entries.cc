// Copyright 2026 The Aux Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
#include "chrome/browser/ui/tabs/aux_pinned_tab_entries.h"

#include <algorithm>
#include <utility>

#include "base/strings/utf_string_conversions.h"
#include "components/pref_registry/pref_registry_syncable.h"
#include "components/prefs/pref_registry_simple.h"
#include "components/prefs/pref_service.h"
#include "net/base/registry_controlled_domains/registry_controlled_domain.h"

namespace aux {

std::vector<std::optional<size_t>> MatchPinnedTabEntryCandidates(
    base::span<const PinnedTabEntry> entries,
    base::span<const GURL> remembered_urls,
    base::span<const PinnedTabEntryCandidate> candidates) {
  std::vector<bool> claimed(entries.size(), false);
  std::vector<std::optional<size_t>> matches(candidates.size());
  for (const GURL& url : remembered_urls) {
    for (size_t i = 0; i < entries.size(); ++i) {
      if (!claimed[i] && entries[i].url == url) {
        claimed[i] = true;
        break;
      }
    }
  }
  for (int pass = 0; pass < 3; ++pass) {
    for (size_t candidate = 0; candidate < candidates.size(); ++candidate) {
      if (matches[candidate])
        continue;
      const auto& tab = candidates[candidate];
      for (size_t i = 0; i < entries.size(); ++i) {
        if (claimed[i])
          continue;
        const GURL& url = entries[i].url;
        bool matches_url = false;
        if (pass == 0) {
          matches_url = tab.visible_url == url;
        } else if (pass == 1) {
          matches_url = std::ranges::find(tab.history_urls, url) !=
                        tab.history_urls.end();
        } else {
          matches_url =
              url.is_valid() && tab.visible_url.is_valid() && url.has_host() &&
              tab.visible_url.has_host() &&
              net::registry_controlled_domains::SameDomainOrHost(
                  url, tab.visible_url,
                  net::registry_controlled_domains::INCLUDE_PRIVATE_REGISTRIES);
        }
        if (matches_url) {
          matches[candidate] = i;
          claimed[i] = true;
          break;
        }
      }
    }
  }
  return matches;
}

void RegisterPinnedTabEntriesPrefs(PrefRegistrySimple* registry) {
  registry->RegisterListPref(kPinnedTabEntriesPref,
                             user_prefs::PrefRegistrySyncable::SYNCABLE_PREF);
}

std::vector<PinnedTabEntry> ParsePinnedTabEntries(
    const base::ListValue& values) {
  std::vector<PinnedTabEntry> entries;
  for (const auto& value : values) {
    const auto* dictionary = value.GetIfDict();
    if (!dictionary) {
      continue;
    }
    const auto* url_string = dictionary->FindString("url");
    if (!url_string) {
      continue;
    }
    GURL url(*url_string);
    if (!url.is_valid()) {
      continue;
    }
    const auto* title = dictionary->FindString("title");
    entries.push_back(
        {std::move(url), title ? base::UTF8ToUTF16(*title) : std::u16string()});
  }
  return entries;
}

base::ListValue SerializePinnedTabEntries(
    base::span<const PinnedTabEntry> entries) {
  base::ListValue values;
  for (const auto& entry : entries) {
    if (!entry.url.is_valid()) {
      continue;
    }
    base::DictValue dictionary;
    dictionary.Set("url", entry.url.spec());
    if (!entry.title.empty()) {
      dictionary.Set("title", base::UTF16ToUTF8(entry.title));
    }
    values.Append(std::move(dictionary));
  }
  return values;
}

std::vector<PinnedTabEntry> ReadPinnedTabEntries(const PrefService& prefs) {
  return ParsePinnedTabEntries(prefs.GetList(kPinnedTabEntriesPref));
}

void WritePinnedTabEntries(PrefService& prefs,
                           base::span<const PinnedTabEntry> entries) {
  prefs.SetList(kPinnedTabEntriesPref, SerializePinnedTabEntries(entries));
}

void AddPinnedTabEntryIfAbsent(PrefService& prefs,
                               const GURL& url,
                               const std::u16string& title) {
  if (!url.is_valid())
    return;
  auto entries = ReadPinnedTabEntries(prefs);
  if (std::ranges::any_of(
          entries, [&url](const auto& entry) { return entry.url == url; }))
    return;
  entries.push_back({url, title});
  WritePinnedTabEntries(prefs, entries);
}

void RemoveFirstPinnedTabEntry(PrefService& prefs, const GURL& url) {
  if (!url.is_valid())
    return;
  auto entries = ReadPinnedTabEntries(prefs);
  const auto found = std::ranges::find_if(
      entries, [&url](const auto& entry) { return entry.url == url; });
  if (found != entries.end())
    entries.erase(found);
  WritePinnedTabEntries(prefs, entries);
}

}  // namespace aux
