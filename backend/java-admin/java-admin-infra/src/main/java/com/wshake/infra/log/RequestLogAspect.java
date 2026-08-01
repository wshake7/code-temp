package com.wshake.infra.log;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.wshake.common.constant.MdcKeys;
import com.wshake.infra.security.SaTokenConfigure;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.Reader;
import java.io.Writer;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.slf4j.MDC;
import org.springframework.stereotype.Component;
import org.springframework.validation.BindingResult;
import org.springframework.validation.Errors;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import org.springframework.web.multipart.MultipartFile;

/**
 * Controller 请求日志切面。
 *
 * <p>成功路径合并为单行 {@code [HTTP]}：HTTP method / URI(+query) / 方法签名 /
 * args 摘要 / 耗时 / 返回值摘要。失败路径同样用 {@code [HTTP]} 前缀 + ERROR 级别
 * （级别本身已标识失败，不再单独加 {@code [ERR]} 标签），并附带堆栈。
 *
 * <p>args 序列化时会跳过 Servlet/文件/流等不可 JSON 化参数，并对密码类字段脱敏，
 * 避免出现 {@code [Ljava.lang.Object;@hash} 或明文口令。不缓存原始 HTTP body
 * （对比 ContentCachingFilter：无全量缓冲、无 charset NPE、天然跳过二进制）。
 *
 * @author wshake
 */
@Slf4j
@Aspect
@Component
@RequiredArgsConstructor
public class RequestLogAspect {

    private static final int MAX_LOG_LENGTH = 500;

    /** 匹配 JSON 中常见敏感字段的字符串值，替换为 "***"。 */
    private static final Pattern SENSITIVE_JSON_FIELD = Pattern.compile(
            "(\"(?:password|passwordHash|oldPassword|newPassword|accessToken|refreshToken|token|secret|authorization)\""
                    + "\\s*:\\s*)\"(?:\\\\.|[^\"\\\\])*\"",
            Pattern.CASE_INSENSITIVE);

    /** 由 {@link com.wshake.infra.config.JacksonConfig} 注册的全局 Bean 注入。 */
    private final ObjectMapper objectMapper;

    @Pointcut("execution(* com.wshake.api.controller..*(..))")
    public void controllerPointcut() {}

    /** 环绕 Controller 方法，记录 HTTP 路径、参数、耗时、返回值摘要及异常。 */
    @Around("controllerPointcut()")
    // CHECKSTYLE.OFF: IllegalThrows
    public Object around(ProceedingJoinPoint pjp) throws Throwable {
        // CHECKSTYLE.ON: IllegalThrows
        long start = System.currentTimeMillis();
        String handler = pjp.getSignature().toShortString();
        Object[] args = pjp.getArgs();
        String httpLine = currentHttpLine();
        String argsJson = safeToJson(args);

        Long userId = SaTokenConfigure.currentUserIdOrNull();
        if (userId != null) {
            MDC.put(MdcKeys.USER_ID, String.valueOf(userId));
        }

        try {
            Object result = pjp.proceed();
            long cost = System.currentTimeMillis() - start;
            log.info(
                    "[HTTP] {} handler={} cost={}ms args={} result={}",
                    httpLine,
                    handler,
                    cost,
                    argsJson,
                    safeToJson(result));
            return result;
        } catch (Throwable t) {
            long cost = System.currentTimeMillis() - start;
            // ERROR 级别已标识失败，消息与成功路径同结构，便于检索；最后参数为堆栈
            log.error(
                    "[HTTP] {} handler={} cost={}ms args={}",
                    httpLine,
                    handler,
                    cost,
                    argsJson,
                    t);
            throw t;
        } finally {
            MDC.remove(MdcKeys.USER_ID);
        }
    }

    /**
     * 从当前请求线程组装 {@code METHOD uri?query}；无 Web 请求时返回 {@code -}。
     *
     * <p>包内可见，便于单测。
     */
    static String formatHttpLine(HttpServletRequest request) {
        if (request == null) {
            return "-";
        }
        String method = request.getMethod();
        String uri = request.getRequestURI();
        String query = request.getQueryString();
        if (query == null || query.isEmpty()) {
            return method + " " + uri;
        }
        return method + " " + uri + "?" + query;
    }

    private static String currentHttpLine() {
        var attrs = RequestContextHolder.getRequestAttributes();
        if (!(attrs instanceof ServletRequestAttributes servletAttrs)) {
            return "-";
        }
        return formatHttpLine(servletAttrs.getRequest());
    }

    /**
     * 将对象安全格式化为日志用 JSON 摘要（包内可见，便于单测）。
     *
     * @param obj 可为 null、POJO 或 Controller 方法参数数组
     * @return 截断且脱敏后的字符串
     */
    String safeToJson(Object obj) {
        if (obj == null) {
            return "null";
        }
        if (obj instanceof Object[] arr) {
            return formatArgs(arr);
        }
        return truncate(maskSensitive(writeOrFallback(obj)));
    }

    private String formatArgs(Object[] args) {
        List<Object> loggable = new ArrayList<>(args.length);
        for (Object arg : args) {
            if (arg == null) {
                loggable.add(null);
                continue;
            }
            if (isSkippableArg(arg)) {
                continue;
            }
            loggable.add(arg);
        }

        try {
            return truncate(maskSensitive(objectMapper.writeValueAsString(loggable)));
        } catch (JsonProcessingException ignored) {
            StringBuilder sb = new StringBuilder(64).append('[');
            for (int i = 0; i < loggable.size(); i++) {
                if (i > 0) {
                    sb.append(',');
                }
                sb.append(writeOrFallback(loggable.get(i)));
            }
            sb.append(']');
            return truncate(maskSensitive(sb.toString()));
        }
    }

    /**
     * Web/IO 等无法（或不该）完整 JSON 序列化的参数，跳过以免拖垮整段 args 日志。
     */
    private static boolean isSkippableArg(Object arg) {
        return arg instanceof ServletRequest
                || arg instanceof ServletResponse
                || arg instanceof MultipartFile
                || arg instanceof BindingResult
                || arg instanceof Errors
                || arg instanceof InputStream
                || arg instanceof OutputStream
                || arg instanceof Reader
                || arg instanceof Writer
                || arg instanceof byte[];
    }

    private String writeOrFallback(Object obj) {
        try {
            return objectMapper.writeValueAsString(obj);
        } catch (JsonProcessingException e) {
            // 禁止对数组用 String.valueOf（会得到 [L...;@hash）
            return "\"<" + obj.getClass().getSimpleName() + ">\"";
        }
    }

    private static String maskSensitive(String json) {
        return SENSITIVE_JSON_FIELD.matcher(json).replaceAll("$1\"***\"");
    }

    private static String truncate(String json) {
        if (json.length() > MAX_LOG_LENGTH) {
            return json.substring(0, MAX_LOG_LENGTH) + "...(truncated)";
        }
        return json;
    }
}
