// Copyright 2026 The Aux Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
#ifndef CONTENT_PUBLIC_BROWSER_PICTURE_IN_PICTURE_USER_AUTHORITY_H_
#define CONTENT_PUBLIC_BROWSER_PICTURE_IN_PICTURE_USER_AUTHORITY_H_
#include "content/common/content_export.h"
namespace blink { class WebInputEvent; }
namespace content {
class RenderFrameHost;
// Browser input routing only: renderer activation notifications are not input.
CONTENT_EXPORT void RecordPictureInPictureUserInput(RenderFrameHost& frame,
                                                   const blink::WebInputEvent& event);
// Browser embedding UI must validate actual native dispatch before calling.
CONTENT_EXPORT bool RecordPictureInPictureBrowserUIInput(RenderFrameHost& frame);
CONTENT_EXPORT void MarkAutomaticPictureInPictureDocument(RenderFrameHost& frame);
// Records only an already-denied automatic deadline on its original document.
// This does not create a ledger, grant input, or change consumption eligibility.
CONTENT_EXPORT void RecordExpiredAutomaticPictureInPictureDocument(
    RenderFrameHost& frame);
// Transfer one actual later source input to an exact target document. A trusted
// WebUI origin alone is never a receipt. Normal page manual entry keeps its
// upstream behavior; an explicit browser UI action retains document provenance.
CONTENT_EXPORT bool TransferPictureInPictureUserInput(RenderFrameHost& source,
                                                     RenderFrameHost& target);
// Optional result classifies a denied expired automatic lineage only; it does
// not grant input or change the receipt-consumption predicates.
CONTENT_EXPORT bool ConsumePictureInPictureUserInput(
    RenderFrameHost& frame, bool* expired_automatic_lineage = nullptr);
}  // namespace content
#endif
