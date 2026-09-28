import "./FileTree.css";
import { useEffect, useMemo, useRef, useState } from 'react';
import { I } from './icons';

type Node = { path: string; name: string; directory: boolean; children: Node[] };
const parents = (path: string) => path.split('/').slice(0, -1).map((_, i) => path.split('/').slice(0, i + 1).join('/'));
function hierarchy(paths: string[]): Node[] {
  const roots: Node[] = [], nodes = new Map<string, Node>();
  for (const path of new Set(paths)) {
    const parts = path.split('/'); let siblings = roots;
    parts.forEach((name, depth) => {
      const current = parts.slice(0, depth + 1).join('/');
      let node = nodes.get(current);
      if (!node) { node = { path: current, name, directory: depth < parts.length - 1, children: [] }; nodes.set(current, node); siblings.push(node); }
      siblings = node.children;
    });
  }
  const sort = (items: Node[]) => { items.sort((a, b) => Number(b.directory) - Number(a.directory) || a.name.localeCompare(b.name)); items.forEach(node => sort(node.children)); };
  sort(roots); return roots;
}

/** Aside file-tree geometry, with one keyboard tab stop and Aux-owned file access. */
export function FileTree({ paths, selected, onSelect, disabled = false, expandAll = false }: {
  paths: string[]; selected?: string; onSelect(path: string): void; disabled?: boolean; expandAll?: boolean;
}) {
  const roots = useMemo(() => hierarchy(paths), [paths]);
  const [expanded, setExpanded] = useState(() => new Set(parents(selected ?? '')));
  const [focused, setFocused] = useState(selected ?? '');
  const buttons = useRef(new Map<string, HTMLButtonElement>());
  useEffect(() => { if (selected) setExpanded(value => new Set([...value, ...parents(selected)])); }, [selected]);
  useEffect(() => { if (expandAll) setExpanded(value => new Set([...value, ...paths.flatMap(parents)])); }, [expandAll, roots]);
  const visible: { node: Node; depth: number; position: number; size: number }[] = [];
  const visit = (nodes: Node[], depth: number) => nodes.forEach((node, index) => {
    visible.push({ node, depth, position: index + 1, size: nodes.length });
    if (node.directory && expanded.has(node.path)) visit(node.children, depth + 1);
  });
  visit(roots, 1);
  const tabStop = visible.some(({ node }) => node.path === focused) ? focused : visible.find(({ node }) => node.path === selected)?.node.path ?? visible[0]?.node.path;
  const toggle = (path: string, open?: boolean) => setExpanded(value => {
    const next = new Set(value); if (open ?? !next.has(path)) next.add(path); else next.delete(path); return next;
  });
  const focus = (index: number) => { const path = visible[index]?.node.path; if (path) { setFocused(path); buttons.current.get(path)?.focus(); } };
  return <div className="ui-file-tree" role="tree" aria-label="Project files" aria-busy={disabled || undefined}>
    {visible.map(({ node, depth, position, size }, index) => <button key={node.path} ref={element => { if (element) buttons.current.set(node.path, element); else buttons.current.delete(node.path); }}
      type="button" role="treeitem" aria-level={depth} aria-posinset={position} aria-setsize={size}
      aria-expanded={node.directory ? expanded.has(node.path) : undefined} aria-selected={!node.directory && node.path === selected}
      tabIndex={node.path === tabStop ? 0 : -1} disabled={disabled} title={node.path}
      style={{ paddingLeft: 8 + (depth - 1) * 14 }} onFocus={() => setFocused(node.path)}
      onClick={() => node.directory ? toggle(node.path) : onSelect(node.path)}
      onKeyDown={event => {
        if (event.key === 'ArrowDown') { event.preventDefault(); focus(Math.min(index + 1, visible.length - 1)); }
        else if (event.key === 'ArrowUp') { event.preventDefault(); focus(Math.max(index - 1, 0)); }
        else if (event.key === 'Home') { event.preventDefault(); focus(0); }
        else if (event.key === 'End') { event.preventDefault(); focus(visible.length - 1); }
        else if (event.key === 'ArrowRight' && node.directory) { event.preventDefault(); if (expanded.has(node.path)) focus(index + 1); else toggle(node.path, true); }
        else if (event.key === 'ArrowLeft') { event.preventDefault(); if (node.directory && expanded.has(node.path)) toggle(node.path, false); else focus(visible.findIndex(item => item.node.path === parents(node.path).at(-1))); }
      }}>
      <span className="ui-file-icon" aria-hidden="true">{node.directory ? expanded.has(node.path) ? I.folder : I.folderClosed : I.code}</span>
      <span className="ui-file-name">{node.name}</span>
      {node.directory && <span className={`ui-file-disclosure${expanded.has(node.path) ? ' open' : ''}`} aria-hidden="true">{I.right}</span>}
    </button>)}
  </div>;
}
