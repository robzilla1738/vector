/** Bundle the supplied remote platform artwork unchanged; never contact the
 * reference product for channel icons. Source provenance stays outside the app. */
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
const pins = JSON.parse(readFileSync(new URL('../../docs/integration/proposed/final-completion/channel-bot-assets.json', import.meta.url), 'utf8'));
export function applyAuxChannelBotAssets({component, path, text, stateIdentityVersion}) {
  if (component !== 'agent' || stateIdentityVersion !== 2 || path !== 'assets/channels-CJn5l9_T.js') return {text, anchors: []};
  const icons = {};
  if (pins.files.map(x=>x.platform).join(',') !== 'discord,slack,telegram') throw Error('Unexpected channel artwork inventory');
  for (const row of pins.files) {
    const bytes = readFileSync(new URL('../../' + row.path, import.meta.url));
    if (bytes.length !== row.bytes || createHash('sha256').update(bytes).digest('hex') !== row.sha256) throw Error('Channel artwork source changed');
    icons[row.platform] = 'data:image/jpeg;base64,' + bytes.toString('base64');
  }
  const anchors = [];
  const apply = (find, replace, count) => {
    if (text.split(find).length - 1 !== count) throw Error('Channel artwork anchor changed');
    text = text.split(find).join(replace);
    anchors.push({kind: 'identity', name: 'Aux-contained unchanged channel artwork', find, replace, count});
  };
  const declaration = 'var S=ds(ps(),1),ts=L(["slack","telegram","discord"])';
  apply(declaration, `const auxPinnedChannelBotImages=Object.freeze(${JSON.stringify(icons)});${declaration}`, 1);
  for (const [variable, count] of [['t', 1], ['s.platform', 1], ['s', 2]]) {
    apply('`https://static.asidehq.com/bots/${' + variable + '}.jpg`', `auxPinnedChannelBotImages[${variable}]`, count);
  }
  return {text, anchors};
}
