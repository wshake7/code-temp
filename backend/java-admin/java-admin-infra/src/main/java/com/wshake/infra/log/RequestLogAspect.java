package com.wshake.infra.log;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.wshake.common.constant.MdcKeys;
import com.wshake.infra.security.SaTokenConfigure;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.slf4j.MDC;
import org.springframework.stereotype.Component;

/**
 * Controller 请求日志切面。
 *
 * <p>记录：method / uri / params / userId / 耗时 / 返回值摘要 / 异常。
 *
 * @author wshake
 */
@Slf4j
@Aspect
@Component
@RequiredArgsConstructor
public class RequestLogAspect {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Pointcut("execution(* com.wshake.api.controller..*(..))")
    public void controllerPointcut() {}

    /** 环绕 Controller 方法，记录请求参数、耗时、返回值摘要及异常。 */
    @Around("controllerPointcut()")
    // CHECKSTYLE.OFF: IllegalThrows
    public Object around(ProceedingJoinPoint pjp) throws Throwable {
        // CHECKSTYLE.ON: IllegalThrows
        long start = System.currentTimeMillis();
        String method = pjp.getSignature().toShortString();
        Object[] args = pjp.getArgs();

        Long userId = SaTokenConfigure.currentUserIdOrNull();
        if (userId != null) {
            MDC.put(MdcKeys.USER_ID, String.valueOf(userId));
        }

        log.info("[REQ] method={} args={}", method, safeToJson(args));

        try {
            Object result = pjp.proceed();
            long cost = System.currentTimeMillis() - start;
            log.info("[RES] method={} cost={}ms result={}", method, cost, safeToJson(result));
            return result;
        } catch (Throwable t) {
            long cost = System.currentTimeMillis() - start;
            log.error("[ERR] method={} cost={}ms", method, cost, t);
            throw t;
        } finally {
            MDC.remove(MdcKeys.USER_ID);
        }
    }

    private String safeToJson(Object obj) {
        if (obj == null) {
            return "null";
        }
        try {
            String json = objectMapper.writeValueAsString(obj);
            if (json.length() > 500) {
                return json.substring(0, 500) + "...(truncated)";
            }
            return json;
        } catch (JsonProcessingException e) {
            return String.valueOf(obj);
        }
    }
}
