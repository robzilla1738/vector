// Copyright 2026 Aux Authors. All rights reserved.
#ifndef CHROME_BROWSER_EXTENSIONS_API_AUX_MINI_POPUP_AUX_MINI_POPUP_API_H_
#define CHROME_BROWSER_EXTENSIONS_API_AUX_MINI_POPUP_AUX_MINI_POPUP_API_H_
#include <optional>
#include <string>

#include "chrome/browser/extensions/api/aux_common/aux_api.h"
#include "ui/shell_dialogs/select_file_dialog.h"
class PrefRegistrySimple;
class Profile;
namespace extensions {
void InitializeAuxMiniPopup(Profile* profile);
void ShutdownAuxMiniPopup();
void RegisterAuxPopupLocalStatePrefs(PrefRegistrySimple* registry);
class AuxMiniPopupFunction : public AuxFunction,
                             public ui::SelectFileDialog::Listener {
 public:
  AuxMiniPopupFunction();

 protected:
  ~AuxMiniPopupFunction() override;
  ResponseAction RunAux() override;

 private:
  void FileSelected(const ui::SelectedFileInfo& file, int index) override;
  void FileSelectionCanceled() override;
  void CompleteDirectory(std::optional<std::string> path);
  scoped_refptr<ui::SelectFileDialog> dialog_;
  scoped_refptr<AuxMiniPopupFunction> picker_hold_;
};
class AuxMiniPopupHideFunction final : public AuxMiniPopupFunction {
 public:
  DECLARE_EXTENSION_FUNCTION("auxMiniPopup.hide", AUXMINIPOPUP_HIDE)
 protected:
  ~AuxMiniPopupHideFunction() override = default;
};
class AuxMiniPopupGetEnabledFunction final : public AuxMiniPopupFunction {
 public:
  DECLARE_EXTENSION_FUNCTION("auxMiniPopup.getEnabled", AUXMINIPOPUP_GETENABLED)
 protected:
  ~AuxMiniPopupGetEnabledFunction() override = default;
};
class AuxMiniPopupSetEnabledFunction final : public AuxMiniPopupFunction {
 public:
  DECLARE_EXTENSION_FUNCTION("auxMiniPopup.setEnabled", AUXMINIPOPUP_SETENABLED)
 protected:
  ~AuxMiniPopupSetEnabledFunction() override = default;
};
class AuxMiniPopupGetShortcutFunction final : public AuxMiniPopupFunction {
 public:
  DECLARE_EXTENSION_FUNCTION("auxMiniPopup.getShortcut",
                             AUXMINIPOPUP_GETSHORTCUT)
 protected:
  ~AuxMiniPopupGetShortcutFunction() override = default;
};
class AuxMiniPopupSetShortcutFunction final : public AuxMiniPopupFunction {
 public:
  DECLARE_EXTENSION_FUNCTION("auxMiniPopup.setShortcut",
                             AUXMINIPOPUP_SETSHORTCUT)
 protected:
  ~AuxMiniPopupSetShortcutFunction() override = default;
};
class AuxMiniPopupSetStateFunction final : public AuxMiniPopupFunction {
 public:
  DECLARE_EXTENSION_FUNCTION("auxMiniPopup.setState", AUXMINIPOPUP_SETSTATE)
 protected:
  ~AuxMiniPopupSetStateFunction() override = default;
};
class AuxMiniPopupSetSizeFunction final : public AuxMiniPopupFunction {
 public:
  DECLARE_EXTENSION_FUNCTION("auxMiniPopup.setSize", AUXMINIPOPUP_SETSIZE)
 protected:
  ~AuxMiniPopupSetSizeFunction() override = default;
};
class AuxMiniPopupSetOptionWindowSizeFunction final
    : public AuxMiniPopupFunction {
 public:
  DECLARE_EXTENSION_FUNCTION("auxMiniPopup.setOptionWindowSize",
                             AUXMINIPOPUP_SETOPTIONWINDOWSIZE)
 protected:
  ~AuxMiniPopupSetOptionWindowSizeFunction() override = default;
};
class AuxMiniPopupPickDirectoryFunction final : public AuxMiniPopupFunction {
 public:
  DECLARE_EXTENSION_FUNCTION("auxMiniPopup.pickDirectory",
                             AUXMINIPOPUP_PICKDIRECTORY)
 protected:
  ~AuxMiniPopupPickDirectoryFunction() override = default;
};
class AuxMiniPopupSwitchProfileFunction final : public AuxMiniPopupFunction {
 public:
  DECLARE_EXTENSION_FUNCTION("auxMiniPopup.switchProfile",
                             AUXMINIPOPUP_SWITCHPROFILE)
 protected:
  ~AuxMiniPopupSwitchProfileFunction() override = default;
};
}  // namespace extensions
#endif
