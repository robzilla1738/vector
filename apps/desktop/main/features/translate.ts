import { registry } from "../app/services.js";
import { requireRuntime, runtimeInvoke } from "../runtime/supervisor.js";
import { broadcastToShells } from "../windows/registry.js";
import { createPageTranslator } from "./page-translator.js";

export const translator = createPageTranslator({
  contents: pageId => registry.get(pageId)?.view.webContents,
  invoke: (method, params) => runtimeInvoke(method, params),
  ready: () => requireRuntime("Translation is unavailable while the runtime is offline."),
  send: payload => broadcastToShells("translation-changed", payload),
});
