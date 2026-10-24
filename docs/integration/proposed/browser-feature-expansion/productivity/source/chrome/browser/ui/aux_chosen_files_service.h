// Copyright 2026 The Aux Authors. BSD-style license: see //LICENSE.
#ifndef CHROME_BROWSER_UI_AUX_CHOSEN_FILES_SERVICE_H_
#define CHROME_BROWSER_UI_AUX_CHOSEN_FILES_SERVICE_H_
#include <vector>
#include "chrome/browser/ui/aux_recent_files_service.h"
#include "content/public/browser/weak_document_ptr.h"
#include "third_party/blink/public/mojom/choosers/file_chooser.mojom.h"
namespace aux::files {
void SetChosenFilesWriteOwner(Profile*, base::RepeatingCallback<bool()> current,
                              Persist, base::DictValue restored);
bool HasChosenFilesWritePending(Profile*);
base::CallbackListSubscription ObserveChosenFilesSettled(Profile*, base::RepeatingClosure);
base::CallbackListSubscription ObserveChosenFilesChanged(Profile*, base::RepeatingClosure);
// Called only by FileSelectHelper after policy-accepted native chooser results.
// This independently validates the actual installed Agent/document/profile.
void RegisterChosenFiles(content::WeakDocumentPtr,
    blink::mojom::FileChooserParams::Mode,
    const std::vector<blink::mojom::FileChooserFileInfoPtr>&);
base::ListValue ListChosenFiles(Profile*);
base::DictValue DragChosenFile(Profile*, const std::string& opaque_id, gfx::NativeView);
base::DictValue RevealChosenFile(Profile*, const std::string& opaque_id);
bool BeginVerifiedFileDrag(const base::FilePath&, const base::DictValue&, gfx::NativeView);
}  // namespace aux::files
#endif
