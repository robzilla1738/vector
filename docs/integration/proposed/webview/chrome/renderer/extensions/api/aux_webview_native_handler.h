// Copyright 2026 Aux Authors. All rights reserved.
#ifndef CHROME_RENDERER_EXTENSIONS_API_AUX_WEBVIEW_NATIVE_HANDLER_H_
#define CHROME_RENDERER_EXTENSIONS_API_AUX_WEBVIEW_NATIVE_HANDLER_H_
#include <cstdint>
#include <map>
#include <set>
#include "base/memory/weak_ptr.h"
#include "chrome/common/aux_webview.mojom.h"
#include "extensions/renderer/object_backed_native_handler.h"
#include "mojo/public/cpp/bindings/receiver.h"
#include "mojo/public/cpp/bindings/remote.h"
#include "v8/include/v8-persistent-handle.h"
#include "v8/include/v8-promise.h"
namespace extensions {
class AuxWebViewNativeHandler final : public ObjectBackedNativeHandler,
                                     public aux::mojom::WebViewClient {
 public:
  explicit AuxWebViewNativeHandler(ScriptContext* context);
  ~AuxWebViewNativeHandler() override;
  void Invalidate() override;
 private:
  void AddRoutes() override;
  void Attach(const v8::FunctionCallbackInfo<v8::Value>& args);
  void Detach(const v8::FunctionCallbackInfo<v8::Value>& args);
  void Listen(const v8::FunctionCallbackInfo<v8::Value>& args);
  void AllowDefinition(const v8::FunctionCallbackInfo<v8::Value>& args);
  void DidAttach(uint64_t request, bool success, const std::string& lease,
                 const std::string& error);
  void Detached(const std::string& lease) override;
  void Disconnected();
  mojo::Remote<aux::mojom::WebViewHost> remote_;
  mojo::Receiver<aux::mojom::WebViewClient> receiver_{this};
  std::map<uint64_t, v8::Global<v8::Promise::Resolver>> pending_;
  std::set<std::string> leases_;
  std::set<std::string> retired_;
  v8::Global<v8::Function> listener_;
  uint64_t sequence_ = 0;
  base::WeakPtrFactory<AuxWebViewNativeHandler> weak_{this};
};
}  // namespace extensions
#endif
