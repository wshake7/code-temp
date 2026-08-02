package com.wshake.common.constant;

/**
 * 鉴权相关常量。
 *
 * @author wshake
 */
public final class SecurityConstants {

    /** Sa-Token token 名称（请求头名；配合 token-prefix=Bearer） */
    public static final String TOKEN_NAME = "Authorization";

    /** 系统内置 Root 角色 code */
    public static final String ROLE_ROOT = "root";

    private SecurityConstants() {}
}
