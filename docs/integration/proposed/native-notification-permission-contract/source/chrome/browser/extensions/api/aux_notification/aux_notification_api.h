// Copyright 2026 Aux Authors. All rights reserved.
#ifndef CHROME_BROWSER_EXTENSIONS_API_AUX_NOTIFICATION_AUX_NOTIFICATION_API_H_
#define CHROME_BROWSER_EXTENSIONS_API_AUX_NOTIFICATION_AUX_NOTIFICATION_API_H_
#include "chrome/browser/extensions/api/aux_common/aux_api.h"
namespace extensions {
class AuxNotificationFunction : public AuxFunction {
 protected:
  ~AuxNotificationFunction() override = default;
  ResponseAction RunAux() override;
};
class AuxNotificationRequestPermissionFunction final
    : public AuxNotificationFunction {
 public:
  DECLARE_EXTENSION_FUNCTION("auxNotification.requestPermission",
                             AUXNOTIFICATION_REQUESTPERMISSION)
 protected:
  ~AuxNotificationRequestPermissionFunction() override = default;
};
class AuxNotificationRevokePermissionFunction final
    : public AuxNotificationFunction {
 public:
  DECLARE_EXTENSION_FUNCTION("auxNotification.revokePermission",
                             AUXNOTIFICATION_REVOKEPERMISSION)
 protected:
  ~AuxNotificationRevokePermissionFunction() override = default;
};
}  // namespace extensions
#endif
