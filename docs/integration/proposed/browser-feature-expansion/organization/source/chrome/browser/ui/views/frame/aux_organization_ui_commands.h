// Copyright 2026 Aux Authors. BSD-style license: see //LICENSE.
#ifndef CHROME_BROWSER_UI_VIEWS_FRAME_AUX_ORGANIZATION_UI_COMMANDS_H_
#define CHROME_BROWSER_UI_VIEWS_FRAME_AUX_ORGANIZATION_UI_COMMANDS_H_
#include <optional>
#include <string>
#include "base/functional/callback.h"
#include "base/memory/weak_ptr.h"
#include "chrome/browser/aux/organization/organization_service.h"
class BrowserWindowInterface;
namespace views { class View; }
namespace aux {
std::optional<organization::Context> CaptureOrganizationContext(BrowserWindowInterface&);
void ExecuteOrganizationCommand(base::WeakPtr<BrowserWindowInterface>,
    organization::Context, organization::Command, organization::OrganizationService::Reply);
// Same native DialogModel pattern as supplied Bookmark/Chat edit dialogs.
void ShowOrganizationNameDialog(views::View& anchor, std::u16string title,
    std::u16string name, std::optional<std::u16string> icon,
    base::OnceCallback<void(std::u16string, std::u16string)> accept);
std::u16string OrganizationErrorMessage(organization::Error error);
}  // namespace aux
#endif
