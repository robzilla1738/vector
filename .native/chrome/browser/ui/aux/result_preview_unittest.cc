// Copyright 2026 The Aux Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

#include "chrome/browser/ui/aux/result_preview.h"

#include "chrome/test/base/chrome_render_view_host_test_harness.h"
#include "content/public/test/web_contents_tester.h"
#include "testing/gtest/include/gtest/gtest.h"
#include "url/origin.h"
#include "url/scheme_host_port.h"

namespace aux {
namespace {

class ResultPreviewTest : public ChromeRenderViewHostTestHarness {};

TEST_F(ResultPreviewTest, RegisteredDestinationPrecursorRemainsOpaqueOnly) {
  auto first = url::Origin::CreateOpaqueAuxResultPreviewOrigin();
  auto second = url::Origin::CreateOpaqueAuxResultPreviewOrigin();
  ASSERT_TRUE(first);
  ASSERT_TRUE(second);
  EXPECT_TRUE(first->opaque());
  EXPECT_TRUE(first->HasAuxResultPreviewOpaquePrecursor());
  EXPECT_NE(*first, *second);
  EXPECT_EQ("null", first->Serialize());
  EXPECT_FALSE(url::SchemeHostPort("aux-result", "preview", 0).IsValid());
  EXPECT_FALSE(url::Origin::UnsafelyCreateTupleOriginWithoutNormalization(
      "aux-result", "preview", 0));
  EXPECT_FALSE(url::Origin::CreateFromNormalizedTuple(
      "aux-result", "preview", 0).HasAuxResultPreviewOpaquePrecursor());
  EXPECT_TRUE(first->CanBeDerivedFrom(GURL("aux-result://preview/item")));
  EXPECT_FALSE(first->CanBeDerivedFrom(GURL("aux-result://foreign/item")));
  EXPECT_FALSE(first->CanBeDerivedFrom(GURL("https://preview/item")));
}

TEST_F(ResultPreviewTest, URLMustBeCanonicalOpaquePreviewToken) {
  const GURL valid(
      "aux-result://preview/0123456789abcdef0123456789abcdef0123456789abcdef");
  EXPECT_TRUE(ResultPreviewStore::IsValidURL(valid));
  EXPECT_FALSE(ResultPreviewStore::IsValidURL(GURL(
      "aux-result://other/0123456789abcdef0123456789abcdef0123456789abcdef")));
  EXPECT_FALSE(ResultPreviewStore::IsValidURL(
      GURL("aux-result://preview/"
           "0123456789abcdef0123456789abcdef0123456789abcdef?x=1")));
  EXPECT_FALSE(
      ResultPreviewStore::IsValidURL(GURL("aux-result://preview/../x")));
  EXPECT_FALSE(ResultPreviewStore::IsValidURL(GURL(
      "https://preview/0123456789abcdef0123456789abcdef0123456789abcdef")));
}

TEST_F(ResultPreviewTest, OwnerAndLifetimeAreMemoryOnly) {
  EXPECT_FALSE(ResultPreviewStore::Create(web_contents(), "<p>hello</p>"));
  NavigateAndCommit(GURL("chrome://aux/"));
  auto url = ResultPreviewStore::Create(web_contents(), "<p>hello</p>");
  ASSERT_TRUE(url);
  EXPECT_EQ(ResultPreviewStore::Read(web_contents(), GURL(*url)),
            "<p>hello</p>");

  auto other =
      content::WebContentsTester::CreateTestWebContents(profile(), nullptr);
  content::WebContentsTester::For(other.get())
      ->NavigateAndCommit(GURL("chrome://aux/"));
  EXPECT_FALSE(ResultPreviewStore::Read(other.get(), GURL(*url)));
  EXPECT_FALSE(ResultPreviewStore::Release(other.get(), GURL(*url)));
  EXPECT_TRUE(ResultPreviewStore::Release(web_contents(), GURL(*url)));
  EXPECT_FALSE(ResultPreviewStore::Read(web_contents(), GURL(*url)));
}

TEST_F(ResultPreviewTest, BoundsHtmlAndRejectsNavigatedShell) {
  NavigateAndCommit(GURL("chrome://aux/"));
  EXPECT_FALSE(ResultPreviewStore::Create(web_contents(), ""));
  EXPECT_FALSE(
      ResultPreviewStore::Create(web_contents(), std::string("a\0b", 3)));
  EXPECT_FALSE(ResultPreviewStore::Create(web_contents(),
                                          std::string(256 * 1024 + 1, 'a')));
  auto url = ResultPreviewStore::Create(web_contents(), "<button>OK</button>");
  ASSERT_TRUE(url);
  NavigateAndCommit(GURL("https://example.test/"));
  EXPECT_FALSE(ResultPreviewStore::Read(web_contents(), GURL(*url)));
  EXPECT_FALSE(ResultPreviewStore::Create(web_contents(), "<p>other</p>"));
}

TEST_F(ResultPreviewTest, CapacityIsBoundedPerShell) {
  NavigateAndCommit(GURL("chrome://aux/"));
  for (int i = 0; i < 32; ++i) {
    EXPECT_TRUE(ResultPreviewStore::Create(web_contents(), "<p>preview</p>"));
  }
  EXPECT_FALSE(ResultPreviewStore::Create(web_contents(), "<p>one more</p>"));
}

}  // namespace
}  // namespace aux
