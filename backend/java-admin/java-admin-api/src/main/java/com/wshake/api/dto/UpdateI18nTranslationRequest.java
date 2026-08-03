package com.wshake.api.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * 更新翻译请求；字段 null 表示不改。
 *
 * @author wshake
 */
@Data
@Schema(description = "更新 i18n 翻译")
public class UpdateI18nTranslationRequest {

    @Size(max = 255)
    private String translationKey;

    private String value;

    @Size(max = 512)
    private String remark;

    private Integer isEnabled;
}
