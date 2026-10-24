// Copyright 2026 The Aux Authors. BSD-style license: see //LICENSE.
#ifndef CHROME_BROWSER_UI_AUX_RECENT_FILES_SERVICE_H_
#define CHROME_BROWSER_UI_AUX_RECENT_FILES_SERVICE_H_
#include <string>
#include <atomic>
#include <memory>
#include <optional>
#include "base/callback_list.h"
#include "base/files/file_path.h"
#include "base/functional/callback.h"
#include "base/values.h"
#include "ui/gfx/native_ui_types.h"
class Profile;
namespace aux::files {
using Reply = base::OnceCallback<void(base::DictValue)>;
// persist receives the whole downloads namespace, including planned receipts.
// Its boolean is true only after the admitted profile journal is durable.
using Persist = base::RepeatingCallback<void(base::DictValue,
                                              base::OnceCallback<void(bool)>)>;
void SetWriteOwner(Profile*, base::RepeatingCallback<bool()> current,
                   Persist persist, base::DictValue restored_receipts);
bool HasPendingWrite(Profile*);
base::CallbackListSubscription ObserveSettled(Profile*, base::RepeatingClosure);
base::DictValue ListRecentFiles(Profile*);
void PrepareDownloadRename(Profile*, const std::string& download_guid, Reply);
void ApplyDownloadRename(Profile*, const std::string& capability,
                         const std::string& stem, Reply);
void UndoDownloadRename(Profile*, const std::string& receipt_id, Reply);
base::DictValue DragRecentDownload(Profile*, const std::string& download_guid,
                                   gfx::NativeView);
// 0: original file remains; 1: exclusive move completed; -1: conflict.
int InspectRegularFileMove(const base::DictValue&, const base::FilePath& source,
                            const base::FilePath& destination);
// Reused conditional same-directory primitive, executed on download sequence.
std::optional<base::DictValue> FingerprintRegularFile(const base::FilePath&);
int MoveRegularFileExclusive(const base::DictValue& fingerprint,
                             const base::FilePath& expected,
                             const base::FilePath& source,
                             const base::FilePath& destination,
                             std::shared_ptr<const std::atomic_bool> authorization);
}  // namespace aux::files
#endif
