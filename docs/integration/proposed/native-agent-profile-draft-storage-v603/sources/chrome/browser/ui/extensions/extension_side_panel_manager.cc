// Copyright 2022 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

#include "chrome/browser/ui/extensions/extension_side_panel_manager.h"

#include <memory>

#include "base/check.h"
#include "base/check_op.h"

#include "chrome/browser/profiles/profile.h"
#include "chrome/browser/ui/browser_window/public/browser_window_interface.h"
#include "chrome/browser/ui/extensions/extension_side_panel_coordinator.h"
#include "content/public/browser/browser_context.h"
#include "content/public/browser/web_contents.h"
#if BUILDFLAG(ENABLE_AUX_BROWSER) && BUILDFLAG(IS_MAC)
#include "chrome/browser/ui/side_panel/side_panel_registry.h"
#include "chrome/browser/aux/component_bootstrap.h"
#include "chrome/browser/extensions/extension_view_host.h"
#include "content/public/browser/navigation_controller.h"
#include <algorithm>
#include "chrome/browser/ui/tabs/tab_strip_model.h"
#endif
#include "extensions/browser/extension_registry.h"
#include "extensions/common/extension.h"
#include "extensions/common/permissions/api_permission.h"
#include "extensions/common/permissions/permissions_data.h"

namespace extensions {

DEFINE_USER_DATA(ExtensionSidePanelManager);

ExtensionSidePanelManager::ExtensionSidePanelManager(
    BrowserWindowInterface* browser,
    SidePanelRegistry* registry)
    : profile_(browser->GetProfile()),
      browser_(browser),
      tab_interface_(nullptr),
      registry_(registry),
      for_tab_(false),
      scoped_unowned_user_data_(std::in_place,
                                browser->GetUnownedUserDataHost(),
                                *this) {
  RegisterExtensionEntries();
}

ExtensionSidePanelManager::ExtensionSidePanelManager(
    Profile* profile,
    tabs::TabInterface* tab_interface,
    SidePanelRegistry* tab_registry)
    : profile_(profile),
      browser_(nullptr),
      tab_interface_(tab_interface),
      registry_(tab_registry),
      for_tab_(true) {
  RegisterExtensionEntries();
}

ExtensionSidePanelManager::~ExtensionSidePanelManager() = default;

// static
ExtensionSidePanelManager* ExtensionSidePanelManager::From(
    BrowserWindowInterface* browser) {
  return Get(browser->GetUnownedUserDataHost());
}

ExtensionSidePanelCoordinator*
ExtensionSidePanelManager::GetExtensionCoordinatorForTesting(
    const ExtensionId& extension_id) {
  auto it = coordinators_.find(extension_id);
  return (it == coordinators_.end()) ? nullptr : it->second.get();
}

#if BUILDFLAG(ENABLE_AUX_BROWSER) && BUILDFLAG(IS_MAC)
void ExtensionSidePanelManager::PrepareForAuxProfileSwitch() {
  CHECK(!for_tab_);
  CHECK_EQ(browser_->GetType(), BrowserWindowInterface::TYPE_NORMAL);
  CHECK(profile_->IsRegularProfile());
  CHECK_EQ(browser_->GetProfile(), profile_);
  CHECK_EQ(SidePanelRegistry::From(browser_), registry_);
  CHECK(!aux_profile_switch_prepared_);
  // Retain only the native namespace, never a live source-profile document or
  // its window delegates. Deregistration below destroys the sole old host.
  auto found = coordinators_.find(aux::kAgentExtensionId);
  if (found != coordinators_.end() && found->second->host()) {
    auto* host = found->second->host();
    std::erase_if(aux_agent_storage_, [this](const auto& entry) {
      return !entry.profile || entry.profile.get() == profile_;
    });
    aux_agent_storage_.push_back({profile_->GetWeakPtr(),
        scoped_refptr<const Extension>(found->second->extension()),
        host->initial_url(),
        host->host_contents()->GetController().GetSessionStorageNamespaceMap()});
    if (!aux_storage_profiles_.IsObservingSource(profile_))
      aux_storage_profiles_.AddObservation(profile_);
  }
  aux_switch_source_profile_ = browser_->GetProfile();
  aux_profile_switch_prepared_ = true;
  extension_registry_observation_.Reset();

  // Closing a panel dispatches extension events and may run UI observers.
  // Publish an empty manager first and stop all old service observations before
  // removing any entry. Each coordinator remains alive during deregistration.
  decltype(coordinators_) previous;
  previous.swap(coordinators_);
  for (auto& [id, coordinator] : previous) {
    coordinator->PrepareForAuxProfileSwitch();
  }
  for (auto& [id, coordinator] : previous) {
    // This synchronously closes a showing entry, clears its cached view/host,
    // and releases the old window action reference before profile identity moves.
    coordinator->DeregisterEntry();
  }
}

void ExtensionSidePanelManager::RebindForAuxProfileSwitch(Profile* target_profile) {
  CHECK(browser_->GetTabStripModel());
  CHECK(browser_->GetTabStripModel()->empty());
  RebuildForAuxProfileSwitch(target_profile);
}

void ExtensionSidePanelManager::AbortForAuxProfileSwitch(Profile* source_profile) {
  CHECK(aux_profile_switch_prepared_);
  CHECK(aux_switch_source_profile_);
  CHECK_EQ(source_profile, aux_switch_source_profile_);
  CHECK_EQ(browser_->GetProfile(), source_profile);
  auto* model = browser_->GetTabStripModel();
  CHECK(model);
  // Validate restored source collections, without pretending the model is empty
  // or allowing target-profile reconstruction on the rollback path.
  for (int i = 0; i < model->count(); ++i) {
    CHECK_EQ(model->GetWebContentsAt(i)->GetBrowserContext(), source_profile);
  }
  RebuildForAuxProfileSwitch(source_profile);
}

content::SessionStorageNamespaceHandleMap
ExtensionSidePanelManager::TakeAuxAgentSessionStorage(
    const Extension& extension, const GURL& url) {
  if (for_tab_ || aux_profile_switch_prepared_ ||
      browser_->GetProfile() != profile_ ||
      extension.id() != aux::kAgentExtensionId) return {};
  for (auto it = aux_agent_storage_.begin(); it != aux_agent_storage_.end(); ++it) {
    if (it->profile.get() != profile_) continue;
    content::SessionStorageNamespaceHandleMap result;
    // An unload/reload, option URL change, or different profile invalidates
    // reuse; Extension object identity detects even same-version reloads.
    if (it->extension.get() == &extension && it->url == url)
      result = std::move(it->namespaces);
    aux_agent_storage_.erase(it);
    if (aux_storage_profiles_.IsObservingSource(profile_))
      aux_storage_profiles_.RemoveObservation(profile_);
    return result;
  }
  return {};
}
void ExtensionSidePanelManager::OnProfileWillBeDestroyed(Profile* profile) {
  std::erase_if(aux_agent_storage_, [profile](const auto& entry) {
    return !entry.profile || entry.profile.get() == profile;
  });
  aux_storage_profiles_.RemoveObservation(profile);
}

void ExtensionSidePanelManager::RebuildForAuxProfileSwitch(Profile* target_profile) {
  CHECK(!for_tab_);
  CHECK(aux_profile_switch_prepared_);
  CHECK(!extension_registry_observation_.IsObserving());
  CHECK(coordinators_.empty());
  CHECK(target_profile);
  CHECK(target_profile->IsRegularProfile());
  CHECK_EQ(browser_->GetProfile(), target_profile);
  CHECK_EQ(SidePanelRegistry::From(browser_), registry_);
  CHECK(browser_->GetTabStripModel());
  profile_ = target_profile;
  RegisterExtensionEntries();
  aux_switch_source_profile_ = nullptr;
  aux_profile_switch_prepared_ = false;
}
#endif

void ExtensionSidePanelManager::RegisterExtensionEntries() {
  ExtensionRegistry* extension_registry = ExtensionRegistry::Get(profile_);
  extension_registry_observation_.Observe(extension_registry);

  for (const auto& extension : extension_registry->enabled_extensions()) {
    MaybeCreateExtensionSidePanelCoordinator(extension.get());
  }
}

void ExtensionSidePanelManager::OnExtensionLoaded(
    content::BrowserContext* browser_context,
    const Extension* extension) {
#if BUILDFLAG(ENABLE_AUX_BROWSER) && BUILDFLAG(IS_MAC)
  if (aux_profile_switch_prepared_ || browser_context != profile_) {
    return;
  }
#endif
  MaybeCreateExtensionSidePanelCoordinator(extension);
}

void ExtensionSidePanelManager::OnExtensionUnloaded(
    content::BrowserContext* browser_context,
    const Extension* extension,
    UnloadedExtensionReason reason) {
#if BUILDFLAG(ENABLE_AUX_BROWSER) && BUILDFLAG(IS_MAC)
  if (aux_profile_switch_prepared_ || browser_context != profile_) {
    return;
  }
#endif
  auto it = coordinators_.find(extension->id());
  if (it != coordinators_.end()) {
    it->second->DeregisterEntry();
    coordinators_.erase(extension->id());
  }
}

void ExtensionSidePanelManager::MaybeCreateExtensionSidePanelCoordinator(
    const Extension* extension) {
  if (extension->permissions_data()->HasAPIPermission(
          mojom::APIPermissionID::kSidePanel)) {
    coordinators_.emplace(extension->id(),
                          std::make_unique<ExtensionSidePanelCoordinator>(
                              profile_, browser_, tab_interface_, extension,
                              registry_, for_tab_));
  }
}

}  // namespace extensions
