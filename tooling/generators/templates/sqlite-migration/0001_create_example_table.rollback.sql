PRAGMA foreign_keys = ON;

BEGIN IMMEDIATE;

DROP INDEX IF EXISTS idx_example_records__created_at;
DROP TABLE IF EXISTS example_records;

COMMIT;
