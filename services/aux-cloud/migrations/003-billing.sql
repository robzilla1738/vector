CREATE TABLE IF NOT EXISTS aux_subscriptions (
 user_id uuid PRIMARY KEY REFERENCES aux_users(id) ON DELETE CASCADE,
 stripe_customer_id text UNIQUE,
 stripe_subscription_id text UNIQUE,
 plan text NOT NULL DEFAULT 'free' CHECK (plan IN ('free','pro','max')),
 status text NOT NULL DEFAULT 'inactive',
 interval text CHECK (interval IN ('month','year')),
 period_start timestamptz,
 period_end timestamptz,
 cancel_at_period_end boolean NOT NULL DEFAULT false,
 stripe_event_created bigint NOT NULL DEFAULT 0,
 credit_anchor timestamptz,
 paid_through timestamptz,
 paid_monthly_grant_micros bigint NOT NULL DEFAULT 0,
 paid_invoice_created bigint NOT NULL DEFAULT 0,
 updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS aux_wallets (
 user_id uuid PRIMARY KEY REFERENCES aux_users(id) ON DELETE CASCADE,
 balance_micros bigint NOT NULL DEFAULT 250000 CHECK (balance_micros >= 0),
 add_on_balance_micros bigint NOT NULL DEFAULT 0 CHECK (add_on_balance_micros >= 0 AND add_on_balance_micros <= balance_micros),
 debt_micros bigint NOT NULL DEFAULT 0 CHECK (debt_micros >= 0),
 grant_micros bigint NOT NULL DEFAULT 250000,
 refresh_at timestamptz NOT NULL DEFAULT now() + interval '30 days'
);
CREATE TABLE IF NOT EXISTS aux_usage (
 id uuid PRIMARY KEY,
 user_id uuid NOT NULL REFERENCES aux_users(id) ON DELETE CASCADE,
 kind text NOT NULL,
 units bigint NOT NULL CHECK (units >= 0),
 cost_micros bigint NOT NULL CHECK (cost_micros >= 0),
 add_on_micros_used bigint NOT NULL DEFAULT 0 CHECK (add_on_micros_used >= 0),
 state text NOT NULL DEFAULT 'reserved' CHECK (state IN ('reserved','charged','refunded')),
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS aux_usage_user_created ON aux_usage(user_id,created_at DESC);
CREATE TABLE IF NOT EXISTS aux_stripe_events (
 event_id text PRIMARY KEY,
 type text NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS aux_credit_grants (
 source_id text PRIMARY KEY,
 user_id uuid NOT NULL REFERENCES aux_users(id) ON DELETE CASCADE,
 amount_micros bigint NOT NULL CHECK (amount_micros > 0),
 kind text NOT NULL DEFAULT 'add_on' CHECK (kind IN ('add_on','allowance')),
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS aux_credit_periods (
 subscription_id text NOT NULL,
 user_id uuid NOT NULL REFERENCES aux_users(id) ON DELETE CASCADE,
 period_start timestamptz NOT NULL,
 amount_micros bigint NOT NULL CHECK (amount_micros >= 0),
 PRIMARY KEY(subscription_id,period_start)
);
CREATE TABLE IF NOT EXISTS aux_checkout_requests (
 user_id uuid NOT NULL REFERENCES aux_users(id) ON DELETE CASCADE,
 mode text NOT NULL CHECK (mode IN ('subscription','payment')),
 request_id uuid NOT NULL,
 request_key text NOT NULL,
 expires_at timestamptz NOT NULL,
 session_id text,
 PRIMARY KEY(user_id,mode)
);

-- Paid allowances accrue monthly even when Stripe invoices yearly. Called before
-- every reservation as well as on billing reads/webhooks; no cron is required.
-- Included and purchased credits roll over. A free account receives its initial
-- allowance only once, never an accidental monthly recurring grant.
CREATE OR REPLACE FUNCTION aux_refresh_wallet(p_user_id uuid) RETURNS void LANGUAGE plpgsql AS $$
DECLARE
 s aux_subscriptions%ROWTYPE;
 anchor timestamptz;
 period timestamptz;
 next_period timestamptz;
 granted bigint;
 target bigint;
 delta bigint;
 month_number integer := 0;
 current_month integer;
 as_of timestamptz;
BEGIN
 INSERT INTO aux_wallets(user_id) VALUES(p_user_id) ON CONFLICT DO NOTHING;
 -- Serialize invoice and simultaneous API-request allowance grants per account.
 PERFORM 1 FROM aux_wallets WHERE user_id=p_user_id FOR UPDATE;
 SELECT * INTO s FROM aux_subscriptions WHERE user_id=p_user_id;
 IF FOUND AND s.stripe_subscription_id IS NOT NULL
    AND s.credit_anchor IS NOT NULL AND s.credit_anchor<=now() AND s.paid_through>s.credit_anchor
    AND s.paid_monthly_grant_micros>0 THEN
   anchor := s.credit_anchor;
   as_of := least(now(),s.paid_through-interval '1 microsecond');
   current_month := (extract(year FROM as_of)::integer-extract(year FROM anchor)::integer)*12
                    +extract(month FROM as_of)::integer-extract(month FROM anchor)::integer;
   IF anchor+make_interval(months=>current_month)>as_of THEN current_month:=current_month-1; END IF;
   -- Bound malformed/future configuration without turning a request into an unbounded loop.
   IF current_month>600 THEN RAISE EXCEPTION 'Subscription credit anchor is too old'; END IF;
   FOR month_number IN 0..greatest(0,current_month) LOOP
     period := anchor+make_interval(months=>month_number);
     EXIT WHEN period>=s.paid_through OR period>now();
     SELECT amount_micros INTO granted FROM aux_credit_periods
       WHERE subscription_id=s.stripe_subscription_id AND period_start=period;
     target := CASE WHEN s.plan='max' THEN 20000000 WHEN s.plan='pro' THEN 5000000 ELSE 0 END;
     target := least(target,s.paid_monthly_grant_micros);
     -- Historical periods are immutable. A paid upgrade can top up only the current month.
     IF NOT FOUND OR month_number=current_month THEN
       delta := greatest(0,target-coalesce(granted,0));
       IF delta>0 THEN
         INSERT INTO aux_credit_periods(subscription_id,user_id,period_start,amount_micros)
           VALUES(s.stripe_subscription_id,p_user_id,period,target)
           ON CONFLICT(subscription_id,period_start) DO UPDATE SET amount_micros=greatest(aux_credit_periods.amount_micros,excluded.amount_micros);
         INSERT INTO aux_credit_grants(source_id,user_id,amount_micros,kind)
           VALUES('allowance:'||s.stripe_subscription_id||':'||period::text||':'||target::text,p_user_id,delta,'allowance');
         UPDATE aux_wallets SET balance_micros=balance_micros+greatest(0,delta-debt_micros),debt_micros=greatest(0,debt_micros-delta) WHERE user_id=p_user_id;
       END IF;
     END IF;
   END LOOP;
   next_period := CASE WHEN s.paid_through<=now() THEN date_trunc('month',now())+interval '1 month' ELSE least(anchor+make_interval(months=>current_month+1),s.paid_through) END;
   UPDATE aux_wallets SET grant_micros=least(CASE WHEN s.plan='max' THEN 20000000 WHEN s.plan='pro' THEN 5000000 ELSE 0 END,s.paid_monthly_grant_micros),refresh_at=next_period WHERE user_id=p_user_id;
 ELSE
   -- Existing prepaid balances remain spendable after cancellation or renewal failure.
   UPDATE aux_wallets SET refresh_at=date_trunc('month',now())+interval '1 month' WHERE user_id=p_user_id AND refresh_at<=now();
 END IF;
END $$;
CREATE TABLE IF NOT EXISTS aux_credit_refunds (
 charge_id text PRIMARY KEY,
 user_id uuid NOT NULL REFERENCES aux_users(id) ON DELETE CASCADE,
 amount_micros bigint NOT NULL CHECK (amount_micros >= 0)
);

-- Re-read refund state after acquiring the wallet lock, rather than relying on
-- one stale CTE snapshot when simultaneous partial-refund events arrive.
CREATE OR REPLACE FUNCTION aux_refund_credits(p_source text,p_charge text,p_refunded_micros bigint)
RETURNS void LANGUAGE plpgsql AS $$
DECLARE
 g aux_credit_grants%ROWTYPE;
 old_refund bigint;
 delta bigint;
BEGIN
 SELECT * INTO g FROM aux_credit_grants WHERE source_id=p_source AND kind='add_on';
 IF NOT FOUND THEN RETURN; END IF;
 PERFORM 1 FROM aux_wallets WHERE user_id=g.user_id FOR UPDATE;
 SELECT amount_micros INTO old_refund FROM aux_credit_refunds WHERE charge_id=p_charge;
 old_refund:=coalesce(old_refund,0);
 delta:=greatest(0,least(g.amount_micros,p_refunded_micros)-old_refund);
 IF delta=0 THEN RETURN; END IF;
 INSERT INTO aux_credit_refunds(charge_id,user_id,amount_micros) VALUES(p_charge,g.user_id,old_refund+delta)
 ON CONFLICT(charge_id) DO UPDATE SET amount_micros=greatest(aux_credit_refunds.amount_micros,excluded.amount_micros);
 UPDATE aux_wallets SET balance_micros=balance_micros-least(balance_micros,delta),
   add_on_balance_micros=add_on_balance_micros-least(add_on_balance_micros,delta),
   debt_micros=debt_micros+greatest(0,delta-balance_micros) WHERE user_id=g.user_id;
END $$;
