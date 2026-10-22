ALTER TABLE sync_objects ADD COLUMN IF NOT EXISTS last_referenced_at timestamptz NOT NULL DEFAULT now();
CREATE INDEX IF NOT EXISTS sync_objects_retention ON sync_objects(last_referenced_at);
