-- @schema profile
CREATE TABLE aux_meta(key TEXT PRIMARY KEY, value TEXT NOT NULL);
INSERT INTO aux_meta(key,value) VALUES('schema','aux-v3');
CREATE TABLE kv(key TEXT PRIMARY KEY, value TEXT NOT NULL);
CREATE TABLE sessions(
  session_id TEXT PRIMARY KEY, backend TEXT NOT NULL, label TEXT NOT NULL,
  status TEXT NOT NULL, detail TEXT, updated_at REAL NOT NULL);
CREATE TABLE pages(
  page_id TEXT PRIMARY KEY, backend TEXT NOT NULL, target_id TEXT NOT NULL,
  session_id TEXT, url TEXT NOT NULL, title TEXT NOT NULL DEFAULT '',
  favicon TEXT, epoch INTEGER NOT NULL DEFAULT 0, revision INTEGER NOT NULL DEFAULT 0,
  view_status TEXT NOT NULL DEFAULT 'hidden', controller TEXT NOT NULL DEFAULT 'none',
  owned INTEGER NOT NULL DEFAULT 0, created_at REAL NOT NULL, active_at REAL NOT NULL,
  detached INTEGER NOT NULL DEFAULT 0, json TEXT NOT NULL DEFAULT '{}');
CREATE TABLE tabs(
  page_id TEXT PRIMARY KEY REFERENCES pages(page_id), ordinal INTEGER NOT NULL, url TEXT NOT NULL,
  title TEXT NOT NULL DEFAULT '', backend TEXT NOT NULL DEFAULT 'aux', active INTEGER NOT NULL DEFAULT 0,
  window_id TEXT NOT NULL DEFAULT 'main');
CREATE TABLE page_sets(
  set_id TEXT PRIMARY KEY, name TEXT NOT NULL, source TEXT NOT NULL,
  member_ids TEXT NOT NULL DEFAULT '[]', result_schema TEXT, program_id TEXT REFERENCES programs(program_id) ON DELETE SET NULL, created_at REAL NOT NULL);
CREATE TABLE set_members(
  member_id TEXT PRIMARY KEY, set_id TEXT NOT NULL REFERENCES page_sets(set_id), ordinal INTEGER NOT NULL,
  url TEXT, record_key TEXT, label TEXT, page_id TEXT, status TEXT NOT NULL DEFAULT 'queued',
  result_id TEXT REFERENCES results(result_id) ON DELETE SET NULL, error TEXT);
CREATE INDEX idx_members_set ON set_members(set_id, ordinal);
CREATE TABLE runs(
  run_id TEXT PRIMARY KEY, goal TEXT NOT NULL, status TEXT NOT NULL,
  page_ids TEXT NOT NULL DEFAULT '[]', set_id TEXT REFERENCES page_sets(set_id), config TEXT, status_message TEXT,
  result TEXT, error TEXT, failure TEXT, started_at REAL, ended_at REAL, created_at REAL NOT NULL);
CREATE TABLE run_lookup(run_id TEXT PRIMARY KEY REFERENCES runs(run_id) ON DELETE CASCADE,
  config TEXT NOT NULL DEFAULT '{}');
CREATE INDEX idx_run_lookup_task ON run_lookup(json_extract(config,'$.taskId'));
CREATE TABLE run_messages(
  message_id TEXT PRIMARY KEY, chat_id TEXT NOT NULL,
  target_run_id TEXT NOT NULL REFERENCES runs(run_id) ON DELETE CASCADE,
  delivery_run_id TEXT NOT NULL UNIQUE,
  mode TEXT NOT NULL CHECK(mode IN ('queue','steer')),
  status TEXT NOT NULL CHECK(status IN ('accepted','delivering','delivered','needs_attention','cancelled')),
  text TEXT NOT NULL, page_ids TEXT NOT NULL DEFAULT '[]', context_page_refs TEXT NOT NULL DEFAULT '[]', mentions TEXT NOT NULL DEFAULT '[]',
  expected_revision INTEGER NOT NULL DEFAULT 0,
  resends_nonce TEXT,
  error TEXT, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL);
CREATE INDEX idx_run_messages_chat ON run_messages(chat_id,created_at,message_id);
CREATE INDEX idx_run_messages_status ON run_messages(status,created_at,message_id);
CREATE TABLE conversations(
  chat_id TEXT PRIMARY KEY, title TEXT NOT NULL, archived INTEGER NOT NULL DEFAULT 0,
  private_task INTEGER NOT NULL DEFAULT 0 CHECK(private_task IN (0,1)),
  created_at REAL NOT NULL, updated_at REAL NOT NULL);
CREATE INDEX idx_conversations_state_updated ON conversations(archived, updated_at DESC);
CREATE TABLE steps(
  step_id TEXT PRIMARY KEY, run_id TEXT NOT NULL, page_id TEXT,
  op TEXT NOT NULL, inputs TEXT, expected TEXT, outcome TEXT, started_at REAL NOT NULL);
CREATE INDEX idx_steps_run ON steps(run_id, started_at);
CREATE TABLE results(
  result_id TEXT PRIMARY KEY, run_id TEXT, member_id TEXT REFERENCES set_members(member_id),
  page_id TEXT, source_url TEXT NOT NULL, values_json TEXT NOT NULL, evidence TEXT,
  observed_at REAL NOT NULL, status TEXT NOT NULL, error TEXT);
CREATE INDEX idx_results_member ON results(member_id);
CREATE INDEX idx_results_run ON results(run_id);
CREATE TABLE content_memory(
  memory_id TEXT PRIMARY KEY, profile_id TEXT NOT NULL, workspace_id TEXT NOT NULL REFERENCES workspaces(workspace_id) ON DELETE CASCADE,
  source_key TEXT NOT NULL, origin TEXT NOT NULL, captured_at INTEGER NOT NULL, expires_at INTEGER NOT NULL,
  ciphertext TEXT NOT NULL, UNIQUE(profile_id,workspace_id,source_key));
CREATE INDEX idx_content_memory_workspace ON content_memory(profile_id,workspace_id,captured_at DESC);
CREATE INDEX idx_content_memory_expiry ON content_memory(expires_at);
CREATE TABLE programs(
  program_id TEXT PRIMARY KEY, name TEXT NOT NULL, description TEXT, version INTEGER NOT NULL DEFAULT 1,
  site_key TEXT NOT NULL, parameters TEXT NOT NULL DEFAULT '[]', steps_json TEXT NOT NULL,
  preconditions TEXT, postconditions TEXT, use_count INTEGER NOT NULL DEFAULT 0,
  last_used_at REAL, created_at REAL NOT NULL);
CREATE TABLE artifacts(
  artifact_id TEXT PRIMARY KEY, run_id TEXT, page_id TEXT,
  path TEXT NOT NULL, media_type TEXT NOT NULL, size INTEGER NOT NULL, status TEXT NOT NULL, created_at REAL NOT NULL);
CREATE TABLE result_versions(
  artifact_id TEXT PRIMARY KEY REFERENCES artifacts(artifact_id) ON DELETE CASCADE,
  root_artifact_id TEXT NOT NULL, parent_artifact_id TEXT NOT NULL,
  chat_id TEXT NOT NULL, revision INTEGER NOT NULL, created_at REAL NOT NULL,
  UNIQUE(root_artifact_id,revision));
CREATE INDEX idx_result_versions_chat ON result_versions(chat_id,created_at DESC);
CREATE TABLE model_calls(
  call_id TEXT PRIMARY KEY, run_id TEXT, role TEXT NOT NULL, model_id TEXT NOT NULL,
  provider_metadata TEXT, duration_ms REAL NOT NULL, input_tokens REAL, output_tokens REAL,
  cost_usd REAL, cost_estimated INTEGER, error TEXT, created_at REAL NOT NULL);
CREATE TABLE events(
  seq INTEGER PRIMARY KEY AUTOINCREMENT, run_id TEXT, type TEXT NOT NULL,
  payload TEXT NOT NULL, ts REAL NOT NULL);
CREATE INDEX idx_events_ts ON events(ts);
CREATE TABLE history(
  url TEXT NOT NULL, title TEXT NOT NULL DEFAULT '', page_id TEXT, visited_at REAL NOT NULL,
  PRIMARY KEY(url, visited_at));
CREATE INDEX idx_history_recent ON history(visited_at DESC, url DESC);
CREATE TABLE history_projection_staging(
  url TEXT NOT NULL, title TEXT NOT NULL, visited_at REAL NOT NULL,
  PRIMARY KEY(url, visited_at));
CREATE TABLE bookmarks(
  url TEXT PRIMARY KEY, title TEXT NOT NULL, created_at REAL NOT NULL,
  folder_path TEXT NOT NULL DEFAULT '[]',
  reading_list INTEGER NOT NULL DEFAULT 0, read_at REAL);
-- Reading-list offline copies: the extracted article JSON, keyed by the owning bookmark.
CREATE TABLE bookmark_articles(
  url TEXT PRIMARY KEY, json TEXT NOT NULL, saved_at REAL NOT NULL);
CREATE TABLE bookmark_folders(path TEXT PRIMARY KEY);
CREATE TABLE downloads(
  id TEXT PRIMARY KEY, page_id TEXT, filename TEXT, path TEXT, state TEXT NOT NULL,
  size INTEGER NOT NULL DEFAULT 0, total_bytes INTEGER, started_at REAL NOT NULL, ended_at REAL);
CREATE TABLE spans(
  span_id TEXT PRIMARY KEY, parent_id TEXT, name TEXT NOT NULL,
  run_id TEXT, page_id TEXT,
  started_at REAL NOT NULL, ended_at REAL, duration_ms REAL, outcome TEXT, attrs TEXT NOT NULL DEFAULT '{}');
CREATE INDEX idx_spans_run ON spans(run_id, started_at);
CREATE TABLE response_metadata(
  session_id TEXT, document_epoch INTEGER, document_url TEXT,
  request_id TEXT PRIMARY KEY, page_id TEXT NOT NULL, url TEXT NOT NULL, method TEXT NOT NULL,
  status INTEGER, content_type TEXT, started_at REAL NOT NULL, ended_at REAL, duration_ms REAL,
  body_artifact_id TEXT, body_bytes INTEGER,
  truncated INTEGER NOT NULL DEFAULT 0, run_id TEXT);
CREATE INDEX idx_respmeta_page ON response_metadata(page_id, started_at);
CREATE TABLE datasets(
  dataset_id TEXT PRIMARY KEY, run_id TEXT, page_id TEXT,
  source TEXT NOT NULL, schema_json TEXT NOT NULL DEFAULT '[]', row_count INTEGER NOT NULL DEFAULT 0,
  values_json TEXT NOT NULL DEFAULT '[]', provenance TEXT, created_at REAL NOT NULL,
  stale INTEGER NOT NULL DEFAULT 0);
CREATE TABLE operations(
  operation_id TEXT PRIMARY KEY, site_key TEXT NOT NULL, name TEXT NOT NULL,
  description TEXT, input_schema TEXT NOT NULL DEFAULT '{}', output_schema TEXT NOT NULL DEFAULT '{}',
  effect_class TEXT NOT NULL DEFAULT 'read', guards TEXT NOT NULL DEFAULT '{}',
  created_at REAL NOT NULL, updated_at REAL NOT NULL,
  UNIQUE(site_key, name));
CREATE TABLE operation_implementations(
  impl_id TEXT PRIMARY KEY, operation_id TEXT NOT NULL REFERENCES operations(operation_id), kind TEXT NOT NULL,
  executable TEXT NOT NULL, state TEXT NOT NULL DEFAULT 'candidate',
  evidence TEXT NOT NULL DEFAULT '[]', stats TEXT NOT NULL DEFAULT '{}',
  created_at REAL NOT NULL, updated_at REAL NOT NULL);
CREATE INDEX idx_impl_op ON operation_implementations(operation_id, state);
CREATE TABLE operation_invocations(
  invocation_id TEXT PRIMARY KEY, operation_id TEXT NOT NULL REFERENCES operations(operation_id) ON DELETE CASCADE,
  impl_id TEXT REFERENCES operation_implementations(impl_id) ON DELETE SET NULL,
  run_id TEXT, request_key TEXT, inputs TEXT NOT NULL DEFAULT '{}', status TEXT NOT NULL,
  effect_outcome TEXT NOT NULL DEFAULT 'unknown', route_reason TEXT,
  started_at REAL NOT NULL, ended_at REAL, error TEXT);
CREATE TABLE operation_reconciliations(
  invocation_id TEXT PRIMARY KEY REFERENCES operation_invocations(invocation_id) ON DELETE CASCADE,
  task_id TEXT NOT NULL, task_revision INTEGER NOT NULL,
  outcome TEXT NOT NULL CHECK(outcome IN ('applied','not_applied')), evidence_id TEXT NOT NULL,
  note TEXT NOT NULL, recorded_at INTEGER NOT NULL);
CREATE TABLE action_intents(
  id TEXT PRIMARY KEY, idempotency_key TEXT NOT NULL UNIQUE,
  run_id TEXT NOT NULL, page_id TEXT NOT NULL, document_epoch INTEGER NOT NULL,
  task_id TEXT, task_revision INTEGER,
  status TEXT NOT NULL CHECK(status IN ('pending','confirmed','uncertain','not_applied')),
  created_at INTEGER NOT NULL, evidence TEXT);
CREATE INDEX idx_action_intents_unresolved ON action_intents(run_id, page_id, status);
CREATE INDEX idx_action_intents_task_unresolved ON action_intents(task_id,task_revision,status);
CREATE TABLE action_transitions(
  seq INTEGER PRIMARY KEY AUTOINCREMENT, intent_id TEXT NOT NULL REFERENCES action_intents(id) ON DELETE CASCADE,
  status TEXT NOT NULL, recorded_at INTEGER NOT NULL, evidence TEXT);
CREATE TABLE safety_approval_requests(
  approval_id TEXT PRIMARY KEY, fingerprint TEXT NOT NULL, action_json TEXT NOT NULL, turn_id TEXT NOT NULL, thread_id TEXT NOT NULL,
  lifetime TEXT NOT NULL CHECK(lifetime IN ('turn','thread')), expires_at INTEGER NOT NULL,
  state TEXT NOT NULL CHECK(state IN ('pending','accepted','declined','cancelled','consumed')),
  decision TEXT, created_at INTEGER NOT NULL, decided_at INTEGER);
CREATE TABLE safety_approval_batch_members(approval_id TEXT NOT NULL REFERENCES safety_approval_requests(approval_id) ON DELETE CASCADE,fingerprint TEXT NOT NULL,consumed_at INTEGER,PRIMARY KEY(approval_id,fingerprint));
CREATE TABLE coding_repl_cells(run_id TEXT NOT NULL,tool_call_id TEXT NOT NULL,sequence INTEGER NOT NULL,source TEXT NOT NULL,status TEXT NOT NULL CHECK(status IN ('running','parked','completed','failed')),page_id TEXT,cell_id TEXT,PRIMARY KEY(run_id,tool_call_id));
CREATE INDEX idx_safety_approvals_turn ON safety_approval_requests(turn_id,state);
CREATE TABLE coder_worktree_receipts(action_id TEXT PRIMARY KEY,run_id TEXT NOT NULL,state TEXT NOT NULL CHECK(state IN ('pending','confirmed','uncertain')),body TEXT NOT NULL);
CREATE TABLE coding_repl_calls(run_id TEXT NOT NULL,tool_call_id TEXT NOT NULL,ordinal INTEGER NOT NULL,signature TEXT NOT NULL,response TEXT NOT NULL,PRIMARY KEY(run_id,tool_call_id,ordinal));
CREATE TABLE coding_file_receipts(
  receipt_id TEXT PRIMARY KEY, run_id TEXT NOT NULL, action_id TEXT NOT NULL, created_at INTEGER NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('pending','confirmed','partially_applied','uncertain','not_applied')),
  receipt TEXT NOT NULL, summary TEXT NOT NULL, UNIQUE(run_id,action_id));
CREATE INDEX coding_file_receipts_run ON coding_file_receipts(run_id,created_at);
CREATE INDEX coding_file_receipts_status ON coding_file_receipts(run_id,status,created_at);
CREATE TABLE coding_process_receipts(
  process_id TEXT PRIMARY KEY, run_id TEXT NOT NULL, action_id TEXT NOT NULL,
  state TEXT NOT NULL CHECK(state IN ('starting','running','completed','failed','stopped','interrupted','uncertain')),
  receipt TEXT NOT NULL, UNIQUE(run_id,action_id));
CREATE TABLE safety_run_authority(run_id TEXT PRIMARY KEY, revision INTEGER NOT NULL DEFAULT 0);
CREATE TABLE safety_run_grants(
  grant_id TEXT PRIMARY KEY, run_id TEXT NOT NULL, profile_id TEXT NOT NULL,
  category TEXT NOT NULL, origin TEXT, policy_revision INTEGER NOT NULL,
  authority_revision INTEGER NOT NULL, created_at INTEGER NOT NULL, revoked_at INTEGER);
CREATE INDEX idx_safety_run_grants ON safety_run_grants(run_id,category,revoked_at);
CREATE TABLE safety_send_journal(
  nonce TEXT PRIMARY KEY, thread_id TEXT NOT NULL, turn_id TEXT NOT NULL, text TEXT NOT NULL,
  digest TEXT NOT NULL, state TEXT NOT NULL CHECK(state IN ('queued','offline','sending','accepted','acknowledged','parked','failed','cancelled')),
  acceptance_id TEXT, supersedes TEXT, root_nonce TEXT, error_code TEXT, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL);
CREATE INDEX idx_safety_send_turn ON safety_send_journal(turn_id,created_at);
CREATE INDEX idx_safety_send_state ON safety_send_journal(state,created_at);
CREATE TABLE safety_challenge_recovery(
  run_id TEXT NOT NULL, origin TEXT NOT NULL, attempts INTEGER NOT NULL, updated_at INTEGER NOT NULL,
  PRIMARY KEY(run_id,origin));
CREATE TABLE safety_audit(seq INTEGER PRIMARY KEY AUTOINCREMENT, kind TEXT NOT NULL, payload TEXT NOT NULL, recorded_at INTEGER NOT NULL);
CREATE TABLE workspaces(workspace_id TEXT PRIMARY KEY, name TEXT NOT NULL, created_at INTEGER NOT NULL);
CREATE TABLE tasks(task_id TEXT PRIMARY KEY, workspace_id TEXT NOT NULL REFERENCES workspaces(workspace_id), revision INTEGER NOT NULL,
  state TEXT NOT NULL CHECK(state IN ('open','archived')), updated_at INTEGER NOT NULL, json TEXT NOT NULL);
CREATE INDEX idx_tasks_workspace ON tasks(workspace_id,state,updated_at);
CREATE TABLE task_lookup(task_id TEXT PRIMARY KEY REFERENCES tasks(task_id) ON DELETE CASCADE,
  conversation_id TEXT, source_origin TEXT);
CREATE INDEX idx_task_lookup_conversation ON task_lookup(conversation_id);
CREATE INDEX idx_task_lookup_source ON task_lookup(source_origin,conversation_id);
CREATE TABLE task_revisions(task_id TEXT NOT NULL REFERENCES tasks(task_id), revision INTEGER NOT NULL, json TEXT NOT NULL,
  PRIMARY KEY(task_id,revision));
CREATE TABLE task_evidence(seq INTEGER PRIMARY KEY AUTOINCREMENT, evidence_id TEXT NOT NULL UNIQUE,
  task_id TEXT NOT NULL REFERENCES tasks(task_id), task_revision INTEGER NOT NULL, criterion_id TEXT NOT NULL, json TEXT NOT NULL);
CREATE INDEX idx_task_evidence ON task_evidence(task_id,task_revision,criterion_id,seq);
CREATE TABLE criterion_reviews(seq INTEGER PRIMARY KEY AUTOINCREMENT, review_id TEXT NOT NULL UNIQUE,
  task_id TEXT NOT NULL REFERENCES tasks(task_id), task_revision INTEGER NOT NULL, criterion_id TEXT NOT NULL, json TEXT NOT NULL);
CREATE INDEX idx_criterion_reviews ON criterion_reviews(task_id,task_revision,criterion_id,seq);
CREATE TABLE agent_connections(
  connection_id TEXT PRIMARY KEY, name TEXT NOT NULL, client TEXT NOT NULL,
  scope_kind TEXT NOT NULL CHECK(scope_kind IN ('workspace','task','session')),
  workspace_id TEXT NOT NULL REFERENCES workspaces(workspace_id), task_id TEXT REFERENCES tasks(task_id),
  session_id TEXT, token_hash TEXT NOT NULL UNIQUE,
  created_at INTEGER NOT NULL, last_used_at INTEGER, revoked_at INTEGER, expires_at INTEGER,
  CHECK((scope_kind='workspace' AND task_id IS NULL AND session_id IS NULL)
     OR (scope_kind='task' AND task_id IS NOT NULL)
     OR (scope_kind='session' AND session_id IS NOT NULL))
);
CREATE INDEX idx_agent_connections_scope ON agent_connections(workspace_id,task_id,revoked_at);
CREATE TABLE calendar_connections(
  connection_id TEXT PRIMARY KEY, provider TEXT NOT NULL CHECK(provider='google'),
  account_key TEXT NOT NULL, account_key_lookup TEXT, label TEXT NOT NULL, secret_name TEXT NOT NULL UNIQUE,
  scopes TEXT NOT NULL, state TEXT NOT NULL CHECK(state IN ('active','needs_reauth')),
  created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL, revoked_at INTEGER);
CREATE UNIQUE INDEX idx_calendar_account_active ON calendar_connections(provider,account_key_lookup) WHERE revoked_at IS NULL;
CREATE TABLE calendar_task_grants(
  grant_id TEXT PRIMARY KEY, task_id TEXT NOT NULL REFERENCES tasks(task_id),
  task_revision INTEGER NOT NULL, connection_id TEXT NOT NULL REFERENCES calendar_connections(connection_id),
  created_at INTEGER NOT NULL, revoked_at INTEGER);
CREATE UNIQUE INDEX idx_calendar_task_grant_active ON calendar_task_grants(task_id,task_revision,connection_id) WHERE revoked_at IS NULL;
CREATE TABLE vault_items(
  item_id TEXT PRIMARY KEY, label TEXT NOT NULL, kind TEXT NOT NULL CHECK(kind IN ('password','secret')),
  username TEXT, account_label TEXT, origin TEXT NOT NULL,
  created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL, revoked_at INTEGER, expires_at INTEGER);
CREATE TABLE vault_grants(
  grant_id TEXT PRIMARY KEY, item_id TEXT NOT NULL REFERENCES vault_items(item_id), credential_ref TEXT NOT NULL UNIQUE,
  task_id TEXT REFERENCES tasks(task_id), workspace_id TEXT REFERENCES workspaces(workspace_id), origin TEXT NOT NULL, account_label TEXT,
  created_at INTEGER NOT NULL, expires_at INTEGER NOT NULL, revoked_at INTEGER,
  last_used_at INTEGER, use_count INTEGER NOT NULL DEFAULT 0);
CREATE INDEX idx_vault_grants_item ON vault_grants(item_id,revoked_at);
CREATE TABLE vault_access(
  seq INTEGER PRIMARY KEY AUTOINCREMENT, item_id TEXT REFERENCES vault_items(item_id),
  grant_id TEXT REFERENCES vault_grants(grant_id), action TEXT NOT NULL,
  actor TEXT NOT NULL, task_id TEXT, origin TEXT, detail TEXT, recorded_at INTEGER NOT NULL);
CREATE INDEX idx_vault_access_item ON vault_access(item_id,seq);
CREATE TABLE routines(
  routine_id TEXT PRIMARY KEY, workspace_id TEXT NOT NULL REFERENCES workspaces(workspace_id), revision INTEGER NOT NULL,
  paused INTEGER NOT NULL DEFAULT 0, archived_at INTEGER, updated_at INTEGER NOT NULL, json TEXT NOT NULL);
CREATE INDEX idx_routines_workspace ON routines(workspace_id,archived_at,updated_at);
CREATE TABLE routine_revisions(routine_id TEXT NOT NULL REFERENCES routines(routine_id), revision INTEGER NOT NULL, json TEXT NOT NULL,
  PRIMARY KEY(routine_id,revision));
CREATE TABLE routine_runs(
  routine_run_id TEXT PRIMARY KEY, routine_id TEXT NOT NULL REFERENCES routines(routine_id), revision INTEGER NOT NULL,
  occurrence_id TEXT, occurrence_identity TEXT, trigger_page_id TEXT, trigger_document_epoch INTEGER, status TEXT NOT NULL,
  reason TEXT, chat_id TEXT, run_id TEXT, parameters TEXT NOT NULL DEFAULT '{}',
  started_at INTEGER, ended_at INTEGER, created_at INTEGER NOT NULL);
CREATE UNIQUE INDEX idx_routine_occurrence ON routine_runs(occurrence_identity) WHERE occurrence_identity IS NOT NULL;
CREATE INDEX idx_routine_runs ON routine_runs(routine_id,created_at);
CREATE TABLE coordinator_leases(
  lease_key TEXT PRIMARY KEY, owner_id TEXT NOT NULL, acquired_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL, generation INTEGER NOT NULL DEFAULT 1, fenced INTEGER NOT NULL DEFAULT 0);
CREATE TABLE criterion_verifications(
  verification_id TEXT PRIMARY KEY, task_id TEXT NOT NULL REFERENCES tasks(task_id), task_revision INTEGER NOT NULL,
  criterion_id TEXT NOT NULL, json TEXT NOT NULL, recorded_at INTEGER NOT NULL);
CREATE INDEX idx_criterion_verifications ON criterion_verifications(task_id,task_revision,criterion_id,recorded_at);
-- Omnibox deep-history search: FTS5 external-content index over history,
-- kept in sync by triggers so repo writes need no index bookkeeping.
CREATE VIRTUAL TABLE history_fts USING fts5(url, title, content='history', content_rowid='rowid');
CREATE TRIGGER history_fts_ai AFTER INSERT ON history BEGIN
  INSERT INTO history_fts(rowid,url,title) VALUES(new.rowid,new.url,new.title);
END;
CREATE TRIGGER history_fts_ad AFTER DELETE ON history BEGIN
  INSERT INTO history_fts(history_fts,rowid,url,title) VALUES('delete',old.rowid,old.url,old.title);
END;
CREATE TRIGGER history_fts_au AFTER UPDATE ON history BEGIN
  INSERT INTO history_fts(history_fts,rowid,url,title) VALUES('delete',old.rowid,old.url,old.title);
  INSERT INTO history_fts(rowid,url,title) VALUES(new.rowid,new.url,new.title);
END;
CREATE TABLE plugins(
  plugin_id TEXT PRIMARY KEY, name TEXT NOT NULL, version TEXT, description TEXT,
  workspace_id TEXT NOT NULL REFERENCES workspaces(workspace_id),
  routine_ids TEXT NOT NULL DEFAULT '[]',
  created_at INTEGER NOT NULL, uninstalled_at INTEGER);
CREATE INDEX idx_plugins_workspace ON plugins(workspace_id,uninstalled_at);
CREATE TABLE plugin_assets(
  asset_id TEXT PRIMARY KEY, plugin_id TEXT NOT NULL REFERENCES plugins(plugin_id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK(kind IN ('skill','mcp_server','hook')),
  name TEXT NOT NULL, description TEXT, content TEXT, digest TEXT NOT NULL,
  imported_at INTEGER NOT NULL);
CREATE INDEX idx_plugin_assets_plugin ON plugin_assets(plugin_id,kind,name);
CREATE TABLE plugin_skill_grants(
  grant_id TEXT PRIMARY KEY, asset_id TEXT NOT NULL REFERENCES plugin_assets(asset_id) ON DELETE CASCADE,
  asset_digest TEXT NOT NULL, scope_kind TEXT NOT NULL CHECK(scope_kind IN ('workspace','task')),
  scope_id TEXT NOT NULL, task_revision INTEGER,
  created_at INTEGER NOT NULL, revoked_at INTEGER);
CREATE INDEX idx_plugin_skill_grants_asset ON plugin_skill_grants(asset_id,revoked_at);
CREATE TABLE goals(
  goal_id TEXT PRIMARY KEY, workspace_id TEXT NOT NULL REFERENCES workspaces(workspace_id),
  status TEXT NOT NULL, run_id TEXT UNIQUE, body TEXT NOT NULL,
  created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL);
CREATE INDEX idx_goals_workspace ON goals(workspace_id,updated_at);
CREATE TABLE hooks(
  hook_id TEXT PRIMARY KEY, workspace_id TEXT NOT NULL REFERENCES workspaces(workspace_id),
  event TEXT NOT NULL, trust TEXT NOT NULL CHECK(trust IN ('approved','revoked')),
  body TEXT NOT NULL, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL);
CREATE INDEX idx_hooks_event ON hooks(workspace_id,event,trust);
CREATE TABLE hook_invocations(
  invocation_id TEXT PRIMARY KEY, hook_id TEXT NOT NULL REFERENCES hooks(hook_id),
  event_id TEXT NOT NULL, state TEXT NOT NULL CHECK(state IN ('invoking','completed','failed','uncertain')),
  error TEXT, created_at INTEGER NOT NULL, ended_at INTEGER,
  UNIQUE(hook_id,event_id));
CREATE INDEX idx_hook_invocations_state ON hook_invocations(state,created_at);
CREATE TABLE outbound_mcp_servers(
  server_id TEXT PRIMARY KEY, workspace_id TEXT NOT NULL REFERENCES workspaces(workspace_id),
  state TEXT NOT NULL CHECK(state IN ('active','revoked')),
  body TEXT NOT NULL, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL);
CREATE INDEX idx_outbound_mcp_servers_workspace ON outbound_mcp_servers(workspace_id,state);
CREATE TABLE outbound_mcp_bundles(
  server_id TEXT PRIMARY KEY REFERENCES outbound_mcp_servers(server_id) ON DELETE CASCADE,
  sha256 TEXT NOT NULL, archive_base64 TEXT NOT NULL, installed_at INTEGER NOT NULL);
CREATE TABLE outbound_mcp_calls(
  call_id TEXT PRIMARY KEY, server_id TEXT NOT NULL REFERENCES outbound_mcp_servers(server_id),
  tool_name TEXT NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('invoking','completed','uncertain')),
  created_at INTEGER NOT NULL, ended_at INTEGER);
CREATE INDEX idx_outbound_mcp_calls_state ON outbound_mcp_calls(status,created_at);
CREATE TABLE subagent_groups(
  group_id TEXT PRIMARY KEY, parent_run_id TEXT NOT NULL REFERENCES runs(run_id), workspace_id TEXT NOT NULL REFERENCES workspaces(workspace_id),
  body TEXT NOT NULL, state TEXT NOT NULL CHECK(state IN ('active','closed')), created_at INTEGER NOT NULL,
  UNIQUE(parent_run_id));
CREATE TABLE subagents(
  agent_id TEXT PRIMARY KEY, group_id TEXT NOT NULL REFERENCES subagent_groups(group_id), run_id TEXT REFERENCES runs(run_id),
  reserved_run_id TEXT NOT NULL UNIQUE,
  state TEXT NOT NULL CHECK(state IN ('starting','running','completed','failed','cancelled','interrupted')),
  body TEXT NOT NULL, created_at INTEGER NOT NULL, ended_at INTEGER);
CREATE INDEX idx_subagents_group_state ON subagents(group_id,state);
CREATE UNIQUE INDEX idx_subagents_run ON subagents(run_id);
CREATE TABLE site_user_css(
  profile_id TEXT NOT NULL, origin TEXT NOT NULL, css TEXT NOT NULL, updated_at INTEGER NOT NULL,
  PRIMARY KEY(profile_id,origin));
CREATE TABLE site_zap_rules(
  rule_id TEXT PRIMARY KEY, profile_id TEXT NOT NULL, origin TEXT NOT NULL,
  selector TEXT NOT NULL, match_count INTEGER NOT NULL, created_at INTEGER NOT NULL,
  UNIQUE(profile_id,origin,selector));
CREATE INDEX idx_site_zap_rules_profile_origin ON site_zap_rules(profile_id,origin,created_at);
CREATE INDEX idx_datasets_page ON datasets(page_id);
CREATE INDEX idx_artifacts_run ON artifacts(run_id);
CREATE INDEX idx_artifacts_page ON artifacts(page_id);
CREATE INDEX idx_model_calls_run ON model_calls(run_id);
CREATE INDEX idx_events_run ON events(run_id, seq);
CREATE INDEX idx_invocations_request ON operation_invocations(request_key, operation_id);
CREATE INDEX idx_respmeta_run ON response_metadata(run_id);

-- safety/decide.ts
CREATE TABLE safety_decisions(
      decision_id TEXT PRIMARY KEY, at INTEGER NOT NULL,
      profile_id TEXT NOT NULL, scope_kind TEXT NOT NULL, scope_id TEXT NOT NULL,
      actor TEXT NOT NULL, effect TEXT NOT NULL, category TEXT NOT NULL, action TEXT NOT NULL,
      origin TEXT, destination TEXT, status TEXT NOT NULL, source TEXT NOT NULL,
      authorized_by TEXT, refusal_id TEXT, suspension_kind TEXT, request_json TEXT NOT NULL, decision_json TEXT NOT NULL);
      CREATE INDEX idx_safety_decisions_run ON safety_decisions(profile_id, action, at);
      CREATE INDEX idx_safety_decisions_activity ON safety_decisions(profile_id, at DESC, decision_id DESC);

-- safety/suspensions.ts
CREATE TABLE safety_suspensions(
      suspension_id TEXT PRIMARY KEY, run_id TEXT NOT NULL, thread_id TEXT NOT NULL, turn_id TEXT NOT NULL,
      kind TEXT NOT NULL CHECK(kind IN ('ask-user-question','approval','action-confirmation','touch-id','handoff','budget')),
      request_json TEXT NOT NULL, approval_id TEXT,
      state TEXT NOT NULL CHECK(state IN ('pending','answered','cancelled','expired')),
      created_at INTEGER NOT NULL, resolved_at INTEGER);
      CREATE INDEX idx_suspensions_run ON safety_suspensions(run_id, state);
      CREATE INDEX idx_suspensions_approval ON safety_suspensions(approval_id, state);

-- agent/durable.ts
CREATE TABLE page_claims(
      claim_id TEXT PRIMARY KEY, page_id TEXT NOT NULL, run_id TEXT NOT NULL,
      kind TEXT NOT NULL CHECK(kind IN ('owned','borrowed')),
      status TEXT NOT NULL CHECK(status IN ('active','released')),
      created_at INTEGER NOT NULL, released_at INTEGER);
      CREATE INDEX idx_page_claims_page ON page_claims(page_id, status);
      CREATE INDEX idx_page_claims_run ON page_claims(run_id, status);

-- agent/loop/transcript.ts
CREATE TABLE run_transcript(
      run_id TEXT NOT NULL, seq INTEGER NOT NULL,
      kind TEXT NOT NULL DEFAULT 'message' CHECK(kind IN ('message','park')),
      message TEXT, park TEXT,
      appended_at INTEGER NOT NULL,
      PRIMARY KEY(run_id, seq));

-- services/night-shift.ts
CREATE TABLE night_queue(id TEXT PRIMARY KEY,kind TEXT NOT NULL,payload TEXT NOT NULL,
      budget_usd REAL NOT NULL,status TEXT NOT NULL,created_by TEXT NOT NULL,created_at INTEGER NOT NULL,
      run_id TEXT,window_date TEXT,window_start INTEGER,window_end INTEGER,foreground INTEGER NOT NULL DEFAULT 0);

-- services/demo-recorder.ts
CREATE TABLE demonstrations(id TEXT PRIMARY KEY,page_id TEXT NOT NULL,state TEXT NOT NULL,payload TEXT NOT NULL,started_at INTEGER NOT NULL);

-- services/skill-repair.ts
CREATE TABLE skill_replay_repairs(id TEXT PRIMARY KEY,payload TEXT NOT NULL,state TEXT NOT NULL);

-- services/skill-continuation.ts
CREATE TABLE skill_continuations(run_id TEXT PRIMARY KEY,payload TEXT NOT NULL);

-- services/download-naming.ts
CREATE TABLE download_renames(download_id TEXT PRIMARY KEY, receipt_id TEXT UNIQUE, receipt TEXT, status TEXT NOT NULL, created_at INTEGER NOT NULL);

-- services/memory-pipeline.ts
CREATE TABLE memory_pipeline_leases(
      workspace_id TEXT PRIMARY KEY, owner TEXT NOT NULL, expires_at INTEGER NOT NULL);
      CREATE TABLE memory_pipeline_watermarks(
      workspace_id TEXT NOT NULL, run_id TEXT NOT NULL, captured_at INTEGER NOT NULL,
      PRIMARY KEY(workspace_id,run_id));

CREATE TABLE memory_files(
  workspace_id TEXT NOT NULL REFERENCES workspaces(workspace_id) ON DELETE CASCADE,
  name TEXT NOT NULL, generation TEXT NOT NULL, key_name TEXT NOT NULL, content TEXT NOT NULL,
  PRIMARY KEY(workspace_id,name));
CREATE TABLE memory_history(
  workspace_id TEXT NOT NULL REFERENCES workspaces(workspace_id) ON DELETE CASCADE,
  revision_id TEXT NOT NULL, captured_at INTEGER NOT NULL CHECK(captured_at>=0),
  generation TEXT NOT NULL, key_name TEXT NOT NULL, content TEXT NOT NULL,
  PRIMARY KEY(workspace_id,revision_id));
CREATE INDEX idx_memory_history_workspace ON memory_history(workspace_id,captured_at,revision_id);

-- Protected, bounded derivatives of opted-in browsing content.
CREATE TABLE ai_result_cache(
  cache_key TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL REFERENCES workspaces(workspace_id) ON DELETE CASCADE,
  profile_id TEXT NOT NULL,
  ciphertext TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  accessed_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL);
CREATE INDEX idx_ai_result_cache_profile_access ON ai_result_cache(profile_id,accessed_at,cache_key);

-- Immutable Set lineage survives member removal for child billing attribution.
CREATE TABLE run_tool_calls(
  run_id TEXT NOT NULL,
  tool_call_id TEXT NOT NULL,
  tool_name TEXT NOT NULL,
  started_at REAL NOT NULL,
  PRIMARY KEY(run_id,tool_call_id));

CREATE TABLE set_run_members(
  child_run_id TEXT PRIMARY KEY,
  parent_run_id TEXT NOT NULL,
  set_id TEXT NOT NULL,
  member_id TEXT NOT NULL,
  source_digest TEXT NOT NULL CHECK(length(source_digest)=64),
  state TEXT NOT NULL CHECK(state IN ('starting','running','completed','failed','cancelled')),
  created_at REAL NOT NULL,
  updated_at REAL NOT NULL,
  UNIQUE(parent_run_id,member_id));
CREATE INDEX idx_set_run_members_parent ON set_run_members(parent_run_id,child_run_id);

CREATE TABLE execution_resources (
  resource_id TEXT PRIMARY KEY,
  run_id TEXT NOT NULL,
  provider TEXT NOT NULL CHECK(provider = 'vercel-sandbox'),
  state TEXT NOT NULL CHECK(state IN ('reserved', 'running', 'settled', 'cancelled')),
  original_digest TEXT NOT NULL CHECK(length(original_digest) = 64),
  quote_digest TEXT NOT NULL CHECK(length(quote_digest) = 64),
  quote_json TEXT NOT NULL,
  reservation_usd REAL CHECK(reservation_usd >= 0),
  sandbox_id TEXT,
  session_id TEXT,
  usage_json TEXT,
  cost_usd REAL CHECK(cost_usd >= 0),
  cost_estimated INTEGER NOT NULL DEFAULT 1 CHECK(cost_estimated IN (0, 1)),
  stop_ack INTEGER NOT NULL DEFAULT 0 CHECK(stop_ack IN (0, 1)),
  created_at REAL NOT NULL,
  updated_at REAL NOT NULL,
  started_at REAL,
  ended_at REAL,
  CHECK(state != 'settled' OR (stop_ack = 1 AND sandbox_id IS NOT NULL AND session_id IS NOT NULL)),
  CHECK(state != 'cancelled' OR (started_at IS NULL AND sandbox_id IS NULL)),
  CHECK(cost_estimated = 1 OR (state = 'settled' AND cost_usd IS NOT NULL))
);
CREATE INDEX execution_resources_run ON execution_resources(run_id, created_at, resource_id);

-- @schema run_starts
CREATE TABLE run_start_receipts(
  request_id TEXT PRIMARY KEY, digest TEXT NOT NULL CHECK(length(digest)=64),
  window_id TEXT NOT NULL, chat_id TEXT NOT NULL, run_id TEXT NOT NULL UNIQUE,
  state TEXT NOT NULL CHECK(state IN ('reserved','accepted','abandoned')));

-- @schema process_logs
CREATE TABLE coding_process_logs(
  process_id TEXT NOT NULL REFERENCES coding_process_receipts(process_id) ON DELETE CASCADE,
  byte_offset INTEGER NOT NULL CHECK(byte_offset>=0),
  byte_length INTEGER NOT NULL CHECK(byte_length BETWEEN 1 AND 65536),
  text TEXT NOT NULL, PRIMARY KEY(process_id,byte_offset));

-- @schema private_spend
CREATE TABLE IF NOT EXISTS private_spend (
  lease_id TEXT PRIMARY KEY,
  kind TEXT NOT NULL CHECK(kind IN ('model','resource')),
  created_at INTEGER NOT NULL,
  reserved_usd REAL CHECK(reserved_usd IS NULL OR reserved_usd>=0),
  cost_usd REAL CHECK(cost_usd IS NULL OR cost_usd>=0),
  cost_estimated INTEGER NOT NULL DEFAULT 1 CHECK(cost_estimated IN (0,1)),
  state TEXT NOT NULL CHECK(state IN ('pending','settled','unknown'))
);
CREATE INDEX IF NOT EXISTS private_spend_created ON private_spend(created_at);

-- @schema documents
CREATE TABLE document_snapshots(
  owner_kind TEXT NOT NULL CHECK(owner_kind IN ('conversation','task')),
  owner_id TEXT NOT NULL,
  document_id TEXT NOT NULL,
  snapshot_id TEXT NOT NULL,
  state TEXT NOT NULL CHECK(state IN ('staging','published')),
  manifest TEXT,
  PRIMARY KEY(owner_kind,owner_id,document_id,snapshot_id),
  UNIQUE(owner_kind,owner_id,document_id),
  CHECK((state='staging' AND manifest IS NULL) OR (state='published' AND manifest IS NOT NULL))
);
CREATE INDEX document_snapshot_staging ON document_snapshots(state) WHERE state='staging';
CREATE TABLE document_segments(
  owner_kind TEXT NOT NULL,
  owner_id TEXT NOT NULL,
  document_id TEXT NOT NULL,
  snapshot_id TEXT NOT NULL,
  ordinal INTEGER NOT NULL CHECK(ordinal>=0),
  json TEXT NOT NULL,
  PRIMARY KEY(owner_kind,owner_id,document_id,snapshot_id,ordinal),
  FOREIGN KEY(owner_kind,owner_id,document_id,snapshot_id)
    REFERENCES document_snapshots(owner_kind,owner_id,document_id,snapshot_id) ON DELETE CASCADE
);

-- @schema channels
CREATE TABLE channel_connections(
  connection_id TEXT PRIMARY KEY, revision TEXT NOT NULL,
  workspace_id TEXT NOT NULL REFERENCES workspaces(workspace_id),
  enabled INTEGER NOT NULL CHECK(enabled IN (0,1)), body TEXT NOT NULL,
  created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL);
CREATE TABLE channel_peers(
  connection_id TEXT NOT NULL REFERENCES channel_connections(connection_id) ON DELETE CASCADE,
  peer_key TEXT NOT NULL, body TEXT NOT NULL,
  PRIMARY KEY(connection_id,peer_key));
CREATE TABLE channel_threads(
  connection_id TEXT NOT NULL, peer_key TEXT NOT NULL, thread_key TEXT NOT NULL,
  task_id TEXT NOT NULL REFERENCES tasks(task_id), body TEXT NOT NULL,
  PRIMARY KEY(connection_id,peer_key,thread_key),
  FOREIGN KEY(connection_id,peer_key) REFERENCES channel_peers(connection_id,peer_key) ON DELETE CASCADE);
CREATE TABLE channel_messages(
  connection_id TEXT NOT NULL REFERENCES channel_connections(connection_id) ON DELETE CASCADE,
  message_key TEXT NOT NULL, revision TEXT NOT NULL, peer_key TEXT NOT NULL,
  state TEXT NOT NULL CHECK(state IN ('pending','admitting','running','queued','completed','rejected','retired','failed')),
  run_id TEXT, body TEXT NOT NULL, received_at INTEGER NOT NULL,
  PRIMARY KEY(connection_id,message_key));
CREATE INDEX channel_messages_pending ON channel_messages(connection_id,state,received_at);
CREATE TABLE channel_outbox(
  delivery_id TEXT PRIMARY KEY,
  connection_id TEXT NOT NULL REFERENCES channel_connections(connection_id) ON DELETE CASCADE,
  revision TEXT NOT NULL, peer_key TEXT NOT NULL, run_id TEXT,
  state TEXT NOT NULL CHECK(state IN ('pending','sending','delivered','failed','unknown')),
  body TEXT NOT NULL, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL);
CREATE INDEX channel_outbox_pending ON channel_outbox(connection_id,state,created_at);
CREATE TABLE channel_cursors(
  connection_id TEXT PRIMARY KEY REFERENCES channel_connections(connection_id) ON DELETE CASCADE,
  revision TEXT NOT NULL, body TEXT NOT NULL);

-- @schema spend
CREATE TABLE IF NOT EXISTS ai_spend(
        reservation_id TEXT PRIMARY KEY,
        source TEXT NOT NULL,
        model_id TEXT NOT NULL,
        reserved_nanos INTEGER NOT NULL CHECK(reserved_nanos >= 0),
        actual_nanos INTEGER CHECK(actual_nanos >= 0),
        cost_estimated INTEGER NOT NULL DEFAULT 1,
        created_at INTEGER NOT NULL,
        settled_at INTEGER
      );
