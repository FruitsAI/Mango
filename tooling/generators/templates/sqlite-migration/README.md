# SQLite Migration 模板

推荐用途：

- 新增表
- 新增索引
- 字段兼容性扩展
- 高风险 migration 的回滚配套

要求：

- 正向 migration 命名为 `0001_create_xxx.sql`
- 回滚脚本命名为 `0001_create_xxx.rollback.sql`
- 默认使用事务边界
- 结构迁移与数据回填尽量拆开
