// Copyright 2026 The Aux Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
#include "chrome/browser/ui/tabs/aux_pinned_tab_entries.h"

#include "components/prefs/testing_pref_service.h"
#include "testing/gtest/include/gtest/gtest.h"

namespace aux {
namespace {

TEST(PinnedTabEntriesTest, FiltersInvalidValuesAndKeepsOrderAndDuplicates) {
  base::ListValue values;
  values.Append(4);
  values.Append(base::DictValue().Set("title", "Missing URL"));
  values.Append(base::DictValue().Set("url", "not a URL"));
  values.Append(base::DictValue()
                    .Set("url", "https://example.test/one")
                    .Set("title", "One"));
  values.Append(
      base::DictValue().Set("url", "https://example.test/two").Set("title", 5));
  values.Append(base::DictValue()
                    .Set("url", "https://example.test/one")
                    .Set("title", "Duplicate"));
  const auto entries = ParsePinnedTabEntries(values);
  ASSERT_EQ(entries.size(), 3u);
  EXPECT_EQ(entries[0].url, GURL("https://example.test/one"));
  EXPECT_EQ(entries[0].title, u"One");
  EXPECT_EQ(entries[1].url, GURL("https://example.test/two"));
  EXPECT_TRUE(entries[1].title.empty());
  EXPECT_EQ(entries[2].url, entries[0].url);
  EXPECT_EQ(entries[2].title, u"Duplicate");
}

TEST(PinnedTabEntriesTest, WritesOnlyValidCanonicalUrlsAndNonemptyTitles) {
  const std::vector<PinnedTabEntry> entries = {
      {GURL("https://EXAMPLE.test:443/a/../one"), u"One"},
      {GURL(), u"Invalid"},
      {GURL("https://example.test/two"), u""}};
  const auto values = SerializePinnedTabEntries(entries);
  ASSERT_EQ(values.size(), 2u);
  EXPECT_EQ(*values[0].GetDict().FindString("url"), "https://example.test/one");
  EXPECT_EQ(*values[0].GetDict().FindString("title"), "One");
  EXPECT_FALSE(values[1].GetDict().contains("title"));
  EXPECT_EQ(values[1].GetDict().size(), 1u);
}

TEST(PinnedTabEntriesTest, ActualInMemoryPreferenceIsIsolatedAndRoundTrips) {
  TestingPrefServiceSimple first;
  TestingPrefServiceSimple second;
  RegisterPinnedTabEntriesPrefs(first.registry());
  RegisterPinnedTabEntriesPrefs(second.registry());
  EXPECT_TRUE(ReadPinnedTabEntries(first).empty());
  WritePinnedTabEntries(
      first,
      std::vector<PinnedTabEntry>{{GURL("https://example.test/"), u"Example"}});
  const auto entries = ReadPinnedTabEntries(first);
  ASSERT_EQ(entries.size(), 1u);
  EXPECT_EQ(entries[0].title, u"Example");
  EXPECT_TRUE(ReadPinnedTabEntries(second).empty());
}

}  // namespace
}  // namespace aux
