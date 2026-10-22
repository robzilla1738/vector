CREATE TABLE IF NOT EXISTS aux_session_snapshots (
 user_id uuid NOT NULL REFERENCES aux_users(id) ON DELETE CASCADE,
 session_id text NOT NULL CHECK (session_id ~ '^[A-Za-z0-9_-]{1,128}$'),
 revision bigint NOT NULL DEFAULT 1,
 generation integer NOT NULL CHECK (generation >= 0),
 blob_id uuid REFERENCES aux_attachments(id) ON DELETE SET NULL,
 updated_at timestamptz NOT NULL DEFAULT now(),
 deleted_at timestamptz,
 PRIMARY KEY (user_id, session_id)
);
CREATE TABLE IF NOT EXISTS aux_retired_session_blobs (
 blob_id uuid PRIMARY KEY REFERENCES aux_attachments(id) ON DELETE CASCADE,
 user_id uuid NOT NULL REFERENCES aux_users(id) ON DELETE CASCADE,
 delete_after timestamptz NOT NULL DEFAULT now() + interval '15 minutes'
);
CREATE INDEX IF NOT EXISTS aux_retired_session_blobs_due ON aux_retired_session_blobs(delete_after);
