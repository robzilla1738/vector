CREATE TABLE IF NOT EXISTS sync_heads (
  user_id uuid PRIMARY KEY REFERENCES aux_users(id) ON DELETE CASCADE,
  revision bigint NOT NULL DEFAULT 1,
  manifest jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS sync_objects (
  user_id uuid NOT NULL REFERENCES aux_users(id) ON DELETE CASCADE,
  sha256 text NOT NULL CHECK (sha256 ~ '^[a-f0-9]{64}$'),
  content bytea NOT NULL CHECK (octet_length(content) <= 3145728),
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, sha256)
);
CREATE TABLE IF NOT EXISTS sync_entities (
  user_id uuid NOT NULL REFERENCES aux_users(id) ON DELETE CASCADE,
  kind text NOT NULL CHECK (kind IN ('project', 'routine', 'settings')),
  entity_id text NOT NULL,
  payload jsonb NOT NULL,
  PRIMARY KEY (user_id, kind, entity_id)
);
CREATE TABLE IF NOT EXISTS sync_keys (
  user_id uuid PRIMARY KEY REFERENCES aux_users(id) ON DELETE CASCADE,
  generation integer NOT NULL DEFAULT 0 CHECK (generation >= 0),
  revision integer NOT NULL DEFAULT 1 CHECK (revision >= 1),
  wrapped_key jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS shared_sessions (
  id text PRIMARY KEY CHECK (length(id) BETWEEN 12 AND 32),
  user_id uuid NOT NULL REFERENCES aux_users(id) ON DELETE CASCADE,
  source_session_id text NOT NULL,
  title text NOT NULL,
  messages jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  revoked_at timestamptz,
  UNIQUE (user_id, source_session_id)
);
