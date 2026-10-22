// Copyright 2026 The Aux Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
#include "chrome/browser/ui/views/frame/aux_profile_page_indicator.h"

#include <algorithm>
#include <memory>
#include <utility>

#include "base/check.h"
#include "base/functional/bind.h"
#include "base/strings/string_number_conversions.h"
#include "base/strings/utf_string_conversions.h"
#include "base/task/thread_pool.h"
#include "chrome/browser/aux/account_profile_prefs.h"
#include "chrome/browser/aux/component_bootstrap.h"
#include "chrome/browser/aux/installation_auth.h"
#include "chrome/browser/browser_process.h"
#include "chrome/browser/profiles/profile.h"
#include "chrome/browser/profiles/profile_attributes_entry.h"
#include "chrome/browser/profiles/profile_attributes_storage.h"
#include "chrome/browser/profiles/profile_manager.h"
#include "chrome/browser/ui/views/frame/aux_profile_switch_owner.h"
#include "chrome/browser/ui/views/frame/browser_view.h"
#include "chrome/browser/ui/views/profiles/aux_profile_display_label.h"
#include "chrome/browser/ui/views/profiles/aux_profile_indicator_icon.h"
#include "components/prefs/pref_service.h"
#include "extensions/browser/extension_registry.h"
#include "extensions/common/extension.h"
#include "ui/base/metadata/metadata_impl_macros.h"
#include "ui/compositor/layer.h"
#include "ui/views/accessibility/view_accessibility.h"
#include "ui/views/layout/box_layout.h"

namespace aux {
ProfilePageIndicator::ProfilePageIndicator(
    BrowserView& browser_view,
    SelectProfile select,
    ShowProfileContext context,
    base::RepeatingCallback<bool()> preview_idle)
    : browser_view_(browser_view),
      select_(std::move(select)),
      context_(std::move(context)),
      preview_idle_(std::move(preview_idle)),
      drag_(*this,
            paths_,
            buttons_,
            base::BindRepeating(&ProfilePageIndicator::Refresh,
                                base::Unretained(this))) {
  CHECK(select_);
  CHECK(context_);
  CHECK(preview_idle_);
  auto* layout = SetLayoutManager(std::make_unique<views::BoxLayout>(
      views::BoxLayout::Orientation::kHorizontal));
  layout->set_main_axis_alignment(views::BoxLayout::MainAxisAlignment::kCenter);
  SetPreferredSize(gfx::Size(0, 24));
  SetPaintToLayer();
  layer()->SetFillsBoundsOpaquely(false);
  RefreshAccountMetadata();
}

ProfilePageIndicator::~ProfilePageIndicator() {
  Retire();
}

const std::vector<base::FilePath>& ProfilePageIndicator::Roster() {
  auto* profile = browser_view_->GetProfile();
  if (!profile || profile->IsOffTheRecord()) {
    roster_.clear();
    roster_valid_ = true;
    return roster_;
  }
  if (roster_valid_ && !preview_idle_.Run()) {
    return roster_;
  }
  roster_.clear();
  auto* manager =
      g_browser_process ? g_browser_process->profile_manager() : nullptr;
  auto* state = g_browser_process ? g_browser_process->local_state() : nullptr;
  if (manager && state) {
    auto& storage = manager->GetProfileAttributesStorage();
    roster_ = HorizontalProfileOrder(storage, *state);
    std::erase_if(roster_, [&storage](const base::FilePath& path) {
      auto* entry = storage.GetProfileAttributesWithPath(path);
      return !entry || entry->IsOmitted();
    });
  }
  roster_valid_ = true;
  return roster_;
}

void ProfilePageIndicator::SetPresentation(
    bool collapsed,
    std::optional<bool> held_visibility) {
  presentation_collapsed_ = collapsed;
  held_visibility_ = held_visibility;
  Refresh();
}

void ProfilePageIndicator::Refresh() {
  if (drag_.DeferUpdate()) {
    return;
  }
  BindRegistry();
  auto* profile = browser_view_->GetProfile();
  auto* manager =
      g_browser_process ? g_browser_process->profile_manager() : nullptr;
  const auto& roster = Roster();
  if (!profile || !manager || roster.size() <= 1) {
    SetVisible(held_visibility_.value_or(false));
    return;
  }
  const auto current_path = profile->GetOriginalProfile()->GetPath();
  auto& storage = manager->GetProfileAttributesStorage();
  if (paths_ != roster || buttons_.size() != roster.size()) {
    drag_.Retire();
    RemoveAllChildViews();
    buttons_.clear();
    paths_ = roster;
    for (const auto& path : paths_) {
      auto button = std::make_unique<ProfilePageIndicatorDotButton>(
          base::BindRepeating(&ProfilePageIndicator::SelectPath,
                              weak_factory_.GetWeakPtr(), path),
          base::BindRepeating(&ProfilePageIndicator::ShowContext,
                              weak_factory_.GetWeakPtr(), path),
          base::BindRepeating(&ProfilePagerDrag::Start,
                              base::Unretained(&drag_)),
          base::BindRepeating(&ProfilePagerDrag::Update,
                              base::Unretained(&drag_)),
          base::BindRepeating(&ProfilePagerDrag::End,
                              base::Unretained(&drag_)));
      buttons_.push_back(AddChildView(std::move(button)));
    }
    InvalidateLayout();
  }
  for (size_t index = 0; index < paths_.size(); ++index) {
    const auto& path = paths_[index];
    auto* entry = storage.GetProfileAttributesWithPath(path);
    auto* loaded = manager->GetProfileByPath(path);
    const auto label = ProfileDisplayLabel(entry, loaded, paths_.size());
    std::u16string tooltip = label;
    if (agent_installed_) {
      std::string email;
      if (loaded && !loaded->IsOffTheRecord()) {
        auto* prefs = loaded->GetOriginalProfile()->GetPrefs();
        if (HasAccountProfileSession(prefs) &&
            prefs->FindPreference("aux.account_email")) {
          email = prefs->GetString("aux.account_email");
        }
      }
      if (email.empty()) {
        const auto cached = account_emails_.find(path);
        if (cached != account_emails_.end()) {
          email = cached->second;
        }
      }
      const auto username = email.empty() && entry ? entry->GetUserName()
                                                   : base::UTF8ToUTF16(email);
      if (!username.empty()) {
        tooltip += u"\n" + username;
      }
    }
    if (index < 9) {
      // U+001F is the original tooltip shortcut-column separator.
      tooltip += u"\x1f\u2303" + base::NumberToString16(index + 1);
    }
    auto* button = buttons_[index].get();
    button->SetCurrent(path == current_path);
    button->SetProfileIcon(ProfileIndicatorIcon(entry));
    button->SetTooltipText(tooltip);
    button->GetViewAccessibility().SetName(u"Switch to " + label);
    if (index < 9) {
      button->GetViewAccessibility().SetKeyShortcuts(
          "Control+" + base::NumberToString(index + 1));
    } else {
      button->GetViewAccessibility().RemoveKeyShortcuts();
    }
  }
  SetVisible(held_visibility_.value_or(!presentation_collapsed_));
}

void ProfilePageIndicator::RefreshAccountMetadata() {
  if (metadata_running_) {
    metadata_pending_ = true;
    return;
  }
  metadata_running_ = true;
  base::ThreadPool::PostTaskAndReplyWithResult(
      FROM_HERE, {base::MayBlock(), base::TaskPriority::USER_VISIBLE},
      base::BindOnce([] { return ReadProfileAccountEmails(StateHome()); }),
      base::BindOnce(&ProfilePageIndicator::AccountMetadataReady,
                     weak_factory_.GetWeakPtr()));
}

void ProfilePageIndicator::AccountMetadataReady(ProfileAccountEmails emails) {
  metadata_running_ = false;
  if (account_emails_ != emails) {
    account_emails_ = std::move(emails);
    Refresh();
  }
  if (std::exchange(metadata_pending_, false)) {
    RefreshAccountMetadata();
  }
}

void ProfilePageIndicator::SelectPath(const base::FilePath& path,
                                      const ui::Event& event) {
  auto* profile = browser_view_->GetProfile();
  if (!profile || path.empty() ||
      profile->GetOriginalProfile()->GetPath() == path) {
    return;
  }
  select_.Run(path);
}

void ProfilePageIndicator::ShowContext(const base::FilePath& path,
                                       ProfilePageIndicatorDotButton* button) {
  if (button && button->GetWidget() && !path.empty()) {
    context_.Run(button, path);
  }
}

void ProfilePageIndicator::BindRegistry() {
  auto* profile = browser_view_->GetProfile();
  auto* registry =
      profile ? extensions::ExtensionRegistry::Get(profile) : nullptr;
  if (registry_observation_.IsObservingSource(registry)) {
    return;
  }
  registry_observation_.Reset();
  agent_installed_ = registry && registry->GetExtensionById(
                                     kAgentExtensionId,
                                     extensions::ExtensionRegistry::EVERYTHING);
  if (registry) {
    registry_observation_.Observe(registry);
  }
}

void ProfilePageIndicator::SetAgentInstalled(
    const extensions::Extension* extension,
    bool installed) {
  if (extension && extension->id() == kAgentExtensionId) {
    agent_installed_ = installed;
    Refresh();
    RefreshAccountMetadata();
  }
}

void ProfilePageIndicator::OnExtensionLoaded(
    content::BrowserContext* context,
    const extensions::Extension* extension) {
  SetAgentInstalled(extension, true);
}
void ProfilePageIndicator::OnExtensionInstalled(
    content::BrowserContext* context,
    const extensions::Extension* extension,
    bool is_update) {
  SetAgentInstalled(extension, true);
}
void ProfilePageIndicator::OnExtensionUnloaded(
    content::BrowserContext* context,
    const extensions::Extension* extension,
    extensions::UnloadedExtensionReason reason) {
  SetAgentInstalled(extension, false);
}
void ProfilePageIndicator::OnExtensionUninstalled(
    content::BrowserContext* context,
    const extensions::Extension* extension,
    extensions::UninstallReason reason) {
  SetAgentInstalled(extension, false);
}
void ProfilePageIndicator::OnShutdown(extensions::ExtensionRegistry* registry) {
  registry_observation_.Reset();
  agent_installed_ = false;
}

void ProfilePageIndicator::Retire() {
  registry_observation_.Reset();
  agent_installed_ = false;
  drag_.Retire();
  roster_.clear();
  roster_valid_ = false;
}

BEGIN_METADATA(ProfilePageIndicator)
END_METADATA
}  // namespace aux
