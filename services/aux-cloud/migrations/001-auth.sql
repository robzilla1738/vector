-- Aux cloud identities are deliberately separate from owner/browser local data.
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE TABLE IF NOT EXISTS aux_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_id text NOT NULL UNIQUE,
  email text NOT NULL,
  name text NOT NULL DEFAULT '',
  profile_url text,
  avatar_path text,
  avatar_mime text,
  onboarding_completed_at timestamptz,
  sync_generation integer NOT NULL DEFAULT 0 CHECK (sync_generation >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  data_purged_at timestamptz
);
CREATE UNIQUE INDEX IF NOT EXISTS aux_users_active_email ON aux_users(lower(email)) WHERE deleted_at IS NULL;
CREATE TABLE IF NOT EXISTS aux_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES aux_users(id),
  family_id uuid NOT NULL DEFAULT gen_random_uuid(),
  access_hash text NOT NULL UNIQUE,
  access_expires_at timestamptz NOT NULL,
  expires_at timestamptz NOT NULL,
  device_fingerprint text,
  device_name text,
  platform text NOT NULL CHECK (platform IN ('macos','windows','ios','android','cli','web')),
  app_version text,
  device_public_key jsonb,
  clerk_session_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  revoked_at timestamptz
);
CREATE INDEX IF NOT EXISTS aux_sessions_user ON aux_sessions(user_id);
CREATE TABLE IF NOT EXISTS aux_refresh_tokens (
  token_hash text PRIMARY KEY,
  session_id uuid NOT NULL REFERENCES aux_sessions(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  used_at timestamptz
);
CREATE TABLE IF NOT EXISTS aux_email_challenges (
  email text PRIMARY KEY,
  code_hash text NOT NULL,
  expires_at timestamptz NOT NULL,
  attempts integer NOT NULL DEFAULT 0,
  delivered_at timestamptz,
  consumed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS aux_rate_limits (
  key text NOT NULL,
  window_start bigint NOT NULL,
  attempts integer NOT NULL DEFAULT 1,
  expires_at timestamptz NOT NULL,
  PRIMARY KEY (key,window_start)
);
CREATE INDEX IF NOT EXISTS aux_rate_limits_expiry ON aux_rate_limits(expires_at);
CREATE TABLE IF NOT EXISTS aux_device_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  device_code_hash text NOT NULL UNIQUE,
  user_code_hash text NOT NULL UNIQUE,
  device_name text NOT NULL,
  requested_email_hash text NOT NULL,
  device jsonb,
  user_id uuid REFERENCES aux_users(id),
  decision text CHECK (decision IN ('approve','deny')),
  poll_after timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT now() + interval '10 minutes',
  consumed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS aux_auth_webhooks (
  id text PRIMARY KEY,
  event_type text NOT NULL,
  processed_at timestamptz NOT NULL DEFAULT now()
);
