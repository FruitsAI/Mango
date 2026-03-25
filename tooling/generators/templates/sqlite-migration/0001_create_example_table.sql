PRAGMA foreign_keys = ON;

BEGIN IMMEDIATE;

-- 说明：示例 migration，请替换为真实表名与业务字段。
CREATE TABLE IF NOT EXISTS example_records (
  id TEXT PRIMARY KEY,
  display_name TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_example_records__created_at
  ON example_records (created_at);

COMMIT;
