-- Actual1852 Drive transport: preserve per-file plaintext-hash CAS, store ciphertext only.
CREATE TABLE IF NOT EXISTS aux_drive_heads (
 user_id uuid PRIMARY KEY REFERENCES aux_users(id) ON DELETE CASCADE,
 revision bigint NOT NULL DEFAULT 1,
 updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS aux_drive_files (
 user_id uuid NOT NULL REFERENCES aux_users(id) ON DELETE CASCADE,
 path text NOT NULL CHECK(length(path) BETWEEN 1 AND 1024),
 sha256 text NOT NULL CHECK(sha256 ~ '^[a-f0-9]{64}$'),
 size integer NOT NULL CHECK(size BETWEEN 0 AND 2097152),
 object_sha256 text NOT NULL CHECK(object_sha256 ~ '^[a-f0-9]{64}$'),
 object_size integer NOT NULL CHECK(object_size BETWEEN 0 AND 3145728),
 generation integer NOT NULL CHECK(generation>=0),
 content bytea NOT NULL CHECK(octet_length(content)=object_size),
 updated_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY(user_id,path)
);
