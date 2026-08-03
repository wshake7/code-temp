# 08 — 国际化管理

**What to build:** 管理员可管理语言与翻译文案，支持按 key 聚合查看/batch upsert 及 mock 等价的导入导出能力。三端 i18n 管理对齐。

**Blocked by:** 02 — Auth + ALTCHA + 三端契约基线

**Status:** done

- [x] i18n-locale 分页/all/CRUD/软删/batch；默认语言约束合理
- [x] i18n-translation CRUD/list/by-key/by-locale/batch-upsert 等主路径可用
- [x] 导入预览/导入/导出 batch 与 mock 等价或明确降级并三端一致
- [x] 三端 i18n API 对齐
- [x] HTTP 测试覆盖主路径
