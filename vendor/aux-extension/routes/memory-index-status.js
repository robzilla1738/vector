/* Aux-owned source, Memory › the memory index status (assets/extension-main-Dz1-AsCT.js): setting up,
 * downloading the engines or indexing (with progress), ready (when and how many chunks), or needing
 * attention, with Rebuild or Retry.
 * Names the rest of the chunk uses keep their chunk names: ui MemoryIndexStatus.
 * Chunk names used: i JSX runtime, tt/Xe/Ye/Ze tRPC, query client, query and mutation, me the
 * memory route, G toast, $ Skeleton, ue/yt/xt the settings row parts, pt Button, wt Progress, Ge
 * RelativeTime. */
ui = () => {
    const e = tt(),
      t = Xe(),
      {userId} = me.useParams(),
      o = Number.parseInt(userId, 10),
      u = Ye({
        ...e.memory.indexStatus.queryOptions({accountId: o}),
        refetchInterval: b =>
          ['downloading', 'preparing', 'indexing'].includes(b.state.data?.phase ?? '') ? 1e3 : 1e4,
        refetchIntervalInBackground: false,
      }),
      p = Ze(
        e.memory.rebuildIndex.mutationOptions({
          onSuccess: (b, g) => {
            (t.invalidateQueries(e.memory.indexStatus.queryFilter({accountId: g.accountId})),
              G.success('Memory setup and index rebuild started.'));
          },
          onError: b => G.error('Unable to rebuild the memory index.', {description: b.message}),
        }),
      ),
      d = u.data,
      h = u.isSuccess && d ? indexProgress(d) : null,
      _ = h ? Math.min(100, Math.max(0, Math.floor((h.value / h.max) * 100))) : null,
      f = u.isError || d?.phase === 'error',
      U = d?.phase === 'idle' || d?.phase === 'ready',
      C = () => {
        if (u.isError) {
          u.refetch();
          return;
        }
        p.mutate({accountId: o});
      };
    return (0, i.jsxs)(yt, {
      className: 'flex-col items-stretch',
      children: [
        (0, i.jsxs)('div', {
          className: 'flex items-center gap-3',
          children: [
            (0, i.jsxs)('div', {
              className: 'min-w-0 grow',
              role: 'status',
              'aria-live': 'polite',
              children: [
                u.isPending && (0, i.jsx)($, {className: 'h-4 w-48', 'aria-label': 'Loading memory index status'}),
                u.isError && (0, i.jsx)(ue, {title: 'Index status unavailable', description: u.error.message}),
                u.isSuccess && d && (0, i.jsx)(IndexStatus, {status: d, percent: _}),
              ],
            }),
            (f || U) &&
              (0, i.jsx)(xt, {
                children: (0, i.jsx)(pt, {
                  size: 'sm',
                  variant: 'outline',
                  disabled: u.isFetching || p.isPending,
                  onClick: C,
                  children: p.isPending ? 'Starting…' : f ? 'Retry' : 'Rebuild',
                }),
              }),
          ],
        }),
        h !== null &&
          (0, i.jsx)(wt, {
            className: 'h-1 *:bg-emerald-500',
            value: h.value,
            max: h.max,
            'aria-label': d?.phase === 'downloading' ? 'Memory engine download progress' : 'Memory indexing progress',
          }),
      ],
    });
  },
  IndexStatus = ({status, percent}) => {
    const r =
      status.errorKind === 'download'
        ? 'The download failed. Check your internet connection, then retry.'
        : 'The memory index needs attention.';
    return (0, i.jsx)(ue, {
      title: statusTitle(status, percent),
      description: (0, i.jsxs)(i.Fragment, {
        children: [
          status.phase === 'ready' &&
            (0, i.jsxs)('span', {
              children: [
                status.updatedAt != null &&
                  (0, i.jsxs)(i.Fragment, {
                    children: [
                      'Last updated at ',
                      (0, i.jsx)(Ge, {datetime: status.updatedAt}),
                      status.indexedChunks != null && ', ',
                    ],
                  }),
                status.indexedChunks != null &&
                  (0, i.jsxs)(i.Fragment, {children: [status.indexedChunks.toLocaleString('en-US'), ' chunks']}),
              ],
            }),
          status.phase === 'error' && (0, i.jsx)('span', {children: r}),
        ],
      }),
    });
  } /** The status line, with the percent while it works. */,
  statusTitle = ({phase}, t) => {
    const r = t !== null ? ` (${t}%)` : '';
    switch (phase) {
      case 'idle':
      case 'preparing':
      case 'indexing':
        return `Setting up memory${r}`;
      case 'downloading':
        return `Downloading engines${r}`;
      case 'ready':
        return 'Running normal';
      case 'error':
        return 'Needs attention';
      default:
        return phase;
    }
  } /** Progress as value and max: chunks or files while indexing, bytes while downloading. */,
  indexProgress = e => {
    if (e.phase === 'ready') return {value: 100, max: 100};
    if (e.phase === 'indexing') {
      if (e.processedChunks != null && e.totalChunks != null && e.totalChunks > 0)
        return {value: e.processedChunks, max: e.totalChunks};
      if (e.processedFiles != null && e.totalFiles != null && e.totalFiles > 0)
        return {value: e.processedFiles, max: e.totalFiles};
    }
    return e.phase === 'downloading' &&
      e.downloadedBytes != null &&
      e.totalDownloadBytes != null &&
      e.totalDownloadBytes > 0
      ? {value: e.downloadedBytes, max: e.totalDownloadBytes}
      : null;
  }
