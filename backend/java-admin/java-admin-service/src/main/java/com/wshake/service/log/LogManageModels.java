package com.wshake.service.log;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.Locale;

/**
 * 登录日志 / API 日志领域模型（service 层，不绑 HTTP 注解）。
 *
 * @author wshake
 */
public final class LogManageModels {

    public static final String SOURCE_HOT = "hot";
    public static final String SOURCE_ARCHIVE = "archive";

    private LogManageModels() {}

    // ---------- login-log ----------

    public record LoginLogListQuery(
            int page,
            int pageSize,
            boolean archive,
            String username,
            Integer success,
            String loginMethod,
            String loginIp,
            LocalDateTime loginTimeFrom,
            LocalDateTime loginTimeTo) {

        public static LoginLogListQuery of(
                Integer page,
                Integer pageSize,
                String source,
                String username,
                Integer success,
                String loginMethod,
                String loginIp,
                String loginTimeFrom,
                String loginTimeTo) {
            return new LoginLogListQuery(
                    normalizePage(page),
                    normalizePageSize(pageSize),
                    isArchive(source),
                    trimToNull(username),
                    success,
                    upperOrNull(loginMethod),
                    trimToNull(loginIp),
                    parseDateTime(loginTimeFrom),
                    parseDateTime(loginTimeTo));
        }
    }

    public record LoginLogView(
            Long id,
            String username,
            Integer success,
            String reason,
            Integer statusCode,
            Long sysUserId,
            String loginMethod,
            LocalDateTime loginTime,
            String loginIp,
            String loginMac,
            String clientId,
            String clientName,
            String userAgent,
            String browserName,
            String browserVersion,
            String osName,
            String osVersion,
            String location,
            LocalDateTime createdAt,
            LocalDateTime archivedAt) {}

    // ---------- api-log ----------

    public record ApiLogListQuery(
            int page,
            int pageSize,
            boolean archive,
            String method,
            String module,
            String path,
            Integer success,
            Integer statusCode,
            String username,
            String clientIp,
            String requestId,
            LocalDateTime createdAtFrom,
            LocalDateTime createdAtTo) {

        public static ApiLogListQuery of(
                Integer page,
                Integer pageSize,
                String source,
                String method,
                String module,
                String path,
                Integer success,
                Integer statusCode,
                String username,
                String clientIp,
                String requestId,
                String createdAtFrom,
                String createdAtTo) {
            return new ApiLogListQuery(
                    normalizePage(page),
                    normalizePageSize(pageSize),
                    isArchive(source),
                    upperOrNull(method),
                    trimToNull(module),
                    trimToNull(path),
                    success,
                    statusCode,
                    trimToNull(username),
                    trimToNull(clientIp),
                    trimToNull(requestId),
                    parseDateTime(createdAtFrom),
                    parseDateTime(createdAtTo));
        }
    }

    public record ApiLogView(
            Long id,
            String method,
            String module,
            String path,
            Integer statusCode,
            Integer success,
            String reason,
            Long costTime,
            String requestId,
            Long sysUserId,
            String username,
            String requestUri,
            String requestQuery,
            String requestBody,
            String requestHeader,
            String referer,
            String response,
            String beforeChange,
            String afterChange,
            String formatChange,
            String clientId,
            String clientName,
            String clientIp,
            String userAgent,
            String browserName,
            String browserVersion,
            String osName,
            String osVersion,
            String location,
            LocalDateTime createdAt,
            LocalDateTime archivedAt) {}

    /**
     * 异步写入 API 日志的快照（在请求线程采集，后台线程落库）。
     */
    public record ApiLogWriteCommand(
            String method,
            String path,
            String module,
            Integer statusCode,
            boolean success,
            String reason,
            long costTimeMs,
            String requestId,
            Long sysUserId,
            String username,
            String requestUri,
            String requestQuery,
            String requestBody,
            String requestHeader,
            String referer,
            String response,
            String clientId,
            String clientName,
            String clientIp,
            String userAgent) {}

    static int normalizePage(Integer page) {
        return page == null || page < 1 ? 1 : page;
    }

    static int normalizePageSize(Integer pageSize) {
        return pageSize == null || pageSize < 1 ? 20 : Math.min(pageSize, 200);
    }

    static boolean isArchive(String source) {
        return source != null && SOURCE_ARCHIVE.equalsIgnoreCase(source.trim());
    }

    static String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String t = value.trim();
        return t.isEmpty() ? null : t;
    }

    static String upperOrNull(String value) {
        String t = trimToNull(value);
        return t == null ? null : t.toUpperCase(Locale.ROOT);
    }

    /**
     * 解析查询时间：支持 ISO-8601（含 Z）、{@code yyyy-MM-dd'T'HH:mm:ss}、空格分隔。
     */
    static LocalDateTime parseDateTime(String raw) {
        String value = trimToNull(raw);
        if (value == null) {
            return null;
        }
        try {
            if (value.endsWith("Z") || value.contains("+") || value.matches(".*[+-]\\d{2}:\\d{2}$")) {
                Instant instant = Instant.parse(value);
                return LocalDateTime.ofInstant(instant, ZoneId.systemDefault());
            }
            String normalized = value.contains(" ") && !value.contains("T") ? value.replace(' ', 'T') : value;
            return LocalDateTime.parse(normalized, DateTimeFormatter.ISO_LOCAL_DATE_TIME);
        } catch (DateTimeParseException ex) {
            try {
                return LocalDateTime.parse(value, DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
            } catch (DateTimeParseException ignored) {
                return null;
            }
        }
    }
}
