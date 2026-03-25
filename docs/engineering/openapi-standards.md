# OpenAPI 契约治理与模板规范

## 一、适用范围

适用于 Mango 未来所有对外 REST API 的：

- OpenAPI 文档主文件与拆分文件
- DTO schema、错误模型、分页模型
- 代码生成类型
- 契约测试与接口评审

## 二、基线决策

### 1. 官方基线

截至 `2026-03-24`，OpenAPI 官方站点的最新规范版本为 `3.2.0`。

### 2. Mango v1 工程决策

Mango v1 当前统一标准化到 `OpenAPI 3.1.1`，原因是：

- 现阶段 TypeScript 生态中的生成器、校验器、Mock 工具对 `3.1.x` 兼容性更稳
- v1 目标是先稳定契约治理链路，而不是追逐尚未全面验证的最新小版本特性

这是一条工程兼容性决策，不是对官方最新版本的否认。后续若工具链验证通过，可单独升级到 `3.2.x`。

## 三、目录结构规范

推荐将 OpenAPI 单一事实源放在 `packages/contracts`：

```text
packages/contracts/
  openapi/
    openapi.yaml
    paths/
      task-sessions.yaml
      workspaces.yaml
    components/
      schemas/
        task-session.yaml
        execution-event.yaml
      parameters/
      responses/
      examples/
```

### 目录职责

- `openapi/openapi.yaml`：唯一入口文件
- `paths/`：按资源域拆分的 path item
- `components/schemas/`：DTO、错误模型、分页模型
- `components/parameters/`：公共路径参数、查询参数
- `components/responses/`：公共响应壳与错误响应
- `components/examples/`：请求与响应示例

## 四、必须遵守的规则

### 1. 单一事实源

- OpenAPI 文档是后端接口的单一事实源
- 前端、桌面端客户端类型必须从契约生成，不允许长期手写漂移版本
- 同一接口的字段定义不得在多个文件各写一份

### 2. 文档入口规则

- 入口文件统一命名为 `openapi.yaml`
- 每个 operation 必须唯一 `operationId`
- 每个 operation 必须声明 `tags`、`summary`、`responses`

### 3. 路径规则

- 路径使用 `kebab-case`
- 资源名优先使用复数名词
- 动作型端点仅用于非 CRUD 动作

### 4. Schema 规则

- Schema 名统一使用 `PascalCase`
- 请求体与响应体使用稳定 DTO 名
- 错误响应复用公共错误 schema
- `nullable`、`required`、`enum`、`format` 必须显式表达，不依赖实现猜测

### 5. 示例规则

- 每个公开 operation 必须至少提供一个成功示例
- 高风险或易误解接口必须补失败示例
- 示例字段名与实际 schema 必须同步

## 五、资源设计约定

### 1. 分页

列表接口统一优先使用：

- `page`
- `pageSize`
- `total`
- `items`

如果未来采用 cursor 分页，必须在同一资源域内保持一致，不可 page/cursor 混用。

### 2. 过滤与排序

- 过滤参数使用明确业务语义命名
- 排序字段统一使用 `sortBy`
- 排序方向统一使用 `sortOrder`

### 3. 幂等性

对“创建但可能重试”的接口，优先预留幂等键策略，例如：

- `Idempotency-Key` header

如果暂不实现，也要在契约评审中说明原因。

## 六、错误模型规范

所有错误响应统一映射到公共错误模型，至少包含：

- `code`
- `message`
- `retryable`
- `requestId`

推荐错误响应 schema：

```yaml
ErrorResponse:
  type: object
  required:
    - code
    - message
    - retryable
    - requestId
  properties:
    code:
      type: string
    message:
      type: string
    retryable:
      type: boolean
    requestId:
      type: string
```

## 七、生成与消费规则

- 生成代码属于派生物，不直接手改
- 生成目录与手写目录必须分离
- 任何手写扩展逻辑必须包裹在生成物之外
- 契约变更后，先更新 OpenAPI，再生成类型，再修消费方

## 八、测试要求

### 1. 契约测试

- 每个模块至少有一组契约测试验证状态码与响应结构
- 错误响应字段必须被测试覆盖

### 2. 示例校验

- 文档中的示例应该能通过 schema 校验
- 示例与实现不一致时，以契约修正为优先，不允许长期漂移

## 九、推荐做法

- 按资源域拆 `paths/*`，按模型职责拆 `components/*`
- 先定错误模型、分页模型、身份与权限模型，再开始扩具体资源
- 契约评审时同时看字段名、状态码、错误码、幂等性与兼容性

## 十、禁止事项

- 把 OpenAPI 仅当作发布前补的文档
- 前端已经依赖的字段不进契约
- 一个 operation 没有 `operationId`
- 把多个资源塞进一个巨大 YAML 文件却没有边界
- 修改响应结构却不更新示例与消费方

## 十一、模板与示例

统一模板目录：

```text
tooling/generators/templates/openapi-spec/
  README.md
  openapi.template.yaml
```

## 十二、评审清单

- 是否遵守单一事实源
- 路径、字段、schema 命名是否统一
- 每个 operation 是否具备 `operationId`、`summary`、`responses`
- 是否提供成功示例与必要失败示例
- 是否说明分页、错误、幂等性策略

## 十三、常见反模式

- OpenAPI 只是“抄后端代码”的说明文档
- 客户端手写 DTO，契约文件长期不更新
- 一个接口成功响应写了，错误响应全靠脑补
- `paths` 与 `components` 没边界，最后没人敢改
