/* Aux-owned source, composer pass 12: opening a session file (assets/session-composer-Dc0LRfZA.js,
 * the files-panel hook): a file the side panel can preview opens there; anything else opens in its
 * app, or is revealed when it is a folder or binary. This block starts a `var` list that continues.
 * Names the chunk uses elsewhere keep their chunk names: Eo useOpenSessionFile (exported), kn react-dom.
 * Chunk names used: g React, me useSession, ge useApp, $t the side panel, Ce useTRPC, _e useQueryClient,
 * Tr open a file natively, de toasts, Ns/Wo the react-dom module. */
var Eo = () => {
    const {currentSession} = me(),
      {accountId} = ge(),
      n = $t(),
      r = Ce(),
      s = _e(),
      o = Tr();
    return (0, g.useCallback)(
      async i => {
        if (n?.previewFilesByPath.has(i)) {
          n.openFilePreview(i);
          return;
        }
        try {
          const c = await s.fetchQuery(
            r.sessions.files.metadata.queryOptions(
              {path: i, sessionId: currentSession.id, accountId},
              {staleTime: Number.POSITIVE_INFINITY},
            ),
          );
          if (c.canPreviewInline && n) {
            n.openFilePreview(i);
            return;
          }
          await o(i, openModeOf(c));
        } catch (c) {
          (de.error('There was an error loading the file.'), console.error(c));
        }
      },
      [accountId, currentSession.id, o, s, n, r.sessions.files.metadata],
    );
  } /** Folders and binary files are revealed; anything else opens. */,
  openModeOf = e => (e?.kind === 'binary' || e?.kind === 'directory' ? 'reveal' : 'open'),
  kn = Ns(Wo(), 1)
