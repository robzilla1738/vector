/* Aux-owned source, General settings pass 2 (assets/general-3dgRbrRk.js, from the loading row to the
 * about line, between the injected AuxDeveloperSettings and AuxRoutingSettings, which stay with their
 * owners): the default browser, search engine, New Tab mode, auto Picture-in-Picture, screenshots,
 * spell check, browser updates and the background service's health, and the Chromium credit.
 * Names the page in the first pass renders keep their chunk names: qm DefaultBrowser, Ym SearchEngine,
 * Km NewTabMode, _l useAutoPip, Zm AutoPictureInPicture, jm Screenshots, Qm SpellCheck, ag BrowserSection,
 * og ChromiumCredit.
 * Chunk names used: A JSX runtime, the settings sections, rows and switches, the query hooks, and the
 * first pass's names. */
var LoadingRow = () =>
    (0, A.jsxs)(Pi, {
      children: [
        (0, A.jsx)(un, {
          children: (0, A.jsxs)(Bt, {
            className: 'min-h-15 gap-2',
            children: [
              (0, A.jsx)(wi, {className: 'size-10 shrink-0 rounded-lg'}),
              (0, A.jsx)(wi, {className: 'h-4 w-48'}),
            ],
          }),
        }),
        (0, A.jsx)(un, {
          children: (0, A.jsx)(Bt, {
            className: 'h-14',
            children: (0, A.jsxs)('div', {
              className: 'space-y-2',
              children: [(0, A.jsx)(wi, {className: 'h-4 w-48'}), (0, A.jsx)(wi, {className: 'h-2.5 w-64'})],
            }),
          }),
        }),
      ],
    }) /** Setting Aux as the default browser. */,
  qm = () => {
    const {resolvedTheme} = fo(),
      {capture} = Xi(),
      n = !!Tn(),
      {data, isLoading, refetch} = en({
        queryKey: ['browserPreferences', 'defaultBrowserState'],
        queryFn: () => Wt().getDefaultBrowserState(),
        enabled: n,
      }),
      a = Fn({
        mutationFn: () => Wt().setAsDefaultBrowser(),
        onSuccess: l => {
          (refetch(), capture('settings.set-as-default-browser', {place: 'settings', value: l.isDefault}));
        },
      });
    if (!n || isLoading || data?.isDefault) return null;
    const o = !data?.canSet || a.isPending;
    return (0, A.jsx)('section', {
      children: (0, A.jsx)(un, {
        className: 'border-none!',
        children: (0, A.jsxs)(Bt, {
          className: 'bg-brand dark:bg-brand/20 dark:text-brand-content w-full gap-1 text-white',
          children: [
            (0, A.jsx)(vm, {
              className: 'size-6 shrink-0',
              color: resolvedTheme === 'dark' ? '#38BDF8' : '#FFFFFF',
              fallback: (0, A.jsx)(Zl, {
                className: 'dark:text-brand-content size-full text-white',
                style: {color: resolvedTheme === 'dark' ? '#38BDF8' : '#FFFFFF'},
              }),
            }),
            (0, A.jsx)('p', {
              className: 'min-w-0 grow px-1 text-left text-sm font-medium',
              children: data?.policyDisabled
                ? 'Default browser is managed by your organization'
                : 'Aux works best as your default browser',
            }),
            (0, A.jsx)(pn, {
              className: 'max-w-40 shrink-0',
              children: (0, A.jsxs)(yt, {
                className:
                  'bg-background! dark:bg-brand! focus-visible:ring-brand/80 click-depth-effect text-neutral-900! hover:opacity-80',
                disabled: o,
                onClick: () => a.mutate(),
                children: [a.isPending && (0, A.jsx)(Lr, {}), (0, A.jsx)('span', {children: 'Set as default'})],
              }),
            }),
          ],
        }),
      }),
    });
  },
  SEARCH_ENGINES_KEY = ['browserPreferences', 'searchEngines'] /** The default search engine. */,
  Ym = () => {
    const {capture} = Xi(),
      t = Bn(),
      n = !!Tn(),
      {data} = en({queryKey: SEARCH_ENGINES_KEY, queryFn: () => Wt().getSearchEngines(), enabled: n}),
      r = data?.searchEngines ?? [],
      s = data?.defaultEngineId ?? r.find(l => l.isDefault)?.id ?? null,
      a = Fn({
        mutationFn: async l => (await Wt().setDefaultSearchEngine(l), l),
        onSuccess: l => {
          (t.setQueryData(
            SEARCH_ENGINES_KEY,
            c =>
              c && {...c, defaultEngineId: l, searchEngines: c.searchEngines.map(h => ({...h, isDefault: h.id === l}))},
          ),
            capture('settings.search.set-default-engine', {value: r.find(c => c.id === l)?.keyword ?? l}));
        },
        onError: l => Dn.error(l instanceof Error ? l.message : 'Could not update search engine.'),
      }),
      o = l => {
        !l || l === s || a.mutate(l);
      };
    return (0, A.jsxs)(Bt, {
      children: [
        (0, A.jsx)(qt, {
          title: 'Default search engine',
          description: n ? 'Used for searches from the address bar' : 'Search engine settings are unavailable',
        }),
        (0, A.jsx)(pn, {
          children: (0, A.jsxs)(Dr, {
            value: s,
            disabled: !n || a.isPending || r.length === 0,
            onValueChange: o,
            children: [
              (0, A.jsx)(Ir, {
                className: 'w-full',
                children: (0, A.jsx)(Is, {placeholder: n ? 'Select..' : 'Unavailable'}),
              }),
              (0, A.jsx)(Nr, {
                children: r.map(l =>
                  (0, A.jsx)(
                    Oi,
                    {value: l.id, children: (0, A.jsx)('span', {className: 'min-w-0 truncate', children: l.name})},
                    l.id,
                  ),
                ),
              }),
            ],
          }),
        }),
      ],
    });
  },
  Km = () => {
    const {capture} = Xi(),
      [t, n] = (0, at.useState)(Uc),
      i = r => {
        !r || r === t || (Dc(r), n(r), capture('settings.new-tab.set-default-omnibox-mode', {value: r}));
      };
    return (0, A.jsxs)(Bt, {
      children: [
        (0, A.jsx)(qt, {title: 'New tab mode', description: 'Open new tabs in Search or Ask'}),
        (0, A.jsx)(pn, {
          children: (0, A.jsxs)(Dr, {
            value: t,
            onValueChange: i,
            children: [
              (0, A.jsx)(Ir, {className: 'w-full', children: (0, A.jsx)(Is, {})}),
              (0, A.jsxs)(Nr, {
                children: [
                  (0, A.jsx)(Oi, {value: 'search', children: 'Search'}),
                  (0, A.jsx)(Oi, {value: 'ask', children: 'Ask'}),
                ],
              }),
            ],
          }),
        }),
      ],
    });
  },
  AUTO_PIP_KEY = ['browserPreferences', 'autoPipEnabled'],
  _l = () => {
    const e = Tn();
    return !!(e?.getAutoPipEnabled && e?.setAutoPipEnabled);
  },
  Zm = () => {
    const {capture} = Xi(),
      t = Bn(),
      n = _l(),
      {data} = en({
        queryKey: AUTO_PIP_KEY,
        queryFn: async () => {
          const s = Tn();
          if (!s?.getAutoPipEnabled)
            throw new Error('chrome.auxBrowserPreferences.getAutoPipEnabled API is unavailable');
          return s.getAutoPipEnabled();
        },
        enabled: n,
      }),
      r = Fn({
        mutationFn: async s => {
          const a = Tn();
          if (!a?.setAutoPipEnabled)
            throw new Error('chrome.auxBrowserPreferences.setAutoPipEnabled API is unavailable');
          return (await a.setAutoPipEnabled(s), s);
        },
        onSuccess: s => {
          (t.setQueryData(AUTO_PIP_KEY, s), capture('settings.pip.set-auto-pip-enabled', {value: s}));
        },
        onError: s => Dn.error(s instanceof Error ? s.message : 'Could not update Picture-in-Picture.'),
      });
    return (0, A.jsxs)(Bt, {
      children: [
        (0, A.jsx)(qt, {title: 'Auto Picture-in-Picture', description: switchRow(n, data)}),
        (0, A.jsx)(pn, {
          children: (0, A.jsx)(Ds, {
            checked: !!data,
            disabled: !n || data === void 0 || r.isPending,
            onCheckedChange: s => r.mutate(s),
          }),
        }),
      ],
    });
  },
  switchRow = (e, t) =>
    e
      ? t === void 0
        ? 'Loading Picture-in-Picture settings...'
        : 'Show floating player when switching from a video tab'
      : 'Picture-in-Picture settings are unavailable in this browser version',
  CAPTURE_QUERY_KEY = ['capture', 'enabled'],
  canStoreLocally = () => typeof chrome < 'u' && !!chrome.storage?.local,
  jm = () => {
    const {capture} = Xi(),
      t = Bn(),
      n = canStoreLocally(),
      {data} = en({queryKey: CAPTURE_QUERY_KEY, queryFn: xm, enabled: n}),
      r = Fn({
        mutationFn: async s => (await Mm(s), s),
        onSuccess: s => {
          (t.setQueryData(CAPTURE_QUERY_KEY, s), capture('settings.capture.set-enabled', {value: s}));
        },
        onError: s => Dn.error(s instanceof Error ? s.message : 'Could not update Screenshot.'),
      });
    return (0, A.jsxs)(Bt, {
      children: [
        (0, A.jsx)(qt, {
          title: 'Screenshot',
          description: n ? 'Capture the current page from the right-click menu' : 'Screenshot settings are unavailable',
        }),
        (0, A.jsx)(pn, {
          children: (0, A.jsx)(Ds, {
            checked: data ?? true,
            disabled: !n || data === void 0 || r.isPending,
            onCheckedChange: s => r.mutate(s),
          }),
        }),
      ],
    });
  },
  Qm = () => {
    const e = Bn(),
      t = !!Tn(),
      {data} = en({queryKey: Pr, queryFn: () => Wt().getLanguageSettings(), enabled: t}),
      i = Fn({
        mutationFn: async r => (await Wt().setSpellCheckEnabled(r), r),
        onSuccess: r => {
          e.setQueryData(Pr, s => s && {...s, spellCheckEnabled: r});
        },
        onError: r => Dn.error(r instanceof Error ? r.message : 'Could not update spell check.'),
      });
    return (0, A.jsxs)(Bt, {
      children: [
        (0, A.jsx)(qt, {title: 'Spell check', description: spellCheckLabel(t, data)}),
        (0, A.jsx)(pn, {
          children: (0, A.jsx)(Ds, {
            checked: !!data?.spellCheckEnabled,
            disabled: !t || !data || !data.spellCheckSupported || i.isPending,
            onCheckedChange: r => i.mutate(r),
          }),
        }),
      ],
    });
  },
  spellCheckLabel = (e, t) =>
    e
      ? t
        ? t.spellCheckSupported
          ? 'Check spelling as you type'
          : 'Spell check is unavailable for your preferred languages'
        : 'Loading language settings...'
      : 'Spell check settings are unavailable',
  DAEMON_HEALTH_KEY = ['daemon', 'health'],
  LAG_KEY = 'aux.settings.backgroundServiceLag.v2',
  versionLabel = e =>
    e
      ? e === 'dev' || e.startsWith('v')
        ? `Current version is ${e}`
        : `Current version is v${e}`
      : 'Current version unavailable',
  cleanVersion = e => e?.trim().replace(/^v/i, ''),
  readDaemonHealth = async () => {
    try {
      const e = await fetch(new URL('/health', Wl), {signal: AbortSignal.timeout(2e3)});
      if (!e.ok) return null;
      const t = await e.json();
      return {
        version: typeof t.version == 'string' ? t.version : void 0,
        startedAt: typeof t.startedAt == 'string' ? t.startedAt : void 0,
      };
    } catch {
      return null;
    }
  } /** Browser updates: checking, available, or turned off for this build. */,
  BrowserUpdates = (e, t, n) => {
    if (!n) return 'Browser update controls unavailable';
    const i = versionLabel(e);
    if (!t) return i;
    if (t.message) return t.message;
    switch (t.status) {
      case 'updated':
        return (0, A.jsxs)(A.Fragment, {children: [i, '. Aux is up to date.']});
      case 'nearly_updated':
        return (0, A.jsxs)(A.Fragment, {children: [i, '. Restart to finish updating.']});
      case 'disabled_by_admin':
        return 'Updates are disabled by your administrator.';
      case 'disabled':
        return 'Updates are disabled for this build.';
      case 'deferred':
        return (0, A.jsxs)(A.Fragment, {children: [i, '. Update is deferred.']});
      case 'failed':
      case 'failed_connection_type_disallowed':
      case 'failed_download':
      case 'failed_http':
      case 'failed_offline':
      case 'update_to_rollback_version_disallowed':
        return (0, A.jsxs)(A.Fragment, {children: [i, '. Update check failed.']});
      case 'need_permission_to_update':
        return (0, A.jsxs)(A.Fragment, {children: [i, '. Update requires permission.']});
      case 'checking':
      case 'updating':
        return (0, A.jsxs)(A.Fragment, {children: [i, '. Checking for updates.']});
    }
    return i;
  },
  isSameLag = (e, t) => {
    try {
      const n = JSON.parse(localStorage.getItem(LAG_KEY) ?? '{}');
      return n.lag !== e
        ? (localStorage.setItem(LAG_KEY, JSON.stringify({lag: e, startedAt: t})), true)
        : n.startedAt === t;
    } catch {
      return true;
    }
  } /** The background service: running, lagging or stopped. */,
  BackgroundService = (e, t, n) => {
    if (n) return 'Checking background service version.';
    if (!e?.version) return 'Background service is not responding. Restart Aux.';
    const i = versionLabel(e.version),
      r = cleanVersion(e.version),
      s = cleanVersion(t);
    return r && s && r !== s && isSameLag(`${r}->${s}`, e.startedAt)
      ? 'Restart Aux to finish updating the background service.'
      : 'Running normally.';
  },
  ag = () => {
    const e = (0, at.useRef)(false),
      t = !!Tn(),
      n = typeof chrome > 'u' ? void 0 : chrome.runtime?.getManifest?.(),
      i = n?.version_name ?? n?.version,
      {data: r} = en({
        queryKey: ['browserPreferences', 'version'],
        queryFn: () => Wt().getBrowserVersion(),
        enabled: t,
      }),
      {data: s, isPending, mutate} = Fn({mutationFn: () => Wt().checkForUpdates()}),
      {data, isLoading} = en({queryKey: DAEMON_HEALTH_KEY, queryFn: readDaemonHealth, refetchInterval: 3e4});
    (0, at.useEffect)(() => {
      !t || e.current || ((e.current = true), mutate());
    }, [t, mutate]);
    const h = BrowserUpdates(r, s, t),
      d = BackgroundService(data, i, isLoading);
    return (0, A.jsxs)(A.Fragment, {
      children: [
        (0, A.jsxs)(Bt, {
          children: [
            (0, A.jsx)(qt, {title: 'Browser', description: h, searchTerms: ['update', 'updates', 'check for updates']}),
            (0, A.jsx)(pn, {
              children: (0, A.jsxs)(yt, {
                className: 'click-depth-effect',
                disabled: !t || isPending,
                onClick: () => mutate(),
                children: [isPending && (0, A.jsx)(Lr, {}), (0, A.jsx)('span', {children: 'Check for updates'})],
              }),
            }),
          ],
        }),
        (0, A.jsx)(Bt, {children: (0, A.jsx)(qt, {title: 'Background service', description: d})}),
      ],
    });
  } /** Aux is built on Chromium and other open source software. */,
  og = () =>
    (0, A.jsxs)('p', {
      className:
        'text-muted-foreground/60 [&_a]:text-brand-content/80 [&_a]:hover:text-brand-content [&_a]:decoration-brand/40 py-3 text-xs font-medium [&_a]:underline [&_a]:underline-offset-2',
      children: [
        'Copyright © 2026 Courson Digital LLC. All rights reserved.',
        (0, A.jsx)('br', {}),
        'Aux is made possible by the',
        ' ',
        (0, A.jsx)(wc, {to: 'https://www.chromium.org/chromium-projects/', children: 'Chromium'}),
        ' open source project and other ',
        (0, A.jsx)(Pc, {to: 'aux://credits/', children: 'open source software'}),
        '.',
      ],
    })
