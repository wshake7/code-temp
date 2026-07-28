package com.wshake.infra.security;

import com.wshake.common.exception.AuthException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.casbin.jcasbin.main.Enforcer;
import org.springframework.web.servlet.HandlerInterceptor;

/**
 * jcasbin 全局鉴权拦截器。
 *
 * <p>注册在 {@link com.wshake.infra.config.WebConfig} 中，位于 Sa-Token {@code SaInterceptor} 之后。
 * 每次请求从 Sa-Token 取当前用户 ID，调 {@code enforcer.enforce(userId, path, method)} 判断是否放行。
 *
 * <p>标准 casbin 语义：无匹配 policy 时拒绝（deny-by-default）。首次接入时 {@code casbin_rule} 表为空，
 * 所有受保护接口将返回 403；需手动通过 {@link CasbinService#addPolicy} 添加 policy 后才能访问。
 *
 * <p>排除路径：登录接口由 WebConfig 配置排除，不经过本拦截器。
 *
 * @author wshake
 */
@Slf4j
@RequiredArgsConstructor
public final class CasbinInterceptor implements HandlerInterceptor {

    private final Enforcer enforcer;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        // Sa-Token 已在 SaInterceptor 中完成登录校验；此处取 userId
        Long userId = SaTokenConfigure.currentUserIdOrNull();
        if (userId == null) {
            // 未登录请求不应到达这里（SaInterceptor 已拦截），防御性拒绝
            throw AuthException.notLogin();
        }

        String sub = String.valueOf(userId);
        String obj = request.getRequestURI();
        String act = request.getMethod();

        boolean allowed = enforcer.enforce(sub, obj, act);
        if (!allowed) {
            log.warn("[CASBIN] denied sub={} obj={} act={} traceId={}", sub, obj, act, org.slf4j.MDC.get("traceId"));
            throw AuthException.forbidden();
        }

        return true;
    }
}
