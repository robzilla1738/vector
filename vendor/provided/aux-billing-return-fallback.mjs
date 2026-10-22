/** Exact SSR-only billing return fallback, using implemented Aux account route.
 * No hosted request, billing creation, UI copy or extension/native route change.
 */
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {resolveCloudServicePolicy} from './cloud-service-policy.mjs';
const pin=JSON.parse(readFileSync(new URL('../../docs/integration/proposed/aux-billing-return-fallback/inputs.json',import.meta.url),'utf8'));
export function applyAuxBillingReturnFallback({component,path,text,original},cloudOptions={}) {
  if(component!==pin.component||path!==pin.path)return {text,anchors:[]};
  const policy=resolveCloudServicePolicy(cloudOptions);
  // No hosted fallback is invented for an explicitly local-only build.
  if(policy.mode==='local')return {text,anchors:[]};
  if(typeof original!=='string'||createHash('sha256').update(original).digest('hex')!==pin.sourceSha256)throw Error('Aux billing fallback original source pin mismatch');
  if(typeof text!=='string'||original.split(pin.find).length-1!==pin.count||text.split(pin.find).length-1!==pin.count)throw Error('Aux billing fallback source drift or repeated generation');
  const destination=pin.appOrigins[policy.mode]+pin.route;
  const replace=`if(typeof window>"u")return${JSON.stringify(destination)};`;
  if(text.includes(replace))throw Error('Mixed Aux billing fallback generation');
  return {text:text.replace(pin.find,replace),anchors:[{kind:'identity',name:'Aux existing hosted account billing fallback',find:pin.find,replace,count:pin.count}]};
}
