package com.wshake.service.entity;

import com.easy.query.core.annotation.Column;
import com.easy.query.core.annotation.EntityProxy;
import com.easy.query.core.annotation.Table;
import com.easy.query.core.proxy.ProxyEntityAvailable;
import com.wshake.service.entity.proxy.SysMenuProxy;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 菜单实体（对齐 schema v10 {@code sys_menu}）。
 *
 * <p>本票仅用于查询 BUTTON 权限码；完整 CRUD 见后续 menu 模块。
 *
 * @author wshake
 */
@Data
@EqualsAndHashCode(callSuper = true)
@Table("sys_menu")
@EntityProxy
public class SysMenu extends BaseEntity implements ProxyEntityAvailable<SysMenu, SysMenuProxy> {

    @Column(primaryKey = true)
    private Long id;

    private Long parentId;

    private String name;

    /** DIR / MENU / BUTTON */
    private String type;

    private String path;

    private String component;

    private String icon;

    private String redirect;

    private String permissionCode;

    private String treePath;

    private String metadata;

    private Integer sort;

    private Integer isHidden;

    private Integer isEnabled;

    private String remark;
}
