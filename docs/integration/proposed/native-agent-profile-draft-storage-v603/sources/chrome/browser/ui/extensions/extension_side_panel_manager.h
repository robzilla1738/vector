// Copyright 2022 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

#ifndef CHROME_BROWSER_UI_EXTENSIONS_EXTENSION_SIDE_PANEL_MANAGER_H_
#define CHROME_BROWSER_UI_EXTENSIONS_EXTENSION_SIDE_PANEL_MANAGER_H_

#include <optional>
#include <vector>
#include "base/memory/weak_ptr.h"
#include "base/scoped_multi_source_observation.h"
#include "chrome/browser/profiles/profile_observer.h"
#include "content/public/browser/session_storage_namespace_handle.h"

#include "base/containers/flat_map.h"
#include "base/memory/raw_ptr.h"
#include "base/scoped_observation.h"
#include "build/build_config.h"
#include "chrome/browser/buildflags.h"
#include "chrome/browser/ui/extensions/extension_side_panel_coordinator.h"
#include "extensions/browser/extension_registry.h"
#include "extensions/browser/extension_registry_observer.h"
#include "extensions/common/extension_id.h"
#include "ui/base/unowned_user_data/scoped_unowned_user_data.h"

class BrowserWindowInterface;
class Profile;
class SidePanelRegistry;

namespace content {
class BrowserContext;
}

namespace tabs {
class TabInterface;
}

namespace extensions {

class Extension;

// ExtensionSidePanelManager manages ExtensionSidePanelCoordinators for all
// extensions that can display side panel content in a map and updates the map
// when extensions are loaded or unloaded. Registration of an extension's
// SidePanelEntry and creating the view to be shown are delegated to each
// extension's ExtensionSidePanelCoordinator.
class ExtensionSidePanelManager : public ExtensionRegistryObserver,
                                  public ProfileObserver {
 public:
  DECLARE_USER_DATA(ExtensionSidePanelManager);

  ExtensionSidePanelManager(BrowserWindowInterface* browser,
                            SidePanelRegistry* registry);
  ExtensionSidePanelManager(Profile* profile,
                            tabs::TabInterface* tab_interface,
                            SidePanelRegistry* tab_registry);

  ExtensionSidePanelManager(const ExtensionSidePanelManager&) = delete;
  ExtensionSidePanelManager& operator=(const ExtensionSidePanelManager&) =
      delete;
  ~ExtensionSidePanelManager() override;

  // Returns the window-scoped manager for `browser`, or null if there is
  // none. Tab-scoped instances are not registered and are not returned here.
  static ExtensionSidePanelManager* From(BrowserWindowInterface* browser);

  ExtensionSidePanelCoordinator* GetExtensionCoordinatorForTesting(
      const ExtensionId& extension_id);

  // Called when the BrowserView for `browser_` is being created. Creates
  // ExtensionSidePanelCoordinators (which in turn, registers extension
  // SidePanelEntries) for all enabled extensions that are capable of hosting
  // side panel content.
  void RegisterExtensionEntries();

#if BUILDFLAG(ENABLE_AUX_BROWSER) && BUILDFLAG(IS_MAC)
  // Retires only this window's extension entries before changing its profile.
  // Keeps this manager, the registry and unowned user-data registration alive.
  void PrepareForAuxProfileSwitch();
  // Requires the committed target profile and an empty tab model. Registers
  // real target-profile entries without opening or navigating their views.
  void RebindForAuxProfileSwitch(Profile* target_profile);
  // Only before identity commits, after the real source tabs are restored.
  void AbortForAuxProfileSwitch(Profile* source_profile);
  content::SessionStorageNamespaceHandleMap TakeAuxAgentSessionStorage(
      const Extension& extension, const GURL& url);
  void OnProfileWillBeDestroyed(Profile* profile) override;
#endif

  // ExtensionRegistryObserver implementation.
  void OnExtensionLoaded(content::BrowserContext* browser_context,
                         const Extension* extension) override;
  void OnExtensionUnloaded(content::BrowserContext* browser_context,
                           const Extension* extension,
                           UnloadedExtensionReason reason) override;

 private:
#if BUILDFLAG(ENABLE_AUX_BROWSER) && BUILDFLAG(IS_MAC)
  void RebuildForAuxProfileSwitch(Profile* target_profile);
#endif

  // Creates an ExtensionSidePanelCoordinator for `extension` and adds it to
  // `coordinators_` if the extension is capable of hosting side panel content.
  void MaybeCreateExtensionSidePanelCoordinator(const Extension* extension);

  // The profile associated with either `browser_` or `web_contents_`.
  raw_ptr<Profile> profile_;

  // The browser or tab that this class is associated with. Only one of
  // `browser_` or `tab_interface_` should be defined.
  raw_ptr<BrowserWindowInterface> browser_;
  raw_ptr<tabs::TabInterface> tab_interface_;

  // The SidePanelRegistry that lives in the same user data that an instance of
  // this class lives in. Owns all extension entries managed by `coordinators_`.
  raw_ptr<SidePanelRegistry> registry_;

  base::flat_map<ExtensionId, std::unique_ptr<ExtensionSidePanelCoordinator>>
      coordinators_;

#if BUILDFLAG(ENABLE_AUX_BROWSER) && BUILDFLAG(IS_MAC)
  struct AuxAgentStorage {
    base::WeakPtr<Profile> profile;
    scoped_refptr<const Extension> extension;
    GURL url;
    content::SessionStorageNamespaceHandleMap namespaces;
  };
  std::vector<AuxAgentStorage> aux_agent_storage_;
  base::ScopedMultiSourceObservation<Profile, ProfileObserver>
      aux_storage_profiles_{this};
  raw_ptr<Profile> aux_switch_source_profile_ = nullptr;
  bool aux_profile_switch_prepared_ = false;
#endif

  // Whether this class is tab-scoped or window-scoped.
  const bool for_tab_;

  base::ScopedObservation<ExtensionRegistry, ExtensionRegistryObserver>
      extension_registry_observation_{this};

  // Only set for the window-scoped instance; tab-scoped instances are reached
  // through TabFeatures instead.
  std::optional<ui::ScopedUnownedUserData<ExtensionSidePanelManager>>
      scoped_unowned_user_data_;
};

}  // namespace extensions

#endif  // CHROME_BROWSER_UI_EXTENSIONS_EXTENSION_SIDE_PANEL_MANAGER_H_
