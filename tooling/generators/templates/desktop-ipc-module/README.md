# Desktop IPC 模板

推荐结构：

```text
src/main/ipc/register<ModuleName>IpcHandlers.ts
src/main/services/<moduleName>Service.ts
src/preload/api/<moduleName>Api.ts
```

要求：

- channel 名称来自 `@mango/contracts`
- preload 只暴露类型化 API
- 主进程服务负责权限与错误映射
