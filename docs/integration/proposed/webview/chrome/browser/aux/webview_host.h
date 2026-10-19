// Copyright 2026 Aux Authors. All rights reserved.
#ifndef CHROME_BROWSER_AUX_WEBVIEW_HOST_H_
#define CHROME_BROWSER_AUX_WEBVIEW_HOST_H_
#include "chrome/common/aux_webview.mojom.h"
#include "mojo/public/cpp/bindings/pending_receiver.h"
namespace content { class RenderFrameHost; }
namespace aux {
void BindWebViewHost(content::RenderFrameHost* frame,
                    mojo::PendingReceiver<mojom::WebViewHost> receiver);
}  // namespace aux
#endif
