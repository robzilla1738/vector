// Copyright 2026 The Aux Authors
#ifndef THIRD_PARTY_BLINK_RENDERER_CORE_FRAME_NATIVE_STARTUP_INTERACTIVE_WITNESS_H_
#define THIRD_PARTY_BLINK_RENDERER_CORE_FRAME_NATIVE_STARTUP_INTERACTIVE_WITNESS_H_
#include <optional>
#include <string>
#include "base/time/time.h"
#include "third_party/blink/public/common/tokens/tokens.h"
#include "third_party/blink/renderer/core/core_export.h"
namespace blink {
class Document;
struct NativeStartupInteractiveWitness {
  DocumentToken document;
  std::string composer_instance;
  base::TimeTicks observed_typeable_at;
};
// Fixed committed current shell DOM read, not a presentation observation.
// The timestamp is actual native observation, never a JS startTime conversion.
CORE_EXPORT std::optional<NativeStartupInteractiveWitness>
ReadNativeStartupInteractiveWitness(Document& document);
}  // namespace blink
#endif
