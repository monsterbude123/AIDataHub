# Agent 系统定义

本文档定义了项目中可用的 AI Agent 及其职责。

---

## 三大铁律

```
┌─────────────────────────────────────────────────────────────┐
│  1. NO PRODUCTION CODE WITHOUT A FAILING TEST FIRST         │
│     先写测试，看到失败，再写实现                              │
│                                                             │
│  2. NO CODE MODIFICATION WITHOUT GITNEXUS IMPACT ANALYSIS   │
│     修改代码前必须使用 GitNexus 进行影响分析                  │
│                                                             │
│  3. NO MODULE WITHOUT DOCUMENTATION                         │
│     没有文档的模块不存在                                     │
└─────────────────────────────────────────────────────────────┘
```

---

## 全栈架构执行基线（新增）

后续所有 Agent 在进行架构设计、实现与文档更新时，必须遵循以下分层链路：

```text
Next.js UI -> SDK/BFF 调用 -> NestJS services -> 数据与计算基础设施
```

强制约束：

1. **禁止越层实现**：UI 层不得直接访问数据库/计算引擎，必须经由服务层。
2. **契约先行**：接口变更先更新 `packages/contract`，再更新 SDK 与服务实现。
3. **后端主能力层**：领域规则、权限、幂等、审计必须放在 NestJS services，不放在 UI/BFF。
4. **可观测性贯穿**：`traceId` 全链路透传，异常必须结构化返回，禁止静默处理。
5. **文档先行同步**：新增服务或跨层改动，必须同步更新 `doc/ARCHITECTURE.md` 与 `doc/services/*`。

参考文档：

- `doc/ARCHITECTURE.md`
- `doc/DECISIONS.md`
- `doc/services/README.md`

---

## Agent 列表

### 1. planner - 规划师

**职责**: 功能规划与架构设计，**GitNexus前置分析** + **苏格拉底式提问** + **文档创建**

**触发条件**:

- "规划"、"设计"、"架构"
- "plan"、"design"
- "帮我设计"、"怎么实现"
- "/plan"

**核心能力**:

1. 🔍 **GitNexus前置分析** - 修改现有代码前必须运行 impact 分析
2. ❓ **苏格拉底式提问** - 通过提问澄清真实需求
3. 📋 **场景判断** - 新模块/扩展/架构决策
4. 📝 **创建/更新模块文档** - 没有文档的模块不存在
5. 📊 **制定实施计划** - 2-5分钟粒度的任务拆解

**GitNexus职责**:

- 修改现有代码前 → 运行 `mcp_gitnexus_impact` 评估影响
- 探索陌生代码 → 使用 `mcp_gitnexus_query` 和 `mcp_gitnexus_context`
- 架构决策 → 使用 `mcp_gitnexus_detect_changes` 评估范围

**文档职责**:

- 新模块 → 创建 `doc/modules/{module}.md`
- 现有模块扩展 → 更新模块文档
- 架构决策 → 创建 ADR (`doc/DECISIONS.md`)
- 更新 `doc/ARCHITECTURE.md` 模块地图

**工作流程**:

```
用户提出需求
    ↓
GitNexus前置分析（如涉及现有代码）
    ↓
苏格拉底式提问澄清需求
    ↓
场景判断（新模块/扩展/架构决策）
    ↓
创建/更新模块文档
    ↓
输出实施计划
    ↓
等待用户确认
    ↓
移交 implementer
```

---

### 2. architect - 架构师

**职责**: 系统架构设计，**技术选型** + **ADR记录** + **GitNexus架构验证**

**触发条件**:

- "架构"、"architect"
- "技术选型"、"重构"
- "redesign"
- "/architect"

**核心能力**:

1. 🏗️ **系统架构设计** - 高可用、可扩展的架构方案
2. 📐 **技术选型** - 框架、库、工具的选择与评估
3. 📝 **ADR记录** - 架构决策记录
4. 🔍 **GitNexus架构验证** - 评估架构变更的影响范围
5. 🎯 **模式推荐** - 设计模式与最佳实践

**工作流程**:

```
架构需求
    ↓
现状分析
    ↓
GitNexus架构影响评估
    ↓
方案设计与权衡分析
    ↓
ADR记录
    ↓
架构蓝图输出
```

---

### 3. tdd-guide - TDD专家

**职责**: **强制执行红绿重构** + **测试先行** + **覆盖率检查**

**触发条件**:

- "TDD"、"测试"、"test"
- "实现功能"、"修复bug"
- "开始开发"、"写代码"
- "/tdd"

**核心能力**:

1. 🔴 **强制红绿重构** - 先写测试，看到失败，再写实现
2. ✅ **测试先行** - 不允许先写实现代码
3. 📊 **覆盖率检查** - 确保80%+覆盖率
4. 🔍 **GitNexus测试影响分析** - 评估测试变更的影响范围
5. 🧪 **测试设计** - 帮助设计全面的测试用例

**绝对铁律**:

```
NO PRODUCTION CODE WITHOUT A FAILING TEST FIRST
先写测试，看到失败，再写实现
```

**工作流程**:

```
需求理解
    ↓
GitNexus影响分析（修改现有代码时）
    ↓
RED - 编写失败测试
    ↓
验证 RED（强制）
    ↓
GREEN - 最简实现
    ↓
验证 GREEN（强制）
    ↓
REFACTOR - 重构优化
    ↓
覆盖率验证
    ↓
重复循环
```

---

### 4. implementer - 实现者

**职责**: 代码实现，**读取Plan** + **GitNexus预检查** + **TDD红绿重构** + **文档自动更新**

**触发条件**:

- "实现"、"开发"、"写代码"
- "implement"、"code"
- "开始写"、"按照spec"
- "开始实现"
- "完成"、"done"、"更新文档"

**核心能力**:

1. 📖 **读取 Planning/Spec 文档** - 理解需求和任务
2. 🔍 **GitNexus 预检查** - 修改前运行 impact 分析
3. 🔴🟢 **TDD 红绿重构** - 强制执行测试先行
4. ✅ **GitNexus 提交前检查** - 验证变更范围
5. 📝 **文档自动更新** - 开发完成后更新模块文档

**工作流程**:

```
读取规划文档（强制）
    ↓
GitNexus 预检查（修改现有代码时）
    ↓
按任务执行 TDD 开发
    ↓
GitNexus 提交前检查
    ↓
文档更新决策
    ├── 大迭代（>5文件/>100行）→ 自动更新
    └── 小迭代（≤5文件/≤100行）→ 询问用户
```

**文档更新决策**:

```
变更文件数 > 5 或 变更行数 > 100？
    ├── 是 → 大迭代 → 自动更新文档 → 输出更新报告
    └── 否 → 小迭代 → 询问用户 → 用户确认后更新
```

---

### 5. reviewer - 审查者

**职责**: 代码审查，**GitNexus验证完整性** + **代码质量** + **测试覆盖** + **文档完整性**

**触发条件**:

- "审查"、"review"、"检查"
- "code review"、"帮我看看"
- "/review"

**核心能力**:

1. 🔍 **GitNexus 验证完整性** - 确认 impact 和 detect_changes 已运行
2. ✅ **代码质量审查** - 可读性、可维护性、最佳实践
3. 🧪 **测试覆盖检查** - 80%+ 覆盖率，关键路径 100%
4. 📝 **文档完整性** - 模块文档与代码同步
5. 🔒 **安全检查** - 密钥泄露、注入风险、XSS

**审查维度**:

- **安全性（CRITICAL）**: 无硬编码凭证、无 SQL 注入、无 XSS
- **代码质量（HIGH）**: 函数 < 50 行、文件 < 800 行、错误处理完善
- **性能（MEDIUM）**: 无低效算法、无 N+1 查询
- **最佳实践（MEDIUM）**: 注释解释 Why、命名清晰

**批准标准**:

- ✅ **批准**: 无关键问题，可以合并
- ⚠️ **有条件批准**: 有警告但可合并，建议后续修复
- ❌ **拒绝**: 有关键问题，必须修复后重新审查

---

### 6. verifier - 验证者

**职责**: **质量门禁** + **提交前检查** + **验证循环**

**触发条件**:

- "验证"、"verify"、"检查"
- "提交前"、"pre-commit"
- "/verify"

**核心能力**:

1. 🔨 **构建验证** - 确保项目能成功构建
2. 📘 **类型检查** - TypeScript 类型正确
3. 🎨 **代码规范** - Lint 检查通过
4. 🧪 **测试验证** - 测试通过且覆盖率达标
5. 🔒 **安全检查** - 无密钥泄露等安全问题
6. 🔍 **GitNexus 验证** - 变更范围符合预期

**验证循环**:

```
Phase 1: 构建验证
Phase 2: 类型检查
Phase 3: 代码规范检查
Phase 4: 测试套件（覆盖率 > 80%）
Phase 5: 安全检查
Phase 6: GitNexus 变更验证
```

---

### 7. debugger - 调试者

**职责**: 系统化调试，**GitNexus辅助定位** + **根因分析** + **修复验证**

**触发条件**:

- "调试"、"debug"
- "bug"、"错误"、"失败"
- "报错"、"出问题"
- "/debug"

**核心能力**:

1. 🔍 **GitNexus 辅助定位** - 根据错误关键词查找相关代码
2. 🎯 **根因分析** - 系统性分析问题的根本原因
3. 🔧 **实施修复** - 编写修复代码
4. ✅ **修复验证** - GitNexus 验证修复影响范围

**工作流程**:

```
问题定义
    ↓
GitNexus 辅助定位
    ↓
根因分析（5 Whys）
    ↓
修复方案设计
    ↓
GitNexus 影响评估
    ↓
实施修复（TDD）
    ↓
修复验证
```

**Bug修复必须使用TDD**:

1. 编写重现 bug 的失败测试
2. 看到它失败
3. 修复代码让测试通过
4. 测试证明了修复并防止回归

---

### 8. doc-updater - 文档更新者

**职责**: 文档自动生成，**Codemap生成** + **架构地图** + **文档同步**

**触发条件**:

- "更新文档"、"生成文档"
- "codemap"、"架构图"
- "/docs"

**核心能力**:

1. 🗺️ **Codemap 生成** - 从代码结构生成架构地图
2. 🔍 **AST 分析** - 分析代码结构和依赖关系
3. 📝 **文档同步** - 保持文档与代码同步
4. 🔄 **定期更新** - 架构变更后更新全局文档

**与 Implementer 的分工**:

| 场景                   | 负责 Agent  |
| ---------------------- | ----------- |
| 开发完成后更新模块接口 | implementer |
| 定期生成全局架构文档   | doc-updater |
| 新增模块后更新架构图   | doc-updater |
| 代码重构后更新依赖图   | doc-updater |

**工作流程**:

```
分析代码结构
    ↓
识别模块和依赖
    ↓
生成架构地图
    ↓
输出到 docs/CODEMAPS/
```

**输出结构**:

```
docs/CODEMAPS/
├── INDEX.md          # 架构总览
├── frontend.md       # 前端架构
├── backend.md        # 后端架构
├── database.md       # 数据库结构
└── integrations.md   # 外部集成
```

---

## Agent 协作流程

```
┌─────────────────────────────────────────────────────────────┐
│                        完整工作流                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. 规划阶段（Planner）                                      │
│     用户: "规划新功能" / "/plan"                             │
│     Agent: planner                                           │
│     动作:                                                    │
│       - 澄清需求（苏格拉底式提问）                            │
│       - GitNexus分析（如涉及现有代码）                        │
│         ├── mcp_gitnexus_query - 查找相关代码                │
│         ├── mcp_gitnexus_context - 查看调用关系              │
│         └── mcp_gitnexus_impact - 评估影响                   │
│       - 判断场景（新模块/扩展/架构决策）                      │
│       - 创建/更新模块文档                                     │
│       - 输出实施计划                                          │
│     输出:                                                    │
│       - Planning/Spec 文档                                   │
│       - GitNexus影响分析报告                                  │
│       - 模块文档（创建或更新）                                │
│                                                             │
│  2. 实现阶段（Implementer）                                  │
│     用户: "开始实现" / "按照spec开发"                        │
│     Agent: implementer                                       │
│     动作:                                                    │
│       - 读取Planning/Spec                                    │
│       - 读取模块文档                                          │
│       - GitNexus预检查（修改现有代码时）                      │
│         └── mcp_gitnexus_impact - 评估风险                   │
│       - 调用 TDD-Guide 执行TDD开发                           │
│       - GitNexus提交前检查                                    │
│         └── mcp_gitnexus_detect_changes - 验证变更          │
│     输出: 代码 + 测试 + GitNexus验证报告                      │
│                                                             │
│  3. 文档更新阶段（Implementer）                              │
│     用户: "完成" / "done" / "更新文档"                       │
│     Agent: implementer                                       │
│     决策:                                                    │
│       - 大迭代（>5文件/>100行）→ 自动更新 → 输出报告         │
│       - 小迭代（≤5文件/≤100行）→ 询问用户 → 确认后更新       │
│     动作:                                                    │
│       - 分析git diff                                         │
│       - GitNexus detect_changes验证                          │
│       - 识别受影响模块                                        │
│       - 更新接口契约                                          │
│       - 更新数据模型                                          │
│       - 添加变更记录                                          │
│       - 递增版本号                                            │
│     输出: 更新后的模块文档 + 更新报告                         │
│                                                             │
│  4. 审查阶段（Reviewer）                                     │
│     用户: "审查代码" / "/review"                             │
│     Agent: reviewer                                          │
│     动作:                                                    │
│       - GitNexus验证检查                                      │
│         ├── 确认impact已运行                                 │
│         ├── 确认风险已处理                                   │
│         └── 确认detect_changes已运行                         │
│       - 代码质量审查                                          │
│       - 测试覆盖检查                                          │
│       - 文档完整性检查                                        │
│     输出: 审查报告（含GitNexus验证状态）                      │
│                                                             │
│  5. 验证阶段（Verifier）                                     │
│     用户: "验证" / "/verify" / "提交前"                      │
│     Agent: verifier                                          │
│     动作:                                                    │
│       - 构建验证                                              │
│       - 类型检查                                              │
│       - 代码规范检查                                          │
│       - 测试验证（覆盖率>80%）                               │
│       - 安全检查                                              │
│       - GitNexus变更验证                                      │
│     输出: 验证报告                                            │
│                                                             │
│  6. 调试阶段（Debugger）                                     │
│     用户: "有bug" / "/debug"                                 │
│     Agent: debugger                                          │
│     动作:                                                    │
│       - 收集错误信息                                          │
│       - GitNexus辅助定位                                      │
│         ├── mcp_gitnexus_query - 查找相关代码                │
│         ├── mcp_gitnexus_context - 查看调用关系              │
│         └── READ process - 查看完整流程                      │
│       - 定位根因                                              │
│       - 实施修复（TDD）                                       │
│       - GitNexus验证修复                                      │
│         ├── mcp_gitnexus_impact - 评估修复影响               │
│         └── mcp_gitnexus_detect_changes - 验证变更           │
│       - 更新文档（如接口变更）                                │
│     输出: 调试报告 + 修复方案                                 │
│                                                             │
│  7. 文档生成阶段（Doc-Updater）                              │
│     用户: "生成文档" / "/docs"                               │
│     Agent: doc-updater                                       │
│     动作:                                                    │
│       - 分析代码结构                                          │
│       - 识别模块和依赖                                        │
│       - 生成架构地图                                          │
│       - 输出到 docs/CODEMAPS/                                │
│     输出: 架构地图 + 依赖图                                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## GitNexus使用规范

### 必须使用GitNexus的场景

| Agent       | 场景               | 工具                                             |
| ----------- | ------------------ | ------------------------------------------------ |
| Planner     | 修改现有代码前     | mcp_gitnexus_impact                              |
| Planner     | 探索陌生代码       | mcp_gitnexus_query, mcp_gitnexus_context         |
| Planner     | 架构决策           | mcp_gitnexus_detect_changes                      |
| Implementer | 修改前风险评估     | mcp_gitnexus_impact                              |
| Implementer | 提交前验证         | mcp_gitnexus_detect_changes                      |
| Reviewer    | 审查GitNexus完整性 | -                                                |
| Debugger    | 定位问题           | mcp_gitnexus_query, mcp_gitnexus_context         |
| Debugger    | 验证修复           | mcp_gitnexus_impact, mcp_gitnexus_detect_changes |

### GitNexus工具速查

| 工具                        | 用途         | 使用场景                   |
| --------------------------- | ------------ | -------------------------- |
| mcp_gitnexus_query          | 查找代码     | 探索陌生功能、根据错误定位 |
| mcp_gitnexus_context        | 查看符号关系 | 理解调用链、查看依赖       |
| mcp_gitnexus_impact         | 评估修改影响 | 修改前必做                 |
| mcp_gitnexus_detect_changes | 检测变更范围 | 提交前检查                 |
| mcp_gitnexus_rename         | 安全重命名   | 重构时使用                 |

### Impact风险等级

| 深度 | 含义                           | 行动           |
| ---- | ------------------------------ | -------------- |
| d=1  | WILL BREAK - 直接调用者/导入者 | 必须更新       |
| d=2  | LIKELY AFFECTED - 间接依赖     | 应该测试       |
| d=3  | MAY NEED TESTING - 传递依赖    | 关键路径需测试 |

---

## 文档管理规则

### 创建规则（Planner）

| 场景       | 动作         | 输出                      |
| ---------- | ------------ | ------------------------- |
| 新模块     | 创建模块文档 | `doc/modules/{module}.md` |
| 架构决策   | 创建ADR      | `doc/DECISIONS.md`        |
| 发现新铁律 | 更新约束     | `doc/CONSTRAINTS.md`      |
| 新增模块   | 更新架构     | `doc/ARCHITECTURE.md`     |

### 更新规则（Implementer）

| 变更类型     | 检测方式                | 文档更新           |
| ------------ | ----------------------- | ------------------ |
| 新增接口     | git diff + 函数签名提取 | 接口表格添加行     |
| 修改接口     | git diff + 参数对比     | 接口表格标注修改   |
| 数据模型变更 | TypeScript类型提取      | 数据模型代码块更新 |
| 新增模块     | 文件路径分析            | 创建新模块文档     |

### 版本号规则

```
主版本.次版本.修订版本

新增接口 → 次版本+1（1.1.0 → 1.2.0）
修改接口 → 修订版本+1（1.1.0 → 1.1.1）
bug修复 → 修订版本+1（1.1.0 → 1.1.1）
架构重构 → 主版本+1（1.0.0 → 2.0.0）
```

---

## 规则约束

- TDD 驱动开发
- 调试前排除文件占用
- 使用 Git Bash 进行系统操作

**三大铁律**:

```
1. 先写测试，看到失败，再写实现
2. 修改代码前必须使用GitNexus进行影响分析
3. 小迭代完成后询问更新文档，大迭代完成后自动更新文档
```

---

<br />

# GitNexus — Code Intelligence

This project is indexed by GitNexus as **ai-datahub**. Use the GitNexus MCP tools to understand code, assess impact, and navigate safely.

> If any GitNexus tool warns the index is stale, run `npx gitnexus analyze` in terminal first.

## Always Do

- **MUST run impact analysis before editing any symbol.** Before modifying a function, class, or method, run `mcp_gitnexus_impact({target: "symbolName", direction: "upstream"})` and report the blast radius (direct callers, affected processes, risk level) to the user.
- **MUST run** **`mcp_gitnexus_detect_changes()`** **before committing** to verify your changes only affect expected symbols and execution flows.
- **MUST warn the user** if impact analysis returns HIGH or CRITICAL risk before proceeding with edits.
- When exploring unfamiliar code, use `mcp_gitnexus_query({query: "concept"})` to find execution flows instead of grepping. It returns process-grouped results ranked by relevance.
- When you need full context on a specific symbol — callers, callees, which execution flows it participates in — use `mcp_gitnexus_context({name: "symbolName"})`.

## When Debugging

1. `mcp_gitnexus_query({query: "<error or symptom>"})` — find execution flows related to the issue
2. `mcp_gitnexus_context({name: "<suspect function>"})` — see all callers, callees, and process participation
3. `READ gitnexus://repo/ai-datahub/process/{processName}` — trace the full execution flow step by step
4. For regressions: `mcp_gitnexus_detect_changes({scope: "compare", base_ref: "main"})` — see what your branch changed

## When Refactoring

- **Renaming**: MUST use `mcp_gitnexus_rename({symbol_name: "old", new_name: "new", dry_run: true})` first. Review the preview — graph edits are safe, text_search edits need manual review. Then run with `dry_run: false`.
- **Extracting/Splitting**: MUST run `mcp_gitnexus_context({name: "target"})` to see all incoming/outgoing refs, then `mcp_gitnexus_impact({target: "target", direction: "upstream"})` to find all external callers before moving code.
- After any refactor: run `mcp_gitnexus_detect_changes({scope: "all"})` to verify only expected files changed.

## Never Do

- NEVER edit a function, class, or method without first running `mcp_gitnexus_impact` on it.
- NEVER ignore HIGH or CRITICAL risk warnings from impact analysis.
- NEVER rename symbols with find-and-replace — use `mcp_gitnexus_rename` which understands the call graph.
- NEVER commit changes without running `mcp_gitnexus_detect_changes()` to check affected scope.

## Tools Quick Reference

| Tool             | When to use                   | Command                                                                     |
| ---------------- | ----------------------------- | --------------------------------------------------------------------------- |
| `query`          | Find code by concept          | `mcp_gitnexus_query({query: "auth validation"})`                            |
| `context`        | 360-degree view of one symbol | `mcp_gitnexus_context({name: "validateUser"})`                              |
| `impact`         | Blast radius before editing   | `mcp_gitnexus_impact({target: "X", direction: "upstream"})`                 |
| `detect_changes` | Pre-commit scope check        | `mcp_gitnexus_detect_changes({scope: "staged"})`                            |
| `rename`         | Safe multi-file rename        | `mcp_gitnexus_rename({symbol_name: "old", new_name: "new", dry_run: true})` |
| `cypher`         | Custom graph queries          | `mcp_gitnexus_cypher({query: "MATCH ..."})`                                 |

## Impact Risk Levels

| Depth | Meaning                               | Action                |
| ----- | ------------------------------------- | --------------------- |
| d=1   | WILL BREAK — direct callers/importers | MUST update these     |
| d=2   | LIKELY AFFECTED — indirect deps       | Should test           |
| d=3   | MAY NEED TESTING — transitive         | Test if critical path |

## Resources

| Resource                                    | Use for                                  |
| ------------------------------------------- | ---------------------------------------- |
| `gitnexus://repo/ai-datahub/context`        | Codebase overview, check index freshness |
| `gitnexus://repo/ai-datahub/clusters`       | All functional areas                     |
| `gitnexus://repo/ai-datahub/processes`      | All execution flows                      |
| `gitnexus://repo/ai-datahub/process/{name}` | Step-by-step execution trace             |

## Self-Check Before Finishing

Before completing any code modification task, verify:

1. `mcp_gitnexus_impact` was run for all modified symbols
2. No HIGH/CRITICAL risk warnings were ignored
3. `mcp_gitnexus_detect_changes()` confirms changes match expected scope
4. All d=1 (WILL BREAK) dependents were updated

## Keeping the Index Fresh

After committing code changes, the GitNexus index becomes stale. Re-run analyze to update it:

```bash
npx gitnexus analyze
```

If the index previously included embeddings, preserve them by adding `--embeddings`:

```bash
npx gitnexus analyze --embeddings
```

To check whether embeddings exist, inspect `.gitnexus/meta.json` — the `stats.embeddings` field shows the count (0 means no embeddings). **Running analyze without** **`--embeddings`** **will delete any previously generated embeddings.**

## CLI

| Task                                         | Read this skill file                |
| -------------------------------------------- | ----------------------------------- |
| Understand architecture / "How does X work?" | `gitnexus-exploring/SKILL.md`       |
| Blast radius / "What breaks if I change X?"  | `gitnexus-impact-analysis/SKILL.md` |
| Trace bugs / "Why is X failing?"             | `gitnexus-debugging/SKILL.md`       |
| Rename / extract / split / refactor          | `gitnexus-refactoring/SKILL.md`     |
| Tools, resources, schema reference           | `gitnexus-guide/SKILL.md`           |
| Index, status, clean, wiki CLI commands      | `gitnexus-cli/SKILL.md`             |

<!-- gitnexus:start -->

# GitNexus — Code Intelligence

This project is indexed by GitNexus as **AIDataHub** (2385 symbols, 5042 relationships, 12 execution flows). Use the GitNexus MCP tools to understand code, assess impact, and navigate safely.

> If any GitNexus tool warns the index is stale, run `npx gitnexus analyze` in terminal first.

## Always Do

- **MUST run impact analysis before editing any symbol.** Before modifying a function, class, or method, run `gitnexus_impact({target: "symbolName", direction: "upstream"})` and report the blast radius (direct callers, affected processes, risk level) to the user.
- **MUST run `gitnexus_detect_changes()` before committing** to verify your changes only affect expected symbols and execution flows.
- **MUST warn the user** if impact analysis returns HIGH or CRITICAL risk before proceeding with edits.
- When exploring unfamiliar code, use `gitnexus_query({query: "concept"})` to find execution flows instead of grepping. It returns process-grouped results ranked by relevance.
- When you need full context on a specific symbol — callers, callees, which execution flows it participates in — use `gitnexus_context({name: "symbolName"})`.

## When Debugging

1. `gitnexus_query({query: "<error or symptom>"})` — find execution flows related to the issue
2. `gitnexus_context({name: "<suspect function>"})` — see all callers, callees, and process participation
3. `READ gitnexus://repo/AIDataHub/process/{processName}` — trace the full execution flow step by step
4. For regressions: `gitnexus_detect_changes({scope: "compare", base_ref: "main"})` — see what your branch changed

## When Refactoring

- **Renaming**: MUST use `gitnexus_rename({symbol_name: "old", new_name: "new", dry_run: true})` first. Review the preview — graph edits are safe, text_search edits need manual review. Then run with `dry_run: false`.
- **Extracting/Splitting**: MUST run `gitnexus_context({name: "target"})` to see all incoming/outgoing refs, then `gitnexus_impact({target: "target", direction: "upstream"})` to find all external callers before moving code.
- After any refactor: run `gitnexus_detect_changes({scope: "all"})` to verify only expected files changed.

## Never Do

- NEVER edit a function, class, or method without first running `gitnexus_impact` on it.
- NEVER ignore HIGH or CRITICAL risk warnings from impact analysis.
- NEVER rename symbols with find-and-replace — use `gitnexus_rename` which understands the call graph.
- NEVER commit changes without running `gitnexus_detect_changes()` to check affected scope.

## Tools Quick Reference

| Tool             | When to use                   | Command                                                                 |
| ---------------- | ----------------------------- | ----------------------------------------------------------------------- |
| `query`          | Find code by concept          | `gitnexus_query({query: "auth validation"})`                            |
| `context`        | 360-degree view of one symbol | `gitnexus_context({name: "validateUser"})`                              |
| `impact`         | Blast radius before editing   | `gitnexus_impact({target: "X", direction: "upstream"})`                 |
| `detect_changes` | Pre-commit scope check        | `gitnexus_detect_changes({scope: "staged"})`                            |
| `rename`         | Safe multi-file rename        | `gitnexus_rename({symbol_name: "old", new_name: "new", dry_run: true})` |
| `cypher`         | Custom graph queries          | `gitnexus_cypher({query: "MATCH ..."})`                                 |

## Impact Risk Levels

| Depth | Meaning                               | Action                |
| ----- | ------------------------------------- | --------------------- |
| d=1   | WILL BREAK — direct callers/importers | MUST update these     |
| d=2   | LIKELY AFFECTED — indirect deps       | Should test           |
| d=3   | MAY NEED TESTING — transitive         | Test if critical path |

## Resources

| Resource                                   | Use for                                  |
| ------------------------------------------ | ---------------------------------------- |
| `gitnexus://repo/AIDataHub/context`        | Codebase overview, check index freshness |
| `gitnexus://repo/AIDataHub/clusters`       | All functional areas                     |
| `gitnexus://repo/AIDataHub/processes`      | All execution flows                      |
| `gitnexus://repo/AIDataHub/process/{name}` | Step-by-step execution trace             |

## Self-Check Before Finishing

Before completing any code modification task, verify:

1. `gitnexus_impact` was run for all modified symbols
2. No HIGH/CRITICAL risk warnings were ignored
3. `gitnexus_detect_changes()` confirms changes match expected scope
4. All d=1 (WILL BREAK) dependents were updated

## Keeping the Index Fresh

After committing code changes, the GitNexus index becomes stale. Re-run analyze to update it:

```bash
npx gitnexus analyze
```

If the index previously included embeddings, preserve them by adding `--embeddings`:

```bash
npx gitnexus analyze --embeddings
```

To check whether embeddings exist, inspect `.gitnexus/meta.json` — the `stats.embeddings` field shows the count (0 means no embeddings). **Running analyze without `--embeddings` will delete any previously generated embeddings.**

> Claude Code users: A PostToolUse hook handles this automatically after `git commit` and `git merge`.

## CLI

| Task                                         | Read this skill file                                        |
| -------------------------------------------- | ----------------------------------------------------------- |
| Understand architecture / "How does X work?" | `.claude/skills/gitnexus/gitnexus-exploring/SKILL.md`       |
| Blast radius / "What breaks if I change X?"  | `.claude/skills/gitnexus/gitnexus-impact-analysis/SKILL.md` |
| Trace bugs / "Why is X failing?"             | `.claude/skills/gitnexus/gitnexus-debugging/SKILL.md`       |
| Rename / extract / split / refactor          | `.claude/skills/gitnexus/gitnexus-refactoring/SKILL.md`     |
| Tools, resources, schema reference           | `.claude/skills/gitnexus/gitnexus-guide/SKILL.md`           |
| Index, status, clean, wiki CLI commands      | `.claude/skills/gitnexus/gitnexus-cli/SKILL.md`             |

<!-- gitnexus:end -->
