// Copyright 2026 The Aux Authors. BSD-style license: see //LICENSE.
#include "content/public/browser/aux_ui_migration_document.h"
#include "content/browser/renderer_host/render_frame_host_impl.h"
#include "content/public/browser/browser_thread.h"
#include "content/public/browser/render_frame_host.h"
namespace content {
std::optional<blink::DocumentToken>
GetDocumentTokenForAuxUiMigration(RenderFrameHost& frame) {
  DCHECK_CURRENTLY_ON(BrowserThread::UI);
  auto* actual = RenderFrameHostImpl::FromID(frame.GetGlobalId());
  if (!actual || static_cast<RenderFrameHost*>(actual) != &frame ||
      !actual->IsActive() || !actual->IsRenderFrameLive() ||
      !actual->GetPendingCommitCrossDocumentNavigations().empty())
    return std::nullopt;
  // IsActive is exactly kActive (also rejecting pending lifecycle updates),
  // preserving existing GetDocumentToken pending/speculative restrictions.
  return actual->GetDocumentToken();
}
}  // namespace content
