import { join } from "node:path";
import { DATA_DIR, log } from "../app/bootstrap.js";
import { BrowserStore } from "./browser-store.js";
import { TabCatalog } from "./catalog.js";

// ---------- tab catalog: main-owned browser truth (§7.1/§7.2) ----------
export const tabCatalog = new TabCatalog();
export const browserStore = new BrowserStore({
  dir: join(DATA_DIR, "browser-state"),
  workerUrl: new URL("./browser-store.cjs", import.meta.url),
  onError: error => log("browser store degraded:", error.message),
  snapshot: () => tabCatalog.snapshot(),
});
// The worker reads the catalog while the app is still becoming ready.
export const savedCatalogLoad = browserStore.load();
