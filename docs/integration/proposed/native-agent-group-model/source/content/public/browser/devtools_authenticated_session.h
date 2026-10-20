// Copyright 2026 The Aux Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
#ifndef CONTENT_PUBLIC_BROWSER_DEVTOOLS_AUTHENTICATED_SESSION_H_
#define CONTENT_PUBLIC_BROWSER_DEVTOOLS_AUTHENTICATED_SESSION_H_
#include "content/common/content_export.h"
namespace content {
class DevToolsAgentHost;
// UI-thread query of actual currently attached clients. No target is created,
// and default/public/unfiltered clients never grant this capability.
CONTENT_EXPORT bool HasAuthenticatedRemoteDebuggingSession(
    DevToolsAgentHost* host);
}  // namespace content
#endif  // CONTENT_PUBLIC_BROWSER_DEVTOOLS_AUTHENTICATED_SESSION_H_
