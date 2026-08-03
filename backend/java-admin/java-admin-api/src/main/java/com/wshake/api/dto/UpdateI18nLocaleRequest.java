package com.wshake.api.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * 更新语言请求；字段 null 表示不改。
 *
 * @author wshake
 */
@Data
@Schema(description = "更新 i18n 语言")
public class UpdateI18nLocaleRequest {

    @Size(max = 16)
    private String code;

    @Size(max = 64)
    private String name;

    private Integer sort;

    @Size(max = 512)
    private String remark;

    private Integer isDefault;

    private Integer isEnabled;
}
