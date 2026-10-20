// Copyright 2026 Aux Authors. BSD-3-Clause; see //LICENSE.
#include "chrome/browser/extensions/api/aux_browser_import/extension_import.h"

#include <set>
#include <string>
#include <utility>

#include "base/functional/bind.h"
#include "base/memory/raw_ptr.h"
#include "base/scoped_observation.h"
#include "base/task/single_thread_task_runner.h"
#include "chrome/browser/profiles/profile.h"
#include "extensions/browser/extension_prefs.h"
#include "extensions/browser/extension_registrar.h"
#include "extensions/browser/extension_registry.h"
#include "extensions/browser/extension_registry_observer.h"
#include "extensions/browser/extensions_browser_client.h"
#include "extensions/browser/pending_extension_manager.h"
#include "extensions/browser/disable_reason.h"
#include "extensions/common/extension.h"
#include "url/gurl.h"

namespace aux_import {
namespace {
// Supplied04258108 and0425f2c0: only accepted pending IDs are observed. The
// observer owns itself until every imported extension is ready or shutdown.
class ImportedExtensionObserver final
    : public extensions::ExtensionRegistryObserver {
 public:
  ImportedExtensionObserver(Profile* profile, std::set<std::string> pending)
      : profile_(profile), pending_(std::move(pending)) {
    observation_.Observe(extensions::ExtensionRegistry::Get(profile));
  }

  void OnExtensionReady(content::BrowserContext* context,
                        const extensions::Extension* extension) override {
    if (context != profile_ || !extension ||
        !pending_.contains(extension->id())) {
      return;
    }
    if (auto* registrar = extensions::ExtensionRegistrar::Get(context)) {
      base::SingleThreadTaskRunner::GetCurrentDefault()->PostTask(
          FROM_HERE,
          base::BindOnce(&extensions::ExtensionRegistrar::ReloadExtension,
                         registrar->GetWeakPtr(), extension->id()));
    }
    pending_.erase(extension->id());
    if (pending_.empty()) {
      delete this;
    }
  }

  void OnExtensionInstalled(content::BrowserContext* context,
                            const extensions::Extension* extension,
                            bool is_update) override {
    if (context != profile_ || !extension ||
        !pending_.contains(extension->id())) {
      return;
    }
    auto* prefs = extensions::ExtensionPrefs::Get(context);
    if (prefs && prefs->HasDisableReason(
                     extension->id(),
                     extensions::disable_reason::DISABLE_PERMISSIONS_INCREASE)) {
      if (auto* registrar = extensions::ExtensionRegistrar::Get(context)) {
        registrar->GrantPermissionsAndEnableExtension(*extension);
      }
    }
  }

  void OnShutdown(extensions::ExtensionRegistry* registry) override {
    delete this;
  }

 private:
  ~ImportedExtensionObserver() override = default;
  raw_ptr<Profile> profile_;
  std::set<std::string> pending_;
  base::ScopedObservation<extensions::ExtensionRegistry,
                          extensions::ExtensionRegistryObserver>
      observation_{this};
};
}  // namespace

void InstallChromiumExtensions(Profile* profile,
                               const base::ListValue& imports) {
  auto* manager = extensions::PendingExtensionManager::Get(profile);
  if (!manager) {
    return;
  }
  std::set<std::string> pending;
  for (const auto& value : imports) {
    const auto* row = value.GetIfDict();
    const auto* id = row ? row->FindString("id") : nullptr;
    const auto* update_url = row ? row->FindString("updateUrl") : nullptr;
    if (id && update_url && manager->AddFromExtensionImport(
                               *id, GURL(*update_url),
                               [](const extensions::Extension*) { return true; })) {
      pending.insert(*id);
    }
  }
  if (!pending.empty()) {
    new ImportedExtensionObserver(profile, std::move(pending));
    extensions::ExtensionsBrowserClient::Get()->UpdateCheckIfEnabled(profile);
  }
}
}  // namespace aux_import
