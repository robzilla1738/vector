-- Additive only. When the account holder confirmed the minimum age in the terms.
ALTER TABLE aux_users ADD COLUMN IF NOT EXISTS age_confirmed_at timestamptz;
-- An operator takedown. A blocked share stays revoked: its owner cannot republish over it.
ALTER TABLE shared_sessions ADD COLUMN IF NOT EXISTS blocked_at timestamptz;
