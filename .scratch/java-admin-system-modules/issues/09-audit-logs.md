# 09 — 审计日志（登录列表 + API 日志）

**What to build:** 管理员可分页查询登录日志与 API 调用日志；系统在请求链路中写入 api_log（字段对齐 schema）。三端日志页可联调。（登录写入可在 02 已完成，本票补齐列表与 api_log 闭环。）

**Blocked by:** 02 — Auth + ALTCHA + 三端契约基线

**Status:** ready-for-agent

- [ ] login-log 列表分页与筛选可用
- [ ] 受保护请求写入 api_log（含 user、path、status、cost 等关键字段；敏感信息脱敏策略合理）
- [ ] api-log 列表分页与筛选可用
- [ ] 三端日志 API 对齐
- [ ] HTTP 测试覆盖列表与写入可观察性
