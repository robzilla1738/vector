#import <AppKit/AppKit.h>
#import <objc/runtime.h>
#include <node_api.h>

// Keep Chromium's original content view alive inside the public AppKit container.
// A sibling glass view does not provide AppKit's content treatments.
static char glassKey;

static napi_value SetEnabled(napi_env env, napi_callback_info info) {
  size_t count = 2, length = 0;
  napi_value arguments[2];
  void *bytes = nullptr;
  bool enabled = false;
  napi_get_cb_info(env, info, &count, arguments, nullptr, nullptr);
  if (count != 2 || napi_get_buffer_info(env, arguments[0], &bytes, &length) != napi_ok ||
      length != sizeof(void *) || napi_get_value_bool(env, arguments[1], &enabled) != napi_ok) {
    napi_throw_type_error(env, nullptr, "Expected native window handle and enabled boolean");
    return nullptr;
  }
  if (![NSThread isMainThread]) {
    napi_throw_error(env, nullptr, "Liquid Glass must be configured on the AppKit main thread");
    return nullptr;
  }
  bool supported = false;
  if (@available(macOS 26.0, *)) {
    supported = true;
    NSView *nativeView = (__bridge NSView *)*(void **)bytes;
    NSWindow *window = nativeView.window;
    if (!window) {
      napi_throw_error(env, nullptr, "Native window is no longer available");
      return nullptr;
    }
    NSGlassEffectView *installed = objc_getAssociatedObject(window, &glassKey);
    if (enabled && !installed) {
      NSView *content = window.contentView;
      NSGlassEffectView *glass = [[NSGlassEffectView alloc] initWithFrame:content.frame];
      glass.style = NSGlassEffectViewStyleRegular;
      glass.cornerRadius = 0;
      window.contentView = glass;
      glass.contentView = content;
      objc_setAssociatedObject(window, &glassKey, glass, OBJC_ASSOCIATION_RETAIN_NONATOMIC);
    } else if (!enabled && installed) {
      NSView *content = installed.contentView;
      installed.contentView = nil;
      window.contentView = content;
      objc_setAssociatedObject(window, &glassKey, nil, OBJC_ASSOCIATION_RETAIN_NONATOMIC);
    }
    if (enabled) {
      // Keep the window backing transparent across material/theme changes.
      window.opaque = NO;
      window.backgroundColor = NSColor.clearColor;
    }
    // Replacing contentView resets the frame's title-bar configuration.
    window.titlebarAppearsTransparent = YES;
    window.styleMask |= NSWindowStyleMaskFullSizeContentView;
    window.titleVisibility = NSWindowTitleHidden;
  }
  napi_value result;
  napi_get_boolean(env, supported, &result);
  return result;
}

static napi_value Initialize(napi_env env, napi_value exports) {
  napi_value function;
  napi_create_function(env, "setEnabled", NAPI_AUTO_LENGTH, SetEnabled, nullptr, &function);
  napi_set_named_property(env, exports, "setEnabled", function);
  return exports;
}
NAPI_MODULE(NODE_GYP_MODULE_NAME, Initialize)
