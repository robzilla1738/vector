import { RpcChannel } from "@aux/contracts";
import { registry } from "../../app/services.js";
import { wakePage } from "../../tabs/lifecycle-controller.js";
import { onNative } from "./validate.js";

export function registerCaptureMethods(ch: RpcChannel) {
  onNative(ch, "native.capturePage", async ({ pageId, scale }) => {
    const entry = registry.get(pageId);
    if (!entry) throw new Error(`no view for ${pageId}`);
    await wakePage(entry);
    const img = await entry.view.webContents.capturePage(undefined, { stayHidden: true, stayAwake: true });
    if (img.isEmpty()) throw new Error("The page has no image available yet. Open the tab and try again.");
    const size = img.getSize();
    const resized = scale < 1 ? img.resize({ width: Math.round(size.width * scale) }) : img;
    return { dataUrl: resized.toDataURL(), width: resized.getSize().width, height: resized.getSize().height, scale: 1 };
  });
}
