import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import { bridge, type FilterListStatus } from "../bridge";
import { errorMessage } from "../error-message";

type Source = FilterListStatus["sources"][number];
type Draft = Pick<Source, "name" | "url" | "kind">;
type Lease = { token: { active: boolean }; read: number };
type View = { owner: object | null; status: FilterListStatus | null; error: string; notice: string };
const emptyView: View = { owner: null, status: null, error: "", notice: "" };

/** One native mutation owner shared by the catalog, action menu and mounted editor. */
export function useFilterLists(active: boolean) {
  const token = useMemo(() => ({ active }), [active]);
  const owner = useRef<Lease | null>(null);
  const pending = useRef(false);
  const latest = useRef(emptyView);
  const [view, setView] = useState(emptyView);
  const [busy, setBusy] = useState(false);
  const current = useCallback((lease: Lease) => owner.current === lease && lease.token.active, []);
  const publish = useCallback((next: View) => {
    latest.current = next;
    setView(next);
  }, []);
  const load = useCallback(
    async (lease: Lease) => {
      if (!current(lease) || pending.current) return;
      const request = ++lease.read;
      try {
        const status = await bridge.filterLists();
        if (current(lease) && request === lease.read)
          publish({ owner: lease.token, status, error: "", notice: "" });
      } catch (reason) {
        if (current(lease) && request === lease.read)
          publish({ owner: lease.token, status: null, error: errorMessage(reason), notice: "" });
      }
    },
    [current, publish],
  );
  useLayoutEffect(() => {
    const lease = { token, read: 0 };
    owner.current = lease;
    void load(lease);
    return () => {
      owner.current = null;
      ++lease.read;
    };
  }, [token, load]);
  const refresh = useCallback(async () => {
    const lease = owner.current;
    if (lease?.token === token) await load(lease);
  }, [token, load]);

  async function action(work: () => Promise<FilterListStatus>, notice: string) {
    const lease = owner.current;
    const status = latest.current.owner === token ? latest.current.status : null;
    if (
      !lease ||
      lease.token !== token ||
      !current(lease) ||
      pending.current ||
      !status ||
      status.backend === "unavailable"
    )
      return;
    pending.current = true;
    ++lease.read;
    setBusy(true);
    publish({ owner: token, status, error: "", notice: "" });
    try {
      const next = await work();
      if (!current(lease)) return;
      if (next.backend === "unavailable") {
        publish({
          owner: token,
          status: next,
          error: "Native filtering unavailable. Review its status before trying again.",
          notice: "",
        });
        return;
      }
      publish({ owner: token, status: next, error: "", notice });
      return next;
    } catch (reason) {
      if (current(lease)) publish({ owner: token, status, error: errorMessage(reason), notice: "" });
    } finally {
      pending.current = false;
      if (owner.current) setBusy(false);
      // A reactivated owner reads actual native state after the original work settles.
      if (!current(lease) && owner.current) void load(owner.current);
    }
  }
  const status = active && view.owner === token ? view.status : null;
  return {
    status,
    busy,
    error: active && view.owner === token ? view.error : "",
    notice: active && view.owner === token ? view.notice : "",
    refresh,
    reportError(message: string) {
      const lease = owner.current;
      if (lease?.token === token && current(lease) && !pending.current) {
        const status = latest.current.owner === token ? latest.current.status : null;
        publish({ owner: token, status, error: message, notice: "" });
      }
    },
    update() {
      if (!status?.sources.length) return Promise.resolve(undefined);
      return action(
        () => bridge.updateFilters(),
        "Enabled lists checked. Review source update status and any errors.",
      );
    },
    toggle(source: Source) {
      return action(
        async () => {
          await bridge.setFilterSourceEnabled(source.id, !source.enabled);
          return bridge.filterLists();
        },
        source.enabled
          ? "List paused for new requests and documents. Reload an open page to clear changes already applied."
          : "List enabled. Check its update status above.",
      );
    },
    remove(sourceId: string) {
      return action(async () => {
        await bridge.removeFilterSource(sourceId);
        return bridge.filterLists();
      }, "List removed from this browser.");
    },
    add(source: Draft) {
      return action(async () => {
        await bridge.addFilterSource(source.name, source.url, source.kind);
        return bridge.filterLists();
      }, "List added. Review its download status above.");
    },
  };
}

export type FilterListsController = ReturnType<typeof useFilterLists>;
