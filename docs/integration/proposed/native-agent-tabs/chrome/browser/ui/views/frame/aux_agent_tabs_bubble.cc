// Copyright 2026 The Aux Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
// Independently implements docs/spec/native/surfaces.md V2.
#include "chrome/browser/ui/views/frame/aux_agent_tabs_bubble.h"

#include <algorithm>
#include <utility>
#include <vector>

#include "base/functional/bind.h"
#include "base/json/json_reader.h"
#include "base/strings/utf_string_conversions.h"
#include "chrome/app/vector_icons/vector_icons.h"
#include "chrome/browser/profiles/profile.h"
#include "chrome/browser/ui/browser_window/public/browser_window_interface.h"
#include "chrome/browser/ui/browser_window/public/profile_browser_collection.h"
#include "chrome/browser/ui/tabs/tab_strip_model.h"
#include "chrome/browser/ui/views/frame/aux_native_task_feed.h"
#include "chrome/browser/ui/views/frame/browser_view.h"
#include "chrome/browser/ui/views/frame/tab_strip_region_view.h"
#include "components/favicon/content/content_favicon_driver.h"
#include "content/public/browser/devtools_agent_host.h"
#include "content/public/browser/web_contents.h"
#include "ui/base/base_window.h"
#include "ui/base/mojom/dialog_button.mojom.h"
#include "ui/color/color_id.h"
#include "ui/views/accessibility/view_accessibility.h"
#include "ui/views/bubble/bubble_dialog_delegate_view.h"
#include "ui/views/controls/button/checkbox.h"
#include "ui/views/controls/button/image_button.h"
#include "ui/views/controls/button/image_button_factory.h"
#include "ui/views/controls/button/md_text_button.h"
#include "ui/views/controls/label.h"
#include "ui/views/controls/scroll_view.h"
#include "ui/views/layout/box_layout.h"
#include "ui/views/widget/widget.h"

namespace {
using Operation = AuxNativeTaskFeed::AgentTabsOperation;
struct OwnedTab {
  std::string target_id;
  std::string session_tab_id;
  std::u16string title;
  std::string url;
};
struct OwnedGroup {
  std::string session_id;
  std::u16string title;
  std::vector<OwnedTab> tabs;
};
std::optional<std::vector<OwnedGroup>> ParseGroups(const std::string& body) {
  auto value = base::JSONReader::ReadDict(body, base::JSON_PARSE_RFC);
  const auto* groups = value ? value->FindList("groups") : nullptr;
  if (!groups || groups->size() > 200)
    return std::nullopt;
  std::vector<OwnedGroup> result;
  size_t total = 0;
  for (const auto& item : *groups) {
    const auto* group = item.GetIfDict();
    const auto* id = group ? group->FindString("sessionId") : nullptr;
    const auto* title = group ? group->FindString("title") : nullptr;
    const auto* tabs = group ? group->FindList("tabs") : nullptr;
    if (!id || id->empty() || id->size() > 128 || !title ||
        title->size() > 8192 || !tabs || (total += tabs->size()) > 2000)
      return std::nullopt;
    OwnedGroup entry{.session_id = *id, .title = base::UTF8ToUTF16(*title)};
    for (const auto& tab_value : *tabs) {
      const auto* tab = tab_value.GetIfDict();
      const auto* target = tab ? tab->FindString("targetId") : nullptr;
      const auto* session_tab_id = tab ? tab->FindString("id") : nullptr;
      const auto* label = tab ? tab->FindString("title") : nullptr;
      const auto* url = tab ? tab->FindString("url") : nullptr;
      if (!target || target->empty() || target->size() > 128 ||
          !session_tab_id || session_tab_id->empty() ||
          session_tab_id->size() > 128 || !label || label->size() > 8192 ||
          !url || url->size() > 65536 ||
          tab->FindBool("createdByAgent") != true)
        return std::nullopt;
      entry.tabs.push_back(
          OwnedTab{*target, *session_tab_id, base::UTF8ToUTF16(*label), *url});
    }
    result.push_back(std::move(entry));
  }
  return result;
}

class AgentTabsBubble : public views::BubbleDialogDelegate {
 public:
  AgentTabsBubble(BrowserWindowInterface* browser, views::View* anchor)
      : views::BubbleDialogDelegate(anchor, views::BubbleBorder::TOP_LEFT),
        profile_(browser->GetProfile()->GetWeakPtr()),
        feed_(browser->GetProfile(), base::BindRepeating(
            [](const AuxNativeTaskFeed::Snapshot&) {})) {
    if (auto* browser_view = BrowserView::GetBrowserViewForBrowser(browser);
        browser_view && browser_view->tab_strip_view())
      hover_lock_ = browser_view->tab_strip_view()->GetExpandOnHoverLock(
          ExpandOnHoverLockType::kKeepCurrentState);
    SetTitle(u"Agent tabs");
    SetButtons(static_cast<int>(ui::mojom::DialogButton::kNone));
    SetShowCloseButton(true);
    set_fixed_width(420);
    set_close_on_deactivate(true);
    auto contents = std::make_unique<views::View>();
    contents->SetLayoutManager(std::make_unique<views::BoxLayout>(
        views::BoxLayout::Orientation::kVertical, gfx::Insets(12), 8));
    contents_ = SetContentsView(std::move(contents));
    error_ = contents_->AddChildView(std::make_unique<views::Label>());
    error_->SetMultiLine(true);
    error_->SetHorizontalAlignment(gfx::ALIGN_LEFT);
    error_->SetEnabledColor(ui::kColorAlertHighSeverity);
    error_->SetVisible(false);
    auto scroll = std::make_unique<views::ScrollView>();
    scroll->ClipHeightTo(0, 420);
    auto rows = std::make_unique<views::View>();
    rows->SetLayoutManager(std::make_unique<views::BoxLayout>(
        views::BoxLayout::Orientation::kVertical, gfx::Insets(), 8));
    rows_ = scroll->SetContents(std::move(rows));
    contents_->AddChildView(std::move(scroll));
    rows_->AddChildView(std::make_unique<views::Label>(u"Loading owned tabs…"));
    contents_->AddChildView(std::make_unique<views::MdTextButton>(
        base::BindRepeating(&AgentTabsBubble::Refresh,
                            weak_factory_.GetWeakPtr()), u"Refresh"));
    Refresh();
    timer_.Start(FROM_HERE, base::Seconds(2), this, &AgentTabsBubble::Refresh);
  }
 private:
  void ShowError(const std::u16string& error) {
    error_->SetText(error);
    error_->SetVisible(true);
    if (GetWidget()) SizeToContents();
  }
  void Refresh() {
    if (busy_)
      return;
    busy_ = true;
    feed_.RequestAgentTabs(Operation::kList, base::DictValue(), base::BindOnce(
        &AgentTabsBubble::OnGroups, weak_factory_.GetWeakPtr()));
  }
  void OnGroups(std::optional<std::string> body,
                std::optional<std::u16string> error) {
    busy_ = false;
    if (error || !body) {
      // Fail closed: previous private titles disappear when scope/lock is lost.
      rows_->RemoveAllChildViews();
      last_body_.clear();
      ShowError(error.value_or(u"Agent tabs are unavailable."));
      return;
    }
    auto projection = base::JSONReader::ReadDict(*body, base::JSON_PARSE_RFC);
    const auto* unavailable = projection ? projection->FindList("unavailableSessionIds") : nullptr;
    if (!projection || projection->FindBool("available") != true) {
      rows_->RemoveAllChildViews();
      last_body_.clear();
      ShowError(u"Owned targets cannot be verified while the browser bridge is unavailable.");
      return;
    }
    auto groups = ParseGroups(*body);
    if (!groups) {
      rows_->RemoveAllChildViews();
      last_body_.clear();
      ShowError(u"Aux returned an invalid owned-tab projection.");
      return;
    }
    if (last_body_ == *body)
      return;
    error_->SetVisible(false);
    last_body_ = *body;
    rows_->RemoveAllChildViews();
    bool any = false;
    for (const auto& group : *groups) {
      if (group.tabs.empty()) continue;
      any = true;
      auto* heading = rows_->AddChildView(std::make_unique<views::Label>(group.title));
      heading->SetHorizontalAlignment(gfx::ALIGN_LEFT);
      for (const auto& tab : group.tabs) AddTab(group.session_id, tab);
      auto* policy = rows_->AddChildView(std::make_unique<views::Checkbox>(
          u"Close owned tabs when this task finishes"));
      policy->SetEnabled(false);
      policy->SetTooltipText(
          u"The supplied runtime does not expose a per-task cleanup setting.");
      base::DictValue input;
      input.Set("sessionId", group.session_id);
      rows_->AddChildView(std::make_unique<views::MdTextButton>(
          base::BindRepeating(&AgentTabsBubble::Mutate,
                              weak_factory_.GetWeakPtr(), Operation::kCleanup,
                              base::OwnedRef(std::move(input))),
          u"Close this task’s owned tabs"));
    }
    if (projection->FindBool("truncated").value_or(false))
      ShowError(
          u"This view reached its inventory limit. Only verified owned targets "
          u"are listed.");
    else if (unavailable && !unavailable->empty())
      ShowError(u"Some tasks could not be verified. Only verified owned targets are listed.");
    if (!any && (!unavailable || unavailable->empty())) rows_->AddChildView(std::make_unique<views::Label>(
        u"No agent-owned tabs in this browser profile."));
    if (GetWidget()) SizeToContents();
  }
  void AddTab(const std::string& session_id, const OwnedTab& tab) {
    auto* row = rows_->AddChildView(std::make_unique<views::View>());
    auto* layout = row->SetLayoutManager(std::make_unique<views::BoxLayout>(
        views::BoxLayout::Orientation::kHorizontal, gfx::Insets(), 8));
    auto* activate = row->AddChildView(std::make_unique<views::MdTextButton>(
        base::BindRepeating(&AgentTabsBubble::Activate,
                            weak_factory_.GetWeakPtr(), tab.target_id),
        tab.title.empty() ? base::UTF8ToUTF16(tab.url) : tab.title));
    activate->SetTooltipText(tab.title + u"\n" + base::UTF8ToUTF16(tab.url));
    layout->SetFlexForView(activate, 1);
    auto host = content::DevToolsAgentHost::GetForId(tab.target_id);
    if (host && host->GetWebContents() &&
        host->GetWebContents()->GetBrowserContext() == profile_.get()) {
      if (auto* driver = favicon::ContentFaviconDriver::FromWebContents(
              host->GetWebContents())) {
        const auto favicon = driver->GetFavicon();
        if (!favicon.IsEmpty()) activate->SetImageModel(
            views::Button::STATE_NORMAL, ui::ImageModel::FromImage(favicon));
      }
    }
    base::DictValue input;
    input.Set("sessionId", session_id);
    input.Set("targetId", tab.target_id);
    input.Set("sessionTabId", tab.session_tab_id);
    row->AddChildView(std::make_unique<views::MdTextButton>(
        base::BindRepeating(&AgentTabsBubble::Mutate, weak_factory_.GetWeakPtr(),
                            Operation::kClose, base::OwnedRef(std::move(input))),
        u"Close"));
  }
  void Activate(const std::string& target_id) {
    auto host = content::DevToolsAgentHost::GetForId(target_id);
    auto* contents = host ? host->GetWebContents() : nullptr;
    if (!profile_ || !contents || contents->GetBrowserContext() != profile_.get()) {
      ShowError(u"This target is no longer in this browser profile.");
      Refresh();
      return;
    }
    auto* browser = ProfileBrowserCollection::GetForProfile(profile_.get())
        ->FindBrowserWithTab(contents);
    if (!browser) { ShowError(u"This target is no longer a browser tab."); return; }
    auto* model = browser->GetTabStripModel();
    const int index = model->GetIndexOfWebContents(contents);
    if (index == TabStripModel::kNoTab) { Refresh(); return; }
    model->ActivateTabAt(index);
    browser->GetWindow()->Activate();
    GetWidget()->Close();
  }
  void Mutate(Operation operation, const base::DictValue& input) {
    if (busy_) { ShowError(u"Wait for the current refresh, then try again."); return; }
    busy_ = true;
    rows_->SetEnabled(false);
    feed_.RequestAgentTabs(operation, input.Clone(), base::BindOnce(
        [](base::WeakPtr<AgentTabsBubble> self, std::optional<std::string> body,
           std::optional<std::u16string> error) {
          if (!self) return;
          self->busy_ = false;
          self->rows_->SetEnabled(true);
          if (error) {
            auto previous = self->last_body_;
            self->last_body_.clear();
            if (!previous.empty()) self->OnGroups(std::move(previous), std::nullopt);
            self->ShowError(*error);
            return;
          }
          self->last_body_.clear();
          self->Refresh();
        }, weak_factory_.GetWeakPtr()));
  }
  std::unique_ptr<ExpandOnHoverLock> hover_lock_;
  base::WeakPtr<Profile> profile_;
  AuxNativeTaskFeed feed_;
  raw_ptr<views::View> contents_ = nullptr;
  raw_ptr<views::View> rows_ = nullptr;
  raw_ptr<views::Label> error_ = nullptr;
  std::string last_body_;
  bool busy_ = false;
  base::RepeatingTimer timer_;
  base::WeakPtrFactory<AgentTabsBubble> weak_factory_{this};
};
}  // namespace

std::unique_ptr<views::ImageButton> CreateAuxAgentTabsButton(
    BrowserWindowInterface* browser) {
  auto button = views::CreateVectorImageButton(views::Button::PressedCallback());
  button->SetImageModel(views::Button::STATE_NORMAL,
      ui::ImageModel::FromVectorIcon(kTabIcon, ui::kColorSysOnSurfaceSubtle, 16));
  button->SetPreferredSize(gfx::Size(32, 32));
  button->SetTooltipText(u"Agent-owned tabs");
  button->GetViewAccessibility().SetName(u"Agent-owned tabs");
  button->SetCallback(base::BindRepeating(
      [](BrowserWindowInterface* browser, views::ImageButton* anchor) {
        auto bubble = std::make_unique<AgentTabsBubble>(browser, anchor);
        views::BubbleDialogDelegate::CreateBubbleDeprecated(
            std::move(bubble), views::Widget::InitParams::NATIVE_WIDGET_OWNS_WIDGET)
            ->Show();
      }, base::Unretained(browser), base::Unretained(button.get())));
  return button;
}
