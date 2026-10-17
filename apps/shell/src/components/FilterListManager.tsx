import { BUNDLED_FILTER_SOURCES } from "@aux/contracts/filter-defaults.generated";
import { staticFieldErrorProps } from "../ui/class-props";
import { staticHintProps, staticRowProps } from "../ui/class-props";
import { smallButtonProps, smallGhostButtonProps } from "../ui/button-props";
import { errorMessage } from "../error-message";
import "./FilterListManager.css";
import { useEffect, useRef, useState } from "react";
import { filterSourceUrl } from "@aux/contracts";
import { bridge, type FilterListStatus } from "../bridge";
import { nativeButtonTypeProps as auxNativeButtonTypeProps } from "../ui/native-attribute-props";
import { staticDrawerSectionProps as auxClassDrawerSectionProps } from "../ui/class-props";
import { nativeStatusRoleProps, nativeAlertRoleProps } from "../ui/native-attribute-props";

const messageOf = (reason: unknown) => errorMessage(reason);

/** Real native subscription status; unavailable builds never claim filtering. */
export type FilterSourceDraft = { name: string; url: string; kind: "adblock" | "hosts" };

export function FilterListManager({
  initialSelectedId = "",
  initialSource,
  onBusyChange,
}: {
  initialSelectedId?: string;
  initialSource?: FilterSourceDraft;
  onBusyChange?(busy: boolean): void;
} = {}) {
  const [status, setStatus] = useState<FilterListStatus | null>(null);
  const [selectedId, setSelectedId] = useState(initialSelectedId);
  const [name, setName] = useState(initialSource?.name ?? "");
  const [url, setUrl] = useState(initialSource?.url ?? "");
  const [kind, setKind] = useState<"adblock" | "hosts">(initialSource?.kind ?? "adblock");
  const [review, setReview] = useState<{ name: string; url: string; kind: "adblock" | "hosts" } | null>(null);
  const [busy, setBusy] = useState(false);
  const pending = useRef(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const selected = status?.sources.find((source) => source.id === selectedId);
  const compilationWarning = status?.compilationWarnings.find(
    (warning) => warning.sourceId === selected?.id && warning.sourceSha256 === selected?.meta?.sha256,
  );
  const unavailable = status?.backend === "unavailable";

  const refresh = async () => {
    const next = await bridge.filterLists();
    setStatus(next);
    setSelectedId((current) =>
      next.sources.some((source) => source.id === current) ? current : (next.sources[0]?.id ?? ""),
    );
    return next;
  };
  useEffect(() => {
    void refresh().catch((reason) => setError(messageOf(reason)));
  }, []);

  const action = async (work: () => Promise<void>) => {
    if (pending.current) return;
    pending.current = true;
    setBusy(true);
    onBusyChange?.(true);
    setError("");
    setNotice("");
    try {
      await work();
    } catch (reason) {
      setError(messageOf(reason));
    } finally {
      pending.current = false;
      setBusy(false);
      onBusyChange?.(false);
    }
  };

  const inspect = () => {
    try {
      const normalized = filterSourceUrl(url.trim());
      const label = name.trim().slice(0, 120) || new URL(normalized).hostname;
      setReview({ name: label, url: normalized, kind });
      setError("");
    } catch (reason) {
      setError(messageOf(reason));
    }
  };

  return (
    <section className="filter-manager" aria-label="Filter lists">
      <div {...auxClassDrawerSectionProps}>Filter lists</div>
      <p {...staticHintProps}>
        EasyList, EasyPrivacy and uBlock lists protect browsing from the first document. Add trusted HTTPS
        Standard or Hosts lists. Updates preserve the previous working copy when a source fails.
      </p>
      {status && (
        <p {...staticHintProps}>
          {unavailable ? "Native filtering unavailable." : "uBlock Origin native filtering."}
        </p>
      )}
      <div className="filter-manager-layout">
        <aside className="filter-manager-list" aria-label="Selected filter lists">
          {status?.sources.map((source) => (
            <button
              key={source.id}
              {...auxNativeButtonTypeProps}
              aria-current={selectedId === source.id ? "true" : undefined}
              onClick={() => setSelectedId(source.id)}
            >
              <strong>{source.name}</strong>
              <span>
                {source.enabled ? "Enabled" : "Paused"}
                {source.meta ? ` · ${source.meta.bytes.toLocaleString()} bytes` : " · Not downloaded"}
              </span>
            </button>
          ))}
          {status && !status.sources.length && <p {...staticHintProps}>No downloaded lists selected.</p>}
        </aside>
        <div className="filter-manager-detail">
          {!status && <p {...staticHintProps}>Loading filter lists…</p>}
          {status && !selected && <p {...staticHintProps}>Choose a list to review its source and status.</p>}
          {selected && (
            <>
              <strong>{selected.name}</strong>
              <span className="hint filter-manager-url">{selected.url}</span>
              <span {...staticHintProps}>
                {selected.meta?.fetchedAt
                  ? `Last checked ${new Date(selected.meta.fetchedAt).toLocaleString()}`
                  : BUNDLED_FILTER_SOURCES.some(
                        (source) => source.id === selected.id && source.sha256 === selected.meta?.sha256,
                      )
                    ? "Using the verified bundled copy."
                    : "Not downloaded."}
              </span>
              {selected.meta?.error && (
                <p {...staticFieldErrorProps} {...nativeStatusRoleProps}>
                  Last update: {selected.meta.error}. The previous copy remains available.
                </p>
              )}
              {compilationWarning && (
                <section aria-label="Filter compilation warnings" {...nativeStatusRoleProps}>
                  <p {...staticFieldErrorProps}>
                    uBlock Origin rejected {compilationWarning.rejectedCount.toLocaleString()} rules from this
                    exact source copy. Those rules are not applied.
                  </p>
                  {compilationWarning.samples.length > 0 && (
                    <ul>
                      {compilationWarning.samples.map((sample, index) => (
                        <li key={`${sample.line}:${sample.code}:${index}`}>
                          Line {sample.line}: {sample.message} ({sample.code})
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              )}
              <div {...staticRowProps}>
                <button
                  {...smallButtonProps}
                  disabled={busy || unavailable}
                  onClick={() =>
                    void action(async () => {
                      await bridge.setFilterSourceEnabled(selected.id, !selected.enabled);
                      await refresh();
                      setNotice(
                        selected.enabled
                          ? "List paused for new requests and documents. Reload an open page to clear changes already applied."
                          : "List enabled. Check its update status above.",
                      );
                    })
                  }
                >
                  {selected.enabled ? "Pause list" : "Enable list"}
                </button>
                <button
                  {...smallGhostButtonProps}
                  disabled={busy || unavailable}
                  onClick={() =>
                    void action(async () => {
                      await bridge.removeFilterSource(selected.id);
                      await refresh();
                      setNotice("List removed from this browser.");
                    })
                  }
                >
                  Remove list
                </button>
              </div>
            </>
          )}
        </div>
      </div>
      <div className="filter-manager-add">
        <label>
          List type
          <select
            aria-label="Filter list type"
            value={kind}
            disabled={busy || unavailable}
            onChange={(event) => {
              setKind(event.target.value as "adblock" | "hosts");
              setReview(null);
            }}
          >
            <option value="hosts">Domain blocking hosts list</option>
            <option value="adblock">Standard adblock list (network, cosmetic and scriptlets)</option>
          </select>
        </label>
        <label>
          List name
          <input
            aria-label="Filter list name"
            value={name}
            maxLength={120}
            disabled={busy || unavailable}
            onChange={(event) => {
              setName(event.target.value);
              setReview(null);
            }}
          />
        </label>
        <label>
          HTTPS filter list URL
          <input
            aria-label="Filter list URL"
            value={url}
            maxLength={2048}
            placeholder="https://example.com/hosts.txt"
            disabled={busy || unavailable}
            onChange={(event) => {
              setUrl(event.target.value);
              setReview(null);
            }}
          />
        </label>
        <div {...staticRowProps}>
          <button {...smallButtonProps} disabled={busy || unavailable || !url.trim()} onClick={inspect}>
            Review list
          </button>
          <button
            {...smallGhostButtonProps}
            disabled={busy || unavailable || !status?.sources.length}
            onClick={() =>
              void action(async () => {
                const next = await bridge.updateFilters();
                setStatus(next);
                setNotice("Enabled lists checked. Review any source errors above.");
              })
            }
          >
            Update enabled lists
          </button>
        </div>
        {review && (
          <div className="filter-manager-confirm" role="group" aria-label="Review filter source">
            <strong>Download this list?</strong>
            <p>
              {review.name} · {review.url}
            </p>
            <p {...staticHintProps}>
              Aux will fetch this source and use{" "}
              {review.kind === "hosts"
                ? "native Hosts-format network rules"
                : "native network, cosmetic and bundled scriptlet rules"}
              . The source sees this browser's network address.
            </p>
            <div {...staticRowProps}>
              <button
                {...smallButtonProps}
                disabled={busy}
                onClick={() =>
                  void action(async () => {
                    await bridge.addFilterSource(review.name, review.url, review.kind);
                    const next = await refresh();
                    setSelectedId(next.sources.find((source) => source.url === review.url)?.id ?? "");
                    setReview(null);
                    setName("");
                    setUrl("");
                    setNotice("List added. Review its download status above.");
                  })
                }
              >
                Add selected list
              </button>
              <button {...smallGhostButtonProps} disabled={busy} onClick={() => setReview(null)}>
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
      {error && (
        <p {...staticFieldErrorProps} {...nativeAlertRoleProps}>
          {error}
        </p>
      )}
      {notice && (
        <output {...staticHintProps} data-block>
          {notice}
        </output>
      )}
    </section>
  );
}
