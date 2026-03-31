# system-auth-service（统一认证授权与审批框架）开发计划

## 1. 职责边界

- 对应 bounded context：`system-auth`
- 范围：身份认证、角色权限、数据权限、统一审批流程框架
- 不包含：系统工具管理（归 `system-admin`）

## 2. 依赖

- 契约：`@ai-datahub/contract`（system-auth 相关 client/DTO）
- 下游：LDAP/AD/OAuth2（可选集成，MVP 先本地用户）
- 审批通知：邮件/钉钉/企业微信（通过 `system-integration` 适配）

## 3. MVP 建议（先让其他服务可用）

- 用户/角色/权限最小闭环
- 审批流最小模板（线性审批 + 待办/已办）
- 统一 Guard/鉴权中间件，服务间复用
