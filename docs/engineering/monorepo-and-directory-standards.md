# Monorepo 与目录结构规范

## 一、适用范围

本规范适用于整个 Mango 仓库，目的是统一“代码应该放哪、能依赖谁、哪些目录只允许放输出物”。

## 二、目标目录结构

```text
apps/
  desktop/
  web/
  api/
  worker/

packages/
  core/
  adapters/
  contracts/
  ui/
  config-eslint/
  config-typescript/
  config-vitest/
  config-playwright/

tooling/
  scripts/
  generators/

tests/
  e2e/
  contracts/
  fixtures/

infra/
  docker/
  github/
  release/

docs/
```

## 三、必须遵守的规则

### 1. `apps/*`

- 只放可运行、可部署、可发布的应用入口
- 应用级路由、启动逻辑、运行时装配放这里
- 不允许把共享领域模型复制进 `apps/*`

### 2. `packages/*`

- 只放跨应用复用的库、契约、配置
- 每个包必须有清晰职责与 `package.json#exports`
- 禁止应用直接导入其他包的 `src/*`

### 3. `tooling/*`

- 只放脚本、模板、生成器、代码改造工具
- 不放产品运行时逻辑

### 4. `tests/*`

- 只放跨应用、跨包的测试夹具与验证用例
- 单包单元测试优先放在各自 package / app 内

### 5. `infra/*`

- 只放部署、镜像、发布与平台集成资料
- 不放业务实现

### 6. `docs/*`

- 只放正式文档
- 不夹带脚本、fixture、编译产物

## 四、源码与构建物边界

以下内容一律视为构建输出，不进入源码边界：

- `dist/`
- `out/`
- `.turbo/`
- `coverage/`
- `playwright-report/`
- `test-results/`
- `src/` 内由编译生成的 `.js`、`.d.ts`

规则固定为：

- 构建物默认不纳入版本控制
- 任何包的 `src/` 都只允许放源码
- 清理脚本必须能一次性删除主要生成物

## 五、命名规范

- workspace 包统一使用 `@mango/*`
- 目录名统一小写短横线或语义短词
- feature 名称描述业务能力，不描述技术实现
- 不使用含糊目录名，如 `misc`、`temp`、`new`、`common2`

## 六、依赖边界

- `apps/*` 可以依赖 `packages/*`
- `packages/*` 之间只能通过公共导出互相依赖
- `packages/ui` 不依赖 `apps/*`
- `packages/contracts` 可以依赖 `packages/core` 中稳定领域类型
- `packages/adapters` 不依赖 `packages/ui`

## 七、推荐做法

- 用共享配置包统一工具配置
- 用 `tooling/generators/templates` 放新模块模板
- 在空目录中放简短 `README.md` 说明职责
- 用根脚本统一触发 `lint/test/typecheck/build`

## 八、禁止事项

- 把应用页面写进 `packages/*`
- 把共享契约写回 `apps/desktop/src/shared`
- 在仓库根目录直接新增散落脚本
- 把未来云后端随手塞进 `apps/desktop`

## 九、目录示例

### 桌面应用

```text
apps/desktop/src/
  main/
  preload/
  renderer/
```

### 共享库

```text
packages/contracts/
  src/
  tests/
```

### 脚本与模板

```text
tooling/scripts/
tooling/generators/templates/
```

## 十、测试要求

- 目录级重构必须通过 `pnpm architecture-check`
- 新增 workspace 包必须能通过 `pnpm typecheck`
- 调整构建输出位置后必须通过 `pnpm build` 与 `pnpm smoke:desktop`

## 十一、评审清单

- 新目录是否有清晰职责
- 是否引入了新的深层导入
- 是否把共享内容沉淀到了正确的 package
- 是否把生成物排除在源码边界之外
- 是否同步更新了 README 或目录说明

## 十二、常见反模式

- 因为“先能跑”就直接在应用目录里复制 shared types
- 觉得目录太少，于是所有东西继续堆在 `src/`
- 工具脚本散落在根目录和个人习惯目录
- 为了临时调试把 `dist` 文件一起提交评审
