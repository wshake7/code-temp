package com.wshake.infra.security;

import cn.dev33.satoken.stp.StpUtil;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.wshake.common.request.RequestContext;
import com.wshake.common.result.Result;
import com.wshake.common.result.ResultCode;
import com.wshake.service.blacklist.BlacklistService;
import com.wshake.service.blacklist.BlacklistService.BlacklistHit;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Optional;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * 访问黑名单运行时拦截（Servlet Filter）。
 *
 * <p>建议顺序：黑名单 → Sa-Token 鉴权 → Casbin。本 Filter 在 {@link com.wshake.infra.request.RequestContextFilter}
 * 之后、Timestamp/Encrypt 之前，保证公开登录路径也能做 IP 检查。
 *
 * <ul>
 *   <li>LOGIN（{@code /api/auth/login}）：仅查 IP；USER 在 {@code AuthService} 发 token 前查
 *   <li>其余 {@code /api/**}（API）：查 IP；若请求带有效 token 再查 USER
 *   <li>DEVICE 本波不查
 * </ul>
 *
 * <p>命中返回 HTTP 403 + {@link ResultCode#ACCESS_BLOCKED} 固定文案；reason 仅服务端日志。
 * 与登录链路 {@code AuthException.accessBlocked()} 的 HTTP/Result 形状一致。
 *
 * @author wshake
 */
@Slf4j
@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 5)
public final class BlacklistFilter extends OncePerRequestFilter {

    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();
    private static final String LOGIN_PATH = "/api/auth/login";

    private final BlacklistService blacklistService;

    public BlacklistFilter(BlacklistService blacklistService) {
        this.blacklistService = blacklistService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            filterChain.doFilter(request, response);
            return;
        }

        String path = SecurityPathMatcher.normalizePath(request);
        if (!path.startsWith("/api/")) {
            filterChain.doFilter(request, response);
            return;
        }

        boolean loginScene = isLoginPath(path);
        String requestScope = loginScene ? "LOGIN" : "API";
        String clientIp = resolveClientIp(request);

        if (clientIp != null && !clientIp.isBlank()) {
            Optional<BlacklistHit> ipHit = blacklistService.findBlockingHit("IP", clientIp, requestScope, null);
            if (ipHit.isPresent()) {
                writeAccessBlocked(response, "IP", clientIp, requestScope, ipHit.get());
                return;
            }
        }

        // LOGIN 场景 USER 由 AuthService 在发 token 前处理；Filter 不解析 body
        if (!loginScene) {
            Long userId = currentUserIdOrNull(request);
            if (userId != null) {
                String userValue = String.valueOf(userId);
                Optional<BlacklistHit> userHit = blacklistService.findBlockingHit("USER", userValue, "API", null);
                if (userHit.isPresent()) {
                    writeAccessBlocked(response, "USER", userValue, "API", userHit.get());
                    return;
                }
            }
        }

        filterChain.doFilter(request, response);
    }

    private static boolean isLoginPath(String path) {
        if (path == null || path.isEmpty()) {
            return false;
        }
        // 兼容尾斜杠，避免落到 API 场景导致 LOGIN 行拦不住登录
        String normalized = path.endsWith("/") && path.length() > 1 ? path.substring(0, path.length() - 1) : path;
        return LOGIN_PATH.equals(normalized);
    }

    /**
     * 优先 {@link RequestContext}（RequestContextFilter 已填充）；测试或异常路径再回退请求头。
     */
    private static String resolveClientIp(HttpServletRequest request) {
        String fromCtx = RequestContext.clientIpOrNull();
        if (fromCtx != null && !fromCtx.isBlank()) {
            return fromCtx;
        }
        String xff = request.getHeader("X-Forwarded-For");
        if (xff != null && !xff.isBlank()) {
            int comma = xff.indexOf(',');
            return (comma >= 0 ? xff.substring(0, comma) : xff).trim();
        }
        String realIp = request.getHeader("X-Real-IP");
        if (realIp != null && !realIp.isBlank()) {
            return realIp.trim();
        }
        return request.getRemoteAddr() == null ? "" : request.getRemoteAddr();
    }

    /**
     * 解析当前请求 userId。Filter 阶段可能尚无 Sa 请求上下文，故：
     * 先试 {@link StpUtil#isLogin()}；失败则从 Authorization Bearer 取 token，
     * 用 {@link StpUtil#getLoginIdByToken(String)} 直读（不依赖拦截器）。
     */
    private static Long currentUserIdOrNull(HttpServletRequest request) {
        try {
            if (StpUtil.isLogin()) {
                return StpUtil.getLoginIdAsLong();
            }
        } catch (Exception ignored) {
            // 无请求上下文时继续走 header
        }
        String token = extractBearerToken(request);
        if (token == null) {
            return null;
        }
        try {
            Object loginId = StpUtil.getLoginIdByToken(token);
            if (loginId == null) {
                return null;
            }
            return Long.parseLong(String.valueOf(loginId));
        } catch (Exception e) {
            return null;
        }
    }

    private static String extractBearerToken(HttpServletRequest request) {
        String auth = request.getHeader("Authorization");
        if (auth == null || auth.isBlank()) {
            return null;
        }
        String value = auth.trim();
        if (value.regionMatches(true, 0, "Bearer ", 0, 7)) {
            value = value.substring(7).trim();
        }
        return value.isEmpty() ? null : value;
    }

    private static void writeAccessBlocked(
            HttpServletResponse response, String targetType, String targetValue, String scene, BlacklistHit hit)
            throws IOException {
        log.warn(
                "[BLACKLIST] Access Blocked targetType={} targetValue={} scene={} hitScope={} reason={}",
                targetType,
                targetValue,
                scene,
                hit.scope(),
                hit.reason());
        // 与 AuthException.accessBlocked() → GlobalExceptionHandler 一致：HTTP 403
        response.setStatus(HttpServletResponse.SC_FORBIDDEN);
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        // 固定文案；不把 reason 写入 body
        Result<Void> error = Result.error(ResultCode.ACCESS_BLOCKED);
        response.getWriter().write(OBJECT_MAPPER.writeValueAsString(error));
    }
}
