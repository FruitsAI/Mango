# Renderer Feature 模板

推荐结构：

```text
features/<feature-name>/
  <FeatureName>.tsx
  use<FeatureName>.ts
  __docs__.md
```

要求：

- 只承载一个前端业务能力闭环
- 系统能力调用统一走 `src/renderer/src/lib/desktopApi.ts`
- 至少补一条行为测试
