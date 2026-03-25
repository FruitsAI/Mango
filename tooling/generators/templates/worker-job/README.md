# Worker Job 模板

推荐结构：

```text
src/modules/<module-name>/application/
src/modules/<module-name>/infrastructure/
```

要求：

- 输入输出契约显式定义
- 失败、重试、超时路径要可观测
- 禁止在 worker 中临时定义另一套共享 DTO
