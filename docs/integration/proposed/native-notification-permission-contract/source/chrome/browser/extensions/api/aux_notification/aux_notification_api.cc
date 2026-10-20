// Copyright 2026 Aux Authors. All rights reserved.
#include "chrome/browser/extensions/api/aux_notification/aux_notification_api.h"

#include <string_view>
#include <utility>

#include "chrome/browser/extensions/extension_tab_util.h"
#include "chrome/browser/notifications/notification_permission_context.h"
#include "chrome/browser/profiles/profile.h"
#include "components/prefs/pref_service.h"
#include "content/public/browser/web_contents.h"
#include "url/gurl.h"

namespace extensions {
namespace {
constexpr char kAiDeliveryModeByOrigin[] =
    "persistent_notifications.ai_delivery_mode_by_origin";
}  // namespace

ExtensionFunction::ResponseAction AuxNotificationFunction::RunAux() {
  if (args().size() != 1) {
    return RespondNow(Error("One permission target is required"));
  }
  if (std::string_view(name()) == "auxNotification.revokePermission") {
    if (!args()[0].is_string()) {
      return RespondNow(Error("Origin string required"));
    }
    const GURL url(args()[0].GetString());
    if (!url.is_valid() || !url.SchemeIsHTTPOrHTTPS()) {
      return RespondNow(Error("Invalid origin for revokePermission"));
    }
    const GURL origin = url.DeprecatedGetOriginAsURL();
    NotificationPermissionContext::UpdatePermission(
        profile(), origin, CONTENT_SETTING_DEFAULT);
    auto* prefs = profile()->GetPrefs();
    auto delivery_modes = prefs->GetDict(kAiDeliveryModeByOrigin).Clone();
    if (delivery_modes.Remove(origin.spec())) {
      prefs->SetDict(kAiDeliveryModeByOrigin, std::move(delivery_modes));
    }
    return RespondNow(WithArguments(true));
  }
  if (!args()[0].is_int()) {
    return RespondNow(Error("Tab identity required"));
  }
  content::WebContents* tab = nullptr;
  if (!ExtensionTabUtil::GetTabById(args()[0].GetInt(), browser_context(),
                                   include_incognito_information(), &tab) ||
      !tab) {
    return RespondNow(Error("Invalid tabId for requestPermission"));
  }
  const GURL& url = tab->GetLastCommittedURL();
  if (!url.is_valid() || !url.SchemeIsHTTPOrHTTPS()) {
    return RespondNow(
        Error("Tab URL is not eligible for notification permission"));
  }
  const GURL origin = url.DeprecatedGetOriginAsURL();
  auto* prefs = profile()->GetPrefs();
  auto delivery_modes = prefs->GetDict(kAiDeliveryModeByOrigin).Clone();
  delivery_modes.Set(origin.spec(), 1);
  prefs->SetDict(kAiDeliveryModeByOrigin, std::move(delivery_modes));
  NotificationPermissionContext::UpdatePermission(profile(), origin,
                                                 CONTENT_SETTING_ALLOW);
  return RespondNow(WithArguments(true));
}
}  // namespace extensions
