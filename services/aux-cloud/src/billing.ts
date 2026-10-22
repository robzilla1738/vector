import { randomUUID } from 'node:crypto';
import Stripe from 'stripe';
import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { z } from 'zod';
import { sql } from './db';
import { ensureWallet } from './usage';
import type { AuthVariables, AuthUser } from './auth';

export const plans = [
  { slug: 'free', name: 'Aux Free', tier: 0, monthlyPriceCents: 0, yearlyPriceCents: 0, monthlyCreditMicros: 250000, features: ['Bring your own AI provider', 'Local browser and chat', '25¢ introductory hosted allowance'] },
  { slug: 'pro', name: 'Aux Pro', tier: 1, monthlyPriceCents: 2000, yearlyPriceCents: 20000, monthlyCreditMicros: 5000000, features: ['$5 hosted service credits per month', 'Unused credits roll over', 'Encrypted sync', 'Private attachments', 'Public sharing'] },
  { slug: 'max', name: 'Aux Max', tier: 2, monthlyPriceCents: 6000, yearlyPriceCents: 60000, monthlyCreditMicros: 20000000, features: ['$20 hosted service credits per month', 'Unused credits roll over', 'Expanded attachment storage', 'Encrypted sync', 'Public sharing'] },
] as const;
const addOn = { autoReload: { defaultChargeCents: 1000, defaultSpendLimitCents: 5000, defaultThresholdCents: 200, minChargeCents: 500, minSpendLimitCents: 1000 }, creditMicrosPerUsd: 1000000, discountTiers: [], maxChargeCents: 10000, minChargeCents: 1000, presets: [1000, 2500, 5000].map(creditCents => ({ creditCents, creditMicros: String(creditCents * 10000), discountPercent: 0 })) };
const lookup = z.enum(['aside_pro_month', 'aside_pro_year', 'aside_max_month', 'aside_max_year']);
const idOf = (object: string | { id: string } | null | undefined): string | null => typeof object === 'string' ? object : object?.id ?? null;
const terminal = new Set(['canceled', 'incomplete_expired']);
function stripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key || (key.startsWith('sk_live_') && process.env.AUX_LIVE_BILLING !== 'true')) throw new HTTPException(503, { message: 'Aux billing is not enabled in this environment.' });
  return new Stripe(key, { maxNetworkRetries: 2, timeout: 20000 });
}
function priceEnv(key: string) { return `STRIPE_PRICE_${key.replace('aside_', '').toUpperCase()}`; }
function planForPrice(price: string) { return plans.find(plan => plan.slug !== 'free' && ['MONTH', 'YEAR'].some(interval => process.env[`STRIPE_PRICE_${plan.slug.toUpperCase()}_${interval}`] === price)); }

export function returnUrl(value: string) {
  let url: URL;
  try { url = new URL(value); } catch { throw new HTTPException(400, { message: 'Invalid billing return URL.' }); }
  const allowed = (process.env.AUX_BILLING_RETURN_ORIGINS || process.env.NEXT_PUBLIC_APP_URL || 'https://app.getaux.co').split(',').map(origin => origin.trim());
  const local = url.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(url.hostname) && url.port === '21520' && url.pathname === '/billing/return';
  const hosted = url.protocol === 'https:' && allowed.includes(url.origin);
  if (url.username || url.password || (!local && !hosted)) throw new HTTPException(400, { message: 'Unrecognized billing return URL.' });
  return url.href;
}

async function ownedCustomer(client: Stripe, customerId: string, userId: string) {
  const remote = await client.customers.retrieve(customerId, { expand: ['invoice_settings.default_payment_method'] });
  if (remote.deleted || remote.metadata.aux_user_id !== userId) throw new HTTPException(409, { message: 'Billing customer ownership could not be verified.' });
  return remote;
}
async function customer(client: Stripe, user: Pick<AuthUser, 'id' | 'email'>) {
  const rows = await sql`SELECT stripe_customer_id FROM aux_subscriptions WHERE user_id=${user.id}`;
  if (rows[0]?.stripe_customer_id) { await ownedCustomer(client, rows[0].stripe_customer_id, user.id); return String(rows[0].stripe_customer_id); }
  const created = await client.customers.create({ email: user.email, metadata: { aux_user_id: user.id } }, { idempotencyKey: `aux-customer-${user.id}` });
  const saved = await sql`INSERT INTO aux_subscriptions(user_id,stripe_customer_id) VALUES(${user.id},${created.id})
    ON CONFLICT(user_id) DO UPDATE SET stripe_customer_id=coalesce(aux_subscriptions.stripe_customer_id,excluded.stripe_customer_id) RETURNING stripe_customer_id`;
  if (saved[0]?.stripe_customer_id !== created.id) { await ownedCustomer(client, saved[0].stripe_customer_id, user.id); return String(saved[0].stripe_customer_id); }
  return created.id;
}

export function invoiceSubscription(invoice: Stripe.Invoice): string | null { return idOf(invoice.parent?.subscription_details?.subscription); }
async function reconcileSubscription(client: Stripe, subscription: Stripe.Subscription, eventCreated = 0) {
  const customerId = idOf(subscription.customer);
  if (!customerId) return null;
  const owner = await sql`SELECT user_id,stripe_subscription_id,status FROM aux_subscriptions WHERE stripe_customer_id=${customerId}`;
  if (!owner[0] || subscription.metadata.aux_user_id !== owner[0].user_id) return null;
  await ownedCustomer(client, customerId, owner[0].user_id);
  const item = subscription.items.data[0];
  const plan = item && subscription.items.data.length === 1 && item.quantity === 1 ? planForPrice(item.price.id) : undefined;
  if (!plan) throw new HTTPException(409, { message: 'Subscription uses an unrecognized Aux price.' });
  if (owner[0].stripe_subscription_id && owner[0].stripe_subscription_id !== subscription.id && terminal.has(owner[0].status)) await ensureWallet(owner[0].user_id);
  const rows = await sql`UPDATE aux_subscriptions SET stripe_subscription_id=${subscription.id},plan=${plan.slug},status=${subscription.status},
      interval=${item.price.recurring?.interval === 'year' ? 'year' : 'month'},period_start=${new Date(item.current_period_start * 1000).toISOString()},
      period_end=${new Date(item.current_period_end * 1000).toISOString()},cancel_at_period_end=${subscription.cancel_at_period_end},
      credit_anchor=CASE WHEN stripe_subscription_id IS DISTINCT FROM ${subscription.id} THEN NULL ELSE credit_anchor END,
      paid_through=CASE WHEN stripe_subscription_id IS DISTINCT FROM ${subscription.id} THEN NULL WHEN ${subscription.status}='canceled' AND ${subscription.ended_at ? new Date(subscription.ended_at * 1000).toISOString() : null}::timestamptz IS NOT NULL THEN least(paid_through,${subscription.ended_at ? new Date(subscription.ended_at * 1000).toISOString() : null}::timestamptz) ELSE paid_through END,
      paid_monthly_grant_micros=CASE WHEN stripe_subscription_id IS DISTINCT FROM ${subscription.id} THEN 0 ELSE paid_monthly_grant_micros END,
      paid_invoice_created=CASE WHEN stripe_subscription_id IS DISTINCT FROM ${subscription.id} THEN 0 ELSE paid_invoice_created END,
      stripe_event_created=greatest(stripe_event_created,${eventCreated}),updated_at=now()
    WHERE user_id=${owner[0].user_id} AND (stripe_subscription_id IS NULL OR stripe_subscription_id=${subscription.id} OR status IN ('canceled','incomplete_expired'))
      AND (${eventCreated}=0 OR stripe_event_created<=${eventCreated}) RETURNING user_id`;
  return rows[0] ? String(rows[0].user_id) : owner[0].stripe_subscription_id === subscription.id ? String(owner[0].user_id) : null;
}

async function registerPaidInvoice(client: Stripe, invoice: Stripe.Invoice, eventCreated = 0) {
  const subscriptionId = invoiceSubscription(invoice);
  if (!subscriptionId || invoice.status !== 'paid' || invoice.currency !== 'usd') return;
  const current = await client.subscriptions.retrieve(subscriptionId);
  const userId = await reconcileSubscription(client, current, eventCreated);
  if (!userId) return;
  // Read subscription invoice lines so a proration or tax line cannot choose an unrelated plan.
  const lines = await client.invoices.listLineItems(invoice.id, { limit: 100 }).autoPagingToArray({ limit: 1000 });
  const candidates = lines.filter(line => line.amount >= 0 && idOf(line.subscription) === current.id && line.pricing?.type === 'price_details' && line.pricing.price_details?.price && planForPrice(String(line.pricing.price_details.price)));
  const line = candidates.sort((a, b) => b.period.end - a.period.end || b.period.start - a.period.start)[0];
  if (!line?.pricing?.price_details?.price || line.amount < 0) return;
  const paidPlan = planForPrice(String(line.pricing.price_details.price));
  const paidEnd = current.status === 'canceled' && current.ended_at ? Math.min(line.period.end, current.ended_at) : line.period.end;
  if (!paidPlan || paidEnd <= line.period.start) return;
  await sql`UPDATE aux_subscriptions SET
      credit_anchor=least(coalesce(credit_anchor,${new Date(line.period.start * 1000).toISOString()}::timestamptz),${new Date(line.period.start * 1000).toISOString()}::timestamptz),
      paid_through=greatest(coalesce(paid_through,${new Date(paidEnd * 1000).toISOString()}::timestamptz),${new Date(paidEnd * 1000).toISOString()}::timestamptz),
      paid_monthly_grant_micros=CASE WHEN paid_invoice_created<=${invoice.created} THEN ${paidPlan.monthlyCreditMicros} ELSE paid_monthly_grant_micros END,
      paid_invoice_created=greatest(paid_invoice_created,${invoice.created})
    WHERE user_id=${userId} AND stripe_subscription_id=${current.id}`;
  await ensureWallet(userId);
}

function disabledAutoReload() {
  return { canAutoReload: false, enabled: false, lastError: null, maxSpendCents: 5000, periodStart: new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), 1)).toISOString(), reloadChargeCents: 1000, spentCents: 0, thresholdCents: 200, thresholdMicros: '2000000' };
}
export function paymentMethodSnapshot(method: Stripe.PaymentMethod | null) {
  if (method?.type === 'card' && method.card) return { type: 'card' as const, brand: method.card.brand, expMonth: method.card.exp_month, expYear: method.card.exp_year, last4: method.card.last4 };
  return method?.type === 'link' ? { type: 'link' as const } : null;
}
async function snapshot(userId: string) {
  let remoteInvoices: Stripe.Invoice[] = [], paymentMethod: ReturnType<typeof paymentMethodSnapshot> = null;
  const mapped = await sql`SELECT stripe_customer_id,stripe_subscription_id FROM aux_subscriptions WHERE user_id=${userId}`;
  if (mapped[0]?.stripe_customer_id) {
    const client = stripe(), remote = await ownedCustomer(client, mapped[0].stripe_customer_id, userId);
    let defaultPayment: string | Stripe.PaymentMethod | null = remote.invoice_settings.default_payment_method;
    if (mapped[0].stripe_subscription_id) {
      const current = await client.subscriptions.retrieve(mapped[0].stripe_subscription_id, { expand: ['default_payment_method', 'latest_invoice'] });
      await reconcileSubscription(client, current);
      if (current.latest_invoice && typeof current.latest_invoice !== 'string' && current.latest_invoice.status === 'paid') await registerPaidInvoice(client, current.latest_invoice);
      defaultPayment = current.default_payment_method || defaultPayment;
    }
    if (defaultPayment) paymentMethod = paymentMethodSnapshot(typeof defaultPayment === 'string' ? await client.paymentMethods.retrieve(defaultPayment) : defaultPayment);
    const invoices = await client.invoices.list({ customer: remote.id, limit: 25 });
    remoteInvoices = invoices.data;
  }
  await ensureWallet(userId);
  const [users, subscriptions, wallets] = await Promise.all([sql`SELECT created_at FROM aux_users WHERE id=${userId}`, sql`SELECT * FROM aux_subscriptions WHERE user_id=${userId}`, sql`SELECT * FROM aux_wallets WHERE user_id=${userId}`]);
  const sub = subscriptions[0], wallet = wallets[0], plan = plans.find(plan => plan.slug === sub?.plan) || plans[0];
  const remaining = Math.max(0, Math.min(100, Math.round(Number(wallet.balance_micros) / Math.max(1, Number(wallet.grant_micros)) * 100)));
  return { joined_at: new Date(users[0].created_at).toISOString(), subscription: sub?.stripe_subscription_id ? { plan: { slug: plan.slug, name: plan.name, tier: plan.tier }, status: sub.status, interval: sub.interval, currentPeriodStart: sub.period_start ? new Date(sub.period_start).toISOString() : null, currentPeriodEnd: sub.period_end ? new Date(sub.period_end).toISOString() : null, cancelAtPeriodEnd: sub.cancel_at_period_end, features: plan.features } : null,
    credit: { add_on_balance_micros: String(wallet.add_on_balance_micros), balance_micros: String(wallet.balance_micros), credit_micros_per_usd: 1000000, monthly_grant_micros: String(wallet.grant_micros), remaining_percent: remaining, used_percent: 100 - remaining, refresh_at: new Date(wallet.refresh_at).toISOString() }, addOn, autoReload: disabledAutoReload(), paymentMethod,
    invoices: remoteInvoices.map(invoice => ({ amountPaid: invoice.amount_paid, createdAt: new Date(invoice.created * 1000).toISOString(), currency: invoice.currency, hostedInvoiceUrl: invoice.hosted_invoice_url, id: invoice.id, invoicePdf: invoice.invoice_pdf, number: invoice.number, status: invoice.status, total: invoice.total })) };
}

async function checkoutRequest(userId: string, mode: 'subscription' | 'payment', key: string) {
  const id = randomUUID();
  await sql`INSERT INTO aux_checkout_requests(user_id,mode,request_id,request_key,expires_at) VALUES(${userId},${mode},${id},${key},now()+interval '1 hour')
    ON CONFLICT(user_id,mode) DO UPDATE SET request_id=excluded.request_id,request_key=excluded.request_key,expires_at=excluded.expires_at,session_id=NULL
    WHERE aux_checkout_requests.expires_at<now()`;
  const rows = await sql`SELECT * FROM aux_checkout_requests WHERE user_id=${userId} AND mode=${mode}`;
  if (rows[0].request_key !== key) throw new HTTPException(409, { message: 'Another checkout is open. Complete or close it before starting a different purchase.' });
  return rows[0];
}

export const billingRoutes = new Hono<{ Variables: AuthVariables }>();
export function billingPlansSnapshot() {
  return { plans: plans.map(plan => ({
    slug: plan.slug, name: plan.name, tier: plan.tier, active: true, features: plan.features,
    prices: {
      month: plan.slug === 'free' ? null : { currency: 'usd', unitAmount: plan.monthlyPriceCents, interval: 'month', lookupKey: process.env[`STRIPE_PRICE_${plan.slug.toUpperCase()}_MONTH`] ? `aside_${plan.slug}_month` : null },
      year: plan.slug === 'free' ? null : { currency: 'usd', unitAmount: plan.yearlyPriceCents, interval: 'year', lookupKey: process.env[`STRIPE_PRICE_${plan.slug.toUpperCase()}_YEAR`] ? `aside_${plan.slug}_year` : null },
    },
  })) };
}
billingRoutes.get('/plans', c => c.json(billingPlansSnapshot()));
billingRoutes.get('/subscription', async c => c.json(await snapshot(c.get('user').id)));
billingRoutes.get('/v2/subscription', async c => { const { joined_at, subscription, credit, addOn: pricing } = await snapshot(c.get('user').id); return c.json({ joined_at, subscription, credit, addOn: pricing }); });
billingRoutes.get('/v2/usage', async c => {
  const params = z.object({ start: z.iso.datetime(), end: z.iso.datetime(), limit: z.coerce.number().int().min(1).max(100).default(100), offset: z.coerce.number().int().min(0).max(100000).default(0) }).refine(p => p.start <= p.end, 'Usage range is reversed.').parse(c.req.query());
  const rows = await sql`SELECT * FROM aux_usage WHERE user_id=${c.get('user').id} AND created_at>=${params.start} AND created_at<=${params.end} AND state='charged' ORDER BY created_at DESC,id LIMIT ${params.limit + 1} OFFSET ${params.offset}`;
  return c.json({ items: rows.slice(0, params.limit).map(row => ({ id: row.id, charged_micros: String(row.cost_micros), created_at: new Date(row.created_at).toISOString(), model_id: null, model_provider: 'aux', session_id: null, session_title: null, usage_kind: row.kind })), has_more: rows.length > params.limit });
});
billingRoutes.post('/checkout', async c => {
  const data = z.object({ lookupKey: lookup, returnUrl: z.url() }).parse(await c.req.json());
  const priceId = process.env[priceEnv(data.lookupKey)], publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  if (!priceId || !publishableKey) throw new HTTPException(503, { message: 'This Aux plan is not configured yet.' });
  const client = stripe(), user = c.get('user'), customerId = await customer(client, user), target = returnUrl(data.returnUrl);
  const subscriptions = await client.subscriptions.list({ customer: customerId, status: 'all', limit: 100 });
  if (subscriptions.data.some(subscription => !terminal.has(subscription.status))) throw new HTTPException(409, { message: 'You already have an Aux subscription. Manage it through the billing portal.' });
  const price = await client.prices.retrieve(priceId), selected = plans.find(plan => data.lookupKey.includes(`_${plan.slug}_`))!;
  const annual = data.lookupKey.endsWith('_year');
  if (!price.active || price.currency !== 'usd' || price.unit_amount !== (annual ? selected.yearlyPriceCents : selected.monthlyPriceCents) || price.recurring?.interval !== (annual ? 'year' : 'month') || price.recurring.interval_count !== 1) throw new HTTPException(503, { message: 'The configured Aux price does not match this plan.' });
  const request = await checkoutRequest(user.id, 'subscription', JSON.stringify({ lookup: data.lookupKey, target }));
  const session = request.session_id ? await client.checkout.sessions.retrieve(request.session_id) : await client.checkout.sessions.create({ mode: 'subscription', ui_mode: 'embedded', customer: customerId, line_items: [{ price: priceId, quantity: 1 }], return_url: target, client_reference_id: user.id, subscription_data: { metadata: { aux_user_id: user.id } }, metadata: { aux_user_id: user.id }, expires_at: Math.floor(new Date(request.expires_at).getTime() / 1000) }, { idempotencyKey: `aux-checkout-${request.request_id}` });
  await sql`UPDATE aux_checkout_requests SET session_id=${session.id} WHERE user_id=${user.id} AND mode='subscription' AND request_id=${request.request_id}`;
  if (idOf(session.customer) !== customerId || session.metadata?.aux_user_id !== user.id) throw new HTTPException(409, { message: 'Checkout ownership could not be verified.' });
  if (!session.client_secret || session.status !== 'open') { await sql`UPDATE aux_checkout_requests SET expires_at=now()-interval '1 second' WHERE user_id=${user.id} AND mode='subscription' AND request_id=${request.request_id}`; throw new HTTPException(409, { message: 'This checkout has completed or expired. Refresh Billing before trying again.' }); }
  return c.json({ clientSecret: session.client_secret, publishableKey });
});
billingRoutes.post('/portal', async c => {
  const data = z.object({ returnUrl: z.url() }).parse(await c.req.json()), client = stripe();
  const session = await client.billingPortal.sessions.create({ customer: await customer(client, c.get('user')), return_url: returnUrl(data.returnUrl) });
  return c.json({ url: session.url });
});
billingRoutes.post('/add-on-checkout', async c => {
  const data = z.object({ creditCents: z.number().int().min(1000).max(10000).refine(value => value % 100 === 0), successUrl: z.url(), cancelUrl: z.url() }).parse(await c.req.json());
  const client = stripe(), user = c.get('user'), success = returnUrl(data.successUrl), cancel = returnUrl(data.cancelUrl), customerId = await customer(client, user);
  const request = await checkoutRequest(user.id, 'payment', JSON.stringify({ cents: data.creditCents, success, cancel }));
  const metadata = { aux_user_id: user.id, aux_credit_micros: String(data.creditCents * 10000) };
  const session = request.session_id ? await client.checkout.sessions.retrieve(request.session_id) : await client.checkout.sessions.create({ mode: 'payment', customer: customerId, line_items: [{ price_data: { currency: 'usd', unit_amount: data.creditCents, product_data: { name: 'Aux service credits' } }, quantity: 1 }], success_url: success, cancel_url: cancel, metadata, payment_intent_data: { metadata }, expires_at: Math.floor(new Date(request.expires_at).getTime() / 1000) }, { idempotencyKey: `aux-checkout-${request.request_id}` });
  await sql`UPDATE aux_checkout_requests SET session_id=${session.id} WHERE user_id=${user.id} AND mode='payment' AND request_id=${request.request_id}`;
  if (idOf(session.customer) !== customerId || session.metadata?.aux_user_id !== user.id) throw new HTTPException(409, { message: 'Checkout ownership could not be verified.' });
  if (!session.url || session.status !== 'open') { await sql`UPDATE aux_checkout_requests SET expires_at=now()-interval '1 second' WHERE user_id=${user.id} AND mode='payment' AND request_id=${request.request_id}`; throw new HTTPException(409, { message: 'This credit checkout has completed or expired. Refresh Billing before trying again.' }); }
  return c.json({ url: session.url });
});
billingRoutes.post('/auto-reload', c => c.json({ error: 'Automatic reload is unavailable; purchase credits explicitly.' }, 409));

export async function cancelUserSubscription(userId: string) {
  const rows = await sql`SELECT stripe_customer_id,stripe_subscription_id FROM aux_subscriptions WHERE user_id=${userId}`;
  if (!rows[0]?.stripe_subscription_id) return;
  const client = stripe();
  await ownedCustomer(client, rows[0].stripe_customer_id, userId);
  const current = await client.subscriptions.retrieve(rows[0].stripe_subscription_id);
  if (idOf(current.customer) !== rows[0].stripe_customer_id || current.metadata.aux_user_id !== userId) throw new HTTPException(409, { message: 'Subscription ownership could not be verified.' });
  if (!terminal.has(current.status)) {
    const canceled = await client.subscriptions.update(current.id, { cancel_at_period_end: true }, { idempotencyKey: `aux-account-delete-${userId}` });
    await reconcileSubscription(client, canceled);
  }
}

async function grantPurchasedCredits(client: Stripe, session: Stripe.Checkout.Session) {
  const userId = session.metadata?.aux_user_id, amount = Number(session.metadata?.aux_credit_micros || 0), paymentIntent = idOf(session.payment_intent), customerId = idOf(session.customer);
  if (session.mode !== 'payment' || session.payment_status !== 'paid' || session.currency !== 'usd' || !paymentIntent || !customerId || !z.uuid().safeParse(userId).success || !Number.isSafeInteger(amount) || amount < 10000000 || amount > 100000000 || amount !== Number(session.amount_total) * 10000) return;
  const mapped = await sql`SELECT user_id FROM aux_subscriptions WHERE user_id=${userId!} AND stripe_customer_id=${customerId}`;
  if (!mapped[0]) return;
  await ownedCustomer(client, customerId, userId!);
  await ensureWallet(userId!);
  await sql`WITH grant AS (INSERT INTO aux_credit_grants(source_id,user_id,amount_micros,kind) VALUES(${paymentIntent},${userId!},${amount},'add_on') ON CONFLICT DO NOTHING RETURNING user_id)
    UPDATE aux_wallets SET balance_micros=balance_micros+greatest(0,${amount}-debt_micros),add_on_balance_micros=add_on_balance_micros+greatest(0,${amount}-debt_micros),debt_micros=greatest(0,debt_micros-${amount}) WHERE user_id IN(SELECT user_id FROM grant)`;
  const payment = await client.paymentIntents.retrieve(paymentIntent, { expand: ['latest_charge'] });
  if (payment.latest_charge && typeof payment.latest_charge !== 'string' && payment.latest_charge.amount_refunded > 0) await reconcileCreditRefund(payment.latest_charge);
}

async function reconcileCreditRefund(charge: Stripe.Charge) {
  const paymentIntent = idOf(charge.payment_intent);
  if (!paymentIntent || charge.currency !== 'usd' || charge.amount_refunded <= 0) return;
  // Only payments already granted by our Aux checkout flow can reverse a wallet.
  await sql`SELECT aux_refund_credits(${paymentIntent},${charge.id},${charge.amount_refunded * 10000})`;
}

export const billingWebhooks = new Hono();
billingWebhooks.post('/stripe', async c => {
  const signature = c.req.header('stripe-signature'), secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!signature || !secret) return c.json({ error: 'Webhook signature required.' }, 400);
  const client = stripe();
  let event: Stripe.Event;
  try { event = client.webhooks.constructEvent(await c.req.text(), signature, secret); } catch { return c.json({ error: 'Invalid webhook signature.' }, 400); }
  if (event.livemode && process.env.AUX_LIVE_BILLING !== 'true') return c.json({ error: 'Live billing is not enabled.' }, 409);
  const processed = await sql`SELECT event_id FROM aux_stripe_events WHERE event_id=${event.id}`;
  if (processed.length) return c.json({ received: true });
  if (event.type.startsWith('customer.subscription.')) {
    const object = event.data.object as Stripe.Subscription;
    const current = await client.subscriptions.retrieve(object.id);
    await reconcileSubscription(client, current, event.created);
  }
  if (event.type === 'invoice.paid') {
    const current = await client.invoices.retrieve((event.data.object as Stripe.Invoice).id);
    await registerPaidInvoice(client, current, event.created);
  }
  if (event.type === 'checkout.session.completed' || event.type === 'checkout.session.async_payment_succeeded') {
    const session = await client.checkout.sessions.retrieve((event.data.object as Stripe.Checkout.Session).id);
    await grantPurchasedCredits(client, session);
    if (session.metadata?.aux_user_id && session.status === 'complete') await sql`UPDATE aux_checkout_requests SET expires_at=now()-interval '1 second' WHERE user_id=${session.metadata.aux_user_id} AND session_id=${session.id}`;
  }
  if (event.type === 'charge.refunded') {
    const current = await client.charges.retrieve((event.data.object as Stripe.Charge).id);
    await reconcileCreditRefund(current);
  }
  await sql`INSERT INTO aux_stripe_events(event_id,type) VALUES(${event.id},${event.type}) ON CONFLICT DO NOTHING`;
  return c.json({ received: true });
});
