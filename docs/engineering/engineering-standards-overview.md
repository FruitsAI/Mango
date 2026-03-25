# 工程规范总览

## 一、文档目的

这组工程规范用于回答三个问题：

1. Mango 的代码应该放在哪里
2. Mango 的功能应该按什么边界实现
3. Mango 的改动要通过哪些自动化门槛才允许继续推进

Mango 不是单一前端项目，而是一个同时覆盖桌面端、共享领域层、适配器层与未来云后端的产品仓库。没有统一规范，后续最容易失控的不是“代码能不能跑”，而是“边界还在不在”。

## 二、适用范围

本规范适用于以下目录与角色：

- `apps/desktop` 当前桌面应用
- `packages/core`、`packages/adapters`、`packages/contracts`、`packages/ui`
- 未来的 `apps/web`、`apps/api`、`apps/worker`
- `tooling/*`、`tests/*`、`infra/*`
- 所有提交 Mango 代码、文档、脚本、配置的贡献者

## 三、优先级顺序

规范冲突时按下面顺序处理：

1. 一级产品文档
2. 二级工程规范文档
3. 质量与发布规范
4. 局部模块说明
5. 代码中的临时注释

换句话说：

- 产品文档决定做什么
- 工程规范决定怎么做
- 质量规范决定怎么验

## 四、外部基线

Mango 的工程规范默认参考这些官方资料作为“为什么这样做”的依据：

- TypeScript strict 与 project references
- ESLint Flat Config
- Electron Security Tutorial
- React 保持组件纯净原则
- Testing Library Guiding Principles
- Node `package.json#exports`
- OpenAPI 最新规范
- pnpm workspaces
- Turborepo tasks / cache 约定

这些基线不要求团队成员逐条背诵，但规范制定和评审时必须与之保持一致。

## 五、文档地图

本轮新增的正式工程规范如下：

- `engineering-standards-overview.md`
- `code-style-and-naming-standards.md`
- `api-and-database-naming-standards.md`
- `openapi-standards.md`
- `sqlite-migration-standards.md`
- `monorepo-and-directory-standards.md`
- `frontend-development-standards.md`
- `desktop-backend-development-standards.md`
- `backend-development-standards.md`
- `interface-and-contract-standards.md`
- `security-and-permission-standards.md`
- `ci-cd-and-automation-standards.md`
- `templates-and-examples.md`
- `../quality/quality-gates-and-testing-standards.md`

## 六、必须遵守的规则

- 任何新功能都必须能指向一份正式文档
- 任何公共契约改动都必须同步更新类型、测试、文档和消费方
- 任何跨层调用都必须通过公共入口，禁止深层导入 `src/*`
- 任何高风险能力都必须经过显式权限策略
- 任何“规范”都必须有至少一个自动化落地点，不能只靠口头约定
- 命名、注释、格式化必须遵守统一代码风格规范
- 对外 API 与本地数据库必须遵守统一命名约定
- PR、版本号、发布通道必须遵守统一协作与发布规范

## 七、推荐做法

- 优先使用 `pnpm + turbo` 作为工作区执行入口
- 优先使用共享配置包收敛 TS、ESLint、Vitest 规则
- 优先使用 `feature-first` 管理前端目录
- 优先使用模块优先、模块内分层管理云后端目录
- 优先将共享类型沉淀到 `@mango/contracts`

## 八、禁止事项

- 直接在 `apps/*` 内复制一份共享类型
- 在 renderer 中直接使用 Electron / Node API
- 在 `packages/*` 中混入页面或产品编排逻辑
- 在 `src/` 中保留编译产物 `.js`、`.d.ts`
- 没有通过质量门禁就宣称“可上线”

## 九、文档使用方式

一个研发任务至少要回答下面四个问题：

- 目录放哪里
- 依赖谁
- 如何验证
- 需要同步哪些文档

如果读完本规范仍无法回答其中任意一项，说明局部规范还不够，需要补文档而不是直接编码。

## 十、测试与验证要求

这组规范本身也要被验证：

- `pnpm lint`
- `pnpm architecture-check`
- `pnpm test`
- `pnpm typecheck`
- `pnpm build`
- `pnpm smoke:desktop`

## 十一、评审清单

- 改动是否能对应到正确层级与目录
- 是否通过公共入口而不是深层导入
- 是否引入新的共享契约而未落到 `packages/contracts`
- 是否需要同步更新对应规范文档
- 是否补齐了必要测试与自动化门禁

## 十二、常见反模式

- 先写功能，等快合并了再补文档
- 为了图快，在 renderer 里直接调系统能力
- 在 `utils/` 或 `services/` 里堆积跨层逻辑
- 新增一个目录但不写职责说明
- CI 只剩构建，缺少 lint、边界检查和 smoke test
