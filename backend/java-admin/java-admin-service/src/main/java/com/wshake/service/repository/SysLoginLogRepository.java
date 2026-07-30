package com.wshake.service.repository;

import com.easy.query.api.proxy.client.EasyEntityQuery;
import com.wshake.service.entity.SysLoginLog;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

/**
 * 登录日志 Repository（只增）。
 *
 * @author wshake
 */
@Component
@RequiredArgsConstructor
public class SysLoginLogRepository {

    private final EasyEntityQuery easyEntityQuery;

    /**
     * 追加一条登录日志。
     *
     * @param log 日志实体
     */
    public void insert(SysLoginLog log) {
        easyEntityQuery.insertable(log).executeRows();
    }
}
