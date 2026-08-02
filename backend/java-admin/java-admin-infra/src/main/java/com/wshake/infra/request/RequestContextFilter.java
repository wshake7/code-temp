package com.wshake.infra.request;

import com.wshake.common.constant.SecurityHeaders;
import com.wshake.common.request.RequestContext;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * 请求 ThreadLocal 生命周期：入口 open，出口 close；并预填 requestId / URI / 客户端 IP。
 *
 * <p>顺序紧随 {@link com.wshake.infra.log.TraceIdFilter}（{@code HIGHEST_PRECEDENCE}），
 * 用户 id / language 由后续 Sa + Language 拦截器写入。
 *
 * @author wshake
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 1)
public class RequestContextFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        RequestContext.open();
        try {
            String requestId = request.getHeader(SecurityHeaders.REQUEST_ID);
            if (requestId != null && !requestId.isEmpty()) {
                RequestContext.setRequestId(requestId);
            }
            RequestContext.setRequestUri(request.getRequestURI());
            RequestContext.setClientIp(resolveClientIp(request));
            filterChain.doFilter(request, response);
        } finally {
            RequestContext.close();
        }
    }

    private static String resolveClientIp(HttpServletRequest request) {
        String xff = request.getHeader("X-Forwarded-For");
        if (xff != null && !xff.isBlank()) {
            // 取链上第一个
            int comma = xff.indexOf(',');
            return (comma >= 0 ? xff.substring(0, comma) : xff).trim();
        }
        String realIp = request.getHeader("X-Real-IP");
        if (realIp != null && !realIp.isBlank()) {
            return realIp.trim();
        }
        return request.getRemoteAddr();
    }
}
