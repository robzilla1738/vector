import { BUNDLED_FILTER_SOURCES } from "@aux/contracts/filter-defaults.generated";
import { staticFieldErrorProps } from "../ui/class-props";
import { staticHintProps, staticRowProps } from "../ui/class-props";
import { smallButtonProps, smallGhostButtonProps } from "../ui/button-props";
import "./FilterListManager.css";
import { errorMessage } from "../error-message";
import { useState } from "react";
import { filterSourceUrl } from "@aux/contracts";
import type { FilterListsController } from "./use-filter-lists";
import { nativeButtonTypeProps as auxNativeButtonTypeProps } from "../ui/native-attribute-props";
import { staticDrawerSectionProps as auxClassDrawerSectionProps } from "../ui/class-props";
import { nativeStatusRoleProps, nativeAlertRoleProps } from "../ui/native-attribute-props";

/** Real native subscription status; unavailable builds never claim filtering. */
export type FilterSourceDraft = { name: string; url: string; kind: "adblock" | "hosts" };

export function FilterListManager({
  controller,
  initialSelectedId = "",
  initialSource,
}: {
  controller: FilterListsController;
  initialSelectedId?: string;
  initialSource?: FilterSourceDraft;
}) {
  const { status, busy, error, notice } = controller;
  const [selectedId, setSelectedId] = useState(initialSelectedId);
  const [name, setName] = useState(initialSource?.name ?? "");
  const [url, setUrl] = useState(initialSource?.url ?? "");
  const [kind, setKind] = useState<"adblock" | "hosts">(initialSource?.kind ?? "adblock");
  const [review, setReview] = useState<{ name: string; url: string; kind: "adblock" | "hosts" } | null>(null);
  const selected = status?.sources.find((source) => source.id === selectedId) ?? status?.sources[0];
  const compilationWarning = status?.compilationWarnings.find(
    (warning) => warning.sourceId === selected?.id && warning.sourceSha256 === selected?.meta?.sha256,
  );
  const unavailable = !status || status.backend === "unavailable";

  const inspect = () => {
    try {
      const normalized = filterSourceUrl(url.trim());
      const label = name.trim().slice(0, 120) || new URL(normalized).hostname;
      setReview({ name: label, url: normalized, kind });
      controller.reportError("");
    } catch (reason) {
      controller.reportError(errorMessage(reason));
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
              aria-current={selected?.id === source.id ? "true" : undefined}
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
                  onClick={() => void controller.toggle(selected)}
                >
                  {selected.enabled ? "Pause list" : "Enable list"}
                </button>
                <button
                  {...smallGhostButtonProps}
                  disabled={busy || unavailable}
                  onClick={() => void controller.remove(selected.id)}
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
            onClick={() => void controller.update()}
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
                disabled={busy || unavailable}
                onClick={() => {
                  void controller.add(review).then((next) => {
                    if (!next) return;
                    setSelectedId(next.sources.find((source) => source.url === review.url)?.id ?? "");
                    setReview(null);
                    setName("");
                    setUrl("");
                  });
                }}
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
