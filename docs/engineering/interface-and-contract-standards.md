# 接口与契约规范

## 一、适用范围

适用于：

- REST API
- OpenAPI 文档
- Electron IPC
- 领域事件 `ExecutionEvent`
- 任务状态 `TaskSession`
- 公共错误模型

## 二、必须遵守的规则

### 1. 单一事实源

- 对外 API 契约以 OpenAPI 为准
- 本地桌面 IPC 契约以 `@mango/contracts` 为准
- 领域事件与状态机契约以 `@mango/core` 为准

### 2. 显式 DTO

- 请求 DTO、响应 DTO、错误 DTO 必须显式命名
- 禁止在调用处临时拼匿名对象当成共享契约

### 3. 错误模型统一

- 错误必须至少包含 `code`、`message`、`retryable`
- 高风险失败建议补充 `suggestion`
- REST、IPC、本地日志错误需要可互相映射

### 4. 命名规则

- channel / endpoint 名称必须稳定
- 字段命名保持语义一致，避免同义词并存
- 事件类型采用显式字符串，如 `summary.ready`

## 三、REST 契约规则

- 统一使用资源名或动作名的清晰路径
- 分页结果使用统一 envelope
- 写操作预留幂等键扩展位
- 版本变更优先新增字段，不随意重命名已稳定字段

## 四、IPC 契约规则

- channel 名称集中定义
- renderer 只消费 preload 暴露的 `DesktopApi`
- IPC 负载只传输可序列化数据
- 不通过 IPC 传递函数或运行时实例

## 五、领域事件规则

- `ExecutionEvent` 字段在 UI、日志、持久化中必须一致
- 新事件类型加入前必须说明消费者是谁
- 文件变更、工具调用、终态总结优先独立事件类型

## 六、推荐做法

- 把 contracts 当作共享协作面，而不是临时类型仓库
- 契约改动先改文档，再改类型，再改消费方
- 用测试验证 channel / endpoint / DTO 的稳定性
- 路径、参数、错误码与数据库字段命名统一参考 `api-and-database-naming-standards.md`

## 七、禁止事项

- 在应用内部再复制一份公共接口定义
- 不改文档就修改共享 DTO 字段名
- 前端手写“猜测版”接口结构
- IPC 名称散落在多个文件里硬编码

## 八、代码组织示例

```text
packages/contracts/src/
  desktop.ts
  http.ts
  index.ts
```

## 九、测试要求

- 共享 contracts 至少有一组稳定性测试
- 新增事件类型需要覆盖消费路径
- API 字段改动要回归至少一个前端或桌面消费方

## 十、评审清单

- 契约是否有唯一来源
- 字段是否命名一致
- 错误模型是否完整
- 是否同步更新文档和测试
- 是否避免深层导入和复制定义

## 十一、常见反模式

- controller 临时加一个字段，但 contracts 没更新
- preload 和 renderer 各写一份 API 类型
- OpenAPI 与真实返回结构慢慢漂移
- 事件结构对日志、界面、持久化各不相同
