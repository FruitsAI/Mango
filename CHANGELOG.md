# 更新日志

本项目的所有重要变更都会记录在此文件中。

格式遵循 [Keep a Changelog 1.1.0](https://keepachangelog.com/zh-CN/1.1.0/)，并尽量遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

## [Unreleased]

### Added

- 预留后续迭代的未发布变更记录区。

### Fixed

- 新增 `.gitattributes` 统一文本文件为 `LF`，修复 Windows CI 中 `Prettier --check` 因 `CRLF` 检出导致的格式校验失败。
- 修复终态任务仍可再次触发 `Approve and run` 的问题，主进程会将其视为 no-op，渲染层也会在任务进入终态后禁用执行按钮。
- 修复 `Claude Code CLI` 适配器在同一 session 重复执行时复用事件 ID 的问题，避免时间线渲染出现重复 key。
- 为桌面主窗口补充受信导航策略，仅允许本地 `file://` 或开发服务器地址留在应用内，其它链接统一改走系统浏览器。
- 修复桌面端构建把 `@mango/*` workspace 包 external 到运行时的问题，避免 clean checkout 下 Electron 启动时因缺少 `dist` 产物而报 `ERR_MODULE_NOT_FOUND`。
- 强化桌面端 smoke 检查，校验主进程与 preload 产物中不再残留 `@mango/*` 裸导入，并兼容根级 `out/renderer` 输出路径。
- 修复桌面端开发启动仍依赖旧版 `MAIN_WINDOW_VITE_*` 全局变量的问题，改为读取 `electron-vite` 当前注入的 `ELECTRON_RENDERER_URL` 并固定加载 `out/renderer/index.html`。

## [0.1.0] - 2026-03-25

### Added

- 建立 `pnpm + Turborepo` 的 Mango Monorepo 工程底座，拆分 `apps/*`、`packages/*`、`tooling/*`、`tests/*`、`infra/*` 与 `docs/*`。
- 建立 Mango v1 中文文档体系，覆盖产品定义、信息架构、技术架构、工程规范、测试策略、发布流程与协作流程。
- 建立桌面端 `Electron + React + TypeScript` 应用骨架，落地 `Plan -> Approve -> Go -> Review` 主工作台界面。
- 建立 `@mango/core`、`@mango/contracts`、`@mango/adapters`、`@mango/ui` 与 `@mango/config-*` 共享包。
- 建立 `TaskSession`、`ExecutionEvent`、`WorkspaceContext`、`PermissionPolicy` 等领域模型与基础测试。
- 建立 OpenAPI 单一事实源文件，作为未来 REST 契约与类型生成的基线。
- 建立 SQLite migration 基线、迁移目录与桌面端持久化测试。
- 新增 `Claude Code CLI` 适配器入口，支持 CLI 可用性检测、结构化计划生成与批准后执行摘要收口。
- 新增桌面端适配器选择控件，允许用户看到当前执行适配器及其可用性说明。
- 新增针对真实 CLI 适配器、桌面主进程编排、SQLite 存储与渲染工作台的测试覆盖。

### Changed

- 桌面端本地持久化从早期 JSON 主存储升级为 `SQLite 主存储 + JSON 首次导入兜底`。
- 桌面端 SQLite 运行时从实验性的 `node:sqlite` 切换为 `better-sqlite3`，消除实验性警告并稳定 native 依赖构建。
- 桌面端主进程从写死的单一 mock adapter 改为可扩展的多 adapter 注册与选择机制。
- Workspace 现在会持久化 `primaryAdapterId` 和 `configuredAdapters`，为后续任务恢复和多 provider 扩展打基础。
- Renderer 不再盲选第一个 adapter，而是优先选择工作区上次使用且当前可用的 adapter。

### Fixed

- 修复适配器执行失败时任务状态可能错误落为成功的问题，失败场景现在会被收口为 `failed` 并保留错误事件。
- 修复桌面端类型检查未稳定指向 workspace 源码路径的问题，统一通过根级 `tsconfig.base.json` 路径别名约束桌面包类型检查。
- 修复 SQLite 持久化层对 native SQLite 运行时的依赖不稳定问题，补齐 `pnpm onlyBuiltDependencies` 和类型声明。
- 修复工作台对适配器状态可见性不足的问题，补充执行 adapter 选择与状态展示。

### Security

- 保持高风险能力按 `PermissionPolicy` 显式评估与展示，为后续权限批准、失败恢复和审计记录预留统一边界。
