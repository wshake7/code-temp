package com.wshake.common.constant;

/**
 * 请求安全协议相关 HTTP 头常量。
 *
 * @author wshake
 */
public final class SecurityHeaders {

    public static final String REQUEST_TIMESTAMP = "X-Request-Timestamp";
    /** 兼容旧客户端头。 */
    public static final String TIMESTAMP_LEGACY = "X-Timestamp";

    public static final String REQUEST_ID = "X-Request-ID";
    public static final String REQUEST_ENCRYPTED_KEY = "X-Request-Encrypted-Key";
    public static final String REQUEST_SIGNATURE = "X-Request-Signature";
    /** 兼容旧客户端头。 */
    public static final String SIGN_LEGACY = "X-Sign";

    public static final String RESPONSE_IS_ENCRYPT = "X-Response-Is-Encrypt";
    public static final String LANGUAGE = "X-Language";

    private SecurityHeaders() {}
}
