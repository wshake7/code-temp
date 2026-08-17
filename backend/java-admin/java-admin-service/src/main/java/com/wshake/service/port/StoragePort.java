package com.wshake.service.port;

import java.io.InputStream;
import java.time.Duration;
import java.util.Optional;

/**
 * 对象存储端口（service → infra 的 local / s3 适配）。
 *
 * <p>业务层只依赖本接口，不耦合文件系统或 AWS SDK。对象 key 由调用方传入，适配器负责规范化。
 *
 * @author wshake
 */
public interface StoragePort {

    /**
     * 写入对象（同 key 覆盖）。
     *
     * @param command 写入命令
     * @return 写入后的对象描述
     */
    StoredObject put(PutCommand command);

    /**
     * 打开对象流。调用方负责关闭返回的流。
     *
     * @param key 对象 key
     * @return 对象内容流
     */
    InputStream open(String key);

    /**
     * 删除对象。对象不存在时视为成功。
     *
     * @param key 对象 key
     */
    void delete(String key);

    /**
     * 判断对象是否存在。
     *
     * @param key 对象 key
     * @return 存在则为 true
     */
    boolean exists(String key);

    /**
     * 公开访问 URL（未配置 public-base-url 时为空）。
     *
     * @param key 对象 key
     * @return 可直接访问的 URL
     */
    Optional<String> url(String key);

    /**
     * 预签名 GET URL。local 在配置了 public-base-url 时返回静态 URL。
     *
     * @param key 对象 key
     * @param ttl 有效期；空或非正数时使用适配器默认值
     * @return 预签名或静态 URL
     */
    String presignGet(String key, Duration ttl);

    /**
     * 写入命令。
     *
     * @param key           对象 key
     * @param content       内容流（由调用方关闭）
     * @param contentLength 字节数，必须 &gt;= 0
     * @param contentType   MIME；空则按 application/octet-stream
     */
    record PutCommand(String key, InputStream content, long contentLength, String contentType) {}

    /**
     * 已存储对象的描述。
     *
     * @param key         规范化后的 key
     * @param size        字节数
     * @param contentType MIME
     * @param url         公开 URL，可能为 null
     */
    record StoredObject(String key, long size, String contentType, String url) {}
}
