package com.wshake.service.auth;

import com.wshake.service.entity.SysUser;
import java.util.List;

/**
 * 登录成功业务结果（不含 accessToken；token 由 Controller 经 Sa-Token 签发）。
 *
 * @param user     用户实体
 * @param roles    角色编码列表
 * @param homePath 默认首页
 * @author wshake
 */
public record LoginResult(SysUser user, List<String> roles, String homePath) {}
