// Copyright 2026 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
#include "chrome/browser/ui/webui/aux_importer/safari_archive_picker.h"
#include <memory>
#include <utility>
#include "base/functional/bind.h"
#include "base/task/thread_pool.h"
#include "chrome/browser/ui/select_file_policy/chrome_select_file_policy.h"
#include "components/user_data_importer/utility/safari_archive_validator.h"
#include "ui/shell_dialogs/selected_file_info.h"
namespace aux_importer {
SafariArchivePicker::SafariArchivePicker(Selected selected,
                                         base::RepeatingClosure invalid)
    : selected_(std::move(selected)), invalid_(std::move(invalid)) {}
SafariArchivePicker::~SafariArchivePicker() {
  if (dialog_) dialog_->ListenerDestroyed();
}
void SafariArchivePicker::Show(content::WebContents* contents,
                              gfx::NativeWindow parent) {
  Show(contents, parent, selected_);
}
void SafariArchivePicker::Show(content::WebContents* contents,
                              gfx::NativeWindow parent, Selected selected) {
  // Original4252324 checks the one retained dialog before presenting another.
  if (dialog_ || !contents || !parent) return;
  dialog_selected_ = std::move(selected);
  dialog_ = ui::SelectFileDialog::Create(
      this, std::make_unique<ChromeSelectFilePolicy>(contents));
  ui::SelectFileDialog::FileTypeInfo types;
  types.extensions.resize(1);
  types.extensions[0].push_back(FILE_PATH_LITERAL("zip"));
  dialog_->SelectFile(ui::SelectFileDialog::SELECT_OPEN_FILE, std::u16string(),
                      base::FilePath(), &types, 0,
                      base::FilePath::StringType(), parent, nullptr);
}
void SafariArchivePicker::FileSelected(const ui::SelectedFileInfo& file,
                                       int) {
  dialog_.reset();
  const base::FilePath path = file.path();
  base::ThreadPool::PostTaskAndReplyWithResult(
      FROM_HERE, {base::MayBlock()},
      base::BindOnce(&user_data_importer::IsSafariExportArchive, path),
      base::BindOnce(&SafariArchivePicker::DidValidate, weak_.GetWeakPtr(),
                     std::move(dialog_selected_), path));
}
void SafariArchivePicker::FileSelectionCanceled() {
  // Original4250288: no import-failed or invalid-file event on cancellation.
  dialog_.reset();
  dialog_selected_.Reset();
}
void SafariArchivePicker::DidValidate(Selected selected, base::FilePath path,
                                      bool valid) {
  if (valid) {
    if (selected) selected.Run(std::move(path));
  }
  else invalid_.Run();
}
}  // namespace aux_importer
