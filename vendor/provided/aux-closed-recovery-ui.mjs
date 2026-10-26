import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
const pins=JSON.parse(readFileSync(new URL('../../docs/integration/proposed/completion-20261026/integration/recovery-ui/source-pins.json',import.meta.url),'utf8'));
export function transformAuxClosedRecoveryUi({path,text,source}) {
  if(path!==pins.path)return {text,anchors:[]};
  if(createHash('sha256').update(source).digest('hex')!==pins.originalSha256||text.split(pins.rule.find).length-1!==1)
    throw Error('Closed legacy recovery schema source/consumer drift.');
  return {text:text.replace(pins.rule.find,()=>pins.rule.replace),anchors:[{kind:'integration',...pins.rule}]};
}
