// Copyright 2026 Aux Authors. BSD-style license: see //LICENSE.
#include "chrome/browser/ui/views/frame/aux_chats_section.h"
#include <cmath>
#include <utility>
#include "base/check.h"
#include "base/functional/bind.h"
#include "base/time/time.h"
#include "chrome/browser/ui/views/frame/aux_new_chat_view.h"
#include "chrome/browser/ui/views/frame/aux_section_clip_view.h"
#include "components/prefs/pref_service.h"
#include "components/pref_registry/pref_registry_syncable.h"
#include "ui/base/metadata/metadata_impl_macros.h"
#include "ui/views/controls/button/button.h"
#include "ui/views/layout/box_layout.h"
#include "ui/views/view_class_properties.h"
namespace aux {
namespace {
constexpr char kExpanded[] = "aside.vertical_tabs.chats_section_expanded";
}  // namespace
void AuxChatsSection::RegisterPrefs(user_prefs::PrefRegistrySyncable* registry) {
  // Original034e3f1c: booleantrue, flags0; not a new Aux-default invention.
  registry->RegisterBooleanPref(kExpanded, true);
}
AuxChatsSection::AuxChatsSection(PrefService& prefs, Actions actions,
                                 std::u16string shortcut_help)
    : AuxSectionView(u"Chats", true,
          base::BindRepeating(&AuxChatsSection::Toggle, base::Unretained(this)),
          gfx::Insets::TLBR(4, 0, 8, 0),
          {}, {}, 2),
      actions_(std::move(actions)) {
  CHECK(actions_.new_chat && actions_.selected && actions_.rename &&
        actions_.archive && actions_.context && actions_.all_chats &&
        actions_.section_context);
  SetSectionContext(base::BindRepeating(&AuxChatsSection::ShowSectionContext,
                                       base::Unretained(this)));
  header_button()->SetTooltipText(u"Chats with Aux");
  contents()->SetProperty(views::kMarginsKey, gfx::Insets::TLBR(1, 0, 0, 0));
  new_chat_ = contents()->AddChildView(std::make_unique<AuxNewChatView>(
      actions_.new_chat, std::move(shortcut_help)));
  new_chat_->SetProperty(views::kMarginsKey, gfx::Insets::TLBR(0, 7, 0, 7));
  auto rows = std::make_unique<views::View>();
  auto* layout = rows->SetLayoutManager(std::make_unique<views::BoxLayout>(
      views::BoxLayout::Orientation::kVertical));
  layout->set_cross_axis_alignment(views::BoxLayout::CrossAxisAlignment::kStretch);
  layout->SetCollapseMarginsSpacing(true);
  rows_view_ = rows.get();
  clip_ = contents()->AddChildView(std::make_unique<AuxSectionClipView>(std::move(rows)));
  clip_->SetProperty(views::kMarginsKey, gfx::Insets::TLBR(2, 7, 0, 7));
  // Original region ctor sets180000us after ShouldRenderRichAnimation check.
  animation_.SetSlideDuration(gfx::Animation::ShouldRenderRichAnimation()
      ? base::Milliseconds(180) : base::TimeDelta());
  BindProfilePrefs(prefs);
}
AuxChatsSection::~AuxChatsSection() = default;
void AuxChatsSection::PauseProfileObservation() {
  pref_observer_.RemoveAll();
  prefs_ = nullptr;
}
void AuxChatsSection::BindProfilePrefs(PrefService& prefs) {
  pref_observer_.RemoveAll();
  CHECK(prefs.FindPreference(kExpanded));
  prefs_ = &prefs;
  expanded_ = prefs_->GetBoolean(kExpanded);
  SetDisclosureOpen(expanded_);
  animation_.Reset(expanded_ ? 1 : 0);
  pref_observer_.Init(prefs_);
  pref_observer_.Add(kExpanded,
      base::BindRepeating(&AuxChatsSection::PreferenceChanged, base::Unretained(this)));
  ApplyHeight();
}
void AuxChatsSection::Toggle() {
  if (!prefs_) return;
  expanded_ = !expanded_;
  SetDisclosureOpen(expanded_);
  clip_->SetVisible(true);
  if (expanded_) animation_.Show();
  else animation_.Hide();
  ApplyHeight();
  // This may notify external actual profile observers that retire this owner.
  prefs_->SetBoolean(kExpanded, expanded_);
}
void AuxChatsSection::ExpandFromTaskAssociation() {
  if (expanded_) return;
  expanded_ = true;
  SetDisclosureOpen(true);
  clip_->SetVisible(true);
  animation_.Show();
  ApplyHeight();
}
void AuxChatsSection::PreferenceChanged() {
  if (!prefs_) return;
  const bool expanded = prefs_->GetBoolean(kExpanded);
  if (expanded_ == expanded) return;
  expanded_ = expanded;
  SetDisclosureOpen(expanded_);
  clip_->SetVisible(true);
  if (expanded_) animation_.Show();
  else animation_.Hide();
  ApplyHeight();
}
void AuxChatsSection::ShowSectionContext(views::View* anchor,
                                        const ui::MouseEvent& event) {
  auto callback = actions_.section_context;
  callback.Run(anchor, event);
}
void AuxChatsSection::SetChats(const std::vector<Chat>& chats) {
  if (chats_ == chats) return;
  chats_ = chats;
  rows_.clear();
  rows_view_->RemoveAllChildViews();
  for (const auto& chat : chats_) {
    auto row = std::make_unique<AuxChatRow>(chat, actions_.selected,
        actions_.rename, actions_.archive, actions_.context);
    if (!rows_.empty()) row->SetProperty(views::kMarginsKey, gfx::Insets::TLBR(2, 0, 0, 0));
    row->SetSelected(selected_id_ == chat.id);
    rows_.push_back(rows_view_->AddChildView(std::move(row)));
  }
  if (!chats_.empty()) {
    Chat show_all;
    show_all.title = u"Show all";
    auto row = std::make_unique<AuxChatRow>(std::move(show_all),
        base::BindRepeating([](base::RepeatingClosure callback, const std::string&) {
          callback.Run();
        }, actions_.all_chats), AuxChatRow::Action(), AuxChatRow::Action(),
        AuxChatRow::Context(), true);
    row->SetProperty(views::kMarginsKey, gfx::Insets::TLBR(2, 0, 0, 0));
    rows_view_->AddChildView(std::move(row));
  }
  ApplyHeight();
}
void AuxChatsSection::SetSelectedChat(std::optional<std::string> id) {
  if (selected_id_ == id) return;
  selected_id_ = std::move(id);
  for (const auto& row : rows_) row->SetSelected(selected_id_ == row->chat().id);
}
void AuxChatsSection::SetNewChatRepresentedTab(std::optional<tabs::TabHandle> tab,
                                             bool active) {
  new_chat_->SetRepresentedTab(tab, active);
}
void AuxChatsSection::ApplyHeight() {
  // Original4667640 intentionally uses34*(records+1)-1, not measured32*n.
  const int natural = chats_.empty() ? 0 : (static_cast<int>(chats_.size()) + 1) * 34 - 1;
  const int animated = static_cast<int>(std::round(natural * animation_.GetCurrentValue()));
  clip_->SetHeights(animated, natural);
  clip_->SetVisible(animated > 0 || animation_.is_animating());
}
void AuxChatsSection::AnimationProgressed(const gfx::Animation*) { ApplyHeight(); }
void AuxChatsSection::AnimationEnded(const gfx::Animation*) { ApplyHeight(); }
void AuxChatsSection::AnimationCanceled(const gfx::Animation*) { ApplyHeight(); }
BEGIN_METADATA(AuxChatsSection)
END_METADATA
}  // namespace aux
