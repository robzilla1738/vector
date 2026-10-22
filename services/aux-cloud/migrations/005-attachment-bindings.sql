CREATE TABLE IF NOT EXISTS aux_attachment_bindings (
 user_id uuid NOT NULL REFERENCES aux_users(id) ON DELETE CASCADE,
 session_id text NOT NULL CHECK (length(session_id) BETWEEN 1 AND 128),
 local_path text NOT NULL CHECK (local_path ~ '^attachments/[^/\\]+$'),
 attachment_id text NOT NULL CHECK (length(attachment_id) BETWEEN 1 AND 128),
 blob_id uuid NOT NULL REFERENCES aux_attachments(id) ON DELETE CASCADE,
 updated_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY (user_id, session_id, local_path)
);
