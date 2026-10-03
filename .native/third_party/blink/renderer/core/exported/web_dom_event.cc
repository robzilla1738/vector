/*
 * Copyright (C) 2010 Google Inc. All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *     * Redistributions of source code must retain the above copyright
 * notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above
 * copyright notice, this list of conditions and the following disclaimer
 * in the documentation and/or other materials provided with the
 * distribution.
 *     * Neither the name of Google Inc. nor the names of its
 * contributors may be used to endorse or promote products derived from
 * this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

#include "third_party/blink/public/web/web_dom_event.h"

#include "base/memory/scoped_refptr.h"
#include "third_party/blink/public/platform/web_string.h"
#include "third_party/blink/renderer/bindings/core/v8/v8_event.h"
#include "third_party/blink/renderer/core/dom/element.h"
#include "third_party/blink/renderer/core/event_type_names.h"
#include "third_party/blink/renderer/core/html/forms/html_button_element.h"
#include "third_party/blink/renderer/platform/wtf/casting.h"
#include "third_party/blink/renderer/core/dom/events/event.h"

namespace blink {

WebDOMEvent WebDOMEvent::FromV8Value(v8::Isolate* isolate,
                                     v8::Local<v8::Value> value) {
  return WebDOMEvent(V8Event::ToWrappable(isolate, value));
}

base::UnguessableToken WebDOMEvent::TakeNativeStopInputForCurrentDispatch(
    const WebString& original_run_id) {
  Event* event = private_.Get();
  if (!event || original_run_id.IsEmpty() || !event->isTrusted() ||
      !event->IsBeingDispatched() || event->type() != event_type_names::kClick ||
      event->NativeMeasurementInputId().is_empty() || !event->target())
    return {};
  auto* target = event->target()->ToNode();
  if (!target || !target->isConnected())
    return {};
  // Fixed compiled shell control, not an arbitrary command/method selector.
  // Stop's icon may be the click target, so permit only bounded ancestry.
  for (int depth = 0; target && depth < 16; ++depth, target = target->parentNode()) {
    auto* button = DynamicTo<HTMLButtonElement>(target);
    if (!button)
      continue;
    if (button->IsDisabledFormControl() ||
        button->getAttribute(AtomicString("data-native-stop-run")) !=
            String(original_run_id))
      return {};
    return event->TakeNativeMeasurementInputId();
  }
  return {};
}

void WebDOMEvent::Reset() {
  Assign(nullptr);
}

void WebDOMEvent::Assign(const WebDOMEvent& other) {
  private_ = other.private_;
}

void WebDOMEvent::Assign(Event* event) {
  private_ = event;
}

WebDOMEvent::WebDOMEvent(Event* event) : private_(event) {}

WebDOMEvent::operator Event*() const {
  return private_.Get();
}

}  // namespace blink
