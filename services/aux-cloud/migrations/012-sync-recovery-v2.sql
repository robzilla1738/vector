-- Aux-v2 browser Sync recovery; additive, no existing key or data reset.
-- Historical creator UUID is retained after ordinary expired-session pruning.
-- Authority is checked against the live session inside the write transaction.
CREATE TABLE aux_sync_recovery_v2 (
 user_id uuid NOT NULL REFERENCES aux_users(id) ON DELETE CASCADE,
 generation integer NOT NULL CHECK(generation>=0), revision integer NOT NULL CHECK(revision>0),
 recovery_id uuid NOT NULL, envelope jsonb NOT NULL,
 csk_commitment text NOT NULL CHECK(csk_commitment~'^[a-f0-9]{64}$'),
 created_by_session uuid NOT NULL, created_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY(user_id,generation,revision)
);
CREATE TABLE aux_sync_recovery_challenges_v2 (
 id uuid PRIMARY KEY, user_id uuid NOT NULL REFERENCES aux_users(id) ON DELETE CASCADE,
 session_id uuid NOT NULL REFERENCES aux_sessions(id) ON DELETE CASCADE, fingerprint text NOT NULL,
 generation integer NOT NULL CHECK(generation>=0), operation text NOT NULL CHECK(operation IN('enroll','material','recover')),
 request_hash text NOT NULL CHECK(request_hash~'^[a-f0-9]{64}$'), nonce text NOT NULL,
 expires_at timestamptz NOT NULL, used_at timestamptz, response jsonb,
 CHECK((used_at IS NULL)=(response IS NULL))
);
CREATE INDEX aux_sync_recovery_challenges_v2_expiry ON aux_sync_recovery_challenges_v2(expires_at);
-- Signature/CSK proofs are validated by the owned service before this SQL call.
-- This transaction rechecks the actual session, generation, expected key bytes,
-- challenge and append-only recovery head; no supplied Boolean authorizes writes.
CREATE FUNCTION aux_apply_sync_recovery_v2(
 p_user uuid,p_session uuid,p_challenge uuid,p_request_hash text,
 p_expected_revision integer,p_envelope jsonb,p_commitment text,
 p_key_revision integer,p_captured_key jsonb,p_new_wrapped_key jsonb
) RETURNS jsonb LANGUAGE plpgsql AS $$
DECLARE c aux_sync_recovery_challenges_v2%ROWTYPE; h aux_sync_recovery_v2%ROWTYPE;
 k sync_keys%ROWTYPE; generation_now integer; reply jsonb; revision_now integer;
BEGIN
 PERFORM pg_advisory_xact_lock(hashtextextended(p_user::text,0));
 SELECT * INTO c FROM aux_sync_recovery_challenges_v2 WHERE id=p_challenge AND user_id=p_user AND session_id=p_session FOR UPDATE;
 IF NOT FOUND OR c.request_hash<>p_request_hash OR c.expires_at<=now() THEN RAISE EXCEPTION 'RECOVERY_CHALLENGE_INVALID'; END IF;
 SELECT u.sync_generation INTO generation_now FROM aux_users u JOIN aux_sessions s ON s.user_id=u.id
 WHERE u.id=p_user AND s.id=p_session AND u.deleted_at IS NULL AND s.revoked_at IS NULL AND s.expires_at>now()
 AND s.access_expires_at>now() AND s.platform='macos' AND s.device_fingerprint=c.fingerprint AND s.device_public_key IS NOT NULL FOR UPDATE OF u,s;
 IF NOT FOUND OR generation_now<>c.generation THEN RAISE EXCEPTION 'RECOVERY_STATE_CHANGED'; END IF;
 SELECT * INTO h FROM aux_sync_recovery_v2 WHERE user_id=p_user AND generation=c.generation ORDER BY revision DESC LIMIT 1;
 revision_now=COALESCE(h.revision,0);
 IF c.used_at IS NOT NULL THEN
  IF (c.response->>'recoveryRevision')::integer<>revision_now THEN RAISE EXCEPTION 'RECOVERY_STATE_CHANGED'; END IF;
  RETURN c.response;
 END IF;
 SELECT * INTO k FROM sync_keys WHERE user_id=p_user FOR UPDATE;
 IF c.operation='enroll' THEN
  IF k.user_id IS NULL OR k.generation<>c.generation OR k.revision<>p_key_revision OR k.wrapped_key IS DISTINCT FROM p_captured_key
   OR revision_now<>p_expected_revision OR p_envelope->>'format'<>'aux.sync-recovery.v2'
   OR p_envelope->>'userId'<>p_user::text OR (p_envelope->>'generation')::integer<>c.generation
   OR (p_envelope->>'revision')::integer<>revision_now+1 OR p_commitment!~'^[a-f0-9]{64}$' THEN RAISE EXCEPTION 'RECOVERY_STATE_CHANGED'; END IF;
  INSERT INTO aux_sync_recovery_v2(user_id,generation,revision,recovery_id,envelope,csk_commitment,created_by_session)
   VALUES(p_user,c.generation,revision_now+1,(p_envelope->>'recoveryId')::uuid,p_envelope,p_commitment,p_session) RETURNING * INTO h;
  reply=jsonb_build_object('state','ready','syncGeneration',c.generation,'revision',k.revision,'recoveryId',h.recovery_id,'recoveryRevision',h.revision);
 ELSIF c.operation='material' THEN
  IF h.user_id IS NULL THEN RAISE EXCEPTION 'RECOVERY_NOT_CONFIGURED'; END IF;
  reply=jsonb_build_object('recoveryBackup',h.envelope,'syncGeneration',c.generation,'recoveryId',h.recovery_id,'recoveryRevision',h.revision);
 ELSIF c.operation='recover' THEN
  IF h.user_id IS NULL OR h.revision<>p_expected_revision OR h.csk_commitment IS DISTINCT FROM p_commitment THEN RAISE EXCEPTION 'RECOVERY_STATE_CHANGED'; END IF;
  IF k.user_id IS NULL THEN
   IF p_new_wrapped_key IS NULL THEN RAISE EXCEPTION 'RECOVERY_STATE_CHANGED'; END IF;
   INSERT INTO sync_keys(user_id,generation,wrapped_key) VALUES(p_user,c.generation,p_new_wrapped_key) ON CONFLICT(user_id) DO NOTHING RETURNING * INTO k;
   IF NOT FOUND THEN RAISE EXCEPTION 'RECOVERY_STATE_CHANGED'; END IF;
  ELSIF k.generation<>c.generation OR k.revision<>p_key_revision OR k.wrapped_key IS DISTINCT FROM p_captured_key THEN RAISE EXCEPTION 'RECOVERY_STATE_CHANGED'; END IF;
  reply=jsonb_build_object('state','ready','syncGeneration',c.generation,'revision',k.revision,'recoveryId',h.recovery_id,'recoveryRevision',h.revision);
 ELSE RAISE EXCEPTION 'RECOVERY_CHALLENGE_INVALID'; END IF;
 UPDATE aux_sync_recovery_challenges_v2 SET used_at=now(),response=reply WHERE id=c.id;
 RETURN reply;
END $$;
