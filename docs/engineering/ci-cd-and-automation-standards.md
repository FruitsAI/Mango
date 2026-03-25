# CI/CD 与研发自动化规范

## 一、适用范围

适用于本地命令入口、workspace 任务编排、GitHub Actions、发布检查与自动化门禁。

## 二、工具链基线

- 包管理：`pnpm`
- 任务编排：`turbo`
- 类型系统：TypeScript strict
- 代码检查：ESLint Flat Config
- 格式检查：Prettier
- 测试：Vitest
- 桌面构建：Electron Vite + electron-builder

## 三、必须遵守的规则

- 所有团队成员使用同一套根命令入口
- CI 与本地验证口径尽量一致
- 关键质量门禁不得只存在于个人 IDE
- 发布前必须有自动化 smoke check

## 四、默认流水线

推荐的 GitHub Actions 验证顺序：

1. Install
2. Format Check
3. Lint
4. Architecture Check
5. Typecheck
6. Unit / Component / Contract Tests
7. Build
8. Desktop Smoke

## 五、根命令规范

- `pnpm dev`
- `pnpm hooks:install`
- `pnpm lint`
- `pnpm format:check`
- `pnpm architecture-check`
- `pnpm prtitle:check -- "<title>"`
- `pnpm test`
- `pnpm typecheck`
- `pnpm build`
- `pnpm package`
- `pnpm verify`

## 六、推荐做法

- 用 `packages/config-*` 抽共享配置
- 用 `tooling/scripts/*` 放结构检查和 smoke 检查
- 用 `.githooks/*` 与安装脚本落地本地提交门禁
- 用 `turbo` 缓存多包构建与测试结果
- 用 CI 矩阵持续验证三端桌面兼容性
- 用独立工作流校验 PR 标题与协作元信息

## 七、禁止事项

- 应用有一套命令，包又各自一套没人知道的命令
- CI 不跑 lint 与边界检查
- PR 标题、PR 模板、提交信息完全没有自动化约束
- 发布说明、版本号、构建产物各自不一致
- 发布前临时手工改脚本且不回写仓库

## 八、测试与发布要求

- 合并前至少通过 `pnpm verify`
- 新成员克隆仓库后应执行 `pnpm install` 或手动执行 `pnpm hooks:install`
- 发布前必须验证安装包构建、产物完整性和更新说明
- 桌面构建链路变更要回归 `pnpm smoke:desktop`

## 九、评审清单

- 新增脚本是否纳入根命令体系
- CI 是否覆盖了相应质量门禁
- 配置是否沉淀到共享 config 包
- 是否引入新的手工步骤却没有自动化替代
- PR 模板、标题、提交信息是否能被自动检查

## 十、常见反模式

- 只会在某个人电脑上运行的脚本
- 每个包私有一套 lint/test/build 规则
- CI 与本地脚本名称不一致
- 发布当天才发现安装包路径或版本号对不上
- 规范写得很完整，但 PR 和提交阶段没有任何护栏
