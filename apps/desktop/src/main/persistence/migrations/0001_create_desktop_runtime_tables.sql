PRAGMA foreign_keys = ON;

BEGIN IMMEDIATE;

CREATE TABLE IF NOT EXISTS workspaces (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  root_path TEXT NOT NULL,
  shell TEXT NOT NULL,
  git_branch TEXT NOT NULL,
  git_status_summary TEXT NOT NULL,
  env_allow_list_json TEXT NOT NULL,
  recent_task_ids_json TEXT NOT NULL,
  provider_config_json TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS task_sessions (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  adapter_id TEXT NOT NULL,
  prompt TEXT NOT NULL,
  status TEXT NOT NULL,
  approved_by TEXT,
  plan_json TEXT,
  execution_summary TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (workspace_id) REFERENCES workspaces (id)
);

CREATE TABLE IF NOT EXISTS execution_events (
  id TEXT PRIMARY KEY,
  task_session_id TEXT NOT NULL,
  type TEXT NOT NULL,
  level TEXT NOT NULL,
  message TEXT NOT NULL,
  payload_json TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (task_session_id) REFERENCES task_sessions (id)
);

CREATE TABLE IF NOT EXISTS desktop_settings (
  id TEXT PRIMARY KEY,
  schema_version INTEGER NOT NULL,
  selected_workspace_id TEXT NOT NULL,
  telemetry_enabled INTEGER NOT NULL,
  release_channel TEXT NOT NULL,
  active_task_id TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (selected_workspace_id) REFERENCES workspaces (id),
  FOREIGN KEY (active_task_id) REFERENCES task_sessions (id)
);

CREATE INDEX IF NOT EXISTS idx_task_sessions__workspace_id_updated_at
  ON task_sessions (workspace_id, updated_at);

CREATE INDEX IF NOT EXISTS idx_execution_events__task_session_id_created_at
  ON execution_events (task_session_id, created_at);

COMMIT;
