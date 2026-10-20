// Copyright 2026 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
#ifndef CHROME_BROWSER_UI_WEBUI_AUX_IMPORTER_IMPORT_STANDALONE_WINDOW_H_
#define CHROME_BROWSER_UI_WEBUI_AUX_IMPORTER_IMPORT_STANDALONE_WINDOW_H_
class BrowserWindowInterface;
class Profile;
namespace aux_importer {
// Original4202ac4. Reuses only the same original profile's real importer app
// window, otherwise creates its genuine standalone one-tab owner. Returns null
// when actual creation is unavailable. Caller supplies its real owning window.
BrowserWindowInterface* ShowStandaloneImporter(
    Profile& profile, BrowserWindowInterface* owning_window);
}  // namespace aux_importer
#endif
