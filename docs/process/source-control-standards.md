# 分支与提交规范

## 一、适用范围

适用于 Mango 仓库中的：

- 分支命名
- 提交信息
- 合并前整理
- PR 标题与变更描述
- 与版本发布相关的分支协作

## 二、分支命名规范

### 1. 基本格式

统一使用：

```text
<type>/<topic>
```

其中：

- `type` 表示改动类型
- `topic` 表示这次改动的主要目标，使用 `kebab-case`

### 2. 允许的分支前缀

- `codex/`
- `feat/`
- `fix/`
- `docs/`
- `refactor/`
- `test/`
- `chore/`
- `ci/`
- `build/`
- `perf/`
- `hotfix/`
- `release/`

### 3. 推荐示例

- `codex/mango-standards`
- `feat/workspace-history`
- `fix/desktop-ipc-timeout`
- `docs/api-naming-rules`
- `refactor/task-session-store`
- `release/v0-2-0`

### 4. 禁止示例

- `feature/newFeature`
- `fix_bug`
- `mybranch`
- `feat/DesktopIPC`
- `docs/mango standards`

### 5. 分支命名规则

- topic 只用小写字母、数字和短横线
- topic 应表达目标，不表达个人习惯
- 一个分支只承载一个主目标
- 长期分支只允许 `main`、`develop`、`release/*`

## 三、提交信息规范

### 1. 基本格式

统一使用 Conventional Commits：

```text
<type>(<scope>): <summary>
```

scope 可选。

### 2. 允许的提交类型

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

### 3. 推荐示例

- `feat(desktop): add workspace bootstrap persistence`
- `fix(core): prevent invalid cancelled transition summary`
- `docs(engineering): define api and sqlite naming rules`
- `refactor(renderer): split app shell from task workbench`
- `ci(repo): add architecture and contract checks`

### 4. summary 规则

- 使用英文，简洁表达这次提交做了什么
- 建议使用祈使式短语
- 首字母小写更自然，除专有名词外不强制首字母大写
- 不以句号结尾
- 推荐不超过 `100` 个字符

### 5. scope 规则

scope 推荐使用下面这些语义域：

- `desktop`
- `renderer`
- `main`
- `preload`
- `core`
- `adapters`
- `contracts`
- `ui`
- `docs`
- `repo`
- `ci`
- `release`

### 6. body 与 footer 规则

建议在以下场景补 body：

- 有明显的行为变化
- 有兼容性影响
- 有迁移步骤
- 有安全或权限风险

Breaking change 必须显式写明：

```text
BREAKING CHANGE: <description>
```

## 四、提交拆分原则

- 一次提交只解决一个清晰问题
- 不要把重构、格式化、功能开发混在同一个提交里
- 文档更新与行为变更可以同提交，但必须强相关
- 机械性重排和真实行为变更优先拆开

## 五、PR 标题规范

- PR 标题建议沿用 Conventional Commits 格式
- PR 描述至少包含目标、范围、验证方式、风险
- 如果涉及公共契约变更，PR 描述必须列出消费面
- 详细要求参见 `pull-request-standards.md`

## 六、与发布分支的关系

- `main` 默认承载持续开发与 `nightly`
- `release/*` 用于承载 `beta / stable`
- `hotfix/*` 只用于紧急修复，且必须回流主线
- 版本通道与命名规则参见 `../launch/versioning-and-release-standards.md`

## 七、自动化落地

当前仓库已提供：

- 分支名称检查：`pnpm branch:check`
- PR 标题检查：`pnpm prtitle:check -- "<title>"`
- 最近提交信息检查：`pnpm commitlint:recent`
- Conventional Commits 配置：`commitlint.config.mjs`
- Git hooks 自动安装：`pnpm hooks:install`

## 八、推荐做法

- 开始开发前先跑 `pnpm branch:check`
- 合并前整理无意义提交，保证历史可读
- 提交信息写“为什么改了什么”，不要写“again / update / tmp”
- 使用 Draft PR 提前暴露边界与风险，不要等全部做完再一次性抛出

## 九、禁止事项

- `fix: fix bug`
- `update`
- `临时提交`
- `test`
- 一个提交里混入无关目录的大批量修改
- 在 release 分支上长期堆积未准备发布的功能

## 十、评审清单

- 分支名是否符合约定
- 提交信息是否可读且可检索
- scope 是否表达了改动边界
- 是否出现无意义 history 噪音
- 是否说明了 PR 与发布分支的关系

## 十一、常见反模式

- 用一个超长生命周期分支承载多个目标
- 用 `chore` 隐藏真实功能变更
- PR 标题和提交信息完全不对应
- 提交信息只写 “update files”
