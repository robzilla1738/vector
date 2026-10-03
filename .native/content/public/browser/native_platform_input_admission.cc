// Copyright 2026 The Aux Authors
#include "content/public/browser/native_platform_input_admission.h"

#include "content/public/browser/render_widget_host.h"
#include "content/public/browser/web_contents.h"

namespace content {

NativePlatformInputAdmission::NativePlatformInputAdmission(
    base::WeakPtr<WebContents> contents,
    base::WeakPtr<RenderWidgetHost> widget,
    const WeakDocumentPtr& document,
    const gfx::NativeEvent& event,
    base::TimeTicks admitted_ticks)
    : contents_(contents),
      widget_(widget),
      document_(document),
      event_(event),
      admitted_ticks_(admitted_ticks) {}

NativePlatformInputAdmission::~NativePlatformInputAdmission() = default;

bool NativePlatformInputAdmission::PublishMeasurementId(
    const base::UnguessableToken& id) const {
  if (!consumed_ || id.is_empty() || !measurement_id_.is_empty())
    return false;
  measurement_id_ = id;
  return true;
}
const base::UnguessableToken& NativePlatformInputAdmission::measurement_id() const {
  return measurement_id_;
}

}  // namespace content
