# OpenAPI Spec 模板

推荐用途：

- 新增资源域接口
- 新增分页接口
- 统一错误响应与示例

目录建议：

```text
packages/contracts/openapi/
  openapi.yaml
  paths/
  components/
```

要求：

- 入口文件统一命名为 `openapi.yaml`
- 版本固定为 Mango 当前批准的 OpenAPI 基线
- 每个 operation 都要有 `operationId`、`summary`、`responses`
- 成功响应至少补一个 example
