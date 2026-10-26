import {createHash} from 'node:crypto';

const inputs = new Set([
  '48af998738fb6d2fc30cb8d5b2e9de03cb04ab7d8563ebdaa5fe8100944fc514',
  'f355833cb607963a65ca3108e7ae19ea7ca60192a9f3d8e2644a3c12ec49c808',
]);
const rules = [
  ['SUSPENSION_ACTION_ID=`aside_suspension`', 'SUSPENSION_ACTION_ID=`aux_suspension_v2`'],
  ['Cn.actionId.startsWith(`aside_suspension`)', 'Cn.actionId.startsWith(`aux_suspension_v2_`)'],
  ['`aside:worker:${Cn.parentId}:${ei.profile??`default`}`', '`aux:worker:v2:${Cn.parentId}:${ei.profile??`default`}`'],
];

export function transformAuxEphemeralProtocolIdentity({text, source}) {
  if (!inputs.has(createHash('sha256').update(source).digest('hex')))
    throw Error('Protocol identity requires the exact paired A51 source.');
  const anchors = [];
  for (const [find, replacement] of rules) {
    if (source.split(find).length - 1 !== 1 || text.split(find).length - 1 !== 1)
      throw Error('Aux protocol identity count drift.');
    text = text.replace(find, () => replacement);
    anchors.push({kind: 'identity', find, replace: replacement, count: 1});
  }
  return {text, anchors};
}

export function transformAuxTagIconIdentity({text, source}) {
  if (!inputs.has(createHash('sha256').update(source).digest('hex')))
    throw Error('Tag identity requires the exact paired A51 source.');
  const find = 'TAG_ICON_KEYS=/* @__PURE__ */ `aside.slime.';
  const replacement = 'TAG_ICON_KEYS=/* @__PURE__ */ `aux.slime.';
  if (source.split(find).length - 1 !== 1 || text.split(find).length - 1 !== 1)
    throw Error('Aux tag icon schema count drift.');
  return {text: text.replace(find, () => replacement),
    anchors: [{kind: 'identity', find, replace: replacement, count: 1}]};
}
