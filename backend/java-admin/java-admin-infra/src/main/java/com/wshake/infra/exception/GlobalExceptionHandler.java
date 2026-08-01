package com.wshake.infra.exception;

import cn.dev33.satoken.exception.NotLoginException;
import cn.dev33.satoken.exception.NotRoleException;
import cn.dev33.satoken.exception.SaTokenException;
import com.wshake.common.exception.AuthException;
import com.wshake.common.exception.BizException;
import com.wshake.common.result.Result;
import com.wshake.common.result.ResultCode;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.stream.Collectors;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * 全局异常处理器。
 *
 * <p>统一转 {@link Result}。traceId 不在 body（Q13 决策），仅在响应头；
 * 日志中的 traceId 由 logback {@code %X{traceId}} 从 MDC 自动输出，无需在 msg 中重复打印。
 *
 * @author wshake
 */
@Slf4j
@Tag(name = "全局异常", description = "统一异常转 Result,每个 handler 对应一种 HTTP 状态与业务码")
@RestControllerAdvice
public class GlobalExceptionHandler {

    /** 处理业务异常：业务码 >= 4000 → HTTP 400，其余 → HTTP 200。 */
    @ExceptionHandler(BizException.class)
    @Operation(summary = "业务异常", description = "业务码 >= 4000 → HTTP 400;其余 → HTTP 200,code 由调用方指定")
    @ApiResponse(
            responseCode = "200/400",
            description = "业务异常 Result(code != 0)",
            content = @Content(schema = @Schema(implementation = Result.class)))
    public ResponseEntity<Result<Object>> handleBiz(BizException ex) {
        log.warn("[BIZ] code={} msg={}", ex.getCode(), ex.getMessage());
        HttpStatus status = ex.getCode() >= 4000 ? HttpStatus.BAD_REQUEST : HttpStatus.OK;
        return ResponseEntity.status(status).body(Result.error(ex.getCode(), ex.getMessage()));
    }

    /** 处理鉴权异常：AUTH_FORBIDDEN → HTTP 403，其余 → HTTP 401。 */
    @ExceptionHandler(AuthException.class)
    @Operation(summary = "鉴权异常", description = "AUTH_FORBIDDEN → HTTP 403;其余 → HTTP 401")
    @ApiResponse(
            responseCode = "401/403",
            description = "鉴权异常 Result(code 2xxx)",
            content = @Content(schema = @Schema(implementation = Result.class)))
    public ResponseEntity<Result<Object>> handleAuth(AuthException ex) {
        log.warn("[AUTH] code={} msg={}", ex.getCode(), ex.getMessage());
        HttpStatus status =
                ex.getCode() == ResultCode.AUTH_FORBIDDEN.getCode() ? HttpStatus.FORBIDDEN : HttpStatus.UNAUTHORIZED;
        return ResponseEntity.status(status).body(Result.error(ex.getCode(), ex.getMessage()));
    }

    /** 处理 Sa-Token 未登录异常：统一 → HTTP 401，code=2001。 */
    @ExceptionHandler(NotLoginException.class)
    @Operation(summary = "Sa-Token 未登录", description = "token 缺失 / 过期 / 被踢下线,统一 → HTTP 401,code=2001")
    @ApiResponse(
            responseCode = "401",
            description = "未登录 Result(code=2001)",
            content = @Content(schema = @Schema(implementation = Result.class)))
    public ResponseEntity<Result<Object>> handleNotLogin(NotLoginException ex) {
        log.warn("[SA_TOKEN] notLogin type={} msg={}", ex.getType(), ex.getMessage());
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Result.error(ResultCode.AUTH_NOT_LOGIN));
    }

    /** 处理 Sa-Token 无角色权限异常：→ HTTP 403，code=2004。 */
    @ExceptionHandler(NotRoleException.class)
    @Operation(summary = "Sa-Token 无角色权限", description = "当前 token 缺少必要角色 → HTTP 403,code=2004")
    @ApiResponse(
            responseCode = "403",
            description = "无权限 Result(code=2004)",
            content = @Content(schema = @Schema(implementation = Result.class)))
    public ResponseEntity<Result<Object>> handleNotRole(NotRoleException ex) {
        log.warn("[SA_TOKEN] notRole role={}", ex.getRole());
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(Result.error(ResultCode.AUTH_FORBIDDEN, "无权限：" + ex.getRole()));
    }

    /** 处理 Sa-Token 通用异常：→ HTTP 401，code=2001。 */
    @ExceptionHandler(SaTokenException.class)
    @Operation(summary = "Sa-Token 通用异常", description = "其他 Sa-Token 异常 → HTTP 401,code=2001,msg 为 Sa-Token 原文")
    @ApiResponse(
            responseCode = "401",
            description = "Sa-Token 异常 Result(code=2001)",
            content = @Content(schema = @Schema(implementation = Result.class)))
    public ResponseEntity<Result<Object>> handleSaToken(SaTokenException ex) {
        log.warn("[SA_TOKEN] {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Result.error(ResultCode.AUTH_NOT_LOGIN, ex.getMessage()));
    }

    /** 处理 @Valid 请求体校验失败：字段级错误拼到 msg → HTTP 400，code=1001。 */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    @Operation(summary = "请求体校验失败", description = "@Valid 注解触发,字段级错误信息拼到 msg → HTTP 400,code=1001")
    @ApiResponse(
            responseCode = "400",
            description = "参数错误 Result(code=1001,msg 含字段名)",
            content = @Content(schema = @Schema(implementation = Result.class)))
    public ResponseEntity<Result<Object>> handleValidation(MethodArgumentNotValidException ex) {
        String msg = ex.getBindingResult().getFieldErrors().stream()
                .map(fe -> fe.getField() + " " + fe.getDefaultMessage())
                .collect(Collectors.joining("; "));
        log.warn("[VALIDATION] {}", msg);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Result.error(ResultCode.PARAM_INVALID, msg));
    }

    /** 处理请求体无法解析异常：JSON 格式错误 / 类型不匹配 → HTTP 400，code=1001。 */
    @ExceptionHandler(HttpMessageNotReadableException.class)
    @Operation(summary = "请求体无法解析", description = "JSON 格式错误 / 类型不匹配 → HTTP 400,code=1001")
    @ApiResponse(
            responseCode = "400",
            description = "参数错误 Result(code=1001)",
            content = @Content(schema = @Schema(implementation = Result.class)))
    public ResponseEntity<Result<Object>> handleNotReadable(HttpMessageNotReadableException ex) {
        log.warn("[REQ_BODY] not readable");
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Result.error(ResultCode.PARAM_INVALID, "请求体格式错误"));
    }

    /** 兜底处理未知异常：→ HTTP 500，code=1003，msg 不暴露内部细节。 */
    @ExceptionHandler(Exception.class)
    @Operation(summary = "服务器内部错误", description = "兜底 → HTTP 500,code=1003,msg 不暴露内部细节")
    @ApiResponse(
            responseCode = "500",
            description = "内部错误 Result(code=1003)",
            content = @Content(schema = @Schema(implementation = Result.class)))
    public ResponseEntity<Result<Object>> handleAny(Exception ex) {
        log.error("[UNEXPECTED] {}", ex.getClass().getSimpleName(), ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Result.error(ResultCode.INTERNAL_ERROR, "内部错误"));
    }
}
