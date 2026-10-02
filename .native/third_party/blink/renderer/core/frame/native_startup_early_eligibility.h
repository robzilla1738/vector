// Copyright 2026 The Aux Authors
#ifndef THIRD_PARTY_BLINK_RENDERER_CORE_FRAME_NATIVE_STARTUP_EARLY_ELIGIBILITY_H_
#define THIRD_PARTY_BLINK_RENDERER_CORE_FRAME_NATIVE_STARTUP_EARLY_ELIGIBILITY_H_
#include "third_party/blink/renderer/core/core_export.h"
namespace blink {
class Document;
// Fixed early document fence only. Not Profile/window authority, readiness or
// presentation. A prior mark OR installed input instance always refuses.
CORE_EXPORT bool NativeStartupDocumentCanArm(Document& document);
}  // namespace blink
#endif
