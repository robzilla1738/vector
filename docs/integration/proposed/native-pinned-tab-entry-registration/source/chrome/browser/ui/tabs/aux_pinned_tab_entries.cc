// Copyright 2026 The Aux Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
#include "chrome/browser/ui/tabs/aux_pinned_tab_entries.h"

#include <utility>

#include "base/strings/utf_string_conversions.h"
#include "components/pref_registry/pref_registry_syncable.h"
#include "components/prefs/pref_registry_simple.h"
#include "components/prefs/pref_service.h"

namespace aux {

void RegisterPinnedTabEntriesPrefs(PrefRegistrySimple* registry) {
  registry->RegisterListPref(
      kPinnedTabEntriesPref, user_prefs::PrefRegistrySyncable::SYNCABLE_PREF);
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

}  // namespace aux
