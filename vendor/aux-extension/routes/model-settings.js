/* Aux-owned source: the Models settings page (assets/model-BrFuJM2w.js, after its imports; Ws
 * exported as component). Providers (connected ones with their plan or method, subscription usage,
 * edit, set models, reauthenticate, disconnect or delete, and connecting more), the OpenRouter and AI
 * Gateway model pickers grouped by vendor, the image generation model, and the auto-compaction limit
 * (a default percentage and per-model token limits, typed as 120k or 1.5m).
 * Names the rest of the chunk uses keep their chunk names: Ws the page.
 * Chunk names used: N the model settings context, F useApp, R useTRPC, U useQuery, V useQueryClient,
 * z useMutation, K toasts, Re confirm, Ae model inventory broadcast, W provider icon, H/ye/je/Qe
 * settings rows, E Button, T/ge/fe/xe/Xe/Ke/et menu parts, Ge model select, De debounce, xt/wt/ht/ft/It
 * zod and limits, Je built-in providers, te/ke/Ct provider kinds. */
var React = Ue(Ve(), 1),
  jsxRuntime = We(),
  COMPACTION_FORM_ID = 'compaction-limits-form',
  compactionForm = xt({thresholdPercent: wt, modelThresholdTokens: ht(ft(), It)}),
  CompactionLimitMenu = () => {
    const {accountId} = F(),
      s = V(),
      r = R(),
      {data} = U(r.settings.getAll.queryOptions({accountId})),
      a = Ee({
        accountId,
        scope: {id: `compaction-limits:${accountId}`},
        onError: f => {
          (K.error(f.message), s.invalidateQueries(r.settings.getAll.queryFilter({accountId})));
        },
      }),
      u = it({resolver: ot(compactionForm), values: data.compaction}),
      o = oe({control: u.control, name: 'modelThresholdTokens'}),
      l = Object.keys(o),
      m = f => {
        const y = r.settings.getAll.queryKey({accountId}),
          g = {...(s.getQueryData(y)?.compaction ?? data.compaction), ...f};
        (s.setQueryData(y, M => M && {...M, compaction: g}), a.mutate({key: 'compaction', value: g, accountId}));
      };
    return (0, jsxRuntime.jsx)(at, {
      ...u,
      children: (0, jsxRuntime.jsx)('form', {
        id: COMPACTION_FORM_ID,
        onSubmit: u.handleSubmit(m),
        children: (0, jsxRuntime.jsx)(ee, {
          children: (0, jsxRuntime.jsxs)(je, {
            className: he(l.length > 0 && 'flex-col items-stretch gap-3'),
            children: [
              (0, jsxRuntime.jsx)(CompactionLimits, {}),
              l.length > 0 &&
                (0, jsxRuntime.jsx)('div', {
                  className: 'border-border divide-border mb-0.5 divide-y rounded-lg border',
                  children: l.map(f => (0, jsxRuntime.jsx)(ModelCompactionRow, {modelKey: f}, f)),
                }),
            ],
          }),
        }),
      }),
    });
  } /** The auto-compaction limit: a default percentage, and token limits for chosen models. */,
  CompactionLimits = () => {
    const t = ie(),
      s = oe({control: t.control, name: 'thresholdPercent'}),
      r = n => {
        t.setValue('thresholdPercent', Math.min(95, Math.max(50, n)));
      };
    return (0, jsxRuntime.jsxs)('div', {
      className: 'flex grow items-center justify-between gap-3',
      children: [
        (0, jsxRuntime.jsx)(H, {
          title: 'Auto-compaction limit',
          description: "Percent of each model's context window",
          searchable: false,
        }),
        (0, jsxRuntime.jsx)(LimitField, {
          label: 'Default auto-compaction limit',
          value: s,
          unit: '%',
          format: String,
          parse: parsePercent,
          onCommit: r,
          children: (0, jsxRuntime.jsx)(CompactionDefaultRow, {}),
        }),
      ],
    });
  },
  CompactionDefaultRow = () => {
    const t = ie(),
      [s, r] = (0, React.useState)(false),
      n = u => {
        (t.setValue('thresholdPercent', 85), u.currentTarget.form?.requestSubmit());
      },
      a = () => r(false);
    return (0, jsxRuntime.jsxs)(ge, {
      open: s,
      onOpenChange: r,
      children: [
        (0, jsxRuntime.jsx)(fe, {
          render: (0, jsxRuntime.jsx)(E, {
            variant: 'outline',
            size: 'icon',
            'aria-label': 'Auto-compaction limit options',
          }),
          children: (0, jsxRuntime.jsx)(Oe, {}),
        }),
        (0, jsxRuntime.jsxs)(xe, {
          align: 'end',
          children: [
            (0, jsxRuntime.jsx)(ue, {
              children: (0, jsxRuntime.jsxs)(T, {
                nativeButton: true,
                render: (0, jsxRuntime.jsx)('button', {type: 'button', form: COMPACTION_FORM_ID, onClick: n}),
                children: [(0, jsxRuntime.jsx)(Ne, {}), (0, jsxRuntime.jsx)('span', {children: 'Reset limit'})],
              }),
            }),
            (0, jsxRuntime.jsx)(de, {}),
            (0, jsxRuntime.jsx)(ue, {children: (0, jsxRuntime.jsx)(CustomizeLimits, {onSelect: a})}),
          ],
        }),
      ],
    });
  } /** A model’s own compaction limit, or a note that its provider is no longer connected. */,
  ModelCompactionRow = ({modelKey}) => {
    const {accountId} = F(),
      r = ie(),
      [n, a] = (0, React.useState)(null),
      u = R(),
      {data} = U(
        u.models.listSettingsInventory.queryOptions(
          {accountId},
          {select: c => c.availableModels.find(x => pe(x) === modelKey)},
        ),
      ),
      l = oe({control: r.control, name: 'modelThresholdTokens'})[modelKey] ?? 0,
      m = data?.contextWindow ?? 0,
      f = data?.name ?? modelKey,
      y = m > 0 ? Se(m, l) : l,
      g = c => {
        const x = m > 0 ? Se(m, c) : c;
        (a(
          x > c
            ? `Raised to the ${we(x)} minimum for this model`
            : x < c
              ? `Lowered to the ${we(x)} maximum for this model`
              : null,
        ),
          r.setValue('modelThresholdTokens', {...r.getValues('modelThresholdTokens'), [modelKey]: x}));
      },
      M = () => a(null),
      p = c => {
        const {[modelKey]: x, ...v} = r.getValues('modelThresholdTokens');
        (r.setValue('modelThresholdTokens', v), c.currentTarget.form?.requestSubmit());
      };
    return (0, jsxRuntime.jsxs)('div', {
      className: 'flex min-h-10 items-center gap-2 px-2.5 py-1.5',
      children: [
        (0, jsxRuntime.jsx)(W, {
          provider: data?.provider ?? modelKey.split('/')[0] ?? '',
          className: 'text-muted-foreground size-4 shrink-0',
        }),
        (0, jsxRuntime.jsxs)('div', {
          className: 'min-w-0 grow',
          children: [
            (0, jsxRuntime.jsx)('span', {
              className: 'block truncate text-sm',
              title: data ? `${st(data.provider)} · ${modelKey}` : modelKey,
              children: f,
            }),
            (n || !data) &&
              (0, jsxRuntime.jsx)('p', {
                className: 'text-muted-foreground text-xs',
                role: 'status',
                children: n ?? 'Model unavailable — connect its provider to use this limit',
              }),
          ],
        }),
        (0, jsxRuntime.jsx)(LimitField, {
          label: `Tokens before ${f} auto-compacts`,
          value: y,
          unit: 'tokens',
          format: formatTokens,
          parse: parseTokens,
          onCommit: g,
          onEdit: M,
        }),
        (0, jsxRuntime.jsx)(E, {
          className:
            'text-muted-foreground hover:text-destructive focus-visible:text-destructive hover:bg-destructive/20! focus-visible:bg-destructive/20! -mr-1 shrink-0',
          variant: 'ghost',
          size: 'icon-sm',
          type: 'button',
          'aria-label': `Remove limit for ${f}`,
          title: `Remove limit for ${f}`,
          onClick: p,
          children: (0, jsxRuntime.jsx)(ut, {}),
        }),
      ],
    });
  } /** A limit typed and committed on Enter or blur; Escape restores it. */,
  LimitField = ({children, label, value, format, parse, onCommit, onEdit}) => {
    const [l, m] = (0, React.useState)(null),
      f = l !== null && l.trim() !== '' && parse(l) === null,
      y = c => {
        if (l === null) return;
        const x = parse(l);
        (m(null), x !== null && (onCommit(x), c.currentTarget.form?.requestSubmit()));
      },
      g = c => c.currentTarget.select(),
      M = c => {
        (m(c.target.value), onEdit?.());
      },
      p = c => {
        c.key === 'Enter' ? (c.preventDefault(), y(c)) : c.key === 'Escape' && (c.preventDefault(), m(null));
      };
    return (0, jsxRuntime.jsxs)(Ye, {
      className: 'w-36 shrink-0',
      'aria-label': label,
      children: [
        (0, jsxRuntime.jsxs)(ne, {
          children: [
            (0, jsxRuntime.jsx)(re, {
              'aria-label': label,
              'aria-invalid': f || void 0,
              inputMode: 'decimal',
              autoComplete: 'off',
              spellCheck: false,
              className: 'text-right tabular-nums',
              value: l ?? format(value),
              onFocus: g,
              onChange: M,
              onBlur: y,
              onKeyDown: p,
            }),
            (0, jsxRuntime.jsx)(se, {align: 'inline-end', children: '%'}),
          ],
        }),
        children,
      ],
    });
  },
  CustomizeLimits = ({onSelect}) => {
    const {modelCatalog} = N(),
      r = ie(),
      n = oe({control: r.control, name: 'modelThresholdTokens'}),
      a = modelCatalog.models.filter(o => !(pe(o) in n)),
      u = o => {
        if (!o) return;
        const l = a.find(m => m.provider === o.provider && m.id === o.modelId);
        l &&
          (r.setValue('modelThresholdTokens', {
            ...r.getValues('modelThresholdTokens'),
            [pe(l)]: Mt(l.contextWindow, r.getValues('thresholdPercent')),
          }),
          document.querySelector(`#${COMPACTION_FORM_ID}`)?.requestSubmit(),
          onSelect());
      };
    return (0, jsxRuntime.jsx)(Ge, {
      value: null,
      modelCatalog: {...modelCatalog, models: a},
      hideFreeAuxProvider: false,
      unavailableValueLabel: 'Customize',
      onChange: u,
      children: (0, jsxRuntime.jsx)(_e, {
        submenu: true,
        disabled: !a.length,
        render: ({children, ...l}) =>
          (0, jsxRuntime.jsxs)('button', {
            ...l,
            type: 'button',
            children: [(0, jsxRuntime.jsx)(me, {}), (0, jsxRuntime.jsx)('span', {children: 'Customize'})],
          }),
      }),
    });
  },
  TOKEN_UNITS = {k: 1e3, m: 1e6},
  formatTokens = t =>
    t.toLocaleString('en-US') /** Tokens as typed: 120000, 120k or 1.5m (commas, spaces and underscores ignored). */,
  parseTokens = t => {
    const s = /^([\d.]+)\s*([km])?$/i.exec(t.replace(/[,_\s]/g, ''));
    if (!s?.[1]) return null;
    const r = Number(s[1]),
      n = s[2]?.toLowerCase(),
      a = Math.round(r * (n ? TOKEN_UNITS[n] : 1));
    return Number.isFinite(a) && a > 0 ? a : null;
  } /** A percentage as typed, with or without %. */,
  parsePercent = t => {
    const s = Number(t.replace(/[%\s]/g, ''));
    return t.trim() && Number.isFinite(s) ? Math.round(s) : null;
  } /** The image generation model: chosen, or automatic. */,
  ImageModelRow = () => {
    const {accountId} = F(),
      s = R(),
      {data: r} = U(s.settings.getAll.queryOptions({accountId})),
      {data} = U(s.models.listAvailableImages.queryOptions({accountId})),
      {modelCatalog} = N(),
      u = Ee({accountId, syncGetAllCache: true}),
      o = r.imageGenerationModel,
      l = data[0],
      m = o ? data.find(p => p.provider === o.provider && p.id === o.modelId) : void 0,
      f = (0, React.useMemo)(() => {
        const p = data.map(v => ({
            ...v,
            shortName: v.name,
            availableThinkingLevels: ['off'],
            supportsFastMode: false,
            supportsVision: false,
            contextWindow: 0,
          })),
          c = new Set(p.map(v => v.provider)),
          x = modelCatalog.providerOptions.filter(v => c.has(v.id));
        return {
          providerOptions: x,
          modelsByProvider: Object.fromEntries(x.map(v => [v.id, p.filter(b => b.provider === v.id)])),
          models: p,
        };
      }, [data, modelCatalog.providerOptions]),
      y = o?.provider ?? l?.provider,
      g = p => {
        u.mutate({
          accountId,
          key: 'imageGenerationModel',
          value: p ? {provider: p.provider, modelId: p.modelId} : null,
        });
      },
      M = (0, jsxRuntime.jsx)(_e, {
        render: ({children, ...c}) =>
          (0, jsxRuntime.jsxs)(E, {
            ...c,
            className: 'w-full min-w-0 justify-start text-left',
            variant: 'outline',
            children: [y && (0, jsxRuntime.jsx)(W, {provider: y, className: 'size-4'}), children],
          }),
      });
    return (0, jsxRuntime.jsxs)(je, {
      children: [
        (0, jsxRuntime.jsx)(H, {
          title: 'Image generation model',
          description: data.length
            ? 'Model used to generate and edit images'
            : 'Connect an image-capable provider to generate and edit images',
        }),
        (0, jsxRuntime.jsx)(ye, {
          className: 'w-44 max-w-none',
          children: (0, jsxRuntime.jsx)(Ge, {
            value: o,
            fallbackValue: l && {provider: l.provider, modelId: l.id},
            modelCatalog: f,
            allowDefaultOption: true,
            defaultOptionLabel: 'Automatic',
            hideFreeAuxProvider: false,
            unavailableValueLabel: o && !m ? `${o.modelId} (unavailable)` : void 0,
            onChange: g,
            children:
              !o && l
                ? (0, jsxRuntime.jsxs)(jt, {
                    children: [
                      (0, jsxRuntime.jsx)(Te, {
                        render: (0, jsxRuntime.jsx)('span', {className: 'inline-flex w-full'}),
                        children: M,
                      }),
                      (0, jsxRuntime.jsx)(Fe, {children: 'Selected automatically'}),
                    ],
                  })
                : M,
          }),
        }),
      ],
    });
  } /** The Aux plan’s models: search and toggle which are offered. */,
  AuxModelPicker = () => {
    const {accountId} = N(),
      s = R(),
      r = V(),
      [n, a] = (0, React.useState)(''),
      [u, o] = (0, React.useState)(''),
      [l, m] = (0, React.useState)([]),
      [f, y] = (0, React.useState)([]),
      g = (0, React.useRef)(accountId),
      M = (0, React.useRef)(false),
      p = (0, React.useRef)(false),
      c = (0, React.useRef)(false),
      x = (0, React.useRef)([]),
      v = (0, React.useRef)(null),
      b = (0, React.useRef)(accountId),
      d = (0, React.useRef)(0),
      w = (0, React.useRef)([]);
    b.current !== accountId &&
      ((b.current = accountId),
      (g.current = accountId),
      (d.current += 1),
      (M.current = false),
      (p.current = false),
      (c.current = false),
      (v.current = null));
    const C = B(s.models.searchAuxModels.queryOptions({accountId, query: u})),
      O = B(s.models.listAuxModelIds.queryOptions({accountId})),
      L = z(s.models.setAuxModelIds.mutationOptions()),
      Q = C.data ?? [],
      X = O.data,
      A = (0, React.useMemo)(() => X ?? [], [X]),
      Z = (0, React.useMemo)(() => new Set(f), [f]),
      q = (0, React.useMemo)(() => {
        if (u || !l.length) return Q;
        const I = new Map(Q.map(P => [P.id, P])),
          S = new Set(l);
        return [...l.flatMap(P => I.get(P) ?? []), ...Q.filter(P => !S.has(P.id))];
      }, [u, Q, l]),
      _ = (0, React.useMemo)(() => De(I => o(I.trim()), 300), []),
      G = I => {
        (a(I), _(I));
      };
    ((0, React.useEffect)(() => {
      ((x.current = A),
        !O.isPending && !p.current && ((p.current = true), m(A)),
        !(M.current && (c.current || v.current)) && (y(A), (w.current = A)));
    }, [accountId, A, O.isPending]),
      (0, React.useEffect)(() => _.cancel, [_]));
    const J = async () => {
        if (c.current) return;
        const I = v.current;
        if (!I) return;
        ((v.current = null), (c.current = true));
        const S = accountId,
          P = d.current,
          j = () => g.current !== S || d.current !== P;
        try {
          const h = await L.mutateAsync({accountId: S, modelIds: I});
          if (j()) return;
          ((x.current = h),
            r.setQueryData(s.models.listAuxModelIds.queryKey({accountId: S}), h),
            v.current || ((w.current = h), y(h)),
            await Promise.all([
              r.invalidateQueries(s.models.listSupported.queryFilter({accountId: S})),
              r.invalidateQueries(s.models.searchAuxModels.queryFilter({accountId: S})),
              r.invalidateQueries(s.models.listSettingsInventory.queryFilter({accountId: S})),
              r.invalidateQueries(s.models.listAvailable.queryFilter({accountId: S})),
              r.invalidateQueries(s.models.listAuxModelIds.queryFilter({accountId: S})),
              r.invalidateQueries(s.settings.getAll.queryFilter({accountId: S})),
            ]));
        } catch (h) {
          if (j()) return;
          (console.error(h),
            K.error('Failed to update Aux models'),
            v.current || ((w.current = x.current), y(x.current)));
        } finally {
          if (j()) return;
          ((c.current = false), v.current && J());
        }
      },
      $ = I => {
        M.current = true;
        const S = w.current.includes(I) ? w.current.filter(P => P !== I) : [...w.current, I];
        S.length && ((w.current = S), y(S), (v.current = S), J());
      },
      ae = C.isPending || O.isPending;
    return (0, jsxRuntime.jsxs)('div', {
      className: 'flex max-h-[min(32rem,var(--available-height))] flex-col',
      onClick: I => I.stopPropagation(),
      onKeyDown: I => I.stopPropagation(),
      children: [
        (0, jsxRuntime.jsx)('div', {
          className: 'p-2 pb-0',
          children: (0, jsxRuntime.jsxs)(ne, {
            children: [
              (0, jsxRuntime.jsx)(se, {
                align: 'inline-start',
                children: (0, jsxRuntime.jsx)(ve, {className: 'size-4'}),
              }),
              (0, jsxRuntime.jsx)(re, {placeholder: 'Search', value: n, onChange: I => G(I.target.value)}),
            ],
          }),
        }),
        (0, jsxRuntime.jsx)(Le, {
          className: 'h-72 min-h-0',
          children: ae
            ? (0, jsxRuntime.jsx)('div', {
                className: 'flex h-72 items-center justify-center',
                children: (0, jsxRuntime.jsx)(Pe, {}),
              })
            : q.length
              ? (0, jsxRuntime.jsx)('div', {
                  className: 'space-y-px p-1',
                  children: q.map(I =>
                    (0, jsxRuntime.jsx)(ModelToggle, {checked: Z.has(I.id), model: I, onToggle: $}, I.id),
                  ),
                })
              : (0, jsxRuntime.jsx)('div', {
                  className: 'text-muted-foreground flex h-72 items-center justify-center text-sm',
                  children: 'No models found',
                }),
        }),
      ],
    });
  },
  ModelToggle = ({checked, model, onToggle}) => {
    const n = () => {
      onToggle(model.id);
    };
    return (0, jsxRuntime.jsxs)(E, {
      variant: 'ghost',
      className: 'flex h-8 w-full justify-between text-left',
      'aria-pressed': checked,
      onClick: n,
      children: [
        (0, jsxRuntime.jsx)('span', {className: 'min-w-0 truncate text-[13px] leading-4.5', children: model.name}),
        (0, jsxRuntime.jsx)(qe, {
          className: he('size-4 shrink-0 opacity-0', checked && 'opacity-100'),
          'data-icon': 'inline-end',
        }),
      ],
    });
  },
  VENDOR_NAMES = {
    'aws-bedrock': 'AWS Bedrock',
    'azure-openai': 'Azure OpenAI',
    'cerebras-ai': 'Cerebras AI',
    deepseek: 'DeepSeek',
    fireworks: 'Fireworks',
    'google-ai-studio': 'Google AI Studio',
    'google-vertex-ai': 'Google Vertex AI',
    huggingface: 'Hugging Face',
    anthropic: 'Anthropic',
    grok: 'Grok',
    groq: 'Groq',
    moonshotai: 'Moonshot AI',
    openai: 'OpenAI',
    openrouter: 'OpenRouter',
    qwen: 'Qwen',
    xai: 'SpaceXAI',
    zai: 'Zai',
    'zai-org': 'Zai',
  },
  OpenRouterModels = () => (0, jsxRuntime.jsx)(GatewayModelPicker, {providerId: 'openrouter'}),
  GatewayModels = ({providerId}) =>
    (0, jsxRuntime.jsx)(GatewayModelPicker, {
      providerId,
    }) /** An OpenRouter or AI Gateway model picker: search, toggle, saved in order. */,
  GatewayModelPicker = ({providerId}) => {
    const {accountId} = N(),
      r = R(),
      n = V(),
      [a, u] = (0, React.useState)(''),
      [o, l] = (0, React.useState)(''),
      [m, f] = (0, React.useState)([]),
      [y, g] = (0, React.useState)([]),
      M = (0, React.useRef)(accountId),
      p = (0, React.useRef)(false),
      c = (0, React.useRef)(false),
      x = (0, React.useRef)(false),
      v = (0, React.useRef)([]),
      b = (0, React.useRef)(null),
      d = (0, React.useRef)(accountId),
      w = (0, React.useRef)(0),
      C = (0, React.useRef)([]);
    d.current !== accountId &&
      ((d.current = accountId),
      (M.current = accountId),
      (w.current += 1),
      (p.current = false),
      (c.current = false),
      (x.current = false),
      (b.current = null));
    const O = B(
        providerId === 'openrouter'
          ? r.models.searchOpenRouterModels.queryOptions({accountId, query: o})
          : r.models.searchAiGatewayModels.queryOptions({accountId, providerId, query: o}),
      ),
      L = B(
        providerId === 'openrouter'
          ? r.models.listOpenRouterModelIds.queryOptions({accountId})
          : r.models.listAiGatewayModelIds.queryOptions({accountId, providerId}),
      ),
      Q = z(r.models.setOpenRouterModelIds.mutationOptions()),
      X = z(r.models.setAiGatewayModelIds.mutationOptions()),
      A = O.data ?? [],
      Z = L.data,
      q = (0, React.useMemo)(() => Z ?? [], [Z]),
      _ = (0, React.useMemo)(() => new Set(y), [y]),
      G = (0, React.useMemo)(() => {
        if (o || !m.length) return A;
        const j = new Map(A.map(k => [k.id, k])),
          h = new Set(m);
        return [...m.flatMap(k => j.get(k) ?? []), ...A.filter(k => !h.has(k.id))];
      }, [o, A, m]),
      J = (0, React.useMemo)(() => groupByVendor(G), [G]),
      $ = (0, React.useMemo)(() => De(j => l(j.trim()), 300), []),
      ae = j => {
        (u(j), $(j));
      };
    ((0, React.useEffect)(() => {
      ((v.current = q),
        !L.isPending && !c.current && ((c.current = true), f(q)),
        !(p.current && (x.current || b.current)) && (g(q), (C.current = q)));
    }, [accountId, q, L.isPending]),
      (0, React.useEffect)(() => $.cancel, [$]));
    const I = async () => {
        if (x.current) return;
        const j = b.current;
        if (!j) return;
        ((b.current = null), (x.current = true));
        const h = accountId,
          k = w.current,
          le = () => M.current !== h || w.current !== k;
        try {
          const D =
            providerId === 'openrouter'
              ? await Q.mutateAsync({accountId: h, modelIds: j})
              : await X.mutateAsync({accountId: h, providerId, modelIds: j});
          if (le()) return;
          ((v.current = D),
            providerId === 'openrouter'
              ? n.setQueryData(r.models.listOpenRouterModelIds.queryKey({accountId: h}), D)
              : n.setQueryData(r.models.listAiGatewayModelIds.queryKey({accountId: h, providerId}), D),
            b.current || ((C.current = D), g(D)),
            await Promise.all([
              n.invalidateQueries(r.models.listSupported.queryFilter({accountId: h})),
              providerId === 'openrouter'
                ? n.invalidateQueries(r.models.searchOpenRouterModels.queryFilter({accountId: h}))
                : n.invalidateQueries(r.models.searchAiGatewayModels.queryFilter({accountId: h, providerId})),
              n.invalidateQueries(r.models.listSettingsInventory.queryFilter({accountId: h})),
              n.invalidateQueries(r.models.listAvailable.queryFilter({accountId: h})),
              providerId === 'openrouter'
                ? n.invalidateQueries(r.models.listOpenRouterModelIds.queryFilter({accountId: h}))
                : n.invalidateQueries(r.models.listAiGatewayModelIds.queryFilter({accountId: h, providerId})),
              n.invalidateQueries(r.settings.getAll.queryFilter({accountId: h})),
            ]));
        } catch (D) {
          if (le()) return;
          (console.error(D),
            K.error(`Failed to update ${providerId === 'openrouter' ? 'OpenRouter' : 'AI Gateway'} models`),
            b.current || ((C.current = v.current), g(v.current)));
        } finally {
          if (le()) return;
          ((x.current = false), b.current && I());
        }
      },
      S = j => {
        p.current = true;
        const h = C.current.includes(j) ? C.current.filter(k => k !== j) : [...C.current, j];
        h.length && ((C.current = h), g(h), (b.current = h), I());
      },
      P = O.isPending || L.isPending;
    return (0, jsxRuntime.jsxs)('div', {
      className: 'flex max-h-[min(32rem,var(--available-height))] flex-col',
      onClick: j => j.stopPropagation(),
      onKeyDown: j => j.stopPropagation(),
      children: [
        (0, jsxRuntime.jsx)('div', {
          className: 'p-2 pb-0',
          children: (0, jsxRuntime.jsxs)(ne, {
            children: [
              (0, jsxRuntime.jsx)(se, {
                align: 'inline-start',
                children: (0, jsxRuntime.jsx)(ve, {className: 'size-4'}),
              }),
              (0, jsxRuntime.jsx)(re, {placeholder: 'Search', value: a, onChange: j => ae(j.target.value)}),
            ],
          }),
        }),
        (0, jsxRuntime.jsx)(Le, {
          className: 'h-72 min-h-0',
          children: P
            ? (0, jsxRuntime.jsx)('div', {
                className: 'flex h-72 items-center justify-center',
                children: (0, jsxRuntime.jsx)(Pe, {}),
              })
            : G.length
              ? (0, jsxRuntime.jsx)('div', {
                  className: 'space-y-px p-1',
                  children: J.map(j =>
                    (0, jsxRuntime.jsxs)(
                      'div',
                      {
                        className: 'space-y-px',
                        children: [
                          (0, jsxRuntime.jsx)('div', {
                            className: 'text-muted-foreground px-2 pt-2 pb-1 text-[11px] font-medium',
                            children: j.label,
                          }),
                          j.models.map(h =>
                            (0, jsxRuntime.jsx)(
                              GatewayModelToggle,
                              {checked: _.has(h.id), model: h, onToggle: S},
                              h.id,
                            ),
                          ),
                        ],
                      },
                      j.key,
                    ),
                  ),
                })
              : (0, jsxRuntime.jsx)('div', {
                  className: 'text-muted-foreground flex h-72 items-center justify-center text-sm',
                  children: 'No models found',
                }),
        }),
      ],
    });
  }; /** Models grouped by vendor, in first-seen order. */
function groupByVendor(t) {
  const s = new Map();
  for (const r of t) {
    const n = vendorOf(r.id),
      a = s.get(n.key);
    if (a) {
      a.models.push(r);
      continue;
    }
    s.set(n.key, {...n, models: [r]});
  }
  return [...s.values()];
} /** A model id’s vendor, with Workers AI, Groq and Fireworks grouped one level deeper. */
function vendorOf(t) {
  const [s, r] = t.split('/');
  if (!s) return {key: t, label: 'Other'};
  if (s === 'workers-ai' && r === '@cf') {
    const n = t.split('/')[2];
    return {key: n ? `${s}/${r}/${n}` : s, label: n ? `Workers AI / ${vendorName(n)}` : 'Workers AI'};
  }
  return (s === 'groq' || s === 'fireworks') && r
    ? {key: `${s}/${r}`, label: `${vendorName(s)} / ${vendorName(r)}`}
    : {key: s, label: vendorName(s)};
} /** A vendor’s display name. */
function vendorName(t) {
  const s = VENDOR_NAMES[t];
  return (
    s ||
    t
      .replace(/ai-studio$/i, 'ai studio')
      .replace(/[-_]/g, ' ')
      .split(' ')
      .filter(Boolean)
      .map(r => (/^(ai|aws|cf|gpt|ibm|mcp|xai)$/i.test(r) ? r.toUpperCase() : r.charAt(0).toUpperCase() + r.slice(1)))
      .join(' ')
  );
}
var GatewayModelToggle = ({checked, model, onToggle}) => {
    const n = () => {
      onToggle(model.id);
    };
    return (0, jsxRuntime.jsxs)(E, {
      variant: 'ghost',
      className: 'flex h-11 w-full justify-between text-left',
      'aria-pressed': checked,
      onClick: n,
      children: [
        (0, jsxRuntime.jsxs)('div', {
          className: 'min-w-0 grow truncate',
          children: [
            (0, jsxRuntime.jsx)('p', {className: 'truncate text-[13px] leading-4.5', children: model.name}),
            (0, jsxRuntime.jsx)('p', {className: 'text-muted-foreground truncate text-xs', children: model.id}),
          ],
        }),
        (0, jsxRuntime.jsx)(qe, {
          className: he('size-4 shrink-0 opacity-0', checked && 'opacity-100'),
          'data-icon': 'inline-end',
        }),
      ],
    });
  },
  USAGE_WINDOWS = {
    five_hour: '5 hours',
    monthly: 'Monthly',
    weekly: 'Weekly',
  } /** Subscription usage: what is left in each window. */,
  SubscriptionUsage = ({providerId}) => {
    const {subscriptionProviderId, usageQuery} = St(providerId),
      n = bt(usageQuery.data?.usage),
      a = n.find(u => u.kind === 'weekly') ?? n[0] ?? null;
    return !subscriptionProviderId || (!a && !usageQuery.isFetching)
      ? null
      : (0, jsxRuntime.jsxs)(pt, {
          children: [
            (0, jsxRuntime.jsx)(Te, {
              render: (0, jsxRuntime.jsx)('span', {
                className:
                  'text-muted-foreground hover:text-foreground flex size-7 shrink-0 items-center justify-center transition-colors',
                'aria-label': 'Subscription usage',
              }),
              children: (0, jsxRuntime.jsx)(yt, {
                percent: a ? percentLeft(a) : 0,
                className: a ? void 0 : 'opacity-30',
              }),
            }),
            (0, jsxRuntime.jsx)(Fe, {
              className: 'min-w-36 flex-col items-stretch gap-1 px-3 py-2 tabular-nums',
              children: ['five_hour', 'weekly', 'monthly'].flatMap(u => {
                const o = n.find(l => l.kind === u);
                return o ? [(0, jsxRuntime.jsx)(UsageWindow, {label: USAGE_WINDOWS[u], window: o}, u)] : [];
              }),
            }),
          ],
        });
  },
  UsageWindow = ({label, window}) =>
    (0, jsxRuntime.jsxs)('div', {
      className: 'flex min-w-36 items-center justify-between gap-4',
      children: [
        (0, jsxRuntime.jsx)('span', {className: 'text-muted-foreground', children: label}),
        (0, jsxRuntime.jsx)('span', {children: window ? leftLabel(window) : 'Not available'}),
      ],
    });
function leftLabel(t) {
  return `${percentLeft(t)}% left`;
} /** What is left of a usage window, 0–100. */
function percentLeft(t) {
  return Math.min(100, Math.max(0, Math.round(100 - t.usedPercent)));
}
var PLAN_NAMES = {free: 'Free', max: 'Max', pro: 'Pro'},
  BUILT_IN = new Set(Je),
  Providers = () =>
    (0, jsxRuntime.jsxs)(jsxRuntime.Fragment, {
      children: [
        (0, jsxRuntime.jsx)(ConnectedProviders, {}),
        (0, jsxRuntime.jsx)(ConnectProviders, {}),
      ],
    }) /** Connected providers with their plan or method, usage and actions. */,
  ConnectedProviders = () => {
    const {accountId, subscriptionPlan, connected} = N();
    return (0, jsxRuntime.jsx)(jsxRuntime.Fragment, {
      children: [...connected.values()]
        .filter(n => AUX_LAUNCH_POLICY.hostedAiEnabled || n.id !== 'aux')
        .map(n => {
          const a = n.method === 'api_key' || te(n.id),
            u = usesModelsJson(n),
            o = n.method === 'oauth' && n.id !== 'aux',
            l = canReauthenticate(n),
            m =
              n.id !== 'aux' && (n.id === 'openai-codex' || (n.method !== 'models_json' && !n.hasModelsJsonAuth && !l)),
            f = isGateway(n.id) || n.id === 'aux',
            y = f || a || u || o || l || m,
            g = Ct(n.id) != null;
          return (0, jsxRuntime.jsxs)(
            je,
            {
              className: 'gap-1',
              children: [
                (0, jsxRuntime.jsx)(W, {provider: n.id, className: 'text-foreground mx-0.5 size-5 opacity-55'}),
                (0, jsxRuntime.jsx)(H, {title: n.name, description: providerDescription(n, subscriptionPlan)}),
                (g || y) &&
                  (0, jsxRuntime.jsxs)(ye, {
                    className: 'max-w-none shrink-0 items-center gap-1',
                    children: [
                      (0, jsxRuntime.jsx)(SubscriptionUsage, {providerId: n.id}),
                      y &&
                        (0, jsxRuntime.jsxs)(ge, {
                          children: [
                            (0, jsxRuntime.jsx)(fe, {
                              render: M => {
                                const {className, ...c} = M;
                                return (0, jsxRuntime.jsx)(E, {size: 'icon', variant: 'ghost', ...c});
                              },
                              children: (0, jsxRuntime.jsx)(Oe, {}),
                            }),
                            (0, jsxRuntime.jsxs)(xe, {
                              children: [
                                f &&
                                  (0, jsxRuntime.jsxs)(Xe, {
                                    children: [
                                      (0, jsxRuntime.jsxs)(Ke, {
                                        children: [
                                          (0, jsxRuntime.jsx)(mt, {}),
                                          (0, jsxRuntime.jsx)('span', {children: 'Set models'}),
                                        ],
                                      }),
                                      (0, jsxRuntime.jsx)(et, {
                                        className: 'w-64 p-0',
                                        children: (0, jsxRuntime.jsx)(ProviderModels, {providerId: n.id}),
                                      }),
                                    ],
                                  }),
                                o &&
                                  (0, jsxRuntime.jsx)(EditProvider, {
                                    provider: n.id,
                                    icon: (0, jsxRuntime.jsx)(Ne, {}),
                                    label: 'Reauthenticate',
                                  }),
                                (a || u) && (0, jsxRuntime.jsx)(EditProvider, {provider: n.id}),
                                l && (0, jsxRuntime.jsx)(DeleteProvider, {provider: n.id}),
                                m && (0, jsxRuntime.jsx)(DisconnectProvider, {provider: n.id}),
                              ],
                            }),
                          ],
                        }),
                    ],
                  }),
              ],
            },
            n.id,
          );
        }),
    });
  };
function isGateway(t) {
  return t === 'openrouter' || t === 'vercel-ai-gateway' || t === 'cloudflare-ai-gateway';
}
function ProviderModels({providerId}) {
  switch (providerId) {
    case 'openrouter':
      return (0, jsxRuntime.jsx)(OpenRouterModels, {});
    case 'aux':
      return (0, jsxRuntime.jsx)(AuxModelPicker, {});
    case 'vercel-ai-gateway':
    case 'cloudflare-ai-gateway':
      return (0, jsxRuntime.jsx)(GatewayModels, {providerId});
    default:
      return null;
  }
}
function usesModelsJson(t) {
  return t.method === 'models_json' && !t.oauthOnly && !ke(t.id) && !te(t.id) && !isGateway(t.id);
}
function canReauthenticate(t) {
  return t.oauthOnly || ke(t.id) || isGateway(t.id) ? false : t.method === 'models_json' ? true : !BUILT_IN.has(t.id);
}
var /** A provider’s line: reauthentication, the Aux plan, subscription or API. */
  providerDescription = (t, s) =>
    t.state === 'auth-expired'
      ? 'Reauthentication required'
      : t.id === 'aux'
        ? `${PLAN_NAMES[s]}`
        : t.type === 'subscription'
          ? 'Local agent'
          : 'API key',
  EditProvider = ({provider, icon, label = 'Edit'}) => {
    const {setCurrentProvider} = N(),
      a = () => {
        setCurrentProvider(provider);
      };
    return (0, jsxRuntime.jsxs)(T, {
      onClick: a,
      children: [icon ?? (0, jsxRuntime.jsx)(nt, {}), (0, jsxRuntime.jsx)('span', {children: label})],
    });
  } /** Disconnecting a provider (agents using it switch to another). */,
  DisconnectProvider = ({provider}) => {
    const {confirm} = Re(),
      {connected, refetch} = N(),
      {broadcastModelInventoryChanged} = Ae(),
      {accountId} = F(),
      o = R(),
      l = V(),
      m = z(o.models.removeCredential.mutationOptions()),
      f = o.models.listCredentials.queryOptions({accountId}),
      y = M => {
        l.setQueryData(f.queryKey, (p = []) => p.filter(c => c.providerId !== M));
      },
      g = () => {
        const M = connected.get(provider);
        confirm(
          {
            title: `Are you sure you want to disconnect ${M.name}?`,
            description: 'If an agent is using this provider, it will be changed to other providers.',
            ui: {action: 'Disconnect', variant: 'destructive'},
          },
          async () => {
            try {
              (await m.mutateAsync({providerId: provider, accountId}),
                y(provider),
                broadcastModelInventoryChanged(accountId),
                await refetch(),
                await l.invalidateQueries(o.settings.getAll.queryFilter({accountId})));
            } catch (p) {
              (console.error(p), K.error('Failed to disconnect provider'));
            }
          },
        );
      };
    return (0, jsxRuntime.jsxs)(T, {
      variant: 'destructive',
      onClick: g,
      children: [(0, jsxRuntime.jsx)(dt, {}), (0, jsxRuntime.jsx)('span', {children: 'Disconnect'})],
    });
  } /** Deleting a custom provider. */,
  DeleteProvider = ({provider}) => {
    const {confirm} = Re(),
      {connected, refetch} = N(),
      {broadcastModelInventoryChanged} = Ae(),
      {accountId} = F(),
      o = R(),
      l = V(),
      m = z(o.models.removeCustomProviderConfig.mutationOptions()),
      f = () => {
        const y = connected.get(provider);
        confirm(
          {
            title: `Delete ${y.name}?`,
            description: 'If an agent is using this provider, it will be changed to other providers.',
            ui: {action: 'Delete', variant: 'destructive'},
          },
          async () => {
            try {
              (await m.mutateAsync({providerId: provider, accountId}),
                broadcastModelInventoryChanged(accountId),
                await refetch(),
                await l.invalidateQueries(o.settings.getAll.queryFilter({accountId})));
            } catch (g) {
              (console.error(g), K.error('Failed to delete provider'));
            }
          },
        );
      };
    return (0, jsxRuntime.jsxs)(T, {
      variant: 'destructive',
      onClick: f,
      children: [(0, jsxRuntime.jsx)(rt, {}), (0, jsxRuntime.jsx)('span', {children: 'Delete'})],
    });
  } /** Connecting more providers: subscriptions, APIs and local models, with search. */,
  ConnectProviders = () => {
    const {disconnected, setCurrentProvider} = N(),
      [r, n] = (0, React.useState)(false),
      [a, u] = (0, React.useState)(''),
      [o, l] = (0, React.useState)(null),
      m = (0, React.useRef)(null),
      f = (0, React.useRef)(null),
      y = [...disconnected.values()]
        .filter(d => AUX_LAUNCH_POLICY.hostedAiEnabled || d.id !== 'aux')
        .sort((d, w) => d.name.localeCompare(w.name)),
      g = disconnected.get('custom-json'),
      M = Ze(y.filter(d => d.id !== 'custom-json')),
      p = [
        {type: 'local', label: 'Local agents', providers: M.filter(d => d.type === 'subscription' || te(d.id))},
        {type: 'manual', label: 'API keys', providers: M.filter(d => d.type === 'manual' && !te(d.id))},
      ].filter(d => d.providers.length),
      c = a.trim().toLowerCase(),
      x = p
        .map(d => ({
          ...d,
          providers: d.providers.filter(w => !c || w.name.toLowerCase().includes(c) || w.id.toLowerCase().includes(c)),
        }))
        .filter(d => d.providers.length),
      v = g && (!c || g.name.toLowerCase().includes(c) || g.id.toLowerCase().includes(c)),
      b = d => {
        (setCurrentProvider(d), n(false));
      };
    return (
      (0, React.useEffect)(() => {
        if (!r) {
          l(null);
          return;
        }
        const d = requestAnimationFrame(() => {
          m.current?.focus({preventScroll: true});
          const w = f.current?.parentElement?.getAttribute('data-side');
          (w === 'top' || w === 'bottom') && l(w);
        });
        return () => cancelAnimationFrame(d);
      }, [r]),
      disconnected.size
        ? (0, jsxRuntime.jsx)('div', {
            children: (0, jsxRuntime.jsxs)(ge, {
              open: r,
              onOpenChange: d => {
                (n(d), d && u(''));
              },
              children: [
                (0, jsxRuntime.jsxs)(fe, {
                  render: (0, jsxRuntime.jsx)(Qe, {variant: 'action', className: 'aria-expanded:mb-0'}),
                  children: [
                    (0, jsxRuntime.jsx)(me, {className: 'mx-0.5 size-4'}),
                    (0, jsxRuntime.jsx)(H, {title: 'Connect'}),
                  ],
                }),
                (0, jsxRuntime.jsxs)(xe, {
                  ref: f,
                  align: 'start',
                  side: o ?? 'bottom',
                  positionerProps: o
                    ? {collisionAvoidance: {side: 'shift', align: 'shift', fallbackAxisSide: 'none'}}
                    : void 0,
                  className: 'w-72',
                  children: [
                    (0, jsxRuntime.jsxs)(ne, {
                      className: 'mb-1 border-0! bg-transparent! shadow-none ring-0!',
                      children: [
                        (0, jsxRuntime.jsx)(se, {
                          align: 'inline-start',
                          children: (0, jsxRuntime.jsx)(ve, {className: 'size-4'}),
                        }),
                        (0, jsxRuntime.jsx)(re, {
                          ref: m,
                          value: a,
                          placeholder: 'Search providers',
                          onChange: d => u(d.target.value),
                          onKeyDown: d => {
                            if (d.key !== 'ArrowDown' && d.key !== 'ArrowUp') {
                              d.stopPropagation();
                              return;
                            }
                            (d.preventDefault(), d.stopPropagation());
                            const w = [
                              ...(d.currentTarget.closest('[role=menu]')?.querySelectorAll('[role^=menuitem]') ?? []),
                            ];
                            (d.key === 'ArrowDown' ? w[0] : w.at(-1))?.focus();
                          },
                        }),
                      ],
                    }),
                    (0, jsxRuntime.jsxs)('div', {
                      className: '-mx-1.5 max-h-64 overflow-x-hidden overflow-y-auto px-1.5',
                      children: [
                        !x.length &&
                          !v &&
                          (0, jsxRuntime.jsx)('p', {
                            className: 'text-muted-foreground px-2.5 py-2 text-sm',
                            children: 'No matching providers',
                          }),
                        x.map((d, w) =>
                          (0, jsxRuntime.jsxs)(
                            React.Fragment,
                            {
                              children: [
                                w > 0 && (0, jsxRuntime.jsx)(de, {}),
                                (0, jsxRuntime.jsxs)(ue, {
                                  children: [
                                    (0, jsxRuntime.jsx)(tt, {children: d.label}),
                                    d.providers.map(C =>
                                      (0, jsxRuntime.jsxs)(
                                        T,
                                        {
                                          onClick: () => b(C.id),
                                          children: [
                                            (0, jsxRuntime.jsx)(W, {
                                              className: 'text-muted-foreground',
                                              provider: C.id,
                                            }),
                                            (0, jsxRuntime.jsx)('span', {
                                              className: 'min-w-0 truncate',
                                              children: C.name,
                                            }),
                                          ],
                                        },
                                        C.id,
                                      ),
                                    ),
                                  ],
                                }),
                              ],
                            },
                            d.type,
                          ),
                        ),
                      ],
                    }),
                    v &&
                      (0, jsxRuntime.jsxs)(jsxRuntime.Fragment, {
                        children: [
                          (x.length > 0 || c) && (0, jsxRuntime.jsx)(de, {}),
                          (0, jsxRuntime.jsxs)(T, {
                            onClick: () => b(g.id),
                            children: [
                              (0, jsxRuntime.jsx)(me, {className: 'text-muted-foreground'}),
                              (0, jsxRuntime.jsx)('span', {className: 'min-w-0 truncate', children: g.name}),
                            ],
                          }),
                        ],
                      }),
                  ],
                }),
              ],
            }),
          })
        : null
    );
  }; /** The Models page. */
function Ws() {
  const {accountId} = F(),
    {capture} = He(),
    r = R(),
    {data} = B(r.settings.getAll.queryOptions({accountId}, {select: u => u.experimental.compactionLimits})),
    a = (u, o) => {
      o || capture('settings.ai.add-provider', {value: u});
    };
  return (0, jsxRuntime.jsxs)(jsxRuntime.Fragment, {
    children: [
      (0, jsxRuntime.jsx)(Pt, {segments: ['Settings', 'Models']}),
      (0, jsxRuntime.jsx)(vt, {children: (0, jsxRuntime.jsx)('h1', {children: 'Models'})}),
      (0, jsxRuntime.jsx)(React.Suspense, {
        fallback: (0, jsxRuntime.jsx)(gt, {}),
        children: (0, jsxRuntime.jsxs)(At, {
          accountId,
          onConnected: a,
          children: [
            (0, jsxRuntime.jsxs)('div', {
              className: 'space-y-8',
              children: [
                (0, jsxRuntime.jsx)(ce, {
                  title: 'Providers',
                  children: (0, jsxRuntime.jsx)(ee, {children: (0, jsxRuntime.jsx)(Providers, {})}),
                }),
                (0, jsxRuntime.jsxs)(ce, {
                  title: 'Task models',
                  children: [
                    (0, jsxRuntime.jsx)(ee, {children: (0, jsxRuntime.jsx)(Nt, {})}),
                    (0, jsxRuntime.jsx)(Rt, {}),
                    (0, jsxRuntime.jsx)(ee, {children: (0, jsxRuntime.jsx)(ImageModelRow, {})}),
                  ],
                }),
                data &&
                  (0, jsxRuntime.jsx)(ce, {
                    title: 'Advanced',
                    searchable: false,
                    children: (0, jsxRuntime.jsx)(CompactionLimitMenu, {}),
                  }),
              ],
            }),
            (0, jsxRuntime.jsx)(kt, {}),
          ],
        }),
      }),
    ],
  });
}
