// Copyright 2015 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

#ifndef CHROME_COMMON_CHROME_ISOLATED_WORLD_IDS_H_
#define CHROME_COMMON_CHROME_ISOLATED_WORLD_IDS_H_

#include "build/build_config.h"
#include "chrome/common/buildflags.h"
#include "content/public/common/isolated_world_ids.h"
// LINT.IfChange
// When changing this file, ChromeIsolatedWorldIds.java must be updated as well.
enum ChromeIsolatedWorldIDs {
  // Isolated world ID for Chrome Translate.
  ISOLATED_WORLD_ID_TRANSLATE = content::ISOLATED_WORLD_ID_CONTENT_END + 1,

  // Isolated world ID for Indigo.
  ISOLATED_WORLD_ID_INDIGO,

  // Isolated world ID for internal Chrome features.
  ISOLATED_WORLD_ID_CHROME_INTERNAL,

#if BUILDFLAG(IS_MAC)
  // Isolated world ID for AppleScript.
  ISOLATED_WORLD_ID_APPLESCRIPT,
#endif  // BUILDFLAG(IS_MAC)

#if BUILDFLAG(ENABLE_AUX_ISOLATED_WORLDS)
  // Fixed browser-owned scripts must never share extension or credential state.
  // Keep these below the extension allocator and within content's IPC bound.
  ISOLATED_WORLD_ID_AUX_TRANSLATION = content::ISOLATED_WORLD_ID_CONTENT_END + 5,
  ISOLATED_WORLD_ID_AUX_UNSAVED_WORK,
  ISOLATED_WORLD_ID_AUX_CAPTURE,
  ISOLATED_WORLD_ID_AUX_CREDENTIAL,
  ISOLATED_WORLD_ID_AUX_PAGE_CHANGE,
  ISOLATED_WORLD_ID_AUX_OBSERVER,
  ISOLATED_WORLD_ID_AUX_RECORDER,
#endif

  // Numbers for isolated worlds for extensions are set in
  // extensions/renderer/script_injection.cc, and are are greater than or equal
  // to this number.
  ISOLATED_WORLD_ID_EXTENSIONS
};
#if BUILDFLAG(ENABLE_AUX_ISOLATED_WORLDS)
static_assert(ISOLATED_WORLD_ID_AUX_TRANSLATION > ISOLATED_WORLD_ID_CHROME_INTERNAL);
#if BUILDFLAG(IS_MAC)
static_assert(ISOLATED_WORLD_ID_AUX_TRANSLATION > ISOLATED_WORLD_ID_APPLESCRIPT);
#endif
static_assert(ISOLATED_WORLD_ID_AUX_RECORDER < ISOLATED_WORLD_ID_EXTENSIONS);
static_assert(static_cast<int>(ISOLATED_WORLD_ID_AUX_RECORDER) <=
              static_cast<int>(content::ISOLATED_WORLD_ID_MAX));
#endif
// LINT.ThenChange(//chrome/android/java/src/org/chromium/chrome/browser/common/ChromeIsolatedWorldIds.java)
#endif  // CHROME_COMMON_CHROME_ISOLATED_WORLD_IDS_H_
