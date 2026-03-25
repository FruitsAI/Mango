# 本地桌面后端开发规范

## 一、适用范围

适用于 Electron 主进程、preload、安全桥、IPC、本地持久化、权限协调与桌面端系统能力调用。

## 二、标准目录结构

```text
src/
  main/
    app/
    ipc/
    services/
    persistence/
    security/
    adapters/
  preload/
    api/
  renderer/
```

## 三、必须遵守的规则

### 1. 主进程 `main/`

- 是唯一的系统能力协调中心
- 负责窗口生命周期、权限判断、任务编排、日志出流、本地持久化
- 不把展示逻辑写回主进程

### 2. `main/app/`

- 只放桌面应用启动、装配、生命周期注册
- 不直接写复杂业务规则

### 3. `main/ipc/`

- 只放 IPC channel 注册与请求分发
- 所有 channel 名称必须来自共享 contracts
- 请求、响应、错误必须类型化

### 4. `main/services/`

- 放主进程业务编排服务
- 可以调 adapters、core、persistence，但不直接操作 DOM 或 UI 组件

### 5. `main/persistence/`

- 放本地状态读写、迁移、索引、恢复逻辑
- 不允许在业务服务里随手直写文件

### 6. `preload/api/`

- 只暴露安全桥 API
- 不写业务编排、不做持久化、不做复杂状态缓存

## 四、命名补充规则

- 主进程服务文件使用 `camelCase.ts`
- 注册器命名统一为 `registerXxxIpcHandlers`
- Store / Repository 命名统一表达存储职责
- 权限、安全、策略对象统一优先使用 `XxxPolicy`
- IPC channel 统一使用 `mango:<domain>-<action>`

## 五、IPC 规则

- IPC 名称统一放入 `@mango/contracts`
- renderer 只能通过 preload 暴露的 API 间接访问主进程
- 高风险能力必须在主进程侧再次校验，不能只靠前端按钮文案
- IPC 错误必须能映射到统一错误码与下一步建议

## 六、权限与安全规则

- 文件系统、Shell、网络、浏览器能力都视为受控能力
- 执行前要根据 `PermissionPolicy` 给出显式决定
- 主进程保存权限结果与执行事件，保证后续可复盘
- preload 默认开启 `contextIsolation`，禁止 `nodeIntegration`

## 七、状态与日志规则

- 执行事件统一沉淀为 `ExecutionEvent`
- 任务状态流转只允许通过 `TaskSession` 的显式转换
- 主进程是日志、执行事件和恢复信息的唯一事实源

## 八、推荐做法

- 用 `main/app` 负责装配，用 `services` 负责业务
- 用 `ipc/register*.ts` 文件集中管理 channel 注册
- 用 `preload/api/*.ts` 暴露精简 API
- 用持久化层收口本地文件与未来 SQLite 迁移点
- 对外暴露函数和复杂流程优先补充意图型注释

## 九、禁止事项

- renderer 直接调 `ipcRenderer`
- preload 里写业务编排
- 主进程里直接维护 UI 状态
- 在多个位置各自维护一套日志和错误模型
- 用含糊名称如 `manager.ts`、`helper.ts` 承载关键编排

## 十、代码组织示例

```text
src/main/app/bootstrapDesktopApp.ts
src/main/ipc/registerDesktopIpcHandlers.ts
src/main/services/desktopController.ts
src/main/persistence/fileDesktopStore.ts
src/preload/api/desktopApi.ts
```

## 十一、测试要求

- IPC 改动至少覆盖一个主进程路径测试或契约测试
- 权限策略变更必须验证允许与拒绝两条路径
- 本地持久化改动必须验证读写与空状态恢复

## 十二、评审清单

- 主进程、preload、renderer 是否各司其职
- IPC 名称是否来自共享 contracts
- 是否存在绕过权限策略的系统能力调用
- 状态与日志是否仍由主进程统一出流
- 错误是否有统一映射与可恢复建议
- 文件命名是否真实表达职责

## 十三、常见反模式

- 为了图省事在 renderer 里直接调 Electron
- preload 变成第二个 controller
- 主进程里既管窗口又写视图状态又拼文案
- 每个功能自己保存一份执行日志
