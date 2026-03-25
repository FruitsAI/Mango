# 模块职责与契约

## 一、文档目的

后续如果不把模块边界讲清楚，项目很容易出现“所有逻辑都堆在一个地方”的问题。这份文档用于约束 Mango 的模块职责与接口边界。

## 二、核心模块

### 模块 1：Desktop Shell

职责：

- 管理窗口生命周期
- 承载主进程与渲染层
- 作为系统能力入口

不负责：

- 定义任务状态机规则
- 写死 adapter 业务逻辑

### 模块 2：Core Domain

职责：

- 定义任务会话生命周期
- 定义权限和风险等级
- 定义执行事件与 review 结构

不负责：

- 直接访问 Electron API
- 直接依赖 UI 框架

### 模块 3：Contracts

职责：

- 统一 IPC DTO
- 统一未来 REST DTO
- 统一错误模型与 channel 名称

不负责：

- 维护运行时状态
- 编排业务逻辑

### 模块 4：Adapters

职责：

- 适配具体 Agent/CLI
- 对外提供统一能力：检测、计划、执行

不负责：

- 维护全局桌面状态
- 直接操作界面

### 模块 5：UI Assets

职责：

- 维护 design token
- 提供未来跨桌面 / Web 复用的 UI 资产

不负责：

- 编排产品业务流程
- 定义主进程系统能力

## 三、关键契约

### 1. AgentAdapter

必须至少提供：

- `detectAvailability`
- `generatePlan`
- `runApprovedPlan`

### 2. TaskSession

必须遵守固定状态流转：

- `draft`
- `planned`
- `approved`
- `running`
- `succeeded | failed | cancelled`

不允许跳过关键阶段。

### 3. ExecutionEvent

事件必须统一格式，至少包含：

- `id`
- `type`
- `level`
- `message`
- `createdAt`

### 4. DesktopApi / IPC Channels

必须遵守：

- channel 名称集中放在 `@mango/contracts`
- renderer 只消费 preload 暴露的 `DesktopApi`
- 不允许在应用内部再复制一份共享接口类型

## 四、契约设计原则

- 先稳定结构，再扩展字段
- 公共契约一旦被 UI 和持久化共同依赖，就不要轻易随意改名
- 如果要改公共契约，必须同步更新文档、测试、类型与消费方
- workspace 包只能通过公共 `exports` 被消费

## 五、未来扩展原则

如果未来增加新模块，必须明确：

- 它属于哪一层
- 它依赖谁
- 谁依赖它
- 它暴露的公共接口是什么

没有这四项，不应直接加入仓库。
