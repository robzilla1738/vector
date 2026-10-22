-- Only authenticated, client-encrypted cookie backups. Actual1852 consumer is upload-only.
CREATE TABLE IF NOT EXISTS aux_drive_cookies (
 user_id uuid PRIMARY KEY REFERENCES aux_users(id) ON DELETE CASCADE,
 revision bigint NOT NULL DEFAULT 1,
 generation integer NOT NULL CHECK(generation>=0),
 captured_at bigint NOT NULL CHECK(captured_at>=0),
 sha256 text NOT NULL CHECK(sha256 ~ '^[a-f0-9]{64}$'),
 size integer NOT NULL CHECK(size BETWEEN 0 AND 2097152),
 object_sha256 text NOT NULL CHECK(object_sha256 ~ '^[a-f0-9]{64}$'),
 object_size integer NOT NULL CHECK(object_size BETWEEN 0 AND 3145728),
 content bytea NOT NULL CHECK(octet_length(content)=object_size),
 deleted_at timestamptz,
 updated_at timestamptz NOT NULL DEFAULT now()
);
