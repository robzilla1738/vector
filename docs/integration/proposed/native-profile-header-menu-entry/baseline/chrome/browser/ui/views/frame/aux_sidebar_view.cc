// Copyright 2026 The Aux Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

#include "chrome/browser/ui/views/frame/aux_sidebar_view.h"

#include <algorithm>
#include <utility>

#include "base/callback_list.h"
#include "base/check.h"
#include "base/check_op.h"
#include "base/environment.h"
#include "base/files/file_path.h"
#include "base/functional/bind.h"
#include "base/strings/strcat.h"
#include "base/strings/string_number_conversions.h"
#include "base/strings/string_split.h"
#include "base/strings/utf_string_conversions.h"
#include "base/task/single_thread_task_runner.h"
#include "base/values.h"
#include "cc/paint/paint_flags.h"
#include "build/build_config.h"
#include "chrome/browser/buildflags.h"
#include "chrome/app/chrome_command_ids.h"
#include "chrome/app/vector_icons/vector_icons.h"
#include "chrome/browser/aux/browser_platform.h"
#include "chrome/browser/aux/installation_auth.h"
#include "chrome/browser/aux/profile_gate.h"
#include "chrome/browser/aux/profile_security_client.h"
#include "chrome/browser/aux/profile_identity.h"
#include "chrome/browser/bookmarks/bookmark_model_factory.h"
#include "chrome/browser/browser_process.h"
#include "chrome/browser/favicon/favicon_service_factory.h"
#include "chrome/browser/profiles/profile.h"
#include "chrome/browser/profiles/profile_attributes_entry.h"
#include "chrome/browser/profiles/profile_attributes_storage.h"
#include "chrome/browser/profiles/profile_avatar_icon_util.h"
#include "chrome/browser/profiles/profile_manager.h"
#include "chrome/browser/profiles/profile_window.h"
#include "chrome/browser/ui/bookmarks/bookmark_editor.h"
#include "chrome/browser/ui/bookmarks/bookmark_utils_desktop.h"
#include "chrome/browser/ui/browser_commands.h"
#include "chrome/browser/ui/browser_window/public/browser_window_interface.h"
#include "chrome/browser/ui/simple_message_box.h"
#include "chrome/browser/ui/tabs/tab_strip_model.h"
#include "chrome/browser/ui/views/frame/aux_icon_picker.h"
#include "chrome/browser/ui/views/frame/aux_task_review_bubble.h"
#include "chrome/browser/ui/views/frame/browser_view.h"
#include "chrome/browser/ui/views/frame/tab_strip_region_view.h"
#include "chrome/browser/ui/views/tabs/dragging/drag_session_data.h"
#include "chrome/browser/ui/views/tabs/dragging/tab_drag_context.h"
#include "chrome/browser/ui/views/tabs/dragging/tab_drag_target.h"
#include "chrome/browser/ui/webui/profile_helper.h"
#include "components/bookmarks/browser/bookmark_client.h"
#include "components/bookmarks/browser/bookmark_node.h"
#include "components/bookmarks/browser/bookmark_utils.h"
#include "components/bookmarks/common/bookmark_pref_names.h"
#include "components/favicon/content/content_favicon_driver.h"
#include "components/favicon/core/favicon_service.h"
#include "components/favicon_base/favicon_types.h"
#include "components/prefs/pref_service.h"
#include "components/tabs/public/tab_context_menu_command.h"
#include "components/tabs/public/tab_interface.h"
#include "components/vector_icons/vector_icons.h"
#include "content/public/browser/web_contents.h"
#include "content/public/browser/storage_partition.h"
#include "ui/base/base_window.h"
#include "third_party/skia/include/core/SkPathBuilder.h"
#include "ui/base/accelerators/accelerator.h"
#include "ui/base/metadata/metadata_impl_macros.h"
#include "ui/base/models/image_model.h"
#include "ui/base/mojom/menu_source_type.mojom.h"
#include "ui/color/color_id.h"
#include "ui/color/color_provider_key.h"
#include "ui/compositor/layer.h"
#include "ui/events/keycodes/keyboard_codes.h"
#include "ui/gfx/canvas.h"
#include "ui/gfx/font.h"
#include "ui/gfx/font_list.h"
#include "ui/gfx/geometry/insets.h"
#include "ui/gfx/geometry/size.h"
#include "ui/menus/simple_menu_model.h"
#include "ui/views/accessibility/view_accessibility.h"
#include "ui/views/background.h"
#include "ui/views/border.h"
#include "ui/views/bubble/bubble_dialog_delegate_view.h"
#include "ui/views/controls/button/image_button.h"
#include "ui/views/controls/button/image_button_factory.h"
#include "ui/views/controls/button/label_button.h"
#include "ui/views/controls/highlight_path_generator.h"
#include "ui/views/controls/image_view.h"
#include "ui/views/controls/label.h"
#include "ui/views/controls/menu/menu_runner.h"
#include "ui/views/controls/scroll_view.h"
#include "ui/views/controls/separator.h"
#include "ui/views/layout/box_layout.h"
#include "ui/views/layout/flex_layout.h"
#include "ui/views/layout/layout_provider.h"
#include "ui/views/style/typography.h"
#include "ui/views/view_class_properties.h"
#include "ui/views/view_tracker.h"
#include "ui/views/widget/widget.h"

#if BUILDFLAG(IS_MAC) && BUILDFLAG(ENABLE_AUX_BROWSER)
#include "chrome/browser/ui/views/frame/aux_profile_switch_request.h"
#endif

namespace {

constexpr char kAgentManagerId[] = "gokkffaiccpmoeodpmeamcjajcagjmkm";
// Resolve the actual account before opening supplied account-scoped routes.
// Never fall back to currentAccountId or route the caller into another profile.
void OpenAgentRoute(BrowserWindowInterface* browser, std::string suffix) {
  const auto authorization = aux::BrowserPlatform::Get().authorization();
  uint16_t port = 21520;
  if (auto text = base::Environment::Create()->GetVar("AUX_PORT")) {
    unsigned value = 0;
    if (!base::StringToUint(*text, &value) || !value || value > 65535) {
      chrome::ShowWarningMessageBoxAsync(browser->GetWindow()->GetNativeWindow(),
          u"Aux navigation unavailable", u"The local daemon port is invalid.");
      return;
    }
    port = value;
  }
  aux::FetchProfileSecurity(aux::StateHome(),
      browser->GetProfile()->GetOriginalProfile()->GetPath(),
      aux::GetProfileId(browser->GetProfile()),
      browser->GetProfile()->GetDefaultStoragePartition()
          ->GetURLLoaderFactoryForBrowserProcess(), port, authorization,
      base::BindOnce(
          [](base::WeakPtr<BrowserWindowInterface> browser, std::string suffix,
             std::string authorization, aux::ProfileSecurityState state) {
            if (!browser) return;
            if (authorization != aux::BrowserPlatform::Get().authorization() ||
                !state.allows_browsing() || !state.account_id) {
              aux::CanShowBrowser(browser.get());
              chrome::ShowWarningMessageBoxAsync(
                  browser->GetWindow()->GetNativeWindow(),
                  u"Aux navigation unavailable",
                  state.error.empty() ? u"Unlock this browser profile before opening Aux."
                                      : base::UTF8ToUTF16(state.error));
              return;
            }
            browser->OpenGURL(GURL(base::StrCat({"chrome-extension://",
                kAgentManagerId, "/main.html#/u/",
                base::NumberToString(*state.account_id), suffix})),
                WindowOpenDisposition::NEW_FOREGROUND_TAB);
          }, browser->GetWeakPtr(), std::move(suffix), authorization));
}

constexpr size_t kMaxChatsShown = 3;
constexpr char kFolderStatePref[] =
    "aux.browser.sidebar.expanded_bookmark_folders";
constexpr char kSectionStatePref[] = "aux.browser.sidebar.collapsed_sections";
constexpr int kBookmarkCurrent = 200;
constexpr int kBookmarkNewTab = 201;
constexpr int kBookmarkNewWindow = 202;
constexpr int kBookmarkEdit = 203;
constexpr int kBookmarkDelete = 204;
constexpr int kCommandPin = 1;
constexpr int kCommandMarkRead = 2;
constexpr int kCommandArchive = 3;
constexpr int kCommandDelete = 4;
constexpr int kRowRadius = 10;
constexpr int kRowIconSize = 16;
constexpr int kRowHeight = 34;
constexpr int kRowInset = 12;
constexpr int kRowTextSize = 13;
constexpr int kCaptionTextSize = 12;

class AuxSidebarRow : public views::LabelButton {
  METADATA_HEADER(AuxSidebarRow, views::LabelButton)

 public:
  AuxSidebarRow(PressedCallback callback,
                const std::u16string& text,
                const ui::ImageModel& icon,
                bool emphasized = false,
                bool selected = false)
      : views::LabelButton(std::move(callback), text), selected_(selected) {
    SetHorizontalAlignment(gfx::ALIGN_LEFT);
    SetImageLabelSpacing(8);
    SetBorder(views::CreateEmptyBorder(gfx::Insets::VH(8, kRowInset)));
    SetImageModel(views::Button::STATE_NORMAL, icon);
    SetEnabledTextColors(selected ? ui::kColorSysOnSurface
                                  : ui::kColorSysOnSurfaceSubtle);
    label()->SetElideBehavior(gfx::ELIDE_TAIL);
    SetLabelFont(kRowTextSize, emphasized);
    SetFocusBehavior(FocusBehavior::ALWAYS);
    UpdateBackground();
  }

  void SetCaptionStyle() {
    caption_ = true;
    SetLabelFont(kCaptionTextSize, /*emphasized=*/false);
  }

  gfx::Size CalculatePreferredSize(
      const views::SizeBounds& available_size) const override {
    gfx::Size size = views::LabelButton::CalculatePreferredSize(available_size);
    if (!caption_) {
      size.set_height(std::max(size.height(), kRowHeight));
    }
    return size;
  }

  const std::string& chat_id() const { return chat_id_; }
  void set_chat_id(std::string id) { chat_id_ = std::move(id); }
  int64_t bookmark_id() const { return bookmark_id_; }
  void set_bookmark_id(int64_t id) { bookmark_id_ = id; }

  void SetFavicon(const gfx::ImageSkia& image) {
    SetImageModel(views::Button::STATE_NORMAL,
                  ui::ImageModel::FromImageSkia(image));
  }

 protected:
  void StateChanged(views::Button::ButtonState old_state) override {
    views::LabelButton::StateChanged(old_state);
    UpdateBackground();
  }

 private:
  void SetLabelFont(int size, bool emphasized) {
    gfx::FontList font = gfx::FontList().DeriveWithSizeDelta(
        size - gfx::FontList().GetFontSize());
    if (emphasized) {
      font = font.DeriveWithWeight(gfx::Font::Weight::MEDIUM);
    }
    label()->SetFontList(font);
  }

  void UpdateBackground() {
    const bool hovered = GetState() == views::Button::STATE_HOVERED ||
                         GetState() == views::Button::STATE_PRESSED;
    SetBackground(hovered || selected_
                      ? views::CreateRoundedRectBackground(
                            ui::kColorSysStateHoverOnSubtle, kRowRadius)
                      : nullptr);
  }

  const bool selected_;
  bool caption_ = false;
  std::string chat_id_;
  int64_t bookmark_id_ = -1;
};

BEGIN_METADATA(AuxSidebarRow)
END_METADATA

constexpr int kTilesPerRow = 3;
constexpr int kTileHeight = 40;
constexpr int kTileGap = 6;
constexpr int kTileRadius = 12;
constexpr int kTileIconSize = 16;

// One pinned tab, drawn as a rounded tile with its favicon centered.
class AuxPinnedTile : public views::Button {
  METADATA_HEADER(AuxPinnedTile, views::Button)

 public:
  using MoveCallback =
      base::RepeatingCallback<void(base::WeakPtr<content::WebContents>,
                                   const gfx::Point&)>;

  AuxPinnedTile(PressedCallback callback,
                MoveCallback move_callback,
                base::WeakPtr<content::WebContents> contents,
                const ui::ImageModel& icon,
                const std::u16string& title,
                bool active)
      : views::Button(std::move(callback)),
        move_callback_(std::move(move_callback)),
        contents_(contents),
        icon_(icon),
        title_(title),
        active_(active) {
    auto image = std::make_unique<views::ImageView>(icon);
    image->SetImageSize(gfx::Size(kTileIconSize, kTileIconSize));
    image->SetCanProcessEventsWithinSubtree(false);
    image_ = image.get();
    SetLayoutManager(std::make_unique<views::BoxLayout>(
        views::BoxLayout::Orientation::kVertical))
        ->set_main_axis_alignment(views::BoxLayout::MainAxisAlignment::kCenter);
    AddChildView(std::move(image));
    SetTooltipText(title);
    GetViewAccessibility().SetName(title);
    SetFocusBehavior(FocusBehavior::ALWAYS);
    UpdateStyle();
  }

  content::WebContents* contents() const { return contents_.get(); }
  bool is_dragging() const { return dragging_; }
  ~AuxPinnedTile() override { CancelDrag(); }

  bool OnMousePressed(const ui::MouseEvent& event) override {
    if (!event.IsOnlyLeftMouseButton()) {
      return views::Button::OnMousePressed(event);
    }
    RequestFocus();
    press_point_ = event.location();
    CancelDrag();
    return views::Button::OnMousePressed(event);
  }

  bool OnMouseDragged(const ui::MouseEvent& event) override {
    if (!event.IsOnlyLeftMouseButton()) {
      return views::Button::OnMouseDragged(event);
    }
    if (!contents_) {
      CancelDrag();
      return true;
    }
    if (!dragging_ && (event.location() - press_point_).Length() > 6) {
      dragging_ = true;
      auto* browser_view = BrowserView::GetBrowserViewForNativeWindow(
          GetWidget()->GetNativeWindow());
      if (browser_view && browser_view->tab_strip_view()) {
        hover_lock_ = browser_view->tab_strip_view()->GetExpandOnHoverLock(
            ExpandOnHoverLockType::kKeepCurrentState);
      }
      ghost_ = std::make_unique<views::Widget>();
      views::Widget::InitParams params(
          views::Widget::InitParams::WIDGET_OWNS_NATIVE_WIDGET,
          views::Widget::InitParams::TYPE_TOOLTIP);
      params.parent = GetWidget()->GetNativeView();
      params.accept_events = false;
      ghost_->Init(std::move(params));
      auto preview = std::make_unique<views::LabelButton>(
          views::Button::PressedCallback(), title_);
      preview->SetImageModel(views::Button::STATE_NORMAL, icon_);
      preview->SetImageLabelSpacing(8);
      preview->SetBorder(views::CreateEmptyBorder(gfx::Insets(10)));
      preview->SetBackground(views::CreateRoundedRectBackground(
          ui::kColorSysSurface, kTileRadius));
      ghost_->SetContentsView(std::move(preview));
      SetPaintToLayer();
      layer()->SetFillsBoundsOpaquely(false);
      layer()->SetOpacity(0.5f);
    }
    if (!dragging_) {
      return views::Button::OnMouseDragged(event);
    }
    auto point = event.location();
    views::View::ConvertPointToScreen(this, &point);
    ghost_->SetBounds(
        gfx::Rect(point + gfx::Vector2d(12, 12), gfx::Size(180, kTileHeight)));
    ghost_->ShowInactive();
    return true;
  }

  void OnMouseReleased(const ui::MouseEvent& event) override {
    if (!dragging_) {
      views::Button::OnMouseReleased(event);
      return;
    }
    auto point = event.location();
    views::View::ConvertPointToScreen(this, &point);
    CancelDrag();
    views::Button::OnMouseCaptureLost();
    move_callback_.Run(contents_, point);
  }

  void OnMouseCaptureLost() override {
    CancelDrag();
    views::Button::OnMouseCaptureLost();
  }

  bool OnKeyPressed(const ui::KeyEvent& event) override {
    if (event.key_code() == ui::VKEY_ESCAPE && dragging_) {
      CancelDrag();
      views::Button::OnMouseCaptureLost();
      return true;
    }
    return views::Button::OnKeyPressed(event);
  }

 protected:
  void StateChanged(views::Button::ButtonState old_state) override {
    views::Button::StateChanged(old_state);
    UpdateStyle();
  }

 private:
  void CancelDrag() {
    dragging_ = false;
    ghost_.reset();
    hover_lock_.reset();
    if (layer()) {
      DestroyLayer();
    }
  }

  void UpdateStyle() {
    const bool hovered = GetState() == views::Button::STATE_HOVERED ||
                         GetState() == views::Button::STATE_PRESSED;
    SetBackground(views::CreateRoundedRectBackground(
        hovered || active_ ? ui::kColorSysStateHoverOnProminent
                           : ui::kColorSysStateHoverOnSubtle,
        kTileRadius));
    SetBorder(views::CreateRoundedRectBorder(
        1, kTileRadius,
        active_ ? ui::kColorSysOnSurfaceSubtle : ui::kColorSysDivider));
    SchedulePaint();
  }

  const MoveCallback move_callback_;
  const base::WeakPtr<content::WebContents> contents_;
  const ui::ImageModel icon_;
  const std::u16string title_;
  std::unique_ptr<views::Widget> ghost_;
  std::unique_ptr<ExpandOnHoverLock> hover_lock_;
  const bool active_;
  gfx::Point press_point_;
  bool dragging_ = false;
  raw_ptr<views::ImageView> image_ = nullptr;
};

BEGIN_METADATA(AuxPinnedTile)
END_METADATA

// Lays pinned tiles out three to a row.
class AuxPinnedGrid : public views::View, public TabDragTarget {
  METADATA_HEADER(AuxPinnedGrid, views::View)

 public:
  using PinCallback =
      base::RepeatingCallback<void(base::WeakPtr<content::WebContents>, int)>;
  AuxPinnedGrid(BrowserWindowInterface* browser, PinCallback callback)
      : browser_(browser), pin_callback_(std::move(callback)) {}
  ~AuxPinnedGrid() override { destroying_.Notify(); }

  void OnTabDragEntered() override {
    auto* view = BrowserView::GetBrowserViewForBrowser(browser_);
    if (view && view->tab_strip_view()) {
      hover_lock_ = view->tab_strip_view()->GetExpandOnHoverLock(
          ExpandOnHoverLockType::kKeepCurrentState);
    }
  }
  TabDragContext* OnTabDragUpdated(TabDragTarget::DragController& controller,
                                   const gfx::Point& point) override {
    const auto& data = controller.GetSessionData();
    dropped_contents_.reset();
    if (data.tab_drag_data_.size() != 1 || !data.dragging_groups.empty()) {
      return nullptr;
    }
    auto* contents = data.tab_drag_data_.front().contents.get();
    if (!contents || contents->GetBrowserContext() != browser_->GetProfile()) {
      return nullptr;
    }
    auto* browser_view = BrowserView::GetBrowserViewForBrowser(browser_);
    auto* context = browser_view && browser_view->tab_strip_view()
                        ? browser_view->tab_strip_view()->GetDragContext()
                        : nullptr;
    if (!context) {
      return nullptr;
    }
    dropped_contents_ = contents->GetWeakPtr();
    const auto local = views::View::ConvertPointFromScreen(this, point);
    drop_slot_ =
        std::clamp(local.y() / (kTileHeight + kTileGap) * kTilesPerRow +
                       local.x() * kTilesPerRow / std::max(width(), 1),
                   0, static_cast<int>(children().size()));
    SetBackground(views::CreateRoundedRectBackground(
        ui::kColorSysStateHoverOnSubtle, kTileRadius));
    return context;
  }
  void OnTabDragExited(const gfx::Point& point) override { OnTabDragEnded(); }
  void OnTabDragEnded() override {
    dropped_contents_.reset();
    hover_lock_.reset();
    SetBackground(nullptr);
  }
  bool CanDropTab() override { return !!dropped_contents_; }
  void HandleTabDrop(TabDragTarget::DragController& controller) override {
    if (!dropped_contents_) {
      return;
    }
    // Pin after the native controller has stopped dragging and restored its
    // views.
    base::SingleThreadTaskRunner::GetCurrentDefault()->PostTask(
        FROM_HERE,
        base::BindOnce(pin_callback_, dropped_contents_, drop_slot_));
    OnTabDragEnded();
  }
  base::CallbackListSubscription RegisterWillDestroyCallback(
      base::OnceClosure callback) override {
    return destroying_.Add(std::move(callback));
  }
  bool IsDragging() const {
    if (dropped_contents_) {
      return true;
    }
    return std::ranges::any_of(children(), [](const auto& child) {
      const auto* tile = views::AsViewClass<AuxPinnedTile>(child.get());
      return tile && tile->is_dragging();
    });
  }

  gfx::Size CalculatePreferredSize(
      const views::SizeBounds& available_size) const override {
    const int width = available_size.width().is_bounded()
                          ? available_size.width().value()
                          : kTilesPerRow * 64;
    const int rows =
        (static_cast<int>(children().size()) + kTilesPerRow - 1) / kTilesPerRow;
    return gfx::Size(width, rows > 0
                                ? rows * kTileHeight + (rows - 1) * kTileGap
                                : kTileHeight);
  }

  void Layout(PassKey) override {
    const int width =
        (this->width() - (kTilesPerRow - 1) * kTileGap) / kTilesPerRow;
    int index = 0;
    for (views::View* child : children()) {
      const int row = index / kTilesPerRow;
      const int column = index % kTilesPerRow;
      child->SetBounds(column * (width + kTileGap),
                       row * (kTileHeight + kTileGap), width, kTileHeight);
      ++index;
    }
  }

 private:
  raw_ptr<BrowserWindowInterface> browser_;
  PinCallback pin_callback_;
  base::WeakPtr<content::WebContents> dropped_contents_;
  int drop_slot_ = 0;
  base::OnceClosureList destroying_;
  std::unique_ptr<ExpandOnHoverLock> hover_lock_;
};

BEGIN_METADATA(AuxPinnedGrid)
END_METADATA

constexpr int kProfileMenuWidth = 240;
constexpr int kMenuRowIcon = 16;
constexpr int kCommandEditProfile = 100;
constexpr int kCommandDeleteProfile = 101;
constexpr int kCommandTabReload = 110;
constexpr int kCommandTabDuplicate = 111;
constexpr int kCommandTabUnpin = 112;
constexpr int kCommandTabClose = 113;

// Supplied private roles221/222/226/248, resolved against this actual window.
enum class ProfileMenuColor { kForeground, kSecondary, kMuted, kHover };

SkColor ResolveProfileMenuColor(const views::View* view,
                                ProfileMenuColor role) {
  const bool dark =
      view->GetWidget() && view->GetWidget()->GetColorMode() ==
                               ui::ColorProviderKey::ColorMode::kDark;
  switch (role) {
    case ProfileMenuColor::kForeground:
      return dark ? 0xd9fafafa : 0xd90a0a0a;
    case ProfileMenuColor::kSecondary:
      return dark ? 0x8cfafafa : 0x8c0a0a0a;
    case ProfileMenuColor::kMuted:
      return dark ? 0x73fafafa : 0x730a0a0a;
    case ProfileMenuColor::kHover:
      return dark ? 0x1afafafa : 0x140a0a0a;
  }
}

void StyleProfileMenuLabel(
    views::Label* label,
    int size,
    gfx::Font::Weight weight = gfx::Font::Weight::NORMAL) {
  label->SetHorizontalAlignment(gfx::ALIGN_LEFT);
  label->SetElideBehavior(gfx::ELIDE_TAIL);
  label->SetAutoColorReadabilityEnabled(false);
  label->SetFontList(label->font_list().Derive(
      size - label->font_list().GetFontSize(), gfx::Font::NORMAL, weight));
  label->SetLineHeight(size == 12 ? 16 : 20);
  label->SetCanProcessEventsWithinSubtree(false);
}

class AuxMenuRow : public views::Button {
  METADATA_HEADER(AuxMenuRow, views::Button)

 public:
  AuxMenuRow(PressedCallback callback,
             const ui::ImageModel& icon,
             const std::u16string& text)
      : views::Button(std::move(callback)), source_icon_(icon) {
    SetPreferredSize(gfx::Size(0, 32));
    SetBorder(views::CreateEmptyBorder(gfx::Insets::TLBR(0, 8, 0, 8)));
    SetProperty(views::kMarginsKey, gfx::Insets::TLBR(0, 4, 0, 4));
    SetNotifyEnterExitOnChild(true);
    SetLayoutManager(std::make_unique<views::FlexLayout>())
        ->SetCrossAxisAlignment(views::LayoutAlignment::kCenter);
    auto icon_view = std::make_unique<views::ImageView>(icon);
    icon_view->SetImageSize(gfx::Size(kMenuRowIcon, kMenuRowIcon));
    icon_view->SetPreferredSize(gfx::Size(kMenuRowIcon, kMenuRowIcon));
    icon_view->SetProperty(views::kMarginsKey, gfx::Insets::TLBR(0, 0, 0, 8));
    icon_view->SetCanProcessEventsWithinSubtree(false);
    icon_view_ = AddChildView(std::move(icon_view));
    auto label = std::make_unique<views::Label>(text);
    StyleProfileMenuLabel(label.get(), 14);
    label->SetProperty(
        views::kFlexBehaviorKey,
        views::FlexSpecification(views::MinimumFlexSizeRule::kScaleToMinimum,
                                 views::MaximumFlexSizeRule::kUnbounded));
    label_ = AddChildView(std::move(label));
    GetViewAccessibility().SetName(text);
    SetFocusBehavior(FocusBehavior::ALWAYS);
    UpdateColors();
  }

  void AddTrailingIcon(const gfx::VectorIcon& icon) {
    trailing_icon_ = &icon;
    auto view = std::make_unique<views::ImageView>();
    view->SetProperty(views::kMarginsKey, gfx::Insets::TLBR(0, 8, 0, 0));
    view->SetCanProcessEventsWithinSubtree(false);
    trailing_icon_view_ = AddChildView(std::move(view));
    UpdateColors();
  }

  void AddTrailingText(const std::u16string& text) {
    auto label = std::make_unique<views::Label>(text);
    StyleProfileMenuLabel(label.get(), 12);
    label->SetProperty(views::kMarginsKey, gfx::Insets::TLBR(0, 8, 0, 0));
    trailing_text_ = AddChildView(std::move(label));
    UpdateColors();
  }

  views::ImageButton* AddTrailingButton(const gfx::VectorIcon& icon,
                                        PressedCallback callback,
                                        const std::u16string& name) {
    auto button = views::CreateVectorImageButton(std::move(callback));
    button->SetImageModel(
        views::Button::STATE_NORMAL,
        ui::ImageModel::FromVectorIcon(icon, ui::kColorSysOnSurfaceSubtle, 14));
    button->GetViewAccessibility().SetName(name);
    button->SetTooltipText(name);
    views::InstallCircleHighlightPathGenerator(button.get());
    return AddChildView(std::move(button));
  }

 protected:
  void StateChanged(views::Button::ButtonState old_state) override {
    views::Button::StateChanged(old_state);
    UpdateBackground();
  }

  void OnThemeChanged() override {
    views::Button::OnThemeChanged();
    UpdateColors();
  }

 private:
  void UpdateColors() {
    label_->SetEnabledColor(
        ResolveProfileMenuColor(this, ProfileMenuColor::kForeground));
    const SkColor secondary =
        ResolveProfileMenuColor(this, ProfileMenuColor::kSecondary);
    if (source_icon_.IsVectorIcon()) {
      const auto icon = source_icon_.GetVectorIcon();
      icon_view_->SetImage(ui::ImageModel::FromVectorIcon(
          *icon.vector_icon(), secondary, kMenuRowIcon, icon.badge_icon()));
    }
    if (trailing_icon_view_) {
      trailing_icon_view_->SetImage(
          ui::ImageModel::FromVectorIcon(*trailing_icon_, secondary, 16));
    }
    if (trailing_text_) {
      trailing_text_->SetEnabledColor(secondary);
    }
    UpdateBackground();
  }

  void UpdateBackground() {
    const bool hovered = GetState() == views::Button::STATE_HOVERED ||
                         GetState() == views::Button::STATE_PRESSED;
    SetBackground(
        hovered
            ? views::CreateRoundedRectBackground(
                  ResolveProfileMenuColor(this, ProfileMenuColor::kHover), 6)
            : nullptr);
  }

  const ui::ImageModel source_icon_;
  raw_ptr<views::ImageView> icon_view_ = nullptr;
  raw_ptr<views::Label> label_ = nullptr;
  raw_ptr<views::ImageView> trailing_icon_view_ = nullptr;
  raw_ptr<const gfx::VectorIcon> trailing_icon_ = nullptr;
  raw_ptr<views::Label> trailing_text_ = nullptr;
};

BEGIN_METADATA(AuxMenuRow)
END_METADATA

class AuxProfileMenuCaption : public views::Label {
  METADATA_HEADER(AuxProfileMenuCaption, views::Label)

 public:
  explicit AuxProfileMenuCaption(const std::u16string& text)
      : views::Label(text) {
    StyleProfileMenuLabel(this, 12, gfx::Font::Weight::MEDIUM);
    SetPreferredSize(gfx::Size(0, 24));
    SetBorder(views::CreateEmptyBorder(gfx::Insets::TLBR(0, 6, 0, 6)));
    SetProperty(views::kMarginsKey, gfx::Insets::TLBR(0, 4, 0, 4));
    SetEnabledColor(ResolveProfileMenuColor(this, ProfileMenuColor::kMuted));
  }

 protected:
  void OnThemeChanged() override {
    views::Label::OnThemeChanged();
    SetEnabledColor(ResolveProfileMenuColor(this, ProfileMenuColor::kMuted));
  }
};

BEGIN_METADATA(AuxProfileMenuCaption)
END_METADATA

gfx::ImageSkia ProfileAvatar(ProfileAttributesEntry* entry, int size) {
  return profiles::GetSizedAvatarIcon(entry->GetAvatarIcon(size * 2), size,
                                      size, profiles::SHAPE_CIRCLE)
      .AsImageSkia();
}

ui::ImageModel MenuAvatar(ProfileAttributesEntry* entry) {
  ui::ImageModel chosen = AuxProfileIconImage(entry->GetPath(), kMenuRowIcon);
  return chosen.IsEmpty()
             ? ui::ImageModel::FromImageSkia(ProfileAvatar(entry, kMenuRowIcon))
             : chosen;
}

std::vector<ProfileAttributesEntry*> AllProfiles() {
  return g_browser_process->profile_manager()
      ->GetProfileAttributesStorage()
      .GetAllProfilesAttributesSortedForDisplay();
}

// Supplied040fe7a4 receives the actual weak sender, not a global active window.
// No persistent preview/loading owner is introduced for direct selections.
void DispatchSelectedProfile(
    base::WeakPtr<BrowserWindowInterface> sender, base::FilePath path) {
#if BUILDFLAG(IS_MAC) && BUILDFLAG(ENABLE_AUX_BROWSER)
  aux::ProfileSwitchRequest::Dispatch(std::move(sender), std::move(path));
#else
  // This adapter is registered only in the Aux macOS product. Preserve the
  // existing non-product selector behavior in other Chromium build targets.
  if (sender) {
    profiles::SwitchToProfile(path, /*always_create=*/false);
  }
#endif
}

// Native profile menu and browser navigation.
void RefreshAuxProfileButton(views::View* button);

class AuxProfileMenu : public views::BubbleDialogDelegate,
                       public ui::SimpleMenuModel::Delegate {
 public:
  static void Show(BrowserWindowInterface* browser, views::View* anchor) {
    auto menu = std::make_unique<AuxProfileMenu>(browser, anchor);
    views::BubbleDialogDelegate::CreateBubbleDeprecated(
        std::move(menu), views::Widget::InitParams::NATIVE_WIDGET_OWNS_WIDGET)
        ->Show();
  }

  AuxProfileMenu(BrowserWindowInterface* browser, views::View* anchor)
      : views::BubbleDialogDelegate(anchor, views::BubbleBorder::BOTTOM_LEFT),
        browser_(browser), sender_(browser->GetWeakPtr()) {
    SetButtons(static_cast<int>(ui::mojom::DialogButton::kNone));
    SetShowCloseButton(false);
    set_margins(gfx::Insets::VH(4, 4));
    set_fixed_width(kProfileMenuWidth);
    auto contents = std::make_unique<views::View>();
    contents->SetLayoutManager(std::make_unique<views::BoxLayout>(
        views::BoxLayout::Orientation::kVertical));
    contents_ = SetContentsView(std::move(contents));
    Build();
  }

  ~AuxProfileMenu() override {
    if (pending_switch_) {
      // Original4572824 tears down the full menu before dispatch. Native
      // Widget::Close is asynchronous, so dispatch on the UI sequence only
      // after this real delegate and all of its menu/row members are destroyed.
      base::SingleThreadTaskRunner::GetCurrentDefault()->PostTask(
          FROM_HERE, std::move(pending_switch_));
    }
  }

  // ui::SimpleMenuModel::Delegate:
  void ExecuteCommand(int command_id, int event_flags) override {
    switch (command_id) {
      case kCommandEditProfile:
        EditProfile();
        return;
      case kCommandDeleteProfile:
        DeleteProfile();
        return;
      case IDC_OPTIONS:
        OpenAgentRoute(browser_, "/settings/general");
        break;
      default:
        chrome::ExecuteCommand(browser_, command_id);
        break;
    }
    GetWidget()->Close();
  }

 private:
  void Build() {
    contents_->AddChildView(std::make_unique<AuxProfileMenuCaption>(u"Profiles"));

    const base::FilePath current = browser_->GetProfile()->GetPath();
    for (ProfileAttributesEntry* entry : AllProfiles()) {
      const base::FilePath path = entry->GetPath();
      auto* row = contents_->AddChildView(std::make_unique<AuxMenuRow>(
          base::BindRepeating(&AuxProfileMenu::SwitchTo, base::Unretained(this),
                              path),
          MenuAvatar(entry),
          entry->GetName()));
      if (path == current) {
        row->AddTrailingIcon(kCheckIcon);
      }
      row->AddTrailingButton(
          kMoreVertIcon,
          base::BindRepeating(&AuxProfileMenu::ShowProfileActions,
                              base::Unretained(this), path),
          u"Profile actions");
    }
    contents_->AddChildView(std::make_unique<AuxMenuRow>(
        base::BindRepeating(&AuxProfileMenu::NewProfile,
                            base::Unretained(this)),
        ui::ImageModel::FromVectorIcon(kAddIcon, ui::kColorSysOnSurfaceSubtle,
                                       kMenuRowIcon),
        u"New profile"));
    contents_->AddChildView(std::make_unique<views::Separator>());

    AddSubmenuRow(kBookmarkManagerIcon, u"Bookmarks", kSubmenuBookmarks);
    AddSubmenuRow(vector_icons::kDownloadIcon, u"Downloads", kSubmenuDownloads);
    AddSubmenuRow(vector_icons::kExtensionFilledIcon, u"Extensions", kSubmenuExtensions);
    AddSubmenuRow(vector_icons::kHistoryIcon, u"History", kSubmenuHistory);
    AddSubmenuRow(vector_icons::kCodeIcon, u"Developers", kSubmenuDevelopers);
    AddCommandRow(kSettingsIcon, u"Settings", IDC_OPTIONS, u"\u2318,");
    contents_->AddChildView(std::make_unique<views::Separator>());
    AddCommandRow(kAddIcon, u"New Tab", IDC_NEW_TAB, u"\u2318T");
    AddCommandRow(kIncognitoIcon, u"Incognito Window",
                  IDC_NEW_INCOGNITO_WINDOW, u"\u21E7\u2318N");
  }

  enum Submenu {
    kSubmenuBookmarks,
    kSubmenuDownloads,
    kSubmenuExtensions,
    kSubmenuHistory,
    kSubmenuDevelopers,
  };

  void AddCommandRow(const gfx::VectorIcon& icon,
                     const std::u16string& text,
                     int command,
                     const std::u16string& shortcut) {
    auto* row = contents_->AddChildView(std::make_unique<AuxMenuRow>(
        base::BindRepeating(&AuxProfileMenu::ExecuteCommand,
                            base::Unretained(this), command, 0),
        ui::ImageModel::FromVectorIcon(icon, ui::kColorSysOnSurfaceSubtle,
                                       kMenuRowIcon),
        text));
    row->AddTrailingText(shortcut);
  }

  void AddSubmenuRow(const gfx::VectorIcon& icon,
                     const std::u16string& text,
                     Submenu submenu) {
    auto* row = contents_->AddChildView(std::make_unique<AuxMenuRow>(
        views::Button::PressedCallback(),
        ui::ImageModel::FromVectorIcon(icon, ui::kColorSysOnSurfaceSubtle,
                                       kMenuRowIcon),
        text));
    row->SetCallback(base::BindRepeating(&AuxProfileMenu::ShowSubmenu,
                                         base::Unretained(this),
                                         base::Unretained(row), submenu));
    row->AddTrailingIcon(kChevronRightIcon);
  }

  void RunMenu(views::View* anchor, bool to_the_right) {
    menu_runner_ = std::make_unique<views::MenuRunner>(
        menu_model_.get(), views::MenuRunner::HAS_MNEMONICS);
    gfx::Rect bounds = anchor->GetBoundsInScreen();
    if (to_the_right) {
      bounds.set_x(bounds.right());
      bounds.set_width(0);
    }
    menu_runner_->RunMenuAt(GetWidget(), nullptr, bounds,
                            views::MenuAnchorPosition::kTopLeft,
                            ui::mojom::MenuSourceType::kMouse);
  }

  void ShowSubmenu(views::View* row, Submenu submenu) {
    menu_model_ = std::make_unique<ui::SimpleMenuModel>(this);
    switch (submenu) {
      case kSubmenuBookmarks:
        menu_model_->AddItem(IDC_BOOKMARK_THIS_TAB, u"Bookmark This Tab");
        menu_model_->AddItem(IDC_BOOKMARK_ALL_TABS, u"Bookmark All Tabs");
        menu_model_->AddItem(IDC_SHOW_BOOKMARK_MANAGER, u"Bookmark Manager");
        break;
      case kSubmenuDownloads:
        menu_model_->AddItem(IDC_SHOW_DOWNLOADS, u"Show All Downloads");
        break;
      case kSubmenuExtensions:
        menu_model_->AddItem(IDC_MANAGE_EXTENSIONS, u"Manage Extensions");
        break;
      case kSubmenuHistory:
        menu_model_->AddItem(IDC_SHOW_HISTORY, u"Show Full History");
        menu_model_->AddItem(IDC_CLEAR_BROWSING_DATA,
                             u"Clear Browsing Data\u2026");
        break;
      case kSubmenuDevelopers:
        menu_model_->AddItem(IDC_DEV_TOOLS, u"Developer Tools");
        menu_model_->AddItem(IDC_DEV_TOOLS_CONSOLE, u"JavaScript Console");
        menu_model_->AddItem(IDC_VIEW_SOURCE, u"View Source");
        menu_model_->AddItem(IDC_TASK_MANAGER, u"Task Manager");
        break;
    }
    RunMenu(row, /*to_the_right=*/true);
  }

  void ShowProfileActions(const base::FilePath& path) {
    action_profile_ = path;
    menu_model_ = std::make_unique<ui::SimpleMenuModel>(this);
    menu_model_->AddItem(kCommandEditProfile, u"Edit");
    menu_model_->AddItem(kCommandDeleteProfile, u"Delete");
    if (AllProfiles().size() < 2) {
      menu_model_->SetEnabledAt(1, false);
    }
    RunMenu(contents_, /*to_the_right=*/true);
  }

  void SwitchTo(const base::FilePath& path) {
    if (pending_switch_) {
      return;
    }
    // Snapshot both before real teardown: closing destroys the selected row
    // (which owns path) and can synchronously notify the Browser's observers.
    pending_switch_ = base::BindOnce(&DispatchSelectedProfile,
                                     sender_, base::FilePath(path));
    contents_->SetEnabled(false);
    GetWidget()->Close();
  }

  void EditProfile() {
    views::View* anchor = GetAnchorView();
    const base::FilePath path = action_profile_;
    GetWidget()->Close();
    if (!anchor) {
      return;
    }
    // The picker is a bubble that dismisses on deactivation, so it must open
    // after this menu has finished closing.
    base::SingleThreadTaskRunner::GetCurrentDefault()->PostTask(
        FROM_HERE,
        base::BindOnce(
            [](std::unique_ptr<views::ViewTracker> tracker,
               base::FilePath path) {
              views::View* anchor = tracker->view();
              if (!anchor) {
                return;
              }
              auto refresh = std::make_unique<views::ViewTracker>(anchor);
              ShowAuxIconPicker(
                  anchor, path,
                  base::BindOnce(
                      [](std::unique_ptr<views::ViewTracker> tracker) {
                        RefreshAuxProfileButton(tracker->view());
                      },
                      std::move(refresh)));
            },
            std::make_unique<views::ViewTracker>(anchor), path));
  }

  void DeleteProfile() {
    chrome::ShowQuestionMessageBoxAsync(
        GetWidget()->GetNativeWindow(), u"Delete profile?",
        u"This permanently deletes this profile's bookmarks, history and "
        u"passwords from this Mac.",
        base::BindOnce(
            [](base::FilePath path, chrome::MessageBoxResult result) {
              if (result == chrome::MESSAGE_BOX_RESULT_YES) {
                webui::DeleteProfileAtPath(
                    path, ProfileMetrics::DELETE_PROFILE_USER_MANAGER);
              }
            },
            action_profile_));
    GetWidget()->Close();
  }

  void NewProfile() {
    ProfileManager::CreateMultiProfileAsync(
        u"New profile", /*icon_index=*/0, /*is_hidden=*/false,
        base::BindOnce([](Profile* profile) {
          if (profile) {
            webui::OpenNewWindowForProfile(profile);
          }
        }));
    GetWidget()->Close();
  }

  const raw_ptr<BrowserWindowInterface> browser_;
  const base::WeakPtr<BrowserWindowInterface> sender_;
  raw_ptr<views::View> contents_ = nullptr;
  base::FilePath action_profile_;
  std::unique_ptr<ui::SimpleMenuModel> menu_model_;
  std::unique_ptr<views::MenuRunner> menu_runner_;
  base::OnceClosure pending_switch_;
};

// Circular avatar with a small chevron, opening the profile menu.
class AuxProfileButton : public views::Button {
  METADATA_HEADER(AuxProfileButton, views::Button)

 public:
  AuxProfileButton(BrowserWindowInterface* browser)
      : views::Button(base::BindRepeating(
            [](AuxProfileButton* self, BrowserWindowInterface* browser) {
              AuxProfileMenu::Show(browser, self);
            },
            base::Unretained(this),
            base::Unretained(browser))) {
    auto* layout = SetLayoutManager(std::make_unique<views::BoxLayout>(
        views::BoxLayout::Orientation::kHorizontal, gfx::Insets::VH(4, 6), 2));
    layout->set_cross_axis_alignment(
        views::BoxLayout::CrossAxisAlignment::kCenter);
    ProfileAttributesEntry* entry =
        g_browser_process->profile_manager()
            ->GetProfileAttributesStorage()
            .GetProfileAttributesWithPath(browser->GetProfile()->GetPath());
    ui::ImageModel avatar_image =
        AuxProfileIconImage(browser->GetProfile()->GetPath(), 20);
    if (avatar_image.IsEmpty()) {
      avatar_image =
          entry ? ui::ImageModel::FromImageSkia(ProfileAvatar(entry, 20))
                : ui::ImageModel::FromVectorIcon(
                      vector_icons::kAccountCircleIcon,
                      ui::kColorSysOnSurfaceSubtle, 20);
    }
    auto avatar = std::make_unique<views::ImageView>(avatar_image);
    avatar->SetImageSize(gfx::Size(20, 20));
    avatar->SetCanProcessEventsWithinSubtree(false);
    avatar_ = AddChildView(std::move(avatar));
    auto chevron = std::make_unique<views::ImageView>(
        ui::ImageModel::FromVectorIcon(vector_icons::kKeyboardArrowDownIcon,
                                       ui::kColorSysOnSurfaceSubtle, 12));
    chevron->SetCanProcessEventsWithinSubtree(false);
    AddChildView(std::move(chevron));
    GetViewAccessibility().SetName(u"Profile");
    SetTooltipText(u"Profiles");
    SetFocusBehavior(FocusBehavior::ALWAYS);
    UpdateBackground();
    browser_ = browser;
  }

  void RefreshAvatar() {
    ui::ImageModel image =
        AuxProfileIconImage(browser_->GetProfile()->GetPath(), 20);
    if (!image.IsEmpty()) {
      avatar_->SetImage(image);
    }
  }

 protected:
  void StateChanged(views::Button::ButtonState old_state) override {
    views::Button::StateChanged(old_state);
    UpdateBackground();
  }

 private:
  void UpdateBackground() {
    const bool hovered = GetState() == views::Button::STATE_HOVERED ||
                         GetState() == views::Button::STATE_PRESSED;
    SetBackground(hovered ? views::CreateRoundedRectBackground(
                                ui::kColorSysStateHoverOnSubtle, 12)
                          : nullptr);
  }

  raw_ptr<BrowserWindowInterface> browser_ = nullptr;
  raw_ptr<views::ImageView> avatar_ = nullptr;
};

void RefreshAuxProfileButton(views::View* button) {
  if (button && button->GetClassName() == AuxProfileButton::kViewClassName) {
    static_cast<AuxProfileButton*>(button)->RefreshAvatar();
  }
}

BEGIN_METADATA(AuxProfileButton)
END_METADATA

// One dot per profile; the current profile's dot is filled.
class AuxProfileDot : public views::Button {
  METADATA_HEADER(AuxProfileDot, views::Button)

 public:
  AuxProfileDot(BrowserWindowInterface* browser,
                const base::FilePath& path, bool current)
      : views::Button(base::BindRepeating(&DispatchSelectedProfile,
                                         browser->GetWeakPtr(), path)),
        current_(current) {
    SetPreferredSize(gfx::Size(14, 20));
    SetFocusBehavior(FocusBehavior::ALWAYS);
    GetViewAccessibility().SetName(u"Switch profile");
  }

  void PaintButtonContents(gfx::Canvas* canvas) override {
    cc::PaintFlags flags;
    flags.setAntiAlias(true);
    flags.setColor(GetColorProvider()->GetColor(
        current_ ? ui::kColorSysOnSurface : ui::kColorSysOnSurfaceSubtle));
    flags.setAlphaf(current_ ? 1.0f : 0.5f);
    canvas->DrawCircle(gfx::PointF(width() / 2.0f, height() / 2.0f), 2.5f,
                       flags);
  }

 private:
  const bool current_;
};

BEGIN_METADATA(AuxProfileDot)
END_METADATA

}  // namespace

AuxSidebarView::AuxSidebarView(BrowserWindowInterface* browser)
    : browser_(browser) {
  auto* layout = SetLayoutManager(std::make_unique<views::BoxLayout>(
      views::BoxLayout::Orientation::kVertical, gfx::Insets::VH(4, 0), 0));
  layout->set_cross_axis_alignment(
      views::BoxLayout::CrossAxisAlignment::kStretch);

  browser_->GetTabStripModel()->AddObserver(this);
  BindProfileSources();
  UpdateActiveChat();
  Rebuild();
}

void AuxSidebarView::BindProfileSources() {
  bound_profile_ = browser_->GetProfile()->GetWeakPtr();
  if (bookmarks::BookmarkModel* model =
          BookmarkModelFactory::GetForBrowserContext(browser_->GetProfile())) {
    bookmark_observation_.Observe(model);
  }
  pref_changes_.Init(browser_->GetProfile()->GetPrefs());
  pref_changes_.Add(kFolderStatePref,
                    base::BindRepeating(&AuxSidebarView::ScheduleRebuild,
                                        weak_factory_.GetWeakPtr()));
  pref_changes_.Add(kSectionStatePref,
                    base::BindRepeating(&AuxSidebarView::ScheduleRebuild,
                                        weak_factory_.GetWeakPtr()));
  pref_changes_.Add("aux.browser.sidebar_bookmarks",
      base::BindRepeating(&AuxSidebarView::ScheduleRebuild,
                          weak_factory_.GetWeakPtr()));
  task_feed_ = std::make_unique<AuxNativeTaskFeed>(
      browser_->GetProfile(),
      base::BindRepeating(&AuxSidebarView::OnTaskSnapshot,
                          weak_factory_.GetWeakPtr()));
}

bool AuxSidebarView::CanRebindForAuxProfileSwitch(Profile* target) const {
  if (!target || !target->IsRegularProfile() || profile_switch_paused_ ||
      bound_profile_.get() != browser_->GetProfile()) {
    return false;
  }
  // An ongoing native drag owns actual tab/view pointers; do not migrate it.
  if (pinned_grid_ &&
      static_cast<AuxPinnedGrid*>(pinned_grid_.get())->IsDragging()) {
    return false;
  }
  auto* prefs = target->GetPrefs();
  return prefs && prefs->FindPreference(kFolderStatePref) &&
         prefs->FindPreference(kSectionStatePref) &&
         prefs->FindPreference("aux.browser.sidebar_bookmarks");
}

uint64_t AuxSidebarView::BeginAuxProfileSwitch(Profile* target) {
  CHECK(CanRebindForAuxProfileSwitch(target));
  profile_switch_paused_ = true;
  const uint64_t generation = ++profile_switch_generation_;
  weak_factory_.InvalidateWeakPtrs();
  rebuild_pending_ = false;
  task_feed_->Stop();
  bookmark_observation_.Reset();
  pref_changes_.Reset();
  favicon_tracker_.TryCancelAll();
  menu_runner_.reset();
  menu_model_.reset();
  if (review_widget_) {
    review_widget_->Close();
    review_widget_.reset();
  }
  return generation;
}

void AuxSidebarView::RebindAuxProfileSwitch() {
  CHECK(profile_switch_paused_);
  CHECK(browser_->GetProfile()->IsRegularProfile());
  CHECK(!bookmark_observation_.IsObserving());
  // Destroy the old feed before its replacement. This closes only its actual
  // observer/transport; it neither cancels nor fabricates daemon tasks.
  const bool changing_profile =
      bound_profile_.get() != browser_->GetProfile();
  task_feed_.reset();
  if (changing_profile) {
    projected_tasks_.clear();
    chats_.clear();
    feed_state_ = AuxNativeTaskFeed::State::kConnecting;
    feed_error_.clear();
    action_error_.clear();
    active_chat_id_.clear();
    collapsed_sections_.clear();
    expanded_bookmark_folders_.clear();
    show_all_chats_ = false;
    any_running_ = false;
  }
  menu_chat_id_.clear();
  menu_tab_contents_.reset();
  menu_bookmark_id_ = -1;
  menu_bookmark_uuid_.clear();
  menu_pinned_ = false;
  BindProfileSources();
}

void AuxSidebarView::EndAuxProfileSwitch(uint64_t generation) {
  if (generation != profile_switch_generation_ || !profile_switch_paused_) {
    return;
  }
  CHECK_EQ(bound_profile_.get(), browser_->GetProfile());
  profile_switch_paused_ = false;
  if (running_changed_) {
    running_changed_.Run(any_running_);
  }
  // Target tab insertion has now settled; derive its actual active chat.
  UpdateActiveChat();
  Rebuild();
  if (GetWidget()) {
    task_feed_->Start();
  }
}

AuxSidebarView::~AuxSidebarView() {
  browser_->GetTabStripModel()->RemoveObserver(this);
}

void AuxSidebarView::OnTabStripModelChanged(
    TabStripModel* tab_strip_model,
    const TabStripModelChange& change,
    const TabStripSelectionChange& selection) {
  if (selection.active_tab_changed()) {
    UpdateActiveChat();
  }
  // Pinned tiles mirror the tab strip model. A tile can be the button that
  // triggered this change, so rebuild after the current event unwinds.
  if (change.type() != TabStripModelChange::kSelectionOnly ||
      selection.active_tab_changed()) {
    ScheduleRebuild();
  }
}

void AuxSidebarView::OnTabChangedAt(tabs::TabInterface* tab,
                                    TabChangeType change_type) {
  if (tab == browser_->GetActiveTabInterface()) {
    UpdateActiveChat();
  }
  if (tab->IsPinned() && change_type != TabChangeType::kLoadingOnly) {
    ScheduleRebuild();
  }
}

void AuxSidebarView::ScheduleRebuild() {
  if (profile_switch_paused_) {
    return;
  }
  if (rebuild_pending_) {
    return;
  }
  rebuild_pending_ = true;
  base::SingleThreadTaskRunner::GetCurrentDefault()->PostTask(
      FROM_HERE, base::BindOnce(
                     [](base::WeakPtr<AuxSidebarView> self) {
                       if (self) {
                         self->rebuild_pending_ = false;
                         self->Rebuild();
                       }
                     },
                     weak_factory_.GetWeakPtr()));
}

TabDragTarget* AuxSidebarView::GetPinnedTabDragTarget(const gfx::Point& point) {
  if (!pinned_grid_ || !pinned_grid_->IsDrawn() ||
      !pinned_grid_->GetBoundsInScreen().Contains(point)) {
    return nullptr;
  }
  return static_cast<AuxPinnedGrid*>(pinned_grid_.get());
}

void AuxSidebarView::MovePinnedTab(base::WeakPtr<content::WebContents> contents,
                                   int to) {
  auto* model = browser_->GetTabStripModel();
  const int from = contents ? model->GetIndexOfWebContents(contents.get()) : -1;
  const int pinned = model->IndexOfFirstNonPinnedTab();
  if (from >= 0 && from < pinned && to >= 0 && to < pinned) {
    model->MoveWebContentsAt(from, to, false);
  }
}

void AuxSidebarView::PinDraggedTab(base::WeakPtr<content::WebContents> contents,
                                   int to) {
  if (!contents || contents->GetBrowserContext() != browser_->GetProfile()) {
    return;
  }
  auto* model = browser_->GetTabStripModel();
  const int index = model->GetIndexOfWebContents(contents.get());
  if (index < 0) {
    return;
  }
  model->SetTabPinned(index, true);
  MovePinnedTab(contents,
                std::clamp(to, 0, model->IndexOfFirstNonPinnedTab() - 1));
  ScheduleRebuild();
}

void AuxSidebarView::FinishPinnedDrag(
    base::WeakPtr<content::WebContents> contents,
    const gfx::Point& point) {
  auto* model = browser_->GetTabStripModel();
  const int index =
      contents ? model->GetIndexOfWebContents(contents.get()) : -1;
  if (index < 0 || !model->IsTabPinned(index) || !GetWidget()) {
    return;
  }
  if (pinned_grid_ && pinned_grid_->GetBoundsInScreen().Contains(point)) {
    const auto local = views::View::ConvertPointFromScreen(pinned_grid_, point);
    MovePinnedTab(
        contents,
        std::clamp(
            local.y() / (kTileHeight + kTileGap) * kTilesPerRow +
                local.x() * kTilesPerRow / std::max(pinned_grid_->width(), 1),
            0, model->IndexOfFirstNonPinnedTab() - 1));
  } else if (GetWidget()->GetWindowBoundsInScreen().Contains(point)) {
    model->SetTabPinned(index, false);
  }
  ScheduleRebuild();
}

void AuxSidebarView::ActivateTab(base::WeakPtr<content::WebContents> contents) {
  auto* model = browser_->GetTabStripModel();
  const int index =
      contents ? model->GetIndexOfWebContents(contents.get()) : -1;
  if (index >= 0) {
    model->ActivateTabAt(index);
  }
}

void AuxSidebarView::AddPinnedTiles() {
  TabStripModel* model = browser_->GetTabStripModel();
  const int pinned = model->IndexOfFirstNonPinnedTab();
  auto* grid = AddChildView(std::make_unique<AuxPinnedGrid>(
      browser_, base::BindRepeating(&AuxSidebarView::PinDraggedTab,
                                    weak_factory_.GetWeakPtr())));
  pinned_grid_ = grid;
  grid->SetProperty(views::kMarginsKey, gfx::Insets::TLBR(4, 0, 4, 0));
  for (int i = 0; i < pinned; ++i) {
    content::WebContents* contents = model->GetWebContentsAt(i);
    if (!contents) {
      continue;
    }
    ui::ImageModel icon = ui::ImageModel::FromVectorIcon(
        kGlobeIcon, ui::kColorSysOnSurfaceSubtle, kTileIconSize);
    if (auto* driver =
            favicon::ContentFaviconDriver::FromWebContents(contents)) {
      const gfx::Image favicon = driver->GetFavicon();
      if (!favicon.IsEmpty()) {
        icon = ui::ImageModel::FromImage(favicon);
      }
    }
    auto* tile = grid->AddChildView(std::make_unique<AuxPinnedTile>(
        base::BindRepeating(&AuxSidebarView::ActivateTab,
                            weak_factory_.GetWeakPtr(), contents->GetWeakPtr()),
        base::BindRepeating(&AuxSidebarView::FinishPinnedDrag,
                            weak_factory_.GetWeakPtr()),
        contents->GetWeakPtr(), icon, contents->GetTitle(),
        i == model->active_index()));
    tile->set_context_menu_controller(this);
  }
}

void AuxSidebarView::UpdateActiveChat() {
  if (profile_switch_paused_) {
    return;
  }
  std::string id;
  if (content::WebContents* contents =
          browser_->GetTabStripModel()->GetActiveWebContents()) {
    const GURL url = contents->GetVisibleURL();
    constexpr std::string_view kTasks = "/chat/";
    if (url.SchemeIs("chrome-extension") && url.host() == kAgentManagerId) {
      std::string_view ref = url.ref();
      if (size_t at = ref.find(kTasks); at != std::string_view::npos) {
        id = std::string(ref.substr(at + kTasks.size()));
      }
    }
  }
  if (id == active_chat_id_) {
    return;
  }
  active_chat_id_ = std::move(id);
  Rebuild();
}

void AuxSidebarView::ReadSidebarState() {
  auto* prefs = browser_->GetProfile()->GetPrefs();
  for (auto [key, target] :
       {std::pair{kFolderStatePref, &expanded_bookmark_folders_},
        std::pair{kSectionStatePref, &collapsed_sections_}}) {
    if (!prefs->FindPreference(key)) {
      action_error_ = u"Sidebar state cannot be restored by this native build.";
      continue;
    }
    target->clear();
    for (const auto& value : prefs->GetList(key)) {
      if (const auto* text = value.GetIfString()) {
        target->insert(*text);
      }
    }
  }
}

void AuxSidebarView::SaveSectionState() {
  auto* prefs = browser_->GetProfile()->GetPrefs();
  if (!prefs->FindPreference(kSectionStatePref)) {
    return;
  }
  base::ListValue values;
  for (const auto& section : collapsed_sections_) {
    values.Append(section);
  }
  prefs->SetList(kSectionStatePref, std::move(values));
}

void AuxSidebarView::ToggleSection(const std::string& key) {
  if (!collapsed_sections_.erase(key)) {
    collapsed_sections_.insert(key);
  }
  SaveSectionState();
  ScheduleRebuild();
}

void AuxSidebarView::ToggleBookmarkFolder(int64_t id) {
  auto* model =
      BookmarkModelFactory::GetForBrowserContext(browser_->GetProfile());
  const auto* node =
      model ? bookmarks::GetBookmarkNodeByID(model, id) : nullptr;
  if (!node || !node->is_folder()) {
    return;
  }
  const auto uuid = node->uuid().AsLowercaseString();
  if (!expanded_bookmark_folders_.erase(uuid)) {
    expanded_bookmark_folders_.insert(uuid);
  }
  auto* prefs = browser_->GetProfile()->GetPrefs();
  if (prefs->FindPreference(kFolderStatePref)) {
    base::ListValue values;
    for (const auto& folder : expanded_bookmark_folders_) {
      values.Append(folder);
    }
    prefs->SetList(kFolderStatePref, std::move(values));
  }
  ScheduleRebuild();
}

void AuxSidebarView::AddBookmarkRows(views::View* container,
                                     const bookmarks::BookmarkNode* node,
                                     int depth,
                                     int* count) {
  if (!node || *count >= 1000) {
    return;
  }
  if (depth > 16) {
    *count = 1000;
    return;
  }
  ++*count;
  const bool expanded =
      expanded_bookmark_folders_.contains(node->uuid().AsLowercaseString());
  const auto title =
      node->GetTitle().empty()
          ? (node->is_folder() ? u"Untitled folder"
                               : base::UTF8ToUTF16(node->url().host()))
          : node->GetTitle();
  auto* row = container->AddChildView(std::make_unique<AuxSidebarRow>(
      node->is_folder()
          ? base::BindRepeating(&AuxSidebarView::ToggleBookmarkFolder,
                                weak_factory_.GetWeakPtr(), node->id())
          : base::BindRepeating(&AuxSidebarView::OpenBookmark,
                                weak_factory_.GetWeakPtr(), node->url()),
      title,
      ui::ImageModel::FromVectorIcon(
          node->is_folder() ? (expanded ? vector_icons::kFolderOpenIcon
                                        : vector_icons::kFolderFlippableIcon)
                            : vector_icons::kStarFilledIcon,
          ui::kColorSysOnSurfaceSubtle, kRowIconSize)));
  row->set_bookmark_id(node->id());
  row->set_context_menu_controller(this);
  row->SetTooltipText(title);
  row->SetBorder(views::CreateEmptyBorder(
      gfx::Insets::TLBR(8, kRowInset + 12 * depth, 8, kRowInset)));
  if (node->is_folder()) {
    if (expanded) {
      row->GetViewAccessibility().SetIsExpanded();
    } else {
      row->GetViewAccessibility().SetIsCollapsed();
    }
    if (expanded) {
      for (const auto& child : node->children()) {
        AddBookmarkRows(container, child.get(), depth + 1, count);
      }
    }
    return;
  }
  auto* favicons = FaviconServiceFactory::GetForProfile(
      browser_->GetProfile(), ServiceAccessType::EXPLICIT_ACCESS);
  if (!favicons) {
    return;
  }
  auto tracker = std::make_unique<views::ViewTracker>(row);
  favicons->GetFaviconImageForPageURL(
      node->url(),
      base::BindOnce(
          [](std::unique_ptr<views::ViewTracker> tracker,
             const favicon_base::FaviconImageResult& result) {
            auto* view = static_cast<AuxSidebarRow*>(tracker->view());
            if (view && !result.image.IsEmpty()) {
              view->SetFavicon(result.image.AsImageSkia());
            }
          },
          std::move(tracker)),
      &favicon_tracker_);
}

void AuxSidebarView::OpenNewTab() {
  browser_->OpenGURL(GURL("chrome://newtab/"),
                     WindowOpenDisposition::NEW_FOREGROUND_TAB);
}

void AuxSidebarView::AddedToWidget() {
  if (!profile_switch_paused_) {
    task_feed_->Start();
  }
}

void AuxSidebarView::RemovedFromWidget() {
  task_feed_->Stop();
  if (review_widget_)
    review_widget_->Close();
}

void AuxSidebarView::BookmarkModelChanged() {
  ScheduleRebuild();
}

void AuxSidebarView::BookmarkModelLoaded(bool ids_reassigned) {
  Rebuild();
}

void AuxSidebarView::BookmarkModelBeingDeleted() {
  bookmark_observation_.Reset();
}

void AuxSidebarView::Rebuild() {
  if (profile_switch_paused_) {
    return;
  }
  if (menu_runner_ && menu_runner_->IsRunning()) {
    return;
  }
  if (pinned_grid_ &&
      static_cast<AuxPinnedGrid*>(pinned_grid_.get())->IsDragging()) {
    return;
  }
  ReadSidebarState();
  if (review_widget_ && !review_widget_->IsClosed())
    return;
  favicon_tracker_.TryCancelAll();
  pinned_grid_ = nullptr;
  RemoveAllChildViews();
  // Saved pinned entries are the region-owned VerticalPinnedTabEntriesView.
  // Do not rebuild the retired live-tab grid as its substitute.

  // Returns whether the section is expanded.
  bool first_section = false;
  auto add_header = [this, &first_section](const std::string& key,
                                           const std::u16string& text) {
    const bool collapsed = collapsed_sections_.contains(key);
    if (first_section) {
      auto* separator = AddChildView(std::make_unique<views::Separator>());
      separator->SetProperty(views::kMarginsKey, gfx::Insets::TLBR(6, 0, 0, 0));
    }
    first_section = true;
    auto* header = AddChildView(std::make_unique<AuxSidebarRow>(
        base::BindRepeating(&AuxSidebarView::ToggleSection,
                            base::Unretained(this), key),
        text, ui::ImageModel(), /*emphasized=*/false));
    header->SetBorder(
        views::CreateEmptyBorder(
            gfx::Insets::TLBR(12, kRowInset, 4, kRowInset)));
    if (collapsed) {
      header->GetViewAccessibility().SetIsCollapsed();
    } else {
      header->GetViewAccessibility().SetIsExpanded();
    }
    header->SetCaptionStyle();
    header->SetImageLabelSpacing(0);
    header->SetHorizontalAlignment(gfx::ALIGN_LEFT);
    return !collapsed;
  };

  // Real model hierarchy in a bounded scrolling section.
  auto* model =
      BookmarkModelFactory::GetForBrowserContext(browser_->GetProfile());
  if (model && model->loaded() &&
      browser_->GetProfile()->GetPrefs()->GetBoolean(
          "aux.browser.sidebar_bookmarks") &&
      add_header("bookmarks", u"Bookmarks")) {
    auto scroll = std::make_unique<views::ScrollView>();
    scroll->ClipHeightTo(0, 240);
    auto contents = std::make_unique<views::View>();
    contents->SetLayoutManager(std::make_unique<views::BoxLayout>(
        views::BoxLayout::Orientation::kVertical));
    auto* rows = scroll->SetContents(std::move(contents));
    int count = 0;
    for (const auto& node : model->bookmark_bar_node()->children()) {
      AddBookmarkRows(rows, node.get(), 0, &count);
    }
    for (const auto* node : {model->other_node(), model->mobile_node()}) {
      if (node && !node->children().empty()) {
        AddBookmarkRows(rows, node, 0, &count);
      }
    }
    auto* manager = rows->AddChildView(std::make_unique<views::LabelButton>(
        base::BindRepeating(
            [](base::WeakPtr<AuxSidebarView> self) {
              if (self) {
                chrome::ExecuteCommand(self->browser_,
                                       IDC_SHOW_BOOKMARK_MANAGER);
              }
            },
            weak_factory_.GetWeakPtr()),
        count >= 1000 ? u"Browse additional saved pages" : u"Open bookmarks"));
    manager->SetFocusBehavior(views::View::FocusBehavior::ALWAYS);
    if (count == 0) {
      rows->AddChildView(
          std::make_unique<views::Label>(u"No saved pages yet."));
    }
    AddChildView(std::move(scroll));
  }

  if (!feed_error_.empty() || !action_error_.empty()) {
    auto* error = AddChildView(std::make_unique<views::Label>(
        action_error_.empty() ? feed_error_ : action_error_));
    error->SetMultiLine(true);
    error->SetMaximumWidth(250);
    error->SetHorizontalAlignment(gfx::ALIGN_LEFT);
    error->SetEnabledColor(ui::kColorAlertHighSeverity);
    error->SetBorder(views::CreateEmptyBorder(gfx::Insets::VH(4, 12)));
  }

  // Chats.
  const bool chats_open = add_header("chats", u"Chats");
  if (chats_open) {
    AddChildView(std::make_unique<AuxSidebarRow>(
        base::BindRepeating(&AuxSidebarView::OpenNewChat,
                            base::Unretained(this)),
        u"New Chat",
        ui::ImageModel::FromVectorIcon(vector_icons::kEditSquareIcon,
                                       ui::kColorSysOnSurfaceSubtle,
                                       kRowIconSize)));
    const size_t shown = show_all_chats_
                             ? chats_.size()
                             : std::min(chats_.size(), kMaxChatsShown);
    for (size_t i = 0; i < shown; ++i) {
      const Chat& chat = chats_[i];
      auto* row = AddChildView(std::make_unique<AuxSidebarRow>(
          base::BindRepeating(&AuxSidebarView::HandleChatClick, base::Unretained(this),
                              chat.id),
          base::UTF8ToUTF16(chat.title), ui::ImageModel(),
          /*emphasized=*/chat.unread,
          /*selected=*/chat.id == active_chat_id_));
      const auto task = std::ranges::find(projected_tasks_, chat.id, &AuxNativeTask::id);
      if (task != projected_tasks_.end()) {
        if (task->pending_action || task->status == "running" || task->status == "error")
          row->SetImageModel(views::Button::STATE_NORMAL,
              ui::ImageModel::FromVectorIcon(
                  task->pending_action ? vector_icons::kHelpIcon
                  : task->status == "running" ? vector_icons::kPlayArrowIcon
                  : vector_icons::kErrorIcon, ui::kColorSysOnSurfaceSubtle, 16));
      }
      row->set_chat_id(chat.id);
      row->SetTooltipText(base::UTF8ToUTF16(chat.title));
      row->set_context_menu_controller(this);
    }
    if (chats_.size() > kMaxChatsShown) {
      AddChildView(std::make_unique<AuxSidebarRow>(
          base::BindRepeating(&AuxSidebarView::OpenAllChats,
                              base::Unretained(this)),
          u"Show all", ui::ImageModel()));
    }
  }

  add_header("tabs", u"Tabs");
  AddChildView(std::make_unique<AuxSidebarRow>(
      base::BindRepeating(&AuxSidebarView::OpenNewTab, base::Unretained(this)),
      u"New Tab",
      ui::ImageModel::FromVectorIcon(vector_icons::kAdd2Icon,
                                     ui::kColorSysOnSurfaceSubtle,
                                     kRowIconSize)));
  InvalidateLayout();
}

void AuxSidebarView::OnTaskSnapshot(const AuxNativeTaskFeed::Snapshot& snapshot) {
  if (profile_switch_paused_) {
    return;
  }
  if (projected_tasks_ == snapshot.tasks && feed_state_ == snapshot.state &&
      feed_error_ == snapshot.error)
    return;
  if (snapshot.state != AuxNativeTaskFeed::State::kReady && review_widget_)
    review_widget_->Close();
  projected_tasks_ = snapshot.tasks;
  feed_state_ = snapshot.state;
  feed_error_ = snapshot.error;
  chats_.clear();
  bool attention = false;
  for (const auto& task : projected_tasks_) {
    chats_.push_back(Chat{.id = task.id, .title = base::UTF16ToUTF8(task.title),
                          .unread = task.unread,
                          .running = task.status == "running",
                          .pinned = task.pinned, .can_pin = task.can_pin});
    attention |= task.pending_action.has_value();
  }
  if (attention && collapsed_sections_.erase("chats")) {
    SaveSectionState();
  }
  if (attention)
    show_all_chats_ = true;
  const bool running = std::ranges::any_of(chats_, [](const Chat& chat) {
    return chat.running;
  });
  if (running != any_running_) {
    any_running_ = running;
    if (running_changed_)
      running_changed_.Run(running);
  }
  ScheduleRebuild();
}

void AuxSidebarView::HandleChatClick(const std::string& session_id) {
  if (review_widget_ && !review_widget_->IsClosed()) {
    review_widget_->Activate();
    return;
  }
  const auto task = std::ranges::find(projected_tasks_, session_id,
                                     &AuxNativeTask::id);
  if (task != projected_tasks_.end() && task->pending_action) {
    for (const auto& child : children()) {
      auto* row = views::AsViewClass<AuxSidebarRow>(child.get());
      if (row && row->chat_id() == session_id) {
        review_widget_ = AuxTaskReviewBubble::Show(
            row, *task,
            base::BindRepeating(&AuxNativeTaskFeed::PerformAction,
                                task_feed_->GetWeakPtr()),
            base::BindOnce(&AuxSidebarView::OpenChat,
                           weak_factory_.GetWeakPtr(), session_id),
            base::BindOnce([](base::WeakPtr<AuxSidebarView> self) {
              if (self) {
                self->review_widget_.reset();
                self->ScheduleRebuild();
              }
            }, weak_factory_.GetWeakPtr()))->GetWeakPtr();
        return;
      }
    }
  }
  OpenChat(session_id);
}

void AuxSidebarView::OpenChat(const std::string& session_id) {
  OpenAgentRoute(browser_, "/tasks/" + session_id);
}

void AuxSidebarView::OpenNewChat() {
  OpenAgentRoute(browser_, "/tasks/new");
}

void AuxSidebarView::OpenAllChats() {
  OpenAgentRoute(browser_, "/tasks");
}

void AuxSidebarView::OpenBookmark(const GURL& url) {
  browser_->OpenGURL(url, WindowOpenDisposition::CURRENT_TAB);
}

void AuxSidebarView::ShowContextMenuForViewImpl(
    views::View* source,
    const gfx::Point& point,
    ui::mojom::MenuSourceType source_type) {
  if (const auto* tile = views::AsViewClass<AuxPinnedTile>(source)) {
    if (!GetWidget()) {
      return;
    }
    menu_tab_contents_ =
        tile->contents() ? tile->contents()->GetWeakPtr() : nullptr;
    if (!menu_tab_contents_) {
      return;
    }
    menu_model_ = std::make_unique<ui::SimpleMenuModel>(this);
    menu_model_->AddItem(kCommandTabReload, u"Reload");
    menu_model_->AddItem(kCommandTabDuplicate, u"Duplicate");
    menu_model_->AddItem(kCommandTabUnpin, u"Unpin Tab");
    menu_model_->AddItem(kCommandTabClose, u"Close");
    menu_runner_ = std::make_unique<views::MenuRunner>(
        menu_model_.get(), views::MenuRunner::HAS_MNEMONICS);
    menu_runner_->RunMenuAt(GetWidget(), nullptr,
                            gfx::Rect(point, gfx::Size()),
                            views::MenuAnchorPosition::kTopLeft, source_type);
    ScheduleRebuild();
    return;
  }
  const auto* row = views::AsViewClass<AuxSidebarRow>(source);
  if (!row) {
    return;
  }
  if (row->bookmark_id() >= 0) {
    auto* model =
        BookmarkModelFactory::GetForBrowserContext(browser_->GetProfile());
    const auto* node =
        model ? bookmarks::GetBookmarkNodeByID(model, row->bookmark_id())
              : nullptr;
    if (!node || !GetWidget()) {
      return;
    }
    menu_bookmark_id_ = node->id();
    menu_bookmark_uuid_ = node->uuid().AsLowercaseString();
    menu_model_ = std::make_unique<ui::SimpleMenuModel>(this);
    if (!node->is_folder()) {
      menu_model_->AddItem(kBookmarkCurrent, u"Open");
    }
    menu_model_->AddItem(kBookmarkNewTab, node->is_folder()
                                              ? u"Open all in new tabs"
                                              : u"Open in new tab");
    menu_model_->AddItem(kBookmarkNewWindow, node->is_folder()
                                                 ? u"Open all in new window"
                                                 : u"Open in new window");
    if (!node->is_permanent_node() && !model->client()->IsNodeManaged(node) &&
        browser_->GetProfile()->GetPrefs()->GetBoolean(
            bookmarks::prefs::kEditBookmarksEnabled)) {
      menu_model_->AddItem(kBookmarkEdit, u"Edit");
      menu_model_->AddItem(kBookmarkDelete, u"Delete");
    }
    menu_runner_ = std::make_unique<views::MenuRunner>(
        menu_model_.get(), views::MenuRunner::HAS_MNEMONICS);
    menu_runner_->RunMenuAt(GetWidget(), nullptr, gfx::Rect(point, gfx::Size()),
                            views::MenuAnchorPosition::kTopLeft, source_type);
    ScheduleRebuild();
    return;
  }
  const auto chat = std::ranges::find(chats_, row->chat_id(), &Chat::id);
  if (chat == chats_.end() || !GetWidget()) {
    return;
  }
  menu_chat_id_ = chat->id;
  menu_model_ = std::make_unique<ui::SimpleMenuModel>(this);
  if (chat->can_pin || chat->pinned) {
    menu_model_->AddItem(kCommandPin, chat->pinned ? u"Unpin" : u"Pin");
  }
  if (chat->unread) {
    menu_model_->AddItem(kCommandMarkRead, u"Mark as read");
  }
  menu_model_->AddItem(kCommandArchive, u"Archive");
  menu_model_->AddItem(kCommandDelete, u"Delete");
  menu_pinned_ = chat->pinned;
  menu_runner_ = std::make_unique<views::MenuRunner>(
      menu_model_.get(), views::MenuRunner::HAS_MNEMONICS);
  menu_runner_->RunMenuAt(GetWidget(), nullptr, gfx::Rect(point, gfx::Size()),
                          views::MenuAnchorPosition::kTopLeft, source_type);
  ScheduleRebuild();
}

void AuxSidebarView::ExecuteCommand(int command_id, int event_flags) {
  if (command_id >= kBookmarkCurrent && command_id <= kBookmarkDelete) {
    ExecuteBookmarkCommand(command_id);
    return;
  }
  const char* action = nullptr;
  switch (command_id) {
    case kCommandTabReload:
    case kCommandTabDuplicate:
    case kCommandTabUnpin:
    case kCommandTabClose: {
      TabStripModel* model = browser_->GetTabStripModel();
      const int index =
          menu_tab_contents_
              ? model->GetIndexOfWebContents(menu_tab_contents_.get())
              : -1;
      if (index < 0 || !model->IsTabPinned(index)) {
        return;
      }
      model->ExecuteContextMenuCommand(
          index, command_id == kCommandTabReload      ? tabs::CommandReload
                 : command_id == kCommandTabDuplicate ? tabs::CommandDuplicate
                 : command_id == kCommandTabUnpin ? tabs::CommandTogglePinned
                                                  : tabs::CommandCloseTab);
      return;
    }
    case kCommandPin:
      action = menu_pinned_ ? "unpin" : "pin";
      break;
    case kCommandMarkRead:
      action = "mark-read";
      break;
    case kCommandArchive:
      action = "archive";
      break;
    case kCommandDelete:
      action = "delete";
      break;
    default:
      return;
  }
  PostChatAction(menu_chat_id_, action);
}

void AuxSidebarView::ExecuteBookmarkCommand(int command) {
  auto* model =
      BookmarkModelFactory::GetForBrowserContext(browser_->GetProfile());
  const auto* node =
      model ? bookmarks::GetBookmarkNodeByID(model, menu_bookmark_id_)
            : nullptr;
  if (!node || node->uuid().AsLowercaseString() != menu_bookmark_uuid_) {
    return;
  }
  if (command <= kBookmarkNewWindow) {
    if (command == kBookmarkCurrent && !node->is_folder()) {
      OpenBookmark(node->url());
    } else {
      bookmarks::OpenAllIfAllowed(
          browser_, {node},
          command == kBookmarkNewWindow
              ? WindowOpenDisposition::NEW_WINDOW
              : WindowOpenDisposition::NEW_BACKGROUND_TAB);
    }
    return;
  }
  if (!GetWidget() || node->is_permanent_node() ||
      model->client()->IsNodeManaged(node) ||
      !browser_->GetProfile()->GetPrefs()->GetBoolean(
          bookmarks::prefs::kEditBookmarksEnabled)) {
    return;
  }
  if (command == kBookmarkEdit) {
    BookmarkEditor::Show(GetWidget()->GetNativeWindow(), browser_->GetProfile(),
                         BookmarkEditor::EditDetails::EditNode(node),
                         BookmarkEditor::NO_TREE);
    return;
  }
  chrome::ShowQuestionMessageBoxAsync(
      GetWidget()->GetNativeWindow(),
      node->is_folder() ? u"Delete this saved folder?"
                        : u"Delete this saved page?",
      node->is_folder()
          ? u"The folder and its saved pages will be removed from this profile."
          : u"This saved page will be removed from this profile.",
      base::BindOnce(
          [](base::WeakPtr<AuxSidebarView> self, int64_t id, std::string uuid,
             chrome::MessageBoxResult result) {
            if (!self || result != chrome::MESSAGE_BOX_RESULT_YES) {
              return;
            }
            auto* model = BookmarkModelFactory::GetForBrowserContext(
                self->browser_->GetProfile());
            const auto* node =
                model ? bookmarks::GetBookmarkNodeByID(model, id) : nullptr;
            if (node && node->uuid().AsLowercaseString() == uuid &&
                !node->is_permanent_node() &&
                !model->client()->IsNodeManaged(node) &&
                self->browser_->GetProfile()->GetPrefs()->GetBoolean(
                    bookmarks::prefs::kEditBookmarksEnabled)) {
              model->Remove(node, bookmarks::metrics::BookmarkEditSource::kUser,
                            FROM_HERE);
            }
          },
          weak_factory_.GetWeakPtr(), node->id(),
          node->uuid().AsLowercaseString()));
}

void AuxSidebarView::PostChatAction(const std::string& session_id,
                                    const std::string& action) {
  task_feed_->PerformAction(
      session_id, action, base::DictValue(),
      base::BindOnce([](base::WeakPtr<AuxSidebarView> self,
                        std::optional<std::u16string> error) {
        if (!self)
          return;
        self->action_error_ = error.value_or(std::u16string());
        self->ScheduleRebuild();
      }, weak_factory_.GetWeakPtr()));
}

AuxAgentPill::AuxAgentPill(BrowserWindowInterface* browser)
    : views::Button(base::BindRepeating(
          [](BrowserWindowInterface* browser) {
            OpenAgentRoute(browser, "/tasks");
          },
          base::Unretained(browser))) {
  auto* layout = SetLayoutManager(std::make_unique<views::BoxLayout>(
      views::BoxLayout::Orientation::kHorizontal, gfx::Insets::VH(2, 0), 0));
  layout->set_main_axis_alignment(views::BoxLayout::MainAxisAlignment::kCenter);
  layout->set_cross_axis_alignment(
      views::BoxLayout::CrossAxisAlignment::kCenter);
  auto icon = std::make_unique<views::ImageView>(ui::ImageModel::FromVectorIcon(
      vector_icons::kDesktopWindowsIcon, SK_ColorWHITE, 16));
  icon->SetCanProcessEventsWithinSubtree(false);
  AddChildView(std::move(icon));
  SetBackground(views::CreateRoundedRectBackground(SkColorSetRGB(0x6B, 0x63, 0xF0),
                                                    11));
  SetBorder(views::CreateRoundedRectBorder(
      1, 11, SkColorSetARGB(0x80, 0xB4, 0xAF, 0xFF)));
  GetViewAccessibility().SetName(u"Chats");
  SetTooltipText(u"Chats");
  SetFocusBehavior(FocusBehavior::ALWAYS);
}

AuxAgentPill::~AuxAgentPill() = default;

gfx::Size AuxAgentPill::CalculatePreferredSize(
    const views::SizeBounds& available_size) const {
  return gfx::Size(66, 22);
}

void AuxAgentPill::Layout(PassKey) {
  LayoutSuperclass<views::Button>(this);
}

BEGIN_METADATA(AuxAgentPill)
END_METADATA

// Aux agent status in the footer: a bolt with a dot that turns green while
// an agent is running. Opens the chat list.
class AuxBoltButton : public views::Button {
  METADATA_HEADER(AuxBoltButton, views::Button)

 public:
  explicit AuxBoltButton(BrowserWindowInterface* browser)
      : views::Button(base::BindRepeating(
            [](BrowserWindowInterface* browser) {
              OpenAgentRoute(browser, "/tasks");
            },
            base::Unretained(browser))) {
    GetViewAccessibility().SetName(u"Agent activity");
    SetTooltipText(u"Agent activity");
    SetFocusBehavior(FocusBehavior::ALWAYS);
  }

  void SetActive(bool active) {
    active_ = active;
    SchedulePaint();
  }

  gfx::Size CalculatePreferredSize(
      const views::SizeBounds& available_size) const override {
    return gfx::Size(28, 24);
  }

 protected:
  void PaintButtonContents(gfx::Canvas* canvas) override {
    const SkColor color =
        GetColorProvider()->GetColor(ui::kColorSysOnSurfaceSubtle);
    cc::PaintFlags flags;
    flags.setAntiAlias(true);
    flags.setColor(color);
    SkPathBuilder bolt;
    const float x = 3.f, y = 6.f;
    bolt.moveTo(x + 4.5f, y);
    bolt.lineTo(x, y + 7.f);
    bolt.lineTo(x + 3.f, y + 7.f);
    bolt.lineTo(x + 2.5f, y + 12.f);
    bolt.lineTo(x + 7.f, y + 5.f);
    bolt.lineTo(x + 4.f, y + 5.f);
    bolt.close();
    canvas->DrawPath(bolt.detach(), flags);
    flags.setColor(active_ ? SkColorSetRGB(0x34, 0xC7, 0x59)
                           : SkColorSetA(color, 0x99));
    canvas->DrawCircle(gfx::PointF(20.f, 12.f), 2.f, flags);
  }

 private:
  bool active_ = false;
};

BEGIN_METADATA(AuxBoltButton)
END_METADATA

AuxSidebarFooter::AuxSidebarFooter(BrowserWindowInterface* browser)
    : browser_(browser) {
  Build();
}

void AuxSidebarFooter::Build() {
  RemoveAllChildViews();
  profile_button_ = nullptr;
  agent_button_ = nullptr;
  auto* layout = SetLayoutManager(std::make_unique<views::BoxLayout>(
      views::BoxLayout::Orientation::kHorizontal, gfx::Insets::VH(8, 6), 0));
  layout->set_cross_axis_alignment(views::BoxLayout::CrossAxisAlignment::kEnd);

  profile_button_ =
      AddChildView(std::make_unique<AuxProfileButton>(browser_));

  const std::vector<ProfileAttributesEntry*> profiles = AllProfiles();
  if (profiles.size() > 1) {
    auto* dots = AddChildView(std::make_unique<views::View>());
    dots->SetLayoutManager(std::make_unique<views::BoxLayout>(
        views::BoxLayout::Orientation::kHorizontal));
    dots->SetProperty(views::kMarginsKey, gfx::Insets::VH(0, 8));
    for (ProfileAttributesEntry* entry : profiles) {
      dots->AddChildView(std::make_unique<AuxProfileDot>(
          browser_, entry->GetPath(),
          entry->GetPath() == browser_->GetProfile()->GetPath()));
    }
  }

  agent_button_ = AddChildView(std::make_unique<AuxBoltButton>(browser_));
  agent_button_->SetProperty(views::kMarginsKey, gfx::Insets::VH(0, 8));
  static_cast<AuxBoltButton*>(agent_button_.get())->SetActive(agent_active_);

  auto* spacer = AddChildView(std::make_unique<views::View>());
  layout->SetFlexForView(spacer, 1);

  auto search = views::CreateVectorImageButton(base::BindRepeating(
      [](BrowserWindowInterface* browser) {
        chrome::ExecuteCommand(browser, IDC_TAB_SEARCH);
      },
      base::Unretained(browser_.get())));
  search->SetImageModel(
      views::Button::STATE_NORMAL,
      ui::ImageModel::FromVectorIcon(vector_icons::kSearchIcon,
                                     ui::kColorSysOnSurfaceSubtle,
                                     kRowIconSize));
  search->GetViewAccessibility().SetName(u"Search tabs");
  search->SetTooltipText(u"Search tabs");
  views::InstallCircleHighlightPathGenerator(search.get());
  AddChildView(std::move(search));
}

AuxSidebarFooter::~AuxSidebarFooter() = default;

void AuxSidebarFooter::RebindForAuxProfileSwitch() {
  weak_factory_.InvalidateWeakPtrs();
  agent_active_ = false;
  Build();
}

void AuxSidebarFooter::SetAgentActive(bool active) {
  agent_active_ = active;
  if (agent_button_) {
    static_cast<AuxBoltButton*>(agent_button_.get())->SetActive(active);
  }
}

BEGIN_METADATA(AuxSidebarFooter)
END_METADATA

BEGIN_METADATA(AuxSidebarView)
END_METADATA
