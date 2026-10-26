-- PASSWORD-FREE REVIEW PROPOSAL ONLY. NOT EXECUTED. DEFAULT END IS ROLLBACK.
-- Exact source: observed-facts.json; neondb on the approved Production branch.
-- Historical optional stricter preparation variant; not the default proposal.
-- It refuses currently inherited TEMP. The user did not require this policy.
-- No shared PUBLIC revoke, authentication setup, membership or activation here.
BEGIN;
SET LOCAL search_path = pg_catalog;
SET LOCAL lock_timeout = '3s';
SET LOCAL statement_timeout = '30s';
DO $review$
DECLARE expected text[] := ARRAY[
    'aux_attachment_bindings',
    'aux_attachments',
    'aux_auth_webhooks',
    'aux_checkout_requests',
    'aux_credit_grants',
    'aux_credit_periods',
    'aux_credit_refunds',
    'aux_device_requests',
    'aux_drive_cookies',
    'aux_drive_files',
    'aux_drive_heads',
    'aux_email_challenges',
    'aux_migrations',
    'aux_rate_limits',
    'aux_refresh_tokens',
    'aux_retired_session_blobs',
    'aux_session_snapshots',
    'aux_sessions',
    'aux_stripe_events',
    'aux_subscriptions',
    'aux_sync_recovery_challenges_v2',
    'aux_sync_recovery_v2',
    'aux_usage',
    'aux_users',
    'aux_wallets',
    'shared_sessions',
    'sync_entities',
    'sync_heads',
    'sync_keys',
    'sync_objects'
  ]; actual text[];
BEGIN
  IF current_database()<>'neondb' OR current_user<>'neondb_owner'
     OR current_setting('server_version_num')::integer/10000<>18 THEN
    RAISE EXCEPTION 'Wrong database, administrator or PostgreSQL major for this reviewed proposal.';
  END IF;
  -- PostgreSQL cannot subtract PUBLIC TEMP by REVOKE from one new login.
  IF EXISTS(SELECT 1 FROM pg_database d,
      LATERAL aclexplode(coalesce(d.datacl,acldefault('d',d.datdba))) a
      WHERE d.datname=current_database() AND a.grantee=0
        AND a.privilege_type IN ('TEMPORARY','CREATE')) THEN
    RAISE EXCEPTION 'Approval dependency: inherited PUBLIC TEMPORARY/CREATE conflicts with this optional no-temp preparation preference. No shared revoke is included.';
  END IF;
  IF EXISTS(SELECT 1 FROM pg_roles WHERE rolname='aux_backup_capture') THEN
    RAISE EXCEPTION 'Proposed role already exists; do not reuse or reinterpret it without a fresh privilege review.';
  END IF;
  SELECT array_agg(c.relname::text ORDER BY c.relname) INTO actual
    FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
    WHERE n.nspname='public' AND c.relkind IN ('r','p','v','m','f','S');
  IF actual IS DISTINCT FROM expected OR EXISTS(
      SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
      WHERE n.nspname='public' AND c.relkind IN ('r','p','v','m','f','S')
       AND (c.relkind<>'r' OR c.relpersistence<>'p' OR c.relowner<>'neondb_owner'::regrole
            OR c.relrowsecurity OR c.relforcerowsecurity)) THEN
    RAISE EXCEPTION 'Public capture inventory, ownership or RLS changed; review scope before granting.';
  END IF;
  IF EXISTS(SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
      WHERE n.nspname<>'public' AND n.nspname<>'information_schema' AND n.nspname !~ '^pg_'
       AND c.relkind IN ('r','p','v','m','f','S'))
     OR EXISTS(SELECT 1 FROM pg_largeobject_metadata)
     OR EXISTS(SELECT 1 FROM pg_extension WHERE coalesce(cardinality(extconfig),0)>0)
     OR EXISTS(SELECT 1 FROM pg_policy p JOIN pg_class c ON c.oid=p.polrelid
         JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public')
     OR EXISTS(SELECT 1 FROM pg_attribute a JOIN pg_class c ON c.oid=a.attrelid
         JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public' AND a.attacl IS NOT NULL) THEN
    RAISE EXCEPTION 'Whole-database dump coverage or column/RLS authority changed; no filtered backup or privilege escalation is approved.';
  END IF;
  IF EXISTS(SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace,
      LATERAL aclexplode(coalesce(p.proacl,acldefault('f',p.proowner))) a
      WHERE n.nspname='public' AND p.prosecdef AND a.grantee=0 AND a.privilege_type='EXECUTE') THEN
    RAISE EXCEPTION 'PUBLIC security-definer execution requires a specific routine review; no blanket revoke is included.';
  END IF;
END
$review$;

-- Staged non-login role: no password is generated, set, cleared or displayed.
-- Capture cannot authenticate until a separate protected authentication step.
CREATE ROLE aux_backup_capture NOLOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE
  NOINHERIT NOREPLICATION NOBYPASSRLS CONNECTION LIMIT 2;
GRANT CONNECT ON DATABASE neondb TO aux_backup_capture;
GRANT USAGE ON SCHEMA public TO aux_backup_capture;
GRANT SELECT ON TABLE
  public.aux_attachment_bindings,
  public.aux_attachments,
  public.aux_auth_webhooks,
  public.aux_checkout_requests,
  public.aux_credit_grants,
  public.aux_credit_periods,
  public.aux_credit_refunds,
  public.aux_device_requests,
  public.aux_drive_cookies,
  public.aux_drive_files,
  public.aux_drive_heads,
  public.aux_email_challenges,
  public.aux_migrations,
  public.aux_rate_limits,
  public.aux_refresh_tokens,
  public.aux_retired_session_blobs,
  public.aux_session_snapshots,
  public.aux_sessions,
  public.aux_stripe_events,
  public.aux_subscriptions,
  public.aux_sync_recovery_challenges_v2,
  public.aux_sync_recovery_v2,
  public.aux_usage,
  public.aux_users,
  public.aux_wallets,
  public.shared_sessions,
  public.sync_entities,
  public.sync_heads,
  public.sync_keys,
  public.sync_objects
TO aux_backup_capture;

-- Two concurrent connections fit the current held snapshot + single pg_dump.
-- A default transaction mode is an operational precaution, NOT an ACL boundary.
ALTER ROLE aux_backup_capture IN DATABASE neondb SET default_transaction_read_only = on;

DO $verify$
BEGIN
  IF has_database_privilege('aux_backup_capture','neondb','CREATE,TEMP')
     OR has_schema_privilege('aux_backup_capture','public','CREATE')
     OR EXISTS(SELECT 1 FROM pg_auth_members WHERE member='aux_backup_capture'::regrole)
     OR EXISTS(SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
        WHERE n.nspname='public' AND c.relkind='r'
         AND (NOT has_table_privilege('aux_backup_capture',c.oid,'SELECT')
              OR has_table_privilege('aux_backup_capture',c.oid,'INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER,MAINTAIN')))
     OR EXISTS(SELECT 1 FROM pg_shdepend WHERE refclassid='pg_authid'::regclass
           AND refobjid='aux_backup_capture'::regrole AND deptype='o') THEN
    RAISE EXCEPTION 'Capture role has unexpected effective rights, membership or ownership; rollback.';
  END IF;
END
$verify$;

-- Review artifact safety default. A later exact approval must select persistence
-- and separately provision authentication; do not silently replace this line.
ROLLBACK;
