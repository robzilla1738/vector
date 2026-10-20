// Copyright 2026 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
#ifndef CHROME_BROWSER_UI_WEBUI_AUX_IMPORTER_SAFARI_ARCHIVE_PICKER_H_
#define CHROME_BROWSER_UI_WEBUI_AUX_IMPORTER_SAFARI_ARCHIVE_PICKER_H_
#include "base/files/file_path.h"
#include "base/functional/callback.h"
#include "base/memory/scoped_refptr.h"
#include "base/memory/weak_ptr.h"
#include "ui/gfx/native_ui_types.h"
#include "ui/shell_dialogs/select_file_dialog.h"
namespace content { class WebContents; }
namespace ui { struct SelectedFileInfo; }
namespace aux_importer {
// Retained by the native importer UI. Selection cancellation only retires the
// dialog; a real worker validation reply selects or rejects an actual file.
class SafariArchivePicker final : public ui::SelectFileDialog::Listener {
 public:
  using Selected = base::RepeatingCallback<void(base::FilePath)>;
  SafariArchivePicker(Selected selected, base::RepeatingClosure invalid);
  ~SafariArchivePicker() override;
  void Show(content::WebContents* contents, gfx::NativeWindow parent);
  // Capture the accepted dialog's continuation, including its target mode.
  void Show(content::WebContents* contents, gfx::NativeWindow parent,
            Selected selected);
 private:
  void FileSelected(const ui::SelectedFileInfo& file, int index) override;
  void FileSelectionCanceled() override;
  void DidValidate(Selected selected, base::FilePath path, bool valid);
  Selected selected_;
  Selected dialog_selected_;
  base::RepeatingClosure invalid_;
  scoped_refptr<ui::SelectFileDialog> dialog_;
  base::WeakPtrFactory<SafariArchivePicker> weak_{this};
};
}  // namespace aux_importer
#endif
