# API 与数据库命名规范

## 一、适用范围

适用于：

- 未来 REST API 与 OpenAPI 文档
- Electron IPC 与本地 contracts 命名
- JSON 字段、查询参数、路径参数
- SQLite 表、列、索引、约束、迁移文件

## 二、API 路径命名规范

### 1. 路径基本规则

- 路径片段使用 `kebab-case`
- 资源名优先使用复数名词
- 不在路径里混入实现细节
- 除动作型端点外，避免在路径中直接使用动词

正确示例：

- `/workspaces`
- `/task-sessions`
- `/task-sessions/{taskSessionId}/events`
- `/release-channels`

避免示例：

- `/getTasks`
- `/taskSessionList`
- `/workspace_manager`

### 2. 动作型端点规则

只有在“不是标准资源 CRUD，而是明确动作”时，才允许动作子路径：

- `/task-sessions/{taskSessionId}:approve`
- `/task-sessions/{taskSessionId}:cancel`

如果项目后续不采用冒号动作语法，则退回子资源写法，但同一服务内必须统一。

## 三、API 字段命名规范

### 1. JSON / DTO 字段

- 统一使用 `camelCase`
- 缩写按单词处理，不连续全大写

正确示例：

- `workspaceId`
- `taskSessionId`
- `gitStatusSummary`
- `autoUpdateConfigured`

错误示例：

- `workspace_id`
- `TaskSessionId`
- `git_status_summary`
- `auto_update_configured`

### 2. 路径参数与查询参数

- 参数名统一使用 `camelCase`
- ID 参数统一以 `Id` 结尾

正确示例：

- `{workspaceId}`
- `{taskSessionId}`
- `?releaseChannel=beta`
- `?createdAfter=2026-03-01T00:00:00Z`

### 3. operationId 规则

- 使用 `camelCase`
- 采用 `verb + resource` 形式

正确示例：

- `listWorkspaces`
- `createTaskSession`
- `approveTaskSession`

### 4. 字段语义后缀

- 主键 / 引用：`Id`
- 时间戳：`At`
- 纯日期：`Date`
- 数量：`Count`
- 摘要：`Summary`
- 布尔：`is` / `has` / `can` / `should`

正确示例：

- `createdAt`
- `updatedAt`
- `lastRunAt`
- `eventCount`
- `isRetryable`

### 5. 错误码与枚举

- 错误码统一使用 `UPPER_SNAKE_CASE`
- 多单词枚举值在 wire format 中优先使用 `snake_case`

正确示例：

- `PERMISSION_DENIED`
- `TASK_STATE_INVALID`
- `summary_ready`
- `network_unavailable`

如果已有稳定领域值是单词小写，如 `planned`、`running`，允许继续沿用，禁止无意义重命名。

## 四、请求与响应结构规范

- 请求 DTO 使用 `XxxRequest` / `XxxInput`
- 响应 DTO 使用 `XxxResponse` / `XxxResult`
- 列表响应优先使用 `items + page`
- 错误响应必须包含 `code`、`message`、`retryable`

## 五、SQLite 命名规范

### 1. 表命名

- 统一使用 `snake_case`
- 统一使用复数名词表名

正确示例：

- `task_sessions`
- `execution_events`
- `workspace_contexts`
- `permission_decisions`

### 2. 列命名

- 统一使用 `snake_case`
- 主键默认命名为 `id`
- 外键统一命名为 `<referenced_singular>_id`

正确示例：

- `id`
- `task_session_id`
- `workspace_id`
- `created_at`
- `execution_summary`

### 3. 布尔、时间、数值列后缀

- 布尔列：`is_` / `has_` / `can_`
- 时间戳：`_at`
- 纯日期：`_date`
- 毫秒时长：`_ms`
- JSON 文本：`_json`

正确示例：

- `is_retryable`
- `has_pending_review`
- `created_at`
- `completed_at`
- `duration_ms`
- `metadata_json`

### 4. 索引与约束命名

- 主键：`pk_<table>`
- 外键：`fk_<table>__<column>__<referenced_table>`
- 唯一约束：`uq_<table>__<column_list>`
- 普通索引：`idx_<table>__<column_list>`
- 检查约束：`ck_<table>__<rule>`

正确示例：

- `pk_task_sessions`
- `fk_execution_events__task_session_id__task_sessions`
- `uq_workspaces__root_path`
- `idx_execution_events__task_session_id_created_at`

### 5. 迁移文件命名

- 使用有序数字前缀 + 动作描述
- 统一使用 `snake_case`
- 回滚脚本统一追加 `.rollback.sql`

正确示例：

- `0001_create_task_sessions.sql`
- `0002_add_release_channel_to_settings.sql`
- `0003_create_execution_events_index.sql`
- `0003_create_execution_events_index.rollback.sql`

### 6. SQLite 设计补充规则

- 不使用保留字作为表名或列名
- 不使用表名前缀重复命名列

正确示例：

- `task_sessions.id`
- `task_sessions.status`

避免示例：

- `task_sessions.task_session_status`

## 六、TypeScript 与 SQLite 的映射规则

- TypeScript 使用 `camelCase`
- SQLite 使用 `snake_case`
- 映射必须收口在 repository / persistence 层
- 不在 UI 层直接处理数据库字段命名转换

示例：

- TS：`taskSessionId`
- DB：`task_session_id`

## 七、推荐做法

- API、contracts、DB 三层命名先定语义，再定格式
- 先定义稳定字段，再开始消费方开发
- 新增字段时优先考虑 6 个月后别人是否能一眼看懂

## 八、禁止事项

- 同一语义在不同层使用三种不同名字
- API 用 `camelCase`，数据库也硬上 `camelCase`
- 随手缩写成 `cfg`、`ctx`、`mgr`、`tmp`
- 路径里夹带动词而又没有统一动作规范

## 九、评审清单

- 路径是否符合资源命名规则
- DTO 字段是否统一为 `camelCase`
- 错误码是否统一为 `UPPER_SNAKE_CASE`
- SQLite 表列、索引、约束是否遵守 `snake_case`
- TypeScript 与 SQLite 的命名转换是否收口在正确层

## 十、常见反模式

- API 路径用复数和单数混搭
- `id`、`taskId`、`task_id` 在同一层乱用
- 表名用单数，索引名又按复数生成
- migration 文件名没有顺序和动作语义
