// Copyright 2026 The Aux Authors
#ifndef CONTENT_PUBLIC_BROWSER_NATIVE_PLATFORM_INPUT_ADMISSION_H_
#define CONTENT_PUBLIC_BROWSER_NATIVE_PLATFORM_INPUT_ADMISSION_H_
#include "base/memory/weak_ptr.h"
#include "content/common/content_export.h"
#include "content/public/browser/weak_document_ptr.h"
#include "base/time/time.h"
#include "ui/gfx/native_ui_types.h"
namespace content {
class WebContents;
class RenderWidgetHost;
class RenderWidgetHostViewMac;
// Stack-bound one-use original platform admission. Only the native view can
// construct this after matching its browser-issued current-document binding.
// It cannot be constructed by a renderer, protocol client or runtime API.
class CONTENT_EXPORT NativePlatformInputAdmission final {
 public:
  ~NativePlatformInputAdmission();
  NativePlatformInputAdmission(const NativePlatformInputAdmission&) = delete;
  NativePlatformInputAdmission& operator=(const NativePlatformInputAdmission&) = delete;
  WebContents* contents() const { return contents_.get(); }
  RenderWidgetHost* widget() const { return widget_.get(); }
  const WeakDocumentPtr& document() const { return document_; }
  const gfx::NativeEvent& event() const { return event_; }
  base::TimeTicks admitted_ticks() const { return admitted_ticks_; }
  bool Consume() const {
    if (consumed_)
      return false;
    consumed_ = true;
    return true;
  }
 private:
  friend class RenderWidgetHostViewMac;
  NativePlatformInputAdmission(base::WeakPtr<WebContents> contents,
                               base::WeakPtr<RenderWidgetHost> widget,
                               const WeakDocumentPtr& document,
                               const gfx::NativeEvent& event,
                               base::TimeTicks admitted_ticks);
  const base::WeakPtr<WebContents> contents_;
  const base::WeakPtr<RenderWidgetHost> widget_;
  const WeakDocumentPtr document_;
  const gfx::NativeEvent event_;
  const base::TimeTicks admitted_ticks_;
  mutable bool consumed_ = false;
};
}
#endif
