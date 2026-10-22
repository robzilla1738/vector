/** Bounded sandbox lifecycle check: no payment method, charge or real identity. */
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import Stripe from 'stripe';
import { sql } from '../src/db';
if (process.env.AUX_CHECK_DISPOSABLE !== '1' || process.env.VERCEL_ENV === 'production') throw Error('Explicit disposable development check required.');
if (!process.env.STRIPE_SECRET_KEY?.startsWith('rk_test_')) throw Error('Only the Aux sandbox restricted key is allowed.');
if (!/^ep-spring-darkness-b824br4r(?:-pooler)?\./.test(new URL(process.env.DATABASE_URL || '').hostname)) throw Error('Unexpected database.');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const endpoint = await stripe.webhookEndpoints.retrieve('we_1UTEQcGzjaZQfVizSYHz3z5H');
assert.equal(endpoint.livemode, false);
assert.equal(endpoint.url, 'https://dev-cloud.getaux.co/api/v1/webhooks/stripe');
const userId = randomUUID(), clerkId = `aux_billing_fixture:${userId}`;
let customer: Stripe.Customer | undefined, subscription: Stripe.Subscription | undefined;
const checks: string[] = [];
async function observed(status: string) {
  for (let attempt = 0; attempt < 30; attempt++) {
    const rows = await sql`SELECT status FROM aux_subscriptions WHERE user_id=${userId}`;
    if (rows[0]?.status === status) return;
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  throw Error(`Provider-signed subscription event did not reconcile to ${status}.`);
}
try {
  await sql`INSERT INTO aux_users(id,clerk_id,email,name) VALUES(${userId},${clerkId},${`${userId}@example.invalid`},'Disposable sandbox billing fixture')`;
  customer = await stripe.customers.create({ name: 'Aux disposable sandbox fixture', metadata: { aux_user_id: userId, aux_fixture: 'true' } });
  assert.equal(customer.livemode, false);
  await sql`INSERT INTO aux_subscriptions(user_id,stripe_customer_id) VALUES(${userId},${customer.id})`;
  subscription = await stripe.subscriptions.create({ customer: customer.id, items: [{ price: process.env.STRIPE_PRICE_PRO_MONTH! }], trial_period_days: 1, trial_settings: { end_behavior: { missing_payment_method: 'cancel' } }, metadata: { aux_user_id: userId, aux_fixture: 'true' } });
  assert.equal(subscription.livemode, false);
  assert.equal(subscription.status, 'trialing');
  await observed('trialing');
  checks.push('actual Stripe-signed subscription creation reconciled by deployed webhook');
  await stripe.subscriptions.cancel(subscription.id);
  await observed('canceled');
  checks.push('actual Stripe-signed subscription cancellation reconciled by deployed webhook');
  const charges = await stripe.charges.list({ customer: customer.id, limit: 1 });
  assert.equal(charges.data.length, 0);
  checks.push('no payment method or charge used');
} finally {
  if (subscription) { const current = await stripe.subscriptions.retrieve(subscription.id); if (current.status !== 'canceled') await stripe.subscriptions.cancel(subscription.id); }
  if (customer) await stripe.customers.del(customer.id);
  await sql`DELETE FROM aux_users WHERE id=${userId} AND clerk_id=${clerkId}`;
}
await mkdir('evidence', { recursive: true });
await writeFile('evidence/stripe-lifecycle.json', JSON.stringify({ checkedAt: new Date().toISOString(), checks, fixtureRemoved: true, checkoutPaymentTested: false, livemode: false }, null, 2) + '\n');
console.log(JSON.stringify({ checks, fixtureRemoved: true, checkoutPaymentTested: false }));
