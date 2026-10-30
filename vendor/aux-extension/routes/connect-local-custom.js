/* Aux-owned source, connect provider dialog pass 2 (assets/connect-dialog-CacgpFap.js, after the
 * supplied reserved provider IDs to the local server hook): custom providers as pi-compatible JSON
 * (schemas, the editor with Tab indenting, editing a saved one), and the Ollama and LM Studio
 * dialogs (base URL, API key, detecting and picking models).
 * Names the rest of the chunk uses keep their chunk names: dn Ollama, un LM Studio, mn custom JSON,
 * hn the saved custom providers.
 * Chunk names used: d React, e JSX runtime, b the provider list context, W/z/De/st/ot tRPC, mutation,
 * query hooks and client, S toast, Ve the reserved IDs, the schema builders, and the first pass's
 * dialog parts. */
ProviderIdSchema = j()
    .min(1)
    .refine(t => !Ve.has(t), {
      message: 'Provider is not editable as a custom provider.',
    }) /** A literal value: commands (!) and environment references ($NAME) belong in models.json itself. */,
  LiteralValueSchema = j()
    .min(1)
    .refine(t => !t.trimStart().startsWith('!'), {
      message: 'Command values are only supported in the models.json file.',
    })
    .refine(t => !hasEnvReference(t), {message: 'Environment values are only supported in the models.json file.'}),
  ApiSchema = Ie(kt),
  ModelSchema = R({
    id: j().min(1),
    name: j().min(1).optional(),
    api: ApiSchema.optional(),
    baseUrl: ge().optional(),
    reasoning: Ue().optional(),
    thinkingLevelMap: te(j(), j().nullable()).optional(),
    input: xe(Ie(['text', 'image'])).optional(),
    cost: R({
      input: oe().optional(),
      output: oe().optional(),
      cacheRead: oe().optional(),
      cacheWrite: oe().optional(),
      tiers: xe(bt).optional(),
    }).optional(),
    contextWindow: oe().int().positive().optional(),
    maxTokens: oe().int().positive().optional(),
    headers: te(j(), LiteralValueSchema).optional(),
    compat: te(j(), je()).optional(),
  }).catchall(je()),
  ProviderSchema = R({
    name: j().min(1).optional(),
    baseUrl: ge().optional(),
    apiKey: LiteralValueSchema.optional(),
    api: ApiSchema.optional(),
    headers: te(j(), LiteralValueSchema).optional(),
    compat: te(j(), je()).optional(),
    authHeader: Ue().optional(),
    models: xe(ModelSchema).min(1),
    modelOverrides: te(j(), ModelSchema.omit({id: true, api: true, baseUrl: true})).optional(),
  })
    .catchall(je())
    .superRefine((t, n) => {
      (!t.api &&
        !t.models.every(s => s.api) &&
        n.addIssue({
          code: 'custom',
          message: 'Provider api is required unless every model defines api.',
          path: ['api'],
        }),
        !t.baseUrl &&
          !t.models.every(s => s.baseUrl) &&
          n.addIssue({
            code: 'custom',
            message: 'Provider baseUrl is required unless every model defines baseUrl.',
            path: ['baseUrl'],
          }));
    }),
  ProvidersJsonSchema = R({
    providers: te(ProviderIdSchema, ProviderSchema).refine(t => Object.keys(t).length > 0, {
      message: 'At least one provider is required.',
    }),
  }),
  LocalServerSchema = R({
    baseUrl: ge(),
    apiKey: j().trim().optional(),
    modelIds: xe(j().min(1)).min(1, 'Select at least one model.'),
  }),
  JsonFormSchema = R({
    json: j().superRefine((t, n) => {
      try {
        ProvidersJsonSchema.parse(JSON.parse(t));
      } catch (s) {
        n.addIssue({code: 'custom', message: s instanceof Error ? s.message : 'Invalid provider JSON.'});
      }
    }),
  }),
  EXAMPLE_JSON = JSON.stringify(
    {
      providers: {
        'my-provider': {
          name: 'My Provider',
          api: 'openai-completions',
          baseUrl: 'https://example.com/v1',
          apiKey: 'example-api-key',
          authHeader: true,
          models: [
            {
              id: 'my-model',
              name: 'My Model',
              reasoning: false,
              contextWindow: 128e3,
              maxTokens: 16384,
              input: ['text'],
            },
          ],
        },
      },
    },
    null,
    2,
  ),
  INDENT = '  ',
  dn = () => (0, e.jsx)(LocalServerDialog, {preset: 'ollama'}),
  un = () => (0, e.jsx)(LocalServerDialog, {preset: 'lm-studio'}),
  mn = () => (0, e.jsx)(JsonProviderDialog, {provider: 'custom-json', defaultJson: EXAMPLE_JSON}),
  hn = () => {
    const {connected} = b(),
      n = [...connected.values()].filter(s => s.method === 'models_json' && isUserProvider(s.id));
    return (0, e.jsx)(e.Fragment, {children: n.map(s => (0, e.jsx)(SavedProviderDialog, {provider: s.id}, s.id))});
  },
  SavedProviderDialog = ({provider}) => {
    const {currentProvider} = b();
    return currentProvider !== provider ? null : (0, e.jsx)(SavedProviderEditor, {provider});
  },
  SavedProviderEditor = ({provider}) => {
    const {accountId} = b(),
      s = W(),
      {data} = De(s.models.getCustomProviderConfig.queryOptions({accountId, providerId: provider})),
      r = data.providerConfig ?? {
        name: provider,
        api: 'openai-completions',
        baseUrl: 'https://example.com/v1',
        apiKey: 'example-api-key',
        authHeader: true,
        models: [{id: 'my-model', name: 'My Model', reasoning: false, input: ['text']}],
      };
    return (0, e.jsx)(JsonProviderDialog, {
      provider,
      defaultJson: JSON.stringify({providers: {[provider]: r}}, null, 2),
      mode: 'update',
    });
  };
function isBuiltInCustom(t) {
  return t === 'ollama' || t === 'lm-studio' || t === 'openrouter';
}
function isUserProvider(t) {
  return !isBuiltInCustom(t) && !Ve.has(t);
}
var JsonProviderDialog = ({provider, defaultJson, mode = 'create'}) => {
  const {accountId, completeConnection} = b(),
    a = W(),
    l = z(a.models.setCustomProvidersConfig.mutationOptions()),
    i = z(a.models.removeCustomProviderConfig.mutationOptions()),
    u = async h => {
      const c = ProvidersJsonSchema.parse(JSON.parse(h.json)),
        x = Object.keys(c.providers)[0];
      if (x)
        try {
          (await l.mutateAsync({accountId, ...c}),
            provider !== 'custom-json' &&
              !(provider in c.providers) &&
              (await i.mutateAsync({accountId, providerId: provider})),
            await completeConnection(x));
        } catch (p) {
          (console.error(p), S.error('Failed to save provider JSON'));
        }
    };
  return (0, e.jsxs)(P, {
    provider,
    contentClassName: 'sm:max-w-2xl',
    children: [
      (0, e.jsx)(I, {
        mode,
        children: (0, e.jsxs)(A, {
          children: [
            'Paste a pi-compatible provider config. See the',
            ' ',
            (0, e.jsx)(v, {to: 'https://pi.dev/docs/latest/models', children: 'Pi models guide'}),
            '.',
          ],
        }),
      }),
      (0, e.jsx)(
        T,
        {
          schema: JsonFormSchema,
          defaultValues: {json: defaultJson},
          onSubmit: u,
          children: (0, e.jsx)(M, {
            name: 'json',
            children: ({register, invalid}) =>
              (0, e.jsxs)(e.Fragment, {
                children: [
                  (0, e.jsxs)(C, {
                    htmlFor: register.name,
                    children: [
                      (0, e.jsx)('span', {children: 'Provider JSON'}),
                      (0, e.jsx)('span', {
                        'aria-hidden': true,
                        className: '-ml-1.5 text-xs leading-none text-destructive',
                        children: '*',
                      }),
                    ],
                  }),
                  (0, e.jsx)(ft, {
                    ...register,
                    'aria-invalid': invalid,
                    'aria-required': true,
                    className: 'max-h-96 min-h-72 resize-y font-mono text-xs',
                    onKeyDown: indentWithTab,
                    spellCheck: false,
                  }),
                ],
              }),
          }),
        },
        defaultJson,
      ),
      (0, e.jsxs)(w, {
        children: [
          (0, e.jsx)(_, {}),
          (0, e.jsxs)(U, {
            disabled: l.isPending || i.isPending,
            children: [(l.isPending || i.isPending) && (0, e.jsx)(D, {}), (0, e.jsx)('span', {children: 'Save'})],
          }),
        ],
      }),
    ],
  });
}; /** Tab and Shift-Tab indent and outdent the selected lines by two spaces. */
function indentWithTab(t) {
  if (t.key !== 'Tab') return;
  t.preventDefault();
  const n = t.currentTarget,
    {selectionStart, selectionEnd, value} = n;
  if (selectionStart === selectionEnd && !t.shiftKey) {
    (n.setRangeText(INDENT, selectionStart, selectionEnd, 'end'),
      n.dispatchEvent(new InputEvent('input', {bubbles: true, data: INDENT, inputType: 'insertText'})));
    return;
  }
  const a =
      value.lastIndexOf(
        `
`,
        selectionStart - 1,
      ) + 1,
    l = value.indexOf(
      `
`,
      selectionEnd,
    ),
    i = l === -1 ? value.length : l,
    u = value.slice(a, i).split(`
`);
  let h = 0,
    c = 0;
  const x = u.map((p, f) => {
    if (!t.shiftKey) return ((c += 2), `${INDENT}${p}`);
    const k = p.startsWith(INDENT) ? 2 : p.startsWith('	') ? 1 : 0;
    return (f === 0 && (h = Math.min(k, selectionStart - a)), (c -= k), p.slice(k));
  });
  (n.setRangeText(
    x.join(`
`),
    a,
    i,
    'preserve',
  ),
    (n.selectionStart = t.shiftKey ? Math.max(a, selectionStart - h) : selectionStart + 2),
    (n.selectionEnd = Math.max(n.selectionStart, selectionEnd + c)),
    n.dispatchEvent(new InputEvent('input', {bubbles: true, inputType: 'insertText'})));
} /** Whether text references an environment value ($NAME or ${NAME}; $$ and $! escape). */
function hasEnvReference(t) {
  for (let n = 0; n < t.length;) {
    const s = t[n],
      o = t[n + 1];
    if (s !== '$') {
      n += 1;
      continue;
    }
    if (o === '$' || o === '!') {
      n += 2;
      continue;
    }
    if (o === '{' || /^[A-Za-z_]/.test(o ?? '')) return true;
    n += 1;
  }
  return false;
}
var /** Ollama or LM Studio: the saved server when editing it, otherwise a new one. */
  LocalServerDialog = ({preset}) => {
    const n = fe[preset],
      {connected, currentProvider} = b(),
      r = connected.has(n.providerId) ? 'update' : 'create';
    return r === 'update' && currentProvider === n.providerId
      ? (0, e.jsx)(SavedLocalServer, {preset, mode: r})
      : (0, e.jsx)(LocalServerForm, {
          preset,
          mode: r,
          defaultValues: {baseUrl: n.baseUrl, apiKey: '', modelIds: []},
          defaultModels: [],
        });
  },
  SavedLocalServer = ({preset, mode}) => {
    const s = fe[preset],
      {accountId} = b(),
      r = W(),
      {data: a} = De(r.models.getCustomProviderConfig.queryOptions({accountId, providerId: s.providerId})),
      l = a.providerConfig,
      i = l?.baseUrl ?? s.baseUrl,
      {data} = st({
        ...r.models.discoverCustomProviderModels.queryOptions({accountId, preset, baseUrl: i}),
        enabled: preset === 'ollama',
        retry: false,
      }),
      {availableModels, selectedModelIds} = (0, d.useMemo)(() => {
        const x = new Map(data?.models.map(f => [f.id, f])),
          p =
            l?.models.flatMap(f => {
              const k = ModelSchema.safeParse(f);
              if (!k.success) return [];
              const {id, name, reasoning, thinkingLevelMap, input, contextWindow, maxTokens} = k.data,
                N = {id, name: name ?? id, reasoning, thinkingLevelMap, input, contextWindow, maxTokens},
                Y = x.get(id);
              return preset === 'ollama' && data && !Y ? [] : [{...N, ...Y, name: N.name}];
            }) ?? [];
        return {
          availableModels: data ? [...new Map([...data.models, ...p].map(f => [f.id, f])).values()] : p,
          selectedModelIds: p.map(f => f.id),
        };
      }, [data, preset, l?.models]);
    return (0, e.jsx)(LocalServerForm, {
      preset,
      mode,
      defaultModels: availableModels,
      defaultValues: {baseUrl: i, apiKey: '', modelIds: selectedModelIds},
    });
  },
  LocalServerForm = ({preset, mode, defaultValues, defaultModels}) => {
    const r = fe[preset],
      [a, l] = (0, d.useState)(),
      i = a ?? defaultModels,
      u = useLocalServerSave(preset, i),
      h = c => {
        l(x => [...new Map([...(x ?? defaultModels), ...c].map(p => [p.id, p])).values()]);
      };
    return (0, e.jsxs)(P, {
      provider: r.providerId,
      children: [
        (0, e.jsx)(I, {
          mode,
          children: (0, e.jsxs)(A, {children: ['Connect to your local ', r.providerName, ' server.']}),
        }),
        (0, e.jsxs)(T, {
          schema: LocalServerSchema,
          defaultValues,
          onSubmit: u.handleSubmit,
          children: [
            (0, e.jsx)(M, {
              name: 'baseUrl',
              children: ({register, invalid}) =>
                (0, e.jsxs)(e.Fragment, {
                  children: [
                    (0, e.jsxs)(C, {
                      htmlFor: register.name,
                      children: [
                        (0, e.jsx)('span', {children: 'Base URL'}),
                        (0, e.jsx)('span', {
                          'aria-hidden': true,
                          className: '-ml-1.5 text-xs leading-none text-destructive',
                          children: '*',
                        }),
                      ],
                    }),
                    (0, e.jsx)(pe, {...register, 'aria-invalid': invalid, 'aria-required': true}),
                  ],
                }),
            }),
            (0, e.jsx)(M, {
              name: 'apiKey',
              children: ({register, invalid}) =>
                (0, e.jsxs)(e.Fragment, {
                  children: [
                    (0, e.jsx)(C, {htmlFor: register.name, children: 'API Key'}),
                    (0, e.jsx)(pe, {...register, 'aria-invalid': invalid}),
                  ],
                }),
            }),
            (0, e.jsx)(Oe, {
              children: (0, e.jsxs)(Me, {
                children: [
                  (0, e.jsxs)(C, {
                    children: [
                      (0, e.jsx)('span', {children: 'Models'}),
                      (0, e.jsx)('span', {
                        'aria-hidden': true,
                        className: '-ml-1.5 text-xs leading-none text-destructive',
                        children: '*',
                      }),
                    ],
                  }),
                  (0, e.jsx)(ModelPicker, {
                    preset,
                    models: i,
                    defaultModelIds: defaultValues.modelIds,
                    onModelsDetected: h,
                  }),
                ],
              }),
            }),
          ],
        }),
        (0, e.jsxs)(w, {
          children: [
            (0, e.jsx)(_, {}),
            (0, e.jsxs)(U, {
              disabled: u.isPending,
              children: [
                u.isPending && (0, e.jsx)(D, {}),
                (0, e.jsx)('span', {children: mode === 'create' ? 'Connect' : 'Update'}),
              ],
            }),
          ],
        }),
      ],
    });
  } /** Picking models, detected from the server when the picker opens. */,
  ModelPicker = ({preset, models, defaultModelIds, onModelsDetected}) => {
    const {accountId} = b(),
      a = W(),
      l = ot(),
      i = Pe(),
      [u, h] = (0, d.useState)(false),
      [c, x] = (0, d.useState)(false),
      [p, f] = (0, d.useState)(''),
      k = i.watch('modelIds'),
      L = p.trim().toLowerCase(),
      H = L ? models.filter(m => m.name.toLowerCase().includes(L)) : models,
      q = new Map(models.map(m => [m.id, m])),
      $ = k.map(m => q.get(m)?.name ?? m).join(', ');
    (0, d.useEffect)(() => {
      const m = i.getValues('modelIds'),
        O = m.length !== defaultModelIds.length || m.some((B, ve) => B !== defaultModelIds[ve]);
      !i.getFieldState('modelIds').isDirty && O && i.setValue('modelIds', defaultModelIds, {shouldValidate: true});
    }, [defaultModelIds, i]);
    const Q = async () => {
        const m = i.getValues('baseUrl');
        if (!ge().safeParse(m).success) {
          i.setError('baseUrl', {message: 'Enter a valid base URL.'});
          return;
        }
        x(true);
        try {
          const O = await l.fetchQuery({
            ...a.models.discoverCustomProviderModels.queryOptions({accountId, preset, baseUrl: m}),
            retry: false,
          });
          (onModelsDetected(O.models),
            i.getValues('modelIds').length ||
              i.setValue(
                'modelIds',
                O.models.map(B => B.id),
                {shouldDirty: true, shouldValidate: true},
              ));
        } catch (O) {
          (console.error(O), S.error('Failed to detect models'));
        } finally {
          x(false);
        }
      },
      ne = m => () => {
        const O = k.includes(m) ? k.filter(B => B !== m) : [...k, m];
        O.length && i.setValue('modelIds', O, {shouldDirty: true, shouldValidate: true});
      },
      se = m => {
        (h(m), m ? Q() : f(''));
      },
      N = m => {
        f(m.target.value);
      },
      Y = m => {
        m.key === 'Enter' && !m.nativeEvent.isComposing && m.preventDefault();
      };
    return (0, e.jsxs)(nt, {
      open: u,
      onOpenChange: se,
      children: [
        (0, e.jsxs)(Ye, {
          render: (0, e.jsx)(re, {type: 'button', variant: 'outline', className: 'w-full justify-between'}),
          children: [
            (0, e.jsx)('span', {
              className: be('truncate text-left', !$ && 'text-muted-foreground'),
              children: $ || 'Select models',
            }),
            (0, e.jsx)(pt, {'data-icon': 'inline-end', className: 'text-muted-foreground shrink-0'}),
          ],
        }),
        (0, e.jsxs)(it, {
          align: 'start',
          className: 'w-80 p-0',
          children: [
            (0, e.jsx)('div', {
              className: 'p-2 pb-0',
              children: (0, e.jsxs)(tt, {
                children: [
                  (0, e.jsx)(Qe, {align: 'inline-start', children: (0, e.jsx)(xt, {className: 'size-4'})}),
                  (0, e.jsx)(rt, {autoFocus: true, placeholder: 'Search models', value: p, onChange: N, onKeyDown: Y}),
                ],
              }),
            }),
            (0, e.jsx)(gt, {
              className: 'h-64 min-h-0',
              children: c
                ? (0, e.jsx)('div', {className: 'flex h-64 items-center justify-center', children: (0, e.jsx)(D, {})})
                : H.length
                  ? (0, e.jsx)('div', {
                      className: 'flex flex-col gap-px p-1',
                      children: H.map(m => {
                        const O = k.includes(m.id);
                        return (0, e.jsxs)(
                          re,
                          {
                            type: 'button',
                            variant: 'ghost',
                            className: 'w-full justify-between',
                            'aria-pressed': O,
                            onClick: ne(m.id),
                            children: [
                              (0, e.jsx)('span', {className: 'truncate', children: m.name}),
                              (0, e.jsx)(Fe, {
                                'data-icon': 'inline-end',
                                className: be('shrink-0 opacity-0', O && 'opacity-100'),
                              }),
                            ],
                          },
                          m.id,
                        );
                      }),
                    })
                  : (0, e.jsx)('div', {
                      className: 'text-muted-foreground flex h-64 items-center justify-center text-sm',
                      children: 'No models found',
                    }),
            }),
          ],
        }),
      ],
    });
  } /** Saves a local server as an OpenAI-compatible provider with the picked models. */,
  useLocalServerSave = (t, n) => {
    const s = fe[t],
      {accountId, completeConnection} = b(),
      a = W(),
      l = z(a.models.setCustomProvidersConfig.mutationOptions());
    return {
      handleSubmit: async u => {
        const h = new Map(n.map(c => [c.id, c]));
        try {
          (await l.mutateAsync({
            accountId,
            providers: {
              [s.providerId]: {
                name: s.providerName,
                api: 'openai-completions',
                baseUrl: u.baseUrl,
                ...(u.apiKey?.trim() ? {apiKey: u.apiKey.trim()} : {}),
                authHeader: false,
                models: u.modelIds.map(c => h.get(c) ?? {id: c, name: c}),
              },
            },
          }),
            await completeConnection(s.providerId),
            S.success(
              (0, e.jsxs)('span', {
                className: 'inline-flex items-center gap-1',
                children: [
                  (0, e.jsx)(Fe, {className: 'size-3.5'}),
                  (0, e.jsxs)('span', {children: [s.providerName, ' connected']}),
                ],
              }),
            ));
        } catch (c) {
          (console.error(c), S.error(`Failed to connect ${s.providerName}`));
        }
      },
      isPending: l.isPending,
    };
  }
