import { bridge } from "./bridge";
import { toast, useStore } from "./store";

export async function savePagePdf(pageId: string | null) {
  const page = useStore.getState().pages.find(page => page.pageId === pageId);
  if (!page || page.backend !== "vector" || page.url === "about:blank") {
    throw new Error("Open a page in Aux’s browser to save a PDF.");
  }
  try {
    const path = await bridge.savePagePdf(page.pageId);
    toast(path ? "Page saved as PDF" : "PDF export canceled");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(message.replace(/^Error invoking remote method [^:]+: Error: /, ""));
  }
}
