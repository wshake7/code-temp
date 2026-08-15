package com.wshake.service.auth;

import com.wshake.common.exception.AuthException;
import com.wshake.common.result.ResultCode;
import com.wshake.service.blacklist.BlacklistService;
import com.wshake.service.blacklist.BlacklistService.BlacklistHit;
import com.wshake.service.entity.SysUser;
import com.wshake.service.repository.AuthQueryRepository;
import com.wshake.service.repository.SysUserRepository;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

/**
 * 鉴权 Service。
 *
 * <p>登录：ALTCHA → 用户名密码（BCrypt）→ SYS_USER 黑名单（scope 覆盖 LOGIN）→ 写登录日志 → 返回用户与角色摘要。
 * Sa-Token 登录态由 Controller 写入（本类在返回前完成 SYS_USER 拦截，保证发 token 前拒绝）。
 * 登录日志经 {@link LoginLogger} 异步落库。
 *
 * @author wshake
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private static final String DEFAULT_HOME_PATH = "/analytics";

    /** 默认 cost=10；兼容校验 jBCrypt 生成的 $2a$ 哈希（见 V2__schema_seed.sql）。 */
    private static final BCryptPasswordEncoder PASSWORD_ENCODER = new BCryptPasswordEncoder();

    private final SysUserRepository sysUserRepository;
    private final AuthQueryRepository authQueryRepository;
    private final AltchaService altchaService;
    private final LoginLogger loginLogger;
    private final BlacklistService blacklistService;

    /**
     * 登录校验（含 ALTCHA 与登录日志）。
     *
     * @param username   用户名
     * @param password   明文密码
     * @param altcha     ALTCHA Base64 payload
     * @param clientMeta 客户端 IP / UA
     * @return 登录业务结果
     * @throws AuthException 校验失败
     */
    public LoginResult login(String username, String password, String altcha, LoginClientMeta clientMeta) {
        LoginClientMeta meta = clientMeta == null ? LoginClientMeta.empty() : clientMeta;
        String safeUsername = username == null ? "" : username.trim();

        verifyAltcha(altcha, safeUsername, meta);
        requireCredentials(safeUsername, password, meta);
        SysUser user = requireActiveUser(safeUsername, meta);
        verifyPassword(password, user, safeUsername, meta);
        rejectIfUserBlacklisted(user, safeUsername, meta);

        List<String> roles = authQueryRepository.findRoleCodesByUserId(user.getId());
        loginLogger.recordPwdLogin(safeUsername, user.getId(), 200, true, "", meta);
        log.info("[AUTH] login success userId={} username={}", user.getId(), safeUsername);
        return new LoginResult(user, roles, DEFAULT_HOME_PATH);
    }

    /**
     * 当前用户的按钮权限码列表。
     */
    public List<String> listAccessCodes(Long userId) {
        if (userId == null) {
            return List.of();
        }
        return authQueryRepository.findAccessCodesByUserId(userId);
    }

    /**
     * 当前用户角色编码列表。
     */
    public List<String> listRoleCodes(Long userId) {
        if (userId == null) {
            return List.of();
        }
        return authQueryRepository.findRoleCodesByUserId(userId);
    }

    /**
     * 组装对外用户摘要（info / 登录响应共用字段）。
     */
    public LoginResult toUserSummary(SysUser user) {
        List<String> roles = listRoleCodes(user.getId());
        return new LoginResult(user, roles, DEFAULT_HOME_PATH);
    }

    private void verifyAltcha(String altcha, String username, LoginClientMeta meta) {
        if (!altchaService.verify(altcha)) {
            loginLogger.recordPwdLogin(username, null, 403, false, "ALTCHA verification failed", meta);
            throw new AuthException(ResultCode.AUTH_FORBIDDEN, "ALTCHA 校验失败");
        }
    }

    private void requireCredentials(String username, String password, LoginClientMeta meta) {
        if (username.isBlank() || password == null || password.isBlank()) {
            loginLogger.recordPwdLogin(username, null, 400, false, "Username and password are required", meta);
            throw AuthException.invalidCredentials();
        }
    }

    private SysUser requireActiveUser(String username, LoginClientMeta meta) {
        SysUser user = sysUserRepository.findByUsername(username);
        if (user == null) {
            log.warn("[AUTH] login failed username={} reason=USER_NOT_FOUND", username);
            loginLogger.recordPwdLogin(username, null, 401, false, "Username or password is incorrect", meta);
            throw AuthException.invalidCredentials();
        }
        if (user.getIsEnabled() == null || user.getIsEnabled() != 1) {
            log.warn("[AUTH] login failed username={} reason=USER_DISABLED", username);
            loginLogger.recordPwdLogin(username, user.getId(), 403, false, "User disabled", meta);
            throw new AuthException(ResultCode.AUTH_FORBIDDEN, "账号已禁用");
        }
        if (user.isAccountExpired(null)) {
            log.warn("[AUTH] login failed username={} reason=ACCOUNT_EXPIRED", username);
            loginLogger.recordPwdLogin(username, user.getId(), 403, false, "Account expired", meta);
            throw new AuthException(ResultCode.AUTH_FORBIDDEN, "账号已过期");
        }
        return user;
    }

    /**
     * 已登录请求侧校验：用户存在、启用、未过期。
     *
     * @return 通过时的用户；调用方在拒绝时负责 logout
     * @throws AuthException 禁用 / 过期 / 不存在
     */
    public SysUser requireActiveUserById(Long userId) {
        if (userId == null) {
            throw new AuthException(ResultCode.AUTH_FORBIDDEN, "账号不可用");
        }
        SysUser user = sysUserRepository.findById(userId);
        if (user == null) {
            log.warn("[AUTH] request rejected userId={} reason=USER_NOT_FOUND", userId);
            throw new AuthException(ResultCode.AUTH_FORBIDDEN, "账号不可用");
        }
        if (user.getIsEnabled() == null || user.getIsEnabled() != 1) {
            log.warn("[AUTH] request rejected userId={} reason=USER_DISABLED", userId);
            throw new AuthException(ResultCode.AUTH_FORBIDDEN, "账号已禁用");
        }
        if (user.isAccountExpired(null)) {
            log.warn("[AUTH] request rejected userId={} reason=ACCOUNT_EXPIRED", userId);
            throw new AuthException(ResultCode.AUTH_FORBIDDEN, "账号已过期");
        }
        return user;
    }

    private void verifyPassword(String password, SysUser user, String username, LoginClientMeta meta) {
        if (!PASSWORD_ENCODER.matches(password, user.getPasswordHash())) {
            log.warn("[AUTH] login failed username={} reason=BAD_PASSWORD", username);
            loginLogger.recordPwdLogin(username, user.getId(), 401, false, "Username or password is incorrect", meta);
            throw AuthException.invalidCredentials();
        }
    }

    /**
     * 用户解析成功且密码正确后、发 token 前：查 SYS_USER 黑名单（scope 覆盖 LOGIN）。
     *
     * <p>Filter 不解析登录 body，故 SYS_USER 拦截落在本链路；IP 由 BlacklistFilter 在 LOGIN 场景处理。
     */
    private void rejectIfUserBlacklisted(SysUser user, String username, LoginClientMeta meta) {
        Optional<BlacklistHit> hit =
                blacklistService.findBlockingHit("SYS_USER", String.valueOf(user.getId()), "LOGIN", null);
        if (hit.isEmpty()) {
            return;
        }
        BlacklistHit h = hit.get();
        log.warn(
                "[AUTH] login Access Blocked username={} userId={} blacklistScope={} reason={}",
                username,
                user.getId(),
                h.scope(),
                h.reason());
        loginLogger.recordPwdLogin(username, user.getId(), 403, false, "Access blocked", meta);
        throw AuthException.accessBlocked();
    }
}
