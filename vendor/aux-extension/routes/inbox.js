/* Aux-owned source, Settings › Notification Use (assets/inbox-BIWs6dWb.js, the module body, exported
 * as component): the sites whose web push notifications the agent may receive, each revocable, and
 * the five most recent notifications with how each was delivered. Notifications Aux's own extension
 * sent are left out. scripts/release/package-edits.json drops the page wrapper's padding first.
 * Names the rest of the chunk uses keep their chunk names: me the page; the JSX runtime is jsxRuntime.
 * Chunk names used: p/y cn and DropdownMenuItem, N JSX runtime, d useApp, k useConfirm, A Badge,
 * h RelativeTime, I useMutation, S/C/R the dropdown trigger, content and root, m useQuery, M the
 * native call, u useTRPC, _ broken link, F more, E globe, T capitalize, G Button, U toast,
 * D/q/z the avatar parts, c/v/i/g/j/L/B the settings page kit (row text, section, row, rows, row
 * end, header, page), H/O favicon and sender name, K Aux's extension ID, Q DocumentTitle.
 * Delivery dots keep their status colors. */
var jsxRuntime = N(),
  /** The IDs Aux's own extension sends notifications as. */
  OWN_EXTENSION_IDS = new Set([K, typeof chrome !== 'undefined' ? chrome.runtime?.id : void 0].filter(id => !!id));
/** The Notification Use page. */
function me() {
  const trpc = u(),
    {accountId} = d();
  return (
    m(trpc.inbox.overview.queryOptions({accountId}, {refetchInterval: 1e4})),
    (0, jsxRuntime.jsx)('div', {
      className: 'size-full',
      children: (0, jsxRuntime.jsx)('main', {
        className: p(B, 'overflow-y-auto px-8 pt-16 pb-40 text-left'),
        children: (0, jsxRuntime.jsxs)('div', {
          className: 'mx-auto w-full max-w-2xl',
          children: [
            (0, jsxRuntime.jsx)(Q, {segments: ['Settings', 'Notification Use']}),
            (0, jsxRuntime.jsxs)(L, {
              children: [
                (0, jsxRuntime.jsx)('h1', {children: 'Notification Use'}),
                (0, jsxRuntime.jsxs)('p', {
                  className: 'text-muted-foreground mt-2 text-sm',
                  children: [
                    'Aux subscribes to web push notifications so AI can continue long-running work, like checking mail, handling DMs, and waiting for replies.',
                    ' ',
                    (0, jsxRuntime.jsx)('span', {
                      className: 'font-medium',
                      children: 'Try asking Aux to use notification when you ask for a long task.',
                    }),
                  ],
                }),
              ],
            }),
            (0, jsxRuntime.jsxs)('div', {
              className: 'space-y-8',
              children: [
                (0, jsxRuntime.jsx)(v, {
                  title: 'Subscribed sites',
                  children: (0, jsxRuntime.jsx)(g, {children: (0, jsxRuntime.jsx)(NotificationGrants, {})}),
                }),
                (0, jsxRuntime.jsx)(RecentNotifications, {}),
              ],
            }),
          ],
        }),
      }),
    })
  );
}
/** The sites the agent may receive notifications from, each with Revoke (native permission first). */
var NotificationGrants = () => {
  const {confirm} = k(),
    trpc = u(),
    {accountId} = d(),
    {data: grants} = m(
      trpc.inbox.overview.queryOptions(
        {accountId},
        {enabled: false, select: overview => overview.notificationGrants ?? []},
      ),
    ),
    revoke = I(
      trpc.inbox.revokeNotificationGrant.mutationOptions({
        onSuccess: (data, variables, onMutateResult, context) => {
          context.client.invalidateQueries({queryKey: trpc.inbox.overview.queryKey({accountId})});
        },
      }),
    ),
    confirmRevoke = origin => () => {
      confirm(
        {
          title: `Revoke notification grant for ${siteName(origin)}?`,
          description: 'This will prevent AI from receiving notifications from this site.',
          ui: {action: 'Revoke', variant: 'destructive'},
        },
        async () => {
          try {
            const {revoked} = await M({method: 'Aux.revokeNotificationPermission', params: {origin}});
            if (!revoked) throw new Error('Native notification permission was not revoked.');
            await revoke.mutateAsync({origin, accountId});
          } catch (error) {
            (console.error('[Inbox] Failed to revoke notification grant:', error),
              U.error(error instanceof Error ? error.message : 'Failed to revoke notification permission.'));
          }
        },
      );
    };
  return grants?.length
    ? (0, jsxRuntime.jsx)(jsxRuntime.Fragment, {
        children: grants.map(grant => {
          const name = siteName(grant.origin);
          return (0, jsxRuntime.jsxs)(
            l,
            {
              className: 'gap-1',
              children: [
                (0, jsxRuntime.jsxs)(z, {
                  className: 'size-8 rounded-lg',
                  children: [
                    (0, jsxRuntime.jsx)(q, {src: H(grant.origin)}),
                    (0, jsxRuntime.jsx)(D, {children: (0, jsxRuntime.jsx)(E, {className: 'size-5'})}),
                  ],
                }),
                (0, jsxRuntime.jsx)(c, {
                  title: name,
                  description: (0, jsxRuntime.jsx)(h, {datetime: grant.grantedAt}),
                }),
                (0, jsxRuntime.jsx)(j, {
                  children: (0, jsxRuntime.jsxs)(R, {
                    children: [
                      (0, jsxRuntime.jsx)(S, {
                        render: (0, jsxRuntime.jsx)(G, {variant: 'ghost', size: 'icon'}),
                        children: (0, jsxRuntime.jsx)(F, {}),
                      }),
                      (0, jsxRuntime.jsx)(C, {
                        children: (0, jsxRuntime.jsxs)(y, {
                          variant: 'destructive',
                          onClick: confirmRevoke(grant.origin),
                          children: [(0, jsxRuntime.jsx)(_, {}), (0, jsxRuntime.jsx)('span', {children: 'Revoke'})],
                        }),
                      }),
                    ],
                  }),
                }),
              ],
            },
            grant.origin,
          );
        }),
      })
    : (0, jsxRuntime.jsx)(l, {
        children: (0, jsxRuntime.jsx)(c, {
          title: (0, jsxRuntime.jsx)('span', {
            className: 'text-muted-foreground',
            children: 'No sites with AI notification permission',
          }),
          description: (0, jsxRuntime.jsx)('span', {
            className: 'text-muted-foreground/60',
            children: 'Click “Let AI Handle” to let AI receive notifications.',
          }),
        }),
      });
};
/** A site's host name without its first www. */
function siteName(origin) {
  try {
    return new URL(origin).hostname.replace('www.', '');
  } catch {
    return origin;
  }
}
/** The five most recent notifications from other senders, with their delivery state. */
var RecentNotifications = () => {
  const trpc = u(),
    {accountId} = d(),
    {data: messages} = m(
      trpc.inbox.overview.queryOptions(
        {accountId},
        {
          enabled: false,
          select: overview => (overview.messages ?? []).filter(message => !isOwnNotification(message)).slice(0, 5),
        },
      ),
    );
  return messages?.length
    ? (0, jsxRuntime.jsx)(v, {
        title: 'Recent notifications',
        children: (0, jsxRuntime.jsx)(g, {
          children: messages.map(message =>
            (0, jsxRuntime.jsxs)(
              l,
              {
                className: 'items-start',
                children: [
                  (0, jsxRuntime.jsx)(c, {
                    title: (0, jsxRuntime.jsx)('span', {
                      className: 'line-clamp-4 [overflow-wrap:anywhere] break-words whitespace-pre-wrap',
                      title: message.content,
                      children: message.content,
                    }),
                    description: (0, jsxRuntime.jsxs)(jsxRuntime.Fragment, {
                      children: [
                        message.from && `${O(message.from.name)} • `,
                        (0, jsxRuntime.jsx)(h, {datetime: message.receivedAt}),
                      ],
                    }),
                  }),
                  (0, jsxRuntime.jsx)(j, {
                    className: 'pt-0.5',
                    children: (0, jsxRuntime.jsxs)(A, {
                      variant: 'secondary',
                      children: [
                        (0, jsxRuntime.jsx)('div', {
                          className: p(
                            '-ml-0.5 size-2 rounded-full',
                            message.deliveryState === 'delivered' && 'bg-green-500',
                            message.deliveryState === 'failed' && 'bg-red-500',
                            message.deliveryState === 'pending' && 'bg-amber-500',
                          ),
                        }),
                        T(message.deliveryState),
                      ],
                    }),
                  }),
                ],
              },
              message.id,
            ),
          ),
        }),
      })
    : null;
};
/** Whether a web push notification came from Aux's own extension. */
function isOwnNotification(message) {
  return message.source !== 'web-push-notification'
    ? false
    : [message.from?.id, message.from?.name, message.metadata.origin, message.metadata.contextUrl].some(isOwnSender);
}
/** Whether a sender ID, name or URL is Aux's own extension. */
function isOwnSender(value) {
  const trimmed = value?.trim();
  if (!trimmed) return false;
  if (OWN_EXTENSION_IDS.has(trimmed)) return true;
  try {
    const url = new URL(trimmed);
    return url.protocol === 'chrome-extension:' && OWN_EXTENSION_IDS.has(url.hostname);
  } catch {
    return false;
  }
}
