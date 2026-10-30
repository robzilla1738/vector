/* Aux-owned source: the Appearance settings (assets/appearance-Ceuw3-j6.js): theme, tab style,
 * transparency, sidebar and tab rows, zoom, and the Aux theme editor and frame rows
 * (those Aux* functions came from earlier integrations and keep their names). Exports keep their
 * chunk names: Za AppearanceSettings, la TransparencyPicker, pa TabStylePicker, ma ThemeSelect,
 * sa NewTabPositionSelect, Ta TabSwitcherOrderSelect, ra/da the API checks.
 * Imports used here (the import statement above stays as supplied): browser-color-scheme se JSX
 * runtime, X interop, $ React, B cn, ae/re/ee theme read/write/initial; translate-status te useTheme;
 * error-tracking ne spinner; strip-markdown m useQuery, x useMutation, f useQueryClient, j analytics,
 * ie useApp, oe useOs, le fetch, Q section, de/ue/ce/me field parts; queries ge useTRPC; schemas H
 * string, I object, F array, L number, Ne boolean, _e/Be zod helpers; select _ Select, E trigger,
 * P value, k content, y item; settings layout b label, h row, p trailing, V group, Q section; tooltip
 * q/R/D; dialog De/Fe/Oe/Ve/Re/Ae; textarea Ie; switch ze; button N; dist w toast; utils u/g the
 * browser preferences API, C tab-style query, Ee apply tab style; react-hook-form je/we/Te/ve;
 * use-update-settings He; icons ye/xe light and dark, Pe sliders, Se arrow, Ce bookmark;
 * chrome-link Me.
 * Aux change: the frame settings' error line uses the destructive token like every other alert,
 * instead of a fixed red. */
var jsxRuntime = se(),
  SystemThemeIcon = ({size = 24, ariaHidden = true, ...props}) =>
    (0, jsxRuntime.jsx)('svg', {
      viewBox: '0 0 24 24',
      fill: 'none',
      xmlns: 'http://www.w3.org/2000/svg',
      width: size,
      height: size,
      'aria-hidden': ariaHidden,
      focusable: 'false',
      ...props,
      children: (0, jsxRuntime.jsx)('path', {
        d: 'M20 8C20 6.89542 19.1046 6 18 6H6C4.89543 6 4 6.89543 4 8V14C4 15.1046 4.89542 16 6 16H18C19.1046 16 20 15.1046 20 14V8ZM10 19H14V18H10V19ZM22 14C22 16.2092 20.2092 18 18 18H16V20C16 20.5523 15.5523 21 15 21H9C8.44772 21 8 20.5523 8 20V18H6C3.79088 18 2 16.2092 2 14V8C2 5.79087 3.79087 4 6 4H18C20.2092 4 22 5.79088 22 8V14Z',
        fill: 'currentColor',
      }),
    }),
  React = X($(), 1),
  NEW_YORK_IMAGE = '/assets/new-york-SlpCEVDa.png',
  SAN_FRANCISCO_IMAGE = '/assets/san-francisco-4-TvRq9c.png',
  NEW_TAB_POSITION_QUERY = ['browserPreferences', 'verticalTabInsertionPosition'],
  ra = () => {
    const api = u();
    return !!(api?.getVerticalTabInsertionPosition && api?.setVerticalTabInsertionPosition);
  },
  sa = ({value, disabled, onValueChange}) =>
    (0, jsxRuntime.jsxs)(h, {
      children: [
        (0, jsxRuntime.jsx)(b, {
          title: 'New tab position',
          description: 'Choose where new tabs are added in the sidebar.',
        }),
        (0, jsxRuntime.jsx)(p, {
          children: (0, jsxRuntime.jsxs)(_, {
            disabled,
            value,
            onValueChange: next => next !== null && onValueChange(next),
            children: [
              (0, jsxRuntime.jsx)(E, {
                className: 'w-full',
                'aria-label': 'New tab position',
                children: (0, jsxRuntime.jsx)(P, {}),
              }),
              (0, jsxRuntime.jsxs)(k, {
                children: [
                  (0, jsxRuntime.jsx)(y, {value: 'top', children: 'At top'}),
                  (0, jsxRuntime.jsx)(y, {value: 'bottom', children: 'At bottom'}),
                ],
              }),
            ],
          }),
        }),
      ],
    }) /** Where new tabs go in the sidebar, when the browser supports it. */,
  NewTabPositionSetting = () => {
    const {capture} = j(),
      queryClient = f(),
      available = ra(),
      {data: position} = m({
        queryKey: NEW_TAB_POSITION_QUERY,
        queryFn: () => {
          const api = u();
          if (!api?.getVerticalTabInsertionPosition)
            throw new Error('chrome.auxBrowserPreferences.getVerticalTabInsertionPosition API is unavailable');
          return api.getVerticalTabInsertionPosition();
        },
        enabled: available,
      }),
      mutation = x({
        mutationFn: async next => {
          const api = u();
          if (!api?.setVerticalTabInsertionPosition)
            throw new Error('chrome.auxBrowserPreferences.setVerticalTabInsertionPosition API is unavailable');
          return (await api.setVerticalTabInsertionPosition(next), next);
        },
        onSuccess: next => {
          (queryClient.setQueryData(NEW_TAB_POSITION_QUERY, next),
            capture('settings.appearance.set-vertical-tab-insertion-position', {value: next}));
        },
        onError: error => {
          w.error(error instanceof Error ? error.message : 'Could not update new tab position.');
        },
      });
    return available
      ? (0, jsxRuntime.jsx)(sa, {
          value: position ?? 'top',
          disabled: position === void 0 || mutation.isPending,
          onValueChange: next => next !== position && mutation.mutate(next),
        })
      : null;
  },
  TINTED_IMAGE = '/assets/tinted-BSuc_1E5.png',
  TRANSPARENT_IMAGE = '/assets/transparent-CXfoICJ5.png',
  VIBRANCY_QUERY = [
    'browserPreferences',
    'windowBackgroundVibrancyEnabled',
  ] /** Window transparency (macOS): tinted or Liquid Glass. */,
  TransparencySetting = () => {
    const [fallback, setFallback] = (0, React.useState)(true),
      {os} = oe(),
      {capture} = j(),
      queryClient = f(),
      available = da(),
      {data: enabled} = m({
        queryKey: VIBRANCY_QUERY,
        queryFn: () => {
          const api = u();
          if (!api?.getWindowBackgroundVibrancyEnabled)
            throw new Error('chrome.auxBrowserPreferences.getWindowBackgroundVibrancyEnabled API is unavailable');
          return api.getWindowBackgroundVibrancyEnabled();
        },
        enabled: available,
      }),
      mutation = x({
        mutationFn: async next => {
          const api = u();
          return (
            api?.setWindowBackgroundVibrancyEnabled && (await api.setWindowBackgroundVibrancyEnabled(next)),
            next
          );
        },
        onSuccess: next => {
          (setFallback(next),
            queryClient.setQueryData(VIBRANCY_QUERY, next),
            capture('settings.appearance.set-window-background-vibrancy-enabled', {value: next}));
        },
        onError: error => {
          w.error(error instanceof Error ? error.message : 'Could not update window transparency.');
        },
      });
    return os !== 'macos' || !available
      ? null
      : (0, jsxRuntime.jsx)(la, {value: enabled ?? fallback, onValueChange: next => mutation.mutate(next)});
  } /** TransparencyPicker: the two transparency thumbnails. */,
  la = ({value, disabled, onValueChange}) => {
    const choose = value => () => {
      onValueChange(value);
    };
    return (0, jsxRuntime.jsxs)(h, {
      className: 'items-start',
      children: [
        (0, jsxRuntime.jsx)(b, {title: 'Transparency'}),
        (0, jsxRuntime.jsx)(p, {
          className: 'max-w-none shrink-0',
          children: (0, jsxRuntime.jsx)('div', {
            className: 'flex items-start gap-4',
            children: TRANSPARENCY_OPTIONS.map(option => {
              const selected = option.value === value;
              return (0, jsxRuntime.jsxs)(
                q,
                {
                  children: [
                    (0, jsxRuntime.jsx)(R, {
                      render: (0, jsxRuntime.jsx)('span', {className: 'inline-flex'}),
                      children: (0, jsxRuntime.jsxs)('button', {
                        type: 'button',
                        'aria-pressed': selected,
                        disabled,
                        className: B(
                          'group/window-transparency flex flex-col items-center gap-1.5 rounded-lg font-medium transition-colors outline-none disabled:pointer-events-none disabled:opacity-50',
                          selected ? 'text-foreground font-semibold' : 'text-muted-foreground hover:text-foreground',
                        ),
                        onClick: choose(option.value),
                        children: [
                          (0, jsxRuntime.jsx)('span', {
                            className: B(
                              'group-focus-visible/window-transparency:border-ring group-focus-visible/window-transparency:ring-ring/50 w-18 overflow-hidden rounded-md border border-transparent transition-[border-color,box-shadow] group-focus-visible/window-transparency:ring-3',
                              selected && 'ring-brand/30 border-transparent ring-3',
                            ),
                            children: (0, jsxRuntime.jsx)('img', {
                              src: option.image,
                              alt: '',
                              className: 'pointer-events-none size-full w-18 object-cover select-none',
                            }),
                          }),
                          (0, jsxRuntime.jsx)('span', {
                            className: 'mt-0.5 text-xs leading-none',
                            children: option.label,
                          }),
                        ],
                      }),
                    }),
                    (0, jsxRuntime.jsx)(D, {
                      sideOffset: 8,
                      className: 'max-w-48',
                      children: (0, jsxRuntime.jsx)('span', {children: option.tooltip}),
                    }),
                  ],
                },
                option.id,
              );
            }),
          }),
        }),
      ],
    });
  },
  TRANSPARENCY_OPTIONS = [
    {
      id: 'tinted',
      value: false,
      label: 'Tinted',
      tooltip: 'Reduce window transparency. Improves performance',
      image: TINTED_IMAGE,
    },
    {
      id: 'transparent',
      value: true,
      label: 'Transparent',
      tooltip: 'Use Liquid Glass effect',
      image: TRANSPARENT_IMAGE,
    },
  ],
  da = () => {
    const api = u();
    return !!(api?.getWindowBackgroundVibrancyEnabled && api?.setWindowBackgroundVibrancyEnabled);
  } /** AppearanceSettings: the Appearance page’s sections. */,
  Za = () =>
    (0, jsxRuntime.jsxs)(jsxRuntime.Fragment, {
      children: [
        (0, jsxRuntime.jsxs)(Q, {
          label: 'Appearance',
          children: [
            (0, jsxRuntime.jsxs)(V, {
              children: [
                (0, jsxRuntime.jsx)(ThemeSetting, {}),
                (0, jsxRuntime.jsx)(ZoomSetting, {}),
                (0, jsxRuntime.jsx)(AuxFullUrlSetting, {}),
                (0, jsxRuntime.jsx)(AuxThemeEditorSetting, {}),
                (0, jsxRuntime.jsx)(AuxFrameSettings, {}),
                (0, jsxRuntime.jsx)(TabStyleSetting, {}),
                (0, jsxRuntime.jsx)(TransparencySetting, {}),
              ],
            }),
            (0, jsxRuntime.jsxs)(V, {
              children: [
                (0, jsxRuntime.jsx)(WhenTabStyle, {
                  style: 'horizontal',
                  children: (0, jsxRuntime.jsx)(TabShrinkSetting, {}),
                }),
                (0, jsxRuntime.jsxs)(WhenTabStyle, {
                  style: 'vertical',
                  children: [
                    (0, jsxRuntime.jsx)(NewTabPositionSetting, {}),
                    (0, jsxRuntime.jsx)(BookmarksSectionSetting, {}),
                  ],
                }),
              ],
            }),
          ],
        }),
        (0, jsxRuntime.jsx)(Q, {
          title: 'Tabs',
          children: (0, jsxRuntime.jsxs)(V, {
            children: [(0, jsxRuntime.jsx)(TabSwitcherOrderSetting, {}), (0, jsxRuntime.jsx)(AdvancedLink, {})],
          }),
        }),
      ],
    }) /** Theme: system, light or dark; reverts if saving fails. */,
  ThemeSetting = () => {
    const {capture} = j(),
      {setTheme, theme} = te(),
      queryClient = f(),
      {data: value} = m({queryKey: THEME_QUERY, queryFn: ae, initialData: () => ee() ?? 'system'}),
      mutation = x({
        mutationFn: re,
        onMutate: async () => ({previousTheme: theme, previousValue: value}),
        onError: (error, variables, context) => {
          const previous = context?.previousValue ?? 'system';
          (queryClient.setQueryData(THEME_QUERY, previous), setTheme(context?.previousTheme ?? previous));
        },
        onSuccess: next => {
          (capture('settings.appearance.set-theme', {value: next}),
            setTheme(next),
            queryClient.setQueryData(THEME_QUERY, next));
        },
      }),
      change = next => {
        next === null || next === value || mutation.mutate(next);
      };
    return (0, jsxRuntime.jsx)(ma, {value, disabled: mutation.isPending, onValueChange: change});
  },
  ma = ({value, disabled, onValueChange}) =>
    (0, jsxRuntime.jsxs)(h, {
      children: [
        (0, jsxRuntime.jsx)(b, {title: 'Theme', description: 'Choose how Aux looks'}),
        (0, jsxRuntime.jsx)(p, {
          children: (0, jsxRuntime.jsxs)(_, {
            disabled,
            value,
            onValueChange: next => next !== null && onValueChange(next),
            children: [
              (0, jsxRuntime.jsx)(E, {
                className: 'w-full',
                'aria-label': 'Theme',
                children: (0, jsxRuntime.jsx)(P, {placeholder: 'Select..'}),
              }),
              (0, jsxRuntime.jsx)(k, {
                children: THEMES.map(option =>
                  (0, jsxRuntime.jsx)(
                    y,
                    {
                      value: option.value,
                      children: (0, jsxRuntime.jsxs)('div', {
                        className: 'flex items-center gap-1.5',
                        children: [
                          (0, jsxRuntime.jsx)(option.icon, {className: 'text-muted-foreground'}),
                          (0, jsxRuntime.jsx)('span', {children: option.label}),
                        ],
                      }),
                    },
                    option.value,
                  ),
                ),
              }),
            ],
          }),
        }),
      ],
    }),
  THEMES = [
    {value: 'system', label: 'System', icon: SystemThemeIcon},
    {value: 'light', label: 'Light', icon: ye},
    {value: 'dark', label: 'Dark', icon: xe},
  ],
  THEME_QUERY = [
    'browserPreferences',
    'browserColorScheme',
  ] /** Tab style: vertical (New York) or horizontal (San Francisco). */,
  TabStyleSetting = () => {
    const [fallback, setFallback] = (0, React.useState)('vertical'),
      {capture} = j(),
      queryClient = f(),
      available = !!u(),
      {data: style} = m({queryKey: C, queryFn: () => g().getTabStyle(), enabled: available}),
      mutation = x({
        mutationFn: async next => {
          const api = u();
          return (api && (await api.setTabStyle(next)), next);
        },
        onSuccess: next => {
          (setFallback(next),
            queryClient.setQueryData(C, next),
            Ee(next),
            capture('settings.appearance.set-tab-style', {
              value: next === 'horizontal' ? 'san-francisco' : 'new-york',
            }));
        },
      });
    return (0, jsxRuntime.jsx)(pa, {
      value: available ? (style ?? fallback) : fallback,
      onValueChange: next => mutation.mutate(next),
    });
  } /** TabStylePicker: the two tab-style thumbnails. */,
  pa = ({value, disabled, onValueChange}) => {
    const choose = value => () => {
      onValueChange(value);
    };
    return (0, jsxRuntime.jsxs)(h, {
      className: 'items-start',
      children: [
        (0, jsxRuntime.jsx)(b, {title: 'Tab style'}),
        (0, jsxRuntime.jsx)(p, {
          className: 'max-w-none shrink-0',
          children: (0, jsxRuntime.jsx)('div', {
            className: 'flex items-start gap-4',
            children: TAB_STYLES.map(option => {
              const selected = option.value === value;
              return (0, jsxRuntime.jsxs)(
                q,
                {
                  children: [
                    (0, jsxRuntime.jsx)(R, {
                      render: (0, jsxRuntime.jsx)('span', {className: 'inline-flex'}),
                      children: (0, jsxRuntime.jsxs)('button', {
                        type: 'button',
                        'aria-pressed': selected,
                        disabled,
                        className: B(
                          'group/tab-style flex flex-col items-center gap-1.5 rounded-lg font-medium transition-colors outline-none disabled:pointer-events-none disabled:opacity-50',
                          selected ? 'text-foreground font-semibold' : 'text-muted-foreground hover:text-foreground',
                        ),
                        onClick: choose(option.value),
                        children: [
                          (0, jsxRuntime.jsx)('span', {
                            className: B(
                              'group-focus-visible/tab-style:border-ring group-focus-visible/tab-style:ring-ring/50 w-18 overflow-hidden rounded-md border border-transparent transition-[border-color,box-shadow] group-focus-visible/tab-style:ring-3',
                              selected && 'border-transparent ring-3',
                              selected && option.value === 'vertical' && 'ring-orange-400/30',
                              selected && option.value === 'horizontal' && 'ring-sky-400/30',
                            ),
                            children: (0, jsxRuntime.jsx)('img', {
                              src: option.image,
                              alt: '',
                              className: 'pointer-events-none size-full w-18 object-cover select-none',
                            }),
                          }),
                          (0, jsxRuntime.jsx)('span', {
                            className: 'mt-0.5 text-xs leading-none',
                            children: option.label,
                          }),
                        ],
                      }),
                    }),
                    (0, jsxRuntime.jsx)(D, {
                      sideOffset: 8,
                      className: 'max-w-48',
                      children: (0, jsxRuntime.jsx)('span', {children: option.tooltip}),
                    }),
                  ],
                },
                option.value,
              );
            }),
          }),
        }),
      ],
    });
  },
  TAB_STYLES = [
    {
      value: 'horizontal',
      label: 'San Francisco',
      tooltip: 'Horizontal tabs. Shows tabs in the top bar',
      image: SAN_FRANCISCO_IMAGE,
    },
    {
      value: 'vertical',
      label: 'New York',
      tooltip: 'Vertical tabs. Shows tabs in the left sidebar',
      image: NEW_YORK_IMAGE,
    },
  ] /** Shows its children only with the given tab style. */,
  WhenTabStyle = ({style, children}) => {
    const available = !!u(),
      {data: tabStyle} = m({queryKey: C, queryFn: () => g().getTabStyle(), enabled: available});
    return tabStyle !== style ? null : (0, jsxRuntime.jsx)(jsxRuntime.Fragment, {children});
  },
  TAB_SHRINK_QUERY = [
    'browserPreferences',
    'horizontalTabShrinkEnabled',
  ] /** Shrink tabs to fit (horizontal tabs only). */,
  TabShrinkSetting = () => {
    const {capture} = j(),
      queryClient = f(),
      api = u(),
      available = !!(api?.getHorizontalTabShrinkEnabled && api?.setHorizontalTabShrinkEnabled),
      {data: tabStyle} = m({queryKey: C, queryFn: () => g().getTabStyle(), enabled: available}),
      {data: enabled = false} = m({
        queryKey: TAB_SHRINK_QUERY,
        queryFn: () => {
          const api = u();
          if (!api?.getHorizontalTabShrinkEnabled)
            throw new Error('chrome.auxBrowserPreferences.getHorizontalTabShrinkEnabled API is unavailable');
          return api.getHorizontalTabShrinkEnabled();
        },
        enabled: available && tabStyle === 'horizontal',
      }),
      mutation = x({
        mutationFn: async next => {
          const api = u();
          if (!api?.setHorizontalTabShrinkEnabled)
            throw new Error('chrome.auxBrowserPreferences.setHorizontalTabShrinkEnabled API is unavailable');
          return (await api.setHorizontalTabShrinkEnabled(next), next);
        },
        onMutate: next => {
          const previous = queryClient.getQueryData(TAB_SHRINK_QUERY);
          return (queryClient.setQueryData(TAB_SHRINK_QUERY, next), {previousValue: previous});
        },
        onSuccess: next => {
          (queryClient.setQueryData(TAB_SHRINK_QUERY, next),
            capture('settings.appearance.set-horizontal-tab-shrink-enabled', {value: next}));
        },
        onError: (error, variables, context) => {
          (context?.previousValue !== void 0 && queryClient.setQueryData(TAB_SHRINK_QUERY, context.previousValue),
            w.error(error instanceof Error ? error.message : 'Could not update tab shrink setting.'));
        },
      });
    return !available || tabStyle !== 'horizontal'
      ? null
      : (0, jsxRuntime.jsxs)(h, {
          children: [
            (0, jsxRuntime.jsx)(b, {
              title: 'Shrink tabs to fit',
              description: 'Tabs shrink to fit as the tab bar fills up.',
            }),
            (0, jsxRuntime.jsx)(p, {
              children: (0, jsxRuntime.jsx)(ze, {
                checked: enabled,
                disabled: mutation.isPending,
                onCheckedChange: next => mutation.mutate(next),
              }),
            }),
          ],
        });
  },
  ZOOM_LEVELS = [
    0.25,
    1 / 3,
    0.5,
    2 / 3,
    0.75,
    0.8,
    0.9,
    1,
    1.1,
    1.25,
    1.5,
    1.75,
    2,
    2.5,
    3,
    4,
    5,
  ] /** Default page zoom. */,
  ZoomSetting = () => {
    const [fallback, setFallback] = (0, React.useState)(1),
      queryClient = f(),
      available = !!u(),
      {data: zoom} = m({
        queryKey: ['browserPreferences', 'defaultZoom'],
        queryFn: () => g().getDefaultZoom(),
        enabled: available,
      }),
      mutation = x({
        mutationFn: async next => {
          const api = u();
          return (api && (await api.setDefaultZoom(next)), next);
        },
        onSuccess: next => {
          (setFallback(next), queryClient.setQueryData(['browserPreferences', 'defaultZoom'], next));
        },
      }),
      level = available ? (ZOOM_LEVELS.find(candidate => Math.abs(candidate - (zoom ?? 1)) < 0.001) ?? 1) : fallback;
    return (0, jsxRuntime.jsx)(fa, {value: level, onValueChange: next => next !== level && mutation.mutate(next)});
  },
  fa = ({value, disabled, onValueChange}) =>
    (0, jsxRuntime.jsxs)(h, {
      children: [
        (0, jsxRuntime.jsx)(b, {title: 'Zoom level'}),
        (0, jsxRuntime.jsx)(p, {
          children: (0, jsxRuntime.jsxs)(_, {
            value,
            disabled,
            onValueChange: next => next !== null && onValueChange(next),
            children: [
              (0, jsxRuntime.jsx)(E, {
                className: 'w-full',
                'aria-label': 'Zoom level',
                children: (0, jsxRuntime.jsx)(P, {placeholder: 'Select..'}),
              }),
              (0, jsxRuntime.jsx)(k, {
                children: ZOOM_LEVELS.map(level =>
                  (0, jsxRuntime.jsx)(y, {value: level, children: `${Math.round(level * 100)}%`}, level),
                ),
              }),
            ],
          }),
        }),
      ],
    }),
  BOOKMARKS_SECTION_QUERY = ['browserPreferences', 'verticalTabsBookmarksSectionEnabled'],
  hasBookmarksSectionApi = () => {
    const api = u();
    return !!(api?.getVerticalTabsBookmarksSectionEnabled && api?.setVerticalTabsBookmarksSectionEnabled);
  } /** Bookmarks above the tabs (vertical tabs only). */,
  BookmarksSectionSetting = () => {
    const {capture} = j(),
      queryClient = f(),
      available = hasBookmarksSectionApi(),
      {data: tabStyle} = m({queryKey: C, queryFn: () => g().getTabStyle(), enabled: available}),
      {data: enabled} = m({
        queryKey: BOOKMARKS_SECTION_QUERY,
        queryFn: () => g().getVerticalTabsBookmarksSectionEnabled(),
        enabled: available && tabStyle === 'vertical',
      }),
      mutation = x({
        mutationFn: async next => (await g().setVerticalTabsBookmarksSectionEnabled(next), next),
        onMutate: next => {
          const previous = queryClient.getQueryData(BOOKMARKS_SECTION_QUERY);
          return (queryClient.setQueryData(BOOKMARKS_SECTION_QUERY, next), {previousValue: previous});
        },
        onSuccess: next => {
          (queryClient.setQueryData(BOOKMARKS_SECTION_QUERY, next),
            capture('settings.appearance.set-vertical-tabs-bookmarks-section-enabled', {value: next}));
        },
        onError: (error, variables, context) => {
          (context?.previousValue !== void 0 &&
            queryClient.setQueryData(BOOKMARKS_SECTION_QUERY, context.previousValue),
            w.error(error instanceof Error ? error.message : 'Could not update bookmarks section setting.'));
        },
      });
    if (!available || tabStyle !== 'vertical') return null;
    const checked = enabled ?? true,
      disabled = enabled === void 0 || mutation.isPending;
    return (0, jsxRuntime.jsxs)(h, {
      children: [
        (0, jsxRuntime.jsx)(b, {
          title: 'Bookmarks in the sidebar',
          description: 'Show your bookmarks above your tabs.',
        }),
        (0, jsxRuntime.jsx)(p, {
          children: (0, jsxRuntime.jsx)(ze, {checked, disabled, onCheckedChange: next => mutation.mutate(!!next)}),
        }),
      ],
    });
  },
  TAB_SWITCHER_ORDER_QUERY = [
    'browserPreferences',
    'tabSwitcherSortByRecentlyUsed',
  ] /** Tab switcher order: recently used or tab order. */,
  TabSwitcherOrderSetting = () => {
    const {capture} = j(),
      queryClient = f(),
      api = u(),
      available = !!(api?.getTabSwitcherSortByRecentlyUsed && api?.setTabSwitcherSortByRecentlyUsed),
      {data: byRecentUse} = m({
        queryKey: TAB_SWITCHER_ORDER_QUERY,
        queryFn: () => g().getTabSwitcherSortByRecentlyUsed(),
        enabled: available,
      }),
      mutation = x({
        mutationFn: async next => (await g().setTabSwitcherSortByRecentlyUsed(next), next),
        onSuccess: next => {
          (queryClient.setQueryData(TAB_SWITCHER_ORDER_QUERY, next),
            capture('settings.appearance.set-tab-switcher-sort-by-recently-used', {value: next}));
        },
        onError: error => {
          w.error(error instanceof Error ? error.message : 'Could not update tab switcher order.');
        },
      });
    return available
      ? (0, jsxRuntime.jsx)(Ta, {
          value: byRecentUse ?? true,
          disabled: byRecentUse === void 0 || mutation.isPending,
          onValueChange: next => next !== byRecentUse && mutation.mutate(next),
        })
      : null;
  },
  Ta = ({value, disabled, onValueChange}) =>
    (0, jsxRuntime.jsxs)(h, {
      children: [
        (0, jsxRuntime.jsx)(b, {
          title: 'Tab switcher order',
          description: 'Choose how tabs are ordered when switching.',
        }),
        (0, jsxRuntime.jsx)(p, {
          children: (0, jsxRuntime.jsxs)(_, {
            disabled,
            value,
            onValueChange: next => next !== null && onValueChange(next),
            children: [
              (0, jsxRuntime.jsx)(E, {
                className: 'w-full',
                'aria-label': 'Tab switcher order',
                children: (0, jsxRuntime.jsx)(P, {}),
              }),
              (0, jsxRuntime.jsxs)(k, {
                children: [
                  (0, jsxRuntime.jsx)(y, {value: true, children: 'Recently used'}),
                  (0, jsxRuntime.jsx)(y, {value: false, children: 'Tab order'}),
                ],
              }),
            ],
          }),
        }),
      ],
    }),
  AdvancedLink = () =>
    (0, jsxRuntime.jsxs)(qe, {
      render: (0, jsxRuntime.jsx)(Me, {className: 'group', to: 'aux://settings/appearance'}),
      children: [
        (0, jsxRuntime.jsx)(b, {title: 'Advanced'}),
        (0, jsxRuntime.jsx)(Se, {className: 'text-muted-foreground mx-1 size-4'}),
      ],
    });
const AuxFullUrlSetting = () => {
  const client = f(),
    key = ['browserPreferences', 'alwaysShowFullUrl'],
    available = typeof u()?.getAlwaysShowFullUrl === 'function';
  const value = m({queryKey: key, queryFn: () => u().getAlwaysShowFullUrl(), enabled: available});
  const mutation = x({
    mutationFn: async next => {
      await u().setAlwaysShowFullUrl(next);
      return next;
    },
    onSuccess: next => client.setQueryData(key, next),
    onError: error => w.error(error instanceof Error ? error.message : 'Could not update URL display.'),
  });
  return (0, jsxRuntime.jsxs)(h, {
    children: [
      (0, jsxRuntime.jsx)(b, {title: 'Always show full URL', description: 'Show the complete address in the URL bar.'}),
      (0, jsxRuntime.jsx)(p, {
        children: (0, jsxRuntime.jsx)(ze, {
          checked: value.data ?? false,
          disabled: !available || value.data === undefined || mutation.isPending,
          onCheckedChange: next => mutation.mutate(next),
        }),
      }),
    ],
  });
};
function parseAuxThemeImport(text) {
  if (typeof text !== 'string' || new TextEncoder().encode(text).length > 4096)
    throw Error('Choose an Aux theme file smaller than 4 KiB.');
  const envelope = JSON.parse(text);
  if (
    !envelope ||
    Array.isArray(envelope) ||
    envelope.format !== 'aux-theme' ||
    envelope.version !== 1 ||
    Object.keys(envelope).some(key => !['format', 'version', 'tokens'].includes(key)) ||
    !envelope.tokens ||
    typeof envelope.tokens !== 'object' ||
    Array.isArray(envelope.tokens)
  )
    throw Error('This is not an Aux theme preset.');
  // Native validation is authoritative: unknown fields, CSS, assets and
  // out-of-range values cannot reach a color/material consumer.
  return envelope.tokens;
}
function createAuxThemeSession(api, onState, onError) {
  let state = null,
    closed = false,
    chain = Promise.resolve();
  const methods = new Set([
    'previewTheme',
    'applyTheme',
    'resetTheme',
    'saveThemePreset',
    'deleteThemePreset',
    'exportThemePreset',
  ]);
  const accept = result => {
    if (!result?.success) throw Error(result?.error || 'Could not update the theme.');
    if (result.revision) state = result;
    if (!closed && result.revision) onState(result);
    return result;
  };
  const enqueue = action => {
    const next = chain.then(action);
    chain = next.catch(() => {});
    next.catch(error => {
      if (!closed) onError(error.message);
    });
    return next;
  };
  return {
    load: () => enqueue(async () => (closed ? null : accept(await api.getThemeState()))),
    run: (method, input = {}) =>
      enqueue(async () => {
        if (closed) return null;
        if (!methods.has(method) || !state) throw Error('Theme editor is not ready.');
        return accept(await api[method]({...input, revision: state.revision}));
      }),
    close: () => {
      if (closed) return chain;
      closed = true;
      // Drain prior preview calls before cancellation: a late response cannot
      // resurrect a preview after the dialog has closed.
      return enqueue(() => api.cancelTheme().then(accept));
    },
  };
}
function AuxThemeEditorDialog({onClose}) {
  const [state, setState] = React.useState(null),
    [draft, setDraft] = React.useState(null);
  const {setTheme} = te(),
    themeQueryClient = f();
  const [error, setError] = React.useState(''),
    [busy, setBusy] = React.useState(false);
  const [name, setName] = React.useState(''),
    file = React.useRef(null);
  const session = React.useRef(null),
    draftRef = React.useRef(null),
    previewTimer = React.useRef(null);
  const dirty = React.useRef(false),
    alive = React.useRef(true);
  React.useEffect(() => {
    alive.current = true;
    const client = createAuxThemeSession(
      chrome.auxBrowserPreferences,
      next => {
        if (alive.current) setState(next);
      },
      message => {
        if (alive.current) setError(message);
      },
    );
    session.current = client;
    client
      .load()
      .then(next => {
        if (alive.current && next) {
          setDraft(next.tokens);
          draftRef.current = next.tokens;
        }
      })
      .catch(() => {});
    const lease = setInterval(() => {
      if (dirty.current && draftRef.current) client.run('previewTheme', {tokens: draftRef.current}).catch(() => {});
    }, 30000);
    return () => {
      alive.current = false;
      clearInterval(lease);
      clearTimeout(previewTimer.current);
      client.close().catch(() => {});
    };
  }, []);
  const change = next => {
    setError('');
    setDraft(next);
    draftRef.current = next;
    dirty.current = true;
    clearTimeout(previewTimer.current);
    previewTimer.current = setTimeout(() => {
      session.current.run('previewTheme', {tokens: next}).catch(() => {});
    }, 140);
  };
  const field = (key, value) => {
    const next = {...draft};
    if (value === null) delete next[key];
    else next[key] = value;
    if (key === 'tint') {
      if (value === null) delete next.tintStrength;
      else next.tintStrength = next.tintStrength ?? 0.15;
    }
    change(next);
  };
  const run = async (method, input = {}, finish = false) => {
    clearTimeout(previewTimer.current);
    setError('');
    setBusy(true);
    try {
      const result = await session.current.run(method, input);
      if (!alive.current || !result) return;
      if (method === 'applyTheme' || method === 'resetTheme') {
        dirty.current = false;
        setDraft(result.tokens);
        draftRef.current = result.tokens;
        setTheme(['system', 'light', 'dark'][result.nativeScheme] ?? 'system');
        themeQueryClient.invalidateQueries({queryKey: THEME_QUERY});
      }
      if (finish) onClose();
      return result;
    } catch {
      return null;
    } finally {
      if (alive.current) setBusy(false);
    }
  };
  const color = (key, title, description) =>
    (0, jsxRuntime.jsxs)(h, {
      children: [
        (0, jsxRuntime.jsx)(b, {title, description}),
        (0, jsxRuntime.jsxs)(p, {
          children: [
            (0, jsxRuntime.jsx)('input', {
              type: 'color',
              'aria-label': title,
              value: draft?.[key] ?? '#808080',
              disabled: busy || !draft,
              onChange: event => field(key, event.target.value),
            }),
            (0, jsxRuntime.jsx)(N, {
              variant: 'ghost',
              size: 'sm',
              disabled: busy || !draft?.[key],
              onClick: () => field(key, null),
              children: 'Inherit',
            }),
          ],
        }),
      ],
    });
  const select = (key, title, description, options) =>
    (0, jsxRuntime.jsxs)(h, {
      children: [
        (0, jsxRuntime.jsx)(b, {title, description}),
        (0, jsxRuntime.jsx)(p, {
          children: (0, jsxRuntime.jsxs)(_, {
            value: draft?.[key] ?? 'default',
            disabled: busy || !draft,
            onValueChange: value => field(key, value === 'default' ? null : value),
            children: [
              (0, jsxRuntime.jsx)(E, {className: 'w-full', children: (0, jsxRuntime.jsx)(P, {placeholder: 'Default'})}),
              (0, jsxRuntime.jsx)(k, {
                children: options.map(([value, label]) => (0, jsxRuntime.jsx)(y, {value, children: label}, value)),
              }),
            ],
          }),
        }),
      ],
    });
  const exportFile = async () => {
    const result = await run('exportThemePreset', {tokens: draft});
    if (!result?.preset) return;
    const url = URL.createObjectURL(new Blob([JSON.stringify(result.preset, null, 2)], {type: 'application/json'}));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'aux-theme.json';
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const importFile = async event => {
    const chosen = event.target.files?.[0];
    event.target.value = '';
    if (!chosen) return;
    try {
      if (chosen.size > 4096) throw Error('Choose an Aux theme file smaller than 4 KiB.');
      const tokens = parseAuxThemeImport(await chosen.text());
      const result = await run('previewTheme', {tokens});
      if (result) {
        dirty.current = true;
        setDraft(result.effectiveTokens);
        draftRef.current = result.effectiveTokens;
      }
    } catch (failure) {
      if (alive.current) setError(failure.message);
    }
  };
  return (0, jsxRuntime.jsxs)(Oe, {
    className: 'sm:max-w-md',
    showCloseButton: !busy,
    'aria-describedby': undefined,
    children: [
      (0, jsxRuntime.jsx)(Ve, {children: (0, jsxRuntime.jsx)(Re, {children: 'Theme editor'})}),
      (0, jsxRuntime.jsxs)('div', {
        className: 'flex flex-col gap-4',
        children: [
          error &&
            (0, jsxRuntime.jsx)('p', {role: 'alert', className: 'text-sm text-muted-foreground', children: error}),
          state?.highContrast &&
            (0, jsxRuntime.jsx)('p', {
              className: 'text-sm text-muted-foreground',
              children: 'Your system contrast settings take priority over custom colors.',
            }),
          state?.reducedTransparency &&
            (0, jsxRuntime.jsx)('p', {
              className: 'text-sm text-muted-foreground',
              children: 'Reduce Transparency is enabled. Glass remains opaque.',
            }),
          select('scheme', 'Color scheme', 'Use the same native light and dark modes.', [
            ['default', 'Current setting'],
            ['system', 'System'],
            ['light', 'Light'],
            ['dark', 'Dark'],
          ]),
          color('accent', 'Accent', 'The accent used by native browser controls.'),
          color('background', 'Background', 'Browser chrome color. Page content keeps its own colors.'),
          color('tint', 'Backdrop tint', 'A subtle tint on the existing sidebar material.'),
          draft?.tint &&
            (0, jsxRuntime.jsxs)(h, {
              children: [
                (0, jsxRuntime.jsx)(b, {title: 'Tint intensity', description: 'Keep the underlying material visible.'}),
                (0, jsxRuntime.jsx)(p, {
                  children: (0, jsxRuntime.jsx)('input', {
                    type: 'range',
                    min: 0,
                    max: 0.4,
                    step: 0.01,
                    value: draft.tintStrength ?? 0.15,
                    'aria-label': 'Tint intensity',
                    disabled: busy,
                    onChange: event => field('tintStrength', Number(event.target.value)),
                  }),
                }),
              ],
            }),
          select('material', 'Material', 'Adjust existing glass without changing the layout.', [
            ['default', 'Default'],
            ['clear', 'Clear'],
            ['soft', 'Soft'],
            ['opaque', 'Opaque'],
          ]),
          (0, jsxRuntime.jsxs)(h, {
            children: [
              (0, jsxRuntime.jsx)(b, {title: 'Saved presets', description: 'Only stored in this profile.'}),
              (0, jsxRuntime.jsx)(p, {
                children: (0, jsxRuntime.jsxs)(_, {
                  value: 'choose',
                  disabled: busy || !state?.presets?.length,
                  onValueChange: id => {
                    const preset = state.presets.find(item => item.id === id);
                    if (preset) change(preset.tokens);
                  },
                  children: [
                    (0, jsxRuntime.jsx)(E, {
                      className: 'w-full',
                      children: (0, jsxRuntime.jsx)(P, {placeholder: 'Choose a preset'}),
                    }),
                    (0, jsxRuntime.jsxs)(k, {
                      children: [
                        (0, jsxRuntime.jsx)(y, {value: 'choose', disabled: true, children: 'Choose a preset'}),
                        ...(state?.presets ?? []).map(item =>
                          (0, jsxRuntime.jsx)(y, {value: item.id, children: item.name}, item.id),
                        ),
                      ],
                    }),
                  ],
                }),
              }),
            ],
          }),
          (0, jsxRuntime.jsx)('input', {
            value: name,
            maxLength: 64,
            'aria-label': 'Preset name',
            placeholder: 'Preset name',
            className: 'border-input bg-transparent rounded-md border px-3 py-2 text-sm',
            disabled: busy,
            onChange: event => setName(event.target.value),
          }),
          (0, jsxRuntime.jsxs)('div', {
            className: 'flex gap-2',
            children: [
              (0, jsxRuntime.jsx)(N, {
                variant: 'secondary',
                disabled: busy || !draft || !name.trim(),
                onClick: () => run('saveThemePreset', {name: name.trim(), tokens: draft}),
                children: 'Save preset',
              }),
              (0, jsxRuntime.jsx)(N, {
                variant: 'outline',
                disabled: busy || !draft,
                onClick: exportFile,
                children: 'Export',
              }),
              (0, jsxRuntime.jsx)(N, {
                variant: 'outline',
                disabled: busy || !draft,
                onClick: () => file.current?.click(),
                children: 'Import',
              }),
              (0, jsxRuntime.jsx)('input', {
                type: 'file',
                accept: '.json,application/json',
                hidden: true,
                ref: file,
                onChange: importFile,
              }),
            ],
          }),
          ...(state?.presets ?? []).map(item =>
            (0, jsxRuntime.jsxs)(
              'div',
              {
                className: 'flex items-center justify-between gap-2',
                children: [
                  (0, jsxRuntime.jsx)('span', {className: 'text-sm', children: item.name}),
                  (0, jsxRuntime.jsx)(N, {
                    variant: 'ghost',
                    size: 'sm',
                    disabled: busy,
                    onClick: () => run('deleteThemePreset', {id: item.id}),
                    children: 'Remove',
                  }),
                ],
              },
              item.id,
            ),
          ),
        ],
      }),
      (0, jsxRuntime.jsxs)(Ae, {
        children: [
          (0, jsxRuntime.jsx)(N, {
            variant: 'ghost',
            disabled: busy || !state,
            onClick: () => run('resetTheme'),
            children: 'Reset to default',
          }),
          (0, jsxRuntime.jsx)(N, {variant: 'secondary', disabled: busy, onClick: onClose, children: 'Cancel'}),
          (0, jsxRuntime.jsx)(N, {
            disabled: busy || !draft,
            onClick: () => run('applyTheme', {tokens: draft}, true),
            children: 'Apply',
          }),
        ],
      }),
    ],
  });
}
function AuxThemeEditorSetting() {
  const api = globalThis.chrome?.auxBrowserPreferences;
  const available = typeof api?.openThemePicker === 'function';
  return (0, jsxRuntime.jsxs)(h, {
    children: [
      (0, jsxRuntime.jsx)(b, {
        title: 'Default theme',
        description: 'The colors every Space uses unless it has its own theme. Right-click a Space to give it one.',
      }),
      (0, jsxRuntime.jsx)(p, {
        children: (0, jsxRuntime.jsx)(N, {
          variant: 'outline',
          disabled: !available,
          onClick: () =>
            api
              .openThemePicker()
              .catch(error => w.error(error instanceof Error ? error.message : 'Couldn’t open the theme picker.')),
          children: 'Edit theme…',
        }),
      }),
    ],
  });
}
function createAuxFeatureSettingsSession(api, kind, onState, onError) {
  let live = true,
    busy = false,
    state = null,
    owner = null;
  const cleanup = kind === 'cleanup';
  const validScope = (ids, spaces, enabled) => {
    if (ids === undefined || ids === null) return true; // Legacy/all-Space policy.
    if (
      !Array.isArray(ids) ||
      ids.length > 1024 ||
      (enabled && !ids.length) ||
      !Array.isArray(spaces) ||
      new Set(ids).size !== ids.length
    )
      return false;
    const available = new Set(spaces.map(space => space.id));
    return ids.every(id => typeof id === 'string' && available.has(id));
  };
  const validSpaces = spaces =>
    spaces === undefined ||
    (Array.isArray(spaces) &&
      spaces.length <= 1024 &&
      new Set(spaces.map(space => space?.id)).size === spaces.length &&
      spaces.every(
        space =>
          typeof space?.id === 'string' &&
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(space.id) &&
          typeof space.name === 'string' &&
          space.name.length > 0,
      ));
  const read = async () => {
    const next = await (cleanup ? api.getOrganizationSettings() : api.getFramePresentation());
    if (!next?.success) throw Error(next?.error || 'Settings are unavailable.');
    if (cleanup) {
      if (
        typeof next.ownerGeneration !== 'string' ||
        !next.ownerGeneration ||
        typeof next.revision !== 'string' ||
        !next.revision ||
        typeof next.cleanup?.enabled !== 'boolean' ||
        !Number.isInteger(next.cleanup?.inactivityDays) ||
        next.cleanup.inactivityDays < 1 ||
        next.cleanup.inactivityDays > 3650 ||
        !validSpaces(next.spaces) ||
        !validScope(next.cleanup.spaceIds, next.spaces, next.cleanup.enabled)
      )
        throw Error('Invalid tab cleanup settings.');
      if (owner !== null && owner !== next.ownerGeneration)
        throw Error('Settings changed. Reopen this page before making changes.');
      owner = next.ownerGeneration;
    } else if (
      ['sidebarNavigation', 'minimal', 'peekLinks', 'littleAuxLinks'].some(key => typeof next[key] !== 'boolean')
    ) {
      throw Error('Browser presentation settings are unavailable in this build.');
    }
    if (live) {
      state = next;
      onState(next);
    }
    return next;
  };
  const report = error => {
    if (live) onError(error instanceof Error ? error.message : String(error));
  };
  return {
    async load() {
      if (!live || busy) return;
      busy = true;
      try {
        return await read();
      } catch (error) {
        report(error);
        throw error;
      } finally {
        busy = false;
      }
    },
    async save(patch) {
      if (!live) throw Error('Settings were closed.');
      if (busy) throw Error('A settings update is already in progress.');
      if (!state) throw Error('Reload settings before saving.');
      busy = true;
      try {
        let request;
        if (cleanup) {
          if (
            Object.keys(patch).some(key => !['enabled', 'inactivityDays', 'spaceIds'].includes(key)) ||
            typeof patch.enabled !== 'boolean' ||
            !Number.isInteger(patch.inactivityDays) ||
            patch.inactivityDays < 1 ||
            patch.inactivityDays > 3650
          )
            throw Error('Choose a whole number of days from 1 to 3650.');
          const scope = Object.hasOwn(patch, 'spaceIds') ? patch.spaceIds : state.cleanup.spaceIds;
          if (!validScope(scope, state.spaces, patch.enabled))
            throw Error('Select at least one available Space, or choose all Spaces.');
          request = {ownerGeneration: state.ownerGeneration, expectedRevision: state.revision, ...patch};
        } else {
          if (
            !Object.keys(patch).length ||
            Object.entries(patch).some(
              ([key, value]) =>
                !['sidebarNavigation', 'minimal', 'peekLinks', 'littleAuxLinks'].includes(key) ||
                typeof value !== 'boolean',
            )
          )
            throw Error('Invalid browser presentation setting.');
          request = patch;
        }
        const result = await (cleanup ? api.setOrganizationCleanupPolicy(request) : api.setFramePresentation(request));
        if (!result?.success) {
          // Refresh the CAS revision, but never treat a refused commit as saved.
          try {
            await read();
          } catch {
            state = null;
          }
          throw Error(result?.error || 'Settings were not saved.');
        }
        // The native write callback is authoritative. Read its actual state;
        // do not substitute the requested value for an incomplete response.
        if (!live) return result;
        try {
          await read();
        } catch (error) {
          state = null;
          throw error;
        }
        return result;
      } catch (error) {
        report(error);
        throw error;
      } finally {
        busy = false;
      }
    },
    close() {
      live = false;
      state = null;
    },
  };
}
function AuxFrameSettings() {
  const el = React.createElement,
    api = u(),
    [state, setState] = React.useState(null),
    [busy, setBusy] = React.useState(false),
    [error, setError] = React.useState('');
  const session = React.useRef(null),
    alive = React.useRef(false);
  React.useEffect(() => {
    alive.current = true;
    const client = createAuxFeatureSettingsSession(api, 'frame', setState, setError);
    session.current = client;
    client.load().catch(() => {});
    return () => {
      alive.current = false;
      client.close();
      session.current = null;
    };
  }, [api]);
  const update = async (key, value) => {
    setBusy(true);
    setError('');
    try {
      await session.current.save({[key]: value});
    } catch {
    } finally {
      if (alive.current) setBusy(false);
    }
  };
  return el(
    React.Fragment,
    null,
    [
      ['sidebarNavigation', 'Navigation in sidebar', 'Keep the address and navigation controls in the open sidebar.'],
      [
        'minimal',
        'Minimal browser UI',
        'Hide the sidebar so the page fills the window. Hover the left edge to bring it back. Ctrl-Command-S.',
      ],
      ['peekLinks', 'Open links in Peek', 'Option-Shift-click a link to preview it before moving it into a full tab.'],
      [
        'littleAuxLinks',
        'Open links from other apps in Little Aux',
        'Links from other apps open in a small window you can move into a Space.',
      ],
    ].map(([key, title, description]) =>
      el(
        h,
        {key},
        el(b, {title, description}),
        el(
          p,
          null,
          el(ze, {
            'aria-label': title,
            checked: state?.[key] ?? false,
            disabled: !state || busy,
            onCheckedChange: value => update(key, value),
          }),
        ),
      ),
    ),
    error && el('p', {role: 'alert', className: 'text-destructive text-sm'}, error),
  );
}
