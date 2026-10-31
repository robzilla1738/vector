/* Aux-owned source: onboarding › Connect a model (assets/ai-CzEX5E7S.js, the module body):
 * the provider list and its keyboard submit, More options and the API key dialog, setting the default
 * model. Aux has no plans, credits or checkout, so none of the supplied plan paths are here.
 * Names the rest of the chunk uses keep their chunk names: qs the page (exported).
 * Chunk names used: re JSX runtime, ee/se React, v cn, te useNavigate, ne Link, ae Spinner,
 * oe/St/me model selection helpers, F Badge, le provider filter, ce useAnalytics, de arrow, ue/pe/fe/xe/ye
 * Field parts, he useMutation, j Skeleton, B useQueryClient, M useSuspenseQuery,
 * N useTRPC, je the tRPC client, O/be/ve agent model settings, Ce/we/Pe/Ne/ke form kit,
 * k provider icon, Le plus, Ee close, f Button, b toast, Me/Oe the schema, K the route,
 * De/_e/Ie/Ae/Te/Ve the onboarding layout, Fe radio item, L/C/H/U/Z/Be/Ke
 * dialog parts, z/Qe provider context, Je connect
 * dialog, Ye/q the field groups. */
var jsxRuntime = re(),
  /** The API key mark. */
  KeyIcon = ({size = 24, ariaHidden = true, ...t}) =>
    (0, jsxRuntime.jsx)('svg', {
      viewBox: '0 0 24 24',
      fill: 'none',
      xmlns: 'http://www.w3.org/2000/svg',
      width: size,
      height: size,
      'aria-hidden': ariaHidden,
      focusable: 'false',
      ...t,
      children: (0, jsxRuntime.jsx)('path', {
        d: 'M18 14.5L17.5528 15.3944C17.6916 15.4639 17.8448 15.5 18 15.5V14.5ZM16 13.5L16.4472 12.6056C16.1657 12.4648 15.8343 12.4648 15.5528 12.6056L16 13.5ZM14 14.5V15.5C14.1552 15.5 14.3084 15.4639 14.4472 15.3944L14 14.5ZM6.5 12C6.5 11.7239 6.72386 11.5 7 11.5V13.5C7.82843 13.5 8.5 12.8284 8.5 12H6.5ZM7 11.5C7.27614 11.5 7.5 11.7239 7.5 12H5.5C5.5 12.8284 6.17157 13.5 7 13.5V11.5ZM7.5 12C7.5 12.2761 7.27614 12.5 7 12.5V10.5C6.17157 10.5 5.5 11.1716 5.5 12H7.5ZM7 12.5C6.72386 12.5 6.5 12.2761 6.5 12H8.5C8.5 11.1716 7.82843 10.5 7 10.5V12.5ZM6.5 13H7.5V11H6.5V13ZM7 16C4.79086 16 3 14.2091 3 12H1C1 15.3137 3.68629 18 7 18V16ZM3 12C3 9.79086 4.79086 8 7 8V6C3.68629 6 1 8.68629 1 12H3ZM20.0194 10.5L21.2194 12L22.7811 10.7506L21.5811 9.25061L20.0194 10.5ZM21.2194 12L20.0194 13.5L21.5811 14.7494L22.7811 13.2494L21.2194 12ZM20.0194 13.5H18V15.5H20.0194V13.5ZM18.4472 13.6056L16.4472 12.6056L15.5528 14.3944L17.5528 15.3944L18.4472 13.6056ZM15.5528 12.6056L13.5528 13.6056L14.4472 15.3944L16.4472 14.3944L15.5528 12.6056ZM11.9079 10.5H20.0194V8.5H11.9079V10.5ZM7 8C8.31459 8 9.48107 8.63311 10.2118 9.61533L11.8165 8.42152C10.7246 6.9539 8.97356 6 7 6V8ZM14 13.5H11.9079V15.5H14V13.5ZM10.2118 14.3847C9.48107 15.3669 8.31459 16 7 16V18C8.97356 18 10.7246 17.0461 11.8165 15.5785L10.2118 14.3847ZM11.9079 13.5C11.1751 13.5 10.5749 13.8967 10.2118 14.3847L11.8165 15.5785C11.8445 15.5408 11.8734 15.5183 11.8929 15.5074C11.9106 15.4976 11.9148 15.5 11.9079 15.5V13.5ZM20.0194 13.5V15.5C20.6269 15.5 21.2016 15.2238 21.5811 14.7494L20.0194 13.5ZM11.9079 8.5C11.9148 8.5 11.9106 8.50239 11.8929 8.49258C11.8734 8.48172 11.8445 8.45923 11.8165 8.42152L10.2118 9.61533C10.5749 10.1033 11.1751 10.5 11.9079 10.5V8.5ZM21.2194 12L22.7811 13.2494C23.3655 12.519 23.3655 11.481 22.7811 10.7506L21.2194 12ZM21.5811 9.25061C21.2016 8.77618 20.6269 8.5 20.0194 8.5V10.5L21.5811 9.25061Z',
        fill: 'currentColor',
      }),
    }),
  React = ee(se()),
  /** Makes the provider's best model the default. */
  setDefaultModel = async ({accountId, providerId, queryClient, trpc}) => {
    const inventory = await queryClient.fetchQuery(trpc.models.listSettingsInventory.queryOptions({accountId})),
      selection = me(inventory),
      modelId = oe(selection, providerId, void 0),
      model = selection.modelsByProvider[providerId]?.find(candidate => candidate.id === modelId);
    if (!model) return;
    const defaultModel = {
        provider: model.provider,
        modelId: model.id,
        thinkingLevel: ve(model.availableThinkingLevels),
        fastMode: false,
      },
      result = await je.settings.set.mutate({accountId, key: 'defaultModel', value: defaultModel});
    for (const warning of result.warnings) b.warning(warning);
    (be(accountId, defaultModel.provider, defaultModel.modelId, defaultModel.thinkingLevel, defaultModel.fastMode),
      queryClient.setQueryData(trpc.settings.getAll.queryKey({accountId}), settings =>
        settings ? {...settings, defaultModel} : void 0,
      ));
  };
/** The page. */
function qs() {
  const {accountId} = K.useLoaderData(),
    navigate = te(),
    queryClient = B(),
    trpc = N(),
    {track} = ce(),
    form = Pe({resolver: we(providerFormSchema), defaultValues: {provider: 'aux'}}),
    handleConnected = async provider => {
      track('onboarding.ai.set-provider', {
        value: provider,
        type: ['aux', 'openai-codex', 'claude-code', 'github-copilot'].includes(provider) ? 'subscription' : 'manual',
      });
      try {
        await setDefaultModel({accountId, providerId: provider, queryClient, trpc});
      } catch (error) {
        (console.error(error), b.error('Failed to set the default model for this provider.'));
      }
      return navigate({to: '/onboarding/done', replace: true});
    };
  return (0, jsxRuntime.jsxs)(ke, {
    ...form,
    children: [
      (0, jsxRuntime.jsxs)(_e, {
        className: 'pb-0',
        children: [
          (0, jsxRuntime.jsx)(Ae, {children: 'Connect a model'}),
          (0, jsxRuntime.jsx)(De, {children: 'Use an agent CLI already signed in on this Mac, or your own API key.'}),
        ],
      }),
      (0, jsxRuntime.jsx)(Te, {
        children: (0, jsxRuntime.jsx)('div', {
          className: 'w-105',
          children: (0, jsxRuntime.jsx)(React.Suspense, {
            fallback: (0, jsxRuntime.jsx)(ProviderListFallback, {}),
            children: (0, jsxRuntime.jsxs)(Qe, {
              accountId,
              onConnected: handleConnected,
              children: [(0, jsxRuntime.jsx)(ProviderPicker, {accountId}), (0, jsxRuntime.jsx)(Je, {})],
            }),
          }),
        }),
      }),
      (0, jsxRuntime.jsxs)(Ie, {
        children: [
          (0, jsxRuntime.jsxs)(f, {
            variant: 'secondary',
            size: 'lg',
            nativeButton: false,
            render: (0, jsxRuntime.jsx)(ne, {to: '/onboarding/make-it-yours', replace: true}),
            children: [
              (0, jsxRuntime.jsx)(de, {'data-icon': 'inline-start'}),
              (0, jsxRuntime.jsx)('span', {children: 'Back'}),
            ],
          }),
          (0, jsxRuntime.jsxs)('div', {
            className: 'flex gap-2',
            children: [
              (0, jsxRuntime.jsx)(f, {
                variant: 'secondary',
                size: 'lg',
                nativeButton: false,
                render: (0, jsxRuntime.jsx)(ne, {to: '/onboarding/done', replace: true}),
                children: 'Skip',
              }),
              (0, jsxRuntime.jsx)(Ve, {type: 'submit', form: 'provider-form', children: 'Connect'}),
            ],
          }),
        ],
      }),
    ],
  });
}
var /** The provider list while it loads. */
  ProviderListFallback = () =>
    (0, jsxRuntime.jsx)('div', {
      className: 'w-full space-y-px overflow-hidden rounded-xl',
      children: Array.from({length: 3}).map((item, index) =>
        (0, jsxRuntime.jsx)(j, {className: 'h-16 w-full rounded-none'}, index),
      ),
    }),
  /** Listed first, in this order. */
  FEATURED_PROVIDERS = ['openai-codex', 'claude-code'],
  BYOK_PROVIDER = {
    id: 'byok',
    name: 'Use your own API key',
    description: 'API keys from Google, OpenRouter, Vercel, and more',
    type: 'manual',
    oauthOnly: false,
    state: 'active',
  },
  providerFormSchema = Oe({
    provider: 'byok',
  }),
  /** The provider list and its dialogs. */
  ProviderPicker = ({accountId}) => {
    const [dialog, setDialog] = (0, React.useState)(null),
      form = Ne(),
      {modelCatalog, connected, setCurrentProvider, completeConnection} = z(),
      selected = form.watch('provider'),
      subscriptions = le(
        modelCatalog.providerOptions.filter(option => option.type === 'subscription' && option.id !== 'aux'),
      ),
      byId = new Map(subscriptions.map(id => [id.id, id])),
      featured = FEATURED_PROVIDERS.flatMap(id => {
        const found = byId.get(id);
        return found ? [found] : [];
      }),
      otherProviders = subscriptions.filter(option => !FEATURED_PROVIDERS.includes(option.id)),
      submit = async ({provider}) => {
        if (provider === 'byok') {
          setDialog(provider);
          return;
        }
        if (connected.has(provider)) {
          await completeConnection(provider);
          return;
        }
        setCurrentProvider(provider);
      },
      selectProvider = provider => {
        form.setValue('provider', provider, {shouldDirty: true});
      },
      submitOnEnter = event => {
        event.key !== 'Enter' ||
          event.defaultPrevented ||
          event.repeat ||
          event.nativeEvent.isComposing ||
          event.metaKey ||
          event.ctrlKey ||
          event.altKey ||
          event.shiftKey ||
          (event.preventDefault(), event.stopPropagation(), form.handleSubmit(submit)());
      };
    return (
      (0, jsxRuntime.jsxs)(jsxRuntime.Fragment, {
        children: [
          (0, jsxRuntime.jsxs)('form', {
            id: 'provider-form',
            className: 'w-full',
            onSubmit: form.handleSubmit(submit),
            children: [
              (0, jsxRuntime.jsxs)(Ye, {
                className: 'w-full',
                name: 'provider',
                value: selected,
                onKeyDownCapture: submitOnEnter,
                onValueChange: selectProvider,
                children: [
                  (0, jsxRuntime.jsx)(ProviderRow, {
                    provider: BYOK_PROVIDER,
                  }),
                  featured.map(option => (0, jsxRuntime.jsx)(ProviderRow, {provider: option}, option.id)),
                ],
              }),
              (0, jsxRuntime.jsx)('div', {
                className: 'pt-3 text-center',
                children: (0, jsxRuntime.jsx)(f, {
                  variant: 'ghost',
                  size: 'sm',
                  className: 'text-brand-content! click-depth-effect-slightly text-sm font-medium',
                  onClick: () => setDialog('more'),
                  children: 'Show more options',
                }),
              }),
            ],
          }),
          (0, jsxRuntime.jsx)(MoreOptionsDialog, {
            open: dialog === 'more',
            providers: otherProviders,
            onOpenChange: open => !open && setDialog(null),
            onSelect: provider => {
              (setDialog(null), submit({provider}));
            },
          }),
          (0, jsxRuntime.jsx)(ApiKeyDialog, {open: dialog === 'byok', onOpenChange: open => !open && setDialog(null)}),
        ],
      })
    );
  },
  /** More subscriptions, and the API key option. */
  MoreOptionsDialog = ({open, providers, onOpenChange, onSelect}) =>
    (0, jsxRuntime.jsx)(L, {
      open,
      onOpenChange,
      children: (0, jsxRuntime.jsxs)(C, {
        className: 'max-w-md!',
        children: [
          (0, jsxRuntime.jsxs)(H, {
            children: [
              (0, jsxRuntime.jsx)(U, {children: 'More options'}),
              (0, jsxRuntime.jsx)(Z, {children: 'Use another local agent or your own API key.'}),
            ],
          }),
          (0, jsxRuntime.jsxs)(q, {
            className: '-mx-2 -mb-1 max-h-80 overflow-auto rounded-xl',
            children: [
              providers.map(provider =>
                (0, jsxRuntime.jsxs)(
                  f,
                  {
                    variant: 'secondary',
                    size: 'lg',
                    className:
                      'bg-surface-primary hover:bg-muted flex h-10 w-full justify-start rounded-none border-none px-3',
                    onClick: () => onSelect(provider.id),
                    children: [
                      (0, jsxRuntime.jsx)(k, {className: 'text-muted-foreground size-5', provider: provider.id}),
                      (0, jsxRuntime.jsx)('span', {children: provider.name}),
                    ],
                  },
                  provider.id,
                ),
              ),
              (0, jsxRuntime.jsxs)(f, {
                variant: 'secondary',
                size: 'lg',
                className:
                  'bg-surface-primary hover:bg-muted flex h-10 w-full justify-start rounded-none border-none px-3',
                onClick: () => onSelect(BYOK_PROVIDER.id),
                children: [
                  (0, jsxRuntime.jsx)(KeyIcon, {className: 'text-muted-foreground size-5'}),
                  (0, jsxRuntime.jsx)('span', {children: BYOK_PROVIDER.name}),
                ],
              }),
            ],
          }),
          (0, jsxRuntime.jsx)(Be, {
            children: (0, jsxRuntime.jsx)(f, {
              variant: 'secondary',
              onClick: () => onOpenChange(false),
              children: 'Cancel',
            }),
          }),
        ],
      }),
    }),
  /** The API providers. */
  ApiKeyDialog = ({open, onOpenChange}) => {
    const {modelCatalog, setCurrentProvider} = z(),
      providers = modelCatalog.providerOptions
        .filter(option => option.type === 'manual' && option.id !== 'custom-json')
        .sort((first, second) => Number(O(first.id)) - Number(O(second.id))),
      chooseProvider = id => () => {
        (onOpenChange(false), setCurrentProvider(id));
      };
    return (0, jsxRuntime.jsx)(L, {
      open,
      onOpenChange,
      children: (0, jsxRuntime.jsxs)(C, {
        children: [
          (0, jsxRuntime.jsxs)(H, {
            children: [
              (0, jsxRuntime.jsx)(U, {children: 'Use your own API key'}),
              (0, jsxRuntime.jsx)(Z, {children: 'Choose an API provider to connect.'}),
            ],
          }),
          (0, jsxRuntime.jsx)(q, {
            className: '-mx-2 -mb-1 max-h-80 overflow-auto rounded-xl',
            children: providers.map(provider =>
              (0, jsxRuntime.jsxs)(
                f,
                {
                  variant: 'secondary',
                  size: 'lg',
                  className:
                    'bg-surface-primary hover:bg-muted flex h-10 w-full justify-start rounded-none border-none px-3',
                  onClick: chooseProvider(provider.id),
                  children: [
                    (0, jsxRuntime.jsx)(k, {className: 'text-muted-foreground size-5', provider: provider.id}),
                    (0, jsxRuntime.jsx)('span', {children: provider.name}),
                  ],
                },
                provider.id,
              ),
            ),
          }),
        ],
      }),
    });
  },
  /** A row in the provider list. */
  ProviderRow = ({provider, icon}) =>
    (0, jsxRuntime.jsx)(ue, {
      htmlFor: provider.id,
      className: 'bg-surface-primary! rounded-none! border-none!',
      children: (0, jsxRuntime.jsxs)(pe, {
        className: 'relative h-13 py-0!',
        children: [
          (0, jsxRuntime.jsxs)(fe, {
            className: 'flex-row items-center gap-2.5',
            children: [
              (0, jsxRuntime.jsx)('div', {
                className: 'text-muted-foreground flex size-7 shrink-0 items-center justify-center',
                children: icon ?? (0, jsxRuntime.jsx)(k, {className: 'size-full', provider: provider.id}),
              }),
              (0, jsxRuntime.jsxs)('div', {
                className: 'grow pr-4',
                children: [
                  (0, jsxRuntime.jsxs)(ye, {
                    className: 'font-display text-primary gap-1 font-medium',
                    children: [
                      provider.name,
                      provider.id === 'aux' &&
                        (0, jsxRuntime.jsx)(F, {
                          className: 'text-brand-content! bg-brand/10 dark:bg-brand/10 h-4 px-1.5 text-xs',
                          children: 'Recommended',
                        }),
                    ],
                  }),
                  (0, jsxRuntime.jsx)(xe, {className: 'text-xs font-medium', children: provider.description}),
                ],
              }),
            ],
          }),
          (0, jsxRuntime.jsx)(Fe, {
            className: 'absolute top-1/2 right-3 w-auto! -translate-y-1/2',
            value: provider.id,
            id: provider.id,
          }),
        ],
      }),
    });
