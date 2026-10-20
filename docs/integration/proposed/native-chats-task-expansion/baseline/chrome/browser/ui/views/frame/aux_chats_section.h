// Copyright 2026 Aux Authors. BSD-style license: see //LICENSE.
#ifndef CHROME_BROWSER_UI_VIEWS_FRAME_AUX_CHATS_SECTION_H_
#define CHROME_BROWSER_UI_VIEWS_FRAME_AUX_CHATS_SECTION_H_
#include <optional>
#include <vector>
#include "base/functional/callback.h"
#include "chrome/browser/ui/views/frame/aux_chat_row.h"
#include "chrome/browser/ui/views/frame/aux_section_view.h"
#include "components/prefs/pref_change_registrar.h"
#include "components/tabs/public/tab_interface.h"
#include "ui/gfx/animation/animation_delegate.h"
#include "ui/gfx/animation/slide_animation.h"
class PrefService;
namespace user_prefs { class PrefRegistrySyncable; }
namespace aux {
class AuxNewChatView;
class AuxSectionClipView;
// Original region+5c8 derived AsideSectionView owns actual NewChat container,
// clipped row list, expansion preference and reversible animation.
class AuxChatsSection final : public AuxSectionView,
                              public gfx::AnimationDelegate {
  METADATA_HEADER(AuxChatsSection, AuxSectionView)
 public:
  struct Actions {
    base::RepeatingClosure new_chat;
    AuxChatRow::Action selected;
    AuxChatRow::Action rename;
    AuxChatRow::Action archive;
    AuxChatRow::Context context;
    base::RepeatingClosure all_chats;
    base::RepeatingCallback<void(views::View*)> section_context;
  };
  static void RegisterPrefs(user_prefs::PrefRegistrySyncable* registry);
  AuxChatsSection(PrefService& prefs, Actions actions,
                  std::u16string shortcut_help);
  ~AuxChatsSection() override;
  void SetChats(const std::vector<Chat>& chats);
  void SetSelectedChat(std::optional<std::string> id);
  void SetNewChatRepresentedTab(std::optional<tabs::TabHandle> tab, bool active);
  void PauseProfileObservation();
  void BindProfilePrefs(PrefService& prefs);
  bool expanded() const { return expanded_; }
 private:
  void Toggle();
  void PreferenceChanged();
  void ApplyHeight();
  void ShowSectionContext();
  void AnimationProgressed(const gfx::Animation*) override;
  void AnimationEnded(const gfx::Animation*) override;
  void AnimationCanceled(const gfx::Animation*) override;
  Actions actions_;
  raw_ptr<PrefService> prefs_ = nullptr;
  PrefChangeRegistrar pref_observer_;
  raw_ptr<AuxNewChatView> new_chat_ = nullptr;
  raw_ptr<views::View> rows_view_ = nullptr;
  raw_ptr<AuxSectionClipView> clip_ = nullptr;
  std::vector<Chat> chats_;
  std::vector<raw_ptr<AuxChatRow>> rows_;
  std::optional<std::string> selected_id_;
  bool expanded_ = true;
  gfx::SlideAnimation animation_{this};
};
}  // namespace aux
#endif
