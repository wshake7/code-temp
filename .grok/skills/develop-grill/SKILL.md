---
name: develop-grill
description: >
  通过 Research > Grill > Plan > Implement > Review 五阶段构建功能，
  阶段之间有验证门与压力测试访谈。适用于用户说 /develop-grill、想在实现前
  充分打磨需求，或需要带 Grill 门禁的完整开发流程时。
argument-hint: "<feature description>"
disable-model-invocation: true
user-invocable: true
metadata:
  short-description: "Research → Grill → Plan → Implement → Review"
---

通过五个阶段构建功能，每个阶段之间有验证门。

## Feature: $ARGUMENTS

若 `$ARGUMENTS` 为空，先向用户确认要构建的功能描述，再进入 Phase 1。

### Phase 1: Research

探索 codebase 理解范围：

1. 找到所有相关文件和已有模式（优先使用 codebase-memory / 图查询，不足时再 grep）
2. 检查依赖和约束
3. 按下方评分体系的 5 个维度打分（0-100）

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

1. 逐维度评估，给出具体分数和一句话理由。
2. 汇总为总分和通过/不通过判断。
3. 不通过时，列出差距和下一步行动（如「需要探索 X 模块的 API 边界」），而不是笼统地说「需要更多研究」。

**决策：**

- 总分 >= 70：调研充分，展示发现并进入 Phase 2
- 总分 < 70：识别得分最低的维度，补充对应上下文，重新评分；循环直到 >= 70 或明确告知用户哪些维度无法提升

### Phase 2: Grill (Research)

**停止。用户回答问题并明确确认前，不要进入 Phase 3。**

Phase 1 完成评分后，进入访谈循环。**你** 来驱动：

使用 `/grill-with-docs` skill 进行访谈，并遵循下方问答约定（优先用 `ask_user_question` 工具）。

#### 问答约定

1. **一次一问**：`questions` 数组长度始终为 1。问完等用户回复，再问下一个。
2. **代码能查到的不要问人**：如果 fact 能通过探索 codebase 找到，直接查。只有 decisions 才交给用户。
3. **推荐选项放第一个**：`options[0]` 的 `label` 加 `(Recommended)` 后缀。
4. **推到底**：不要在几个软问题后停下。走完每个决策分支，直到用户给出明确的完成信号（"proceed" / "approved" / "good" / "next" / 「可以继续」）。
5. **完成时写摘要**：用户确认后，写一段共同理解摘要。

**字段约束（Grok `ask_user_question`）：**

- **`question`**：完整问句
- **`options`**：2-4 项；推荐选项放第一并在 label 加 `(Recommended)`；`label` 尽量短（几个词），`description` 解释权衡与影响；不要手写 `Other`——工具会自动追加
- **`multi_select`**：互斥决策默认 `false`；只有选项是累加性质时用 `true`（如「覆盖哪些测试场景」）
- **`preview`**（可选）：当选项适合可视化对比时使用——UI 布局、目录结构、API 形状、配置表单、代码片段等。约束：仅限单选（`multi_select: false`）

**Notes 跟进：** 每次用户回答后，在回复末尾追加一行 `notes:` 自由文本，记录用户偏好，以及该答案的关键要点、背后的权衡及相关的未决分支。

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

**停止。用户明确批准计划前，不要进入 Phase 4。**

### Phase 4: Implement

使用 `/implement` skill 执行已审批的计划。

### Phase 5: Review & Commit

使用 `/code-review` skill 审查变更，然后：

1. 阅读每个变更文件的全文
2. 验证，不假设——每个潜在问题引用精确行号；无法引用就丢弃该发现
3. 用搜索工具查找 console.log、TODO、硬编码密钥、调试语句——只报告实际找到的
4. 不报告未验证的发现——不要说「确保 X」或「考虑 Y」
5. 展示已验证摘要供最终审批
6. **不要自动提交。** 审查结束后，用 `ask_user_question` 询问是否提交，例如：
   - 问题：是否用 conventional commit 提交当前变更？
   - 选项：`提交 (Recommended)` / `暂不提交`
7. 仅当用户明确选择提交时，再使用 conventional commit 消息执行提交；选择暂不提交则跳过 commit，流程正常结束