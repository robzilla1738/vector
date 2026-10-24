// Copyright 2026 The Aux Authors. BSD-style license: see //LICENSE.
#ifndef CONTENT_PUBLIC_BROWSER_AUX_UI_MIGRATION_DOCUMENT_H_
#define CONTENT_PUBLIC_BROWSER_AUX_UI_MIGRATION_DOCUMENT_H_
#include <optional>
#include "content/common/content_export.h"
#include "third_party/blink/public/common/tokens/tokens.h"
namespace content {
class RenderFrameHost;
// Factual join only. Resolve the exact real browser-owned host through its
// native registry, reject foreign/mock identities and unsupported lifecycle.
// This does not grant storage, Profile, path, startup or migration authority.
CONTENT_EXPORT std::optional<blink::DocumentToken>
GetDocumentTokenForAuxUiMigration(RenderFrameHost& frame);
}  // namespace content
#endif
