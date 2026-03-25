PRAGMA foreign_keys = ON;

BEGIN IMMEDIATE;

DROP INDEX IF EXISTS idx_execution_events__task_session_id_created_at;
DROP INDEX IF EXISTS idx_task_sessions__workspace_id_updated_at;
DROP TABLE IF EXISTS desktop_settings;
DROP TABLE IF EXISTS execution_events;
DROP TABLE IF EXISTS task_sessions;
DROP TABLE IF EXISTS workspaces;

COMMIT;
