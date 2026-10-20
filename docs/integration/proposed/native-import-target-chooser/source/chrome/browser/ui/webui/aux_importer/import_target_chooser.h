// Copyright 2026 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
#ifndef CHROME_BROWSER_UI_WEBUI_AUX_IMPORTER_IMPORT_TARGET_CHOOSER_H_
#define CHROME_BROWSER_UI_WEBUI_AUX_IMPORTER_IMPORT_TARGET_CHOOSER_H_
#include <optional>
#include <string>
#include "base/functional/callback.h"

namespace aux_importer {
// Original alert return payload; distinct from a source-browser profile index.
enum class ImportTargetChoice { kNewProfile = 0, kCurrentProfile = 1 };
using ImportTargetChoiceCallback =
    base::OnceCallback<void(std::optional<ImportTargetChoice>)>;
// Original application-modal alert. The real callback is consumed exactly once
// after dismissal; Cancel/other modal responses carry no choice.
void ShowImportTargetChooser(const std::u16string& browser_name,
                             ImportTargetChoiceCallback callback);
}  // namespace aux_importer
#endif  // CHROME_BROWSER_UI_WEBUI_AUX_IMPORTER_IMPORT_TARGET_CHOOSER_H_
