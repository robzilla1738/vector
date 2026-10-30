/* Aux-owned source, connect provider dialog pass 1 (assets/connect-dialog-CacgpFap.js, from the
 * dialog context to the local presets; React and the JSX runtime before it stay supplied): the
 * dialog shell, form and field parts, and the API key dialogs (OpenAI, OpenRouter, Anthropic,
 * Google, xAI, Meta, OpenCode, Qwen, DeepSeek, Command Code, MiniMax, Moonshot, Kimi, Z.ai, Xiaomi
 * and its regional token plans, Cloudflare AI Gateway), the key input and the save hooks.
 * vendor/provided/provider-cli/integration.mjs owns the CLI rows (In, Sn, auxCliDialog), the
 * reserved provider IDs (Ve) and the dialog list (Rn), which stay supplied.
 * Names the rest of the chunk uses keep their chunk names: P ProviderDialog, T ProviderForm, M
 * ProviderField, _ CancelButton, U SubmitButton, I DialogHeading, A/w description and footer, the
 * dialogs (Ft OpenAI, _t Meta, Nt OpenRouter, Kt/Tt OpenCode, Ut Qwen, Vt Anthropic, Rt Google, Lt
 * xAI, Gt DeepSeek, zt Command Code, qt MiniMax, Bt Moonshot, Jt Kimi, Wt Z.ai, Xt Xiaomi,
 * Ht/$t/Qt the Xiaomi token plans, Yt/en the region and Cloudflare dialogs) and fe the local presets.
 * Chunk names used: d React, e JSX runtime, b the provider list context, W/z/S tRPC, mutation and
 * toast, v link, C label, pe Input, D spinner, R/j/Ie/Ee the schema builders, and the dialog,
 * form and select parts. */
FormIdContext = (0, d.createContext)(
    null,
  ) /** A provider dialog: open while it is the current provider, cleared once closed. */,
  P = ({provider, children, contentClassName}) => {
    const {all, currentProvider, setCurrentProvider} = b(),
      [l, i] = (0, d.useState)(false),
      u = `provider-dialog-form-${provider}`,
      h = c => {
        c || i(false);
      };
    return (
      (0, d.useEffect)(() => {
        i(currentProvider === provider);
      }, [currentProvider, provider]),
      all.get(provider)
        ? (0, e.jsx)(FormIdContext, {
            value: u,
            children: (0, e.jsx)(wt, {
              open: l,
              onOpenChange: h,
              onOpenChangeComplete: c => {
                !c && currentProvider === provider && setCurrentProvider(null);
              },
              children: (0, e.jsx)(It, {className: contentClassName, onKeyDownCapture: at, children}),
            }),
          })
        : null
    );
  };
function T({schema, defaultValues, onSubmit, children}) {
  const r = (0, d.use)(FormIdContext),
    a = dt({mode: 'onChange', resolver: ct(schema), defaultValues}),
    l = Object.values(a.formState.errors).flat();
  return (0, e.jsx)(ut, {
    ...a,
    children: (0, e.jsxs)('form', {
      id: r ?? void 0,
      className: 'space-y-4',
      onSubmit: i => {
        (i.preventDefault(), i.stopPropagation(), a.handleSubmit(onSubmit)(i));
      },
      children: [children, l.length > 0 && (0, e.jsx)(et, {errors: l})],
    }),
  });
}
function M({name, children}) {
  const s = Pe(),
    o = s.register(name),
    r = !!s.formState.errors[name];
  return (0, e.jsx)(Oe, {children: (0, e.jsx)(Me, {children: children({register: o, invalid: r})})});
}
var _ = ({children, ...n}) =>
    (0, e.jsx)(Ct, {...n, render: (0, e.jsx)(re, {variant: 'secondary'}), children: children ?? 'Cancel'}),
  U = ({children, ...n}) => {
    const s = (0, d.use)(FormIdContext);
    return (0, e.jsx)(re, {type: 'submit', form: s ?? void 0, ...n, children: children ?? 'Connect'});
  },
  I = ({mode = 'create', title, children}) => {
    const {all, currentProvider} = b(),
      a = all.get(currentProvider ?? '');
    return a
      ? (0, e.jsxs)(Pt, {
          children: [
            (0, e.jsxs)(At, {
              children: [
                (0, e.jsx)(mt, {className: 'text-muted-foreground mb-3 size-6', provider: a.id}),
                (0, e.jsx)('span', {
                  children: title ?? (mode === 'create' ? `Connect with ${a.name}` : `Update ${a.name}`),
                }),
              ],
            }),
            children,
          ],
        })
      : null;
  },
  A = yt,
  w = vt,
  Ft = () => {
    const {mode, isPending, handleSubmit} = useApiKeySave();
    return (0, e.jsxs)(P, {
      provider: 'openai',
      children: [
        (0, e.jsx)(I, {
          mode,
          children: (0, e.jsxs)(A, {
            children: [
              'Visit ',
              (0, e.jsx)(v, {to: 'https://platform.openai.com/api-keys', children: 'OpenAI Platform'}),
              ' to get your API key.',
            ],
          }),
        }),
        (0, e.jsx)(T, {
          schema: ApiKeySchema,
          onSubmit: handleSubmit,
          children: (0, e.jsx)(M, {
            name: 'apiKey',
            children: ({register, invalid}) =>
              (0, e.jsxs)(e.Fragment, {
                children: [
                  (0, e.jsx)(C, {htmlFor: register.name, children: 'API Key'}),
                  (0, e.jsx)(ApiKeyInput, {register, invalid, placeholder: 'e.g. sk-...'}),
                ],
              }),
          }),
        }),
        (0, e.jsxs)(w, {
          children: [
            (0, e.jsx)(_, {}),
            (0, e.jsxs)(U, {
              disabled: isPending,
              children: [
                isPending && (0, e.jsx)(D, {}),
                (0, e.jsx)('span', {children: mode === 'create' ? 'Submit' : 'Update'}),
              ],
            }),
          ],
        }),
      ],
    });
  },
  _t = () =>
    (0, e.jsx)(ApiKeyDialog, {
      provider: 'meta',
      description: (0, e.jsxs)(e.Fragment, {
        children: [
          'Visit ',
          (0, e.jsx)(v, {to: 'https://dev.meta.ai/', children: 'Meta Model API'}),
          ' to get your API key.',
        ],
      }),
      placeholder: 'Meta Model API key',
    }),
  Nt = () => {
    const {mode, isPending, handleSubmit} = useApiKeySave();
    return (0, e.jsxs)(P, {
      provider: 'openrouter',
      children: [
        (0, e.jsx)(I, {
          mode,
          children: (0, e.jsxs)(A, {
            children: [
              'Visit ',
              (0, e.jsx)(v, {to: 'https://openrouter.ai/settings/keys', children: 'OpenRouter'}),
              ' to get your API key.',
            ],
          }),
        }),
        (0, e.jsx)(T, {
          schema: ApiKeySchema,
          onSubmit: handleSubmit,
          children: (0, e.jsx)(M, {
            name: 'apiKey',
            children: ({register, invalid}) =>
              (0, e.jsxs)(e.Fragment, {
                children: [
                  (0, e.jsx)(C, {htmlFor: register.name, children: 'API Key'}),
                  (0, e.jsx)(ApiKeyInput, {register, invalid, placeholder: 'e.g. sk-or-v1-...'}),
                ],
              }),
          }),
        }),
        (0, e.jsxs)(w, {
          children: [
            (0, e.jsx)(_, {}),
            (0, e.jsxs)(U, {
              disabled: isPending,
              children: [
                isPending && (0, e.jsx)(D, {}),
                (0, e.jsx)('span', {children: mode === 'create' ? 'Submit' : 'Update'}),
              ],
            }),
          ],
        }),
      ],
    });
  },
  Kt = () =>
    (0, e.jsx)(ApiKeyDialog, {
      provider: 'opencode',
      description: (0, e.jsxs)(e.Fragment, {
        children: [
          'Visit ',
          (0, e.jsx)(v, {to: 'https://opencode.ai/docs/zen/', children: 'OpenCode Zen'}),
          ' to get your API key.',
        ],
      }),
      placeholder: 'e.g. opencode_...',
    }),
  Tt = () =>
    (0, e.jsx)(ApiKeyDialog, {
      provider: 'opencode-go',
      description: (0, e.jsxs)(e.Fragment, {
        children: [
          'Visit ',
          (0, e.jsx)(v, {to: 'https://opencode.ai/docs/go/', children: 'OpenCode Go'}),
          ' to get your API key.',
        ],
      }),
      placeholder: 'e.g. opencode_...',
    }),
  Ut = () =>
    (0, e.jsx)(ApiKeyDialog, {
      provider: 'qwen-token-plan',
      description: (0, e.jsxs)(e.Fragment, {
        children: [
          'Visit',
          ' ',
          (0, e.jsx)(v, {
            to: 'https://www.alibabacloud.com/help/en/model-studio/token-plan-team-quickstart',
            children: 'Alibaba Cloud Model Studio',
          }),
          ' ',
          'to get your Token Plan API key.',
        ],
      }),
      placeholder: 'e.g. sk-sp-...',
    }),
  Vt = () => {
    const {mode, isPending, handleSubmit} = useApiKeySave();
    return (0, e.jsxs)(P, {
      provider: 'anthropic',
      children: [
        (0, e.jsx)(I, {
          mode,
          children: (0, e.jsxs)(A, {
            children: [
              'Visit ',
              (0, e.jsx)(v, {to: 'https://platform.claude.com/settings/keys', children: 'Claude Console'}),
              ' to get your API key.',
            ],
          }),
        }),
        (0, e.jsx)(T, {
          schema: ApiKeySchema,
          onSubmit: handleSubmit,
          children: (0, e.jsx)(M, {
            name: 'apiKey',
            children: ({register, invalid}) =>
              (0, e.jsxs)(e.Fragment, {
                children: [
                  (0, e.jsx)(C, {htmlFor: register.name, children: 'API Key'}),
                  (0, e.jsx)(ApiKeyInput, {register, invalid, placeholder: 'e.g. sk-ant-...'}),
                ],
              }),
          }),
        }),
        (0, e.jsxs)(w, {
          children: [
            (0, e.jsx)(_, {}),
            (0, e.jsxs)(U, {
              disabled: isPending,
              children: [
                isPending && (0, e.jsx)(D, {}),
                (0, e.jsx)('span', {children: mode === 'create' ? 'Submit' : 'Update'}),
              ],
            }),
          ],
        }),
      ],
    });
  },
  Rt = () => {
    const {mode, isPending, handleSubmit} = useApiKeySave();
    return (0, e.jsxs)(P, {
      provider: 'google',
      children: [
        (0, e.jsx)(I, {
          mode,
          children: (0, e.jsxs)(A, {
            children: [
              'Visit ',
              (0, e.jsx)(v, {to: 'https://aistudio.google.com/api-keys', children: 'Google AI Studio'}),
              ' to get your API key.',
            ],
          }),
        }),
        (0, e.jsx)(T, {
          schema: ApiKeySchema,
          onSubmit: handleSubmit,
          children: (0, e.jsx)(M, {
            name: 'apiKey',
            children: ({register, invalid}) =>
              (0, e.jsxs)(e.Fragment, {
                children: [
                  (0, e.jsx)(C, {htmlFor: register.name, children: 'API Key'}),
                  (0, e.jsx)(ApiKeyInput, {register, invalid, placeholder: 'e.g. AI...'}),
                ],
              }),
          }),
        }),
        (0, e.jsxs)(w, {
          children: [
            (0, e.jsx)(_, {}),
            (0, e.jsxs)(U, {
              disabled: isPending,
              children: [
                isPending && (0, e.jsx)(D, {}),
                (0, e.jsx)('span', {children: mode === 'create' ? 'Submit' : 'Update'}),
              ],
            }),
          ],
        }),
      ],
    });
  },
  Lt = () => {
    const {mode, isPending, handleSubmit} = useApiKeySave();
    return (0, e.jsxs)(P, {
      provider: 'xai',
      children: [
        (0, e.jsx)(I, {
          mode,
          children: (0, e.jsxs)(A, {
            children: [
              'Visit ',
              (0, e.jsx)(v, {to: 'https://console.x.ai/', children: 'xAI Cloud Console'}),
              ' to get your API key.',
            ],
          }),
        }),
        (0, e.jsx)(T, {
          schema: ApiKeySchema,
          onSubmit: handleSubmit,
          children: (0, e.jsx)(M, {
            name: 'apiKey',
            children: ({register, invalid}) =>
              (0, e.jsxs)(e.Fragment, {
                children: [
                  (0, e.jsx)(C, {htmlFor: register.name, children: 'API Key'}),
                  (0, e.jsx)(ApiKeyInput, {register, invalid, placeholder: 'e.g. xai-...'}),
                ],
              }),
          }),
        }),
        (0, e.jsxs)(w, {
          children: [
            (0, e.jsx)(_, {}),
            (0, e.jsxs)(U, {
              disabled: isPending,
              children: [
                isPending && (0, e.jsx)(D, {}),
                (0, e.jsx)('span', {children: mode === 'create' ? 'Submit' : 'Update'}),
              ],
            }),
          ],
        }),
      ],
    });
  } /** A dialog that asks for an API key, with a link to get one. */,
  ApiKeyDialog = ({provider, description, placeholder}) => {
    const {mode, isPending, handleSubmit} = useApiKeySave();
    return (0, e.jsxs)(P, {
      provider,
      children: [
        (0, e.jsx)(I, {mode, children: (0, e.jsx)(A, {children: description})}),
        (0, e.jsx)(T, {
          schema: ApiKeySchema,
          onSubmit: handleSubmit,
          children: (0, e.jsx)(M, {
            name: 'apiKey',
            children: ({register, invalid}) =>
              (0, e.jsxs)(e.Fragment, {
                children: [
                  (0, e.jsx)(C, {htmlFor: register.name, children: 'API Key'}),
                  (0, e.jsx)(ApiKeyInput, {register, invalid, placeholder}),
                ],
              }),
          }),
        }),
        (0, e.jsxs)(w, {
          children: [
            (0, e.jsx)(_, {}),
            (0, e.jsxs)(U, {
              disabled: isPending,
              children: [
                isPending && (0, e.jsx)(D, {}),
                (0, e.jsx)('span', {children: mode === 'create' ? 'Submit' : 'Update'}),
              ],
            }),
          ],
        }),
      ],
    });
  },
  Gt = () =>
    (0, e.jsx)(ApiKeyDialog, {
      provider: 'deepseek',
      description: (0, e.jsxs)(e.Fragment, {
        children: [
          'Visit ',
          (0, e.jsx)(v, {to: 'https://platform.deepseek.com/api_keys', children: 'DeepSeek Platform'}),
          ' to get your API key.',
        ],
      }),
      placeholder: 'e.g. sk-...',
    }),
  zt = () =>
    (0, e.jsx)(ApiKeyDialog, {
      provider: 'commandcode',
      description: (0, e.jsxs)(e.Fragment, {
        children: [
          'Visit ',
          (0, e.jsx)(v, {to: 'https://commandcode.ai/settings/keys', children: 'Command Code Studio'}),
          ' to get your API key. Provider API access requires a paid plan.',
        ],
      }),
      placeholder: 'API key',
    }),
  qt = () =>
    (0, e.jsx)(ApiKeyDialog, {
      provider: 'minimax',
      description: (0, e.jsxs)(e.Fragment, {
        children: [
          'Visit',
          ' ',
          (0, e.jsx)(v, {
            to: 'https://platform.minimaxi.com/user-center/basic-information/interface-key',
            children: 'MiniMax Platform',
          }),
          ' ',
          'to get your API key.',
        ],
      }),
      placeholder: 'e.g. sk-...',
    }),
  Bt = () =>
    (0, e.jsx)(ApiKeyDialog, {
      provider: 'moonshotai',
      description: (0, e.jsxs)(e.Fragment, {
        children: [
          'Visit ',
          (0, e.jsx)(v, {to: 'https://platform.kimi.ai/console/api-keys', children: 'Moonshot AI'}),
          ' to get your API key.',
        ],
      }),
      placeholder: 'e.g. sk-...',
    }),
  Jt = () =>
    (0, e.jsx)(ApiKeyDialog, {
      provider: 'kimi-coding',
      description: (0, e.jsxs)(e.Fragment, {
        children: [
          'Visit ',
          (0, e.jsx)(v, {to: 'https://platform.kimi.ai/console/api-keys', children: 'Moonshot AI'}),
          ' to get your Kimi API key.',
        ],
      }),
      placeholder: 'e.g. sk-...',
    }),
  Wt = () =>
    (0, e.jsx)(ApiKeyDialog, {
      provider: 'zai',
      description: (0, e.jsxs)(e.Fragment, {
        children: [
          'Visit ',
          (0, e.jsx)(v, {to: 'https://z.ai/manage-apikey/apikey-list', children: 'Z.ai'}),
          ' to get your API key.',
        ],
      }),
      placeholder: 'e.g. zai-...',
    }),
  Xt = () =>
    (0, e.jsx)(ApiKeyDialog, {
      provider: 'xiaomi',
      description: (0, e.jsxs)(e.Fragment, {
        children: [
          'Visit ',
          (0, e.jsx)(v, {to: 'https://mimo.mi.com/', children: 'Xiaomi MiMo'}),
          ' to get your API key.',
        ],
      }),
      placeholder: 'e.g. sk-...',
    }),
  TokenPlanDialog = ({provider}) => {
    const [n, s] = (0, d.useState)(provider),
      {currentProvider} = b(),
      {mode, isPending, handleSubmit} = useApiKeySave(n);
    return (
      (0, d.useEffect)(() => {
        currentProvider === provider && s(provider);
      }, [currentProvider, provider]),
      (0, e.jsxs)(P, {
        provider,
        children: [
          (0, e.jsx)(I, {
            mode,
            title: mode === 'create' ? 'Connect with MiMo Token Plan' : 'Update MiMo Token Plan',
            children: (0, e.jsxs)(A, {
              children: [
                'Visit ',
                (0, e.jsx)(v, {to: 'https://mimo.mi.com/', children: 'Xiaomi MiMo'}),
                ' to get your Token Plan API key.',
              ],
            }),
          }),
          (0, e.jsxs)(T, {
            schema: RegionApiKeySchema,
            defaultValues: {region: provider, apiKey: ''},
            onSubmit: ({apiKey}) => handleSubmit({apiKey}),
            children: [
              (0, e.jsx)(RegionSelect, {value: n, onValueChange: s}),
              (0, e.jsx)(M, {
                name: 'apiKey',
                children: ({register, invalid}) =>
                  (0, e.jsxs)(e.Fragment, {
                    children: [
                      (0, e.jsx)(C, {htmlFor: register.name, children: 'API Key'}),
                      (0, e.jsx)(ApiKeyInput, {register, invalid, placeholder: 'e.g. tp-... or ttp-...'}),
                    ],
                  }),
              }),
            ],
          }),
          (0, e.jsxs)(w, {
            children: [
              (0, e.jsx)(_, {}),
              (0, e.jsxs)(U, {
                disabled: isPending,
                children: [
                  isPending && (0, e.jsx)(D, {}),
                  (0, e.jsx)('span', {children: mode === 'create' ? 'Submit' : 'Update'}),
                ],
              }),
            ],
          }),
        ],
      })
    );
  },
  RegionSelect = ({value, onValueChange}) => {
    const s = Pe();
    return (0, e.jsx)(M, {
      name: 'region',
      children: ({register, invalid}) =>
        (0, e.jsxs)(e.Fragment, {
          children: [
            (0, e.jsx)(C, {htmlFor: register.name, children: 'Region'}),
            (0, e.jsxs)(Te, {
              value,
              onValueChange: a => {
                !a || !Ee.includes(a) || (s.setValue('region', a, {shouldValidate: true}), onValueChange(a));
              },
              children: [
                (0, e.jsx)(Ne, {id: register.name, 'aria-invalid': invalid, children: (0, e.jsx)(Ke, {})}),
                (0, e.jsxs)(_e, {
                  children: [
                    (0, e.jsx)(ue, {value: lt, children: 'Singapore (SGP)'}),
                    (0, e.jsx)(ue, {value: 'xiaomi-token-plan-cn', children: 'China (CN)'}),
                    (0, e.jsx)(ue, {value: 'xiaomi-token-plan-ams', children: 'Europe (AMS)'}),
                  ],
                }),
              ],
            }),
          ],
        }),
    });
  },
  Ht = () => (0, e.jsx)(TokenPlanDialog, {provider: 'xiaomi-token-plan-cn'}),
  $t = () => (0, e.jsx)(TokenPlanDialog, {provider: 'xiaomi-token-plan-ams'}),
  Qt = () => (0, e.jsx)(TokenPlanDialog, {provider: 'xiaomi-token-plan-sgp'}),
  Yt = () => {
    const {mode, isPending, handleSubmit} = useApiKeySave();
    return (0, e.jsxs)(P, {
      provider: 'vercel-ai-gateway',
      children: [
        (0, e.jsx)(I, {
          mode,
          children: (0, e.jsxs)(A, {
            children: [
              'Visit',
              ' ',
              (0, e.jsx)(v, {
                to: 'https://vercel.com/d?to=%2F%5Bteam%5D%2F%7E%2Fai%2Fapi-keys',
                children: 'Vercel AI Gateway',
              }),
              ' ',
              'to create an API key.',
            ],
          }),
        }),
        (0, e.jsx)(T, {
          schema: ApiKeySchema,
          onSubmit: handleSubmit,
          children: (0, e.jsx)(M, {
            name: 'apiKey',
            children: ({register, invalid}) =>
              (0, e.jsxs)(e.Fragment, {
                children: [
                  (0, e.jsx)(C, {htmlFor: register.name, children: 'API Key'}),
                  (0, e.jsx)(ApiKeyInput, {register, invalid, placeholder: 'e.g. vck...'}),
                ],
              }),
          }),
        }),
        (0, e.jsxs)(w, {
          children: [
            (0, e.jsx)(_, {}),
            (0, e.jsxs)(U, {
              disabled: isPending,
              children: [
                isPending && (0, e.jsx)(D, {}),
                (0, e.jsx)('span', {children: mode === 'create' ? 'Submit' : 'Update'}),
              ],
            }),
          ],
        }),
      ],
    });
  },
  en = () => {
    const {mode, isPending, handleSubmit} = useCloudflareSave();
    return (0, e.jsxs)(P, {
      provider: 'cloudflare-ai-gateway',
      children: [
        (0, e.jsx)(I, {
          mode,
          children: (0, e.jsx)(A, {
            children:
              'Create a Cloudflare API token with AI Gateway access, then use your account ID and gateway name.',
          }),
        }),
        (0, e.jsxs)(T, {
          schema: CloudflareSchema,
          defaultValues: {gatewayId: 'default'},
          onSubmit: handleSubmit,
          children: [
            (0, e.jsx)(M, {
              name: 'apiKey',
              children: ({register, invalid}) =>
                (0, e.jsxs)(e.Fragment, {
                  children: [
                    (0, e.jsx)(C, {htmlFor: register.name, children: 'API Token'}),
                    (0, e.jsx)(ApiKeyInput, {register, invalid, placeholder: 'e.g. cf_...'}),
                  ],
                }),
            }),
            (0, e.jsx)(M, {
              name: 'accountId',
              children: ({register, invalid}) =>
                (0, e.jsxs)(e.Fragment, {
                  children: [
                    (0, e.jsx)(C, {htmlFor: register.name, children: 'Account ID'}),
                    (0, e.jsx)(ApiKeyInput, {register, invalid, placeholder: 'e.g. 023e...'}),
                  ],
                }),
            }),
            (0, e.jsx)(M, {
              name: 'gatewayId',
              children: ({register, invalid}) =>
                (0, e.jsxs)(e.Fragment, {
                  children: [
                    (0, e.jsx)(C, {htmlFor: register.name, children: 'Gateway ID'}),
                    (0, e.jsx)(ApiKeyInput, {register, invalid, placeholder: 'default'}),
                  ],
                }),
            }),
          ],
        }),
        (0, e.jsxs)(w, {
          children: [
            (0, e.jsx)(_, {}),
            (0, e.jsxs)(U, {
              disabled: isPending,
              children: [
                isPending && (0, e.jsx)(D, {}),
                (0, e.jsx)('span', {children: mode === 'create' ? 'Submit' : 'Update'}),
              ],
            }),
          ],
        }),
      ],
    });
  },
  ApiKeyInput = ({invalid, placeholder, register}) => {
    const o = (0, d.useRef)(null);
    return (
      (0, d.useEffect)(() => {
        register.name === 'apiKey' && o.current?.focus();
      }, [register.name]),
      (0, e.jsx)(pe, {
        ...register,
        ref: r => {
          (register.ref(r), (o.current = r));
        },
        'aria-invalid': invalid,
        placeholder,
      })
    );
  },
  ApiKeySchema = R({apiKey: j().trim().min(1, 'Please enter your API key')}),
  RegionApiKeySchema = R({region: Ie(Ee), apiKey: ApiKeySchema.shape.apiKey}),
  CloudflareSchema = R({
    apiKey: j().trim().min(1, 'Please enter your Cloudflare API token'),
    accountId: j().trim().min(1, 'Please enter your Cloudflare account ID'),
    gatewayId: j().trim().min(1, 'Please enter your Cloudflare gateway ID'),
  }) /** Saves an API key for a provider and finishes connecting it. */,
  useApiKeySave = t => {
    const {accountId, connected, currentProvider, completeConnection} = b(),
      a = W(),
      l = z(a.models.setCredential.mutationOptions()),
      i = t ?? currentProvider,
      u = async h => {
        const c = i;
        if (c)
          try {
            (await l.mutateAsync({providerId: c, credential: {type: 'api_key', key: h.apiKey}, accountId}),
              await completeConnection(c));
          } catch (x) {
            if ((console.error(x), c === 'commandcode' && x instanceof Error)) {
              S.error(x.message);
              return;
            }
            S.error('Failed to connect with API key');
          }
      };
    return {mode: connected.get(i) ? 'update' : 'create', isPending: l.isPending, handleSubmit: u};
  },
  useCloudflareSave = () => {
    const {accountId, connected, currentProvider, completeConnection} = b(),
      r = W(),
      a = z(r.models.setCredential.mutationOptions()),
      l = async i => {
        const u = currentProvider;
        if (u)
          try {
            (await a.mutateAsync({
              providerId: u,
              credential: {type: 'api_key', key: i.apiKey, accountId: i.accountId, gatewayId: i.gatewayId},
              accountId,
            }),
              await completeConnection(u));
          } catch (h) {
            (console.error(h), S.error('Failed to connect Cloudflare AI Gateway'));
          }
      };
    return {mode: connected.get(currentProvider) ? 'update' : 'create', isPending: a.isPending, handleSubmit: l};
  },
  fe = {
    ollama: {providerId: 'ollama', providerName: 'Ollama', baseUrl: 'http://localhost:11434/v1'},
    'lm-studio': {providerId: 'lm-studio', providerName: 'LM Studio', baseUrl: 'http://localhost:1234/v1'},
  }
