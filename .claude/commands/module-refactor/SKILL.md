---
name: module-refactor
description: "单 session 模块优化重构：Research → Plan → Implement → Review。目标清晰、缝合面与验收已知时使用。"
argument-hint: "<模块路径 / 子系统 / 痛点描述>"
---

# module-refactor

对齐 ask-matt 与 `/develop` 的「单 session 直改」捷径，但交付物是 **模块优化重构**（加深 interface、收拢 locality、降低 blast radius），**不是**新功能。

词汇对齐 `/codebase-design`：**module** / **interface** / **depth** / **seam** / **adapter** / **leverage** / **locality**。禁止用 component、service、API、boundary 替代这些词。

**不走本 command 时：**

| 情境 | 改用 |
|------|------|
| 目标模糊：不清楚加深什么、接口该长什么样 | `/module-refactor-grill` |
| 不知道该改哪一块，要先扫全库找 deepening 候选 | `/improve-codebase-architecture` |
| 要交付新功能而非重构现有模块 | `/develop` 或 `/develop-grill` |
| 只做安全重命名 / 死代码清理，无结构加深 | 直接 `/refactor-safely` |
| 难复现 bug / 性能回退 | `/diagnosing-bugs` |
| 一个 session 装不下的巨型重构 | 本 command 规模分支 B，或先 `/wayfinder` |
| 刚说的话没听懂 | `/wait-what` |

Research → Plan **无门禁**（评分达标或用户决定带着差距继续后直接进入）；其余阶段过渡必须走门禁，禁止静默跨阶段。

## Target: $ARGUMENTS

若 `$ARGUMENTS` 为空，先确认：要优化的 **module / 子系统 / 痛点**（路径或领域名均可）。

### 门禁（通用）

展示当前阶段结论后，**立刻**用 AskUserQuestion（一次一问）。禁止只写「停止/等待批准」或静默继续。

| 过渡 | 问题 | 继续 | 补充 |
|------|------|------|------|
| Plan → Implement | 是否批准重构计划？ | `批准并继续 (Recommended)` | `需要补充` / `改走 multi-session` / `改走 grill` |
| Plan → Implement（多切片时） | 如何编排实现顺序？ | 见下方 **实现编排门禁** | — |
| Review → Commit | 是否提交变更？ | `提交 (Recommended)` | `暂不提交` |

- 只有选「继续」类选项才可进入下一阶段
- 「需要补充」→ 修订后重新提问；「改走 multi-session」→ 规模分支 B；「改走 grill」→ 建议 `/module-refactor-grill`
- 禁止凭 "ok" / "good" 等软确认跳过门禁

#### 实现编排门禁（仅当计划含多个可独立验证的切片时触发）

当 Plan 的 Approach 里存在**多个互不阻塞、可分别验证的切片**（典型：先 characterization tests，再并行挪两个独立浅 module），在「批准实现」之后、进入 Implement 之前，**立刻**用 AskUserQuestion 追问编排。一次一问，给出 Plan 中实际切片名。

判定：

- 切片之间**有依赖**（如加深后的 interface 契约先于调用方迁移）→ **不触发**，按依赖串行
- 切片之间**相互独立** → **触发**

问题模板（替换为实际切片名）：

> 计划包含 切片A / 切片B / 切片C 三处独立改动，希望按什么顺序实现？

| 选项 | 含义 | 适用 |
|------|------|------|
| `串行：切片A → 切片B → 切片C → code-review (Recommended)` | 逐步验证，收尾统一 review | 有隐含耦合、切片较重、或行为锁测试尚未稳 |
| `并行：切片A → (切片B + 切片C 并行子代理) → code-review` | 共享前置串行，独立切片并行 | 切片真正独立、window 充裕 |
| `全部并行：(切片A + 切片B + 切片C 并行子代理) → code-review` | 全并行后合并 review | 无共享前置且完全独立 |
| `需要补充` | 回 Plan 修订 | 依赖不清、切片划坏 |

约束：

- 选定编排后写入 Plan Approach 顶部「实现顺序」一行
- 接近 smart zone 时强制串行或阶段边界决策
- 并行 subagent 产出回主 session 合并 typecheck + 相关测试后再 Review
- **行为锁测试切片**默认在所有结构改动之前串行完成（不要并行「先改结构再补测试」）

### Context hygiene

对齐 ask-matt / PHASE-BOUNDARIES：

1. Research → Plan →（单 session）Implement：尽量 **Continue** 同一 window；下一阶段需要本阶段作 primary source 时优先继续
2. **smart zone** 约 **150k**。接近上限时在阶段边界按序：Continue → `/clear` → `/handoff`（仅 portability）→ subagent → **`/compact`**
3. multi-session：每个 ticket 的 `/implement` 从 **fresh session** 开始，tickets 之间 **`/clear`**
4. `/handoff` 窄用：只买 portability

### 硬规则（贯穿全程）

1. **行为优先于结构**：有行为变化时必须显式写入 Goal；默认 **行为不变** 的结构加深
2. **先锁行为再动刀**：Implement 早期优先 characterization / 接口层测试（replace-don't-layer 见 `/codebase-design` DEEPENING）
3. **删除测试**：旧浅 module 上的单元测试在新 interface 有覆盖后**删除**，不双倍维护
4. **假 seam 禁入**：只有一个 adapter 的 port 是假 seam——不要为了「可测」引入无第二 adapter 的间接层
5. **YAGNI 范围**：只加深用户点名或 Research 锁定的 cluster；不顺带全库美化
6. **impact 先于大改**：结构迁移前用 graph 工具（`/refactor-safely`：`get_impact_radius` / `get_affected_flows` / rename preview）画 blast radius
7. **本 command 不自动 commit**；提交权在 Review 门禁

---

### Phase 1: Research

探索目标 module 及其依赖 cluster。目标是**可执行的重构范围感**，不是架构论文。

**优先工具：**

1. 知识图谱（code-review-graph / codebase-memory）：`get_minimal_context` → 结构搜索 → impact / callers / flows
2. `/refactor-safely` 相关模式：dead_code 线索、rename 影响预览、大函数分解候选
3. 读 `CONTEXT.md` 与相关 ADR——冲突候选要么回避，要么标成「需 reopen ADR」

**探索清单：**

1. **目标 module**：当前 interface、实现体量、调用方数量、测试入口
2. **浅度信号**：interface 几乎等于 implementation；理解一个概念要 bounce 多个小文件；纯函数为可测而抽、真 bug 在编排层；泄漏跨 seam 的细节
3. **依赖类别**（决定加深策略，见 DEEPENING）：in-process / local-substitutable / remote-owned / true-external
4. **Blast radius**：callers、affected flows、相关 fixtures 与集成测试
5. **现有测试**：哪些锁行为、哪些锁实现、哪些在加深后应变废
6. **Deletion test**：删掉嫌疑浅 module 后，复杂度是集中还是只是搬家？

**输出（进入下一阶段前必须展示）：**

- 目标 module 与 cluster 文件列表（尽量精确到路径/符号）
- 当前 interface 简述 + 浅度/摩擦证据（引用路径）
- 依赖类别与初步 seam 假设
- Blast radius（主要 callers / flows）
- 测试现状与「必须先锁的行为」
- 五维评分表 + **规模判断**

#### 评分体系

维度（每项 0-20，总分 0-100）：

| 维度 | 问题 | 高分标志 | 低分标志 |
|------|------|----------|----------|
| 范围清晰度 | 知道加深哪些文件、不动哪些？ | 精确文件/符号列表 + Out of scope | 只知道「这块乱」 |
| 接口意图 | 加深后的 interface 轮廓是否清楚？ | 能用 1–3 个职责句描述目标 interface | 仍在猜方法清单 |
| 依赖感知 | 知道 blast radius？ | callers + flows + 跨层约定 | 不知谁会碎 |
| 行为锁定 | 能否证明行为不变（或已知变更）？ | 现有测试可锁，或能写 characterization | 无测试且行为说不清 |
| 验证策略 | 如何验收重构成功？ | typecheck + 测试 + 可选手动路径 | 「感觉整齐了」 |

**打分方法：**

1. 逐维给分 + 一句话理由（引用路径/符号）
2. 汇总总分与通过/不通过
3. 不通过：点名最低维、差距、下一步行动

**Research 决策：**

- 总分 >= 70：展示输出后进入 **规模分支**
- 总分 < 70：补最低维后重评；或说明无法提升的维度并询问是否带着差距继续
- 未决主要是**设计决策**（接口形状、seam 放哪、是否可破坏调用方）→ 建议 `/module-refactor-grill`
- 用户其实没指定目标、需要扫库找候选 → 建议 `/improve-codebase-architecture`
- 缺的是别人的知识 → `/to-questionnaire`

#### 规模分支（Research 后立刻判断）

| 判断 | 条件（经验） | 动作 |
|------|--------------|------|
| **A. 单 session** | cluster 可控、行为可锁、预估当前 window 可完成 | Phase 2 Plan |
| **B. multi-session** | 多条独立 vertical slices，或迁移调用方过多 | `/to-spec` → `/to-tickets`，tickets 发布后本 command 结束，并给出 per-ticket `/implement` 指引 |
| **C. 需先打磨** | 接口形状/破坏性/验收高度主观 | 建议 `/module-refactor-grill` |

不确定时默认 **A**，Plan 门禁保留 multi-session / grill 出口。

---

### Phase 2: Plan

仅 **规模分支 A**。基于 Research 起草计划。**只描述要做什么，不写实现代码。**

**起草要求：**

1. Goal：加深什么、换来什么 leverage/locality；默认 **observable 行为不变**
2. Out of scope：明确不碰的 module、不做的功能、不 reopen 的 ADR
3. **Target interface**（轮廓）：调用方需要知道的签名/不变量/错误模式——仍用 codebase-design 词汇
4. **依赖类别 → 策略**：in-process 合并；local-substitutable 用 stand-in；remote-owned 要双 adapter 才建 port；true-external 注入 mock 口
5. 文件列表：改 / 新建 / 删除（含将删除的浅测试）分开
6. Approach：优先 **行为锁 → 结构加深 → 调用方迁移 → 删旧测试/死代码 → 全量相关验证**；每步可独立验证
7. Risks：回归面、半迁移状态、与 ADR 冲突；Test strategy 写清 characterization + 新 interface 测试
8. 写着写着发现装不进单 session → 改走 B，不要硬塞

```text
PLAN: [Module / Cluster Name] Refactor

Goal: [一句话：加深什么，行为是否不变]
Out of scope: [...]

Target interface (outline):
- [职责 / 关键操作 / 不变量]

Dependency category: in-process | local-substitutable | remote-owned | true-external
Seam strategy: [合并 | 内化 | port+adapters | 不引入假 seam]

Files to modify:
1. path - [改什么 / 为什么]

New files:
1. path - [用途]

Files / tests to delete (after coverage moves):
1. path - [为何可变废]

Approach:
1. [行为锁 / characterization]
2. [结构加深步骤]
3. [调用方迁移]
4. [清理与验证]

Blast radius:
- Callers: [...]
- Flows: [...]

Risks:
- [问题] → [缓解]

Test strategy:
- Characterization: [...]
- New interface tests: [...]
- Regression suite: [...]
- Success criteria: [行为不变的可观察点 / 或显式允许的变更]
```

展示计划后走 **Plan → Implement** 门禁；多独立切片时再走实现编排门禁。

---

### Phase 3: Implement

按门禁选定的实现顺序执行已批准计划。

- **第一步倾向**：补/跑 characterization 或接口层行为锁，确认 red 的是真回归通道
- 结构改动用小步；优先 `/tdd` 在认可 seam 上 red-green
- 需要安全重命名时走 `/refactor-safely`（preview → apply → detect_changes）
- 定期 typecheck / 相关测试；并行切片时各 subagent 自测，主 session 合并后再全跑相关套件
- **不要**自动 commit（裸 `/implement` 会 commit；本编排延后到 Review）
- `/code-review` 可在实现收尾跑；发现留给 Phase 4 汇总
- 撞到只有人能过的墙 → `/wizard`
- 发现计划错误或假 seam：停下来修订 Plan / 回 Research，不默默扩大范围
- 发现其实需要产品/接口决策：停，建议切换 `/module-refactor-grill`

---

### Phase 4: Review & Commit

1. `/code-review`（若未跑）或汇总：Standards + Spec（对照本 Plan 的 Goal / Target interface / 行为不变承诺）
2. 额外核对：
   - 旧浅测试是否已按计划删除或说明保留理由
   - 是否引入单 adapter 假 seam
   - blast radius 内关键 flows 是否仍有覆盖
3. 展示摘要：加深前后 interface 对比（几句话）、测试结果、残留风险
4. 提交门禁；**不自动提交**

---

### 阶段衔接速查

```text
Research（cluster / 浅度 / blast / 行为锁）
  → 规模判断
       ├─ A: Plan → 门禁 → Implement → Review → 提交门禁
       ├─ B: to-spec → to-tickets →（新 session + /clear）implement × N
       └─ C: 建议 /module-refactor-grill
```

### 完成时

- **A**：变更已 review；行为锁与新 interface 测试成立；按用户选择提交或留下 diff
- **B**：spec + tickets 已发布；frontier 与 per-ticket `/implement` 指引已给出
- **C**：已说明为何改 grill，并等待用户切换
