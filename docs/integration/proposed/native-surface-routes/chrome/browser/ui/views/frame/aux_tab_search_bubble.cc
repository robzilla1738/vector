// Copyright 2026 The Aux Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
// Independently implements docs/spec/native/surfaces.md V3.
#include "chrome/browser/ui/views/frame/aux_tab_search_bubble.h"

#include "base/functional/bind.h"
#include "base/environment.h"
#include "base/strings/string_number_conversions.h"
#include "base/memory/weak_ptr.h"
#include "base/strings/utf_string_conversions.h"
#include "chrome/browser/aux/component_bootstrap.h"
#include "chrome/browser/aux/browser_platform.h"
#include "chrome/browser/aux/profile_security_client.h"
#include "chrome/browser/aux/installation_auth.h"
#include "chrome/browser/aux/profile_state.h"
#include "chrome/browser/profiles/profile.h"
#include "chrome/browser/ui/browser_window/public/browser_window_interface.h"
#include "content/public/browser/keyboard_event_processing_result.h"
#include "content/public/browser/web_contents.h"
#include "content/public/browser/storage_partition.h"
#include "components/input/native_web_keyboard_event.h"
#include "extensions/browser/extension_registry.h"
#include "extensions/common/extension_set.h"
#include "ui/base/metadata/metadata_impl_macros.h"
#include "ui/base/mojom/dialog_button.mojom.h"
#include "ui/events/keycodes/keyboard_codes.h"
#include "ui/views/bubble/bubble_dialog_delegate_view.h"
#include "ui/views/controls/label.h"
#include "ui/views/controls/webview/webview.h"
#include "ui/views/layout/fill_layout.h"
#include "ui/views/widget/widget.h"

namespace {
constexpr gfx::Size kSearchSize(620, 340);

class AuxSearchWebView : public views::WebView {
  METADATA_HEADER(AuxSearchWebView, views::WebView)
 public:
  explicit AuxSearchWebView(Profile* profile) : views::WebView(profile) {}
  void CloseContents(content::WebContents* source) override {
    if (GetWidget())
      GetWidget()->Close();
  }
  content::KeyboardEventProcessingResult PreHandleKeyboardEvent(
      content::WebContents* source,
      const input::NativeWebKeyboardEvent& event) override {
    if (event.GetType() == blink::WebInputEvent::Type::kRawKeyDown &&
        event.windows_key_code == ui::VKEY_ESCAPE) {
      CloseContents(source);
      return content::KeyboardEventProcessingResult::HANDLED;
    }
    return content::KeyboardEventProcessingResult::NOT_HANDLED;
  }
};
BEGIN_METADATA(AuxSearchWebView)
END_METADATA

class AuxSearchBubble : public views::BubbleDialogDelegate {
 public:
  AuxSearchBubble(Profile* profile, views::View* anchor,
                  base::OnceClosure on_closed)
      : views::BubbleDialogDelegate(anchor, views::BubbleBorder::TOP_LEFT),
        profile_(profile->GetWeakPtr()) {
    SetButtons(static_cast<int>(ui::mojom::DialogButton::kNone));
    SetShowCloseButton(false);
    SetAccessibleTitle(u"Search tabs");
    set_margins(gfx::Insets());
    set_fixed_width(kSearchSize.width());
    set_close_on_deactivate(true);
    RegisterWindowClosingCallback(std::move(on_closed));
    auto contents = std::make_unique<views::View>();
    contents->SetLayoutManager(std::make_unique<views::FillLayout>());
    contents->SetPreferredSize(kSearchSize);
    contents_ = SetContentsView(std::move(contents));
    ShowMessage(u"Checking this browser profile…");
    uint16_t port = 21520;
    if (auto text = base::Environment::Create()->GetVar("AUX_PORT")) {
      unsigned value = 0;
      if (!base::StringToUint(*text, &value) || !value || value > 65535) {
        ShowMessage(u"The local daemon port is invalid.");
        return;
      }
      port = value;
    }
    authorization_ = aux::BrowserPlatform::Get().authorization();
    aux::FetchProfileSecurity(aux::StateHome(),
        profile->GetOriginalProfile()->GetPath(),
        profile->GetDefaultStoragePartition()->GetURLLoaderFactoryForBrowserProcess(),
        port, authorization_, base::BindOnce(&AuxSearchBubble::OnSecurity,
                                            weak_factory_.GetWeakPtr()));
  }
 private:
  void ShowMessage(const std::u16string& text) {
    contents_->RemoveAllChildViews();
    auto* message = contents_->AddChildView(std::make_unique<views::Label>(text));
    message->SetMultiLine(true);
    message->SetMaximumWidth(540);
  }
  void OnSecurity(aux::ProfileSecurityState security) {
    if (!profile_)
      return;
    if (authorization_ != aux::BrowserPlatform::Get().authorization() ||
        !security.allows_browsing()) {
      ShowMessage(security.error.empty()
          ? u"Unlock Aux and finish setup before searching this profile."
          : base::UTF8ToUTF16(security.error));
      return;
    }
    auto* registry = extensions::ExtensionRegistry::Get(profile_.get());
    if (!registry || !registry->enabled_extensions().Contains(aux::kAgentExtensionId)) {
      ShowMessage(u"Aux search is unavailable. Restore the bundled extension and reopen search.");
      return;
    }
    contents_->RemoveAllChildViews();
    auto* webview = contents_->AddChildView(
        std::make_unique<AuxSearchWebView>(profile_.get()));
    webview->SetPreferredSize(kSearchSize);
    webview->LoadInitialURL(GURL("chrome-extension://" +
        std::string(aux::kAgentExtensionId) + "/tabsearch.html"));
    webview->RequestFocus();
    if (GetWidget())
      GetWidget()->LayoutRootViewIfNecessary();
  }
  std::string authorization_;
  base::WeakPtr<Profile> profile_;
  raw_ptr<views::View> contents_ = nullptr;
  base::WeakPtrFactory<AuxSearchBubble> weak_factory_{this};
};
}  // namespace

views::Widget* ShowAuxTabSearchBubble(BrowserWindowInterface* browser,
                                     views::View* anchor,
                                     base::OnceClosure on_closed) {
  auto bubble = std::make_unique<AuxSearchBubble>(
      browser->GetProfile(), anchor, std::move(on_closed));
  auto* widget = views::BubbleDialogDelegate::CreateBubbleDeprecated(
      std::move(bubble), views::Widget::InitParams::NATIVE_WIDGET_OWNS_WIDGET);
  widget->SetSize(kSearchSize);
  widget->Show();
  return widget;
}
