# 01 — Schema v10 + Root seed + Casbin 通配

**What to build:** java-admin 使用与 `backend/db` v10 一致的全量表结构；初始化唯一 Root 用户与通配 Casbin 策略，使后续鉴权与业务模块有可运行的数据基线。实体层对齐 password_hash / is_enabled / deleted_at 与审计字段约定。

**Blocked by:** None — can start immediately

**Status:** done

- [x] Flyway 迁移覆盖 v10 核心表与 casbin_rule（替换或重建简化 V1/V2 链，dev 可干净迁移）
- [x] Seed 仅一条 Root 用户（及必要角色关联）+ Root 通配 policy
- [x] SysUser（及必要基础实体）字段与 schema 一致；旧简化字段不再作为真相源
- [x] 应用能在迁移+seed 后启动并完成 DB 连接级 smoke（无需业务 API 齐套）
