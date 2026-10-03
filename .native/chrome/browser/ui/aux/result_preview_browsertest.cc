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
#include "content/public/browser/content_browser_client.h"
#include "content/public/common/content_client.h"
#include "content/public/test/mock_navigation_handle.h"
#include "content/public/browser/web_contents.h"
#include "content/public/browser/render_process_host.h"
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

  content::WebContents* Shell() {
    auto* window = WebUIBrowserWindow::FromBrowser(browser());
    if (!window || !window->GetWebUIBrowserUI()) return nullptr;
    return window->GetWebUIBrowserUI()->web_ui()->GetWebContents();
  }
  bool BeginPreview(content::WebContents* shell, const GURL& url) {
    return content::ExecJs(shell, content::JsReplace(R"(
      (() => {
        document.querySelector('#aux-origin-control')?.remove();
        const frame = document.createElement('iframe');
        frame.id = 'aux-origin-control';
        frame.sandbox = 'allow-scripts';
        frame.src = $1;
        document.body.appendChild(frame);
      })();
    )", url.spec()));
  }
  content::RenderFrameHost* PreviewFrame(content::WebContents* shell,
                                        const GURL& url) {
    content::RenderFrameHost* result = nullptr;
    shell->ForEachRenderFrameHost([&](content::RenderFrameHost* frame) {
      if (frame != shell->GetPrimaryMainFrame() &&
          frame->GetLastCommittedURL() == url) result = frame;
    });
    return result;
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

IN_PROC_BROWSER_TEST_F(ResultPreviewBrowserTest,
                       OriginalParentLoadsHaveDistinctOpaqueDestinationNonces) {
  auto* shell = Shell();
  ASSERT_TRUE(shell);
  ASSERT_TRUE(content::WaitForLoadStop(shell));
  auto url = ResultPreviewStore::Create(shell, "<script>window.loaded=true</script>");
  ASSERT_TRUE(url);
  const GURL preview(*url);
  content::TestNavigationManager first(shell, preview);
  ASSERT_TRUE(BeginPreview(shell, preview));
  ASSERT_TRUE(first.WaitForNavigationFinished());
  ASSERT_TRUE(first.was_successful());
  auto* frame = PreviewFrame(shell, preview);
  ASSERT_TRUE(frame);
  const auto first_origin = frame->GetLastCommittedOrigin();
  EXPECT_TRUE(first_origin.opaque());
  EXPECT_EQ(first_origin.GetTupleOrPrecursorTupleIfOpaque().scheme(),
            kResultPreviewScheme);
  EXPECT_EQ(first_origin.GetTupleOrPrecursorTupleIfOpaque().host(), "preview");
  EXPECT_TRUE(first_origin.CanBeDerivedFrom(preview));
  EXPECT_FALSE(first_origin.IsSameOriginWith(
      shell->GetPrimaryMainFrame()->GetLastCommittedOrigin()));
  EXPECT_EQ(true, content::EvalJs(frame, "window.loaded"));
  // A fresh parent-created load uses the same token but a new navigation and
  // frame. In-preview navigation remains blocked by the existing throttle.
  content::TestNavigationManager second(shell, preview);
  ASSERT_TRUE(BeginPreview(shell, preview));
  ASSERT_TRUE(second.WaitForNavigationFinished());
  ASSERT_TRUE(second.was_successful());
  frame = PreviewFrame(shell, preview);
  ASSERT_TRUE(frame);
  EXPECT_TRUE(frame->GetLastCommittedOrigin().opaque());
  EXPECT_FALSE(first_origin.IsSameOriginWith(frame->GetLastCommittedOrigin()));
  EXPECT_EQ(frame->GetLastCommittedOrigin().GetTupleOrPrecursorTupleIfOpaque(),
            first_origin.GetTupleOrPrecursorTupleIfOpaque());
}

IN_PROC_BROWSER_TEST_F(ResultPreviewBrowserTest, InvalidTokenCannotCommitPreview) {
  auto* shell = Shell();
  ASSERT_TRUE(shell);
  ASSERT_TRUE(content::WaitForLoadStop(shell));
  const GURL invalid(std::string("aux-result://preview/") + std::string(48, '0'));
  EXPECT_FALSE(ResultPreviewStore::Read(shell, invalid));
  content::TestNavigationManager navigation(shell, invalid);
  ASSERT_TRUE(BeginPreview(shell, invalid));
  ASSERT_TRUE(navigation.WaitForNavigationFinished());
  EXPECT_FALSE(navigation.was_successful());
}

IN_PROC_BROWSER_TEST_F(ResultPreviewBrowserTest,
                       RevocationAfterResponseCancelsOriginalBeforeCommit) {
  auto* shell = Shell();
  ASSERT_TRUE(shell);
  ASSERT_TRUE(content::WaitForLoadStop(shell));
  auto url = ResultPreviewStore::Create(shell, "<script>window.loaded=true</script>");
  ASSERT_TRUE(url);
  const GURL preview(*url);
  content::TestNavigationManager navigation(shell, preview);
  ASSERT_TRUE(BeginPreview(shell, preview));
  ASSERT_TRUE(navigation.WaitForResponse());
  ASSERT_TRUE(ResultPreviewStore::Release(shell, preview));
  ASSERT_TRUE(navigation.WaitForNavigationFinished());
  EXPECT_FALSE(navigation.was_successful());
  EXPECT_EQ(nullptr, PreviewFrame(shell, preview));
}

IN_PROC_BROWSER_TEST_F(ResultPreviewBrowserTest,
                       ReplacedOriginalParentCannotReuseOriginalToken) {
  auto* shell = Shell();
  ASSERT_TRUE(shell);
  ASSERT_TRUE(content::WaitForLoadStop(shell));
  auto url = ResultPreviewStore::Create(shell, "<script>window.loaded=true</script>");
  ASSERT_TRUE(url);
  const GURL preview(*url);
  const auto original = shell->GetPrimaryMainFrame()->GetWeakDocumentPtr();
  content::TestNavigationManager pending(shell, preview);
  ASSERT_TRUE(BeginPreview(shell, preview));
  ASSERT_TRUE(pending.WaitForResponse());
  ASSERT_TRUE(content::NavigateToURL(shell, GURL("chrome://aux/")));
  ASSERT_TRUE(pending.WaitForNavigationFinished());
  EXPECT_FALSE(pending.was_successful());
  EXPECT_FALSE(original.AsRenderFrameHostIfValid());
  EXPECT_FALSE(ResultPreviewStore::Read(shell, preview));
  content::TestNavigationManager replacement(shell, preview);
  ASSERT_TRUE(BeginPreview(shell, preview));
  ASSERT_TRUE(replacement.WaitForNavigationFinished());
  EXPECT_FALSE(replacement.was_successful());
}

IN_PROC_BROWSER_TEST_F(ResultPreviewBrowserTest,
                       OtherSchemesKeepDefaultOriginAdmission) {
  auto* shell = Shell();
  ASSERT_TRUE(shell);
  ASSERT_TRUE(content::WaitForLoadStop(shell));
  auto url = ResultPreviewStore::Create(shell, "<script>window.loaded=true</script>");
  ASSERT_TRUE(url);
  const GURL preview(*url);
  content::TestNavigationManager loaded(shell, preview);
  ASSERT_TRUE(BeginPreview(shell, preview));
  ASSERT_TRUE(loaded.WaitForNavigationFinished());
  ASSERT_TRUE(loaded.was_successful());
  auto* frame = PreviewFrame(shell, preview);
  ASSERT_TRUE(frame);
  const auto& parent_origin = shell->GetPrimaryMainFrame()->GetLastCommittedOrigin();
  for (const char* candidate : {"data:text/html,hello", "about:blank",
                               "blob:https://example.test/fixed-origin-control"}) {
    content::MockNavigationHandle navigation(GURL(candidate), frame);
    navigation.set_initiator_origin(parent_origin);
    navigation.set_initiator_frame_token(&shell->GetPrimaryMainFrame()->GetFrameToken());
    navigation.set_initiator_process_id(shell->GetPrimaryMainFrame()->GetProcess()->GetID());
    EXPECT_FALSE(content::GetContentClientForTesting()->browser()
        ->GetAdmittedNonNetworkOpaqueOrigin(navigation));
  }
  content::MockNavigationHandle valid(preview, frame);
  valid.set_initiator_origin(parent_origin);
  valid.set_initiator_frame_token(&shell->GetPrimaryMainFrame()->GetFrameToken());
  valid.set_initiator_process_id(shell->GetPrimaryMainFrame()->GetProcess()->GetID());
  auto admitted = content::GetContentClientForTesting()->browser()
      ->GetAdmittedNonNetworkOpaqueOrigin(valid);
  ASSERT_TRUE(admitted);
  EXPECT_TRUE(admitted->opaque());
  content::MockNavigationHandle wrong_initiator(preview, frame);
  wrong_initiator.set_initiator_origin(url::Origin::Create(GURL("https://example.test")));
  wrong_initiator.set_initiator_frame_token(&shell->GetPrimaryMainFrame()->GetFrameToken());
  wrong_initiator.set_initiator_process_id(shell->GetPrimaryMainFrame()->GetProcess()->GetID());
  EXPECT_FALSE(content::GetContentClientForTesting()->browser()
      ->GetAdmittedNonNetworkOpaqueOrigin(wrong_initiator));
  content::MockNavigationHandle wrong_frame(preview, frame);
  wrong_frame.set_initiator_origin(parent_origin);
  wrong_frame.set_initiator_frame_token(&frame->GetFrameToken());
  wrong_frame.set_initiator_process_id(frame->GetProcess()->GetID());
  EXPECT_FALSE(content::GetContentClientForTesting()->browser()
      ->GetAdmittedNonNetworkOpaqueOrigin(wrong_frame));
}

}  // namespace
}  // namespace aux
