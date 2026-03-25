# Hooks 目录说明

此目录保留给跨 feature 复用的渲染层 hooks。

- hooks 负责封装渲染层状态复用
- 系统能力调用必须继续走 `lib/desktopApi.ts`
- 业务流程编排不要堆到通用 hooks 中
