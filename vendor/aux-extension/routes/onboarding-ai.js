/* Aux-owned source: onboarding › Choose your AI subscription (assets/ai-CzEX5E7S.js, the module body):
 * the provider list and its keyboard submit, More options and the API key dialog, setting the default
 * model, and the hosted plan paths (plans, checkout in a frame or embedded, waiting for billing), which
 * stay behind AUX_LAUNCH_POLICY (added above the chunk's imports by vendor/provided).
 * Names the rest of the chunk uses keep their chunk names: qs the page (exported).
 * Chunk names used: re JSX runtime, ee/se React, v cn, te useNavigate, ne Link, ae Spinner, ie useBilling,
 * oe/St/me model selection helpers, F Badge, le provider filter, ce useAnalytics, de arrow, ue/pe/fe/xe/ye
 * Field parts, he useMutation, j Skeleton, ge refreshes hosted credits, B useQueryClient, M useSuspenseQuery,
 * S the app origin, N useTRPC, je the tRPC client, O/be/ve agent model settings, Ce/we/Pe/Ne/ke/Se form kit and
 * the Aux mark, k provider icon, Le plus, Ee close, f Button, b toast, Me/Oe the schema, K the route,
 * Re route context, R plans query, De/_e/Ie/Ae/Te/Ve the onboarding layout, Fe radio item, L/C/H/U/Z/Be/Ke
 * dialog parts, D external link, Ze/He/Ue/ze/qe/Ge pricing helpers, z/Qe provider context, Je connect
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
  },
  /** The plans. */
  OnboardingPricingTable = ({isActionPending, onPlanSelect, plans}) => {
    const visiblePlans = qe(plans).filter(isOnboardingPlan),
      selectPlan = plan => {
        onPlanSelect({lookupKey: plan.prices.monthly.lookupKey ?? null, period: 'monthly', plan: plan.id});
      };
    return (0, jsxRuntime.jsxs)('section', {
      'data-slot': 'onboarding-pricing-table',
      className: 'flex w-full flex-col overflow-hidden',
      children: [
        (0, jsxRuntime.jsxs)('header', {
          className: 'flex flex-col items-center gap-1 px-6 py-5 text-center',
          children: [
            (0, jsxRuntime.jsx)('h2', {className: 'font-display text-2xl font-medium', children: 'Start with Aux'}),
            (0, jsxRuntime.jsx)('p', {
              className: 'text-muted-foreground text-sm',
              children: 'Start free. Upgrade when you need more credits, deep research, or unlimited routines.',
            }),
          ],
        }),
        (0, jsxRuntime.jsx)('div', {
          className: 'grid grid-cols-1 gap-4 px-8 pt-2 pb-5 sm:grid-cols-2',
          children: visiblePlans.map(plan =>
            (0, jsxRuntime.jsx)(PlanCard, {disabled: isActionPending, plan, onPlanSelect: selectPlan}, plan.id),
          ),
        }),
        (0, jsxRuntime.jsxs)('p', {
          className: 'text-muted-foreground/80 px-8 pb-4 text-center text-xs',
          children: [
            'You are agreeing to our',
            ' ',
            (0, jsxRuntime.jsx)(D, {
              className: 'underline',
              to: 'https://app.getaux.co/policy/terms',
              children: 'Terms of Service',
            }),
            ' ',
            'and',
            ' ',
            (0, jsxRuntime.jsx)(D, {
              className: 'underline',
              to: 'https://app.getaux.co/policy/privacy',
              children: 'Privacy Policy',
            }),
            '.',
          ],
        }),
      ],
    });
  },
  /** One plan. */
  PlanCard = ({disabled, onPlanSelect, plan}) => {
    const price = plan.prices.monthly,
      isFree = plan.id === 'free',
      note = isFree ? Ge : null;
    return (0, jsxRuntime.jsxs)('section', {
      className: v(
        'flex h-88 flex-col overflow-hidden rounded-xl px-4 pt-4 pb-2',
        isFree ? 'border-secondary border' : 'bg-muted',
      ),
      children: [
        (0, jsxRuntime.jsxs)('h3', {
          className: 'text-muted-foreground font-display min-h-16 pr-8 text-sm font-medium',
          children: [
            (0, jsxRuntime.jsx)('span', {className: 'text-primary mr-1.5', children: plan.name.replace('Aux ', '')}),
            He[plan.id],
          ],
        }),
        (0, jsxRuntime.jsx)(PlanPrice, {className: 'mb-5', plan: plan.id, price}),
        (0, jsxRuntime.jsx)('ul', {
          className: 'flex flex-col gap-2',
          children: plan.features.map((feature, index) =>
            (0, jsxRuntime.jsx)(PlanFeature, {feature}, `${plan.id}-${index}`),
          ),
        }),
        (0, jsxRuntime.jsxs)('div', {
          className: 'mt-auto space-y-2',
          children: [
            (0, jsxRuntime.jsx)(f, {
              className: 'h-10 w-full',
              disabled: disabled || (!isFree && !price.lookupKey),
              size: 'lg',
              shape: 'pill',
              variant: isFree ? 'secondary' : 'default',
              onClick: choosePlan(onPlanSelect, plan),
              children: ze(plan.id),
            }),
            note &&
              (0, jsxRuntime.jsx)('p', {
                className: 'text-muted-foreground text-2xs text-center font-medium',
                children: note,
              }),
          ],
        }),
      ],
    });
  },
  /** A plan's price. */
  PlanPrice = ({className, plan, price}) =>
    (0, jsxRuntime.jsxs)('div', {
      className: v('flex items-end gap-1', className),
      children: [
        (0, jsxRuntime.jsx)('span', {
          className: 'text-primary font-display text-4xl leading-none font-medium',
          children: price.amount,
        }),
        (0, jsxRuntime.jsx)('span', {
          className: 'text-muted-foreground pb-0.5 text-xs leading-4 font-medium',
          children: Ze(plan, price),
        }),
      ],
    }),
  /** A plan's feature line. */
  PlanFeature = ({feature}) => {
    const Icon = feature.icon === 'plus' ? Le : Ce,
      [text, detail] = Ue(feature.text);
    return (0, jsxRuntime.jsxs)('li', {
      className: 'flex min-w-0 items-center gap-2',
      children: [
        (0, jsxRuntime.jsx)(Icon, {className: 'text-muted-foreground/60 size-4 shrink-0'}),
        (0, jsxRuntime.jsxs)('span', {
          className: v(
            'min-w-0 text-sm leading-5 font-medium',
            feature.muted ? 'text-muted-foreground' : 'text-primary',
          ),
          children: [
            text,
            detail && (0, jsxRuntime.jsxs)('span', {className: 'text-muted-foreground', children: [' ', detail]}),
          ],
        }),
        feature.badge &&
          (0, jsxRuntime.jsx)(F, {variant: 'secondary', className: 'text-2xs h-5 px-1.5', children: feature.badge}),
      ],
    });
  },
  /** The click handler for a plan. */
  choosePlan = (onPlanSelect, plan) => () => {
    onPlanSelect(plan);
  };
/** Onboarding offers Free and Pro. */
function isOnboardingPlan(plan) {
  return plan.id === 'free' || plan.id === 'pro';
}
var /** The plans while they load. */
  PricingSkeleton = () =>
    (0, jsxRuntime.jsxs)('div', {
      className: 'flex w-full flex-col overflow-hidden',
      children: [
        (0, jsxRuntime.jsxs)('div', {
          className: 'flex flex-col items-center gap-2 px-6 py-5',
          children: [(0, jsxRuntime.jsx)(j, {className: 'h-7 w-40'}), (0, jsxRuntime.jsx)(j, {className: 'h-4 w-64'})],
        }),
        (0, jsxRuntime.jsxs)('div', {
          className: 'grid grid-cols-1 gap-4 px-8 pt-2 pb-5 sm:grid-cols-2',
          children: [
            (0, jsxRuntime.jsx)(j, {className: 'h-56 w-full rounded-xl'}),
            (0, jsxRuntime.jsx)(j, {className: 'h-56 w-full rounded-xl'}),
          ],
        }),
      ],
    });
/** The page. */
function qs() {
  const {accountId} = K.useLoaderData(),
    {broadcastBillingChanged} = ie(),
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
        (provider === 'aux' &&
          (await queryClient.fetchQuery(
            trpc.billing.getSubscription.queryOptions({accountId, fresh: true}, {staleTime: 0}),
          ),
          broadcastBillingChanged(accountId),
          await ge(accountId)),
          await setDefaultModel({accountId, providerId: provider, queryClient, trpc}));
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
          (0, jsxRuntime.jsx)(Ae, {children: 'Choose your AI subscription'}),
          (0, jsxRuntime.jsx)(De, {children: 'Connect a subscription you already have, or use your own API key.'}),
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
            render: (0, jsxRuntime.jsx)(ne, {to: '/onboarding/import-password', replace: true}),
            children: [
              (0, jsxRuntime.jsx)(de, {'data-icon': 'inline-start'}),
              (0, jsxRuntime.jsx)('span', {children: 'Back'}),
            ],
          }),
          (0, jsxRuntime.jsx)(Ve, {type: 'submit', form: 'provider-form', children: 'Connect'}),
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
  AUX_PROVIDER = {
    id: 'aux',
    name: 'Aux',
    description: 'Use Claude and GPT frontier models together',
    type: 'subscription',
    oauthOnly: false,
    state: 'active',
  },
  BYOK_PROVIDER = {
    id: 'byok',
    name: 'Use your own API key',
    description: 'API keys from Google, OpenRouter, Vercel, and more',
    type: 'manual',
    oauthOnly: false,
    state: 'active',
  },
  providerFormSchema = Oe({
    provider: AUX_LAUNCH_POLICY.hostedAiEnabled ? Me() : 'byok',
  }),
  /** The provider list and its dialogs. */
  ProviderPicker = ({accountId}) => {
    const {checkout} = K.useSearch(),
      queryClient = B(),
      trpc = N(),
      [dialog, setDialog] = (0, React.useState)(null),
      checkoutHandled = (0, React.useRef)(false),
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
        if (!AUX_LAUNCH_POLICY.hostedAiEnabled && provider === 'aux') {
          b.error('Connect your own provider in Settings > Models.');
          return;
        }
        if (provider === 'aux' || provider === 'byok') {
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
      },
      connectAux = async () => {
        await completeConnection('aux');
      },
      finishCheckout = (0, React.useCallback)(async () => {
        if (!(await waitForPaidPlan({accountId, queryClient, trpc}))) {
          b.error('Checkout is complete, but billing is still syncing. Please try Connect again in a moment.');
          return;
        }
        await completeConnection('aux');
      }, [accountId, completeConnection, queryClient, trpc]);
    return (
      (0, React.useEffect)(() => {
        !AUX_LAUNCH_POLICY.paymentsEnabled ||
          checkout !== 'success' ||
          checkoutHandled.current ||
          ((checkoutHandled.current = true), finishCheckout());
      }, [checkout, finishCheckout]),
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
                    provider: AUX_LAUNCH_POLICY.hostedAiEnabled ? AUX_PROVIDER : BYOK_PROVIDER,
                    icon: AUX_LAUNCH_POLICY.hostedAiEnabled
                      ? (0, jsxRuntime.jsx)(Se, {className: 'size-full scale-90'})
                      : void 0,
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
          (0, jsxRuntime.jsx)(L, {
            open: dialog === 'aux',
            onOpenChange: open => !open && setDialog(null),
            children:
              dialog === 'aux' &&
              (0, jsxRuntime.jsx)(React.Suspense, {
                fallback: (0, jsxRuntime.jsx)(C, {
                  className: 'gap-0 overflow-hidden p-0 sm:max-w-2xl',
                  children: (0, jsxRuntime.jsx)(PricingSkeleton, {}),
                }),
                children: (0, jsxRuntime.jsx)(PlansDialog, {
                  accountId,
                  onCheckoutComplete: finishCheckout,
                  onConnectAux: connectAux,
                }),
              }),
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
  /** The plans, then checkout. */
  PlansDialog = ({accountId, onCheckoutComplete, onConnectAux}) => {
    const trpc = N(),
      createCheckout = he(trpc.billing.createCheckout.mutationOptions()),
      [checkout, setCheckout] = (0, React.useState)(null),
      [isCompleting, setIsCompleting] = (0, React.useState)(false),
      {data: plans} = M({queryKey: R.queryKey, queryFn: R, staleTime: 3e5}),
      {data: subscription} = M(trpc.billing.getSubscription.queryOptions({accountId, fresh: true}, {staleTime: 0})),
      selectPlan = async choice => {
        if (choice.plan === 'free') {
          await onConnectAux();
          return;
        }
        if (hasPaidPlan(subscription.subscription)) {
          await onConnectAux();
          return;
        }
        if (!choice.lookupKey) {
          b.error('This plan is not available yet.');
          return;
        }
        try {
          const session = await createCheckout.mutateAsync({
            accountId,
            lookupKey: choice.lookupKey,
            returnUrl: await checkoutReturnUrl(accountId),
          });
          setCheckout(session);
        } catch (error) {
          (console.error(error), b.error('Could not open checkout. Please try again.'));
        }
      },
      complete = async () => {
        setIsCompleting(true);
        try {
          await onCheckoutComplete();
        } finally {
          setIsCompleting(false);
        }
      };
    return (0, jsxRuntime.jsxs)(C, {
      showCloseButton: !checkout,
      className: v(
        checkout
          ? 'h-[calc(100vh-3rem)] max-h-[calc(100vh-3rem)] w-[calc(100vw-3rem)] max-w-[calc(100vw-3rem)] gap-0 overflow-hidden overscroll-none p-0 sm:max-w-[calc(100vw-3rem)]'
          : 'gap-0 overflow-hidden p-0 sm:max-w-2xl',
      ),
      children: [
        checkout &&
          (0, jsxRuntime.jsx)(Ke, {
            render: (0, jsxRuntime.jsx)(f, {
              'aria-label': 'Close checkout',
              className: 'bg-background/20! text-background! fixed top-4 right-4 z-100',
              shape: 'pill',
              size: 'icon',
              variant: 'ghost',
            }),
            children: (0, jsxRuntime.jsx)(Ee, {className: 'size-4'}),
          }),
        checkout
          ? window.location.protocol === 'chrome-extension:'
            ? (0, jsxRuntime.jsx)(HostedCheckout, {
                clientSecret: checkout.clientSecret,
                isCompleting,
                publishableKey: checkout.publishableKey,
                onComplete: complete,
              })
            : (0, jsxRuntime.jsx)(EmbeddedCheckout, {
                clientSecret: checkout.clientSecret,
                isCompleting,
                publishableKey: checkout.publishableKey,
                onComplete: complete,
              })
          : (0, jsxRuntime.jsx)(OnboardingPricingTable, {
              isActionPending: createCheckout.isPending,
              plans: plans.plans,
              onPlanSelect: selectPlan,
            }),
      ],
    });
  },
  STRIPE_SCRIPT = 'https://js.stripe.com/v3/',
  stripeLoading = null,
  CHECKOUT_MESSAGE = 'aux:billing-embedded-checkout',
  /** Checkout in a frame, for extension pages. */
  HostedCheckout = ({clientSecret, isCompleting, onComplete, publishableKey}) => {
    const frameRef = (0, React.useRef)(null),
      onCompleteRef = (0, React.useRef)(onComplete),
      [error, setError] = (0, React.useState)(null);
    return (
      (0, React.useEffect)(() => {
        onCompleteRef.current = onComplete;
      }, [onComplete]),
      (0, React.useEffect)(() => {
        const origin = new URL(S).origin,
          handleMessage = event => {
            if (
              !(
                event.origin !== origin ||
                event.source !== frameRef.current?.contentWindow ||
                !isCheckoutMessage(event.data)
              )
            ) {
              if (event.data.status === 'complete') {
                onCompleteRef.current();
                return;
              }
              setError(event.data.error ?? 'Could not load checkout. Please try again.');
            }
          };
        return (
          window.addEventListener('message', handleMessage),
          () => window.removeEventListener('message', handleMessage)
        );
      }, []),
      (0, jsxRuntime.jsx)(CheckoutFrame, {
        isCompleting,
        children: error
          ? (0, jsxRuntime.jsx)('div', {
              className: 'text-destructive flex h-80 items-center justify-center text-sm',
              children: error,
            })
          : (0, jsxRuntime.jsx)('iframe', {
              ref: frameRef,
              allow: 'payment *',
              className: 'bg-background h-full min-h-0 w-full overscroll-none border-0',
              src: hostedCheckoutUrl({clientSecret, publishableKey}),
              title: 'Aux checkout',
            }),
      })
    );
  },
  /** Stripe's embedded checkout. */
  EmbeddedCheckout = ({clientSecret, isCompleting, onComplete, publishableKey}) => {
    const containerRef = (0, React.useRef)(null),
      onCompleteRef = (0, React.useRef)(onComplete),
      [error, setError] = (0, React.useState)(null);
    return (
      (0, React.useEffect)(() => {
        onCompleteRef.current = onComplete;
      }, [onComplete]),
      (0, React.useEffect)(() => {
        let instance = null,
          active = true;
        return (
          (async () => {
            const stripe = (await loadStripe())(publishableKey),
              createCheckout =
                stripe?.createEmbeddedCheckoutPage?.bind(stripe) ?? stripe?.initEmbeddedCheckout?.bind(stripe);
            if (!stripe || !createCheckout) throw new Error('Embedded Checkout is unavailable in Stripe.js');
            const checkout = await createCheckout({
              fetchClientSecret: async () => clientSecret,
              onComplete: () => {
                onCompleteRef.current();
              },
            });
            if (!active) {
              checkout.destroy();
              return;
            }
            ((instance = checkout), containerRef.current && checkout.mount(containerRef.current));
          })().catch(failure => {
            (console.error(failure), setError('Could not load checkout. Please try again.'));
          }),
          () => {
            ((active = false), instance?.destroy());
          }
        );
      }, [clientSecret, publishableKey]),
      (0, jsxRuntime.jsx)(CheckoutFrame, {
        isCompleting,
        children: error
          ? (0, jsxRuntime.jsx)('div', {
              className: 'text-destructive flex h-80 items-center justify-center text-sm',
              children: error,
            })
          : (0, jsxRuntime.jsx)('div', {ref: containerRef, className: 'h-full min-h-0 overscroll-none'}),
      })
    );
  },
  /** Around either checkout, with the finishing overlay. */
  CheckoutFrame = ({children, isCompleting}) =>
    (0, jsxRuntime.jsx)('section', {
      className: 'flex h-full min-h-0 flex-col overscroll-none',
      children: (0, jsxRuntime.jsxs)('div', {
        className: 'relative min-h-0 grow overflow-hidden overscroll-none',
        children: [
          children,
          isCompleting &&
            (0, jsxRuntime.jsx)('div', {
              className: 'bg-background/80 absolute inset-0 flex items-center justify-center backdrop-blur-sm',
              children: (0, jsxRuntime.jsxs)('div', {
                className: 'text-muted-foreground flex items-center gap-2 text-sm font-medium',
                children: [
                  (0, jsxRuntime.jsx)(ae, {className: 'size-4'}),
                  (0, jsxRuntime.jsx)('span', {children: 'Finishing setup...'}),
                ],
              }),
            }),
        ],
      }),
    });
/** Stripe.js, loaded once. */
async function loadStripe() {
  const host = window;
  return host.Stripe
    ? host.Stripe
    : ((stripeLoading ??= new Promise((resolve, reject) => {
        const existing = document.querySelector(`script[src="${STRIPE_SCRIPT}"]`),
          script = existing ?? document.createElement('script');
        (script.addEventListener('load', () => {
          const Stripe = host.Stripe;
          Stripe ? resolve(Stripe) : reject(new Error('Stripe.js loaded without exposing Stripe'));
        }),
          script.addEventListener('error', () => reject(new Error('Failed to load Stripe.js'))),
          existing || ((script.async = true), (script.src = STRIPE_SCRIPT), document.head.append(script)));
      })),
      stripeLoading);
}
/** The frame's URL; its secrets stay in the hash. */
function hostedCheckoutUrl({clientSecret, publishableKey}) {
  const url = new URL('/billing/embedded-checkout', S);
  return (
    (url.hash = new URLSearchParams({client_secret: clientSecret, publishable_key: publishableKey}).toString()),
    url.toString()
  );
}
/** Where checkout returns to. */
async function checkoutReturnUrl(accountId) {
  const url = new URL('/billing/return', S);
  (url.searchParams.set('accountId', String(accountId)),
    url.searchParams.set('target', 'onboarding-ai'),
    url.searchParams.set('checkout', 'success'),
    url.searchParams.set('session_id', '{CHECKOUT_SESSION_ID}'));
  const context = await Re();
  return (
    url.searchParams.set('profileId', context.profileId),
    context.windowId !== void 0 && url.searchParams.set('windowId', String(context.windowId)),
    url.toString().replace('%7BCHECKOUT_SESSION_ID%7D', '{CHECKOUT_SESSION_ID}')
  );
}
/** A message from the checkout frame. */
function isCheckoutMessage(value) {
  if (typeof value != 'object' || value === null) return false;
  const message = value;
  return (
    message.type === CHECKOUT_MESSAGE &&
    (message.status === 'complete' || message.status === 'error') &&
    (message.error === void 0 || typeof message.error == 'string')
  );
}
/** A paid plan in good standing. */
function hasPaidPlan(subscription) {
  return !!(
    subscription &&
    subscription.plan.slug !== 'free' &&
    (subscription.status === 'active' || subscription.status === 'trialing')
  );
}
/** Polls for ten seconds for the paid plan. */
async function waitForPaidPlan({accountId, queryClient, trpc}) {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    if (
      hasPaidPlan(
        (await queryClient.query(trpc.billing.getSubscription.queryOptions({accountId, fresh: true}, {staleTime: 0})))
          .subscription,
      )
    )
      return true;
    await new Promise(resolve => setTimeout(resolve, 1e3));
  }
  return false;
}
var /** More subscriptions, and the API key option. */
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
              (0, jsxRuntime.jsx)(Z, {children: 'Connect another subscription or use your own API key.'}),
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
