# Swagger 配置检查报告

检查时间：2026-04-02  
检查范围：`services/*/src/main.ts`

## 检查结果

| 服务                 | 结果                     | 备注                                           |
| -------------------- | ------------------------ | ---------------------------------------------- |
| api-gateway          | ✅ 已配置                | `/api/docs`                                    |
| system-auth-service  | ✅ 已配置                | `/api/docs`                                    |
| metadata-service     | ✅ 已配置                | `/api/docs`                                    |
| data-service-service | ⚠️ 已配置但路径非统一    | 使用 `/api`，建议统一为 `/api/docs`            |
| ops-service          | ❌ 未检测到 Swagger 配置 | 需补 `DocumentBuilder` + `SwaggerModule.setup` |
| integration-service  | ❌ 未检测到 Swagger 配置 | 同上                                           |
| admin-service        | ❌ 未检测到 Swagger 配置 | 同上                                           |
| sharing-service      | ❌ 未检测到 Swagger 配置 | 同上                                           |
| analytics-service    | ❌ 未检测到 Swagger 配置 | 同上                                           |
| security-service     | ❌ 未检测到 Swagger 配置 | 同上                                           |

## 建议

1. 先统一 3001~3006 的业务服务 Swagger 配置
2. 再统一 `data-service-service` 路径到 `/api/docs`
3. 网关层保留聚合文档入口，前端只记 `/api/docs`
