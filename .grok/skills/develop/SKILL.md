---
name: develop
description: >
  通过 Research > Plan > Implement > Review 四阶段构建功能，阶段之间有验证门。
  适用于用户说 /develop、想按标准流程做功能、或需要带计划审批的实现时。
argument-hint: "<feature description>"
disable-model-invocation: true
user-invocable: true
metadata:
  short-description: "Research → Plan → Implement → Review 四阶段开发"
---

通过四个阶段构建功能，每个阶段之间有验证门。

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

### Phase 2: Plan

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

**停止。用户明确批准计划前，不要进入 Phase 3。**

### Phase 3: Implement

使用 `/implement` skill 执行已审批的计划。

### Phase 4: Review & Commit

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
