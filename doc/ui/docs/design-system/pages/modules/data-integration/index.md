# 数据集成管理模块 - 页面索引

## 模块说明

数据接入处理支持通过Spark、ETL实现结构化、半结构化、非结构化文件的集中读取、校验、清洗转换等接入处理，并存储到数据仓库。

## 功能页面

| 页面 | 文件 | 说明 |
|------|------|------|
| 数据源列表 | [source-list.md](./source-list.md) | 浏览和管理数据源配置 |
| 数据源配置 | [source-config.md](./source-config.md) | 新增编辑数据源配置 |
| 数据探查 | [profiling.md](./profiling.md) | 对待接入数据多维度分析 |
| 数据标准化 | [standardization.md](./standardization.md) | 原始表到标准表字段映射配置 |
| Spark SQL开发 | [sql-dev.md](./sql-dev.md) | 自助Spark SQL开发 |

## 职责划分

- **数据接入**: 数据源配置、连接测试、元数据初始采集
- **数据探查**: 接入前数据质量分析
- **数据标准化**: 执行标准化处理（标准定义在数据治理）
- **数据开发**: 自助Spark SQL开发处理
