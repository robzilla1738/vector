// Copyright 2026 The Aux Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

#include "components/sessions/core/live_tab_context.h"

namespace sessions {

void LiveTabContext::ReconstructSplit(
    const std::vector<LiveTab*>& tabs,
    split_tabs::SplitTabId id,
    const split_tabs::SplitTabVisualData& visual_data) {
  if (tabs.size() == 2) {
    ReconstructSplit(tabs[0], tabs[1], id, visual_data);
  }
}

}  // namespace sessions
