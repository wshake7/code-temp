package com.wshake.api.controller;

import com.wshake.api.dto.ApiBatchRequest;
import com.wshake.api.dto.CreateApiRequest;
import com.wshake.api.dto.UpdateApiRequest;
import com.wshake.api.vo.ApiBatchResultVO;
import com.wshake.api.vo.ApiListItemVO;
import com.wshake.api.vo.ApiSyncResultVO;
import com.wshake.common.result.Result;
import com.wshake.common.result.TreePageData;
import com.wshake.service.api.ApiManageModels.ApiBatchResult;
import com.wshake.service.api.ApiManageModels.ApiListPage;
import com.wshake.service.api.ApiManageModels.ApiListQuery;
import com.wshake.service.api.ApiManageModels.ApiSyncResult;
import com.wshake.service.api.ApiManageModels.ApiView;
import com.wshake.service.api.ApiManageModels.CreateApiCommand;
import com.wshake.service.api.ApiManageModels.UpdateApiCommand;
import com.wshake.service.api.SysApiService;
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
 * API 资源管理 Controller（路径对齐前端 {@code /api/system/api/*}）。
 *
 * <p>登录校验由 {@code WebConfig} 的 SaInterceptor 统一完成，本类不再重复 requireLogin。
 *
 * @author wshake
 */
@Tag(name = "API 资源管理", description = "按组分页/CRUD/软删/groups/all/batch/sync")
@RestController
@RequestMapping("/api/system/api")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
public class ApiController {

    private final SysApiService sysApiService;
    private final Converter converter;

    @GetMapping("/list")
    @Operation(summary = "分页查询 API", description = "分页基数为分组；data={items,total,itemTotal}")
    public Result<TreePageData<ApiListItemVO>> list(
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer pageSize,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String path,
            @RequestParam(required = false) String method,
            @RequestParam(required = false) String group,
            @RequestParam(required = false) Integer status) {
        ApiListPage pageData =
                sysApiService.pageApis(ApiListQuery.of(page, pageSize, name, path, method, group, status));
        List<ApiListItemVO> items = converter.convert(pageData.items(), ApiListItemVO.class);
        return Result.ok(TreePageData.of(items, pageData.total(), pageData.itemTotal()));
    }

    @GetMapping("/all")
    @Operation(summary = "全量 API", description = "未软删；供角色/菜单绑定联动")
    public Result<List<ApiListItemVO>> all() {
        List<ApiListItemVO> items = converter.convert(sysApiService.listAll(), ApiListItemVO.class);
        return Result.ok(items);
    }

    @GetMapping("/groups")
    @Operation(summary = "去重分组列表", description = "供分组下拉")
    public Result<List<String>> groups() {
        return Result.ok(sysApiService.listGroups());
    }

    @PostMapping
    @Operation(summary = "创建 API")
    public Result<ApiListItemVO> create(@Valid @RequestBody CreateApiRequest req) {
        CreateApiCommand cmd = converter.convert(req, CreateApiCommand.class);
        ApiView view = sysApiService.create(cmd);
        return Result.ok(converter.convert(view, ApiListItemVO.class));
    }

    @PutMapping("/{id}")
    @Operation(summary = "更新 API")
    public Result<ApiListItemVO> update(@PathVariable Long id, @Valid @RequestBody UpdateApiRequest req) {
        UpdateApiCommand cmd = new UpdateApiCommand(
                id,
                req.getName(),
                req.getMethod(),
                req.getPath(),
                req.getPermissionCode(),
                req.getApiGroup(),
                req.getRemark(),
                req.getIsEnabled());
        return Result.ok(converter.convert(sysApiService.update(cmd), ApiListItemVO.class));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "软删 API", description = "清 menu_api/role_api 后软删")
    public Result<ApiListItemVO> delete(@PathVariable Long id) {
        return Result.ok(converter.convert(sysApiService.softDelete(id), ApiListItemVO.class));
    }

    @PostMapping("/batch")
    @Operation(summary = "批量 enable|disable|delete")
    public Result<ApiBatchResultVO> batch(@RequestBody ApiBatchRequest req) {
        ApiBatchResult result =
                sysApiService.batch(new com.wshake.service.api.ApiManageModels.ApiBatchCommand(
                        req.getAction(), req.getIds()));
        return Result.ok(new ApiBatchResultVO(result.action(), result.affected(), result.ids()));
    }

    @PostMapping("/sync")
    @Operation(summary = "同步路由清单", description = "按内置 manifest upsert；命中 method+path 则 skip")
    public Result<ApiSyncResultVO> sync() {
        ApiSyncResult result = sysApiService.syncFromManifest();
        return Result.ok(new ApiSyncResultVO(result.added(), result.skipped(), result.total()));
    }
}
