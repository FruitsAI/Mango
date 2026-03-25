# 参与开发指南

本文档用于统一 Mango 项目的协作方式，避免“每个人都很努力，但方向越来越散”。

## 一、开始开发前必须完成的事情

在开始任何功能、重构、修复之前，先确认以下内容：

1. 你读过 [docs/README.md](D:/willxue/FruitsAI/Mango/.worktrees/codex-mango-v1/docs/README.md)
2. 你明确这次改动对应哪一份需求或设计文档
3. 你知道这次改动是否影响公共接口、交互流程、测试策略、发布流程
4. 你知道完成后需要更新哪些文档
5. 你知道需要遵守 [代码风格、命名与注释规范](D:/willxue/FruitsAI/Mango/.worktrees/codex-mango-v1/docs/engineering/code-style-and-naming-standards.md)

如果以上任一项不明确，请先补文档或澄清目标，不要直接开写。

## 二、推荐研发节奏

推荐按以下顺序推进：

1. 明确问题与目标
2. 产出或更新文档
3. 确认当前分支与提交策略符合 [分支与提交规范](D:/willxue/FruitsAI/Mango/.worktrees/codex-mango-v1/docs/process/source-control-standards.md)
4. 确认如果要提 PR，已经了解 [Pull Request 规范](D:/willxue/FruitsAI/Mango/.worktrees/codex-mango-v1/docs/process/pull-request-standards.md)
5. 拆解任务并确认边界
6. 先写测试或验证方式
7. 实现最小可行改动
8. 运行 `pnpm verify`
9. 更新文档与变更记录

## 三、分支与提交建议

- 分支命名建议：`codex/<topic>`、`feature/<topic>`、`fix/<topic>`
- 提交信息尽量表达“为什么改”和“改了什么”
- 不要把多个无关目标混在一个提交里
- PR 标题与正文请遵守 [Pull Request 规范](D:/willxue/FruitsAI/Mango/.worktrees/codex-mango-v1/docs/process/pull-request-standards.md)

推荐提交前缀：

- `feat:` 新功能
- `fix:` 缺陷修复
- `docs:` 文档更新
- `refactor:` 重构
- `test:` 测试补充
- `chore:` 工程性调整

建议在提交前运行：

- `pnpm hooks:install`
- `pnpm branch:check`
- `pnpm commitlint:recent`
- `pnpm format:check`

## 四、代码改动的最低要求

所有合并前的改动至少要满足：

- 能解释它服务于哪份文档
- 有对应测试或可重复验证方式
- 不破坏现有主流程
- 没有遗留明显 TODO 却不写进 backlog
- 通过 `pnpm lint`、`pnpm architecture-check`、`pnpm test`、`pnpm typecheck`、`pnpm build`

## 五、文档同步规则

以下情况必须同步更新文档：

- 功能范围变化
- 用户交互变化
- 接口字段变化
- 本地存储结构变化
- OpenAPI 契约变化
- SQLite migration 变化
- 权限策略变化
- 测试标准变化
- 发布流程变化

## 六、评审时重点看什么

代码评审优先关注：

- 是否偏离既定目标
- 是否引入安全或权限风险
- 是否破坏任务主流程
- 是否缺少回归测试
- 是否需要同步更新文档
- 是否绕过了 `@mango/contracts` 或 workspace 公共入口

## 七、不鼓励的行为

- 只根据聊天记录开发，不更新正式文档
- 看到“顺手可以一起做”的需求就临时扩 scope
- 为未来假设做过度设计
- 在没有验证的情况下声称“已经可以了”
- 在 renderer 中直接调用 Electron / Node 能力

## 八、对新成员的建议

先通过文档理解 Mango 的产品边界和技术约束，再开始动代码。Mango 的长期价值来自“清晰、可信、可控”，这个原则比一时的功能堆砌更重要。
