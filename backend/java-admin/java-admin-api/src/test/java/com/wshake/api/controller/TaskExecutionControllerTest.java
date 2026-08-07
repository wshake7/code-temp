package com.wshake.api.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.wshake.api.vo.TaskExecutionVO;
import com.wshake.common.result.PageData;
import com.wshake.common.result.Result;
import com.wshake.service.task.TaskExecutionService;
import com.wshake.service.task.TaskManageModels.TaskExecutionListQuery;
import com.wshake.service.task.TaskManageModels.TaskExecutionView;
import io.github.linpeilie.Converter;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentMatchers;

/**
 * {@link TaskExecutionController} 契约测试。
 */
class TaskExecutionControllerTest {

    private final TaskExecutionService taskExecutionService = mock(TaskExecutionService.class);
    private final Converter converter = new Converter();
    private final TaskExecutionController controller = new TaskExecutionController(taskExecutionService, converter);

    @Test
    void list_returnsItemsTotal() {
        when(taskExecutionService.page(ArgumentMatchers.any(TaskExecutionListQuery.class)))
                .thenReturn(PageData.of(List.of(sample(1L, 1L, "名称")), 1L));

        Result<PageData<TaskExecutionVO>> result = controller.list(1, 20, null, null, null, null, null);

        assertThat(result.getCode()).isEqualTo(0);
        assertThat(result.getData().getTotal()).isEqualTo(1L);
        assertThat(result.getData().getItems().get(0).getConfigName()).isEqualTo("名称");
    }

    @Test
    void detail_returnsRow() {
        when(taskExecutionService.getById(5L)).thenReturn(sample(5L, 2L, null));

        Result<TaskExecutionVO> result = controller.detail(5L);

        assertThat(result.getData().getId()).isEqualTo(5L);
        assertThat(result.getData().getConfigName()).isNull();
    }

    private static TaskExecutionView sample(Long id, Long configId, String configName) {
        LocalDateTime now = LocalDateTime.of(2026, 6, 20, 2, 0);
        return new TaskExecutionView(
                id,
                configId,
                configName,
                "wf-1",
                "run-1",
                "LogCountTickWorkflow",
                "demo",
                "COMPLETED",
                now,
                now.plusMinutes(8),
                Map.of("date", "2026-06-20"),
                Map.of("rows", 1280),
                null,
                0,
                now);
    }
}
