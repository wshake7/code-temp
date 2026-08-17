package com.wshake.infra.storage;

import com.wshake.common.exception.BizException;
import com.wshake.common.result.ResultCode;
import java.util.Optional;

/**
 * 存储对象 key 规范化：统一分隔符，拒绝空段与路径穿越。
 *
 * @author wshake
 */
public final class StorageObjectKeys {

    private StorageObjectKeys() {}

    /**
     * 规范化 key。
     *
     * @param key 原始 key
     * @return 不含前导斜杠、使用 {@code /} 分隔的相对 key
     */
    public static String normalize(String key) {
        if (key == null || key.isBlank()) {
            throw BizException.of(ResultCode.PARAM_INVALID, "存储对象 key 不能为空");
        }
        String trimmed = key.trim();
        if (looksAbsolute(trimmed)) {
            throw BizException.of(ResultCode.PARAM_INVALID, "存储对象 key 非法");
        }
        String normalized = trimmed.replace('\\', '/');
        while (normalized.startsWith("/")) {
            normalized = normalized.substring(1);
        }
        if (normalized.isEmpty()) {
            throw BizException.of(ResultCode.PARAM_INVALID, "存储对象 key 不能为空");
        }
        int from = 0;
        while (from <= normalized.length()) {
            int slash = normalized.indexOf('/', from);
            int to = slash < 0 ? normalized.length() : slash;
            String part = normalized.substring(from, to);
            if (part.isEmpty() || ".".equals(part) || "..".equals(part)) {
                throw BizException.of(ResultCode.PARAM_INVALID, "存储对象 key 非法");
            }
            if (slash < 0) {
                break;
            }
            from = slash + 1;
        }
        return normalized;
    }

    private static boolean looksAbsolute(String key) {
        if (key.startsWith("//") || key.startsWith("\\\\")) {
            return true;
        }
        return key.length() >= 2 && Character.isLetter(key.charAt(0)) && key.charAt(1) == ':';
    }

    /**
     * 空 MIME 回退为 {@code application/octet-stream}。
     *
     * @param contentType 原始 MIME
     * @return 非空 MIME
     */
    public static String resolveContentType(String contentType) {
        if (contentType == null || contentType.isBlank()) {
            return "application/octet-stream";
        }
        return contentType;
    }

    /**
     * 拼接公开访问 URL。
     *
     * @param publicBaseUrl 公开前缀，可空
     * @param key           已规范化 key
     * @return 拼接结果；前缀为空则返回空
     */
    public static Optional<String> joinPublicUrl(String publicBaseUrl, String key) {
        if (publicBaseUrl == null || publicBaseUrl.isBlank()) {
            return Optional.empty();
        }
        String base =
                publicBaseUrl.endsWith("/") ? publicBaseUrl.substring(0, publicBaseUrl.length() - 1) : publicBaseUrl;
        return Optional.of(base + "/" + key);
    }
}
