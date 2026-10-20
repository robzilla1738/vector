// Copyright 2026 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
#ifndef CHROME_BROWSER_UI_WEBUI_AUX_IMPORTER_IMPORT_COMPLETION_CHOICE_H_
#define CHROME_BROWSER_UI_WEBUI_AUX_IMPORTER_IMPORT_COMPLETION_CHOICE_H_
#include <string>
#include "base/functional/callback.h"
namespace aux_importer {
// Actual completion UX, only after genuine destination completion. The new
// profile action must own its real target path and weak initiating context.
void ShowNewProfileImportCompleted(const std::u16string& browser_name,
                                   base::OnceClosure open_profile);
void ShowCurrentProfileImportCompleted(const std::u16string& browser_name);
// Original458d4ec, only called by a genuine still-present initiating window.
void ShowSafariInvalidArchive();
}  // namespace aux_importer
#endif  // CHROME_BROWSER_UI_WEBUI_AUX_IMPORTER_IMPORT_COMPLETION_CHOICE_H_
