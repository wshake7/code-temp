package com.wshake.infra.security;

import cn.dev33.satoken.stp.StpUtil;
import org.springframework.context.annotation.Configuration;

/**
 * Sa-Token 工具。
 *
 * <p>当前 Sa-Token 最新版（1.45.0）的 {@code SaServletFilter} 仍基于
 * {@code javax.servlet.Filter}，与 Spring Boot 4 (Jakarta EE 11) 不兼容。
 * <p>本框架<strong>不</strong>用 {@code SaServletFilter}，仅用 {@code SaInterceptor}
 * （在 {@code WebConfig} 注册）；本类仅保留当前登录用户的工具方法。
 * <p>使用 {@code proxyBeanMethods = false}，避免 CGLIB 增强失败（见 {@link com.wshake.infra.config.SaTokenConfig}）。
 *
 * @author wshake
 */
@Configuration(proxyBeanMethods = false)
public class SaTokenConfigure {

    /**
     * 当前登录用户 id；未登录返回 {@code null}。
     */
    public static Long currentUserIdOrNull() {
        try {
            return StpUtil.isLogin() ? StpUtil.getLoginIdAsLong() : null;
        } catch (Exception e) {
            return null;
        }
    }
}
