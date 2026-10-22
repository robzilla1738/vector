import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { runInNewContext } from 'node:vm';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { PGlite } from '@electric-sql/pglite';
import { billingPlansSnapshot, billingRoutes, invoiceSubscription, invoiceLineSubscription, subscriptionCancelsAtPeriodEnd, paymentMethodSnapshot, returnUrl } from './billing';
import type Stripe from 'stripe';

test('checkout returns only to the fixed native callback or configured HTTPS origin', () => {
  assert.equal(returnUrl('http://127.0.0.1:21520/billing/return?accountId=0'), 'http://127.0.0.1:21520/billing/return?accountId=0');
  assert.equal(returnUrl('https://app.getaux.co/settings/billing'), 'https://app.getaux.co/settings/billing');
  for (const value of ['http://localhost:21520/billing/anything', 'http://localhost:21520/billing/return/evil', 'http://localhost.evil:21520/billing/return', 'https://owner:password@app.getaux.co/', 'https://external.example/', 'javascript:alert(1)']) assert.throws(() => returnUrl(value));
});

test('billing wire helpers preserve actual invoice and payment-method shapes', () => {
  assert.equal(invoiceSubscription({ parent: { subscription_details: { subscription: 'sub_fixture' } } } as Stripe.Invoice), 'sub_fixture');
  assert.equal(invoiceLineSubscription({parent:{type:'subscription_item_details',subscription_item_details:{subscription:'sub_current'}}} as Stripe.InvoiceLineItem),'sub_current');
  assert.equal(invoiceLineSubscription({subscription:'sub_legacy'} as Stripe.InvoiceLineItem),'sub_legacy');
  assert.equal(invoiceLineSubscription({subscription:'sub_legacy',parent:{type:'subscription_item_details',subscription_item_details:{subscription:'sub_current'}}} as Stripe.InvoiceLineItem),'sub_current');
  assert.equal(invoiceLineSubscription({subscription:'sub_legacy',parent:{type:'invoice_item_details'}} as Stripe.InvoiceLineItem),null);
  const subscription={cancel_at_period_end:false,cancel_at:200,items:{data:[{current_period_end:200}]}} as Stripe.Subscription;
  assert.equal(subscriptionCancelsAtPeriodEnd(subscription),true);
  assert.equal(subscriptionCancelsAtPeriodEnd({...subscription,cancel_at:null}),false);
  assert.equal(subscriptionCancelsAtPeriodEnd({...subscription,cancel_at:199}),false);
  assert.equal(subscriptionCancelsAtPeriodEnd({...subscription,cancel_at:null,cancel_at_period_end:true}),true);
  assert.equal(paymentMethodSnapshot(null), null);
  assert.deepEqual(paymentMethodSnapshot({ type: 'card', card: { brand: 'visa', exp_month: 12, exp_year: 2030, last4: '4242' } } as Stripe.PaymentMethod), { type: 'card', brand: 'visa', expMonth: 12, expYear: 2030, last4: '4242' });
  assert.deepEqual(paymentMethodSnapshot({ type: 'link' } as Stripe.PaymentMethod), { type: 'link' });
});

test('actual PostgreSQL migration and usage SQL preserve credit pools, annual monthly grants and refund idempotency', async () => {
  const pg = new PGlite();
  try {
    await pg.exec('CREATE TABLE aux_users(id uuid PRIMARY KEY);');
    await pg.exec(await readFile(new URL('../migrations/003-billing.sql', import.meta.url), 'utf8'));
    // Execute the production tagged-template SQL itself, not a mirrored implementation.
    const queries = [...(await readFile(new URL('./usage.ts', import.meta.url), 'utf8')).matchAll(/sql`([\s\S]*?)`/g)].map(match => match[1]!);
    assert.equal(queries.length, 4);
    const execute = async (index: number, context: Record<string, unknown>) => {
      const params: unknown[] = [];
      const text = queries[index]!.replace(/\$\{([^}]+)\}/g, (_, expression: string) => {
        params.push(Function(...Object.keys(context), `return (${expression})`)(...Object.values(context)));
        return `$${params.length}`;
      });
      return (await pg.query(text, params)).rows;
    };
    const userId = '00000000-0000-4000-8000-000000000001', id = '00000000-0000-4000-8000-000000000002';
    await pg.query('INSERT INTO aux_users VALUES($1)', [userId]);
    await execute(0, { userId });
    await pg.query('UPDATE aux_wallets SET balance_micros=1000,add_on_balance_micros=400 WHERE user_id=$1', [userId]);
    await execute(1, { id, userId, amount: 800, kind: 'inference_micros', units: 800 });
    const wallet = async () => (await pg.query('SELECT balance_micros,add_on_balance_micros,debt_micros FROM aux_wallets WHERE user_id=$1', [userId])).rows[0];
    assert.deepEqual(await wallet(), { balance_micros: 200, add_on_balance_micros: 200, debt_micros: 0 });
    await execute(3, { id, amount: 500, result: { succeeded: true }, units: 500 });
    assert.deepEqual(await wallet(), { balance_micros: 500, add_on_balance_micros: 400, debt_micros: 0 });
    await execute(3, { id, amount: 0, result: { succeeded: false }, units: 0 });
    assert.deepEqual(await wallet(), { balance_micros: 500, add_on_balance_micros: 400, debt_micros: 0 });
    const nextId = '00000000-0000-4000-8000-000000000003';
    await execute(1, { id: nextId, userId, amount: 400, kind: 'inference_micros', units: 400 });
    await execute(3, { id: nextId, amount: 1000, result: { succeeded: true }, units: 1000 });
    assert.deepEqual(await wallet(), { balance_micros: 0, add_on_balance_micros: 0, debt_micros: 500 });
    const anchor = new Date(); anchor.setUTCMonth(anchor.getUTCMonth() - 3); anchor.setUTCDate(1);
    const through = new Date(anchor); through.setUTCFullYear(through.getUTCFullYear() + 1);
    await pg.query("INSERT INTO aux_subscriptions(user_id,stripe_customer_id,stripe_subscription_id,plan,status,interval,credit_anchor,paid_through,paid_monthly_grant_micros) VALUES($1,'cus_fixture','sub_fixture','pro','active','year',$2,$3,5000000)", [userId, anchor.toISOString(), through.toISOString()]);
    await execute(0, { userId });
    assert.deepEqual(await wallet(), { balance_micros: 19999500, add_on_balance_micros: 0, debt_micros: 0 });
    assert.equal(Number((await pg.query<{ n: number }>('SELECT count(*) AS n FROM aux_credit_periods')).rows[0]!.n), 4);
    await execute(0, { userId });
    assert.equal((await wallet() as { balance_micros: number }).balance_micros, 19999500);
    await pg.query("UPDATE aux_subscriptions SET plan='max',paid_monthly_grant_micros=20000000 WHERE user_id=$1", [userId]);
    await execute(0, { userId });
    assert.equal((await wallet() as { balance_micros: number }).balance_micros, 34999500); // Only the current month gets a $15 upgrade.
    await pg.query("UPDATE aux_subscriptions SET status='canceled' WHERE user_id=$1", [userId]);
    await execute(0, { userId });
    assert.equal((await wallet() as { balance_micros: number }).balance_micros, 34999500);
    await pg.query('UPDATE aux_wallets SET balance_micros=2500,add_on_balance_micros=2000 WHERE user_id=$1', [userId]);
    await pg.query("INSERT INTO aux_credit_grants(source_id,user_id,amount_micros,kind) VALUES('pi_fixture',$1,2000,'add_on')", [userId]);
    await pg.query("SELECT aux_refund_credits('pi_fixture','ch_fixture',500)");
    await pg.query("SELECT aux_refund_credits('pi_fixture','ch_fixture',1000)");
    await pg.query("SELECT aux_refund_credits('pi_fixture','ch_fixture',500)"); // Out-of-order older refund cannot reverse twice.
    assert.deepEqual(await wallet(), { balance_micros: 1500, add_on_balance_micros: 1000, debt_micros: 0 });
    const expiredUser = '00000000-0000-4000-8000-000000000004';
    const expiredAnchor = new Date(); expiredAnchor.setUTCMonth(expiredAnchor.getUTCMonth() - 13); expiredAnchor.setUTCDate(1);
    const expiredThrough = new Date(expiredAnchor); expiredThrough.setUTCFullYear(expiredThrough.getUTCFullYear() + 1);
    await pg.query('INSERT INTO aux_users VALUES($1)', [expiredUser]);
    await pg.query("INSERT INTO aux_subscriptions(user_id,stripe_customer_id,stripe_subscription_id,plan,status,interval,credit_anchor,paid_through,paid_monthly_grant_micros) VALUES($1,'cus_expired','sub_expired','pro','canceled','year',$2,$3,5000000)", [expiredUser, expiredAnchor.toISOString(), expiredThrough.toISOString()]);
    await execute(0, { userId: expiredUser });
    const expiredWallet = (await pg.query<{ balance_micros: number }>('SELECT balance_micros FROM aux_wallets WHERE user_id=$1', [expiredUser])).rows[0]!;
    assert.equal(expiredWallet.balance_micros, 60250000); // All twelve paid months accrue even if the user was offline.

  } finally { await pg.close(); }
});

test('the actual pinned Agent pricing consumer renders the hosted plans and checkout lookup keys', async () => {
  const fixture = await readFile(new URL('../test-fixtures/provided-pricing-table-shared.js', import.meta.url), 'utf8');
  assert.equal(createHash('sha256').update(fixture).digest('hex'), '5e5bb01e9e3d391b7522a8f00f62d17ded5c7705a1157a55026e09957607d642');
  const exportStatement = 'export{m as a,f as i,s as n,l as o,c as r,a as s,u as t};';
  assert.equal(fixture.split(exportStatement).length - 1, 1);
  const context: { Intl: typeof Intl; parsePlans?: (plans: unknown[]) => unknown[] } = { Intl };
  runInNewContext(fixture.replace(exportStatement, 'globalThis.parsePlans = a;'), context, { timeout: 1000 });
  const keys = ['STRIPE_PRICE_PRO_MONTH', 'STRIPE_PRICE_PRO_YEAR', 'STRIPE_PRICE_MAX_MONTH', 'STRIPE_PRICE_MAX_YEAR'];
  const previous = Object.fromEntries(keys.map(key => [key, process.env[key]]));
  try {
    for (const key of keys) process.env[key] = `price_fixture_${key.toLowerCase()}`;
    const response = await billingRoutes.request('/plans');
    assert.equal(response.status, 200);
    const body = await response.json() as ReturnType<typeof billingPlansSnapshot>;
    const rendered = JSON.parse(JSON.stringify(context.parsePlans!(body.plans)));
    assert.equal(rendered.length, 3);
    assert.equal(rendered[0].id, 'free');
    assert.equal(rendered[0].prices.monthly.amount, '$0');
    assert.deepEqual(rendered[1].prices.monthly, { amount: '$20', lookupKey: 'aux_pro_month', suffix: '/mo' });
    assert.deepEqual(rendered[1].prices.yearly, { amount: '$200', lookupKey: 'aux_pro_year', suffix: '/yr' });
    assert.deepEqual(rendered[2].prices.monthly, { amount: '$60', lookupKey: 'aux_max_month', suffix: '/mo' });
    assert.equal(rendered[2].features[0].text, '$20 hosted service credits per month');
    delete process.env.STRIPE_PRICE_MAX_YEAR;
    assert.equal(billingPlansSnapshot().plans[2]!.prices.year?.lookupKey, null);
  } finally {
    for (const key of keys) { if (previous[key] === undefined) delete process.env[key]; else process.env[key] = previous[key]; }
  }
});

test('sandbox billing refuses both unrestricted and restricted live keys before provider access', async () => {
  const {billingWebhooks}=await import('./billing');
  const previous={key:process.env.STRIPE_SECRET_KEY,secret:process.env.STRIPE_WEBHOOK_SECRET,live:process.env.AUX_LIVE_BILLING};
  try {
    process.env.STRIPE_WEBHOOK_SECRET='synthetic-webhook-fixture-only';
    delete process.env.AUX_LIVE_BILLING;
    for(const prefix of ['sk','rk']) {
      process.env.STRIPE_SECRET_KEY=prefix+'_live_'+'synthetic-fixture';
      const response=await billingWebhooks.request('/stripe',{method:'POST',headers:{'stripe-signature':'synthetic','Content-Type':'application/json'},body:'{}'});
      assert.equal(response.status,503);
    }
  } finally {
    for(const [name,value] of Object.entries({STRIPE_SECRET_KEY:previous.key,STRIPE_WEBHOOK_SECRET:previous.secret,AUX_LIVE_BILLING:previous.live})) {
      if(value===undefined)delete process.env[name];else process.env[name]=value;
    }
  }
});


test('the production purchased-credit SQL grants once, pays debt and isolates other wallets', async () => {
  const pg=new PGlite();
  try {
    await pg.exec('CREATE TABLE aux_users(id uuid PRIMARY KEY);');
    await pg.exec(await readFile(new URL('../migrations/003-billing.sql',import.meta.url),'utf8'));
    const source=await readFile(new URL('./billing.ts',import.meta.url),'utf8');
    const query=/sql`(WITH credited_grant AS[\s\S]*?)`/.exec(source)?.[1];assert.ok(query);
    const first='00000000-0000-4000-8000-000000000011',second='00000000-0000-4000-8000-000000000012';
    for(const id of [first,second]){await pg.query('INSERT INTO aux_users VALUES($1)',[id]);await pg.query('INSERT INTO aux_wallets(user_id,balance_micros,add_on_balance_micros,debt_micros) VALUES($1,0,0,300)',[id]);}
    async function grant(userId:string,paymentIntent:string,amount:number){
      const context:Record<string,unknown>={userId,paymentIntent,amount},params:unknown[]=[];
      const text=query!.replace(/\$\{([^}]+)\}/g,(_,expression:string)=>{const key=expression.replace(/!$/,'');assert.ok(Object.hasOwn(context,key));params.push(context[key]);return '$'+params.length;});
      await pg.query(text,params);
    }
    const wallet=async(id:string)=>(await pg.query('SELECT balance_micros,add_on_balance_micros,debt_micros FROM aux_wallets WHERE user_id=$1',[id])).rows[0];
    await grant(first,'pi_disposable_fixture',10000000);
    assert.deepEqual(await wallet(first),{balance_micros:9999700,add_on_balance_micros:9999700,debt_micros:0});
    await grant(first,'pi_disposable_fixture',10000000);assert.deepEqual(await wallet(first),{balance_micros:9999700,add_on_balance_micros:9999700,debt_micros:0});
    await grant(second,'pi_disposable_fixture',10000000);assert.deepEqual(await wallet(second),{balance_micros:0,add_on_balance_micros:0,debt_micros:300});
  } finally {await pg.close();}
});
