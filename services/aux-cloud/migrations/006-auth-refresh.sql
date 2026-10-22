-- A response lost after rotation must not make the supplied client's bounded
-- retry revoke its own family. Cache only AES-GCM ciphertext for a 10s grace.
ALTER TABLE aux_refresh_tokens ADD COLUMN IF NOT EXISTS rotation_reply text;
ALTER TABLE aux_refresh_tokens ADD COLUMN IF NOT EXISTS rotation_context_hash text;
