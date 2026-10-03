// Copyright 2026 The Aux Authors
#include "chrome/browser/ui/aux/native_utility_appearance_owner.h"
#if BUILDFLAG(IS_MAC) && BUILDFLAG(ENABLE_AUX_SHELL) && BUILDFLAG(AUX_ALLOW_REMOTE_DEBUGGING_FOR_TESTS)
#include "base/unguessable_token.h"
#include "content/public/test/browser_task_environment.h"
#include "testing/gtest/include/gtest/gtest.h"
namespace aux {
namespace {
// Synthetic shape controls only. These do not supply native owner authority.
base::DictValue Record(const char* kind = "normal") {
  base::DictValue result;
  result.Set("producer", "aux-native-utility-appearance-owner");
  result.Set("version", 1); result.Set("windowId", 71);
  result.Set("browserWindowId", "4"); result.Set("windowKind", kind);
  result.Set("shellDocumentToken", base::UnguessableToken::Create().ToString());
  base::DictValue page;
  page.Set("pageId", "p_fixture");
  page.Set("documentToken", base::UnguessableToken::Create().ToString());
  page.Set("selected", true);
  base::ListValue pages; pages.Append(std::move(page));
  result.Set("pages", std::move(pages)); return result;
}
TEST(NativeUtilityAppearanceOwnerTest, MissingCurrentUiRefuses) {
  content::BrowserTaskEnvironment environment;
  EXPECT_FALSE(ReadNativeUtilityAppearanceOwner({}));
}
TEST(NativeUtilityAppearanceOwnerTest, SameClosedNormalAndLittleRecordsMatch) {
  for (const char* kind : {"normal", "little"}) {
    const auto record = Record(kind);
    EXPECT_TRUE(NativeUtilityAppearanceOwnerMatches(record, record));
  }
}
TEST(NativeUtilityAppearanceOwnerTest, ReplacementWindowOrDocumentRefuses) {
  const auto original = Record("little");
  auto changed = original.Clone(); changed.Set("windowId", 72);
  EXPECT_FALSE(NativeUtilityAppearanceOwnerMatches(original, changed));
  changed = original.Clone(); changed.Set("browserWindowId", "5");
  EXPECT_FALSE(NativeUtilityAppearanceOwnerMatches(original, changed));
  changed = original.Clone(); changed.Set("shellDocumentToken", base::UnguessableToken::Create().ToString());
  EXPECT_FALSE(NativeUtilityAppearanceOwnerMatches(original, changed));
  changed = original.Clone(); changed.FindList("pages")->front().GetDict().Set("documentToken", base::UnguessableToken::Create().ToString());
  EXPECT_FALSE(NativeUtilityAppearanceOwnerMatches(original, changed));
}
TEST(NativeUtilityAppearanceOwnerTest, UnknownKindMissingAndNoncanonicalIdentityRefuse) {
  for (const char* kind : {"private", "quick-ask", "requested-little"}) {
    const auto record = Record(kind);
    EXPECT_FALSE(NativeUtilityAppearanceOwnerMatches(record, record));
  }
  auto record = Record(); record.Set("browserWindowId", "04");
  EXPECT_FALSE(NativeUtilityAppearanceOwnerMatches(record, record));
  record = Record(); record.Set("shellDocumentToken", "unknown");
  EXPECT_FALSE(NativeUtilityAppearanceOwnerMatches(record, record));
  record = Record(); record.Set("callerLabel", "little");
  EXPECT_FALSE(NativeUtilityAppearanceOwnerMatches(record, record));
}
TEST(NativeUtilityAppearanceOwnerTest, DuplicatePagesAndUnselectedLittleRefuse) {
  auto record = Record(); auto* pages = record.FindList("pages");
  pages->Append(pages->front().Clone());
  EXPECT_FALSE(NativeUtilityAppearanceOwnerMatches(record, record));
  record = Record("little"); record.FindList("pages")->front().GetDict().Set("selected", false);
  EXPECT_FALSE(NativeUtilityAppearanceOwnerMatches(record, record));
  record.Set("pages", base::ListValue());
  EXPECT_FALSE(NativeUtilityAppearanceOwnerMatches(record, record));
  record.Set("windowKind", "normal");
  EXPECT_TRUE(NativeUtilityAppearanceOwnerMatches(record, record));
}
}  // namespace
}  // namespace aux
#endif
