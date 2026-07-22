---
name: develop-grill
description: >
  通过 Research > Grill > Plan > Grill > Implement > Review 六阶段构建功能，
  阶段之间有验证门与压力测试访谈。适用于用户说 /develop-grill、想在实现前
  充分打磨需求与计划，或需要带 Grill 门禁的完整开发流程时。
argument-hint: "<feature description>"
disable-model-invocation: true
user-invocable: true
metadata:
  short-description: "Research → Grill → Plan → Grill → Implement → Review"
---

通过六个阶段构建功能，每个阶段之间有验证门。

## Feature: $ARGUMENTS

若 `$ARGUMENTS` 为空，先向用户确认要构建的功能描述，再进入 Phase 1。

配套约定：
- 评分细则：[SCORING.md](SCORING.md)
- 访谈问答：[ASK.md](ASK.md)

### Phase 1: Research

探索 codebase 理解范围：

1. 找到所有相关文件和已有模式（优先使用 codebase-memory / 图查询，不足时再 grep）
2. 检查依赖和约束
3. 按 [SCORING.md](SCORING.md) 的 5 个维度打分（0-100）

**评分：**
- 范围清晰度 (0-20)：知道要改哪些文件？
- 模式熟悉度 (0-20)：有类似模式可参考？
- 依赖感知 (0-20)：知道改了谁会影响什么？
- 边界情况 (0-20)：能识别边界情况？
- 测试策略 (0-20)：知道怎么验证？

**决策：**
- 得分 >= 70 → 展示调研发现，进入 Phase 2
- 得分 < 70 → 识别差距，补充上下文，重新评分

### Phase 2: Grill (Research)

**停止。用户回答问题并明确确认前，不要进入 Phase 3。**

Phase 1 完成评分后，进入访谈循环。**你** 来驱动：

使用 `/grilling` skill 进行访谈，遵循 [ASK.md](ASK.md) 中的问答约定（优先用 `ask_user_question` 工具）。

硬约束：
- 不要起草计划、文件列表或任何实现产物。
- 用户明确确认前，不要进入 Phase 3。

### Phase 3: Plan

展示计划供审批：

```text
PLAN: [Feature Name]

Goal: [一句话]

Files to modify:
1. path/file.ts - [改什么]

New files:
1. path/new.ts - [用途]

Approach:
1. [步骤与理由]

Risks:
- [潜在问题与缓解]

Test strategy:
- [如何验证]
```

### Phase 4: Grill (Plan)

**停止。用户明确确认前，不要进入 Phase 5。**

Phase 3 展示计划后，进入访谈循环。**你** 来驱动：

运行一次 `/grill-with-docs` skill，遵循 [ASK.md](ASK.md) 中的问答约定。

额外要求：
- 走完计划的每个决策分支，逐一解决依赖。
- 结束时写一段共同理解摘要。
- 始终重新输出完整的 `PLAN: ...` 块（Phase 3 的，加上本阶段的决策内联），让用户在一个地方看到最终计划。

硬约束：
- 不要写或修改任何代码，即使「准备一下」也不行。
- 用户明确确认前，不要进入 Phase 5。

### Phase 5: Implement

使用 `/implement` skill 执行已审批的计划。

### Phase 6: Review & Commit

使用 `/code-review` skill 审查变更，然后：

1. 阅读每个变更文件的全文
2. 验证，不假设——每个潜在问题引用精确行号；无法引用就丢弃该发现
3. 用搜索工具查找 console.log、TODO、硬编码密钥、调试语句——只报告实际找到的
4. 不报告未验证的发现——不要说「确保 X」或「考虑 Y」
5. 展示已验证摘要供最终审批
6. 用户确认后，使用 conventional commit 消息提交（仅在用户明确要求提交时）

### Learning Capture

完成后询问：
- 实现过程中做了哪些纠正？
- 有什么模式值得加入 LEARNED？
- 格式：`[LEARN] Category: Rule`
