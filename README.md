# Mango

`You Plan, Mango Goes.`

Mango 是一个面向开发者的桌面端 Agent 工作台。它不想成为“另一个聊天框”，而是要成为一个让开发者放心把真实任务交出去执行的桌面执行中枢。

Mango 的核心体验是四步闭环：

1. `Plan`：先生成计划，不盲目开跑
2. `Approve`：高风险能力必须显式授权
3. `Go`：执行过程可见，日志、文件变化、事件统一展示
4. `Review`：任务结束后留下可回顾、可复盘的结果

## 项目定位

- 用户群体：独立开发者、全栈工程师、重度本地开发工具用户
- 产品形态：跨平台桌面应用，优先服务本地工程工作流
- 产品理念：`Man, Go!`，用户决定方向，Mango 负责执行
- 价值主张：让 Agent 执行变得可控、可信、可追踪、可复盘

## 当前仓库包含什么

- `apps/desktop`：Electron + React + TypeScript 桌面应用
- `apps/web`、`apps/api`、`apps/worker`：未来 Web / 云端骨架占位
- `packages/core`：任务生命周期、权限策略、共享领域模型
- `packages/adapters`：Agent 适配器层，当前提供 `MockClaudeCodeAdapter`
- `packages/contracts`：共享 DTO、IPC channel、错误模型与未来 API 契约
- `packages/ui`：共享 design token 与 UI 基础资产
- `packages/config-*`：TS、ESLint、Vitest、Playwright 共享配置
- `tooling/`：工程脚本、目录检查、模板与生成器
- `docs/`：完整的中文产品、设计、研发、测试、发布、流程文档体系
- `.github/`：CI 工作流和 Issue 模板

## 当前实现状态

当前仓库已经完成第一批基础骨架，适合作为后续正式研发的起点：

- 已有桌面工作台界面
- 已有 `Plan -> Approve -> Go -> Review` 主流程骨架
- 已有任务状态机、权限模型、事件模型
- 已有本地持久化的最小实现
- 已有用于产品演进的 mock adapter
- 已有 `pnpm + turbo` Monorepo 底座
- 已有共享 contracts / config 包
- 已有测试、类型检查、构建与结构校验链路

当前仍然是“产品骨架阶段”，尚未接入真实生产级 CLI Agent。

## 快速启动

```bash
pnpm install
pnpm test
pnpm typecheck
pnpm build
pnpm dev
```

## 常用脚本

- `pnpm dev`：启动桌面应用开发环境
- `pnpm lint`：执行 ESLint Flat Config 校验
- `pnpm format:check`：执行格式检查
- `pnpm architecture-check`：执行目录与依赖边界检查
- `pnpm test`：运行全部单元测试与界面测试
- `pnpm typecheck`：执行 TypeScript 类型检查
- `pnpm build`：构建 workspace 包与桌面应用
- `pnpm smoke:desktop`：验证桌面构建产物
- `pnpm package`：生成桌面安装包
- `pnpm hooks:install`：安装本地 Git hooks
- `pnpm prtitle:check -- "<title>"`：校验 PR 标题格式
- `pnpm verify`：执行默认发布前校验链路

## 开发过程中最重要的文档入口

如果你第一次参与 Mango，建议按下面顺序阅读：

1. [docs/README.md](D:/willxue/FruitsAI/Mango/.worktrees/codex-mango-v1/docs/README.md)
2. [docs/product/vision-and-positioning.md](D:/willxue/FruitsAI/Mango/.worktrees/codex-mango-v1/docs/product/vision-and-positioning.md)
3. [docs/product/prd.md](D:/willxue/FruitsAI/Mango/.worktrees/codex-mango-v1/docs/product/prd.md)
4. [docs/product/roadmap-and-milestones.md](D:/willxue/FruitsAI/Mango/.worktrees/codex-mango-v1/docs/product/roadmap-and-milestones.md)
5. [docs/engineering/technical-architecture.md](D:/willxue/FruitsAI/Mango/.worktrees/codex-mango-v1/docs/engineering/technical-architecture.md)
6. [docs/engineering/module-contracts.md](D:/willxue/FruitsAI/Mango/.worktrees/codex-mango-v1/docs/engineering/module-contracts.md)
7. [docs/engineering/engineering-standards-overview.md](D:/willxue/FruitsAI/Mango/.worktrees/codex-mango-v1/docs/engineering/engineering-standards-overview.md)
8. [docs/engineering/code-style-and-naming-standards.md](D:/willxue/FruitsAI/Mango/.worktrees/codex-mango-v1/docs/engineering/code-style-and-naming-standards.md)
9. [docs/engineering/api-and-database-naming-standards.md](D:/willxue/FruitsAI/Mango/.worktrees/codex-mango-v1/docs/engineering/api-and-database-naming-standards.md)
10. [docs/engineering/openapi-standards.md](D:/willxue/FruitsAI/Mango/.worktrees/codex-mango-v1/docs/engineering/openapi-standards.md)
11. [docs/engineering/sqlite-migration-standards.md](D:/willxue/FruitsAI/Mango/.worktrees/codex-mango-v1/docs/engineering/sqlite-migration-standards.md)
12. [docs/engineering/monorepo-and-directory-standards.md](D:/willxue/FruitsAI/Mango/.worktrees/codex-mango-v1/docs/engineering/monorepo-and-directory-standards.md)
13. [docs/process/pull-request-standards.md](D:/willxue/FruitsAI/Mango/.worktrees/codex-mango-v1/docs/process/pull-request-standards.md)
14. [docs/launch/versioning-and-release-standards.md](D:/willxue/FruitsAI/Mango/.worktrees/codex-mango-v1/docs/launch/versioning-and-release-standards.md)
15. [docs/quality/quality-gates-and-testing-standards.md](D:/willxue/FruitsAI/Mango/.worktrees/codex-mango-v1/docs/quality/quality-gates-and-testing-standards.md)
16. [docs/launch/checklist.md](D:/willxue/FruitsAI/Mango/.worktrees/codex-mango-v1/docs/launch/checklist.md)

## 文档原则

Mango 的文档不是“补充材料”，而是研发过程的一部分：

- 没有文档定义的范围，不默认进入开发
- 影响公共行为的改动，必须同步更新相应文档
- 如果代码与文档冲突，以“最新确认的目标文档”作为判断依据
- 新成员应优先通过文档建立共识，再进入编码

## 下一阶段重点

第一阶段文档与骨架完成后，下一步建议优先推进：

1. 接入真实的 `Claude Code CLI` 或等价生产级 Adapter
2. 将本地持久化从 JSON 升级到 SQLite
3. 增加工作区管理、任务恢复、失败重试、取消控制
4. 为未来 `apps/api` 与 `apps/worker` 补正式实现
5. 完成 Beta 上线所需的安装包验证和反馈闭环
