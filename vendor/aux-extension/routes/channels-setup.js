/* Aux-owned source, channels pass 1: the channel schemas and connecting a messenger
 * (assets/channels-CJn5l9_T.js, from the platforms to the credentials form id; the bot images before
 * it are owned by vendor/provided/aux-channel-bot-assets.mjs). Slack, Telegram and Discord: their
 * labels and guides, the schemas for connections, policies, owners, pairing and senders; the
 * Channels cover; and the new-connection dialog, which either asks Aux to set the bot up in a new
 * chat or walks the user through pasting its tokens, with an optional Project.
 * Names the rest of the chunk uses keep their chunk names: S React, as PLATFORMS, E PLATFORM_INFO,
 * K discordConnectionSchema, and what the second pass uses: et ChannelsCover, ns useAuxSetup,
 * is CredentialFields, os ProjectField, ls SetupMethodOption, le PLATFORM_FIELDS, ot NewConnectionDialog,
 * and CREDENTIALS_FORM_ID. This block ends inside a `var` list.
 * Chunk names used: L/Xe/b/_/g/Y/se/_s/Es zod, ms useParams, Ue navigate, $ useTRPC, z useQueryClient,
 * O useMutation, R analytics, Ge the form context, Ve form fields, the dialog and button parts.
 * Aux change: the required-field mark uses the destructive token instead of a fixed orange. */
var S = ds(ps(), 1),
  platformSchema = L(['slack', 'telegram', 'discord']),
  as = platformSchema.options /** Slack, Telegram and Discord: their names, sites and icons. */,
  E = {
    slack: {label: 'Slack', url: 'https://slack.com'},
    telegram: {label: 'Telegram', url: 'https://telegram.org'},
    discord: {label: 'Discord', url: 'https://discord.com'},
  },
  connectionStatusSchema = L(['disconnected', 'connecting', 'connected', 'backing_off', 'error']),
  connectionTargetSchema = Xe('platform', [
    b({platform: _('slack'), projectId: g().min(1).nullable().default(null)}),
    b({platform: _('telegram'), projectId: g().min(1).nullable().default(null)}),
    b({
      platform: _('discord'),
      applicationId: g().regex(/^\d+$/),
      publicKey: g().regex(/^[0-9a-fA-F]{64}$/),
      projectId: g().min(1).nullable().default(null),
    }),
  ]),
  channelPolicySchema = b({
    dm: b({access: L(['pairing', 'everyone', 'disabled'])}),
    group: b({access: L(['pairing', 'everyone', 'disabled']), requireMention: se().default(true)}),
    delivery: b({
      whileRunning: L(['follow_up', 'steer']),
      interruptCommands: _s(g()),
      debounceMs: Y().int().min(0).max(1e4),
    }),
  }),
  COVER = '/assets/cover-BBxO7594.webp',
  jsxRuntime = us() /** The Channels cover: Aux, Anywhere. */,
  et = () => {
    return (0, jsxRuntime.jsx)(Z, {
      children: (0, jsxRuntime.jsxs)(T, {
        className: 'items-stretch gap-2.5 p-1',
        children: [
          (0, jsxRuntime.jsxs)('div', {
            className: 'flex min-w-0 flex-1 flex-col px-3.5 py-3',
            children: [
              (0, jsxRuntime.jsx)(I, {
                title: (0, jsxRuntime.jsx)('span', {className: 'text-base', children: 'Aux, Anywhere'}),
                description: (0, jsxRuntime.jsx)('span', {
                  className: 'text-sm',
                  children:
                    'Control Aux from Slack, Discord, or Telegram to work remotely or build a chatbot for your team.',
                }),
              }),
              false,
            ],
          }),
          (0, jsxRuntime.jsx)('img', {
            src: COVER,
            alt: 'Aux channels cover',
            className: 'pointer-events-none w-72 shrink-0 rounded-[10px] object-cover select-none',
          }),
        ],
      }),
    });
  },
  ownerNameSchema = g().trim().min(1).max(80).optional(),
  ownerSchema = s => b({senderId: g().trim().regex(s), displayName: ownerNameSchema}).optional(),
  slackConnectionSchema = b({
    platform: _('slack'),
    projectId: g().min(1).nullable(),
    botToken: g().trim().min(20).startsWith('xoxb-'),
    appToken: g().trim().startsWith('xapp-'),
    owner: ownerSchema(/^[UW][A-Z0-9]{2,20}$/),
  }),
  telegramConnectionSchema = b({
    platform: _('telegram'),
    projectId: g().min(1).nullable(),
    botToken: g().trim().min(20),
    owner: ownerSchema(/^\d{1,20}$/),
  }),
  K = b({
    platform: _('discord'),
    projectId: g().min(1).nullable(),
    botToken: g().trim().min(20),
    applicationId: g().trim().regex(/^\d+$/),
    publicKey: g()
      .trim()
      .regex(/^[0-9a-fA-F]{64}$/),
    owner: ownerSchema(/^\d{15,21}$/),
  }),
  createConnectionSchema = Xe('platform', [slackConnectionSchema, telegramConnectionSchema, K]),
  updateConnectionSchema = b({
    connectionId: g().uuid(),
    enabled: se().optional(),
    projectId: g().min(1).nullable().optional(),
    botToken: telegramConnectionSchema.shape.botToken.optional(),
    appToken: slackConnectionSchema.shape.appToken.optional(),
    applicationId: K.shape.applicationId.optional(),
    publicKey: K.shape.publicKey.optional(),
  }),
  connectionSchema = b({
    id: g().uuid(),
    platform: platformSchema,
    displayName: g(),
    enabled: se(),
    status: connectionStatusSchema,
    botUserId: g().nullable(),
    botName: g().nullable(),
    projectId: g().nullable(),
    applicationId: g().nullable(),
    publicKey: g().nullable(),
    statusCode: g().nullable().optional(),
    statusMessage: g().nullable().optional(),
    lastUsedAt: Y().int().nullable(),
    pendingPairingCount: Y().int(),
  }),
  policyUpdateSchema = b({connectionId: g().uuid(), policy: channelPolicySchema}),
  senderSchema = b({
    connectionId: g().uuid(),
    senderId: g(),
    displayName: g().nullable(),
    avatarUrl: g().nullable(),
    canApprovePairing: se(),
    pairedAt: Y().int().nullable(),
    lastSeenAt: Y().int().nullable(),
  }),
  pairingRequestSchema = b({requestId: g().uuid()}),
  senderRefSchema = b({connectionId: g().uuid(), senderId: g().min(1)}),
  senderUpdateSchema = senderRefSchema.extend({
    canApprovePairing: se(),
  }) /** Starts a chat in which Aux sets up the bot, then opens it. */,
  ns = () => {
    const {userId} = ms({from: '/_web/(settings)/u/$userId/settings/channels/'}),
      t = Number.parseInt(userId, 10),
      n = Ue(),
      a = $(),
      r = z(),
      o = O(a.sessions.createAndPrompt.mutationOptions());
    return {
      startSetup: async m => {
        const i = {role: 'user', content: m, timestamp: Date.now()};
        try {
          const d = await Us(),
            h = await o.mutateAsync({
              accountId: t,
              message: i,
              trigger: {type: 'user', source: 'channels-settings'},
              ...(d ? {browserBinding: d} : {}),
            }),
            u = {sessionId: h.id, accountId: t};
          return (
            r.setQueryData(a.sessions.get.queryKey(u), h),
            r.setQueryData(a.sessions.messages.queryKey(u), []),
            Ws(h.id, i, {mode: 'display-only'}),
            r.invalidateQueries(a.sessions.listPreviewItems.queryFilter({accountId: t})),
            r.invalidateQueries(a.sessions.listPreviewItems.infiniteQueryFilter({accountId: t})),
            await n({to: '/u/$userId/tasks/$sessionId', params: {userId, sessionId: h.id}}),
            true
          );
        } catch (d) {
          const h = await Qs(d, 'Failed to start channel setup.');
          return (
            N.error(h.description ? h.title : 'Failed to start channel setup.', {description: h.description}),
            false
          );
        }
      },
      isPending: o.isPending,
    };
  },
  ConnectionDialogContext = (0, S.createContext)(null),
  useConnectionDialog = () => {
    const s = (0, S.use)(ConnectionDialogContext);
    if (!s) throw new Error('useConnectionDialog must be used within a ConnectionDialog');
    return s;
  },
  NO_PROJECT =
    '__no_project__' /** The credential fields of a platform, required when creating or when the field must be re-entered. */,
  is = ({fields, mode}) => {
    const n = Ge();
    return fields.map(a => {
      const r = mode === 'create' || a.requiredOnUpdate;
      return (0, jsxRuntime.jsx)(
        Ve,
        {
          children: (0, jsxRuntime.jsxs)(ze, {
            children: [
              (0, jsxRuntime.jsxs)(Be, {
                className: 'gap-0',
                htmlFor: a.id,
                children: [a.label, r && (0, jsxRuntime.jsx)(RequiredMark, {})],
              }),
              (0, jsxRuntime.jsx)(js, {
                ...n.register(a.name),
                id: a.id,
                type: a.type,
                inputMode: a.inputMode,
                autoComplete: 'off',
                placeholder: a.placeholder,
                'aria-required': r,
                'aria-invalid': !!n.formState.errors[a.name],
              }),
              a.description && (0, jsxRuntime.jsx)(vs, {className: 'text-xs', children: a.description}),
            ],
          }),
        },
        a.name,
      );
    });
  },
  RequiredMark = () => (0, jsxRuntime.jsx)('sup', {className: 'text-destructive', 'aria-hidden': 'true', children: '*'}),
  os = ({projects}) => {
    const t = Ge();
    return (0, jsxRuntime.jsx)(Ve, {
      children: (0, jsxRuntime.jsxs)(ze, {
        children: [
          (0, jsxRuntime.jsx)(Be, {className: 'gap-0', htmlFor: 'channel-project', children: 'Project'}),
          (0, jsxRuntime.jsx)(Ns, {
            control: t.control,
            name: 'projectId',
            render: ({field}) => {
              const a = r => {
                field.onChange(r === NO_PROJECT ? null : r);
              };
              return (0, jsxRuntime.jsxs)(we, {
                value: field.value ?? NO_PROJECT,
                onValueChange: a,
                children: [
                  (0, jsxRuntime.jsx)(Ne, {
                    id: 'channel-project',
                    className: 'w-full',
                    children: (0, jsxRuntime.jsx)(Se, {}),
                  }),
                  (0, jsxRuntime.jsxs)(Ce, {
                    children: [
                      (0, jsxRuntime.jsx)(U, {
                        value: NO_PROJECT,
                        children: (0, jsxRuntime.jsx)('span', {children: 'No project'}),
                      }),
                      projects.map(r =>
                        (0, jsxRuntime.jsx)(
                          U,
                          {
                            value: r.id,
                            children: (0, jsxRuntime.jsxs)('span', {
                              className: 'flex items-center gap-2',
                              children: [
                                (0, jsxRuntime.jsx)(ys, {className: 'size-4', color: r.color, icon: r.icon}),
                                (0, jsxRuntime.jsx)('span', {children: r.name}),
                              ],
                            }),
                          },
                          r.id,
                        ),
                      ),
                    ],
                  }),
                ],
              });
            },
          }),
        ],
      }),
    });
  } /** The credentials form: tokens, owner and Project, with the platform’s guide. */,
  CredentialsForm = ({defaultValues, fields, guideUrl, projects, schema, onBack, onSubmit}) => {
    const {busyRef, platform} = useConnectionDialog(),
      d = We({mode: 'onChange', resolver: He(schema), defaultValues}),
      h = Object.values(d.formState.errors).flat(),
      u = () => {
        d.formState.isSubmitting || onBack();
      },
      j = d.handleSubmit(async y => {
        busyRef.current = true;
        try {
          await onSubmit(y);
        } finally {
          busyRef.current = false;
        }
      });
    return (0, jsxRuntime.jsx)(Je, {
      ...d,
      children: (0, jsxRuntime.jsxs)('form', {
        className: 'flex flex-col gap-5',
        onSubmit: j,
        children: [
          (0, jsxRuntime.jsx)(ManualSetupHeader, {onBack: u}),
          (0, jsxRuntime.jsxs)('div', {
            className: 'space-y-1 px-2',
            children: [
              (0, jsxRuntime.jsx)(ke, {children: 'Create and paste the bot tokens by following this guide.'}),
              (0, jsxRuntime.jsxs)(Ls, {
                className: 'text-brand-content inline-flex items-center gap-1 text-sm hover:opacity-80',
                to: guideUrl,
                children: [(0, jsxRuntime.jsx)(Ds, {className: 'size-4'}), `How to setup ${E[platform].label} bot`],
              }),
            ],
          }),
          (0, jsxRuntime.jsxs)('div', {
            className: 'space-y-4 px-2',
            children: [(0, jsxRuntime.jsx)(is, {fields, mode: 'create'}), (0, jsxRuntime.jsx)(os, {projects})],
          }),
          h.length > 0 && (0, jsxRuntime.jsx)(Le, {className: 'text-xs', errors: h}),
          (0, jsxRuntime.jsx)(De, {
            className: 'm-0 mt-3 p-0',
            children: (0, jsxRuntime.jsxs)(k, {
              type: 'submit',
              disabled: !d.formState.isValid || d.formState.isSubmitting,
              children: [d.formState.isSubmitting && (0, jsxRuntime.jsx)(de, {}), 'Submit'],
            }),
          }),
        ],
      }),
    });
  },
  ManualSetupHeader = ({onBack}) =>
    (0, jsxRuntime.jsxs)(jsxRuntime.Fragment, {
      children: [
        (0, jsxRuntime.jsxs)('div', {
          className: 'absolute top-2 left-2 flex items-center',
          children: [
            (0, jsxRuntime.jsx)(k, {
              variant: 'ghost',
              size: 'icon-xs',
              shape: 'pill',
              'aria-label': 'Go back',
              onClick: onBack,
              children: (0, jsxRuntime.jsx)(Qe, {className: 'size-4!'}),
            }),
            (0, jsxRuntime.jsx)(pe, {className: 'text-sm', children: 'Manual setup'}),
          ],
        }),
        (0, jsxRuntime.jsx)('div', {className: 'h-5'}),
      ],
    }),
  ls = ({
    icon,
    label,
    description,
    automaticDescription,
    manualDescription,
    method,
    isPending,
    onMethodChange,
    onNext,
  }) => {
    const d = (0, S.useId)(),
      h = u => {
        (u === 'create-with-aux-v2' || u === 'manual') && onMethodChange(u);
      };
    return (0, jsxRuntime.jsxs)(jsxRuntime.Fragment, {
      children: [
        (0, jsxRuntime.jsxs)(Oe, {
          className: 'px-2',
          children: [
            icon,
            (0, jsxRuntime.jsx)(pe, {children: `Connect Aux to ${label}`}),
            (0, jsxRuntime.jsx)(ke, {children: description}),
          ],
        }),
        (0, jsxRuntime.jsxs)(Js, {
          disabled: isPending,
          value: method,
          onValueChange: h,
          children: [
            (0, jsxRuntime.jsx)(Ee, {
              description: automaticDescription ?? `Automatic setup is not available for ${label}.`,
              disabled: !automaticDescription,
              id: `${d}-aux-v2`,
              title: 'Ask Aux to set it up',
              value: 'create-with-aux-v2',
            }),
            (0, jsxRuntime.jsx)(Ee, {
              description: manualDescription,
              id: `${d}-manual`,
              title: "I'll do it myself",
              value: 'manual',
            }),
          ],
        }),
        (0, jsxRuntime.jsx)(De, {
          className: 'mx-0 mt-4 mb-0 p-0',
          children: (0, jsxRuntime.jsxs)(k, {
            disabled: isPending,
            onClick: onNext,
            children: [isPending && (0, jsxRuntime.jsx)(de, {}), 'Next'],
          }),
        }),
      ],
    });
  },
  tokenField = g().min(1).nullable(),
  optionalField = s =>
    Es([_(''), s]).transform(
      t => t || void 0,
    ) /** Each platform’s credential fields: labels, placeholders and what they accept. */,
  le = {
    slack: {
      fields: [
        {
          name: 'botToken',
          id: 'channel-bot-token',
          label: 'Bot Token',
          type: 'password',
          placeholder: 'xoxb-…',
          description: 'In the Slack API dashboard, open OAuth & Permissions and copy the Bot User OAuth Token.',
        },
        {
          name: 'appToken',
          id: 'channel-app-token',
          label: 'App Token',
          type: 'password',
          placeholder: 'xapp-…',
          description: 'In the Slack API dashboard, open Basic Information > App-Level Tokens and copy the App Token.',
        },
      ],
      updateSchema: b({
        projectId: tokenField,
        botToken: optionalField(slackConnectionSchema.shape.botToken),
        appToken: optionalField(slackConnectionSchema.shape.appToken),
      }),
      updateDefaults: s => ({projectId: s.projectId, botToken: '', appToken: ''}),
    },
    telegram: {
      fields: [
        {
          name: 'botToken',
          id: 'channel-bot-token',
          label: 'Bot Token',
          type: 'password',
          placeholder: '123456789:AAExampleBotToken',
          description: "Copy the token from @BotFather's confirmation message.",
        },
      ],
      updateSchema: b({projectId: tokenField, botToken: optionalField(telegramConnectionSchema.shape.botToken)}),
      updateDefaults: s => ({projectId: s.projectId, botToken: ''}),
    },
    discord: {
      fields: [
        {
          name: 'botToken',
          id: 'channel-bot-token',
          label: 'Bot Token',
          type: 'password',
          description: 'In the Discord Developer Portal, open Bot and copy the token.',
        },
        {
          name: 'applicationId',
          id: 'channel-app-id',
          label: 'Application ID',
          inputMode: 'numeric',
          placeholder: '123456789012345678',
          requiredOnUpdate: true,
        },
        {
          name: 'publicKey',
          id: 'channel-public-key',
          label: 'Public Key',
          placeholder: '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
          requiredOnUpdate: true,
        },
      ],
      updateSchema: b({
        projectId: tokenField,
        botToken: optionalField(K.shape.botToken),
        applicationId: K.shape.applicationId,
        publicKey: K.shape.publicKey,
      }),
      updateDefaults: s => ({
        projectId: s.projectId,
        botToken: '',
        applicationId: s.applicationId ?? '',
        publicKey: s.publicKey ?? '',
      }),
    },
  },
  guideUrl = s => `https://app.getaux.co/docs`,
  PLATFORM_SETUP = new Map([
    [
      'slack',
      {
        fields: le.slack.fields,
        createSchema: slackConnectionSchema,
        createDefaults: {platform: 'slack', projectId: null, botToken: '', appToken: ''},
      },
    ],
    [
      'telegram',
      {
        fields: le.telegram.fields,
        createSchema: telegramConnectionSchema,
        createDefaults: {platform: 'telegram', projectId: null, botToken: ''},
      },
    ],
    [
      'discord',
      {
        fields: le.discord.fields,
        createSchema: K,
        createDefaults: {platform: 'discord', projectId: null, botToken: '', applicationId: '', publicKey: ''},
      },
    ],
  ]) /** The new-connection dialog: choose how to set up, then the manual form; closing waits for a save in flight. */,
  ot = ({accountId, platform, projects, onOpenChangeComplete, onSaved}) => {
    const [o, c] = (0, S.useState)(true),
      [m, i] = (0, S.useState)('choice'),
      [d, h] = (0, S.useState)('manual'),
      u = (0, S.useRef)(false),
      j = (f, C) => {
        if (!f && (C.reason === 'escape-key' || u.current)) {
          C.cancel();
          return;
        }
        c(f);
      },
      y = f => {
        (onSaved(f), c(false));
      };
    return (0, jsxRuntime.jsx)(ConnectionDialogContext, {
      value: {accountId, platform, projects, view: m, setView: i, busyRef: u, onOpenChange: c, onSaved: y},
      children: (0, jsxRuntime.jsx)(Te, {
        open: o,
        onOpenChange: j,
        onOpenChangeComplete,
        children: (0, jsxRuntime.jsxs)(Me, {
          className: 'max-h-[calc(100vh-2rem)] gap-4 overflow-y-auto px-4 py-5 sm:max-w-md!',
          children: [
            (0, jsxRuntime.jsx)(Hs, {
              value: m,
              caseBy: {
                choice: (0, jsxRuntime.jsx)(SetupChoice, {method: d, onMethodChange: h}),
                'manual-form': (0, jsxRuntime.jsx)(ManualSetup, {}),
              },
            }),
            (0, jsxRuntime.jsx)(Ae, {
              className: 'text-secondary-foreground/50 absolute top-2 right-2',
              variant: 'ghost',
              size: 'icon-xs',
              shape: 'pill',
              'aria-label': 'Close',
              children: (0, jsxRuntime.jsx)(Fe, {className: 'size-4!'}),
            }),
          ],
        }),
      }),
    });
  },
  SetupChoice = ({method, onMethodChange}) => {
    const {platform, busyRef, setView, onOpenChange} = useConnectionDialog(),
      {label, url} = E[platform],
      {createWithAux, isPending} = useSetupWithAux(),
      h = async () => {
        if (method === 'manual') {
          setView('manual-form');
          return;
        }
        busyRef.current = true;
        try {
          if (!(await createWithAux())) return;
          onOpenChange(false);
        } finally {
          busyRef.current = false;
        }
      };
    return (0, jsxRuntime.jsx)(ls, {
      icon: (0, jsxRuntime.jsx)(es, {className: 'mb-3 rounded-lg', name: label, url}),
      label,
      description: `Use Aux in ${label} by creating a bot and mentioning it.`,
      automaticDescription: null,
      manualDescription: 'Set permissions yourself and paste the tokens.',
      method,
      isPending,
      onMethodChange,
      onNext: h,
    });
  },
  ManualSetup = () => {
    const {accountId, platform, projects, setView, onSaved} = useConnectionDialog(),
      o = useCreateConnection(accountId, onSaved),
      c = PLATFORM_SETUP.get(platform),
      m = () => setView('choice');
    return (0, jsxRuntime.jsx)(CredentialsForm, {
      defaultValues: c.createDefaults,
      fields: c.fields,
      projects,
      schema: c.createSchema,
      guideUrl: guideUrl(platform),
      onBack: m,
      onSubmit: o,
    });
  } /** Creates a connection and adds it to the list. */,
  useCreateConnection = (s, t) => {
    const n = $(),
      a = z(),
      {capture} = R(),
      o = O(n.channels.connections.create.mutationOptions()),
      c = n.channels.connections.list.queryKey({accountId: s});
    return async m => {
      try {
        const i = await o.mutateAsync({accountId: s, ...m});
        (capture('settings.channels.connect.manual', {platform: m.platform}), t(i));
      } catch (i) {
        N.error(i instanceof Error ? i.message : 'Failed to create connection.');
      } finally {
        await a.invalidateQueries({queryKey: c});
      }
    };
  } /** Asks Aux to create the bot, in a new chat. */,
  useSetupWithAux = () => {
    const {platform} = useConnectionDialog(),
      {capture} = R(),
      {startSetup, isPending} = ns();
    return {
      createWithAux: async () => {
        const o = await startSetup(`Read this and create a ${E[platform].label} bot for me:
${guideUrl(platform)}`);
        return (o && capture('settings.channels.connect.create-with-aux-v2', {platform}), o);
      },
      isPending,
    };
  },
  CREDENTIALS_FORM_ID = 'channel-credentials-form'
