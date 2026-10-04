import { errorMessage } from "../error-message";
import { bridge } from "../bridge";
import type { ClosedTab } from "../closed-tabs";
import { createEntryWriter } from "../conversation-drafts";
import { toast } from "../store";
import { type Layout, type TidyUndoRecord, emptyLayout } from "../workspace";
import { featureStage } from "../use-feature";
import type { OrganizationPersistence } from "./organization-persistence";

export const CLOSED_TABS_KEY = `aux.closed-tabs.v1:${bridge.windowId}`;
export const storage = typeof localStorage !== "undefined" ? localStorage : null;
const ephemeralOrganization =
  bridge.privateMode || bridge.windowKind !== "normal" || featureStage("spaces") !== "on";
export let layoutTimer: ReturnType<typeof setTimeout> | undefined;
export const persistClosedTabs = (tabs: ClosedTab[]) => {
  if (bridge.privateMode) return;
  try {
    storage?.setItem(CLOSED_TABS_KEY, JSON.stringify(tabs));
  } catch {
    /* Recovery remains available for this window. */
  }
};
export const initialLayout = emptyLayout();
let organizationPromise: Promise<OrganizationPersistence> | null = null;
let pendingLayout: Layout | null = null;
const organization = () =>
  (organizationPromise ??= import("./organization-persistence").then(
    (module) => new module.OrganizationPersistence(bridge, initialLayout),
  ));
const queuePending = (store: OrganizationPersistence) => {
  if (pendingLayout) {
    store.persist(pendingLayout);
    pendingLayout = null;
  }
};
let layoutStorageWarned = false;
const warnLayoutStorage = (error: unknown) => {
  if (layoutStorageWarned) return;
  layoutStorageWarned = true;
  toast(`Profile organization could not be saved: ${errorMessage(error)}`, "error");
};
/** The native host owns Profile organization; auxiliary windows remain ephemeral. */
export const loadOrganizationLayout = async () => {
  if (ephemeralOrganization) return initialLayout;
  const store = await organization();
  queuePending(store);
  const loaded = await store.hydrate();
  if (!pendingLayout) return loaded;
  const { fromOrganizationLayout, rebaseOrganizationLayout, toOrganizationLayout } =
    await import("./organization-layout");
  const rebased = fromOrganizationLayout(
    rebaseOrganizationLayout(
      toOrganizationLayout(initialLayout),
      toOrganizationLayout(pendingLayout),
      toOrganizationLayout(loaded),
    ),
  );
  store.persist(rebased);
  pendingLayout = null;
  return rebased;
};
export const reloadOrganizationLayout = async () => {
  const store = await organization();
  queuePending(store);
  return store.refresh();
};
export const adoptImportedOrganization = async () => {
  clearTimeout(layoutTimer);
  layoutTimer = undefined;
  pendingLayout = null;
  return (await organization()).adoptNativeImport();
};
/** Undo the reviewed receipt. Ephemeral sessions have no host revision to re-check. */
export const undoPersistedTidy = async (receipt: TidyUndoRecord, fallback: Layout): Promise<Layout> => {
  if (ephemeralOrganization) return (await import("../tidy-layout")).revertTidyRecord(receipt, fallback);
  const store = await organization();
  queuePending(store);
  return (await import("../tidy-commit")).undoTidyChange(store, receipt);
};
export const flushLayout = async () => {
  clearTimeout(layoutTimer);
  layoutTimer = undefined;
  if (ephemeralOrganization) return;
  try {
    const store = await organization();
    queuePending(store);
    await store.flush();
  } catch (error) {
    warnLayoutStorage(error);
    throw error;
  }
};
/** Coalesce synchronous reducers into one revision-aware host commit. */
export const persistLayout = (layout: Layout) => {
  if (ephemeralOrganization) return;
  pendingLayout = layout;
  layoutTimer ??= setTimeout(() => {
    void flushLayout().catch(() => {});
  }, 25);
};
if (typeof window !== "undefined")
  window.addEventListener("pagehide", () => {
    void flushLayout().catch(() => {});
  });

let draftStorageWarned = false;
/** One error toast per window when drafts stop reaching storage — the in-memory copy stays. */
export const warnDraftStorage = (text: string) => {
  if (!draftStorageWarned) {
    draftStorageWarned = true;
    toast(text, "error");
  }
};
export const draftWriter = createEntryWriter(storage, () =>
  warnDraftStorage("Your draft is kept in this window, but could not be saved for restart."),
);
if (typeof window !== "undefined") window.addEventListener("pagehide", draftWriter.flush);
