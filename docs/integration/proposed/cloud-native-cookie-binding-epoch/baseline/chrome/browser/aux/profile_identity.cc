// Copyright 2026 Aux Authors. All rights reserved.
#include "chrome/browser/aux/profile_identity.h"
#include "base/uuid.h"
#include "chrome/browser/browser_process.h"
#include "chrome/browser/profiles/profile.h"
#include "chrome/browser/profiles/profile_attributes_entry.h"
#include "chrome/browser/profiles/profile_attributes_storage.h"
#include "chrome/browser/profiles/profile_manager.h"
#include "components/prefs/pref_service.h"
#include "content/public/browser/browser_thread.h"
namespace aux {
std::string GetProfileId(Profile* profile) {
  DCHECK_CURRENTLY_ON(content::BrowserThread::UI);
  if (!profile) return {};
  auto* prefs = profile->GetOriginalProfile()->GetPrefs();
  if (!prefs) return {};
  const bool registered = prefs->FindPreference("aside.profile_id") != nullptr;
  auto id = registered ? prefs->GetString("aside.profile_id") : std::string();
  if (id.empty()) {
    id = base::Uuid::GenerateRandomV4().AsLowercaseString();
    if (registered) prefs->SetString("aside.profile_id", id);
  }
  return id;
}
std::string GetLoadedProfileIdForPath(const base::FilePath& path) {
  DCHECK_CURRENTLY_ON(content::BrowserThread::UI);
  auto* manager = g_browser_process ? g_browser_process->profile_manager() : nullptr;
  return manager ? GetProfileId(manager->GetProfileByPath(path)) : std::string();
}
std::optional<int> GetProfileIndex(Profile* profile) {
  DCHECK_CURRENTLY_ON(content::BrowserThread::UI);
  auto* manager = g_browser_process ? g_browser_process->profile_manager() : nullptr;
  if (!profile || profile->IsOffTheRecord() || !manager) return std::nullopt;
  int index = 0;
  for (auto* entry : manager->GetProfileAttributesStorage()
                          .GetAllProfilesAttributesSortedForDisplay()) {
    if (entry->GetPath() == profile->GetPath()) return index;
    ++index;
  }
  return std::nullopt;
}
}  // namespace aux
