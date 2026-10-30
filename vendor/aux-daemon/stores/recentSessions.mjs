/** The sidebar's recent tasks, per account: pinned tasks, the newest unpinned ones up to the
 * account's limit, and CLI tasks that are running, waiting or unread. Kept in the supplied caches,
 * which the bundle clears when tasks change, and rebuilt from the task store on demand. */
export function create({stores: {recentSessions: r}}) {
  const recent = {parent: 'root', archived: 'exclude', ephemeral: 'exclude', routines: 'exclude', coders: 'exclude', order: 'desc'};
  const loadCache = accountId => {
    const limit = Number(r.settings(accountId).get('sidebarRecentChatLimit'));
    const pinned = r.SessionStore.listPreviewItems(accountId, {...recent, pinned: 'only'});
    const recents = r.SessionStore.listPreviewItems(accountId, {...recent, pinned: 'exclude', limit});
    const cliTasks = r.SessionStore.listPreviewItems(accountId, {...recent, ephemeral: 'only', statuses: ['running', 'suspended', 'idle']}).filter(r.shouldSurfaceCliEphemeral);
    const withCliTasks = items => {
      const byId = new Map();
      for (const item of [...cliTasks, ...items]) byId.set(item.id, item);
      return [...byId.values()].sort(r.compareSessionListOrder);
    };
    r.chatsCache.set(accountId, {pinned, recents: withCliTasks(recents)});
    r.cache.set(accountId, withCliTasks(recents));
  };
  return {
    loadCache,
    list(accountId) {
      if (!r.cache.has(accountId)) loadCache(accountId);
      return [...r.cache.get(accountId) ?? []];
    },
    listChats(accountId) {
      if (!r.chatsCache.has(accountId)) loadCache(accountId);
      const {pinned = [], recents = []} = r.chatsCache.get(accountId) ?? {};
      return {pinned: [...pinned], recents: [...recents]};
    },
  };
}
