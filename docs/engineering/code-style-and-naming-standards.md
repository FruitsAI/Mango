# 代码风格、命名、格式化与注释规范

## 一、适用范围

适用于 Mango 仓库中的：

- TypeScript / TSX / MTS / CTS 源码
- Electron `main`、`preload`、`renderer`
- 共享包、工程脚本、测试代码
- SQL、YAML、JSON、Markdown 中的代码片段

## 二、规范目标

这份规范要解决四个最常见的问题：

1. 同一个仓库里出现多套风格，阅读成本越来越高
2. 同一类对象在不同层被叫成不同名字，后续难以维护
3. 注释越来越多，但并没有解释真正重要的信息
4. 代码格式依赖个人 IDE，换台机器就开始漂移

## 三、格式化基线

### 1. 文件级基础规则

- 所有文本文件统一使用 `UTF-8`
- 所有换行统一使用 `LF`
- 所有缩进统一使用 `2` 个空格
- 文件末尾必须保留一个换行
- 行尾不得保留多余空格
- 代码文件默认不使用 BOM

### 2. Prettier 基线

仓库统一采用以下格式化基线：

- `semi: false`
- `singleQuote: true`
- `trailingComma: none`
- `printWidth: 100`
- `tabWidth: 2`
- `useTabs: false`
- `arrowParens: always`
- `bracketSpacing: true`
- `endOfLine: lf`

### 3. 命令入口

- 自动格式化：`pnpm format`
- 格式检查：`pnpm format:check`

### 4. 推荐做法

- 提交前先运行 `pnpm format:check`
- 大批量改动后再运行 `pnpm lint`
- Markdown 只做必要换行，不为了“视觉对齐”手工补空格
- 配置文件与脚本文件也纳入同一套格式化体系

### 5. 禁止事项

- 混用 `CRLF` 和 `LF`
- 在同一文件中混用 `Tab` 和空格
- 依赖个人编辑器的保存格式化，而不提供仓库级规则
- 用手工对齐冒号、赋值号、对象键来“美化”代码

## 四、命名规范

### 1. 总原则

- 先定语义，再定格式
- 名字要表达职责，不表达实现情绪
- 同一语义在同一层只允许一个主名字
- 避免把临时含义、历史背景、作者习惯写进正式命名

### 2. 目录命名

- 目录统一使用 `kebab-case`
- feature 目录使用业务能力命名
- 禁止使用没有边界的泛化目录名

正确示例：

- `task-workbench`
- `workspace-history`
- `release-checklist`
- `permission-review`

错误示例：

- `TaskWorkbench`
- `task_workbench`
- `common-stuff`
- `misc`

### 3. 文件命名矩阵

| 类型               | 规则                           | 示例                                                |
| ------------------ | ------------------------------ | --------------------------------------------------- |
| React 组件         | `PascalCase.tsx`               | `TaskWorkbench.tsx`                                 |
| Hook               | `useXxx.ts`                    | `useTaskDraft.ts`                                   |
| 服务/控制器/注册器 | `camelCase.ts`                 | `desktopController.ts`                              |
| Repository / Store | `camelCase.ts`                 | `fileDesktopStore.ts`                               |
| 状态机/领域模型    | `camelCase.ts`                 | `taskSessionMachine.ts`                             |
| 测试文件           | `*.test.ts(x)`                 | `TaskWorkbench.test.tsx`                            |
| Barrel             | `index.ts`                     | `index.ts`                                          |
| SQL migration      | `0001_create_xxx.sql`          | `0003_add_release_channel_to_settings.sql`          |
| Rollback SQL       | `0001_create_xxx.rollback.sql` | `0003_add_release_channel_to_settings.rollback.sql` |

### 4. 类型、接口、类、枚举命名

- 类型、接口、类、枚举统一使用 `PascalCase`
- 接口禁止使用 `I` 前缀
- DTO 使用职责后缀表达边界
- 枚举名表达集合语义，枚举值表达稳定 wire value

推荐后缀：

- `Request`
- `Response`
- `Input`
- `Result`
- `Error`
- `State`
- `Context`
- `Policy`
- `Repository`
- `Store`

正确示例：

- `TaskSessionState`
- `WorkspaceContext`
- `PermissionPolicy`
- `ApproveTaskSessionRequest`

错误示例：

- `ITaskSessionState`
- `task_session_state`
- `TaskSessionDTOTypeThing`

### 5. 变量、函数、方法命名

- 普通变量、函数、方法统一使用 `camelCase`
- 布尔值优先使用 `is`、`has`、`can`、`should`
- 事件处理函数统一使用 `handleXxx`
- 创建函数优先使用 `createXxx`
- 读取函数优先使用 `getXxx` 或 `readXxx`
- 执行函数优先使用 `runXxx` 或 `executeXxx`
- 注册函数优先使用 `registerXxx`
- 解析函数优先使用 `parseXxx` 或 `resolveXxx`

正确示例：

- `handleApproveAndRun`
- `createDesktopApi`
- `getLatestTaskSession`
- `readGitBranch`
- `runAdapterCommand`
- `isPermissionGranted`

### 6. 常量命名

- 模块内普通常量优先使用 `camelCase`
- 只有下列场景允许 `UPPER_SNAKE_CASE`

允许使用 `UPPER_SNAKE_CASE` 的场景：

- 环境变量名
- 稳定协议常量集合
- 构建期注入常量
- 错误码常量

正确示例：

- `statusCopy`
- `permissionLabels`
- `MANGO_DESKTOP_CHANNELS`
- `MAIN_WINDOW_VITE_NAME`

### 7. 泛型命名

- 泛型必须有语义，不使用无意义单字母泛滥
- 简单场景可用单字母，但要有限且可读
- 优先使用 `TData`、`TItem`、`TResult`、`TError`

正确示例：

- `TaskResult<TData>`
- `mapItems<TItem, TResult>()`

错误示例：

- `function map<A, B, C>() {}`
- `type Box<T, U, V, W> = ...`

### 8. 缩写规则

- 除业界稳定缩写外，默认不用自造缩写
- `API`、`URL`、`IPC`、`CLI`、`SQL`、`JSON` 可以使用
- 禁止使用不透明缩写

不推荐示例：

- `cfg`
- `ctx`
- `mgr`
- `tmp`
- `ret`
- `obj`

### 9. IPC、事件、环境变量命名

- IPC channel 使用 `mango:<domain>-<action>`
- 领域事件使用 `<domain>.<action>`
- 环境变量统一使用 `MANGO_*`

正确示例：

- `mango:generate-plan`
- `mango:task-session-cancel`
- `summary.ready`
- `permission.denied`
- `MANGO_LOG_LEVEL`

## 五、结构与导入规范

### 1. 导入顺序

推荐顺序：

1. Node 内建模块
2. 第三方依赖
3. `@mango/*` workspace 包
4. 相对路径模块

同组内按字母序稳定排列。

### 2. 类型导入

- 只用于类型的位置必须使用 `import type`
- 公共类型优先从包的公共入口导入

### 3. 导出规则

- 公共包统一通过 `exports` 与 `index.ts` 暴露公共入口
- 禁止跨包深层导入 `src/*`
- `renderer`、`api`、`worker` 只能依赖 `@mango/*` 公共出口

## 六、注释规范

### 1. 注释目标

注释应该解释以下信息，而不是把代码翻译成自然语言：

- 为什么这样做
- 这里的边界条件是什么
- 这里在规避什么风险
- 为什么不采用更直观的另一种写法
- 哪个外部约束决定了当前实现

### 2. 应该写注释的场景

- 复杂状态机流转
- 权限边界与安全判断
- Electron / 平台差异绕路实现
- 易误解的正则、序列化、路径拼接、兼容性逻辑
- 临时保留但有清理计划的代码
- 公共 API、共享契约、跨包暴露入口

### 3. 不应该写注释的场景

- “给变量赋值”
- “调用这个函数”
- “遍历数组”
- “更新状态”
- 任何读代码就能直接看出来的事情

### 4. 注释风格

- 单行注释统一使用 `// `，斜杠后必须有一个空格
- 多行说明可使用连续 `//`，优先不用大块块注释
- JSDoc 只用于公共函数、公共类型、复杂模块边界
- 注释默认与代码同语言，仓库级说明优先中文，公开 API 可按需要补英文

推荐示例：

```ts
// Electron preload 只暴露白名单 API，避免 renderer 拿到任意 Node 能力。
contextBridge.exposeInMainWorld('mango', desktopApi)
```

不推荐示例：

```ts
// Expose API
contextBridge.exposeInMainWorld('mango', desktopApi)
```

### 5. TODO / FIXME 规则

- 禁止裸 `TODO`
- 必须带范围、原因或目标版本
- 能写 issue 编号时优先写 issue 编号

推荐格式：

- `TODO(mango-v1): replace file store with SQLite`
- `FIXME(release): handle updater disabled state on Linux`
- `TODO(#123): remove mock adapter after Claude Code CLI rollout`

### 6. TypeScript 指令注释

- `@ts-expect-error` 必须附带原因说明
- 优先修正类型问题，而不是长期依赖 `@ts-ignore`
- 非特殊兼容场景不允许新增 `@ts-ignore`

正确示例：

```ts
// @ts-expect-error Electron preload injects this API at runtime.
window.mango.desktop.getState()
```

错误示例：

```ts
// @ts-ignore
window.mango.desktop.getState()
```

## 七、TypeScript 编写约定

### 1. 基本规则

- 保持 `strict` 打开
- 优先使用显式返回类型定义公共函数边界
- 优先用判别联合表达状态，而不是多个松散布尔值
- 禁止把 `any` 当默认逃生口

### 2. `type` 与 `interface`

- 对外部可扩展对象结构优先使用 `interface`
- 联合类型、映射类型、工具类型组合优先使用 `type`
- 同一类对象不要在同一模块中混用 `interface` 与 `type` 表达同一职责

### 3. `enum` 使用

- 默认优先使用字符串字面量联合
- 只有在必须获得枚举对象语义时才使用 `enum`

### 4. 魔法值

- 重复出现的字符串、阈值、状态文案必须提取
- 单次使用且语义清晰的数字可以保留

推荐示例：

```ts
const maxRecentSessions = 20
const retryableErrorCodes = new Set(['NETWORK_UNAVAILABLE', 'PROCESS_TIMEOUT'])
```

## 八、前端 / 本地桌面后端 / 云后端命名补充

### 1. 前端

- 页面组件：`PascalCase`
- feature 目录：`kebab-case`
- 交互函数：`handleXxx`
- Hook：`useXxx`
- UI 纯展示组件避免带业务动词

### 2. 本地桌面后端

- 服务：`xxxService` 或明确业务名
- IPC 注册器：`registerXxxIpcHandlers`
- 持久化：`xxxStore` / `xxxRepository`
- 安全策略：`xxxPolicy`
- Electron 启动：`bootstrapXxx`

### 3. 云后端

- 用例：`xxxUseCase`
- 控制器 / Handler：`xxxHandler`
- 仓储：`xxxRepository`
- DTO：`XxxRequest`、`XxxResponse`
- Queue Job：`xxxJob`

## 九、自动化落地

当前仓库已经或应当通过自动化约束这些规则：

- `pnpm format:check` 约束统一格式
- ESLint Flat Config 约束命名、导入与注释风格
- `import type` 强制与深层导入限制
- `@ts-expect-error` 说明要求
- `.editorconfig` 统一缩进、编码与换行
- PR 标题与提交信息统一使用 Conventional Commits 风格

## 十、评审清单

- 文件名和目录名是否符合约定
- 类型、函数、组件命名是否可读且一致
- 是否把协议常量和普通变量都混成全大写
- 是否出现 `misc`、`utils2`、`temp` 之类逃避命名
- 注释是否解释了意图，而不是复述代码
- 是否存在裸 `TODO`、无说明 `@ts-expect-error` 或深层导入

## 十一、常见反模式

- 为了省事把文件命名成 `index2.ts`、`helper.ts`、`misc.ts`
- 所有常量都写成 `UPPER_SNAKE_CASE`
- 组件、hooks、服务文件命名风格混在一起
- 注释比代码还啰嗦，但没有提供额外信息
- 同一语义在 UI、IPC、数据库三层用了三个不同名字
