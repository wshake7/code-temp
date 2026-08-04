package com.wshake.infra.temporal.workflow;

import io.temporal.activity.ActivityInterface;
import io.temporal.activity.ActivityMethod;

/**
 * 测试用 Activity：将进程内 count +1 并 log。
 *
 * @author wshake
 */
@ActivityInterface
public interface LogCountTickActivities {

    /**
     * 计数 +1 并输出日志。
     *
     * @return 自增后的 count
     */
    @ActivityMethod
    long incrementAndLog();
}
