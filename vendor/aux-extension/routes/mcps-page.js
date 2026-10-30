/* Aux-owned source, Plugins › MCPs pass 2 (assets/mcps-DmPp5oo9.js, from the server form helpers to
 * the page; ks exported as component): the presets to connect in one click, the servers with their
 * connection status, switch and menu (authorize, edit, test, view and refresh tools, disconnect or
 * delete), the add and edit dialog (stdio command and env, or streamable HTTP with no auth, request
 * headers or OAuth), the cached tools dialog, and the OAuth popup.
 * Names the rest of the chunk uses keep their chunk names: ks the page, Ue isEnvText.
 * Chunk names used: a JSX runtime, se React, N toast, Ye the presets, ge/je/$e/q/Kt tRPC, query
 * client and query hooks, the settings section, row and card parts, the form, select, dialog and
 * dropdown parts, and the first pass's icons and command helpers. */
/** The form draft for a saved server. */
function serverDraft(e) {
  return e.transport === 'stdio'
    ? {name: e.name, transport: 'stdio', command: ut(e.command, e.args), envText: envText(e.env)}
    : {
        name: e.name,
        transport: e.transport,
        url: e.url,
        authType: e.auth.type,
        headersText: e.auth.type === 'headers' ? envText(e.auth.headers) : '',
        clientId: e.auth.type === 'auto' ? (e.auth.clientId ?? '') : '',
        clientSecret: '',
      };
}
function emptyDraft(e = 'streamable-http', n = '') {
  return e === 'stdio'
    ? {name: n, transport: e, command: '', envText: ''}
    : {name: n, transport: e, url: '', authType: 'auto', headersText: '', clientId: '', clientSecret: ''};
} /** The server to save from a form draft. */
function serverFromDraft(e, n, r) {
  const s = n?.enabled ?? true;
  if (e.transport === 'stdio') {
    const {command, args} = dt(e.command);
    return {name: r, enabled: s, transport: 'stdio', command, args, env: parseEnv(e.envText)};
  }
  return {
    name: r,
    enabled: s,
    transport: e.transport,
    url: e.url,
    auth:
      e.authType === 'headers'
        ? {type: 'headers', headers: parseEnv(e.headersText)}
        : e.authType === 'none'
          ? {type: 'none'}
          : {type: 'auto', clientId: e.clientId.trim() || void 0},
  };
} /** A URL compared without its hash, host case or trailing slash. */
function normalUrl(e) {
  const n = new URL(e);
  return (
    (n.hash = ''),
    (n.hostname = n.hostname.toLowerCase()),
    n.pathname !== '/' && (n.pathname = n.pathname.replace(/\/+$/u, '')),
    n.toString()
  );
} /** A name of at most 32 characters, numbered when taken. */
function uniqueName(e, n) {
  const r = e.slice(0, 32);
  if (!n.has(r)) return r;
  for (let s = 2; ; s += 1) {
    const i = `_${s}`,
      l = `${r.slice(0, 32 - i.length)}${i}`;
    if (!n.has(l)) return l;
  }
}
function endpointLabel(e) {
  return e.transport !== 'stdio'
    ? e.url || 'No endpoint configured'
    : e.command
      ? ut(e.command, e.args)
      : 'No endpoint configured';
} /** Whether text is KEY=value lines. */
function Ue(e) {
  return e
    .split(/\r?\n/u)
    .map(n => n.trim())
    .filter(Boolean)
    .every(n => {
      const r = n.indexOf('=');
      return r > 0 && !!n.slice(0, r).trim();
    });
}
function envText(e) {
  return Object.entries(e).map(([n, r]) => `${n}=${r}`).join(`
`);
}
function parseEnv(e) {
  return Object.fromEntries(
    e
      .split(/\r?\n/u)
      .map(n => n.trim())
      .filter(Boolean)
      .map(n => {
        const r = n.indexOf('=');
        return [n.slice(0, r).trim(), n.slice(r + 1)];
      }),
  );
} /** Opens the OAuth page in a popup and calls back when it closes. */
function openAuthWindow(e, n) {
  if (typeof chrome < 'u' && typeof chrome.windows?.create == 'function') {
    chrome.windows
      .create({url: e, type: 'popup', width: 720, height: 800, focused: true})
      .then(i => {
        if (i?.id === void 0) {
          n();
          return;
        }
        const l = p => {
          p === i.id && (chrome.windows.onRemoved.removeListener(l), n());
        };
        chrome.windows.onRemoved.addListener(l);
      })
      .catch(n);
    return;
  }
  const r = window.open(e, 'aux-mcp-oauth-v2', 'popup,width=720,height=800,noopener,noreferrer');
  if (!r) {
    n();
    return;
  }
  const s = window.setInterval(() => {
    r.closed && (window.clearInterval(s), n());
  }, 500);
}
function reportConnection(e, n) {
  n.status === 'connected' ||
    n.status === 'connecting' ||
    N.error(`Could not connect to ${e}`, {description: n.message});
}
var Presets = ({accountId, servers}) => {
    const r = new Set(servers.map(s => s.name));
    return (0, a.jsx)(st, {
      title: 'Presets',
      children: (0, a.jsx)(Ce, {
        children: Ye.map(s =>
          (0, a.jsx)(
            PresetRow,
            {
              accountId,
              existingNames: r,
              preset: s,
              server: servers.find(i =>
                i.transport === 'streamable-http' && s.server.transport === 'streamable-http'
                  ? normalUrl(i.url) === normalUrl(s.server.url)
                  : i.transport === 'stdio' &&
                    s.server.transport === 'stdio' &&
                    i.command === s.server.command &&
                    JSON.stringify(i.args) === JSON.stringify(s.server.args),
              ),
            },
            s.name,
          ),
        ),
      }),
    });
  } /** A preset: connects in one click, hidden once connected. */,
  PresetRow = ({accountId, existingNames, preset, server}) => {
    const i = ge(),
      l = je(),
      p = server?.name ?? uniqueName(preset.name, existingNames),
      k = {accountId, name: p},
      M = i.mcp.connectionStatus.queryKey(k),
      v = i.settings.getAll.queryKey({accountId}),
      {data} = $e(
        i.mcp.connectionStatus.queryOptions(k, {
          enabled: !!server?.enabled,
          refetchInterval: B => (B.state.data?.status === 'connecting' ? 1e3 : false),
        }),
      ),
      A = q(i.mcp.saveServer.mutationOptions()),
      D = q(i.mcp.connect.mutationOptions()),
      F = q(i.mcp.cancel.mutationOptions()),
      ee = q(i.mcp.deleteServer.mutationOptions()),
      x = q(i.mcp.setEnabled.mutationOptions()),
      Q = async B => {
        try {
          const {connection, settings} = await F.mutateAsync(k);
          if ((l.setQueryData(v, settings), connection.status === 'connected' || !B)) {
            l.setQueryData(M, connection);
            return;
          }
          const H = await ee.mutateAsync(k);
          (l.setQueryData(v, H.settings),
            l.removeQueries({queryKey: M, exact: true}),
            H.credentialError && N.warning(H.credentialError));
        } catch (g) {
          (N.error(`Could not clean up ${p}.`, {description: g instanceof Error ? g.message : String(g)}),
            l.invalidateQueries({queryKey: M}));
        }
      },
      J = async () => {
        const B = !server;
        try {
          if (server) {
            if (!server.enabled) {
              const g = await x.mutateAsync({...k, enabled: true});
              l.setQueryData(v, g);
            }
          } else {
            const g = await A.mutateAsync({accountId, name: p, server: preset.server});
            (l.setQueryData(v, g.settings), g.credentialError && N.warning(g.credentialError));
          }
        } catch (g) {
          N.error(g instanceof Error ? g.message : `Could not prepare ${preset.name}.`);
          return;
        }
        l.setQueryData(M, {status: 'connecting'});
        try {
          const {connection, settings} = await D.mutateAsync(k);
          (reportConnection(k.name, connection),
            l.setQueryData(v, settings),
            'authorizationUrl' in connection
              ? (openAuthWindow(connection.authorizationUrl, () => {
                  Q(B);
                }),
                l.setQueryData(M, {status: connection.status}))
              : l.setQueryData(M, connection));
        } catch (g) {
          (await Q(B),
            N.error(`Could not connect ${preset.name}.`, {description: g instanceof Error ? g.message : String(g)}));
        }
      },
      te = data?.status === 'connected',
      z = data?.status === 'connecting',
      $ = A.isPending || D.isPending || F.isPending || x.isPending;
    return te
      ? null
      : (0, a.jsxs)(it, {
          className: 'gap-1.5',
          children: [
            (0, a.jsx)(ct, {name: preset.name, url: preset.url}),
            (0, a.jsx)(Re, {title: preset.name, description: preset.description}),
            (0, a.jsx)(pe, {
              size: 'icon',
              variant: 'secondary',
              disabled: $ || z,
              'aria-label': z ? `Connecting ${preset.name}` : `Connect ${preset.name}`,
              onClick: () => {
                J();
              },
              children: z ? (0, a.jsx)(He, {}) : (0, a.jsx)(ze, {}),
            }),
          ],
        });
  } /** Adding or editing a server. */,
  ServerDialog = ({state, onSave, onOpenChange}) => {
    const s = aa({mode: 'onChange', resolver: ea(uo), defaultValues: state.draft});
    return (0, a.jsx)(ot, {
      open: true,
      onOpenChange,
      children: (0, a.jsx)(nt, {
        className: 'max-w-lg!',
        children: (0, a.jsx)(na, {
          ...s,
          children: (0, a.jsxs)('form', {
            className: 'flex flex-col gap-4',
            onSubmit: s.handleSubmit(onSave),
            children: [
              (0, a.jsxs)(at, {
                children: [
                  (0, a.jsx)(rt, {children: state.mode === 'create' ? 'Create MCP server' : 'Edit MCP server'}),
                  (0, a.jsx)(tt, {
                    children:
                      state.mode === 'create'
                        ? 'Add an MCP server to expose its tools in new browser sessions.'
                        : 'Update the MCP server used by new browser sessions.',
                  }),
                ],
              }),
              (0, a.jsxs)('div', {
                className: 'grid grid-cols-[160px_1fr] items-center gap-3',
                children: [
                  (0, a.jsx)(TransportField, {}),
                  (0, a.jsx)(NameField, {}),
                  (0, a.jsx)(EndpointFields, {mode: state.mode}),
                ],
              }),
              (0, a.jsxs)(ya, {
                children: [
                  (0, a.jsx)(pe, {
                    type: 'button',
                    variant: 'secondary',
                    onClick: () => onOpenChange(false),
                    children: 'Cancel',
                  }),
                  (0, a.jsx)(pe, {
                    type: 'submit',
                    disabled: !s.formState.isValid || s.formState.isSubmitting,
                    children: state.mode === 'create' ? 'Add' : 'Save',
                  }),
                ],
              }),
            ],
          }),
        }),
      }),
    });
  },
  TransportField = () => {
    const e = re();
    return (0, a.jsxs)(a.Fragment, {
      children: [
        (0, a.jsx)(Z, {className: 'text-muted-foreground text-sm', children: 'Transport'}),
        (0, a.jsx)(Be, {
          control: e.control,
          name: 'transport',
          render: ({field}) =>
            (0, a.jsxs)(Je, {
              value: field.value,
              onValueChange: r => e.reset(emptyDraft(r, e.getValues('name'))),
              children: [
                (0, a.jsx)(Ke, {className: 'w-full', children: (0, a.jsx)(Ge, {})}),
                (0, a.jsxs)(Ve, {
                  children: [
                    (0, a.jsx)(ae, {value: 'stdio', children: 'Local stdio'}),
                    (0, a.jsx)(ae, {value: 'streamable-http', children: 'Streamable HTTP'}),
                  ],
                }),
              ],
            }),
        }),
      ],
    });
  },
  NameField = () => {
    const {field} = ta({name: 'name'});
    return (0, a.jsxs)(a.Fragment, {
      children: [
        (0, a.jsx)(Z, {className: 'text-muted-foreground text-sm', htmlFor: 'mcp-server-name', children: 'Name'}),
        (0, a.jsx)(ne, {
          ...field,
          id: 'mcp-server-name',
          autoFocus: true,
          maxLength: 32,
          placeholder: 'e.g. Granola',
          onChange: n => field.onChange(n.currentTarget.value.replace(/[^A-Za-z0-9_-]/gu, '')),
        }),
      ],
    });
  },
  EndpointFields = ({mode}) =>
    Ze({name: 'transport'}) === 'stdio' ? (0, a.jsx)(StdioFields, {}) : (0, a.jsx)(HttpFields, {mode}),
  StdioFields = () => {
    const e = re();
    return (0, a.jsxs)(a.Fragment, {
      children: [
        (0, a.jsx)(Z, {className: 'text-muted-foreground text-sm', htmlFor: 'mcp-server-command', children: 'Command'}),
        (0, a.jsx)(ne, {...e.register('command'), id: 'mcp-server-command', placeholder: 'npx -y @example/mcp-server'}),
        (0, a.jsx)(Z, {
          className: 'text-muted-foreground self-start pt-2 text-sm',
          htmlFor: 'mcp-server-env',
          children: 'Env',
        }),
        (0, a.jsx)(et, {
          ...e.register('envText'),
          id: 'mcp-server-env',
          placeholder: `TOKEN=value
API_KEY=value`,
          className: 'min-h-20 resize-none font-mono text-sm',
        }),
      ],
    });
  },
  HttpFields = ({mode}) => {
    const n = re(),
      r = Ze({control: n.control, name: 'authType'});
    return (0, a.jsxs)(a.Fragment, {
      children: [
        (0, a.jsx)(Z, {className: 'text-muted-foreground text-sm', htmlFor: 'mcp-server-url', children: 'URL'}),
        (0, a.jsx)(ne, {...n.register('url'), id: 'mcp-server-url', placeholder: 'https://mcp.example.com/mcp'}),
        (0, a.jsx)(Z, {
          className: 'text-muted-foreground text-sm',
          htmlFor: 'mcp-server-auth',
          children: 'Authentication',
        }),
        (0, a.jsx)(Be, {
          control: n.control,
          name: 'authType',
          render: ({field}) =>
            (0, a.jsxs)(Je, {
              value: field.value,
              onValueChange: i => field.onChange(i),
              children: [
                (0, a.jsx)(Ke, {id: 'mcp-server-auth', className: 'w-full', children: (0, a.jsx)(Ge, {})}),
                (0, a.jsxs)(Ve, {
                  children: [
                    (0, a.jsx)(ae, {value: 'auto', children: 'Auto'}),
                    (0, a.jsx)(ae, {value: 'none', children: 'No auth'}),
                    (0, a.jsx)(ae, {value: 'headers', children: 'Request headers'}),
                  ],
                }),
              ],
            }),
        }),
        r === 'headers' && (0, a.jsx)(HeadersField, {}),
        r === 'auto' && (0, a.jsx)(OAuthFields, {mode}),
      ],
    });
  },
  HeadersField = () => {
    const e = re();
    return (0, a.jsxs)(a.Fragment, {
      children: [
        (0, a.jsx)(Z, {
          className: 'text-muted-foreground self-start pt-2 text-sm',
          htmlFor: 'mcp-server-headers',
          children: 'Headers',
        }),
        (0, a.jsx)(et, {
          ...e.register('headersText'),
          id: 'mcp-server-headers',
          placeholder: `Authorization=Bearer token
X-API-Key=value`,
          className: 'min-h-20 font-mono text-sm',
        }),
      ],
    });
  },
  OAuthFields = ({mode}) => {
    const n = re();
    return (0, a.jsx)('div', {
      className: 'col-span-2 mt-1',
      children: (0, a.jsxs)('details', {
        className: 'group',
        children: [
          (0, a.jsx)('summary', {
            className: 'text-muted-foreground cursor-pointer text-sm',
            children: 'Advanced settings',
          }),
          (0, a.jsxs)('div', {
            className: 'mt-3 grid grid-cols-[160px_1fr] items-center gap-3',
            children: [
              (0, a.jsx)(Z, {
                className: 'text-muted-foreground text-sm',
                htmlFor: 'mcp-oauth-client-id',
                children: 'Client ID',
              }),
              (0, a.jsx)(ne, {...n.register('clientId'), id: 'mcp-oauth-client-id'}),
              (0, a.jsx)(Z, {
                className: 'text-muted-foreground text-sm',
                htmlFor: 'mcp-oauth-client-secret',
                children: 'Client Secret',
              }),
              (0, a.jsx)(ne, {
                ...n.register('clientSecret'),
                id: 'mcp-oauth-client-secret',
                type: 'password',
                autoComplete: 'off',
                placeholder: mode === 'edit' ? 'Leave blank to keep existing' : void 0,
              }),
            ],
          }),
        ],
      }),
    });
  },
  PRESET_URLS = new Set(
    Ye.flatMap(e => (e.server.transport === 'streamable-http' ? [normalUrl(e.server.url)] : [])),
  ) /** The saved servers and the Connect button. */,
  Servers = ({accountId, inventories, servers}) => {
    const s = ge(),
      i = je(),
      [l, p] = (0, se.useState)(null),
      k = q(s.mcp.saveServer.mutationOptions()),
      M = q(s.mcp.connect.mutationOptions()),
      v = q(s.mcp.cancel.mutationOptions()),
      I = s.settings.getAll.queryKey({accountId}),
      A = () => p({mode: 'create', draft: emptyDraft()}),
      D = x => () => p({mode: 'edit', name: x.name, draft: serverDraft(x)}),
      F = x => {
        x || p(null);
      },
      ee = async x => {
        if (!l) return;
        const Q = l.mode === 'edit' ? l.name : void 0,
          J = Q ? servers.find(b => b.name === Q) : void 0,
          te = new Set(servers.map(b => b.name).filter(b => b !== Q)),
          z = uniqueName(x.name.trim(), te),
          $ = serverFromDraft(x, J, z),
          {name, ...g} = $;
        try {
          const b = await k.mutateAsync({
            accountId,
            previousName: Q,
            name: z,
            server: g,
            clientSecret:
              x.transport === 'streamable-http' && x.authType === 'auto' && x.clientSecret.trim()
                ? x.clientSecret
                : void 0,
          });
          i.setQueryData(I, b.settings);
          const H = {accountId, name: z},
            V = s.mcp.connectionStatus.queryKey(H);
          if (
            (b.connection && i.setQueryData(V, b.connection),
            p(null),
            b.credentialError && N.warning(b.credentialError),
            $.transport === 'streamable-http')
          ) {
            if (!$.enabled || $.auth.type !== 'auto') return;
            i.setQueryData(V, {status: 'connecting'});
            const {connection, settings} = await M.mutateAsync(H);
            if (
              (reportConnection(H.name, connection), i.setQueryData(I, settings), !('authorizationUrl' in connection))
            ) {
              i.setQueryData(V, connection);
              return;
            }
            (openAuthWindow(connection.authorizationUrl, () => {
              v.mutateAsync(H).then(({connection, settings}) => {
                (i.setQueryData(V, connection), i.setQueryData(I, settings));
              });
            }),
              i.setQueryData(V, {status: connection.status}));
          }
        } catch (b) {
          N.error(b instanceof Error ? b.message : 'Could not save or connect MCP server.');
        }
      };
    return (0, a.jsxs)(a.Fragment, {
      children: [
        servers.map(x =>
          (0, a.jsx)(ServerRow, {accountId, inventory: inventories[x.name], server: x, onEdit: D(x)}, x.name),
        ),
        (0, a.jsxs)(Ra, {
          variant: 'action',
          className: 'w-full',
          render: (0, a.jsx)('button', {type: 'button', onClick: A}),
          children: [(0, a.jsx)(ze, {className: 'size-4'}), (0, a.jsx)(Re, {title: 'Connect'})],
        }),
        l ? (0, a.jsx)(ServerDialog, {state: l, onOpenChange: F, onSave: ee}) : null,
      ],
    });
  },
  ServerContext = (0, se.createContext)(null),
  ServerRow = ({accountId, inventory, server, onEdit}) =>
    (0, a.jsx)(ServerProvider, {
      accountId,
      inventory,
      server,
      onEdit,
      children: (0, a.jsx)(ServerItem, {}),
    }) /** The connection, actions and pending state of a server row. */,
  ServerProvider = ({accountId, children, inventory, server, onEdit}) => {
    const l = ge(),
      p = je(),
      {confirm} = Bt(),
      [M, v] = (0, se.useState)(false),
      I = server.transport === 'streamable-http',
      A = {accountId, name: server.name},
      D = l.mcp.connectionStatus.queryKey(A),
      F = l.settings.getAll.queryKey({accountId}),
      {data} = $e(
        l.mcp.connectionStatus.queryOptions(A, {
          enabled: I && server.enabled,
          refetchInterval: h => (h.state.data?.status === 'connecting' ? 1e3 : false),
        }),
      ),
      x = q(l.mcp.connect.mutationOptions()),
      Q = q(l.mcp.cancel.mutationOptions()),
      J = q(l.mcp.refreshTools.mutationOptions()),
      te = q(l.mcp.deleteServer.mutationOptions()),
      z = q(l.mcp.setEnabled.mutationOptions()),
      $ = q(l.mcp.testConnection.mutationOptions()),
      B = async () => {
        try {
          const {connection, settings} = await x.mutateAsync(A);
          (reportConnection(A.name, connection),
            p.setQueryData(F, settings),
            'authorizationUrl' in connection
              ? (openAuthWindow(connection.authorizationUrl, () => {
                  Q.mutateAsync(A).then(({connection, settings}) => {
                    (p.setQueryData(D, connection), p.setQueryData(F, settings));
                  });
                }),
                p.setQueryData(D, {status: connection.status}))
              : p.setQueryData(D, connection));
        } catch (h) {
          N.error('Could not start authentication.', {description: h instanceof Error ? h.message : String(h)});
        }
      },
      g = async () => {
        try {
          const {connection, settings} = await Q.mutateAsync(A);
          (p.setQueryData(D, connection), p.setQueryData(F, settings));
        } catch (h) {
          N.error(`Could not cancel ${server.name}.`, {description: h instanceof Error ? h.message : String(h)});
        }
      },
      b = async () => {
        try {
          const {connection, settings} = await J.mutateAsync(A);
          (p.setQueryData(D, connection), p.setQueryData(F, settings));
        } catch (h) {
          N.error(`Could not refresh ${server.name}.`, {description: h instanceof Error ? h.message : String(h)});
        }
      },
      H = async h => {
        if (
          await confirm({
            title: `${h} ${server.name}?`,
            description: 'This disconnects and removes the MCP server from new browser sessions.',
            ui: {action: h, variant: 'destructive'},
          })
        )
          try {
            const j = await te.mutateAsync(A);
            (p.setQueryData(F, j.settings),
              p.removeQueries({queryKey: D, exact: true}),
              j.credentialError && N.warning(j.credentialError));
          } catch (j) {
            N.error(j instanceof Error ? j.message : `Could not ${h.toLowerCase()} MCP server.`);
          }
      },
      V = async () => {
        const {name, ...j} = server;
        try {
          (await $.mutateAsync({accountId, name, server: j}), N.success(`Connected to ${name}`));
        } catch (G) {
          N.error(`Could not connect to ${name}`, {description: G instanceof Error ? G.message : String(G)});
        }
      },
      K = h => {
        z.mutate(
          {...A, enabled: h},
          {
            onSuccess: j => {
              (p.setQueryData(F, j), p.removeQueries({queryKey: D, exact: true}));
            },
            onError: j => N.error(j.message),
          },
        );
      };
    return (0, a.jsxs)(ServerContext, {
      value: {
        state: {connection: data, inventory, server},
        actions: {
          cancel: () => {
            g();
          },
          connect: () => {
            B();
          },
          delete: () => {
            H('Delete');
          },
          disconnect: () => {
            H('Disconnect');
          },
          edit: onEdit,
          refresh: () => {
            b();
          },
          test: () => {
            V();
          },
          toggle: K,
          viewTools: () => v(true),
        },
        meta: {
          connectionPending: x.isPending || Q.isPending,
          refreshing: J.isPending,
          testing: $.isPending,
          toggling: z.isPending,
        },
      },
      children: [children, (0, a.jsx)(ToolsDialog, {inventory, open: M, serverName: server.name, onOpenChange: v})],
    });
  },
  ServerItem = () => {
    const {
      state: {connection, server},
    } = useServer();
    return server.transport === 'streamable-http' &&
      PRESET_URLS.has(normalUrl(server.url)) &&
      connection?.status === 'connecting'
      ? null
      : (0, a.jsxs)(it, {
          className: 'gap-1.5',
          children: [(0, a.jsx)(ServerIcon, {}), (0, a.jsx)(ServerSummary, {}), (0, a.jsx)(ServerControls, {})],
        });
  },
  ServerIcon = () => {
    const {
      state: {server},
    } = useServer();
    return server.transport === 'streamable-http'
      ? (0, a.jsx)(ct, {name: server.name, url: server.url})
      : (0, a.jsx)('div', {
          className: 'bg-muted text-muted-foreground flex size-8 shrink-0 items-center justify-center rounded-md',
          children: (0, a.jsx)(Wt, {}),
        });
  },
  ServerSummary = () => {
    const {
        state: {connection, inventory, server},
      } = useServer(),
      s = server.transport === 'streamable-http' ? connection : void 0,
      i = inventory?.tools.length ?? 0;
    return (0, a.jsx)(Re, {
      title: (0, a.jsxs)('span', {
        className: 'flex items-center gap-1.5',
        children: [server.name, s ? (0, a.jsx)(ConnectionStatus, {connection: s}) : null],
      }),
      description: `${i} tool${i === 1 ? '' : 's'} cached · ${connection?.message ?? endpointLabel(server)}`,
    });
  },
  ServerControls = () => {
    const {
      state: {server},
      actions,
      meta,
    } = useServer();
    return (0, a.jsxs)(ja, {
      className: 'items-center gap-1',
      children: [
        meta.connectionPending || meta.refreshing || meta.testing || meta.toggling
          ? (0, a.jsx)(He, {className: 'size-4'})
          : null,
        (0, a.jsx)(Ta, {checked: server.enabled, disabled: meta.toggling, onCheckedChange: actions.toggle}),
        (0, a.jsx)(ServerMenu, {}),
      ],
    });
  } /** The menu of a server row. */,
  ServerMenu = () => {
    const {
        state: {connection, server},
        actions,
        meta,
      } = useServer(),
      i = server.transport === 'streamable-http',
      l =
        connection?.status === 'connected' && connection.authStatus === 'required'
          ? 'Authorize'
          : connection
            ? ACTION_LABELS[connection.status]
            : void 0,
      p = i && connection?.status === 'connected' && server.auth.type === 'auto',
      k = server.enabled && (!i || connection?.status === 'connected'),
      M = server.transport === 'stdio' ? !!server.command : !!server.url;
    return (0, a.jsxs)(Jt, {
      children: [
        (0, a.jsx)(Vt, {
          render: v => {
            const {className, ...A} = v;
            return (0, a.jsx)(pe, {size: 'icon', variant: 'ghost', 'aria-label': `${server.name} actions`, ...A});
          },
          children: (0, a.jsx)(ia, {}),
        }),
        (0, a.jsxs)(Gt, {
          align: 'end',
          children: [
            i && l
              ? (0, a.jsxs)(a.Fragment, {
                  children: [
                    (0, a.jsxs)(W, {
                      disabled: meta.connectionPending,
                      onClick: l === 'Cancel' ? actions.cancel : actions.connect,
                      children: [
                        l === 'Cancel' ? (0, a.jsx)(Da, {}) : (0, a.jsx)(La, {}),
                        (0, a.jsx)('span', {children: l}),
                      ],
                    }),
                    (0, a.jsx)(Le, {}),
                  ],
                })
              : null,
            (0, a.jsxs)(W, {
              onClick: actions.edit,
              children: [(0, a.jsx)(Xt, {}), (0, a.jsx)('span', {children: 'Edit'})],
            }),
            (0, a.jsxs)(W, {
              disabled: meta.testing || !M,
              onClick: actions.test,
              children: [(0, a.jsx)(_a, {}), (0, a.jsx)('span', {children: 'Test connection'})],
            }),
            (0, a.jsxs)(W, {
              onClick: actions.viewTools,
              children: [(0, a.jsx)(ca, {}), (0, a.jsx)('span', {children: 'View tools'})],
            }),
            k
              ? (0, a.jsxs)(W, {
                  disabled: meta.refreshing,
                  onClick: actions.refresh,
                  children: [(0, a.jsx)(ra, {}), (0, a.jsx)('span', {children: 'Refresh tools'})],
                })
              : null,
            (0, a.jsx)(Le, {}),
            (0, a.jsxs)(W, {
              variant: 'destructive',
              onClick: p ? actions.disconnect : actions.delete,
              children: [
                p ? (0, a.jsx)(oa, {}) : (0, a.jsx)(Yt, {}),
                (0, a.jsx)('span', {children: p ? 'Disconnect' : 'Delete'}),
              ],
            }),
          ],
        }),
      ],
    });
  } /** The tools the server last reported. */,
  ToolsDialog = ({inventory, open, serverName, onOpenChange}) => {
    const i = inventory?.tools ?? [];
    return (0, a.jsx)(ot, {
      open,
      onOpenChange,
      children: (0, a.jsxs)(nt, {
        className: 'sm:max-w-lg',
        children: [
          (0, a.jsxs)(at, {
            children: [
              (0, a.jsxs)(rt, {children: [serverName, ' tools']}),
              (0, a.jsxs)(tt, {
                children: [
                  i.length,
                  ' cached tool',
                  i.length === 1 ? '' : 's',
                  ' · Last updated',
                  ' ',
                  inventory
                    ? (0, a.jsx)('time', {
                        dateTime: inventory.refreshedAt,
                        children: (0, a.jsx)(Zt, {datetime: inventory.refreshedAt}),
                      })
                    : 'unknown',
                ],
              }),
            ],
          }),
          i.length > 0
            ? (0, a.jsx)(Ca, {
                className: 'max-h-80 overflow-y-auto',
                children: i.map(l =>
                  (0, a.jsxs)(
                    xa,
                    {
                      value: l.name,
                      children: [
                        (0, a.jsx)(Sa, {children: (0, a.jsx)('code', {className: 'break-all', children: l.name})}),
                        (0, a.jsx)(va, {children: l.description || 'No description provided.'}),
                      ],
                    },
                    l.name,
                  ),
                ),
              })
            : (0, a.jsx)('p', {
                className: 'text-muted-foreground py-8 text-center text-sm',
                children: inventory
                  ? '0 tools.'
                  : 'No cached tools. Enable or connect this server, then refresh tools.',
              }),
        ],
      }),
    });
  },
  useServer = () => {
    const e = (0, se.use)(ServerContext);
    if (!e) throw new Error('MCP server components must be rendered within McpServerProvider.');
    return e;
  },
  STATUS_LABELS = {connected: 'Connected', invalid_server: 'Invalid server', unreachable: 'Unreachable'},
  ACTION_LABELS = {connect: 'Connect', connecting: 'Cancel', reconnect: 'Reconnect', unreachable: 'Retry'},
  ConnectionStatus = ({connection}) => {
    const n =
      connection.status === 'connected' && connection.authStatus === 'required'
        ? 'Connected · Auth required'
        : STATUS_LABELS[connection.status];
    return n
      ? (0, a.jsxs)(da, {
          children: [
            (0, a.jsx)(la, {
              children: (0, a.jsx)('div', {
                className: Ht(
                  'bg-muted size-1.5 rounded-full',
                  connection.status === 'connected' && connection.authStatus !== 'required' && 'bg-emerald-500',
                  connection.authStatus === 'required' && 'bg-amber-500',
                  ['invalid_server', 'unreachable'].includes(connection.status) && 'bg-red-500',
                ),
              }),
            }),
            (0, a.jsx)(ma, {children: n}),
          ],
        })
      : null;
  };
function ks() {
  return (0, a.jsxs)('div', {
    className: 'mx-auto w-full max-w-2xl px-8 pt-16 pb-40',
    children: [
      (0, a.jsx)(ka, {segments: ['Settings', 'Plugins & MCPs', 'MCPs']}),
      (0, a.jsx)(Ea, {}),
      (0, a.jsx)(se.Suspense, {fallback: (0, a.jsx)(ba, {}), children: (0, a.jsx)(McpsPage, {})}),
    ],
  });
}
var /** The servers, the note that most sites need no MCP, and the presets. */
  McpsPage = () => {
    const {userId} = ga.useParams(),
      n = Number.parseInt(userId, 10),
      r = ge(),
      {data} = Kt(r.settings.getAll.queryOptions({accountId: n})),
      i = Object.entries(data.mcp.servers).map(([l, p]) => ({name: l, ...p}));
    return (0, a.jsxs)('div', {
      className: 'flex flex-col gap-8',
      children: [
        (0, a.jsxs)(st, {
          title: 'Servers',
          children: [
            (0, a.jsx)(Ce, {
              className: 'bg-brand/15! text-brand-content! border-none px-3 py-3',
              children: (0, a.jsxs)('div', {
                className: 'flex gap-1.5',
                children: [
                  (0, a.jsx)(sa, {className: 'size-4'}),
                  (0, a.jsxs)('div', {
                    children: [
                      (0, a.jsx)('p', {
                        className: 'mb-1 text-sm leading-none font-medium',
                        children: (0, a.jsx)('span', {children: 'You might not need an MCP'}),
                      }),
                      (0, a.jsxs)('p', {
                        className: 'text-xs font-medium opacity-80',
                        children: [
                          'Aux understands and works with websites without MCPs. ',
                          (0, a.jsx)('br', {}),
                          'Only connect an MCP if you need to work with desktop apps or speed up your workflows.',
                        ],
                      }),
                    ],
                  }),
                ],
              }),
            }),
            (0, a.jsx)(Ce, {
              children: (0, a.jsx)(Servers, {accountId: n, inventories: data.mcp.inventories, servers: i}),
            }),
          ],
        }),
        (0, a.jsx)(Presets, {accountId: n, servers: i}),
      ],
    });
  }
