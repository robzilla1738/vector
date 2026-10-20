// Copyright 2026 The Aux Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
#ifndef CHROME_BROWSER_UI_VIEWS_FRAME_AUX_BOOKMARK_CONFIRMATION_H_
#define CHROME_BROWSER_UI_VIEWS_FRAME_AUX_BOOKMARK_CONFIRMATION_H_
#include <string>
#include "base/functional/callback_forward.h"
#include "ui/gfx/native_ui_types.h"
namespace aux {
// Original41523f0 NSAlert primitive. Sheets are asynchronous; absent/busy
// parents use the original modal path. The callback is consumed exactly once.
// Original4136218, only after a previously established normalized drag
// destination actually changes. No synthetic feedback on first admission.
void PerformBookmarkDragDestinationFeedback();
// Same original4216dfc/41523f0 primitive with caller-supplied original labels.
// Bookmark and Chats callers retain their own model/REST acceptance actions.
void ShowAuxNativeConfirmation(gfx::NativeWindow parent,
                               const std::u16string& title,
                               const std::u16string& body,
                               const std::u16string& accept_label,
                               const std::u16string& cancel_label,
                               base::OnceCallback<void(bool)> completion);
void ShowBookmarkDeleteConfirmation(gfx::NativeWindow parent,
                                    const std::u16string& title,
                                    const std::u16string& body,
                                    base::OnceCallback<void(bool)> completion);
}  // namespace aux
#endif
