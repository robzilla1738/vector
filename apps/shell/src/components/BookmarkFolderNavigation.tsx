import { useEffect, useState, type ReactNode } from "react";
import type { BookmarkFolderSnapshot } from "@aux/contracts/bookmark-folder-methods";
import { shellIconDown, shellIconRight, shellIconFolder, shellIconFolderClosed } from "../ui/icons";

/** Navigation uses native node IDs, so equal folder names never share selection. */
export function BookmarkFolderNavigation({
  snapshot,
  selectedId,
  disabled,
  onSelect,
}: {
  snapshot: BookmarkFolderSnapshot;
  selectedId: string;
  disabled: boolean;
  onSelect(id: string): void;
}) {
  const [collapsed, setCollapsed] = useState<Set<string>>(() => new Set());
  useEffect(() => {
    const parents = new Set<string>();
    let folder = snapshot.folders.find((item) => item.nodeId === selectedId);
    while (folder?.parentId && !parents.has(folder.parentId)) {
      parents.add(folder.parentId);
      folder = snapshot.folders.find((item) => item.nodeId === folder?.parentId);
    }
    setCollapsed((previous) => new Set([...previous].filter((id) => !parents.has(id))));
  }, [snapshot, selectedId]);
  const byId = new Map(snapshot.folders.map((item) => [item.nodeId, item]));
  const roots = [
    snapshot.rootId,
    ...snapshot.folders
      .filter((folder) => folder.parentId === null && folder.nodeId !== snapshot.rootId)
      .map((folder) => folder.nodeId),
  ];
  const renderFolder = (id: string, ancestors: Set<string>): ReactNode => {
    const folder = byId.get(id);
    if (!folder || ancestors.has(id)) return null;
    const children = folder.childIds.filter((childId) => byId.has(childId));
    const expanded = !collapsed.has(id);
    return (
      <li key={id}>
        <div className="library-folder-nav-row">
          {children.length ? (
            <button
              type="button"
              className="library-folder-disclosure"
              aria-label={`${expanded ? "Collapse" : "Expand"} ${folder.title}`}
              aria-expanded={expanded}
              disabled={disabled}
              onClick={() =>
                setCollapsed((previous) => {
                  const next = new Set(previous);
                  if (expanded) next.add(id);
                  else next.delete(id);
                  return next;
                })
              }
            >
              {expanded ? shellIconDown : shellIconRight}
            </button>
          ) : (
            <span className="library-folder-disclosure" />
          )}
          <button
            type="button"
            className="library-folder-destination"
            aria-current={selectedId === id ? "location" : undefined}
            title={folder.path.join(" / ") || folder.title}
            disabled={disabled}
            onClick={() => onSelect(id)}
          >
            {selectedId === id ? shellIconFolder : shellIconFolderClosed}
            <span>{folder.title || "Untitled folder"}</span>
          </button>
        </div>
        {!!children.length && (
          <ul hidden={!expanded}>
            {children.map((childId) => renderFolder(childId, new Set([...ancestors, id])))}
          </ul>
        )}
      </li>
    );
  };
  return (
    <nav className="library-folder-navigation" aria-label="Browse bookmark folders">
      <ul>{roots.map((id) => renderFolder(id, new Set()))}</ul>
    </nav>
  );
}
