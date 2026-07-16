# AskUserQuestion 约定

两处 Grill 阶段共用的问答约定。

## 核心规则

1. **一次一问**：`questions` 数组长度始终为 1。问完等用户回复，再问下一个。
2. **代码能查到的不要问人**：如果 fact 能通过探索 codebase 找到，直接查。只有 decisions 才交给用户。
3. **推荐选项放第一个**：`options[0]` 加 `(Recommended)` 后缀。
4. **推到底**：不要在几个软问题后停下。走完每个决策分支，直到用户给出明确的完成信号（"proceed" / "approved" / "good" / "next"）。
5. **完成时写摘要**：用户确认后，写一段共同理解摘要。

## 字段约束

- **`header`**：≤ 12 字符，短名词短语（如 `Scope`、`Auth`、`UI`）
- **`options`**：2-4 项；推荐选项放第一并加 `(Recommended)`；`label` 1-5 词，`description` 解释权衡与影响；不要手写 `Other`——工具会自动追加
- **`multiSelect`**：互斥决策默认 `false`；只有选项是累加性质时用 `true`（如"覆盖哪些测试场景"）
- **`preview`**（可选）：当选项适合可视化对比时使用——UI 布局、目录结构、API 形状、配置表单、代码片段等"一张图胜千言"的场景。约束：仅限单选（`multiSelect: false`）；HTML preview 不含 `<script>` / `<style>` / `<!DOCTYPE>`；markdown 格式用 ASCII art 和 fenced code blocks

## Notes 跟进

每次用户回答后，在回复末尾追加一行 `notes:` 自由文本，记录：
- 用户的偏好
- 该答案的关键要点（Research 阶段）或背后的权衡及相关的未决分支（Plan 阶段）