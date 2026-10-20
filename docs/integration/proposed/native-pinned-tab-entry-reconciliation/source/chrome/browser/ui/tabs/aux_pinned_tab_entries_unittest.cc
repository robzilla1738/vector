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

TEST(PinnedTabEntriesTest, ExplicitPinKeepsFirstTitleAndExistingOrder) {
  TestingPrefServiceSimple prefs;
  RegisterPinnedTabEntriesPrefs(prefs.registry());
  const GURL first("https://example.test/one");
  WritePinnedTabEntries(prefs, std::vector<PinnedTabEntry>{{first, u"First"}});
  AddPinnedTabEntryIfAbsent(prefs, first, u"Changed");
  AddPinnedTabEntryIfAbsent(prefs, GURL("https://example.test/two"), u"Second");
  const auto entries = ReadPinnedTabEntries(prefs);
  ASSERT_EQ(entries.size(), 2u);
  EXPECT_EQ(entries[0].url, first);
  EXPECT_EQ(entries[0].title, u"First");
  EXPECT_EQ(entries[1].title, u"Second");
}

TEST(PinnedTabEntriesTest, ExplicitUnpinRemovesOnlyFirstExactUrl) {
  TestingPrefServiceSimple prefs;
  RegisterPinnedTabEntriesPrefs(prefs.registry());
  const GURL first("https://example.test/one");
  const GURL other("https://other.test/one");
  WritePinnedTabEntries(
      prefs, std::vector<PinnedTabEntry>{
                 {first, u"First"}, {other, u"Other"}, {first, u"Duplicate"}});
  RemoveFirstPinnedTabEntry(prefs, first);
  const auto entries = ReadPinnedTabEntries(prefs);
  ASSERT_EQ(entries.size(), 2u);
  EXPECT_EQ(entries[0].url, other);
  EXPECT_EQ(entries[1].url, first);
  EXPECT_EQ(entries[1].title, u"Duplicate");
}

TEST(PinnedTabEntriesTest, InvalidMutationLeavesActualPreferenceUntouched) {
  TestingPrefServiceSimple prefs;
  RegisterPinnedTabEntriesPrefs(prefs.registry());
  prefs.SetList(kPinnedTabEntriesPref, base::ListValue().Append(9));
  AddPinnedTabEntryIfAbsent(prefs, GURL(), u"Invalid");
  RemoveFirstPinnedTabEntry(prefs, GURL());
  ASSERT_EQ(prefs.GetList(kPinnedTabEntriesPref).size(), 1u);
  EXPECT_EQ(prefs.GetList(kPinnedTabEntriesPref)[0].GetInt(), 9);
}

TEST(PinnedTabEntriesTest, ExistingIdentityClaimsOnlyFirstDuplicate) {
  const GURL url("https://example.test/saved");
  const std::vector<PinnedTabEntry> saved = {{url, u"One"}, {url, u"Two"}};
  const std::vector<GURL> remembered = {url};
  const std::vector<PinnedTabEntryCandidate> candidates = {{url, {}},
                                                           {url, {}}};
  const auto matches =
      MatchPinnedTabEntryCandidates(saved, remembered, candidates);
  ASSERT_EQ(matches.size(), 2u);
  EXPECT_EQ(matches[0], 1u);
  EXPECT_FALSE(matches[1]);
}

TEST(PinnedTabEntriesTest, ExactCurrentMatchPrecedesEarlierHistoryOrDomain) {
  const GURL saved_url("https://example.test/saved");
  const std::vector<PinnedTabEntry> saved = {{saved_url, {}}};
  const std::vector<PinnedTabEntryCandidate> candidates = {
      {GURL("https://example.test/other"), {saved_url}}, {saved_url, {}}};
  const auto matches = MatchPinnedTabEntryCandidates(saved, {}, candidates);
  EXPECT_FALSE(matches[0]);
  EXPECT_EQ(matches[1], 0u);
}

TEST(PinnedTabEntriesTest, HistoryPrecedesEarlierDomainAndClaimsOnce) {
  const GURL saved_url("https://www.example.test/saved");
  const std::vector<PinnedTabEntry> saved = {{saved_url, {}}};
  const std::vector<PinnedTabEntryCandidate> candidates = {
      {GURL("https://www.example.test/elsewhere"), {}},
      {GURL("https://other.test/"), {saved_url}}};
  const auto matches = MatchPinnedTabEntryCandidates(saved, {}, candidates);
  EXPECT_FALSE(matches[0]);
  EXPECT_EQ(matches[1], 0u);
}

TEST(PinnedTabEntriesTest, PrivateRegistryBoundaryIsIncluded) {
  const std::vector<PinnedTabEntry> saved = {
      {GURL("https://alice.github.io/saved"), {}},
      {GURL("https://www.example.com/saved"), {}}};
  const std::vector<PinnedTabEntryCandidate> candidates = {
      {GURL("https://bob.github.io/other"), {}},
      {GURL("https://news.example.com/other"), {}},
      {GURL(), {}}};
  const auto matches = MatchPinnedTabEntryCandidates(saved, {}, candidates);
  EXPECT_FALSE(matches[0]);
  EXPECT_EQ(matches[1], 1u);
  EXPECT_FALSE(matches[2]);
}

}  // namespace
}  // namespace aux
