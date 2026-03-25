# 技术设计摘要

## 一、文档定位

这是一份面向产品与研发共同阅读的技术设计摘要，用来说明 Mango 目前采用的整体技术方向，以及为什么这样设计。

更详细的工程拆解见：

- [docs/engineering/technical-architecture.md](D:/willxue/FruitsAI/Mango/.worktrees/codex-mango-v1/docs/engineering/technical-architecture.md)
- [docs/engineering/module-contracts.md](D:/willxue/FruitsAI/Mango/.worktrees/codex-mango-v1/docs/engineering/module-contracts.md)
- [docs/engineering/storage-and-security.md](D:/willxue/FruitsAI/Mango/.worktrees/codex-mango-v1/docs/engineering/storage-and-security.md)

## 二、当前技术路线

- 桌面壳：Electron
- UI：React + TypeScript
- 构建：electron-vite
- 测试：Vitest + Testing Library
- 打包：electron-builder
- 仓库组织：Monorepo

## 三、为什么选择 Electron

Mango 是一个需要深度访问本地能力的桌面 Agent 工具，涉及：

- 终端
- 文件系统
- 本地工作区
- 打包安装
- 自动更新

从当前阶段看，Electron 在这些能力上更成熟，也更适合快速搭建跨平台产品骨架。

## 四、为什么要拆成 `desktop / core / adapters`

### `apps/desktop`

负责桌面应用外壳、主进程、预加载桥接、渲染层 UI。

### `packages/core`

负责与框架无关的领域逻辑，例如：

- 任务状态机
- 权限策略
- 执行事件模型
- 工作区上下文

### `packages/adapters`

负责与具体 Agent / CLI 的适配逻辑，避免把底层实现细节直接写死在 UI 或主进程中。

## 五、当前实现阶段

当前实现仍处于产品骨架期，重点不是“支持多少能力”，而是验证这条主链路：

`任务输入 -> 计划 -> 权限 -> 执行 -> 回顾`

因此当前 adapter 是 mock 版，目的是先把体验、状态、契约和工程边界定下来。

## 六、后续技术演进方向

### 第一优先级

- 接入真实 CLI adapter
- 强化工作区管理
- 增加任务恢复和失败重试

### 第二优先级

- 将持久化从 JSON 升级到 SQLite
- 增加更细的执行事件分类
- 增强 review 面板

### 第三优先级

- 支持多个 adapter
- 更复杂的权限策略
- 更完整的遥测与可观测性
