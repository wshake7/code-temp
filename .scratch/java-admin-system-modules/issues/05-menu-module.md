# 05 — 菜单管理与动态路由

**What to build:** 管理员可维护菜单树（DIR/MENU/BUTTON），绑定菜单-API；登录用户可拉取动态菜单路由驱动侧栏。三端菜单与动态路由数据源对齐。

**Blocked by:** 02 — Auth + ALTCHA + 三端契约基线

**Status:** done

- [x] 菜单 list/all/CRUD/软删/batch 等与前端约定路径可用
- [x] 菜单-API 绑定读写
- [x] 动态菜单接口按当前用户角色过滤（或与 mock 等价规则一致）
- [x] name/path 唯一性校验行为与约定一致
- [x] 三端 menu API 与路由消费对齐（路径已与 react/vue/mock 一致；Java 实现契约）
- [x] HTTP 测试覆盖树形与绑定主路径（Controller 契约 + Service 树/绑定主路径）
