-- The terms version an account agreed to when it was created.
ALTER TABLE aux_users ADD COLUMN IF NOT EXISTS terms_version text, ADD COLUMN IF NOT EXISTS terms_accepted_at timestamptz;
-- Feedback reports are their own purpose so they can expire after 90 days and never bind to a session.
ALTER TABLE aux_attachments DROP CONSTRAINT aux_attachments_purpose_check;
ALTER TABLE aux_attachments ADD CONSTRAINT aux_attachments_purpose_check CHECK (purpose IN ('attachment','share','inference','feedback'));
CREATE INDEX IF NOT EXISTS aux_attachments_feedback_age ON aux_attachments(created_at) WHERE purpose = 'feedback' AND state <> 'deleted';
-- Maintenance retries the users it failed on longest ago first.
ALTER TABLE aux_users ADD COLUMN IF NOT EXISTS purge_attempted_at timestamptz;
CREATE INDEX IF NOT EXISTS aux_users_pending_purge ON aux_users(purge_attempted_at NULLS FIRST) WHERE deleted_at IS NOT NULL AND data_purged_at IS NULL;
-- Revocation and refresh look sessions up by family, Clerk session and token session.
CREATE INDEX IF NOT EXISTS aux_refresh_tokens_session ON aux_refresh_tokens(session_id);
CREATE INDEX IF NOT EXISTS aux_sessions_family ON aux_sessions(family_id);
CREATE INDEX IF NOT EXISTS aux_sessions_clerk_session ON aux_sessions(clerk_session_id) WHERE clerk_session_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS aux_device_requests_email ON aux_device_requests(requested_email_hash);
CREATE INDEX IF NOT EXISTS aux_attachment_bindings_blob ON aux_attachment_bindings(blob_id);
