CREATE TABLE IF NOT EXISTS aux_attachments (
 id uuid PRIMARY KEY,
 user_id uuid NOT NULL REFERENCES aux_users(id) ON DELETE CASCADE,
 pathname text NOT NULL UNIQUE,
 name text NOT NULL,
 content_type text NOT NULL,
 expected_size bigint NOT NULL CHECK (expected_size BETWEEN 0 AND 104857600),
 expected_sha256 text NOT NULL CHECK (expected_sha256 ~ '^[a-f0-9]{64}$'),
 purpose text NOT NULL CHECK (purpose IN ('attachment','share')),
 state text NOT NULL DEFAULT 'pending' CHECK (state IN ('pending','issued','ready','failed','deleted')),
 expires_at timestamptz NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(),
 verified_at timestamptz
);
CREATE INDEX IF NOT EXISTS aux_attachments_owner ON aux_attachments(user_id, state, expires_at);
