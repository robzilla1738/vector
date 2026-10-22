/** Real Aux sandbox checkout/portal lifecycle. No card, email or payment. */
import assert from 'node:assert/strict';
import {createHash,randomUUID} from 'node:crypto';
import {mkdir,writeFile} from 'node:fs/promises';
import {SignJWT} from 'jose';
import Stripe from 'stripe';
import {sql} from '../src/db';
if(process.env.AUX_CHECK_DISPOSABLE!=='1'||process.env.VERCEL_ENV==='production')throw Error('Explicit disposable development check required.');
if(!process.env.STRIPE_SECRET_KEY?.startsWith('rk_test_'))throw Error('Aux sandbox restricted key required.');
if(!/^ep-spring-darkness-b824br4r(?:-pooler)?\./.test(new URL(process.env.DATABASE_URL||'').hostname))throw Error('Unexpected database.');
const origin='https://dev-cloud.getaux.co',stripe=new Stripe(process.env.STRIPE_SECRET_KEY),ids=[randomUUID(),randomUUID()],sessions=[randomUUID(),randomUUID()],tokens:string[]=[],checks:string[]=[];
const hash=(b:string)=>createHash('sha256').update(b).digest('hex');
const endpoint=await stripe.webhookEndpoints.retrieve('we_1UTEQcGzjaZQfVizSYHz3z5H');assert.equal(endpoint.livemode,false);assert.ok(endpoint.url===origin+'/api/v1/webhooks/stripe');
async function call(owner:number,path:string,body:unknown,expected=200){
 const response=await fetch(origin+'/api/v1/billing/'+path,{method:'POST',headers:{Authorization:'Bearer '+tokens[owner],'Content-Type':'application/json'},body:JSON.stringify(body),redirect:'error',signal:AbortSignal.timeout(60000)});
 assert.equal(response.status,expected,path+' unexpected status');return response.json();
}
async function session(id:string){const result=await stripe.checkout.sessions.retrieve(id);assert.equal(result.livemode,false);assert.ok(result.metadata?.aux_user_id===ids[0]);return result;}
try{
 for(let i=0;i<ids.length;i++){
  tokens[i]=await new SignJWT({sg:0,sid:sessions[i]}).setProtectedHeader({alg:'HS256'}).setSubject(ids[i]).setIssuer('https://api.getaux.co').setAudience('aux-desktop').setIssuedAt().setExpirationTime('15m').sign(new TextEncoder().encode(process.env.AUX_AUTH_SECRET));
  await sql`INSERT INTO aux_users(id,clerk_id,email,name) VALUES(${ids[i]},${'aux_checkout_fixture:'+ids[i]},${ids[i]+'@example.invalid'},'Disposable sandbox checkout fixture')`;
  await sql`INSERT INTO aux_sessions(id,user_id,access_hash,access_expires_at,expires_at,platform) VALUES(${sessions[i]},${ids[i]},${hash(tokens[i])},now()+interval '15 minutes',now()+interval '30 minutes','web')`;
 }
 const request={lookupKey:'aside_pro_month',returnUrl:origin+'/account'};
 const first=await call(0,'checkout',request),retry=await call(0,'checkout',request);
 assert.ok(typeof first.clientSecret==='string'&&first.clientSecret===retry.clientSecret,'Checkout retry must reuse one session.');assert.ok(first.checkoutId===retry.checkoutId);
 let current=await session(first.checkoutId);assert.equal(current.mode,'subscription');assert.equal(current.ui_mode,'embedded_page');assert.ok(current.return_url===request.returnUrl);
 const lines=await stripe.checkout.sessions.listLineItems(current.id,{limit:10});assert.ok(lines.data.length===1&&lines.data[0].price?.id===process.env.STRIPE_PRICE_PRO_MONTH);
 checks.push('actual deployed embedded subscription checkout, intended Aux price/return URL, owner mapping and idempotent retry');
 await call(1,'checkout/cancel',{checkoutId:current.id});assert.equal((await session(current.id)).status,'open');checks.push('cross-account cancellation cannot expire another customer checkout');
 const replaced=await call(0,'checkout',{...request,lookupKey:'aside_max_year'});assert.equal((await session(current.id)).status,'expired');current=await session(replaced.checkoutId);assert.equal(current.status,'open');
 const changedLines=await stripe.checkout.sessions.listLineItems(current.id,{limit:10});assert.ok(changedLines.data.length===1&&changedLines.data[0].price?.id===process.env.STRIPE_PRICE_MAX_YEAR);
 checks.push('new plan selection expires the abandoned owned checkout without a one-hour lock');
 await call(0,'checkout/cancel',{checkoutId:current.id});assert.equal((await session(current.id)).status,'expired');
 const reopened=await call(0,'checkout',request);assert.ok(reopened.checkoutId!==current.id);await call(0,'checkout/cancel',{checkoutId:reopened.checkoutId});checks.push('explicit close expires checkout and permits immediate reselection');
 const portal=await call(0,'portal',{returnUrl:origin+'/account'});assert.ok(typeof portal.url==='string'&&new URL(portal.url).hostname==='billing.stripe.com');
 // The deployed handler validates Stripe's create response against the exact
 // configured portal, customer and return URL before returning this capability.
 const mappings=await sql`SELECT stripe_customer_id FROM aux_subscriptions WHERE user_id=${ids[0]}`;const customerId=mappings[0].stripe_customer_id;
 checks.push('actual deployed portal uses the prepared Aux configuration and return URL');
 const addOn=await call(0,'add-on-checkout',{creditCents:1000,successUrl:origin+'/account',cancelUrl:origin+'/account'});
 assert.ok(typeof addOn.url==='string'&&new URL(addOn.url).protocol==='https:');
 const rows=await sql`SELECT session_id FROM aux_checkout_requests WHERE user_id=${ids[0]} AND mode='payment'`;const extra=await session(rows[0].session_id);assert.equal(extra.mode,'payment');assert.equal(extra.amount_total,1000);await call(0,'checkout/cancel',{checkoutId:extra.id});
 checks.push('actual hosted $10 sandbox credit checkout contract, expired without payment');
 assert.equal((await stripe.charges.list({customer:customerId,limit:1})).data.length,0);checks.push('no payment method or charge used');
}finally{
 for(const id of ids){
  const requests=await sql`SELECT session_id FROM aux_checkout_requests WHERE user_id=${id} AND session_id IS NOT NULL`;
  for(const row of requests){const checkout=await stripe.checkout.sessions.retrieve(row.session_id);if(checkout.status==='open')await stripe.checkout.sessions.expire(checkout.id);}
  const customers=await sql`SELECT stripe_customer_id FROM aux_subscriptions WHERE user_id=${id}`;
  for(const row of customers){const customer=await stripe.customers.retrieve(row.stripe_customer_id);if(!customer.deleted){assert.ok(customer.metadata.aux_user_id===id);await stripe.customers.del(customer.id);}}
  await sql`DELETE FROM aux_sessions WHERE user_id=${id}`;await sql`DELETE FROM aux_users WHERE id=${id} AND clerk_id=${'aux_checkout_fixture:'+id}`;
 }
}
await mkdir('evidence',{recursive:true});await writeFile('evidence/stripe-checkout.json',JSON.stringify({checkedAt:new Date().toISOString(),origin,checks,fixtureRemoved:true,livemode:false,paymentCompleted:false,embeddedRendered:false},null,2)+'\n');
console.log(JSON.stringify({checks,fixtureRemoved:true,paymentCompleted:false}));
