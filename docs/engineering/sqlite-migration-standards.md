# SQLite Migration 规范

## 一、适用范围

适用于 Mango 中所有基于 SQLite 的：

- 桌面端本地数据迁移
- 未来云端轻量 SQLite 场景
- 表结构变更、索引变更、数据回填
- 回滚脚本与迁移验证

## 二、规范目标

Migration 不是“把 SQL 扔进去跑一下”，而是要确保下面这些事情可控：

1. 升级路径可预测
2. 失败时能定位到哪一步出错
3. 风险较高时有明确回滚策略
4. 迁移脚本、命名、验证口径一致

## 三、目录结构规范

桌面端推荐结构：

```text
apps/desktop/src/main/persistence/
  migrations/
    0001_create_task_sessions.sql
    0001_create_task_sessions.rollback.sql
```

未来云端推荐结构：

```text
apps/api/src/shared/infrastructure/database/
  migrations/
    0001_create_task_sessions.sql
    0001_create_task_sessions.rollback.sql
```

模板统一放在：

```text
tooling/generators/templates/sqlite-migration/
```

## 四、命名规范

### 1. 正向 migration

统一格式：

```text
<4位序号>_<动作描述>.sql
```

示例：

- `0001_create_task_sessions.sql`
- `0002_add_release_channel_to_settings.sql`
- `0003_create_execution_events_index.sql`

### 2. 回滚脚本

统一格式：

```text
<4位序号>_<动作描述>.rollback.sql
```

示例：

- `0002_add_release_channel_to_settings.rollback.sql`

### 3. 命名要求

- 动作用英文动词开头
- 统一使用 `snake_case`
- 一次 migration 只表达一个主要目的

## 五、必须遵守的规则

### 1. 事务边界

- 能放进事务的迁移必须放进事务
- 默认使用 `BEGIN IMMEDIATE;` 与 `COMMIT;`
- 失败时必须 `ROLLBACK;`

### 2. 幂等与重复执行容错

- 对表、索引、列的创建优先使用 `IF NOT EXISTS`
- 删除语句要谨慎，必要时先确认兼容窗口和回滚方式
- 数据回填脚本必须考虑重复执行影响

### 3. 约束与索引

- 新表必须显式主键
- 外键、唯一约束、索引命名遵守数据库命名规范
- 迁移中新增索引时，必须说明它服务于哪个查询路径

### 4. 数据迁移

- 结构迁移与大规模数据回填尽量分两步
- 高风险回填必须写验证查询
- 不要把“顺手清洗历史脏数据”混入结构迁移

### 5. 回滚要求

- 破坏性或高风险 migration 必须提供 `.rollback.sql`
- 如果因为 SQLite 限制无法安全回滚，必须在 PR 和发布说明中显式写明

## 六、推荐脚本结构

正向 migration 推荐模板：

```sql
PRAGMA foreign_keys = ON;

BEGIN IMMEDIATE;

-- 说明：新增 task_sessions 表，用于持久化任务生命周期主记录。
CREATE TABLE IF NOT EXISTS task_sessions (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_task_sessions__workspace_id_created_at
  ON task_sessions (workspace_id, created_at);

COMMIT;
```

回滚脚本推荐模板：

```sql
PRAGMA foreign_keys = ON;

BEGIN IMMEDIATE;

DROP INDEX IF EXISTS idx_task_sessions__workspace_id_created_at;
DROP TABLE IF EXISTS task_sessions;

COMMIT;
```

## 七、测试与验证要求

### 1. 本地验证

每个 migration 至少要验证：

- 空库升级是否通过
- 已有旧版本数据的升级是否通过
- 关键查询是否仍可执行

### 2. 契约验证

- 如果 migration 影响 `@mango/contracts` 消费字段，必须同步更新契约与文档
- 如果 migration 影响任务主流程，必须补集成验证

### 3. 回滚验证

- 提供回滚脚本的 migration，必须验证脚本可执行
- 如果不支持自动回滚，必须给出手工恢复步骤

## 八、推荐做法

- 先写 migration 目标，再写 SQL，而不是边改边想
- 结构变更、数据回填、索引优化尽量拆开
- 在注释中说明迁移原因，而不是复述 SQL
- 升级脚本与回滚脚本成对维护

## 九、禁止事项

- 直接在运行中的数据库上手工改表，却不回写 migration
- 一个 migration 同时做建表、回填、重命名、清洗历史脏数据
- 不写事务边界就执行多步结构变更
- 高风险变更没有任何回滚说明

## 十、模板与示例

统一模板目录：

```text
tooling/generators/templates/sqlite-migration/
  README.md
  0001_create_example_table.sql
  0001_create_example_table.rollback.sql
```

## 十一、评审清单

- 文件命名是否符合规范
- 是否说明迁移目的与影响面
- 是否具备事务边界与必要索引
- 是否补了回滚脚本或回滚说明
- 是否有对应验证步骤

## 十二、常见反模式

- migration 名叫 `0004_update.sql`
- 结构迁移和数据修复全部塞进一份 SQL
- 没有验证旧数据升级路径
- 迁移能执行，但没人知道失败后怎么恢复
