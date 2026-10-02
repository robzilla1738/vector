// Copyright 2026 The Aux Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

#include "chrome/browser/ui/aux/result_preview.h"

#include <string>

#include "base/json/json_writer.h"
#include "base/strings/strcat.h"
#include "base/test/run_until.h"
#include "base/test/scoped_feature_list.h"
#include "base/values.h"
#include "chrome/browser/ui/browser.h"
#include "chrome/common/chrome_features.h"
#include "chrome/browser/ui/webui_browser/webui_browser_ui.h"
#include "chrome/browser/ui/webui_browser/webui_browser_window.h"
#include "chrome/test/base/in_process_browser_test.h"
#include "content/public/browser/render_frame_host.h"
#include "content/public/browser/web_contents.h"
#include "content/public/browser/web_ui.h"
#include "content/public/common/content_features.h"
#include "content/public/test/browser_test.h"
#include "content/public/test/browser_test_utils.h"
#include "content/public/test/test_navigation_observer.h"
#include "testing/gtest/include/gtest/gtest.h"
#include "url/origin.h"

namespace aux {
namespace {

class ResultPreviewBrowserTest : public InProcessBrowserTest {
 public:
  void SetUp() override {
    features_.InitWithFeatures(
        {features::kWebium, features::kAttachUnownedInnerWebContents}, {});
    InProcessBrowserTest::SetUp();
  }

 private:
  base::test::ScopedFeatureList features_;
};

IN_PROC_BROWSER_TEST_F(ResultPreviewBrowserTest,
                       ScriptRunsButCannotReachBridgeStorageOrNetwork) {
  auto* window = WebUIBrowserWindow::FromBrowser(browser());
  ASSERT_TRUE(window);
  auto* ui = window->GetWebUIBrowserUI();
  ASSERT_TRUE(ui);
  content::WebContents* shell = ui->web_ui()->GetWebContents();
  ASSERT_TRUE(content::WaitForLoadStop(shell));

  const std::string html = R"HTML(
    <!doctype html><button id="action" onclick="window.clicked=true">Run</button>
    <a id="escape" href="https://example.test/escape">Leave preview</a>
    <script>
      window.bridgeDenied = false;
      window.hostBridgeAbsent = typeof window.aux === 'undefined' &&
          typeof window.auxChromiumHost === 'undefined';
      window.storageDenied = false;
      try { void parent.aux; } catch { window.bridgeDenied = true; }
      try { localStorage.setItem('leak', 'value'); }
      catch { window.storageDenied = true; }
      window.networkDenied = fetch('https://example.test/egress')
          .then(() => false, () => true);
    </script>
  )HTML";
  ASSERT_TRUE(
      content::EvalJs(shell,
                      "typeof window.aux?.createResultPreview === 'function'")
          .ExtractBool());
  // Exercise the real authorized native endpoint before feature qualification.
  // The generated product client deliberately refuses unqualified previews;
  // no development-acceptance or qualification state is changed by this test.
  const std::string url =
      content::EvalJs(shell,
                      base::StrCat({"window.auxChromiumHost.request(\"createResultPreview\", [",
                                    *base::WriteJson(base::Value(html)), "])"}))
          .ExtractString();
  ASSERT_TRUE(ResultPreviewStore::IsValidURL(GURL(url)));
  EXPECT_TRUE(url::Origin::Create(GURL(url)).opaque());
  ASSERT_TRUE(
      content::EvalJs(
          shell,
          base::StrCat(
              {"(() => { const frame = document.createElement('iframe'); "
               "frame.sandbox = 'allow-scripts'; frame.src = '",
               url, "'; document.body.appendChild(frame); return true; })()"}))
          .ExtractBool());
  ASSERT_TRUE(base::test::RunUntil([&] {
    auto* frame = content::ChildFrameAt(shell->GetPrimaryMainFrame(), 0);
    return frame && frame->GetLastCommittedURL() == GURL(url);
  }));
  auto* frame = content::ChildFrameAt(shell->GetPrimaryMainFrame(), 0);
  ASSERT_TRUE(frame);
  EXPECT_EQ(content::EvalJs(frame, "location.origin"), "null");
  EXPECT_EQ(content::EvalJs(frame,
                            "document.querySelector('#action').click(); "
                            "window.clicked"),
            true);
  EXPECT_EQ(content::EvalJs(frame, "window.bridgeDenied"), true);
  EXPECT_EQ(content::EvalJs(frame, "window.hostBridgeAbsent"), true);
  EXPECT_EQ(content::EvalJs(frame, "window.storageDenied"), true);
  EXPECT_EQ(content::EvalJs(frame, "window.networkDenied"), true);
  content::TestNavigationObserver escape(
      shell, 1, content::MessageLoopRunner::QuitMode::IMMEDIATE,
      /*ignore_uncommitted_navigations=*/false);
  EXPECT_TRUE(
      content::EvalJs(frame, "document.querySelector('#escape').click(); true")
          .ExtractBool());
  escape.WaitForNavigationFinished();
  EXPECT_EQ(escape.last_navigation_url(), GURL("https://example.test/escape"));
  EXPECT_FALSE(escape.last_navigation_succeeded());
  EXPECT_TRUE(
      content::EvalJs(
          shell, base::StrCat({"window.auxChromiumHost.request(\"releaseResultPreview\", ['", url, "'])"}))
          .ExtractBool());
  EXPECT_FALSE(ResultPreviewStore::Read(shell, GURL(url)));
}

}  // namespace
}  // namespace aux
