package com.wshake.api.vo;

import com.wshake.service.i18n.I18nManageModels.BatchResult;
import io.github.linpeilie.annotations.AutoMapper;
import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * i18n 批量操作结果。
 *
 * @author wshake
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@AutoMapper(target = BatchResult.class)
@Schema(description = "i18n 批量操作结果")
public class I18nBatchResultVO {

    private String action;
    private Integer affected;
    private List<Long> ids;
}
