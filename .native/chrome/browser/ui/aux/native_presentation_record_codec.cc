// Copyright 2026 The Aux Authors
#include "chrome/browser/ui/aux/native_presentation_record_codec.h"
#if BUILDFLAG(IS_MAC) && BUILDFLAG(AUX_ALLOW_REMOTE_DEBUGGING_FOR_TESTS)
#include <utility>
#include "base/strings/string_number_conversions.h"
namespace aux {
base::DictValue EncodeNativePresentationSink(const viz::FrameSinkId& sink) {
  return base::DictValue().Set("clientId", static_cast<double>(sink.client_id()))
      .Set("sinkId", static_cast<double>(sink.sink_id()));
}
void AppendNativePresentationTick(base::DictValue& record, const char* key, base::TimeTicks value) {
  if (value.is_null()) record.Set(key, base::Value());
  else record.Set(key, base::NumberToString(value.since_origin().InMicroseconds()));
}
base::ListValue EncodeNativePresentationDrawn(
    const std::vector<viz::mojom::NativeDrawnGuestPtr>& frames) {
  base::ListValue drawn;
  for (const auto& frame : frames) {
    if (!frame) continue;
    auto surface = base::DictValue().Set("frameSink", EncodeNativePresentationSink(frame->surface.frame_sink_id()))
        .Set("parentSequenceNumber", static_cast<double>(frame->surface.local_surface_id().parent_sequence_number()))
        .Set("childSequenceNumber", static_cast<double>(frame->surface.local_surface_id().child_sequence_number()))
        .Set("embedToken", frame->surface.local_surface_id().embed_token().ToString());
    drawn.Append(base::DictValue().Set("surface", std::move(surface)).Set("token", static_cast<double>(frame->token))
        .Set("surfaceSize", base::DictValue().Set("width", frame->surface_size.width()).Set("height", frame->surface_size.height()))
        .Set("visibleBounds", base::DictValue().Set("x", frame->visible_bounds.x()).Set("y", frame->visible_bounds.y())
          .Set("width", frame->visible_bounds.width()).Set("height", frame->visible_bounds.height())));
  }
  return drawn;
}
}  // namespace aux
#endif
