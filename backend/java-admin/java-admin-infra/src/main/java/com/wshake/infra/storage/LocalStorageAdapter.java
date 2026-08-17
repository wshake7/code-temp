package com.wshake.infra.storage;

import com.wshake.common.exception.BizException;
import com.wshake.common.result.ResultCode;
import com.wshake.service.port.StoragePort;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.time.Duration;
import java.util.Optional;
import lombok.extern.slf4j.Slf4j;

/**
 * {@link StoragePort} 的本地磁盘实现。
 *
 * @author wshake
 */
@Slf4j
public final class LocalStorageAdapter implements StoragePort {

    private final Path baseDir;
    private final String publicBaseUrl;

    /**
     * 根据已校验配置构造本地适配器。
     *
     * @param properties 已校验的存储配置
     */
    public LocalStorageAdapter(StorageProperties properties) {
        this.baseDir =
                Path.of(properties.getLocal().getBasePath()).toAbsolutePath().normalize();
        this.publicBaseUrl = properties.getLocal().getPublicBaseUrl();
    }

    @Override
    public StoredObject put(PutCommand command) {
        if (command == null || command.content() == null) {
            throw BizException.of(ResultCode.PARAM_INVALID, "存储写入内容不能为空");
        }
        if (command.contentLength() < 0) {
            throw BizException.of(ResultCode.PARAM_INVALID, "存储对象长度非法");
        }
        String key = StorageObjectKeys.normalize(command.key());
        String contentType = StorageObjectKeys.resolveContentType(command.contentType());
        Path target = resolvePath(key);
        try {
            Path parent = target.getParent();
            if (parent != null) {
                Files.createDirectories(parent);
            }
            Files.copy(command.content(), target, StandardCopyOption.REPLACE_EXISTING);
            long size = Files.size(target);
            log.info("[STORAGE] local put key={} size={}", key, size);
            return new StoredObject(key, size, contentType, url(key).orElse(null));
        } catch (IOException ex) {
            throw wrapIo("写入本地对象失败", ex);
        }
    }

    @Override
    public InputStream open(String key) {
        Path target = resolvePath(StorageObjectKeys.normalize(key));
        if (!Files.isRegularFile(target)) {
            throw BizException.of(ResultCode.PARAM_INVALID, "存储对象不存在");
        }
        try {
            return Files.newInputStream(target);
        } catch (IOException ex) {
            throw wrapIo("读取本地对象失败", ex);
        }
    }

    @Override
    public void delete(String key) {
        Path target = resolvePath(StorageObjectKeys.normalize(key));
        try {
            Files.deleteIfExists(target);
        } catch (IOException ex) {
            throw wrapIo("删除本地对象失败", ex);
        }
    }

    @Override
    public boolean exists(String key) {
        return Files.isRegularFile(resolvePath(StorageObjectKeys.normalize(key)));
    }

    @Override
    public Optional<String> url(String key) {
        return StorageObjectKeys.joinPublicUrl(publicBaseUrl, StorageObjectKeys.normalize(key));
    }

    @Override
    public String presignGet(String key, Duration ttl) {
        return url(key).orElseThrow(() -> BizException.of(ResultCode.PARAM_INVALID, "本地存储未配置 public-base-url"));
    }

    private Path resolvePath(String key) {
        Path target = baseDir.resolve(key).normalize();
        if (!target.startsWith(baseDir)) {
            throw BizException.of(ResultCode.PARAM_INVALID, "存储对象 key 非法");
        }
        return target;
    }

    private static BizException wrapIo(String message, IOException ex) {
        return new BizException(ResultCode.INTERNAL_ERROR, message + ": " + ex.getMessage());
    }
}
