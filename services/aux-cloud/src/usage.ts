import { randomUUID } from 'node:crypto';
import { HTTPException } from 'hono/http-exception';
import { sql } from './db';

const rates: Record<string, number> = { inference_micros: 1, tokens: 1, transcription: 28, speech: 15, images: 100000 };
export async function ensureWallet(userId: string) {
  await sql`SELECT aux_refresh_wallet(${userId}::uuid)`;
}
export function usageCost(kind: string, units: number) {
  if (!(kind in rates) || !Number.isSafeInteger(units) || units < 0 || units > 20000000) throw new Error('Invalid usage reservation');
  const configured = Number(process.env[`AUX_RATE_${kind.toUpperCase()}_MICROS`] || rates[kind]);
  if (!Number.isFinite(configured) || configured <= 0) throw new Error('Invalid service-credit rate');
  return Math.ceil(units * configured);
}

export async function reserveUsage(userId: string, kind: string, units: number): Promise<string> {
  await ensureWallet(userId);
  const id = randomUUID(), amount = usageCost(kind, units);
  // Lock the selected wallet before allocating the debit. Included credits are
  // consumed first; purchased credit allocation is retained for exact refunds.
  const result = await sql`WITH selected AS (
    SELECT * FROM aux_wallets WHERE user_id=${userId} AND balance_micros>=${amount} AND debt_micros=0 FOR UPDATE
  ), debit AS (
    UPDATE aux_wallets w SET balance_micros=s.balance_micros-${amount},
      add_on_balance_micros=s.add_on_balance_micros-greatest(0,${amount}-(s.balance_micros-s.add_on_balance_micros))
    FROM selected s WHERE w.user_id=s.user_id
    RETURNING w.user_id,s.add_on_balance_micros-w.add_on_balance_micros AS add_on_used
  ) INSERT INTO aux_usage(id,user_id,kind,units,cost_micros,add_on_micros_used)
    SELECT ${id},user_id,${kind},${units},${amount},add_on_used FROM debit RETURNING id`;
  if (!result.length) throw new HTTPException(402, { message: 'Your Aux service-credit allowance is exhausted. Add credits or use your own provider.' });
  return id;
}

export async function settleUsage(id: string, result: { succeeded: boolean; units?: number }) {
  // Read only the immutable reservation kind/units. The following statement
  // locks and rechecks its state, so concurrent retries cannot settle twice.
  const reservation = await sql`SELECT kind,units FROM aux_usage WHERE id=${id} AND state='reserved'`;
  if (!reservation[0]) return;
  const units = result.units ?? Number(reservation[0].units);
  const amount = result.succeeded ? usageCost(reservation[0].kind, units) : 0;
  await sql`WITH selected AS (
    SELECT u.id,u.cost_micros,u.add_on_micros_used,w.user_id,w.balance_micros,w.add_on_balance_micros,w.debt_micros
    FROM aux_usage u JOIN aux_wallets w ON w.user_id=u.user_id
    WHERE u.id=${id} AND u.state='reserved' FOR UPDATE OF u,w
  ), delta AS (
    SELECT *,greatest(0,cost_micros-${amount}) AS refund,greatest(0,${amount}-cost_micros) AS extra FROM selected
  ), allocation AS (
    SELECT *,least(add_on_micros_used,refund) AS addon_refund,
      least(debt_micros,refund) AS debt_payment,
      greatest(0,least(extra,balance_micros)-(balance_micros-add_on_balance_micros)) AS extra_addon
    FROM delta
  ), wallet AS (
    UPDATE aux_wallets w SET
      balance_micros=a.balance_micros+a.refund-a.debt_payment-least(a.extra,a.balance_micros),
      add_on_balance_micros=a.add_on_balance_micros+a.addon_refund-greatest(0,a.debt_payment-(a.refund-a.addon_refund))-a.extra_addon,
      debt_micros=a.debt_micros-a.debt_payment+greatest(0,a.extra-a.balance_micros)
    FROM allocation a WHERE w.user_id=a.user_id RETURNING w.user_id
  ) UPDATE aux_usage u SET state=${result.succeeded ? 'charged' : 'refunded'},cost_micros=${amount},units=${units},
      add_on_micros_used=a.add_on_micros_used-a.addon_refund+a.extra_addon
    FROM allocation a,wallet w WHERE u.id=a.id AND u.user_id=w.user_id AND u.state='reserved'`;
}
