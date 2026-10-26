import {createHash} from 'node:crypto';

export function migrateAuxExperimentalSettings(value) {
  const format = 'aux.experimental.v2';
  if (value.format !== undefined && value.format !== format)
    throw Error('Unsupported Aux experimental settings version.');
  if (value.format !== undefined && Object.hasOwn(value, 'asideCode') ||
      value.format === undefined && Object.hasOwn(value, 'auxCode'))
    throw Error('Ambiguous Aux experimental settings generation.');
  const {asideCode, auxCode, format: previousFormat, ...settings} = value;
  return {...settings, format, auxCode: (previousFormat === format ? auxCode : asideCode) ?? false};
}

const files = new Map([
  ['assets/mcps-DmPp5oo9.js', ['e081e3d15242ef69bc043ec4685b07bc9fba247d20a68dc7df34e936d94862b1', 'dee7ff83a91decfc61542ac55e197d5eaa4f461bb657eb7085eb0938648fd890']],
  ['assets/experimental-Xq3YsEPK.js', ['f1c137c2a143eb9fa7d33740608cb03450a7de7049cf1141001763dbec78aaff', '7d237f0a3af555498ad42ca70988ea9f9cd11473ed1afe4e68b16089e0d5c534']],
  ['assets/session-composer-Dc0LRfZA.js', ['71e187af0ca2887e13b840cd1e1b4aa2f46693821fb96daa8eafa9f4480bf645', '7d9fd830a06e4bc846a7d81f849486a16013a36411c8d33a309ddc6a6d7f229d']],
  ['assets/provider-Cw0zhujt.js', ['6c3aa90661897411efea336eff14b6e0d50e8fbb7f09b178b44305be1ee95c97', '8aee4a9cc8229397e4067fb9a9a4772ef4bdfddc03d1db3f2c84836a1b6fe724']],
  ['assets/_skillId-CAwCRjA8.js', ['c1ed5ec1684bcf8b7bd2c758ef949eff885fa583c892fa58a9ecfa87bb50151e', 'b6fe66a9473643a8b720bcdc7f618d189685b96416c5a06df0f2dcaa27b25b60']],
]);
const daemonInputs = new Set([
  '48af998738fb6d2fc30cb8d5b2e9de03cb04ab7d8563ebdaa5fe8100944fc514',
  'f355833cb607963a65ca3108e7ae19ea7ca60192a9f3d8e2644a3c12ec49c808',
  '62469726c5629983c379faae562d8317c53d79848fe3f09cd945e3ff95ea5d47',
  '8406b82b2c2ae73312e0d81e18392f2d4c91bc1df497b73eefbdc8fba04189bb',
  '4aa78d2606963d854849629dba91a2f418f6f347b09f45d3f9cc9dd3000409b7',
  'f3a8c02127d31b5c09c2f83b54dbfc1f789c7cfb7125ec0993dad31b18f73737',
]);

export function transformAuxExperimentalSettings({component, path, text, source = text}) {
  if (component !== 'daemon' && (component !== 'agent' || !files.has(path))) return {text, anchors: []};
  const hash = createHash('sha256').update(source).digest('hex');
  if (component === 'daemon' ? !daemonInputs.has(hash) : !files.get(path).includes(hash))
    throw Error('Aux experimental settings source changed: ' + path);
  const anchors = [];
  const replace = (find, replacement, count = 1) => {
    if (text.split(find).length - 1 !== count) throw Error('Aux experimental settings anchor changed: ' + path);
    text = text.split(find).join(replacement);
    anchors.push({kind: 'identity', name: 'Versioned Aux experimental settings', find, replace: replacement, count});
  };
  if (component === 'daemon' || path === 'assets/mcps-DmPp5oo9.js') {
    const [object, boolean, string] = component === 'daemon' ? ['object', 'boolean$1', 'string$3'] : ['o', 'm', 't'];
    const schema = `${object}({sync:${boolean}().default(!1),kakaotalk:${boolean}().default(!1),onboarding:${boolean}().default(!1),asideCode:${boolean}().default(!1),compactionLimits:${boolean}().default(!1)})`;
    const successor = schema.replace(`asideCode:${boolean}().default(!1)`,
      `format:${string}().optional(),auxCode:${boolean}().optional(),asideCode:${boolean}().optional()`);
    replace(schema, `${successor}.transform(${migrateAuxExperimentalSettings.toString()})`);
  }
  if (component === 'daemon' || path === 'assets/_skillId-CAwCRjA8.js') replace('.asideCode', '.auxCode');
  if (path === 'assets/experimental-Xq3YsEPK.js') {
    replace('asideCode:!1', 'format:"aux.experimental.v2",auxCode:!1');
    replace('t.asideCode', 't.auxCode');
    replace('asideCode:a', 'auxCode:a');
  }
  if (path === 'assets/session-composer-Dc0LRfZA.js' || path === 'assets/provider-Cw0zhujt.js')
    replace('asideCodeAgents', 'auxCodeAgents');
  return {text, anchors};
}
