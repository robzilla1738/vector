/* Aux-owned source: the memory settings page (assets/settings-DguZi_c6.js, after its imports; z
 * exported as component): enabling memories, generating them from chats, and how long daily
 * observation logs are kept.
 * Names the rest of the chunk uses keep their chunk names: z the page. */
var jsxRuntime = j(); /** The memory settings page. */
function z() {
  const {userId} = k.useParams(),
    n = Number.parseInt(userId, 10),
    {capture} = y(),
    x = b(),
    {data} = C(x.settings.getAll.queryOptions({accountId: n}, {select: s => s.memory})),
    i = F({accountId: n, syncGetAllCache: true}),
    o = s => {
      i.mutate({accountId: n, key: 'memory', value: s});
    },
    h = s => {
      (o({...data, enabled: s}), capture('settings.memory.enable', {value: s}));
    },
    g = s => {
      s && o({...data, episodicRetentionDays: Number.parseInt(s, 10)});
    };
  return (0, jsxRuntime.jsxs)(jsxRuntime.Fragment, {
    children: [
      (0, jsxRuntime.jsx)(_, {
        children: (0, jsxRuntime.jsxs)('h1', {
          className: 'flex items-center gap-1.5',
          children: [
            (0, jsxRuntime.jsx)('span', {children: 'Configure memories'}),
            (0, jsxRuntime.jsxs)(f, {
              children: [
                (0, jsxRuntime.jsx)(S, {
                  openOnHover: true,
                  children: (0, jsxRuntime.jsx)(R, {className: 'text-muted-foreground size-5'}),
                }),
                (0, jsxRuntime.jsx)(v, {
                  align: 'start',
                  className: 'w-80 px-3 py-2.5 text-sm',
                  children: 'Control how Aux generates and retains memories across all Projects.',
                }),
              ],
            }),
          ],
        }),
      }),
      (0, jsxRuntime.jsxs)('div', {
        className: 'space-y-8',
        children: [
          (0, jsxRuntime.jsx)(l, {
            title: 'Memory',
            children: (0, jsxRuntime.jsx)(m, {children: (0, jsxRuntime.jsx)(A, {})}),
          }),
          (0, jsxRuntime.jsx)(l, {
            title: 'Settings',
            children: (0, jsxRuntime.jsxs)(m, {
              children: [
                (0, jsxRuntime.jsxs)(c, {
                  children: [
                    (0, jsxRuntime.jsx)(a, {title: 'Enable memories', description: 'Generate new memories from chats'}),
                    (0, jsxRuntime.jsx)(d, {
                      children: (0, jsxRuntime.jsx)(H, {
                        checked: data.enabled,
                        disabled: i.isPending,
                        onCheckedChange: h,
                      }),
                    }),
                  ],
                }),
                data.enabled &&
                  (0, jsxRuntime.jsxs)(c, {
                    children: [
                      (0, jsxRuntime.jsx)(a, {
                        title: 'Episodic memory retention',
                        description: 'How long to keep daily observation logs',
                      }),
                      (0, jsxRuntime.jsx)(d, {
                        children: (0, jsxRuntime.jsxs)(P, {
                          value: data.episodicRetentionDays.toString(),
                          onValueChange: g,
                          children: [
                            (0, jsxRuntime.jsx)(N, {className: 'w-full', children: (0, jsxRuntime.jsx)(w, {})}),
                            (0, jsxRuntime.jsxs)(I, {
                              children: [
                                (0, jsxRuntime.jsx)(r, {value: '0', children: 'Never forget'}),
                                (0, jsxRuntime.jsx)(r, {value: '30', children: '30 days'}),
                                (0, jsxRuntime.jsx)(r, {value: '90', children: '90 days'}),
                              ],
                            }),
                          ],
                        }),
                      }),
                    ],
                  }),
              ],
            }),
          }),
        ],
      }),
    ],
  });
}
