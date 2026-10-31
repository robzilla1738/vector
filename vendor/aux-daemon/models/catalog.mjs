/** The model registry's catalog side: which models each provider has, the custom models in
 * settings, and the OpenRouter and AI gateway lists. These methods replace the ones of the same
 * name on the supplied ModelsManager, whose instances carry `modelsJson`, `settings`,
 * `remoteCatalog` and `openAICodexModelCatalog`.
 *
 * Nothing here may read `this.credentials`, call a method that does, or carry a key or token: the
 * registry's credential paths stay supplied until the credential store is in scope. That excludes
 * `resolve`, `listAvailable`, `listSupportedAsync`, the settings inventory, routing, image models,
 * catalog refreshes and subscription usage, and also the provider config accessors (a provider's
 * config holds its API key) and the Aux-hosted catalog (it asks for an access token). */
export function create({modelCatalog: m}) {
  const isOpenRouterCustom = (config, catalogIds) => m.isOpenRouterCustomModelConfig(config, catalogIds);
  const unique = ids => [...new Set(ids.map(id => id.trim()).filter(Boolean))];

  const methods = {
    /** One provider's models: its built-in list as the remote catalog and models.json amend it. */
    getBuiltInModels(providerId) {
      if (providerId === 'aux') return [];
      if (providerId === m.GITHUB_COPILOT_PROVIDER_ID) return this.modelsJson.getProviderModels(providerId);
      if (providerId === 'claude-code') {
        const models = m.getClaudeCodeModels();
        return m.applyBuiltInModelOverrides(this.remoteCatalog?.getModels(providerId, models, {catalogBaseline: m.getBuiltinModels('anthropic'), catalogProviderId: 'anthropic'}) ?? models);
      }
      if (m.isAiGatewayProvider(providerId)) return [];
      const catalogProviderId = m.BUILT_IN_CATALOG_ALIASES[providerId] ?? m.STATIC_BUILT_IN_PROVIDER_IDS.find(id => id === providerId);
      if (!catalogProviderId) return [];
      const baseline = m.getBuiltinModels(catalogProviderId), renamed = baseline.map(model => ({...model, provider: providerId}));
      const models = m.applyBuiltInModelOverrides(m.supportsRemoteModelCatalog(providerId) ? this.remoteCatalog?.getModels(providerId, renamed, {catalogBaseline: baseline, catalogProviderId}) ?? renamed : renamed);
      if (providerId === 'openrouter') {
        const custom = this.getOpenRouterCustomModels(), configured = this.modelsJson.configureProviderModels(providerId, models);
        if (!custom.length) return configured;
        const customIds = new Set(custom.map(model => model.id));
        return [...custom, ...configured.filter(model => !customIds.has(model.id))];
      }
      const derived = providerId === 'openai-codex' ? m.deriveOpenAICodexModels(models, this.getBuiltInModels('openai'), this.openAICodexModelCatalog.getCachedModelIds()) : models;
      return this.mergeModelsJsonProviderModels(providerId, this.modelsJson.configureProviderModels(providerId, derived));
    },
    listStaticBuiltInModels() { return m.BUILT_IN_PROVIDER_IDS.flatMap(providerId => this.getBuiltInModels(providerId)); },
    /** Models of the custom providers in models.json. */
    listModelsJsonProviderModels() {
      return this.modelsJson.listProviderModelIds().filter(id => id !== 'openrouter' && !m.BUILT_IN_PROVIDER_ID_SET.has(id) && !m.isUnsupportedProviderId(id) && !m.isAiGatewayProvider(id))
        .flatMap(id => this.modelsJson.getProviderModels(id));
    },
    /** Puts models.json's models for a provider first, each over its listed version. */
    mergeModelsJsonProviderModels(providerId, listed) {
      const own = this.modelsJson.getProviderModels(providerId);
      if (!own.length) return listed;
      const byId = new Map(listed.map(model => [model.id, model])), ownIds = new Set(own.map(model => model.id));
      return [...own.map(model => ({...byId.get(model.id), ...model})), ...listed.filter(model => !ownIds.has(model.id))];
    },
    getModelsJsonProviderModel(providerId, modelId) { return this.modelsJson.getProviderModels(providerId).find(model => model.id === modelId); },
    isDisconnectedProvider(providerId) { return this.modelsJson.getProviderMetadata(providerId, m.PROVIDER_DISCONNECTED_KEY) === true; },
    /** Built-in models new enough to offer, with OpenRouter's and any the user picked. */
    listRecentStaticBuiltInModels(releases) {
      return this.listStaticBuiltInModels().filter(model => model.provider === 'openrouter' || this.modelsJson.getProviderModelIds(model.provider).includes(model.id) || m.isRecentModel(model, releases));
    },
    hasOpenAICodexPlanAccess(modelId) { return this.openAICodexModelCatalog.getCachedModelIds()?.has(modelId) ?? false; },
    hasOpenAICodexModelAccess(modelId) { return this.openAICodexModelCatalog.getCachedModelIds()?.has(modelId) ?? false; },
    getOpenRouterCustomModels(catalogIds) {
      const customModelIds = new Set(this.modelsJson.getProviderModelConfigs('openrouter').filter(config => isOpenRouterCustom(config, catalogIds)).map(config => config.id));
      return this.modelsJson.getProviderModels('openrouter', {customOnly: true, customModelIds});
    },
    findSupportedModel(modelId, providerId) {
      const id = modelId.trim(), provider = providerId?.trim(), matches = this.listSupported().filter(model => model.id === id);
      return provider ? matches.find(model => model.provider === provider) : matches[0];
    },
    listSupported() {
      return [...this.listStaticBuiltInModels().map(model => m.toModelInfo(model)), ...this.listModelsJsonProviderModels().map(model => m.toModelInfo(model, true)),
        ...this.settings.get('customModels').map(model => m.toModelInfo(model, true))];
    },
    hasSupportedModel(modelId, providerId) { return !!this.findSupportedModel(modelId, providerId); },
    /** The ids the remote catalog publishes for each listed provider. */
    listVisibleModelIdsByProvider(providers) {
      const visible = {};
      for (const {providerId} of providers) {
        let ids = this.remoteCatalog?.getVisibleModelIds(providerId, {catalogProviderId: m.BUILT_IN_CATALOG_ALIASES[providerId] ?? (providerId === 'xai-grok-oauth' ? 'xai' : undefined)});
        const planIds = providerId === 'openai-codex' ? this.openAICodexModelCatalog.getCachedModelIds() : undefined;
        if (ids && planIds) {
          const known = ids, extra = (this.remoteCatalog?.getVisibleModelIds('openai') ?? []).filter(id => planIds.has(id) && !known.includes(id));
          ids = m.sortModelsForProvider(providerId, [...ids, ...extra].map(id => ({id, name: id}))).map(model => model.id);
        }
        const filtered = ids?.length ? m.filterVisibleModelIdsForProvider(providerId, ids) : [];
        if (filtered.length) visible[providerId] = providerId === 'xai-grok-oauth' ? [...filtered, m.GROK_COMPOSER_MODEL_ID] : filtered;
      }
      return visible;
    },
    addCustomModel(model) { this.settings.set('customModels', models => [...models.filter(entry => entry.id !== model.id), model]); },
    removeCustomModel(modelId) { this.settings.set('customModels', models => models.filter(entry => entry.id !== modelId)); },
    listOpenRouterModelIds() { return this.modelsJson.getProviderModelIds('openrouter'); },
    listAiGatewayModelIds(providerId) { return this.modelsJson.getProviderModelIds(providerId); },
    /** Saves OpenRouter's picked models, each as the catalog defines it; a custom model stays as it is. */
    async writeOpenRouterModelIds(modelIds) {
      const ids = unique(modelIds), catalog = ids.length ? await m.getOpenRouterCatalogModels(ids) : [];
      const catalogIds = catalog ? new Set(catalog.map(model => model.id)) : undefined, catalogById = new Map(catalog?.map(model => [model.id, model]) ?? []);
      const stored = new Map(this.modelsJson.getProviderModelConfigs('openrouter').map(config => [config.id, config]));
      const generated = catalog ? m.getGeneratedOpenRouterModelIds() : new Set, configs = [], missing = [];
      for (const id of ids) {
        const config = stored.get(id);
        if (isOpenRouterCustom(config, catalogIds)) {
          configs.push(config);
          continue;
        }
        const model = catalogById.get(id);
        if (model) configs.push({...m.toModelsJsonModelConfig(model, config), [m.OPENROUTER_MODEL_CONFIG_SOURCE_KEY]: m.OPENROUTER_CATALOG_MODEL_SOURCE});
        else if (!catalog || !generated.has(id) && config?.[m.OPENROUTER_MODEL_CONFIG_SOURCE_KEY] !== m.OPENROUTER_CATALOG_MODEL_SOURCE) missing.push(id);
      }
      if (missing.length) throw Error(`OpenRouter model definitions not found: ${missing.join(', ')}`);
      this.modelsJson.setProviderModelConfigs('openrouter', configs, m.OPENROUTER_MODELS_JSON_DEFAULTS);
    },
    filterOpenRouterModels(models) {
      const picked = new Set(this.listOpenRouterModelIds());
      return models.filter(model => model.provider !== 'openrouter' || picked.has(model.id));
    },
    filterAiGatewayModels(models) {
      const picked = new Map(m.getAiGatewayProviderIds().map(providerId => [providerId, new Set(this.listAiGatewayModelIds(providerId))]));
      return models.filter(model => m.isAiGatewayProvider(model.provider) ? picked.get(model.provider)?.has(model.id) ?? false : true);
    },
  };

  return {methods, adopt(ModelsManager) { Object.assign(ModelsManager.prototype, methods); }};
}
