/** Narrow local-only boundary for actual hosted first-party consumers in pinned supplied UI. */
export const providedUiUnavailableOrigin = 'http://127.0.0.1:9/aux-unavailable';
const api = {
  find: 'https://api.aside.com',
  replace: `${providedUiUnavailableOrigin}/api`,
  count: 1,
};
const rules = {
  'agent/background.js': [api],
  'agent/assets/strip-markdown-DRcmtuJc.js': [api],
  'vault/background.js': [api],
  'vault/assets/globals-CO6zPMxV.js': [api],
  'agent/assets/channels-CJn5l9_T.js': [
    {
      find: 'https://docs.aside.com/help/channels-',
      replace: `${providedUiUnavailableOrigin}/docs/help/channels-`,
      count: 2,
    },
  ],
  'agent/assets/developers-DTvaoVBC.js': [
    {
      find: 'https://releases.aside.com/install.sh',
      replace: `${providedUiUnavailableOrigin}/releases/install.sh`,
      count: 1,
    },
  ],
  'agent/content/content.js': [
    { find: ',"https://aside.at"', replace: '', count: 1 },
  ],
};

/** Compose after native compatibility transform; replay these anchors in the returned order. */
export function transformProvidedUiBoundary({ component, path, text }) {
  if (typeof text !== 'string')
    throw new Error('Provided UI boundary expects text');
  const anchors = [];
  for (const rule of rules[`${component}/${path}`] ?? []) {
    const count = text.split(rule.find).length - 1;
    if (count !== rule.count)
      throw new Error(
        `Hosted UI boundary anchor changed: ${component}/${path}`,
      );
    text = text.split(rule.find).join(rule.replace);
    anchors.push({ kind: 'integration', ...rule });
  }
  return { text, anchors };
}

export const providedUiBoundaryRules = Object.freeze(
  Object.fromEntries(
    Object.entries(rules).map(([path, anchors]) => [
      path,
      Object.freeze(anchors.map((anchor) => Object.freeze({ ...anchor }))),
    ]),
  ),
);
