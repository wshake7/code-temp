---
name: module-refactor-grill
description: "模块优化重构完整路径：Research → Grill →（可选 design-it-twice / 原型）→ 规模分支（Plan|to-spec/to-tickets）→ Implement → Review。"
argument-hint: "<模块路径 / 子系统 / 架构痛点>"
---

# module-refactor-grill

`/module-refactor` 的访谈加强版：先摸清 codebase 事实，再把 **接口形状、seam 位置、破坏性、验收** 磨成共同理解，再按规模单 session 实现或拆 ticket。

交付物仍是 **模块优化重构**（depth / locality / leverage），不是新功能。词汇对齐 `/codebase-design`：**module** / **interface** / **depth** / **seam** / **adapter** / **leverage** / **locality**。

**不走本 command 时：**

| 情境 | 改用 |
|------|------|
| 范围与目标 interface 已清晰，无需访谈 | `/module-refactor` |
| 不知道改哪，要先扫全库出候选报告 | `/improve-codebase-architecture`（选中候选后也可接回本 command 的 Grill） |
| 要交付新功能 | `/develop` / `/develop-grill` |
| 只做 rename / 死代码，无结构决策 | `/refactor-safely` |
| 没有 codebase 的纯设计讨论 | `/grill-me` |
| 路径都看不清的巨大 fog | `/wayfinder` |
| 已有 agent-ready refactor ticket | 直接 `/implement` |
| 刚说的话没听懂 | `/wait-what` |

Research → Grill **无门禁**；Grill 之后的阶段过渡必须走门禁。禁止静默跨阶段。

## Target: $ARGUMENTS

若 `$ARGUMENTS` 为空，先确认痛点或目标区域（允许模糊，Grill 会收紧）。

### 门禁（通用）

展示当前阶段结论后，**立刻**用 AskUserQuestion（一次一问）。禁止只写「停止/等待批准」或静默继续。

| 过渡 | 问题 | 继续 | 补充 |
|------|------|------|------|
| Grill → 下一跳 | 共同理解是否足够继续？ | `进入下一阶段 (Recommended)` | `继续访谈` / `先 design-it-twice` / `先 Prototype` |
| Plan → Implement | 是否批准重构计划？ | `批准并继续 (Recommended)` | `需要补充` / `改走 multi-session` |
| Plan → Implement（多切片时） | 如何编排实现顺序？ | 见下方 **实现编排门禁** | — |
| Spec/Tickets 发布前 | 拆分是否批准？ | 由 `/to-tickets` 自身 quiz 处理 | — |
| Review → Commit | 是否提交变更？ | `提交 (Recommended)` | `暂不提交` |

- 只有选「继续」类选项才可进入下一阶段
- 禁止凭软确认跳过门禁
- Grill 结束前：不起草完整 Plan、不写实现产物（允许极短的「待确认假设」列表）
- **注意**：阶段门禁「一次一问」；**Grill 访谈**按 **frontier 轮次**（一轮可多问），二者不要混用

#### 实现编排门禁（仅当计划含多个可独立验证的切片时触发）

与 `/module-refactor` 相同：切片相互独立才触发；有依赖则按依赖串行。

| 选项 | 含义 |
|------|------|
| `串行：切片A → 切片B → 切片C → code-review (Recommended)` | 默认稳妥 |
| `并行：切片A → (切片B + 切片C 并行子代理) → code-review` | 共享前置后并行 |
| `全部并行：(切片A + 切片B + 切片C 并行子代理) → code-review` | 无共享前置 |
| `需要补充` | 回 Plan |

约束：选定编排写入 Plan Approach 顶部；**行为锁切片默认最先串行**；并行产出回主 session 合并验证；接近 smart zone 降级串行。

### Context hygiene

1. Research → Grill →（design-it-twice / Prototype 回收）→ to-spec / Plan：尽量 **Continue** 同一 window
2. **smart zone** 约 **150k**。阶段边界：Continue → clear → handoff（portability）→ subagent → **compact**
3. 每个 `/implement`（含 multi-session ticket）从 **fresh session** 开始；tickets 之间 **`/clear`**
4. Prototype 绕行因换目录/旁路适合 `/handoff`；同目录仅 token 压力时优先 compact

### 硬规则（贯穿全程）

1. **行为优先**：默认 observable 行为不变；破坏性变更必须在 Grill 里显式决策
2. **先锁行为再动结构**；旧浅测试在新 interface 覆盖后删除（replace-don't-layer）
3. **假 seam 禁入**：一个 adapter ≠ 真 seam
4. **YAGNI**：只加深 Grill 锁定的 cluster
5. **impact 先于大改**：graph 工具画 blast radius（`/refactor-safely`）
6. **不自动 commit**；提交在 Review 门禁
7. Grill 中结晶的术语/硬权衡：走 `/domain-modeling`（CONTEXT 当场写；硬权衡才 ADR）

---

### Phase 1: Research

为 Grill 准备**事实材料**，把**决策**留给 Grill。

**优先工具：** 知识图谱 minimal context → 结构/调用/flows；读 `CONTEXT.md` 与相关 ADR。

**探索清单：**

1. 相关 module 路径、interface 现状、调用方与测试
2. 浅度与摩擦证据（bounce、泄漏、为测而抽的纯函数、deletion test 结果）
3. 依赖类别线索（in-process / local-substitutable / remote-owned / true-external）
4. Blast radius 粗图
5. **待确认决策**列表（明确标成 Grill 议题，不要自行拍板）——典型：目标 interface 形状、seam 放哪、是否允许破坏调用方、迁移策略（一次切 vs 兼容层）、验收标准、与 ADR 冲突是否 reopen

**输出（进入 Grill 前必须展示）：**

- 相关文件/module 列表
- 摩擦与浅度证据（引用路径）
- 依赖与 blast 粗图
- 待确认决策列表
- 五维评分表

#### 评分体系

| 维度 | 问题 | 高分标志 | 低分标志 |
|------|------|----------|----------|
| 范围清晰度 | 知道大概动哪一片？ | 有 cluster 边界 | 全库迷雾 |
| 摩擦可指认 | 能指出具体浅度/痛点？ | 有路径级证据 | 只有「代码丑」 |
| 依赖感知 | 知道谁会受影响？ | callers/flows 轮廓 | 完全未知 |
| 行为可描述 | 现有行为说得清吗？ | 有测试或可叙述不变量 | 行为靠猜 |
| 决策清单 | Grill 议题是否列全？ | 决策 vs 事实已分开 | 把决策当事实写死了 |

**决策：**

- 总分 >= 70：展示后**直接进入 Phase 2 Grill**（无门禁）
- 总分 < 70：补最低维后重评；或带着差距问用户是否进入 Grill
- fog 极大：建议 `/wayfinder` 或先 `/improve-codebase-architecture` 出候选

---

### Phase 2: Grill

使用 `/grill-with-docs`（内部 `/grilling` + `/domain-modeling`）驱动访谈。

**访谈纪律：**

1. 画 **design tree**：每个决策挂依赖它的后续决策
2. **按轮次**推进；每轮只问当前 **frontier**（前置已定、现在能答、不依赖本轮其它未答）
3. **一轮抛出整个 frontier**：编号 + 每题推荐答案，等用户答完再下一轮
4. 题型：

```text
❓ **Q1** - **<题目标题>**: <题干，可多段，可含选项>

➡️ <你的推荐答案>
```

5. **fact** 派 subagent 查 codebase，不拿事实问用户；探索未回不阻塞本轮其它就绪问题
6. **decision** 交给用户；frontier 清空前不要宣称「已经理解了」
7. 维持 CONTEXT / glossary / ADR 纪律
8. 重构特有议题优先覆盖（不必每轮全问，按树解锁）：

| 议题簇 | 示例决策 |
|--------|----------|
| 目标 | 加深哪个 module？成功长什么样（leverage/locality）？ |
| 行为契约 | 哪些 observable 必须不变？允许哪些破坏？ |
| Interface | 目标 interface 的职责边界？暴露什么、隐藏什么？ |
| Seam | 缝合面放哪？要不要 port？第二 adapter 是什么？ |
| 迁移 | 大爆炸 vs 兼容层 vs 分批调用方迁移？ |
| 测试 | characterization 写在哪？旧测试删哪些？ |
| 风险 | 半迁移窗口、性能、与 ADR 冲突 |

9. 收尾输出**共同理解摘要**，再走门禁

**共同理解摘要模板：**

```text
REFACTOR SHARED UNDERSTANDING

Target cluster: [...]
Problem (shallowness / friction): [...]
Goal depth: [期望的 interface 与 locality/leverage]
Behaviour contract: [不变点 / 显式允许的破坏]
Target interface (outline): [...]
Seam strategy: [...]
Migration strategy: [...]
Out of scope: [...]
Test strategy (agreed): [...]
Open questions: [...]
ADR / CONTEXT updates: [已写或待写]
```

**Grill → 下一跳门禁：**

| 用户选择 | 动作 |
|----------|------|
| `进入下一阶段` | Phase 2.5 判断（design-it-twice / Prototype / 规模分支） |
| `继续访谈` | 留在 Grill |
| `先 design-it-twice` | Phase 2.5A |
| `先 Prototype` | Phase 2.5B |

---

### Phase 2.5: 可选绕行

#### 2.5A design-it-twice（接口形状高度不确定时）

当用户选 `先 design-it-twice`，或共同理解里 **Target interface** 仍空心：

1. 加载 `/codebase-design`，按 **DESIGN-IT-TWICE** 用并行 subagent 产出 2–3 个**结构上**不同的 interface 方案
2. 用 depth / locality / seam 放置比较，给出推荐
3. 把选定方案写回共同理解（必要时再开一轮极短 Grill frontier）
4. 进入规模分支——不要跳过规模判断直接写代码

#### 2.5B Prototype 绕行（罕见）

仅当某个决策**无法在对话里可靠解决**时——典型：复杂状态机手感、迁移开关的 UX。

1. `/handoff` 导出当前理解与待验证问题
2. Fresh session：`/prototype-design` 或 `/prototype-grill`
3. `/handoff` 带回 Capture verdict，写回共同理解 / ADR
4. 原型代码进 throwaway branch；然后进入规模分支

纸面能说清的接口问题**不要** prototype。

---

### Phase 3: 规模分支

共同理解稳定后判断：

| 分支 | 何时 | 动作 |
|------|------|------|
| **A. 单 session** | 一条（或极少）迁移路径可验证；window 装得下 | Phase 3A Plan → Implement → Review |
| **B. multi-session** | 多批调用方迁移、多条独立 vertical slices、明显超 window | Phase 3B `/to-spec` → `/to-tickets` → per-ticket implement |

拿不准时：若需独立验收的迁移切片 ≥ 3，倾向 **B**。

#### 3A. Plan → Implement → Review（单 session）

**Plan**（只描述做什么，不写实现代码）：

1. Goal / Out of scope / Behaviour contract 对齐 Grill
2. Target interface + Seam strategy 写入计划正文
3. 文件列表来自 Research，并反映 Grill 决策
4. Approach：行为锁 → 结构加深 → 调用方迁移 → 删旧测试 → 验证；优先窄而贯通的 tracer 迁移
5. Risks + Test strategy；Grill 改过的范围覆盖 Research 过时假设
6. 装不进单 session → 改走 3B

```text
PLAN: [Module / Cluster] Refactor

Goal: [...]
Out of scope: [...]
Behaviour contract: [...]

Target interface (outline): [...]
Seam strategy: [...]
Migration strategy: [...]

Files to modify / New / Delete: [...]

Approach:
1. Characterization / 行为锁
2. ...
实现顺序: [若门禁已选，写在此行]

Blast radius: [...]
Risks: [...]
Test strategy: [...]
Success criteria: [...]
```

展示后走 **Plan → Implement** 门禁；多独立切片再走编排门禁。

**Implement**：按选定顺序执行；优先 `/tdd` 与 `/refactor-safely`；**不**自动 commit；并行切片合并后全量相关验证。撞人墙 → `/wizard`。发现依赖判错 → 回编排门禁。

**Review & Commit**：`/code-review`（Standards + Spec，对照共同理解与 Plan）；核对假 seam / 旧测试清理 / flows 覆盖；展示摘要后提交门禁；**不自动提交**。

#### 3B. to-spec → to-tickets → 分 session implement

仍在同一 window（若未超 smart zone）：

1. **`/to-spec`**：综合 Grill + Research（+ design-it-twice / Prototype），**不再访谈**；确认测试 seams 后发布
2. **`/to-tickets`**：拆成可独立验证的迁移/加深 tickets，声明 blocking edges；quiz 粒度后发布
3. **本 command 推荐在此收尾**，给出：

```text
下一步（每个 ticket 一个 fresh session）：
1. 打开新 session
2. /clear
3. /implement <ticket 引用>
4. 完成后取下一条 frontier ticket
不要在同一 session 连续 implement 多个 tickets。
```

仅当用户**明确要求**时，才在本 session 做 **一条** frontier ticket。

**不要**对 `/to-tickets` 产出再跑 `/triage`。

---

### 阶段衔接速查

```text
Research（事实 + Grill 议题）
  → Grill（design tree + frontier；CONTEXT/ADR）
    → [可选] design-it-twice 或 Prototype 绕行
      → 规模判断
           ├─ A: Plan → 门禁 → Implement → Review → 提交门禁
           └─ B: to-spec → to-tickets →（新 session + /clear）implement × N
```

### 完成时

- **3A**：变更已 review；行为契约与新 interface 测试成立；CONTEXT/ADR 已更新（若 Grill 写过）；按用户选择提交或留下 diff
- **3B**：spec + tickets 已发布；frontier 与 per-ticket `/implement` 指引已给出
- 任一阶段因 context 压力退出：已在边界做 Continue/clear/handoff/subagent/compact 决策，并写明下一 session 恢复点
