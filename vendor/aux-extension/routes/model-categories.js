/* Aux-owned source, the model category settings (assets/model-categories-BLKcCTS7.js, the module body): the saved
 * model migrations, how a category picks its default model, and the Default model, category rows and
 * model field of Settings › Models.
 * Names the chunk's importer uses keep their chunk names: Ke the category rows (n), q a model row (r), Qe the
 * Default model row (t).
 * Chunk names used: K the JSX module, Q the provider's models in order, j version compare, de the supported
 * thinking level, le the category presets, E useApp, w analytics, R useTRPC, b useSuspenseQuery, N the model
 * catalog, G update setting, Y remember the last model, F/te/ae/ie setting rows, se/re/ne/oe the model select,
 * U/J/X/T/W/Z the field's button group, tooltip, button, provider icon and menu icon.
 * Aux change: the hosted model catalog's schemas (with their Free, Pro and Max tiers) are gone. Nothing read them. */
var /** Hosted models that were retired, and what replaced them. */
  RETIRED_HOSTED_MODELS = new Map([
    ['claude-fable-5', 'claude-fable-5-1'],
    ['claude-opus-5', 'claude-opus-5-5'],
    ['claude-opus-4-7', 'claude-opus-5-5'],
    ['claude-opus-4-8', 'claude-opus-5-5'],
    ['claude-sonnet-4-6', 'claude-sonnet-5'],
    ['claude-haiku-4-5', 'claude-haiku-5-5'],
    ['claude-haiku-4-5-20251001', 'claude-haiku-5-5'],
    ['gemini-3.1-pro-preview', 'gemini-4-argon'],
    ['gemini-3-flash-preview', 'gemini-3.8-flash'],
    ['gemini-3.5-flash', 'gemini-3.8-flash'],
    ['gemini-3.6-flash', 'gemini-3.8-flash'],
    ['gemini-3.7-flash', 'gemini-3.8-flash'],
    ['gpt-5.4', 'gpt-6-luna'],
    ['gpt-5.4-mini', 'gpt-6-luna'],
    ['gpt-5.5', 'gpt-6.1-sol'],
    ['gpt-5.6-sol', 'gpt-6.1-sol'],
    ['gpt-5.6-terra', 'gpt-6.1-sol'],
    ['gpt-6-sol', 'gpt-6.1-sol'],
    ['gpt-5.6-luna', 'gpt-6-luna'],
    ['glm-5.2', 'glm-5.3'],
    ['kimi-k2.6', 'kimi-k2.7-code'],
    ['grok-4.6', 'grok-4.7'],
  ]); /** The current model for a retired hosted one. */
function currentHostedModel(modelId) {
  return RETIRED_HOSTED_MODELS.get(modelId) ?? modelId;
}
var /** Which provider's model a new profile falls back on first. */
  PROVIDER_ORDER = [
    'anthropic',
    'claude-code',
    'openai',
    'openai-codex',
    'vercel-ai-gateway',
    'cloudflare-ai-gateway',
    'opencode-go',
    'opencode',
    'google',
    'github-copilot',
    'xai',
    'minimax',
    'xiaomi',
    'xiaomi-token-plan-cn',
    'xiaomi-token-plan-ams',
    'xiaomi-token-plan-sgp',
    'aux',
  ] /** Provider models that were retired. */,
  RETIRED_PROVIDER_MODELS = new Map([
    ['anthropic:claude-sonnet-4-6', 'claude-sonnet-5'],
    ['claude-code:claude-sonnet-4-6', 'claude-sonnet-5'],
  ]) /** A saved setting pointed at a model, keeping what it supports. */,
  modelSetting = (setting, model) => ({
    provider: model.provider,
    modelId: model.id,
    thinkingLevel: de(setting.thinkingLevel, model.availableThinkingLevels),
    fastMode: model.supportsFastMode ? !!setting.fastMode : false,
  }); /** A saved setting moved off a retired model. */
function migrateModel(setting) {
  const modelId =
    setting.provider === 'aux'
      ? currentHostedModel(setting.modelId)
      : (RETIRED_PROVIDER_MODELS.get(`${setting.provider}:${setting.modelId}`) ?? setting.modelId);
  return modelId === setting.modelId ? setting : {...setting, modelId};
}
var /** The model a setting names. */
  findModel = (models, setting) =>
    models.find(
      model => model.provider === setting.provider && model.id === setting.modelId,
    ) /** A setting, migrated only when its model is gone. */,
  availableModel = (setting, models) =>
    findModel(models, setting) ? setting : migrateModel(setting) /** The first model in provider order. */,
  firstModel = models => {
    for (const provider of PROVIDER_ORDER) {
      const ordered = Q(
        provider,
        models.filter(model => model.provider === provider),
      );
      if (ordered.length) return ordered[0];
    }
    return models[0];
  }; /** The vendor in a model ID. */
function modelVendor(modelId) {
  const name = modelId.split('/').at(-1) ?? modelId;
  return name.split('-')[0]?.toLowerCase() ?? name.toLowerCase();
} /** A model ID without its router prefix. */
function modelSlug(modelId) {
  return (modelId.split('/').at(-1) ?? modelId).toLowerCase();
} /** A model's family and version, for matching newer releases. */
function modelFamily(modelId) {
  const [vendor, series, ...rest] = modelSlug(modelId)
    .replace(/-\d{8}$|-\d{4}-\d{2}-\d{2}$/, '')
    .split('-');
  if (!series) return;
  if (vendor === 'claude') {
    if (!['haiku', 'sonnet', 'opus', 'fable'].includes(series)) return;
    const version = rest.join('.');
    return /^\d+(?:\.\d{1,2})?$/.test(version) ? {family: `claude-${series}`, version} : void 0;
  }
  const number = series;
  if (!/^\d+(?:\.\d{1,2})?$/.test(number)) return;
  rest.at(-1) === 'preview' && rest.pop();
  const variant = rest.join('-');
  if (vendor === 'gpt')
    return ['', 'luna', 'sol', 'astra'].includes(variant)
      ? {family: variant ? `gpt-${variant}` : 'gpt', version: number}
      : void 0;
  if (vendor === 'gemini')
    return ['flash', 'flash-lite', 'pro', 'argon'].includes(variant)
      ? {family: `gemini-${variant === 'argon' ? 'pro' : variant}`, version: number}
      : void 0;
  if (vendor === 'grok') return variant ? void 0 : {family: vendor, version: number};
} /** The preset that fits a same-vendor or other-vendor selection. */
function pickPreset(presets, options) {
  const first = presets[0];
  if (!first || !options?.selection) return first;
  const vendor = modelVendor(options.selection.relativeTo.modelId);
  return (
    presets.find(preset => {
      const sameVendor = modelVendor(preset.modelId) === vendor;
      return options.selection?.family === 'same' ? sameVendor : !sameVendor;
    }) ?? first
  );
}
var /** A category's presets, each moved to the newest model of its family. */
  presetsFor = (category, models) =>
    le[category].flatMap(preset => {
      const family = modelFamily(preset.modelId),
        model = family
          ? models
              .flatMap(candidate => {
                if (candidate.provider !== preset.provider) return [];
                const parsed = modelFamily(candidate.id);
                return parsed?.family !== family.family || j(parsed.version, family.version) < 0
                  ? []
                  : [{model: candidate, version: parsed.version}];
              })
              .sort((a, b) => j(b.version, a.version) || a.model.id.length - b.model.id.length)[0]?.model
          : findModel(models, preset);
      return model ? [modelSetting({...preset, fastMode: false}, model)] : [];
    }) /** The default model, or the first one there is. */,
  fallbackModel = (setting, models) => {
    const available = availableModel(setting, models),
      model = findModel(models, available);
    if (model) return modelSetting(available, model);
    const first = firstModel(models);
    if (!first) return null;
    const thinkingLevel = first.availableThinkingLevels.includes('medium')
      ? 'medium'
      : (first.availableThinkingLevels.at(-1) ?? 'off');
    return modelSetting({...available, thinkingLevel}, first);
  } /** The model a category uses when none is chosen. */,
  categoryModel = (category, saved, defaultModel, models, options) => {
    if (
      (category !== 'deep' &&
        (models = models.filter(model => {
          const family = modelFamily(model.id)?.family;
          return family !== 'gpt-astra' && family !== 'claude-fable';
        })),
      category === 'visual' && (models = models.filter(available => available.supportsVision)),
      saved)
    ) {
      const preset = availableModel(saved, models),
        match = findModel(models, preset);
      if (match) return modelSetting(preset, match);
    }
    const availableDefault = availableModel(defaultModel, models),
      defaultMatch = findModel(models, availableDefault),
      presets = presetsFor(category, models);
    if (
      defaultMatch &&
      defaultMatch.provider !== 'aux' &&
      presets.some(model => modelSlug(model.modelId) === modelSlug(availableDefault.modelId))
    )
      return modelSetting(availableDefault, defaultMatch);
    const picked = pickPreset(presets, options);
    return picked || fallbackModel(defaultModel, models);
  },
  jsxRuntime = K() /** Settings › Models: a row per category. */,
  Ke = () => {
    const {accountId} = E(),
      {capture} = w(),
      trpc = R(),
      {data: settings} = b(trpc.settings.getAll.queryOptions({accountId})),
      {modelCatalog} = N(),
      {models} = modelCatalog,
      updateSetting = G(),
      defaults = Object.fromEntries(
        MODEL_CATEGORIES.map(category => {
          const categoryModels = category.id === 'visual' ? models.filter(model => model.supportsVision) : models;
          return [category.id, categoryModel(category.id, void 0, settings.defaultModel, categoryModels) ?? void 0];
        }),
      ),
      change = id => model => {
        const next = {...settings.modelCategories};
        (model ? (next[id] = model) : delete next[id],
          updateSetting.mutate(
            {key: 'modelCategories', value: next, accountId},
            {
              onSuccess: (data, variables, context, mutation) => {
                (mutation.client.setQueryData(trpc.settings.getAll.queryKey({accountId}), current =>
                  current ? {...current, modelCategories: next} : void 0,
                ),
                  model && capture('settings.ai.change-model', changeEvent(id, model)));
              },
            },
          ));
      };
    return (0, jsxRuntime.jsx)(ie, {
      children: MODEL_CATEGORIES.map(category => {
        const fallback = defaults[category.id];
        return (0, jsxRuntime.jsx)(
          q,
          {
            value: settings.modelCategories[category.id] ?? null,
            fallbackValue: fallback,
            modelCatalog,
            allowDefaultValue: true,
            info: category,
            onChange: change(category.id),
          },
          category.id,
        );
      }),
    });
  } /** Settings › Models: Default model. */,
  Qe = () => {
    const {accountId} = E(),
      {capture} = w(),
      trpc = R(),
      {data: settings} = b(trpc.settings.getAll.queryOptions({accountId})),
      {modelCatalog} = N(),
      updateSetting = G(),
      change = model => {
        model &&
          updateSetting.mutate(
            {key: 'defaultModel', value: model, accountId},
            {
              onSuccess: (data, variables, context, mutation) => {
                (Y(accountId, model.provider, model.modelId, model.thinkingLevel, model.fastMode),
                  mutation.client.setQueryData(trpc.settings.getAll.queryKey({accountId}), current =>
                    current ? {...current, defaultModel: model} : void 0,
                  ),
                  capture('settings.ai.change-model', changeEvent('default', model)));
              },
            },
          );
      };
    return (0, jsxRuntime.jsx)(q, {
      label: (0, jsxRuntime.jsx)(F, {
        title: 'Default model',
        description: 'The last used model becomes the default for new chat',
      }),
      value: settings.defaultModel,
      modelCatalog,
      onChange: change,
    });
  } /** The categories. */,
  MODEL_CATEGORIES = [
    {id: 'fast', title: 'Fast', description: 'Quick, cheap, bounded side work'},
    {id: 'standard', title: 'Standard', description: 'Durable internal background work, and memory dreaming'},
    {id: 'deep', title: 'Deep', description: 'Hard reasoning, planning, judging, and synthesis'},
    {
      id: 'visual',
      title: 'Visual',
      description: 'Image, screenshot, CAPTCHA, and page interpretation',
      requireVision: true,
    },
  ] /** A model row. */,
  q = ({info, label, value, fallbackValue, modelCatalog, allowDefaultValue, disabled, onChange}) => {
    const iconProvider = [value, fallbackValue].find(
        selection =>
          selection &&
          modelCatalog.models.some(model => model.provider === selection.provider && model.id === selection.modelId),
      )?.provider,
      automatic = !value && !!fallbackValue,
      handleChange = candidate => {
        if (!disabled) {
          if (!candidate) {
            onChange(null);
            return;
          }
          onChange({
            ...candidate,
            thinkingLevel: candidate.thinkingLevel ?? 'off',
            fastMode: candidate.fastMode ?? false,
          });
        }
      };
    return (0, jsxRuntime.jsxs)(te, {
      children: [
        label ?? (0, jsxRuntime.jsx)(F, {title: info?.title, description: info?.description}),
        (0, jsxRuntime.jsx)(ae, {
          className: 'w-44 max-w-none',
          children: (0, jsxRuntime.jsx)(se, {
            value,
            fallbackValue,
            modelCatalog,
            allowDefaultOption: allowDefaultValue,
            defaultOptionLabel: 'Automatic',
            requireVision: info?.requireVision,
            onChange: handleChange,
            children: automatic
              ? (0, jsxRuntime.jsxs)(oe, {
                  children: [
                    (0, jsxRuntime.jsx)(J, {
                      render: (0, jsxRuntime.jsx)('span', {className: 'inline-flex w-full max-w-56'}),
                      children: (0, jsxRuntime.jsx)(ModelField, {iconProvider, disabled}),
                    }),
                    (0, jsxRuntime.jsx)(X, {children: 'Selected automatically'}),
                  ],
                })
              : (0, jsxRuntime.jsx)(ModelField, {iconProvider, disabled}),
          }),
        }),
      ],
    });
  } /** The model field. */,
  ModelField = ({iconProvider, disabled}) =>
    (0, jsxRuntime.jsxs)(U, {
      className: 'w-full max-w-56',
      children: [
        (0, jsxRuntime.jsx)(re, {
          disabled,
          render: ({children, ...props}) =>
            (0, jsxRuntime.jsxs)(T, {
              ...props,
              className: 'min-w-0 shrink grow justify-start text-left',
              variant: 'outline',
              children: [
                iconProvider && (0, jsxRuntime.jsx)(W, {provider: iconProvider, className: 'size-4'}),
                children,
              ],
            }),
        }),
        (0, jsxRuntime.jsx)(ne, {
          disabled,
          render: ({children, ...props}) =>
            (0, jsxRuntime.jsx)(T, {...props, variant: 'outline', size: 'icon', children: (0, jsxRuntime.jsx)(Z, {})}),
        }),
      ],
    }) /** The analytics event of a change. */,
  changeEvent = (type, model) => ({
    type,
    provider: model.provider,
    model: model.modelId,
    thinkingLevel: model.thinkingLevel,
  });
