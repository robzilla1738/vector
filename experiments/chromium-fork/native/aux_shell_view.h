// Aux bounded host proof. Enabled only by --aux-shell-assets.
#ifndef CHROME_BROWSER_UI_VIEWS_FRAME_AUX_SHELL_VIEW_H_
#define CHROME_BROWSER_UI_VIEWS_FRAME_AUX_SHELL_VIEW_H_
#include "base/values.h"
#include "ui/base/metadata/metadata_header_macros.h"
#include "base/memory/raw_ptr.h"
#include "ui/views/controls/webview/webview.h"
class BrowserView;
class AuxShellView : public views::WebView {
 public:
  METADATA_HEADER(AuxShellView, views::WebView)
 public:
  explicit AuxShellView(BrowserView* browser);
  ~AuxShellView() override;
  void ApplyLayout();
  base::Value Request(const std::string& method, const base::ListValue& args);
 private:
  raw_ptr<BrowserView> browser_;
  gfx::Rect stage_;
  bool stage_visible_ = false;
  bool overlay_ = false;
  std::string window_id_;
  std::string profile_id_;
};
#endif
