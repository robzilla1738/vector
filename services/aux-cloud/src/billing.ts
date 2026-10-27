import { Hono } from 'hono';
import { z } from 'zod';
import { sql } from './db';
import { launchCapabilities } from './launch-mode';
import type { AuthVariables } from './auth';

// Aux takes no payments. These read-only replies keep the supplied desktop
// billing views working: one free plan, no credits, no checkout.
const freePlan = { slug: 'free', name: 'Aux Free', tier: 0, active: true, features: ['Bring your own AI provider', 'Local browser and chat', 'Encrypted sync', 'Private attachments', 'Public sharing'], prices: { month: null, year: null } };
const noCredit = { add_on_balance_micros: '0', balance_micros: '0', credit_micros_per_usd: 1000000, monthly_grant_micros: '0', remaining_percent: 0, used_percent: 100, refresh_at: null };
const disabled = { error: 'Aux has no paid plans. Use your own AI provider.' };

export function billingPlansSnapshot() {
  return { ...launchCapabilities(), plans: [freePlan] };
}
async function joinedAt(userId: string) {
  const [row] = await sql`SELECT created_at FROM aux_users WHERE id=${userId}`;
  return new Date(row.created_at).toISOString();
}
export const billingRoutes = new Hono<{ Variables: AuthVariables }>();
billingRoutes.get('/plans', c => c.json(billingPlansSnapshot()));
billingRoutes.get('/subscription', async c => c.json({ ...launchCapabilities(), joined_at: await joinedAt(c.get('user').id), subscription: null, credit: noCredit, addOn: null, autoReload: null, paymentMethod: null, invoices: [] }));
billingRoutes.get('/v2/subscription', async c => c.json({ ...launchCapabilities(), joined_at: await joinedAt(c.get('user').id), subscription: null, credit: noCredit, addOn: null }));
billingRoutes.get('/v2/usage', c => {
  z.object({ start: z.iso.datetime(), end: z.iso.datetime() }).passthrough().parse(c.req.query());
  return c.json({ items: [], has_more: false });
});
billingRoutes.all('*', c => c.json(disabled, 404));
