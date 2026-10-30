/* Aux-owned source, skill activation fields and skill helpers (assets/skill-activation-fields-wmmVsYeN.js,
 * the module body after its imports): which built-in skills are hidden or ordered first, path helpers,
 * the settings catalog (file paths and the skill each file belongs to), splitting keywords and URL
 * patterns, a skill's heading and front matter, URL-safe skill IDs, and the activation fields
 * (keywords and URL patterns that switch a skill on, in a collapsible section) with their summary.
 * Names the rest of the chunk uses keep their chunk names (all exported): K password-manager skills,
 * v pathParts, i joinPath, G baseName, U isSystemSkill, W sortSystemSkills, g listText, q absolutePath,
 * Y settingsCatalog, J headingAndBody, Q withoutFrontMatter, V encodeSkillId, X decodeSkillId, Z
 * ActivationFields.
 * Chunk names used: j JSX runtime, m isSingleFile, u displayName, and the collapsible, label, input
 * and textarea parts. */
var FRONT_MATTER = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/,
  HIDDEN_BUILTINS = new Set([
    '1password',
    'dashlane',
    'kakaotalk',
    'lastpass',
    'linkedin',
    'nordpass',
    'onboarding',
    'proton-pass',
    'x-twitter',
  ]),
  K = new Set(['password-manager', 'apple-passwords', '1password', 'bitwarden', 'dashlane', 'lastpass', 'nordpass']),
  SYSTEM_ORDER = new Map(
    [
      'aux',
      'captcha-solver',
      'draft-preview',
      'image-search',
      'imagegen',
      'notification-activation',
      'skill-creator',
      'visual-browse',
      'visualize',
    ].map((e, a) => [e, a]),
  ),
  v = e => e.split(/[/\\]/).filter(Boolean),
  i = (...e) => e.flatMap(v).join('/'),
  G = e => v(e).at(-1) ?? e,
  builtinName = e =>
    i(e.path)
      .match(/^builtin\/([^/]+)/)?.[1]
      ?.toLowerCase(),
  U = e => SYSTEM_ORDER.has(builtinName(e) ?? ''),
  W = e =>
    [...e].sort((a, t) => {
      const s = SYSTEM_ORDER.get(builtinName(a) ?? ''),
        n = SYSTEM_ORDER.get(builtinName(t) ?? '');
      return s !== void 0 && n !== void 0 ? s - n : s !== void 0 ? -1 : n !== void 0 ? 1 : u(a).localeCompare(u(t));
    }),
  g = e =>
    e
      .split(/[\n,]/)
      .map(a => a.trim())
      .filter(Boolean),
  catalogPaths = e => e.flatMap(a => (m(a.path) ? [i(a.path)] : a.files.map(t => i(a.path, t)))),
  skillsByFile = e => {
    const a = new Map();
    for (const t of e) {
      if (m(t.path)) {
        a.set(i(t.path), t);
        continue;
      }
      for (const s of t.files) a.set(i(t.path, s), t);
    }
    return a;
  },
  q = (e, a) => {
    if (m(e.path)) return e.absolutePath;
    const t = i(a).slice(i(e.path).length + 1);
    return t ? i(e.absolutePath, t) : e.absolutePath;
  },
  catalog = e => {
    const a = catalogPaths(e);
    return {skills: e, filePaths: a, filePathSet: new Set(a), skillByFilePath: skillsByFile(e)};
  },
  Y = e =>
    catalog(
      e.filter(a => a.group === 'user' || !isHidden(a)),
    ) /** Site-specific, gated, internal and listed built-ins stay out of Settings. */,
  isHidden = e =>
    e.group === 'builtin-site-specific' ||
    (e.group === 'builtin' &&
      (e.metadata?.settingsGate || e.metadata?.metadata?.internal || HIDDEN_BUILTINS.has(e.name.toLowerCase()))),
  J = e => {
    const a = e.match(/^#\s+.+(?:\r?\n|$)/);
    return a ? {heading: a[0].trim(), body: e.slice(a[0].length).trimStart()} : {body: e};
  },
  Q = e => {
    const a = e.match(FRONT_MATTER);
    return a ? e.slice(a[0].length).trimStart() : e;
  },
  V = e =>
    btoa(String.fromCharCode(...new TextEncoder().encode(e)))
      .replaceAll('+', '-')
      .replaceAll('/', '_')
      .replace(/=+$/, ''),
  X = e => {
    try {
      const a = e.replaceAll('-', '+').replaceAll('_', '/'),
        t = Uint8Array.from(atob(a.padEnd(Math.ceil(a.length / 4) * 4, '=')), s => s.charCodeAt(0));
      return new TextDecoder().decode(t);
    } catch {
      return;
    }
  },
  jsxRuntime = j() /** Keywords and URL patterns that switch a skill on. */,
  Z = ({
    idPrefix,
    keywordsText,
    open,
    urlPatternsText,
    onKeywordsTextChange,
    onOpenChange,
    onUrlPatternsTextChange,
  }) => {
    const S = g(keywordsText).length,
      w = g(urlPatternsText).length;
    return (0, jsxRuntime.jsxs)('div', {
      className: 'rounded-lg border',
      children: [
        (0, jsxRuntime.jsxs)('div', {
          className: 'flex items-center justify-between gap-3 px-3 py-2',
          children: [
            (0, jsxRuntime.jsxs)('div', {
              className: 'min-w-0',
              children: [
                (0, jsxRuntime.jsxs)('div', {
                  className: 'flex items-center gap-1.5',
                  children: [
                    (0, jsxRuntime.jsx)(o, {children: 'Activation'}),
                    (0, jsxRuntime.jsxs)(_, {
                      children: [
                        (0, jsxRuntime.jsx)(k, {
                          render: (0, jsxRuntime.jsx)(p, {
                            type: 'button',
                            'aria-label': 'About activation',
                            className: 'text-muted-foreground -my-1 -ml-1',
                            variant: 'ghost',
                            size: 'icon-xs',
                          }),
                          children: (0, jsxRuntime.jsx)(N, {className: 'size-3.5'}),
                        }),
                        (0, jsxRuntime.jsx)(A, {
                          className: 'px-3 py-2',
                          children: (0, jsxRuntime.jsx)('span', {
                            className: 'block w-72 max-w-[calc(100vw-2rem)] text-left leading-snug',
                            children:
                              'Add keywords or website patterns to let the project automatically consider this skill. Leave blank for manual-only use.',
                          }),
                        }),
                      ],
                    }),
                  ],
                }),
                (0, jsxRuntime.jsx)('p', {
                  className: 'text-muted-foreground mt-0.5 truncate text-xs',
                  children: activationSummary(S, w),
                }),
              ],
            }),
            (0, jsxRuntime.jsxs)(p, {
              type: 'button',
              variant: 'ghost',
              size: 'sm',
              'aria-expanded': open,
              onClick: () => onOpenChange(!open),
              children: [
                (0, jsxRuntime.jsx)('span', {children: open ? 'Hide' : 'Configure'}),
                (0, jsxRuntime.jsx)(y, {
                  'data-icon': 'inline-end',
                  className: b('transition-transform', open && 'rotate-180'),
                }),
              ],
            }),
          ],
        }),
        open &&
          (0, jsxRuntime.jsxs)('div', {
            className: 'grid gap-3 border-t px-3 py-3',
            children: [
              (0, jsxRuntime.jsxs)('div', {
                className: 'grid gap-1.5',
                children: [
                  (0, jsxRuntime.jsx)(o, {htmlFor: `${idPrefix}-keywords`, children: 'Keywords'}),
                  (0, jsxRuntime.jsx)(h, {
                    id: `${idPrefix}-keywords`,
                    className: '[field-sizing:fixed] max-h-32 min-h-20 resize-none overflow-y-auto',
                    value: keywordsText,
                    onChange: l => onKeywordsTextChange(l.target.value),
                    placeholder: `reporting
weekly planning`,
                  }),
                ],
              }),
              (0, jsxRuntime.jsxs)('div', {
                className: 'grid gap-1.5',
                children: [
                  (0, jsxRuntime.jsx)(o, {htmlFor: `${idPrefix}-url-patterns`, children: 'Websites'}),
                  (0, jsxRuntime.jsx)(h, {
                    id: `${idPrefix}-url-patterns`,
                    className: '[field-sizing:fixed] max-h-32 min-h-20 resize-none overflow-y-auto font-mono text-sm',
                    value: urlPatternsText,
                    onChange: l => onUrlPatternsTextChange(l.target.value),
                    placeholder: `github.com/**
*.atlassian.net/**`,
                  }),
                ],
              }),
            ],
          }),
      ],
    });
  } /** How many keywords and URL patterns switch the skill on, or Manual only. */,
  activationSummary = (e, a) => {
    const t = [];
    return (
      e > 0 && t.push(`${e} keyword${e === 1 ? '' : 's'}`),
      a > 0 && t.push(`${a} website${a === 1 ? '' : 's'}`),
      t.length > 0 ? t.join(' · ') : 'Manual only'
    );
  }
