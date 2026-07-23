---
name: develop-grill
description: "Build a feature using Research > Grill > Plan > Implement > Review phases with validation gates."
argument-hint: "<feature description>"
---

Research → Grill → Plan → Implement → Review。除 Research → Grill 外，其余阶段过渡必须走门禁，禁止自动进入下一阶段。

## Feature: $ARGUMENTS

若 `$ARGUMENTS` 为空，先确认要构建的功能描述。

### 门禁（通用）

展示当前阶段结论后，**立刻**用 AskUserQuestion（一次一问）。禁止只写「停止/等待批准」或静默继续。

| 过渡 | 问题 | 继续 | 补充 |
|------|------|------|------|
| Grill → Plan | 是否进入计划？ | `进入计划 (Recommended)` | `需要补充` |
| Plan → Implement | 是否批准实现？ | `批准并继续 (Recommended)` | `需要补充` |
| Review → Commit | 是否提交变更？ | `提交 (Recommended)` | `暂不提交` |

Research → Grill **无需门禁**：评分达标（或用户已决定带着差距继续）后直接进入 Grill。

- 只有选「继续」类选项才可进入下一阶段；「需要补充」则修订/补调研/继续访谈后再问一次
- Grill 结束前：不起草计划、文件列表或实现产物
- 禁止凭 "ok" / "good" 等软确认跳过门禁

### Phase 1: Research

探索 codebase，摸清范围后再打分。

**探索清单：**

1. **相关代码**：入口、路由/API、数据模型、UI 页面、测试与 fixtures
2. **已有模式**：同域 CRUD / 鉴权 / 列表筛选等可复用实现；记录可对照路径
3. **依赖与约束**：调用链、跨端约定（mock / React / Vue）、配置与 schema、权限与错误约定
4. **边界与验证**：空值/并发/权限/失败路径；现有测试或手动验收方式

**输出（进入 Grill 前必须展示）：**

- 相关文件/模块列表（尽量精确到路径）
- 可复用模式与关键约束
- 已知边界与待确认决策（留给 Grill）
- 五维评分表

#### 评分体系

维度（每项 0-20，总分 0-100）：

| 维度 | 问题 | 高分标志 | 低分标志 |
|------|------|----------|----------|
| 范围清晰度 | 知道要改哪些文件？ | 能列出精确文件列表 | 只知道大致区域 |
| 模式熟悉度 | 有类似模式可参考？ | codebase 中有可直接参照的实现 | 需要从零设计 |
| 依赖感知 | 知道改了谁会影响什么？ | 完整的调用链和依赖图 | 不确定谁会受影响 |
| 边界情况 | 能识别边界情况？ | 列出了空值、并发、权限等边界 | 只考虑了 happy path |
| 测试策略 | 知道怎么验证？ | 有明确的手动或自动验证方法 | 验证方式模糊 |

**打分方法：**

1. 逐维给分 + 一句话理由（引用具体路径/符号，避免空话）
2. 汇总总分与通过/不通过
3. 不通过时：点名最低维、差距、下一步行动（如「需要探索 X 的 API 边界」），而非笼统「需要更多研究」

**决策：**

- 总分 >= 70：展示上述输出后**直接进入 Phase 2**（无门禁）
- 总分 < 70：补最低维后重评；循环直到 >= 70，或说明无法提升的维度并询问是否带着差距进入 Grill

### Phase 2: Grill

使用 `/grill-with-docs`（含 `/grilling` 与 domain-modeling）驱动访谈：

- 一次一问；推荐选项加 `(Recommended)`
- fact 自己查 codebase，decision 交给用户；推到底
- 每次回答末尾加 `notes:`（偏好、权衡、未决分支）
- 收尾写共同理解摘要，再走门禁

### Phase 3: Plan

基于 Research 发现 + Grill 共同理解起草计划。**只描述要做什么，不写实现代码。** 计划须可执行、可审查：路径尽量精确，步骤可独立验证。

**起草要求：**

1. Goal 对齐 Grill 结论；Out of scope 写清不做的部分
2. 文件列表来自 Research，并反映 Grill 决策；改/新建/可能删除分开写
3. Approach 按依赖排序（数据/API → 业务 → UI → 测试），每步说明理由
4. Risks 写潜在问题与缓解；Test strategy 写手动/自动如何验收
5. 若 Grill 改了范围，先修订 Research 中过时假设，再出计划

展示完整计划后走门禁（Plan → Implement）。选「需要补充」则修订计划或回 Grill/Research，再重新提问。

```text
PLAN: [Feature Name]

Goal: [一句话]
Out of scope: [明确不做的]

Files to modify:
1. path/file.ts - [改什么 / 为什么]

New files:
1. path/new.ts - [用途]

Approach:
1. [步骤与理由]
2. [步骤与理由]

Risks:
- [问题] → [缓解]

Test strategy:
- [如何验证；涉及多端时分别写]
```

### Phase 4: Implement

用 `/implement` 执行已批准计划。

### Phase 5: Review & Commit

用 `/code-review`：读变更全文；有精确行号才报；`grep` 查 console.log / TODO / 密钥，只报实际命中；不报未验证猜测。展示摘要后走提交门禁；**不自动提交**。
