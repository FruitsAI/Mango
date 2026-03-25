# 前端开发规范

## 一、适用范围

适用于：

- `apps/desktop/src/renderer`
- 未来 `apps/web`
- 共享 UI 组件的使用与接入方式

## 二、标准目录结构

```text
src/
  app/
  pages/
  features/
  components/
  hooks/
  lib/
  styles/
  test/
```

## 三、必须遵守的规则

### 1. `app/`

- 只负责入口装配、provider、页面壳层、全局启动逻辑
- 不直接承载具体业务实现细节

### 2. `pages/`

- 只负责页面级编排
- 不承载跨页面复用的业务逻辑

### 3. `features/`

- 一个 feature 对应一个用户能力闭环
- 例如任务创建、计划预览、批准执行、结果回顾
- feature 内可以包含本 feature 的局部组件与状态

### 4. `components/`

- 只放跨 feature 复用的展示组件
- 不直接耦合任务状态机、Agent 适配器或系统权限

### 5. `hooks/`

- 只封装渲染层状态复用
- 不把整条业务流程塞进一个通用 hook

### 6. `lib/`

- 只放渲染层基础能力适配，如 `desktopApi`
- 通过这里统一接入 preload 暴露的安全 API

### 7. `styles/`

- 统一放全局样式与 token 映射
- 不允许随处散落魔法值和重复色值

### 8. `test/`

- 页面和 feature 的 UI 测试统一放这里
- 测试优先描述用户行为，而不是实现细节

## 四、命名补充规则

- 组件文件使用 `PascalCase.tsx`
- feature 目录使用 `kebab-case`
- hooks 使用 `useXxx.ts`
- 事件处理函数统一使用 `handleXxx`
- 布尔状态统一优先使用 `is`、`has`、`can`、`should`

## 五、组件与状态规则

- 组件优先保持纯函数与显式 props
- 副作用只能在边界层触发
- 异步流程应集中在 `app/` 或 feature 边界，而不是散落在多个展示组件中
- 复杂状态优先选择显式事件驱动，不堆积隐式局部状态

## 六、样式与设计 token 规则

- 颜色、字体、圆角、间距应优先引用共享 token
- 不允许在多个文件重复写品牌色
- 响应式布局必须同时考虑桌面宽屏与较窄窗口
- 视觉风格可以有品牌特征，但结构必须可维护

## 七、可访问性与交互

- 所有按钮、输入框、弹窗必须有明确语义
- 禁止仅靠颜色表达状态
- 交互控件要支持键盘访问
- 空状态、错误态、加载态必须有清晰文案

## 八、推荐做法

- 用 feature 目录表达业务边界
- 用 `lib/desktopApi.ts` 隔离 Electron 通信
- 在组件测试中验证“用户看见什么、能做什么”
- 把示例状态放进 `app/fixtures.ts` 或测试夹具
- 注释只解释边界、意图和例外，不复述 JSX 结构

## 九、禁止事项

- renderer 直接 `import 'electron'`
- renderer 直接 `import 'node:*'`
- 所有逻辑都堆在 `App.tsx`
- 只写 happy path，不写空状态和失败态
- 组件文件名和导出名不一致

## 十、代码组织示例

```text
src/renderer/src/
  app/App.tsx
  features/task-workbench/TaskWorkbench.tsx
  lib/desktopApi.ts
  styles/index.css
  test/App.test.tsx
```

## 十一、测试要求

- 每个核心 feature 至少有一个行为测试
- UI 改动必须覆盖加载态、正常态、异常态中的至少两类
- 关键交互改动后必须运行 renderer 测试与桌面 smoke test

## 十二、评审清单

- 页面、feature、component 的职责是否清楚
- 是否存在直接系统能力调用
- 状态是否集中在合适边界
- 测试是否验证用户行为而不是内部实现
- 样式 token 是否重复定义
- 命名是否和组件 / feature / hook 的角色一致

## 十三、常见反模式

- `components/` 里塞满强业务组件
- `hooks/` 变成第二个服务层
- `App.tsx` 既是页面又是 feature 又是数据层
- 新页面复制旧页面整份代码而不是抽 feature
