# Pull Request 规范

## 一、适用范围

适用于 Mango 仓库中的：

- Draft PR
- Ready for Review PR
- Hotfix PR
- Release PR
- 代码评审、合并与回滚说明

## 二、文档目标

这份规范用于统一“提交之后、合并之前”的协作过程，避免出现下面这些情况：

- 标题可读，但正文没有边界
- 改动量很大，但没人知道风险点在哪里
- 契约变了，消费方和测试没有同步
- 合并方式混乱，主分支历史越来越难读

## 三、PR 状态模型

统一采用下面四个状态：

1. `Draft`
2. `Ready for Review`
3. `Approved`
4. `Merged` / `Closed`

### 1. Draft 阶段要求

- 目标已经明确
- 范围已经写清
- 还未完成的部分必须在正文中显式列出
- 如果预计改动较大，应尽早发 Draft PR，而不是等全部完成后一次性抛出

### 2. Ready for Review 阶段要求

- 已通过本地最低验证
- 已补齐必要文档
- 已标注风险与回滚方式
- 已说明是否影响公共契约、迁移、权限与发布

## 四、PR 标题规范

### 1. 基本格式

PR 标题统一沿用 Conventional Commits：

```text
<type>(<scope>): <summary>
```

其中 `scope` 可选。

### 2. 允许的类型

- `feat`
- `fix`
- `docs`
- `refactor`
- `test`
- `chore`
- `build`
- `ci`
- `perf`
- `revert`

### 3. 标题规则

- 标题必须能直接表达这次 PR 的主目标
- 推荐不超过 `100` 个字符
- 不以句号结尾
- `scope` 使用 `kebab-case` 或稳定模块名

正确示例：

- `docs(repo): add release and migration standards`
- `feat(desktop): persist workspace history in sqlite`
- `fix(renderer): prevent task review pane from losing logs`

错误示例：

- `update`
- `fix bug`
- `Mango release docs`

## 五、PR 描述模板要求

每个 PR 描述至少要包含以下部分：

1. 背景与目标
2. 本次改动范围
3. 明确不包含的内容
4. 契约 / 数据 / 权限影响
5. 验证方式
6. 风险与回滚方式
7. 文档同步情况

推荐模板：

```md
## 背景

## 本次改动

## 不包含

## 契约 / 数据 / 权限影响

## 验证

## 风险与回滚

## 文档同步
```

## 六、改动规模与拆分建议

### 1. 推荐拆分原则

- 一次 PR 只解决一个清晰目标
- 机械性格式化与行为变更应拆分
- 契约变更与消费方跟进应在同一个 PR 内闭环，或明确拆分顺序

### 2. 需要主动拆分的场景

- 改动跨多个业务域
- 同时包含目录重构、功能开发、样式重写
- diff 太大导致评审无法聚焦

### 3. 推荐阈值

- 如果 PR 已经明显超过 `800` 行有效 diff，应主动评估是否可以拆分
- 如果 PR 涉及 `contracts`、数据库迁移、权限策略，正文必须额外说明影响面

## 七、评审要求

### 1. 作者必须提供

- 可复现的验证命令
- 是否影响 `@mango/contracts`
- 是否引入 migration
- 是否需要手工升级步骤
- 是否涉及高风险权限或系统调用

### 2. 评审者优先检查

- 是否偏离文档边界
- 是否跨层乱引
- 是否存在未说明的契约破坏
- 是否缺少回归测试
- 是否遗漏文档同步

## 八、合并策略

### 1. 默认策略

- 默认使用 `Squash and merge`

原因：

- 保持 `main` 历史紧凑
- 避免 feature 分支上的试探性提交污染主线
- 便于通过单条提交回溯一次完整改动

### 2. 特殊情况

以下情况可以讨论是否改用其他合并方式：

- release 分支需要保留阶段性提交
- 热修复需要保留原始修复序列
- 法规、审计或外部协作要求保留提交颗粒度

如果采用非 `squash` 方式，必须在 PR 描述中写明原因。

## 九、自动化落地

当前仓库应通过以下机制约束 PR 质量：

- `.github/PULL_REQUEST_TEMPLATE.md`
- `tooling/scripts/check-pr-title.mjs`
- `.github/workflows/pr-title.yml`
- `pnpm verify`

## 十、推荐做法

- 功能跨度较大时，先开 Draft PR
- PR 标题与最终 squash commit 标题保持一致
- 契约变更优先附截图、示意图或字段对照
- 涉及迁移时给出“升级后验证点”

## 十一、禁止事项

- 标题符合规范，但正文没有任何边界说明
- 用 PR 临时扩 scope，却不更新正文
- 把“以后再补”写成一句空泛备注
- 没有验证就标记为 Ready for Review

## 十二、评审清单

- 标题是否符合 Conventional Commits
- 正文是否包含范围、验证、风险、回滚
- 是否说明了契约、迁移、权限影响
- 文档、测试、实现是否同步
- 合并策略是否明确

## 十三、常见反模式

- PR 描述只写“如题”
- 标题写 `fix: update`
- 把多个无关需求塞进一个 PR
- 契约已经变了，但消费方和测试没跟上
