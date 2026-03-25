# API Module 模板

推荐结构：

```text
src/modules/<module-name>/
  presentation/
  application/
  domain/
  infrastructure/
```

要求：

- REST DTO 走 `@mango/contracts`
- presentation 不直接访问数据库
- 至少补 application 层测试与契约说明
