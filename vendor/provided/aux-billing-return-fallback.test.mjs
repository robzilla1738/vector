import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {stripTypeScriptTypes} from 'node:module';
import {SourceTextModule,runInNewContext} from 'node:vm';
import test from 'node:test';
import {applyAuxBillingReturnFallback} from './aux-billing-return-fallback.mjs';
const repository='/Users/rcourson/Documents/Vibe/web/';
const pin=JSON.parse(readFileSync(new URL('../../docs/integration/proposed/aux-billing-return-fallback/inputs.json',import.meta.url),'utf8'));
const original=readFileSync(repository+'out/provided-source-snapshot-1.26.1016.1852/agent/'+pin.path,'utf8');
const composed=readFileSync(repository+'out/provided-reuse-aux-runtime-envelope/ui/agent/'+pin.path,'utf8');
const run=(text,profile)=>applyAuxBillingReturnFallback({component:'agent',path:pin.path,text,original},profile?{enableCloud:true,profile}:{});
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
function cloudValidator(origin) {
 const source=readFileSync(repository+'services/aux-cloud/src/billing.ts','utf8');
 const start=source.indexOf('export function returnUrl('),end=source.indexOf('\n\nasync function ownedCustomer',start);
 assert.ok(start>=0&&end>start);
 const context={URL,process:{env:{NEXT_PUBLIC_APP_URL:origin}},HTTPException:class extends Error{constructor(status,{message}){super(message);this.status=status;}}};
 runInNewContext(stripTypeScriptTypes(source.slice(start,end),{mode:'strip'}).replace('export function','function'),context);
 return context.returnUrl;
}
function ui(text,window) {
 const start=text.indexOf('async function $(e)'),end=text.indexOf('function Ke(',start);assert.ok(start>=0&&end>start);
 const context={URL,T:'http://127.0.0.1:21520',ve:async()=>({profileId:'synthetic-profile',windowId:9}),...(window?{window}:{})};
 runInNewContext(text.slice(start,end),context);return context.$;
}
test('actual hosted account route and origin validator sources are pinned; original foreign fallback rejects',()=>{
 for(const source of pin.cloudContractSources)assert.equal(sha(readFileSync(repository+source.path)),source.sha256,source.path);
 const account=readFileSync(repository+'services/aux-cloud/app/account/page.tsx','utf8');
 assert.ok(account.includes('if(!session.userId) return session.redirectToSignIn()'));
 const development=JSON.parse(readFileSync(repository+'services/aux-cloud/config/deployment-resources.json','utf8'));
 assert.equal(development.development.appOrigin,pin.appOrigins.development);
 const production=JSON.parse(readFileSync(repository+'services/aux-cloud/evidence/production-public-origins.json','utf8'));
 assert.equal(production.settings.AUX_ALLOWED_ORIGINS,pin.appOrigins.production);
 for(const origin of Object.values(pin.appOrigins)){const validate=cloudValidator(origin);assert.equal(validate(origin+'/account'),origin+'/account');assert.throws(()=>validate('https://asidehq.com'),/Unrecognized/);assert.throws(()=>validate('https://getaux.co/account'),/Unrecognized/);}
});
test('actual original/completed UI module changes only SSR branch and pairs with actual cloud return validator',async()=>{
 for(const text of [original,composed])for(const profile of ['development','production']) {
  const result=run(text,profile),destination=pin.appOrigins[profile]+'/account';new SourceTextModule(result.text);
  assert.equal(result.anchors.length,1);const anchor=result.anchors[0];assert.equal(text.split(anchor.find).length-1,1);
  assert.equal(result.text.replace(anchor.replace,anchor.find),text);
  const fallback=await ui(result.text)();assert.equal(fallback,destination);assert.equal(cloudValidator(pin.appOrigins[profile])(fallback),destination);
  for(const window of [{location:{protocol:'https:',href:pin.appOrigins[profile]+'/account?view=billing'}},{location:{protocol:'chrome-extension:',href:'chrome-extension://synthetic/main.html'}}]) {
   assert.equal(await ui(result.text,window)(42),await ui(text,window)(42));
  }
  const native=new URL(await ui(result.text,{location:{protocol:'chrome-extension:'}})(42));
  assert.equal(native.origin,'http://127.0.0.1:21520');assert.equal(native.pathname,'/billing/return');assert.equal(native.searchParams.get('accountId'),'42');assert.equal(native.searchParams.get('profileId'),'synthetic-profile');assert.equal(native.searchParams.get('windowId'),'9');
  assert.throws(()=>run(result.text,profile),/drift|repeated/);
 }
});
test('local mode stays inert; cloud source drift or unsupported profile rejects',()=>{
 assert.equal(run(composed).text,composed);assert.equal(run(composed).anchors.length,0);
 assert.throws(()=>applyAuxBillingReturnFallback({component:'agent',path:pin.path,text:composed,original:original+' '},{enableCloud:true,profile:'development'}),/source pin/);
 assert.throws(()=>applyAuxBillingReturnFallback({component:'agent',path:pin.path,text:composed,original},{enableCloud:true,profile:'unknown'}),/reviewed/);
});
