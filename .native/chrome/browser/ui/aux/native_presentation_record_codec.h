// Copyright 2026 The Aux Authors
#ifndef CHROME_BROWSER_UI_AUX_NATIVE_PRESENTATION_RECORD_CODEC_H_
#define CHROME_BROWSER_UI_AUX_NATIVE_PRESENTATION_RECORD_CODEC_H_
#include "build/build_config.h"
#include "chrome/browser/buildflags.h"
#if BUILDFLAG(IS_MAC) && BUILDFLAG(AUX_ALLOW_REMOTE_DEBUGGING_FOR_TESTS)
#include <vector>
#include "base/values.h"
#include "base/time/time.h"
#include "services/viz/privileged/mojom/compositing/display_private.mojom.h"
namespace aux {
// Pure fixed native record fields. No producers, selectors, clocks or authority.
base::DictValue EncodeNativePresentationSink(const viz::FrameSinkId& sink);
void AppendNativePresentationTick(base::DictValue& record, const char* key, base::TimeTicks value);
base::ListValue EncodeNativePresentationDrawn(
    const std::vector<viz::mojom::NativeDrawnGuestPtr>& frames);
}  // namespace aux
#endif
#endif
