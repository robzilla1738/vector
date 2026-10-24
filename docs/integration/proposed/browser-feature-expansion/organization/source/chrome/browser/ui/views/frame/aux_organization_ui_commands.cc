// Copyright 2026 Aux Authors. BSD-style license: see //LICENSE.
#include "chrome/browser/ui/views/frame/aux_organization_ui_commands.h"
#include <utility>
#include "base/functional/bind.h"
#include "base/functional/callback_helpers.h"
#include "base/strings/string_util.h"
#include "base/uuid.h"
#include "chrome/browser/aux/organization/organization_profile_service.h"
#include "chrome/browser/ui/browser_window/public/browser_window_interface.h"
#include "components/constrained_window/constrained_window_views.h"
#include "ui/base/interaction/element_identifier.h"
#include "ui/base/models/dialog_model.h"
#include "ui/base/models/dialog_model_field.h"
#include "ui/views/view.h"
#include "ui/views/widget/widget.h"
namespace aux {
namespace {
DEFINE_LOCAL_ELEMENT_IDENTIFIER_VALUE(kOrganizationName);
DEFINE_LOCAL_ELEMENT_IDENTIFIER_VALUE(kOrganizationIcon);
class NameDelegate final : public ui::DialogModelDelegate {
 public:
  NameDelegate(bool icon, base::OnceCallback<void(std::u16string, std::u16string)> done)
      : icon_(icon), done_(std::move(done)) {}
  void Accept() {
    std::u16string name;
    base::TrimWhitespace(dialog_model()->GetTextfieldByUniqueId(kOrganizationName)->text(),
                          base::TRIM_ALL, &name);
    std::u16string icon;
    if (icon_) base::TrimWhitespace(dialog_model()->GetTextfieldByUniqueId(kOrganizationIcon)->text(),
                                    base::TRIM_ALL, &icon);
    std::move(done_).Run(std::move(name), std::move(icon));
  }
 private:
  bool icon_;
  base::OnceCallback<void(std::u16string, std::u16string)> done_;
};
}  // namespace
std::optional<organization::Context> CaptureOrganizationContext(BrowserWindowInterface& browser) {
  auto* owner = organization::OrganizationProfileServiceFactory::GetForProfile(browser.GetProfile());
  auto* model = owner ? owner->model() : nullptr;
  if (!model || model->blocked() || model->pending()) return std::nullopt;
  return organization::Context{model->snapshot().profile_id, owner->owner_generation(),
      model->snapshot().revision, base::Uuid::GenerateRandomV4().AsLowercaseString()};
}
void ExecuteOrganizationCommand(base::WeakPtr<BrowserWindowInterface> browser,
    organization::Context context, organization::Command command,
    organization::OrganizationService::Reply reply) {
  if (!browser) { std::move(reply).Run({organization::Error::kOwnerLost, 0, {}}); return; }
  auto* owner = organization::OrganizationProfileServiceFactory::GetForProfileIfExists(browser->GetProfile());
  auto* model = owner ? owner->model() : nullptr;
  if (!model) { std::move(reply).Run({organization::Error::kOwnerLost, 0, {}}); return; }
  model->Execute(std::move(context), std::move(command), std::move(reply));
}
void ShowOrganizationNameDialog(views::View& anchor, std::u16string title,
    std::u16string name, std::optional<std::u16string> icon,
    base::OnceCallback<void(std::u16string, std::u16string)> accept) {
  if (!anchor.GetWidget()) return;
  auto delegate = std::make_unique<NameDelegate>(icon.has_value(), std::move(accept));
  auto* handler = delegate.get();
  auto builder = ui::DialogModel::Builder(std::move(delegate));
  builder.SetTitle(title)
      .AddOkButton(base::BindOnce(&NameDelegate::Accept, base::Unretained(handler)),
          ui::DialogModel::Button::Params().SetLabel(u"Save"))
      .AddCancelButton(base::DoNothing())
      .AddTextfield(kOrganizationName, u"Name", name,
          ui::DialogModelTextfield::Params().SetAccessibleName(u"Name"))
      .SetInitiallyFocusedField(kOrganizationName);
  if (icon) builder.AddTextfield(kOrganizationIcon, u"Icon", *icon,
      ui::DialogModelTextfield::Params().SetAccessibleName(u"Space icon or emoji"));
  constrained_window::ShowBrowserModal(builder.Build(), anchor.GetWidget()->GetNativeWindow());
}
std::u16string OrganizationErrorMessage(organization::Error error) {
  using E = organization::Error;
  switch (error) {
    case E::kNone: case E::kReplay: return {};
    case E::kStaleRevision: return u"Tabs changed. Please try again.";
    case E::kBusy: return u"Saving changes. Please try again shortly.";
    case E::kProtectedPin: return u"Pinned items stay available. Unpin before archiving.";
    case E::kCycle: return u"A folder cannot contain itself.";
    case E::kNotEmpty: return u"Move this Space’s contents before removing it.";
    case E::kOwnerLost: case E::kForeignProfile: return u"The profile changed. Please try again.";
    case E::kStorageRefused: case E::kStorageFailed: case E::kStorageUncertain:
      return u"Changes could not be saved. Your previous organization is retained.";
    default: return u"This change could not be applied.";
  }
}
}  // namespace aux
