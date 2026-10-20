// Copyright 2026 Aux Authors. BSD-style license: see //LICENSE.
#ifndef CHROME_BROWSER_NOTIFICATIONS_AUX_NOTIFICATION_INBOX_H_
#define CHROME_BROWSER_NOTIFICATIONS_AUX_NOTIFICATION_INBOX_H_

#include <map>
#include <set>
#include <optional>
#include <string>
#include "base/files/file_path.h"
#include "base/memory/weak_ptr.h"
#include "base/values.h"
#include "components/prefs/pref_change_registrar.h"
#include "third_party/skia/include/core/SkBitmap.h"

class Profile;
class GURL;
class ContentSettingsPattern;
namespace blink { struct PlatformNotificationData; }

namespace aux {
// Profile-owned original inbox path. The storage task owns only immutable
// values; replies cannot dispatch after the profile service shuts down.
class NotificationInbox {
 public:
  explicit NotificationInbox(Profile& profile);
  ~NotificationInbox();
  void SaveAndDispatch(const std::string& notification_id, const GURL& origin,
      const GURL& context_url, const blink::PlatformNotificationData& data,
      const SkBitmap& image, bool persistent);
  bool IsAiOnly(const GURL& origin) const;
  void Shutdown();
  void OnContentSettingChanged(const ContentSettingsPattern& primary,
                               const ContentSettingsPattern& secondary);

 private:
  struct SaveResult {
    int64_t entry_id = 0;
    bool success = false;
    std::optional<std::string> image_base64;
  };
  static SaveResult Save(const base::FilePath& profile_path,
      base::DictValue payload, SkBitmap image, bool persistent);
  void DidSave(base::DictValue payload, SaveResult result);
  std::set<std::string> CollectPermissionOrigins() const;
  std::string ReadPermission(const GURL& origin) const;
  void OnDeliveryModesChanged();
  void RefreshPermissionOrigins(const std::set<std::string>& origins,
                                const char* source);
  base::WeakPtr<Profile> profile_;
  PrefChangeRegistrar permission_prefs_;
  std::map<std::string, std::string> permission_snapshot_;
  base::WeakPtrFactory<NotificationInbox> weak_{this};
};
}  // namespace aux
#endif
