# 云后端开发规范

## 一、适用范围

适用于未来的 `apps/api`、`apps/worker` 以及与之相关的模块、异步任务、存储访问、配置与可观测性设计。

## 二、标准目录结构

```text
src/
  app/
  modules/
    <module>/
      presentation/
      application/
      domain/
      infrastructure/
  shared/
```

## 三、必须遵守的规则

### 1. `presentation/`

- 只处理 HTTP / queue 输入输出
- 负责鉴权映射、DTO 解析、响应序列化
- 不写核心业务规则

### 2. `application/`

- 只处理用例编排、事务边界、任务调度
- 不直接暴露给传输层

### 3. `domain/`

- 只放核心规则、实体、值对象、领域服务
- 禁止依赖 HTTP、数据库、队列 SDK

### 4. `infrastructure/`

- 放数据库、缓存、第三方 API、对象存储、消息系统实现
- 只提供实现，不定义核心业务语义

## 四、配置与环境变量规则

- 配置必须在启动时校验
- 环境变量必须类型化，并有默认值策略或明确必填策略
- 生产敏感信息不得出现在日志和错误正文中

## 五、API 契约规则

- REST + OpenAPI 是唯一正式对外契约
- 客户端类型优先从契约生成，不手写漂移副本
- 错误码、分页、过滤、幂等字段必须在 contracts 中统一

## 六、Worker 规则

- worker 只处理后台任务，不承载同步 API 逻辑
- worker 输入输出必须有明确契约
- 长任务必须具备重试、超时和可观测性标记

## 七、推荐做法

- 按模块而不是按技术文件类型拆目录
- 把外部系统实现收敛到 `infrastructure/`
- 把公共错误与 DTO 收敛到 `@mango/contracts`
- API 与 worker 共用统一的配置与日志规范
- API 字段与数据库命名统一参考 `api-and-database-naming-standards.md`

## 八、禁止事项

- 全局 `services/`、`utils/` 无边界膨胀
- presentation 直接调用数据库
- domain 直接依赖第三方 SDK
- API 返回结构在控制器里临时拼装、没有契约定义

## 九、代码组织示例

```text
src/modules/tasks/
  presentation/
  application/
  domain/
  infrastructure/
```

## 十、测试要求

- 模块新增用例至少覆盖 application 层
- 新 API 必须有契约验证
- 新 worker 必须验证重试、失败与幂等处理路径

## 十一、评审清单

- 模块分层是否清晰
- 是否把业务规则放回了 domain / application
- 是否通过 contracts 暴露 DTO
- 是否存在未校验的环境变量
- 是否考虑日志、监控与失败恢复

## 十二、常见反模式

- 所有逻辑都堆到 controller
- 只按 `controllers/services/repositories` 平铺，业务边界丢失
- worker 和 API 各自维护不同 DTO
- 配置靠 `process.env` 到处读取
