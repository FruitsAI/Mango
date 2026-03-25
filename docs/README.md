# Mango 文档总览

本文档是 Mango 项目的“总入口”，也是回答“软件开发过程到底需要哪些文档”的正式说明。

## 一、为什么 Mango 需要完整文档体系

Mango 不是一个单纯的页面项目，也不是一个只写几个 API 的服务端项目。它同时涉及：

- 产品定位
- 桌面交互
- 本地执行与权限安全
- Agent 适配器协议
- 工程化与发布链路
- 测试、上线、反馈、迭代

如果没有一整套文档，项目很容易出现三类问题：

1. 需求边界不断漂移
2. 不同人对“什么是完成”理解不一致
3. 开发过程很忙，但产品越来越不像原来想做的东西

## 二、软件开发过程中建议具备的文档分类

为了避免项目跑偏，建议至少具备以下文档：

### 1. 产品类文档

- 产品愿景与定位
- PRD（产品需求文档）
- 用户画像与核心场景
- 竞品分析
- 信息架构
- 路线图与里程碑
- 需求池与优先级

### 2. 设计类文档

- 品牌与视觉规范
- 交互规范
- 页面/模块结构说明
- 关键状态与异常态说明

### 3. 研发类文档

- 技术架构总览
- 模块职责划分
- 数据模型与接口契约
- 本地存储策略
- 权限与安全模型
- 开发工作流与工程规范
- Monorepo 与目录结构规范
- 前端 / 本地桌面后端 / 云后端开发规范
- CI/CD 与自动化规范

### 4. 质量类文档

- 测试策略
- 验收标准
- 回归范围
- 风险项清单

### 5. 发布与运营类文档

- 发布流程
- 上线检查清单
- 隐私说明
- 遥测策略
- 运维与事故响应

### 6. 协作治理类文档

- 文档治理规则
- 贡献指南
- 安全说明
- 决策与风险记录

## 三、Mango 当前文档结构

### 产品文档

- [docs/product/vision-and-positioning.md](D:/willxue/FruitsAI/Mango/.worktrees/codex-mango-v1/docs/product/vision-and-positioning.md)
- [docs/product/prd.md](D:/willxue/FruitsAI/Mango/.worktrees/codex-mango-v1/docs/product/prd.md)
- [docs/product/personas-and-scenarios.md](D:/willxue/FruitsAI/Mango/.worktrees/codex-mango-v1/docs/product/personas-and-scenarios.md)
- [docs/product/competitive-analysis.md](D:/willxue/FruitsAI/Mango/.worktrees/codex-mango-v1/docs/product/competitive-analysis.md)
- [docs/product/information-architecture.md](D:/willxue/FruitsAI/Mango/.worktrees/codex-mango-v1/docs/product/information-architecture.md)
- [docs/product/roadmap-and-milestones.md](D:/willxue/FruitsAI/Mango/.worktrees/codex-mango-v1/docs/product/roadmap-and-milestones.md)
- [docs/product/v1-backlog.md](D:/willxue/FruitsAI/Mango/.worktrees/codex-mango-v1/docs/product/v1-backlog.md)

### 设计文档

- [docs/design/brand-and-ux-guidelines.md](D:/willxue/FruitsAI/Mango/.worktrees/codex-mango-v1/docs/design/brand-and-ux-guidelines.md)
- [docs/design/interaction-spec.md](D:/willxue/FruitsAI/Mango/.worktrees/codex-mango-v1/docs/design/interaction-spec.md)

### 研发文档

- [docs/product/technical-design.md](D:/willxue/FruitsAI/Mango/.worktrees/codex-mango-v1/docs/product/technical-design.md)
- [docs/engineering/technical-architecture.md](D:/willxue/FruitsAI/Mango/.worktrees/codex-mango-v1/docs/engineering/technical-architecture.md)
- [docs/engineering/detailed-architecture.md](D:/willxue/FruitsAI/Mango/.worktrees/codex-mango-v1/docs/engineering/detailed-architecture.md)
- [docs/engineering/module-contracts.md](D:/willxue/FruitsAI/Mango/.worktrees/codex-mango-v1/docs/engineering/module-contracts.md)
- [docs/engineering/storage-and-security.md](D:/willxue/FruitsAI/Mango/.worktrees/codex-mango-v1/docs/engineering/storage-and-security.md)
- [docs/engineering/development-workflow.md](D:/willxue/FruitsAI/Mango/.worktrees/codex-mango-v1/docs/engineering/development-workflow.md)
- [docs/engineering/engineering-standards-overview.md](D:/willxue/FruitsAI/Mango/.worktrees/codex-mango-v1/docs/engineering/engineering-standards-overview.md)
- [docs/engineering/code-style-and-naming-standards.md](D:/willxue/FruitsAI/Mango/.worktrees/codex-mango-v1/docs/engineering/code-style-and-naming-standards.md)
- [docs/engineering/api-and-database-naming-standards.md](D:/willxue/FruitsAI/Mango/.worktrees/codex-mango-v1/docs/engineering/api-and-database-naming-standards.md)
- [docs/engineering/openapi-standards.md](D:/willxue/FruitsAI/Mango/.worktrees/codex-mango-v1/docs/engineering/openapi-standards.md)
- [docs/engineering/sqlite-migration-standards.md](D:/willxue/FruitsAI/Mango/.worktrees/codex-mango-v1/docs/engineering/sqlite-migration-standards.md)
- [docs/engineering/monorepo-and-directory-standards.md](D:/willxue/FruitsAI/Mango/.worktrees/codex-mango-v1/docs/engineering/monorepo-and-directory-standards.md)
- [docs/engineering/frontend-development-standards.md](D:/willxue/FruitsAI/Mango/.worktrees/codex-mango-v1/docs/engineering/frontend-development-standards.md)
- [docs/engineering/desktop-backend-development-standards.md](D:/willxue/FruitsAI/Mango/.worktrees/codex-mango-v1/docs/engineering/desktop-backend-development-standards.md)
- [docs/engineering/backend-development-standards.md](D:/willxue/FruitsAI/Mango/.worktrees/codex-mango-v1/docs/engineering/backend-development-standards.md)
- [docs/engineering/interface-and-contract-standards.md](D:/willxue/FruitsAI/Mango/.worktrees/codex-mango-v1/docs/engineering/interface-and-contract-standards.md)
- [docs/engineering/security-and-permission-standards.md](D:/willxue/FruitsAI/Mango/.worktrees/codex-mango-v1/docs/engineering/security-and-permission-standards.md)
- [docs/engineering/ci-cd-and-automation-standards.md](D:/willxue/FruitsAI/Mango/.worktrees/codex-mango-v1/docs/engineering/ci-cd-and-automation-standards.md)
- [docs/engineering/templates-and-examples.md](D:/willxue/FruitsAI/Mango/.worktrees/codex-mango-v1/docs/engineering/templates-and-examples.md)

### 质量文档

- [docs/quality/test-strategy.md](D:/willxue/FruitsAI/Mango/.worktrees/codex-mango-v1/docs/quality/test-strategy.md)
- [docs/quality/acceptance-criteria.md](D:/willxue/FruitsAI/Mango/.worktrees/codex-mango-v1/docs/quality/acceptance-criteria.md)
- [docs/quality/quality-gates-and-testing-standards.md](D:/willxue/FruitsAI/Mango/.worktrees/codex-mango-v1/docs/quality/quality-gates-and-testing-standards.md)

### 发布与运营文档

- [docs/launch/release-process.md](D:/willxue/FruitsAI/Mango/.worktrees/codex-mango-v1/docs/launch/release-process.md)
- [docs/launch/versioning-and-release-standards.md](D:/willxue/FruitsAI/Mango/.worktrees/codex-mango-v1/docs/launch/versioning-and-release-standards.md)
- [docs/launch/checklist.md](D:/willxue/FruitsAI/Mango/.worktrees/codex-mango-v1/docs/launch/checklist.md)
- [docs/launch/privacy.md](D:/willxue/FruitsAI/Mango/.worktrees/codex-mango-v1/docs/launch/privacy.md)
- [docs/launch/telemetry-policy.md](D:/willxue/FruitsAI/Mango/.worktrees/codex-mango-v1/docs/launch/telemetry-policy.md)
- [docs/launch/operations-and-support.md](D:/willxue/FruitsAI/Mango/.worktrees/codex-mango-v1/docs/launch/operations-and-support.md)

### 协作治理文档

- [docs/process/document-governance.md](D:/willxue/FruitsAI/Mango/.worktrees/codex-mango-v1/docs/process/document-governance.md)
- [docs/process/risk-and-decision-log.md](D:/willxue/FruitsAI/Mango/.worktrees/codex-mango-v1/docs/process/risk-and-decision-log.md)
- [docs/process/source-control-standards.md](D:/willxue/FruitsAI/Mango/.worktrees/codex-mango-v1/docs/process/source-control-standards.md)
- [docs/process/pull-request-standards.md](D:/willxue/FruitsAI/Mango/.worktrees/codex-mango-v1/docs/process/pull-request-standards.md)
- [CONTRIBUTING.md](D:/willxue/FruitsAI/Mango/.worktrees/codex-mango-v1/CONTRIBUTING.md)
- [SECURITY.md](D:/willxue/FruitsAI/Mango/.worktrees/codex-mango-v1/SECURITY.md)

## 四、推荐阅读顺序

### 如果你是产品负责人

1. 产品愿景与定位
2. PRD
3. 用户画像与核心场景
4. 路线图与里程碑
5. 验收标准

### 如果你是设计负责人

1. 产品愿景与定位
2. 信息架构
3. 品牌与体验规范
4. 交互规范
5. 验收标准

### 如果你是研发负责人

1. PRD
2. 技术设计
3. 技术架构总览
4. 详细架构设计
5. 模块契约
6. 工程规范总览
7. 代码风格、命名与注释规范
8. API 与数据库命名规范
9. OpenAPI 契约治理规范
10. SQLite migration 规范
11. Monorepo 与目录结构规范
12. 前后端开发规范
13. 存储与安全
14. 测试策略
15. 发布流程与版本通道

## 五、文档使用规则

- 文档不是“写给别人看”的，而是团队对齐边界的工具
- 需求变化后，要先改文档，再安排实现
- 不允许长期存在“代码已经变了，文档还没跟上”的状态
- 每个阶段的输出，都应能在文档中找到对应依据

## 六、后续维护建议

建议后续每个版本都做一次文档巡检，重点检查：

- 需求范围是否变化
- 交互流程是否变化
- 核心接口是否变化
- 测试与发布标准是否变化
- 是否有无主文档长期失效
