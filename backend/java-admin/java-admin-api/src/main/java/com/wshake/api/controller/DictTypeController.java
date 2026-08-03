package com.wshake.api.controller;

import com.wshake.api.dto.CreateDictTypeRequest;
import com.wshake.api.dto.DictBatchRequest;
import com.wshake.api.dto.UpdateDictTypeRequest;
import com.wshake.api.vo.DictBatchResultVO;
import com.wshake.api.vo.DictTypeVO;
import com.wshake.common.result.PageData;
import com.wshake.common.result.Result;
import com.wshake.service.dict.DictManageModels.CreateDictTypeCommand;
import com.wshake.service.dict.DictManageModels.DictBatchCommand;
import com.wshake.service.dict.DictManageModels.DictBatchResult;
import com.wshake.service.dict.DictManageModels.DictTypeListQuery;
import com.wshake.service.dict.DictManageModels.DictTypeView;
import com.wshake.service.dict.DictManageModels.UpdateDictTypeCommand;
import com.wshake.service.dict.DictTypeService;
import io.github.linpeilie.Converter;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * 字典类型管理（路径对齐前端 {@code /api/system/dict-type/*}）。
 *
 * @author wshake
 */
@Tag(name = "字典类型", description = "分页/all/CRUD/软删/batch")
@RestController
@RequestMapping("/api/system/dict-type")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
public class DictTypeController {

    private final DictTypeService dictTypeService;
    private final Converter converter;

    @GetMapping("/list")
    @Operation(summary = "分页查询字典类型", description = "data={items,total}；code 单值模糊、多值精确")
    public Result<PageData<DictTypeVO>> list(
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer pageSize,
            @RequestParam(required = false) List<String> code,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) Integer status) {
        PageData<DictTypeView> pageData =
                dictTypeService.page(DictTypeListQuery.of(page, pageSize, code, name, status));
        List<DictTypeVO> items = converter.convert(pageData.getItems(), DictTypeVO.class);
        return Result.ok(PageData.of(items, pageData.getTotal()));
    }

    @GetMapping("/all")
    @Operation(summary = "全量字典类型", description = "支持与 list 相同过滤项")
    public Result<List<DictTypeVO>> all(
            @RequestParam(required = false) List<String> code,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) Integer status) {
        List<DictTypeVO> items =
                converter.convert(dictTypeService.listAll(DictTypeListQuery.allFilter(code, name, status)), DictTypeVO.class);
        return Result.ok(items);
    }

    @GetMapping("/{id}")
    @Operation(summary = "字典类型详情")
    public Result<DictTypeVO> detail(@PathVariable Long id) {
        return Result.ok(converter.convert(dictTypeService.getById(id), DictTypeVO.class));
    }

    @PostMapping
    @Operation(summary = "创建字典类型")
    public Result<DictTypeVO> create(@Valid @RequestBody CreateDictTypeRequest req) {
        CreateDictTypeCommand cmd = converter.convert(req, CreateDictTypeCommand.class);
        return Result.ok(converter.convert(dictTypeService.create(cmd), DictTypeVO.class));
    }

    @PutMapping("/{id}")
    @Operation(summary = "更新字典类型")
    public Result<DictTypeVO> update(@PathVariable Long id, @Valid @RequestBody UpdateDictTypeRequest req) {
        UpdateDictTypeCommand cmd =
                new UpdateDictTypeCommand(id, req.getCode(), req.getName(), req.getRemark(), req.getIsEnabled());
        return Result.ok(converter.convert(dictTypeService.update(cmd), DictTypeVO.class));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "软删字典类型", description = "若仍有字典项则拒绝")
    public Result<DictTypeVO> delete(@PathVariable Long id) {
        return Result.ok(converter.convert(dictTypeService.softDelete(id), DictTypeVO.class));
    }

    @PostMapping("/batch")
    @Operation(summary = "批量 enable|disable|delete")
    public Result<DictBatchResultVO> batch(@RequestBody DictBatchRequest req) {
        DictBatchResult result = dictTypeService.batch(new DictBatchCommand(req.getAction(), req.getIds()));
        return Result.ok(new DictBatchResultVO(result.action(), result.affected(), result.ids()));
    }
}
