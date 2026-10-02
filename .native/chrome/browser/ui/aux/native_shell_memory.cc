// Copyright 2026 The Aux Authors
#include "chrome/browser/ui/aux/native_shell_memory.h"
#if BUILDFLAG(IS_MAC) && BUILDFLAG(AUX_ALLOW_REMOTE_DEBUGGING_FOR_TESTS)
#include "chrome/browser/ui/aux/native_process_footprint.h"
#include "base/strings/string_number_conversions.h"
#include "base/time/time.h"
#include "chrome/browser/ui/webui_browser/webui_browser_ui.h"
#include "content/public/browser/browser_thread.h"
#include "content/public/browser/render_frame_host.h"
#include "content/public/browser/web_contents.h"
#include "content/public/browser/web_ui.h"
namespace aux {
namespace {
base::DictValue Refused(const char* reason) {
  return base::DictValue().Set("producer", "aux-native-shell-memory")
      .Set("version", 1).Set("status", "refused").Set("reason", reason);
}
}
NativeShellMemorySampler::NativeShellMemorySampler(base::WeakPtr<WebUIBrowserUI> ui) : ui_(ui) {
  DCHECK_CURRENTLY_ON(content::BrowserThread::UI);
  owner_ = ReadNativeGuestStageShellOwner(ui_);
  auto* shell = ui_ && ui_->web_ui() ? ui_->web_ui()->GetWebContents() : nullptr;
  auto* frame = shell ? shell->GetPrimaryMainFrame() : nullptr;
  if (owner_ && frame) document_ = frame->GetWeakDocumentPtr();
  else owner_.reset();
}
NativeShellMemorySampler::~NativeShellMemorySampler() = default;
base::DictValue NativeShellMemorySampler::Sample() {
  DCHECK_CURRENTLY_ON(content::BrowserThread::UI);
  auto* frame = document_.AsRenderFrameHostIfValid();
  auto* shell = ui_ && ui_->web_ui() ? ui_->web_ui()->GetWebContents() : nullptr;
  const auto before = ReadNativeGuestStageShellOwner(ui_);
  if (!owner_ || !before || *before != *owner_ || !frame || !shell ||
      shell->GetPrimaryMainFrame() != frame || sequence_ >= 4000)
    return Refused("stale_owned_shell");
  const auto memory = ReadNativeProcessFootprint(owner_->shell_renderer_pid);
  if (!memory) return Refused("kernel_memory_unavailable");
  const auto after = ReadNativeGuestStageShellOwner(ui_);
  if (!after || *after != *owner_ || document_.AsRenderFrameHostIfValid() != frame ||
      shell->GetPrimaryMainFrame() != frame)
    return Refused("changed_or_unavailable_process");
  return base::DictValue().Set("producer", "aux-native-shell-memory")
      .Set("version", 1).Set("status", "sampled").Set("reason", "sampled")
      .Set("windowId", owner_->window_id).Set("widgetRoutingId", owner_->shell_widget_routing_id)
      .Set("rendererPid", owner_->shell_renderer_pid).Set("requestNonce", nonce_.ToString())
      .Set("sampleSequence", base::NumberToString(++sequence_))
      .Set("processUuid", memory->process_uuid)
      .Set("processStartAbsolute", base::NumberToString(memory->process_start_absolute))
      .Set("sampleStartUs", base::NumberToString(memory->sample_start.since_origin().InMicroseconds()))
      .Set("sampleEndUs", base::NumberToString(memory->sample_end.since_origin().InMicroseconds()))
      .Set("physicalFootprintBytes", base::NumberToString(memory->physical_bytes));
}
}  // namespace aux
#endif
