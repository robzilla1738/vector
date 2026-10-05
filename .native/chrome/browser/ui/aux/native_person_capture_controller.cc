// Copyright 2026 The Aux Authors
#include "chrome/browser/ui/aux/native_person_capture_controller.h"
#include <utility>
#include <algorithm>
#include <ranges>
#include "base/base64.h"
#include "base/functional/bind.h"
#include "base/task/bind_post_task.h"
#include "mojo/public/cpp/bindings/callback_helpers.h"
#include "base/task/sequenced_task_runner.h"
#include "base/strings/utf_string_conversions.h"
#include "base/uuid.h"
#include "chrome/common/aux_person_capture_mask.h"
#include "chrome/common/chrome_isolated_world_ids.h"
#include "components/viz/common/frame_sinks/copy_output_result.h"
#include "content/public/browser/render_frame_host.h"
#include "content/browser/renderer_host/render_widget_host_view_base.h"
#include "content/public/browser/web_contents.h"
#include "ui/gfx/codec/png_codec.h"
namespace aux {
namespace {
gfx::Size OriginalWidgetViewport(content::RenderWidgetHostViewBase* view) {
  // Ordinary OOPIF child views have no owner_delegate and their visible-viewport
  // methods are only valid for nested WebContents. Keep their actual local size.
  return view->IsRenderWidgetHostViewChildFrame()
      ? view->GetViewBounds().size() : view->GetVisibleViewportSize();
}
gfx::Size OriginalWidgetPixelViewport(content::RenderWidgetHostViewBase* view) {
  return view->IsRenderWidgetHostViewChildFrame()
      ? view->GetCompositorViewportPixelSize() : view->GetVisibleViewportSizeDevicePx();
}
base::DictValue Fault(bool debt) {
  return base::DictValue().Set("error", base::DictValue()
      .Set("code", "target_detached").Set("message", debt ?
        "Original page capture failed; original mask cleanup remains unresolved." :
        "The original page could not be captured. Try again."));
}
}
WEB_CONTENTS_USER_DATA_KEY_IMPL(NativePersonCaptureController);
NativePersonCaptureController::NativePersonCaptureController(content::WebContents* contents)
    : content::WebContentsObserver(contents), content::WebContentsUserData<NativePersonCaptureController>(*contents) {}
NativePersonCaptureController::~NativePersonCaptureController() {
  weak_factory_.InvalidateWeakPtrs();
  if (reply_) std::move(reply_).Run(Fault(!capture_id_.empty()));
}
bool NativePersonCaptureController::Current() {
  const auto weak = weak_factory_.GetWeakPtr();
  const auto guard = current_;
  if (capture_id_.empty() || !guard || !guard.Run() || !weak || !web_contents() || frames_.empty()) return false;
  if (frames_[0].AsRenderFrameHostIfValid() != web_contents()->GetPrimaryMainFrame()) return false;
  size_t index = 0; bool same = true;
  web_contents()->GetPrimaryMainFrame()->ForEachRenderFrameHost([&](content::RenderFrameHost* frame) {
    if (!frame->IsActive() || !frame->IsRenderFrameLive() || frame->GetLastCommittedURL().is_empty() || frame->IsErrorDocument() || index >= frames_.size() || frames_[index++].AsRenderFrameHostIfValid() != frame) same = false;
  });
  if (!same || index != frames_.size()) return false;
  if (!widgets_.empty()) {
    if (widgets_.size() != frames_.size() || widget_viewports_.size() != frames_.size() || widget_pixel_viewports_.size() != frames_.size()) return false;
    for (size_t i = 0; i < frames_.size(); ++i) {
      auto* frame = frames_[i].AsRenderFrameHostIfValid();
      if (!frame || !widgets_[i] || frame->GetRenderWidgetHost() != widgets_[i].get()) return false;
      auto* view = widgets_[i]->GetView();
      if (!view || OriginalWidgetViewport(view) != widget_viewports_[i] ||
          OriginalWidgetPixelViewport(view) != widget_pixel_viewports_[i] ||
          (surfaces_[i].is_valid() && view->GetAuxPersonCaptureSurfaceId() != surfaces_[i])) return false;
    }
  }
  return true;
}
void NativePersonCaptureController::Capture(base::DictValue identity,
    base::RepeatingCallback<bool()> current, Reply reply) {
  if (!capture_id_.empty()) { std::move(reply).Run(Fault(true)); return; }
  // Reserve synchronously before the original guard can reenter this owner.
  identity_ = std::move(identity); current_ = std::move(current); reply_ = std::move(reply);
  capture_id_ = base::Uuid::GenerateRandomV4().AsLowercaseString();
  const auto weak = weak_factory_.GetWeakPtr();
  const auto guard = current_;
  const bool admitted_guard = guard && guard.Run();
  if (!weak) return;
  if (!admitted_guard || !web_contents()) { failed_ = true; Finish(); return; }
  web_contents()->GetPrimaryMainFrame()->ForEachRenderFrameHost([&](content::RenderFrameHost* frame) {
    frames_.push_back(frame->GetWeakDocumentPtr());
  });
  const bool admitted = !frames_.empty() && frames_.size() <= 64 && Current();
  if (!weak) return;
  if (!admitted) { failed_ = true; Finish(); return; }
  deadline_.Start(FROM_HERE, base::Seconds(5), base::BindOnce(&NativePersonCaptureController::Deadline, weak_factory_.GetWeakPtr()));
  Dispatch("begin");
}
void NativePersonCaptureController::Dispatch(const std::string& phase) {
  pending_ = frames_.size();
  const std::u16string script = std::u16string(person_capture_mask::kProgram) + u"(\"" +
      base::UTF8ToUTF16(phase) + u"\",\"" + base::UTF8ToUTF16(capture_id_) + u"\")";
  const auto documents = frames_;
  const auto weak = weak_factory_.GetWeakPtr();
  for (size_t i = 0; i < documents.size(); ++i) {
    if (!weak) return;
    auto* frame = documents[i].AsRenderFrameHostIfValid();
    if (!frame) { ScriptDone(phase, i, phase == "restore"); continue; }
    if (!frame->IsActive() || !frame->IsRenderFrameLive() || frame->GetLastCommittedURL().is_empty() || frame->IsErrorDocument()) {
      if (phase == "restore") { cleanup_debt_ = true; ScriptDone("restored", i, true); }
      else ScriptDone(phase, i, false);
      continue;
    }
    frame->ExecuteJavaScriptInIsolatedWorld(script, base::BindOnce(
        [](base::WeakPtr<NativePersonCaptureController> owner, std::string phase, size_t index, base::Value result) {
          if (owner) owner->ScriptDone(std::move(phase), index, result.is_bool() && result.GetBool());
        }, weak_factory_.GetWeakPtr(), phase, i), ISOLATED_WORLD_ID_AUX_OBSERVER);
  }
}
void NativePersonCaptureController::ScriptDone(std::string phase, size_t index, bool accepted) {
  if (!accepted) {
    if (phase == "restore") {
      auto* frame = frames_[index].AsRenderFrameHostIfValid();
      if (frame && (!frame->IsActive() || !frame->IsRenderFrameLive() || frame->GetLastCommittedURL().is_empty() || frame->IsErrorDocument())) {
        cleanup_debt_ = true; ScriptDone("restored", index, true); return;
      }
      if (frame) {
        const std::u16string script = std::u16string(person_capture_mask::kProgram) + u"(\"absent\",\"" + base::UTF8ToUTF16(capture_id_) + u"\")";
        frame->ExecuteJavaScriptInIsolatedWorld(script, base::BindOnce(
            [](base::WeakPtr<NativePersonCaptureController> owner, size_t index, base::Value result) {
              if (!owner) return;
              if (!result.is_bool() || !result.GetBool()) owner->cleanup_debt_ = true;
              owner->ScriptDone("restored", index, true);
            }, weak_factory_.GetWeakPtr(), index), ISOLATED_WORLD_ID_AUX_OBSERVER);
        return;
      }
    } else failed_ = true;
  }
  if (--pending_ != 0) return;
  if (phase == "restore" || phase == "restored") { Finish(); return; }
  const auto weak = weak_factory_.GetWeakPtr();
  const bool admitted = !failed_ && Current();
  if (!weak) return;
  if (!admitted) { failed_ = true; Cleanup(); return; }
  if (phase == "begin") Paint();
  else if (phase == "current") {
    if (png_.empty()) Copy(); else Cleanup();
  }
}
void NativePersonCaptureController::Paint() {
  surfaces_.resize(frames_.size()); submission_tokens_.resize(frames_.size()); widgets_.resize(frames_.size());
  widget_viewports_.resize(frames_.size()); widget_pixel_viewports_.resize(frames_.size());
  std::vector<size_t> children;
  for (size_t i = 0; i < frames_.size(); ++i) {
    auto* frame = frames_[i].AsRenderFrameHostIfValid();
    auto* widget = frame ? content::RenderWidgetHostImpl::From(frame->GetRenderWidgetHost()) : nullptr;
    auto* view = widget ? widget->GetView() : nullptr;
    if (!widget || !view) { failed_ = true; Cleanup(); return; }
    widgets_[i] = widget->GetWeakPtr();
    widget_viewports_[i] = OriginalWidgetViewport(view);
    widget_pixel_viewports_[i] = OriginalWidgetPixelViewport(view);
    // Same-process frames share a widget and one submitted frame token. Never
    // enqueue duplicate callbacks for that token in the original frame queue.
    if (i && widget != widgets_[0].get() && std::ranges::none_of(children, [&](size_t prior) { return widgets_[prior].get() == widget; })) children.push_back(i);
  }
  if (children.empty()) { PaintRoot(); return; }
  pending_ = children.size();
  const auto weak = weak_factory_.GetWeakPtr();
  for (size_t i : children) {
    if (!weak) return;
    if (!widgets_[i]) { Painted(false); continue; }
    widgets_[i]->RequestAuxPersonCaptureFrame(base::BindOnce(&NativePersonCaptureController::Submitted,
        weak_factory_.GetWeakPtr(), i, widgets_[i]));
  }
}
void NativePersonCaptureController::PaintRoot() {
  const auto weak = weak_factory_.GetWeakPtr();
  const bool admitted = Current();
  if (!weak) return;
  if (!admitted || widgets_.empty() || !widgets_[0]) { failed_ = true; Cleanup(); return; }
  // Child masked frames have activated before the final original root redraw.
  root_submission_ = true; pending_ = 1;
  widgets_[0]->RequestAuxPersonCaptureFrame(base::BindOnce(&NativePersonCaptureController::Submitted,
      weak_factory_.GetWeakPtr(), size_t{0}, widgets_[0]));
}
void NativePersonCaptureController::Submitted(size_t index,
    base::WeakPtr<content::RenderWidgetHostImpl> widget, uint32_t token) {
  auto* frame = frames_[index].AsRenderFrameHostIfValid();
  const auto weak = weak_factory_.GetWeakPtr();
  const bool admitted = token && widget && frame && frame->GetRenderWidgetHost() == widget.get() && Current();
  if (!weak) return;
  if (!admitted) { Painted(false); return; }
  frame = frames_[index].AsRenderFrameHostIfValid();
  if (!frame || !widget || frame->GetRenderWidgetHost() != widget.get()) { Painted(false); return; }
  widget->render_frame_metadata_provider()->WaitForAuxPersonCaptureActivation(token,
      mojo::WrapCallbackWithDefaultInvokeIfNotRun(base::BindOnce(&NativePersonCaptureController::Activated,
          weak_factory_.GetWeakPtr(), index, widget, token), base::TimeTicks()));
}
void NativePersonCaptureController::Activated(size_t index,
    base::WeakPtr<content::RenderWidgetHostImpl> widget, uint32_t token, base::TimeTicks time) {
  auto* frame = frames_[index].AsRenderFrameHostIfValid();
  const auto weak = weak_factory_.GetWeakPtr();
  const bool admitted = token && !time.is_null() && widget && frame && frame->GetRenderWidgetHost() == widget.get() && Current();
  if (!weak) return;
  if (!admitted) { Painted(false); return; }
  frame = frames_[index].AsRenderFrameHostIfValid();
  if (!frame || !widget || frame->GetRenderWidgetHost() != widget.get()) { Painted(false); return; }
  auto* view = widget->GetView();
  const auto& metadata = widget->render_frame_metadata_provider()->LastRenderFrameMetadata();
  const auto surface = view ? view->GetAuxPersonCaptureSurfaceId() : viz::SurfaceId();
  if (!surface.is_valid() || !metadata.local_surface_id || surface.local_surface_id() != *metadata.local_surface_id) { Painted(false); return; }
  for (size_t i = 0; i < widgets_.size(); ++i) if (widgets_[i].get() == widget.get()) { surfaces_[i] = surface; submission_tokens_[i] = token; }
  Painted(true);
}
void NativePersonCaptureController::Painted(bool accepted) {
  if (!accepted) failed_ = true;
  if (--pending_) return;
  const auto weak = weak_factory_.GetWeakPtr();
  const bool admitted = !failed_ && Current();
  if (!weak) return;
  if (!admitted) { failed_ = true; Cleanup(); }
  else if (!root_submission_) PaintRoot();
  else Dispatch("current");
}
void NativePersonCaptureController::Copy() {
  const auto weak = weak_factory_.GetWeakPtr();
  const bool admitted = Current();
  if (!weak) return;
  if (!admitted) { failed_ = true; Cleanup(); return; }
  auto* view = web_contents()->GetRenderWidgetHostView();
  if (!view || !view->IsShowing()) { failed_ = true; Cleanup(); return; }
  scale_ = view->GetDeviceScaleFactor();
  viewport_width_ = view->GetVisibleViewportSize().width();
  viewport_height_ = view->GetVisibleViewportSize().height();
  viewport_pixels_ = view->GetVisibleViewportSizeDevicePx();
  if (viewport_width_ <= 0 || viewport_height_ <= 0 || viewport_pixels_.IsEmpty()) { failed_ = true; Cleanup(); return; }
  pending_ = 1;
  if (surfaces_.empty() || view->GetAuxPersonCaptureSurfaceId() != surfaces_[0]) { pending_ = 0; failed_ = true; Cleanup(); return; }
  std::vector<viz::SurfaceId> required_surfaces;
  std::vector<uint32_t> required_tokens;
  for (size_t i = 0; i < surfaces_.size(); ++i) {
    if (std::ranges::find(required_surfaces, surfaces_[i]) != required_surfaces.end()) continue;
    required_surfaces.push_back(surfaces_[i]); required_tokens.push_back(submission_tokens_[i]);
  }
  view->CopyAuxPersonCaptureSurface(surfaces_[0], required_surfaces, required_tokens, base::Seconds(3),
      base::BindPostTaskToCurrentDefault(base::BindOnce(&NativePersonCaptureController::Copied, weak_factory_.GetWeakPtr())));
}
void NativePersonCaptureController::Copied(const content::CopyFromSurfaceResult& result) {
  pending_ = 0;
  const bool same_surfaces = widgets_.size() == surfaces_.size() && std::ranges::all_of(std::views::iota(size_t{0}, widgets_.size()), [&](size_t i) {
    return widgets_[i] && widgets_[i]->GetView() && widgets_[i]->GetView()->GetAuxPersonCaptureSurfaceId() == surfaces_[i];
  });
  const auto weak = weak_factory_.GetWeakPtr();
  const bool admitted = !failed_ && Current();
  if (!weak) return;
  if (!admitted || !same_surfaces || !result.has_value()) { failed_ = true; Cleanup(); return; }
  auto* view = web_contents()->GetRenderWidgetHostView();
  if (!view || view->GetVisibleViewportSizeDevicePx() != viewport_pixels_ ||
      view->GetVisibleViewportSize() != gfx::Size(viewport_width_, viewport_height_)) { failed_ = true; Cleanup(); return; }
  const auto& bitmap = result->bitmap;
  width_ = bitmap.width(); height_ = bitmap.height();
  if (bitmap.width() != viewport_pixels_.width() || bitmap.height() != viewport_pixels_.height() || bitmap.drawsNothing() || width_ <= 0 || height_ <= 0 || width_ > 16384 || height_ > 16384 ||
      static_cast<int64_t>(width_) * height_ > 50000000 || scale_ <= 0 || scale_ > 8) { failed_ = true; Cleanup(); return; }
  auto encoded = gfx::PNGCodec::EncodeBGRASkBitmap(bitmap, false);
  if (!encoded || encoded->empty() || encoded->size() > 6291456) { failed_ = true; Cleanup(); return; }
  png_ = base::Base64Encode(*encoded);
  Dispatch("current");
}
void NativePersonCaptureController::Cleanup() {
  if (restoring_) return;
  restoring_ = true;
  Dispatch("restore");
}
void NativePersonCaptureController::Deadline() {
  failed_ = true;
  // Never clear the original busy/mask owner on a timeout. Late callbacks must
  // still restore the exact original documents; new captures stay refused.
  const auto weak = weak_factory_.GetWeakPtr();
  if (reply_) std::move(reply_).Run(Fault(true));
  if (weak && !pending_) Cleanup();
}
void NativePersonCaptureController::Finish() {
  deadline_.Stop();
  const auto weak = weak_factory_.GetWeakPtr();
  const bool accepted = !failed_ && !cleanup_debt_ && Current() && !png_.empty();
  if (!weak) return;
  const bool debt = cleanup_debt_;
  auto callback = std::move(reply_);
  auto result = Fault(debt);
  if (accepted) {
    identity_.Set("captureId", capture_id_);
    identity_.Set("masking", "editable-all-frames");
    identity_.Set("pngBase64", png_);
    identity_.Set("width", viewport_width_);
    identity_.Set("height", viewport_height_);
    identity_.Set("pixelWidth", width_);
    identity_.Set("pixelHeight", height_);
    identity_.Set("scale", scale_);
    result = base::DictValue().Set("result", std::move(identity_));
  }
  // Unknown style/restoration debt permanently blocks this original controller.
  // Clear known-clean state before a callback may synchronously destroy/reenter.
  if (!debt) {
    frames_.clear(); widgets_.clear(); surfaces_.clear(); submission_tokens_.clear(); widget_viewports_.clear(); widget_pixel_viewports_.clear(); capture_id_.clear(); identity_.clear(); current_.Reset(); png_.clear();
    pending_ = 0; failed_ = false; restoring_ = false; root_submission_ = false;
  }
  if (callback) std::move(callback).Run(std::move(result));
}
void NativePersonCaptureController::Retire() { if (!capture_id_.empty()) Deadline(); }
void NativePersonCaptureController::WebContentsDestroyed() {
  weak_factory_.InvalidateWeakPtrs();
  failed_ = true;
  if (reply_) std::move(reply_).Run(Fault(false));
}
}
