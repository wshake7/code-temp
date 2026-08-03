package com.wshake.infra.temporal.workflow;

import io.temporal.activity.ActivityInterface;
import io.temporal.activity.ActivityMethod;
import java.util.Map;

/**
 * Demo Activity：实际「生成日报」侧车逻辑占位。
 *
 * @author wshake
 */
@ActivityInterface
public interface ReportDailyActivities {

    /**
     * 生成日报摘要。
     *
     * @param input workflow 传入的业务 map
     * @return 结果摘要
     */
    @ActivityMethod
    Map<String, Object> generateReport(Map<String, Object> input);
}
