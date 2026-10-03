// Copyright 2023 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

package org.chromium.chrome.browser.common;

import androidx.annotation.IntDef;

import org.chromium.build.annotations.NullMarked;
import org.chromium.content_public.common.IsolatedWorldIds;

import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;

/**
 * The Java copy of //chrome/common/chrome_isolated_world_ids. Please check there for details about
 * each id.
 *
 * <p>Both files must be kept in sync.
 */
// LINT.IfChange
@IntDef({
    ChromeIsolatedWorldIds.ISOLATED_WORLD_ID_TRANSLATE,
    ChromeIsolatedWorldIds.ISOLATED_WORLD_ID_INDIGO,
    ChromeIsolatedWorldIds.ISOLATED_WORLD_ID_CHROME_INTERNAL,
    ChromeIsolatedWorldIds.ISOLATED_WORLD_UNUSED_MAC,
    ChromeIsolatedWorldIds.ISOLATED_WORLD_ID_UNUSED_AUX_TRANSLATION,
    ChromeIsolatedWorldIds.ISOLATED_WORLD_ID_UNUSED_AUX_UNSAVED_WORK,
    ChromeIsolatedWorldIds.ISOLATED_WORLD_ID_UNUSED_AUX_CAPTURE,
    ChromeIsolatedWorldIds.ISOLATED_WORLD_ID_UNUSED_AUX_CREDENTIAL,
    ChromeIsolatedWorldIds.ISOLATED_WORLD_ID_UNUSED_AUX_PAGE_CHANGE,
    ChromeIsolatedWorldIds.ISOLATED_WORLD_ID_UNUSED_AUX_OBSERVER,
    ChromeIsolatedWorldIds.ISOLATED_WORLD_ID_UNUSED_AUX_RECORDER,
    ChromeIsolatedWorldIds.ISOLATED_WORLD_ID_UNUSED_EXTENSIONS
})
@Retention(RetentionPolicy.SOURCE)
@NullMarked
public @interface ChromeIsolatedWorldIds {
    int ISOLATED_WORLD_ID_TRANSLATE = IsolatedWorldIds.ISOLATED_WORLD_ID_CONTENT_END + 1;
    int ISOLATED_WORLD_ID_INDIGO = IsolatedWorldIds.ISOLATED_WORLD_ID_CONTENT_END + 2;
    int ISOLATED_WORLD_ID_CHROME_INTERNAL = IsolatedWorldIds.ISOLATED_WORLD_ID_CONTENT_END + 3;
    int ISOLATED_WORLD_UNUSED_MAC = IsolatedWorldIds.ISOLATED_WORLD_ID_CONTENT_END + 4;
    // Aux-only native worlds are unused on Android. Preserve its extension boundary.
    int ISOLATED_WORLD_ID_UNUSED_AUX_TRANSLATION = IsolatedWorldIds.ISOLATED_WORLD_ID_CONTENT_END + 5;
    int ISOLATED_WORLD_ID_UNUSED_AUX_UNSAVED_WORK = IsolatedWorldIds.ISOLATED_WORLD_ID_CONTENT_END + 6;
    int ISOLATED_WORLD_ID_UNUSED_AUX_CAPTURE = IsolatedWorldIds.ISOLATED_WORLD_ID_CONTENT_END + 7;
    int ISOLATED_WORLD_ID_UNUSED_AUX_CREDENTIAL = IsolatedWorldIds.ISOLATED_WORLD_ID_CONTENT_END + 8;
    int ISOLATED_WORLD_ID_UNUSED_AUX_PAGE_CHANGE = IsolatedWorldIds.ISOLATED_WORLD_ID_CONTENT_END + 9;
    int ISOLATED_WORLD_ID_UNUSED_AUX_OBSERVER = IsolatedWorldIds.ISOLATED_WORLD_ID_CONTENT_END + 10;
    int ISOLATED_WORLD_ID_UNUSED_AUX_RECORDER = IsolatedWorldIds.ISOLATED_WORLD_ID_CONTENT_END + 11;
    int ISOLATED_WORLD_ID_UNUSED_EXTENSIONS = IsolatedWorldIds.ISOLATED_WORLD_ID_CONTENT_END + 5;
}
// LINT.ThenChange(//chrome/common/chrome_isolated_world_ids.h)
