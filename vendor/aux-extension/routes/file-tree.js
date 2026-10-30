/* Aux-owned source, the file tree (assets/file-tree-YTG8I4Hr.js, the module body): file and open
 * folder icons, the tree and preview skeletons, and a tree of files and folders (expanded around the
 * selected path, or all at first when asked; Markdown files take their own icon).
 * Names the rest of the chunk uses keep their chunk names (all exported): D TreeSkeleton, q
 * PreviewSkeleton, O FileTree; r JSX runtime and i React stay as named.
 * Chunk names used: y/b React, v cn, N the truncating text, m Skeleton, S the closed folder icon, k the
 * chevron, M the Markdown icon, _ ScrollArea. */
var r = H(),
  /** A file. */
  FileIcon = ({size = 24, ariaHidden = true, ...props}) =>
    (0, r.jsxs)('svg', {
      viewBox: '0 0 24 24',
      fill: 'none',
      xmlns: 'http://www.w3.org/2000/svg',
      width: size,
      height: size,
      'aria-hidden': ariaHidden,
      focusable: 'false',
      ...props,
      children: [
        (0, r.jsx)('path', {
          fillRule: 'evenodd',
          clipRule: 'evenodd',
          d: 'M12 7C12 8.65685 13.3431 10 15 10H20V18C20 20.2091 18.2091 22 16 22H8C5.79086 22 4 20.2091 4 18V6C4 3.79086 5.79086 2 8 2H12V7ZM9 17C8.44772 17 8 17.4477 8 18C8 18.5523 8.44772 19 9 19H15.5C16.0523 19 16.5 18.5523 16.5 18C16.5 17.4477 16.0523 17 15.5 17H9ZM9 13C8.44772 13 8 13.4477 8 14C8 14.5523 8.44772 15 9 15H12C12.5523 15 13 14.5523 13 14C13 13.4477 12.5523 13 12 13H9Z',
          fill: 'currentColor',
        }),
        (0, r.jsx)('path', {
          d: 'M19.4141 8H15C14.4477 8 14.0001 7.55224 14 7V2.58594L19.4141 8Z',
          fill: 'currentColor',
        }),
      ],
    }),
  /** An open folder. */
  FolderOpenIcon = ({size = 24, ariaHidden = true, ...props}) =>
    (0, r.jsx)('svg', {
      viewBox: '0 0 24 24',
      fill: 'none',
      xmlns: 'http://www.w3.org/2000/svg',
      width: size,
      height: size,
      'aria-hidden': ariaHidden,
      focusable: 'false',
      ...props,
      children: (0, r.jsx)('path', {
        fillRule: 'evenodd',
        clipRule: 'evenodd',
        d: 'M6 3C3.79086 3 2 4.79086 2 7V17.5592C2 18.9072 3.09277 20 4.44076 20H18.0296C18.0345 20 18.0401 20 18.045 20C18.0636 19.9999 18.0821 19.9996 18.1006 19.9992C19.3837 19.9693 20.5093 19.1248 20.8937 17.8948L22.5494 12.5965C22.9151 11.4264 22.1542 10.2391 21 10.0318V9C21 7.34315 19.6569 6 18 6H13.0704C12.736 6 12.4238 5.8329 12.2383 5.5547L11.7226 4.7812C10.9808 3.6684 9.73186 3 8.39445 3H6ZM19 10V9C19 8.44772 18.5523 8 18 8H13.0704C12.0673 8 11.1306 7.4987 10.5742 6.6641L10.0585 5.8906C9.68762 5.3342 9.06316 5 8.39445 5H6C4.89543 5 4 5.89543 4 7V17.5592C4 17.8027 4.19734 18 4.44076 18C4.63355 18 4.80396 17.8747 4.86146 17.6907L6.60694 12.1052C6.99833 10.8527 8.15823 10 9.47038 10H19Z',
        fill: 'currentColor',
      }),
    }),
  /** The tree while it loads. */
  D = () =>
    (0, r.jsx)('div', {
      className: 'space-y-2 px-3 py-1',
      children: Array.from({length: 8}).map((s, index) =>
        (0, r.jsx)(m, {className: 'h-5', style: {width: `${80 - (index % 3) * 12}%`}}, index),
      ),
    }),
  /** A file preview while it loads. */
  q = () =>
    (0, r.jsxs)('div', {
      className: 'bg-background/20 size-full space-y-3 rounded-lg border px-4 py-3',
      children: [
        (0, r.jsx)(m, {className: 'h-4 w-1/3'}),
        (0, r.jsx)(m, {className: 'h-4 w-full'}),
        (0, r.jsx)(m, {className: 'h-4 w-5/6'}),
        (0, r.jsx)(m, {className: 'h-4 w-2/3'}),
      ],
    }),
  i = y(b(), 1),
  /** A tree of files and folders; folders open around the selected path. */
  O = ({ariaLabel, expandAllByDefault = false, nodes, renderIcon, selectedPath, onSelect}) => {
    const selectedAncestors = (0, i.useMemo)(() => (selectedPath ? ancestorPaths(selectedPath) : []), [selectedPath]),
      allDirectories = (0, i.useMemo)(
        () => (expandAllByDefault ? directoryPaths(nodes) : []),
        [expandAllByDefault, nodes],
      ),
      [expandedPaths, setExpandedPaths] = (0, i.useState)(() => new Set([...selectedAncestors, ...allDirectories])),
      seeded = (0, i.useRef)(new Set(allDirectories)),
      toggleDirectory = (0, i.useCallback)(
        path => () => {
          setExpandedPaths(current => {
            const next = new Set(current);
            return (next.has(path) ? next.delete(path) : next.add(path), next);
          });
        },
        [],
      ),
      select = (0, i.useCallback)(node => () => onSelect(node), [onSelect]);
    return (
      (0, i.useEffect)(() => {
        selectedAncestors.length !== 0 && setExpandedPaths(current => new Set([...current, ...selectedAncestors]));
      }, [selectedAncestors]),
      (0, i.useEffect)(() => {
        const added = allDirectories.filter(path => !seeded.current.has(path));
        if (added.length !== 0) {
          for (const path of added) seeded.current.add(path);
          setExpandedPaths(current => new Set([...current, ...added]));
        }
      }, [allDirectories]),
      nodes.length === 0
        ? null
        : (0, r.jsx)(_, {
            className: 'flex min-h-0 flex-1 flex-col **:data-[slot=scroll-area-viewport]:flex-1',
            children: (0, r.jsx)('div', {
              className: 'px-1 py-0.5 text-xs',
              role: 'tree',
              'aria-label': ariaLabel,
              children: nodes.map(node =>
                (0, r.jsx)(
                  TreeNode,
                  {
                    depth: 0,
                    expandedPaths,
                    node,
                    renderIcon,
                    selectedPath,
                    onSelect: select,
                    onToggleDirectory: toggleDirectory,
                  },
                  node.path,
                ),
              ),
            }),
          })
    );
  },
  /** A file or folder row, and a folder's children when open. */
  TreeNode = ({depth, expandedPaths, node, renderIcon, selectedPath, onSelect, onToggleDirectory}) => {
    const isDirectory = node.type === 'directory',
      expanded = expandedPaths.has(node.path),
      selected = node.path === selectedPath,
      Icon = isDirectory ? (expanded ? FolderOpenIcon : S) : iconFor(node.path),
      icon = node.icon ?? renderIcon?.(node);
    return (0, r.jsxs)('div', {
      children: [
        (0, r.jsxs)('button', {
          type: 'button',
          className: v(
            'hover:bg-secondary text-surface-primary-foreground focus-visible:bg-secondary flex h-8 w-full min-w-0 items-center gap-1.5 rounded-lg px-2 text-left',
            selected && 'bg-muted! text-foreground',
          ),
          style: {paddingLeft: `${8 + depth * 14}px`},
          role: 'treeitem',
          'aria-expanded': isDirectory ? expanded : void 0,
          'aria-selected': selected || void 0,
          onClick: isDirectory ? onToggleDirectory(node.path) : onSelect(node),
          children: [
            icon ?? (0, r.jsx)(Icon, {className: 'text-muted-foreground size-4 shrink-0'}),
            (0, r.jsx)(N, {className: 'grow truncate text-sm', children: node.name}),
            node.trailing && (0, r.jsx)('div', {className: 'shrink-0', children: node.trailing}),
            isDirectory &&
              (0, r.jsx)(k, {
                className: v('text-muted-foreground size-4 shrink-0', expanded && 'rotate-180'),
                'aria-hidden': 'true',
              }),
          ],
        }),
        isDirectory &&
          expanded &&
          node.children.map(child =>
            (0, r.jsx)(
              TreeNode,
              {depth: depth + 1, expandedPaths, node: child, renderIcon, selectedPath, onSelect, onToggleDirectory},
              child.path,
            ),
          ),
      ],
    });
  },
  /** Every folder path in a tree. */
  directoryPaths = nodes =>
    nodes.flatMap(node => (node.type === 'directory' ? [node.path, ...directoryPaths(node.children)] : [])),
  /** The folders a path sits in. */
  ancestorPaths = path => {
    const parts = path.split('/'),
      ancestors = [];
    for (let index = 1; index < parts.length; index += 1) ancestors.push(parts.slice(0, index).join('/'));
    return ancestors;
  },
  /** The icon a file takes. */
  iconFor = path => (path.endsWith('.md') ? M : FileIcon);
