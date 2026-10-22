-- Ephemeral model inputs reuse scoped private upload lifecycle, never session bindings.
ALTER TABLE aux_attachments DROP CONSTRAINT aux_attachments_purpose_check;
ALTER TABLE aux_attachments ADD CONSTRAINT aux_attachments_purpose_check CHECK (purpose IN ('attachment','share','inference'));
CREATE INDEX aux_ephemeral_inference_expiry ON aux_attachments(expires_at) WHERE purpose = 'inference' AND state <> 'deleted';
ALTER TABLE aux_attachments ADD CONSTRAINT aux_inference_size_check CHECK (purpose <> 'inference' OR expected_size BETWEEN 1 AND 20971520);
