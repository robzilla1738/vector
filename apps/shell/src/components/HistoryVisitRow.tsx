import { memo, type RefObject } from "react";
import type { HistoryEntry } from "@aux/contracts";
import { backgroundLink } from "../browser-links";
import { useStore } from "../store";
import { orderedPages } from "../store/pages";
import { ActionMenu } from "../ui";
import { shellIconBookmark, shellIconBookmarkFill, shellIconTrash } from "../ui/icons";
import { hostOf } from "../workspace";
import { FavIcon } from "./SiteTile";

export const HistoryVisitRow = memo(function HistoryVisitRow({
  item,
  firstResult,
  busy,
  bookmarked,
  onOpen,
  onBookmark,
  onRemove,
}: {
  item: HistoryEntry;
  firstResult?: RefObject<HTMLButtonElement | null>;
  busy: boolean;
  bookmarked: boolean;
  onOpen(item: HistoryEntry, background?: boolean, trigger?: HTMLElement): void;
  onBookmark(): void;
  onRemove(): void;
}) {
  const favicon = useStore(
    (state) => orderedPages(state.pages).find((page) => page.url === item.url)?.favicon,
  );
  const title = item.title || hostOf(item.url);
  const date = new Date(item.visitedAt);
  return (
    <div className="library-item">
      <button
        ref={firstResult}
        className="library-open"
        disabled={busy}
        onClick={(event) => onOpen(item, backgroundLink(event), event.currentTarget)}
        onAuxClick={(event) => {
          if (event.button === 1) {
            event.preventDefault();
            onOpen(item, true, event.currentTarget);
          }
        }}
        title={`${title} — ${item.url}`}
      >
        <time className="library-time" dateTime={date.toISOString()}>
          {date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}
        </time>
        <span className="library-history-icon" aria-hidden="true">
          <FavIcon url={item.url} src={favicon} size="sm" />
        </span>
        <span className="library-history-detail">
          <span className="library-title">{title}</span>
          <span className="library-url">{hostOf(item.url)}</span>
        </span>
      </button>
      <div className="library-actions">
        <ActionMenu
          label={`Actions for ${title}`}
          actions={[
            {
              label: bookmarked ? "Already bookmarked" : "Bookmark page",
              icon: bookmarked ? shellIconBookmarkFill : shellIconBookmark,
              disabled: busy || bookmarked,
              onSelect: onBookmark,
            },
            {
              label: "Remove this visit",
              icon: shellIconTrash,
              danger: true,
              disabled: busy,
              onSelect: onRemove,
            },
          ]}
        />
      </div>
    </div>
  );
});
