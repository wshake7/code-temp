package com.wshake.infra.security;

import jakarta.servlet.http.HttpServletRequest;
import java.util.List;
import org.springframework.util.AntPathMatcher;

/**
 * 请求安全路径匹配（Encrypt 白名单等）。
 *
 * @author wshake
 */
public final class SecurityPathMatcher {

    private static final AntPathMatcher PATH_MATCHER = new AntPathMatcher();

    /** 免强制加密与独立 Sign 校验的路径（公钥、ALTCHA、文档、健康检查等）。 */
    public static final List<String> SECURITY_WHITELIST = List.of(
            "/api/encrypt/public/key",
            "/api/altcha/**",
            "/doc.html",
            "/doc.html/**",
            "/swagger-ui/**",
            "/v3/api-docs/**",
            "/favicon.ico",
            "/error",
            "/actuator/**",
            "/api/health/**");

    private SecurityPathMatcher() {}

    public static boolean isWhitelisted(HttpServletRequest request) {
        return isWhitelisted(request, SECURITY_WHITELIST);
    }

    public static boolean isWhitelisted(HttpServletRequest request, List<String> patterns) {
        String path = normalizePath(request);
        for (String pattern : patterns) {
            if (PATH_MATCHER.match(pattern, path)) {
                return true;
            }
        }
        return false;
    }

    public static String normalizePath(HttpServletRequest request) {
        String path = request.getRequestURI();
        String contextPath = request.getContextPath();
        if (contextPath != null && !contextPath.isEmpty() && path.startsWith(contextPath)) {
            path = path.substring(contextPath.length());
        }
        if (path.isEmpty()) {
            return "/";
        }
        return path;
    }
}
