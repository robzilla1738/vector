// Aux bounded host proof. Enabled only by --aux-shell-assets.
#ifndef CHROME_BROWSER_UI_VIEWS_FRAME_AUX_SHELL_VIEW_H_
#define CHROME_BROWSER_UI_VIEWS_FRAME_AUX_SHELL_VIEW_H_
#include <memory>
#include "base/values.h"
#include "content/public/browser/weak_document_ptr.h"
#include "ui/events/event_observer.h"
#include "ui/views/event_monitor.h"
#include "ui/base/metadata/metadata_header_macros.h"
#include "base/memory/raw_ptr.h"
#include "ui/views/controls/webview/webview.h"
class BrowserView;
class BrowserWindowInterface;
namespace input { struct NativeWebKeyboardEvent; }
class AuxShellView : public views::WebView, public ui::EventObserver {
 public:
  METADATA_HEADER(AuxShellView, views::WebView)
 public:
  explicit AuxShellView(BrowserView* browser);
  ~AuxShellView() override;
  void ApplyLayout();
  static bool HandleBrowserCommand(BrowserWindowInterface* browser, int command_id);
  bool HandleKey(const input::NativeWebKeyboardEvent& event);
  using views::WebView::OnEvent;
  void OnEvent(const ui::Event& event) override;
  base::Value Request(const std::string& method, const base::ListValue& args);
 private:
  void SyncPageMaterial();
  void Emit(const std::string& event, base::Value payload);
  raw_ptr<BrowserView> browser_;
  std::unique_ptr<views::EventMonitor> pointer_monitor_;
  bool near_edge_ = false;
  bool near_sidebar_ = false;
  gfx::Rect stage_;
  float stage_radius_ = 0;
  std::string stage_page_id_;
  bool stage_visible_ = false;
  bool overlay_ = false;
  bool glass_enabled_ = true;
  bool toolbar_glass_ = false;
  gfx::Rect sidebar_glass_;
  content::WeakDocumentPtr material_document_;
  std::string material_state_;
  std::string window_id_;
  std::string profile_id_;
};
#endif
