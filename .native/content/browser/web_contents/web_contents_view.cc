// Copyright 2026 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

#include "content/browser/web_contents/web_contents_view.h"

#include "base/functional/callback.h"

namespace content {

#if BUILDFLAG(IS_MAC)
bool WebContentsView::DeferEmbeddingCloseIfNeeded(
    base::OnceClosure continuation) {
  return false;
}
#endif

}  // namespace content
