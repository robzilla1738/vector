import { errorMessage } from "./error-message";
import { bridge } from "./bridge";
import { toast, useStore } from "./store";

export async function printCurrentPage(pageId: string | null) {
  const state = useStore.getState();
  const page = state.pages.byId[pageId ?? ""];
  if (
    state.mode !== "focus" ||
    !page ||
    page.backend !== "aux" ||
    (page.url === "about:blank" && !page.showBlankDocument)
  )
    throw new Error("Open the browser page you want to print first.");
  await bridge.printPage(page.pageId);
}

export async function savePagePdf(pageId: string | null) {
  const page = useStore.getState().pages.byId[pageId ?? ""];
  if (
    useStore.getState().mode !== "focus" ||
    !page ||
    page.backend !== "aux" ||
    (page.url === "about:blank" && !page.showBlankDocument)
  ) {
    throw new Error("Open a page in Aux’s browser to save a PDF.");
  }
  try {
    const path = await bridge.savePagePdf(page.pageId);
    toast(path ? "Page saved as PDF" : "PDF export canceled");
  } catch (error) {
    const message = errorMessage(error);
    throw new Error(message.replace(/^Error invoking remote method [^:]+: Error: /, ""));
  }
}
