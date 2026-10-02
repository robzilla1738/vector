// Copyright 2026 The Aux Authors
#include "chrome/browser/ui/aux/native_shell_memory.h"
#if BUILDFLAG(IS_MAC) && BUILDFLAG(AUX_ALLOW_REMOTE_DEBUGGING_FOR_TESTS)
#include <libproc.h>
#include <sys/resource.h>
#include <algorithm>
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
  rusage_info_v4 memory{};
  const auto started = base::TimeTicks::Now();
  if (proc_pid_rusage(owner_->shell_renderer_pid, RUSAGE_INFO_V4,
      reinterpret_cast<rusage_info_t*>(&memory)) != 0)
    return Refused("kernel_memory_unavailable");
  const auto completed = base::TimeTicks::Now();
  const auto after = ReadNativeGuestStageShellOwner(ui_);
  if (!after || *after != *owner_ || document_.AsRenderFrameHostIfValid() != frame ||
      shell->GetPrimaryMainFrame() != frame || !memory.ri_phys_footprint ||
      !memory.ri_proc_start_abstime || memory.ri_proc_exit_abstime ||
      std::ranges::all_of(memory.ri_uuid, [](uint8_t value) { return value == 0; }))
    return Refused("changed_or_unavailable_process");
  return base::DictValue().Set("producer", "aux-native-shell-memory")
      .Set("version", 1).Set("status", "sampled").Set("reason", "sampled")
      .Set("windowId", owner_->window_id).Set("widgetRoutingId", owner_->shell_widget_routing_id)
      .Set("rendererPid", owner_->shell_renderer_pid).Set("requestNonce", nonce_.ToString())
      .Set("sampleSequence", base::NumberToString(++sequence_))
      .Set("processUuid", base::HexEncode(memory.ri_uuid))
      .Set("processStartAbsolute", base::NumberToString(memory.ri_proc_start_abstime))
      .Set("sampleStartUs", base::NumberToString(started.since_origin().InMicroseconds()))
      .Set("sampleEndUs", base::NumberToString(completed.since_origin().InMicroseconds()))
      .Set("physicalFootprintBytes", base::NumberToString(memory.ri_phys_footprint));
}
}  // namespace aux
#endif
