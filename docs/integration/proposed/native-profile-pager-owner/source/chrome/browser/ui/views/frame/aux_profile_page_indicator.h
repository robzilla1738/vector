// Copyright 2026 The Aux Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
#ifndef CHROME_BROWSER_UI_VIEWS_FRAME_AUX_PROFILE_PAGE_INDICATOR_H_
#define CHROME_BROWSER_UI_VIEWS_FRAME_AUX_PROFILE_PAGE_INDICATOR_H_

#include <optional>
#include <string>
#include <vector>

#include "base/files/file_path.h"
#include "base/functional/callback.h"
#include "base/memory/raw_ref.h"
#include "base/memory/weak_ptr.h"
#include "base/scoped_observation.h"
#include "chrome/browser/aux/profile_account_metadata.h"
#include "chrome/browser/ui/views/frame/aux_profile_pager_drag.h"
#include "extensions/browser/extension_registry.h"
#include "extensions/browser/extension_registry_observer.h"
#include "ui/views/view.h"

class BrowserView;
namespace aux {
// Original region+5e0, owned real pager. These callbacks bind the genuine
// preview input, profile-menu coordinator and async registry-metadata cache.
class ProfilePageIndicator : public views::View,
                             public extensions::ExtensionRegistryObserver {
  METADATA_HEADER(ProfilePageIndicator, views::View)

 public:
  using SelectProfile = base::RepeatingCallback<bool(const base::FilePath&)>;
  using ShowProfileContext =
      base::RepeatingCallback<void(views::View*, const base::FilePath&)>;
  ProfilePageIndicator(BrowserView& browser_view,
                       SelectProfile select,
                       ShowProfileContext context,
                       base::RepeatingCallback<bool()> preview_idle);
  ~ProfilePageIndicator() override;

  // Inputs are the real source151px presentation gate and held pager
  // visibility. They deliberately differ from the profile button's compact
  // presentation.
  void SetPresentation(bool collapsed, std::optional<bool> held_visibility);
  void Refresh();
  void RefreshAccountMetadata();
  void Retire();
  void OnExtensionLoaded(content::BrowserContext* context,
                         const extensions::Extension* extension) override;
  void OnExtensionInstalled(content::BrowserContext* context,
                            const extensions::Extension* extension,
                            bool is_update) override;
  void OnExtensionUnloaded(content::BrowserContext* context,
                           const extensions::Extension* extension,
                           extensions::UnloadedExtensionReason reason) override;
  void OnExtensionUninstalled(content::BrowserContext* context,
                              const extensions::Extension* extension,
                              extensions::UninstallReason reason) override;
  void OnShutdown(extensions::ExtensionRegistry* registry) override;

 private:
  const std::vector<base::FilePath>& Roster();
  void BindRegistry();
  void SetAgentInstalled(const extensions::Extension* extension,
                         bool installed);
  void AccountMetadataReady(ProfileAccountEmails emails);
  void SelectPath(const base::FilePath& path, const ui::Event& event);
  void ShowContext(const base::FilePath& path,
                   ProfilePageIndicatorDotButton* button);

  const raw_ref<BrowserView> browser_view_;
  const SelectProfile select_;
  const ShowProfileContext context_;
  const base::RepeatingCallback<bool()> preview_idle_;
  ProfileAccountEmails account_emails_;
  bool metadata_running_ = false;
  bool metadata_pending_ = false;
  std::vector<base::FilePath> roster_;
  std::vector<base::FilePath> paths_;
  std::vector<raw_ptr<ProfilePageIndicatorDotButton>> buttons_;
  bool roster_valid_ = false;
  bool agent_installed_ = false;
  base::ScopedObservation<extensions::ExtensionRegistry,
                          extensions::ExtensionRegistryObserver>
      registry_observation_{this};
  bool presentation_collapsed_ = false;
  std::optional<bool> held_visibility_;
  ProfilePagerDrag drag_;
  base::WeakPtrFactory<ProfilePageIndicator> weak_factory_{this};
};
}  // namespace aux
#endif  // CHROME_BROWSER_UI_VIEWS_FRAME_AUX_PROFILE_PAGE_INDICATOR_H_
