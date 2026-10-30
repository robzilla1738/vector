/* Aux-owned source: what the chat's tool cards link to (assets/provider-Cw0zhujt.js, ll through fl): a file
 * link that opens in the side panel, the memory page or the host; which page a file belongs to; the
 * provider that gives tool cards their file, routine, MCP, subagent and coder renderers; an MCP icon.
 * Names the rest of the chunk uses keep their chunk names: ll the file link, Xn the provider, Gn forward slashes.
 * Chunk names used: c React, r JSX runtime, Ct the side panel, Q useTRPC, ne useMutation, rr link classes, Ce toast,
 * je/ue/de tooltip, q useApp, ps match, _n subagent colors, nr the runtime provider, $r external link, Ie
 * buttonVariants, Pt extension URL, Kr its click, fs Link, Vr subagent icon, ol the coder card, Jo the routine
 * dialog, te useQuery, Ir known MCP servers, Ur their icon. */
/** A file link in a chat. */
  ll = ({children, path, tooltip = true}) => {
    const context = useMemoryPageContext(),
      sidepanel = Ct(),
      name = fileName(path),
      memoryFile = context.kind === 'project-memory' ? projectMemoryPath(path, context) : void 0,
      href = memoryFile
        ? `/u/${context.accountId}/projects/${memoryFile.projectId}/settings/memories/files?path=${encodeURIComponent(memoryFile.path)}`
        : void 0,
      trpc = Q(),
      openFile = ne(trpc.meta.open.mutationOptions()),
      handleClick = event => {
        if ((event.preventDefault(), event.stopPropagation(), !href && sidepanel)) {
          sidepanel.openFilePreview(path);
          return;
        }
        openFile.mutateAsync({accountId: context.accountId, mode: 'open', path}).catch(error => {
          (Ce.error('There was an error opening the file.'), console.error(error));
        });
      },
      link = (0, r.jsx)('a', {
        className: rr,
        ...(href
          ? {href, rel: 'noreferrer', target: '_blank', onClick: event => event.stopPropagation()}
          : {href: '#', onClick: handleClick}),
        children: children ?? name,
      });
    return tooltip
      ? (0, r.jsxs)(je, {
          children: [
            (0, r.jsx)(ue, {
              render: (0, r.jsx)('span', {className: 'inline-flex max-w-full min-w-0 align-baseline'}),
              children: link,
            }),
            (0, r.jsx)(de, {side: 'bottom', align: 'start', className: 'max-w-[32rem] break-all', children: path}),
          ],
        })
      : link;
  },
  /** The memory page the chat is on, if any. */
  useMemoryPageContext = () => {
    const {accountId} = q(),
      path = currentPath(),
      match = path.match(/^\/u\/(?<userId>\d+)\/projects\/(?<projectId>[^/]+)\/settings\/memories(?:\/|$)/);
    return match?.groups
      ? {kind: 'project-memory', projectId: match.groups.projectId, accountId}
      : path.match(/^\/u\/(?<userId>\d+)(?:\/|$)/)?.groups
        ? {kind: 'account', accountId}
        : {kind: 'account', accountId};
  };
/** The page path, hash routed or not. */
function currentPath() {
  return window.location.hash.match(/^#(?<path>\/[^?#]*)/)?.groups?.path ?? window.location.pathname;
}
var /** A file inside a project's memories. */
  projectMemoryPath = (filePath, context) => {
    const normalized = Gn(filePath);
    if (normalized.startsWith('memory/')) return {projectId: context.projectId, path: normalized.slice(7)};
    const relative = normalized.replace(/^\.\//, '');
    if (!(!relative || relative.startsWith('../'))) return {projectId: context.projectId, path: relative};
  },
  /** Forward slashes. */
  Gn = path => path.replaceAll('\\', '/'),
  /** A path's file name. */
  fileName = path => Gn(path).split('/').pop() ?? path,
  /** Gives the tool cards their renderers, and shows the routine dialog. */
  Xn = ({children, toolState}) => {
    const {accountId} = q(),
      isExtensionPage = ps({warn: false}),
      [routineId, setRoutineId] = (0, c.useState)(null),
      sidepanel = Ct(),
      colors = (0, c.useMemo)(() => _n(toolState.subagent?.subagents ?? []), [toolState.subagent?.subagents]),
      runtime = (0, c.useMemo)(
        () => ({
          showDeveloperOutput: false,
          renderFileLink: (value, label, event) => (0, r.jsx)(ll, {path: value, tooltip: event, children: label}),
          openMemoryFile: sidepanel ? value => sidepanel.openFilePreview(value) : void 0,
          renderMcpIcon: value => (0, r.jsx)(McpIcon, {...value}),
          renderMcpSettingsLink: () =>
            (0, r.jsx)($r, {
              className: Ie({variant: 'outline', size: 'xs'}),
              to: Pt(`/u/${accountId}/settings/plugins/mcps`),
              onClick: value => {
                Kr(value);
              },
              children: 'MCP settings',
            }),
          renderRoutineLink: (value, label) =>
            isExtensionPage
              ? (0, r.jsx)(fs, {
                  className: 'hover:text-foreground inline underline decoration-current/40 underline-offset-2',
                  params: {userId: String(accountId), routineId: value},
                  to: '/u/$userId/settings/routines/$routineId',
                  onClick: event => {
                    (event.preventDefault(), event.stopPropagation(), setRoutineId(value));
                  },
                  children: label,
                })
              : (0, r.jsx)('a', {
                  className: 'hover:text-foreground inline underline decoration-current/40 underline-offset-2',
                  href: Pt(`/u/${accountId}/settings/routines/${encodeURIComponent(value)}`),
                  onClick: event => event.stopPropagation(),
                  children: label,
                }),
          renderSubagentIcon: ({result: value}) => {
            const label =
              typeof value?.details == 'object' && value.details && 'taskId' in value.details
                ? String(value.details.taskId)
                : void 0;
            return (0, r.jsx)(Vr, {className: 'size-4 shrink-0', color: label ? colors.get(label) : 'mono'});
          },
          renderCoderCard: value => (0, r.jsx)(ol, {...value}),
        }),
        [accountId, isExtensionPage, sidepanel, colors],
      );
    return (0, r.jsxs)(nr, {
      runtime,
      children: [
        children,
        (0, r.jsx)(Jo, {open: routineId !== null, routineId: routineId ?? void 0, onClose: () => setRoutineId(null)}),
      ],
    });
  },
  /** An MCP tool's server icon. */
  McpIcon = ({call}) => {
    const {accountId} = q(),
      trpc = Q(),
      {data: settings} = te(trpc.settings.getAll.queryOptions({accountId})),
      fallbackName = call.name.slice(5).split('__')[0] ?? 'MCP',
      [name, server] = Object.entries(settings?.mcp.servers ?? {}).reduce(
        (best, entry) =>
          call.name.startsWith(`mcp__${entry[0]}__`) && entry[0].length > best[0].length ? entry : best,
        [fallbackName, void 0],
      ),
      known = Ir.find(best => best.name.toLowerCase() === name.toLowerCase());
    return (0, r.jsx)(Ur, {
      className: 'size-4',
      name,
      url: server?.transport === 'streamable-http' ? server.url : known?.url,
    });
  }
