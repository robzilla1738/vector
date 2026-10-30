/* Aux-owned source, model select pass 3 (assets/model-select-BvZsM1Kl.js, between the select's
 * context and the menus): the model select provider. It groups the catalog's models by provider
 * (skipping signed-out ones, optionally only vision models, and the free Aux provider when another is
 * signed in), resolves the selected model, picks the first available one when nothing is chosen, and
 * reports a saved proactive mode, which Aux no longer offers, so the caller clears it.
 * Names the rest of the chunk uses keep their chunk names: vr ModelSelect (exported as t).
 * Chunk names used: d React, e JSX runtime, Ue the model catalog hook, ge the nearest level, and Me,
 * Je, je, ye, Se from the other passes. */
vr = ({
  value,
  fallbackValue,
  modelCatalog,
  allowDefaultOption = false,
  defaultOptionLabel = 'Default model',
  hideFreeAuxProvider = true,
  proactiveMode = false,
  unavailableValueLabel,
  requireVision = false,
  children,
  onChange,
  onInvalidProactiveMode,
}) => {
  const [j, F] = (0, d.useState)(false),
    [C, B] = (0, d.useState)(false),
    L = (0, d.useRef)(void 0),
    I = (0, d.useRef)(void 0),
    g = Ue({loadModelCatalog: true}),
    {providerOptions, modelsByProvider, models} = modelCatalog ?? {
      providerOptions: g.providerOptions,
      modelsByProvider: g.modelsByProvider,
      models: g.availableModels,
    },
    f = modelCatalog ? false : g.isLoading,
    b = j && f,
    E = !modelCatalog && g.isModelCatalogError,
    {effectiveValue, isUsingDefaultValue} = Je(value, fallbackValue, allowDefaultOption),
    _ = (0, d.useMemo)(() => {
      const n = new Map();
      for (const l of models) {
        const v = l.provider,
          $ = n.get(v) ?? new Set();
        ($.add(l.id), n.set(v, $));
      }
      return n;
    }, [models]),
    R = (0, d.useMemo)(
      () =>
        providerOptions.reduce((n, l) => {
          if (l.state === 'auth-expired') return n;
          const v = _.get(l.id);
          if (!v) return n;
          const $ = (modelsByProvider[l.id] ?? []).filter(ae =>
            v.has(ae.id) ? !requireVision || ae.supportsVision : false,
          );
          return ($.length && (n[l.id] = $), n);
        }, {}),
      [_, modelsByProvider, providerOptions, requireVision],
    ),
    O = (0, d.useMemo)(() => {
      const n = providerOptions
        .filter(l => l.state === 'auth-expired' || !!R[l.id]?.length)
        .toSorted((l, v) => l.name.localeCompare(v.name));
      return hideFreeAuxProvider &&
        n.length === 2 &&
        g.subscriptionPlan === 'free' &&
        n.some(l => l.id === 'aux') &&
        n.some(l => l.id !== 'aux' && l.state === 'active')
        ? n.filter(l => l.id !== 'aux')
        : n;
    }, [g.subscriptionPlan, hideFreeAuxProvider, providerOptions, R]),
    w = (0, d.useMemo)(() => {
      const n = effectiveValue?.provider;
      if (
        !n ||
        !effectiveValue?.modelId ||
        !O.some(v => v.id === n) ||
        !models.some(v => v.provider === n && v.id === effectiveValue.modelId)
      )
        return null;
      const l = modelsByProvider[n]?.find(v => v.id === effectiveValue.modelId);
      return !l || (requireVision && !l.supportsVision)
        ? null
        : {
            provider: n,
            modelId: l.id,
            modelShortName: l.shortName,
            thinkingLevel: ge(effectiveValue.thinkingLevel, l.availableThinkingLevels),
            fastMode: l.supportsFastMode ? !!effectiveValue.fastMode : false,
            supportsFastMode: l.supportsFastMode,
            availableThinkingLevels: l.availableThinkingLevels,
          };
    }, [models, effectiveValue, modelsByProvider, requireVision, O]),
    D = models.find(n => O.some(l => l.id === n.provider) && R[n.provider]?.some(l => l.id === n.id)),
    A = !proactiveMode || !w,
    s = w ? `${w.provider}:${w.modelId}:${w.thinkingLevel}:${proactiveMode}` : `none:${proactiveMode}`,
    x = n => {
      (F(n), n && !modelCatalog && g.refetchModelCatalog());
    };
  return (
    (0, d.useEffect)(() => {
      if (w || (allowDefaultOption && value === null) || unavailableValueLabel) {
        L.current = void 0;
        return;
      }
      if (f || !D) return;
      const n = `${D.provider}:${D.id}`;
      L.current !== n && ((L.current = n), onChange(Se(D)));
    }, [allowDefaultOption, D, f, onChange, w, unavailableValueLabel, value]),
    (0, d.useEffect)(() => {
      if (A) {
        I.current = void 0;
        return;
      }
      I.current !== s && ((I.current = s), onInvalidProactiveMode?.());
    }, [A, onInvalidProactiveMode, s]),
    (0, e.jsx)(Me, {
      value: {
        allowDefaultOption,
        isAvailableModelsLoading: b,
        isAvailableModelsError: E,
        retryAvailableModels: () => {
          g.refetchModelCatalog();
        },
        isUsingDefaultValue,
        isOpen: j,
        isThinkingOpen: C,
        defaultOptionLabel,
        selectableProviders: O,
        selectedModel: w,
        unavailableValueLabel,
        proactiveMode,
        getModels: n => R[n] ?? [],
        isModelSelected: (n, l) => !isUsingDefaultValue && value?.provider === n && value.modelId === l,
        onOpenChange: x,
        onThinkingOpenChange: B,
        onChange,
      },
      children,
    })
  );
}
