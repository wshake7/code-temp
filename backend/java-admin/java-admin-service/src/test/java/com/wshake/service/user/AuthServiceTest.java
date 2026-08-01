package com.wshake.service.user;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.wshake.common.exception.AuthException;
import com.wshake.service.auth.AltchaService;
import com.wshake.service.auth.LoginClientMeta;
import com.wshake.service.auth.LoginResult;
import com.wshake.service.entity.SysLoginLog;
import com.wshake.service.entity.SysUser;
import com.wshake.service.repository.AuthQueryRepository;
import com.wshake.service.repository.SysLoginLogRepository;
import com.wshake.service.repository.SysUserRepository;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.ArgumentMatchers;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

/**
 * {@link AuthService} 单元测试。
 *
 * <p>隔离 Repository / AltchaService，不连真实 DB。
 *
 * @author wshake
 */
@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class AuthServiceTest {

    @Mock
    private SysUserRepository sysUserRepository;

    @Mock
    private SysLoginLogRepository sysLoginLogRepository;

    @Mock
    private AuthQueryRepository authQueryRepository;

    @Mock
    private AltchaService altchaService;

    @InjectMocks
    private AuthService authService;

    private final LoginClientMeta meta = new LoginClientMeta("127.0.0.1", "JUnit");

    /** V2__schema_seed.sql 中 root 的 jBCrypt $2a$ 哈希（明文 123456）；复用线上格式验证跨实现兼容。 */
    private static final String SEED_HASH_123456 = "$2a$10$mzKVO0J.OxnOhHBO8AgBset0LzVRTLv285BJzaTfxpps1Jx7hrXom";

    @BeforeEach
    void altchaPassByDefault() {
        when(altchaService.verify(ArgumentMatchers.anyString())).thenReturn(true);
    }

    @Test
    void login_withCorrectCredentials_returnsUserAndRoles() {
        SysUser user = fixture("root", SEED_HASH_123456, "Root", 1);
        when(sysUserRepository.findByUsername("root")).thenReturn(user);
        when(authQueryRepository.findRoleCodesByUserId(1L)).thenReturn(List.of("super_admin"));

        LoginResult result = authService.login("root", "123456", "valid-altcha", meta);

        assertThat(result.user().getUsername()).isEqualTo("root");
        assertThat(result.roles()).containsExactly("super_admin");
        assertThat(result.homePath()).isEqualTo("/analytics");

        ArgumentCaptor<SysLoginLog> logCaptor = ArgumentCaptor.forClass(SysLoginLog.class);
        verify(sysLoginLogRepository).insert(logCaptor.capture());
        assertThat(logCaptor.getValue().getSuccess()).isEqualTo(1);
        assertThat(logCaptor.getValue().getStatusCode()).isEqualTo(200);
        assertThat(logCaptor.getValue().getSysUserId()).isEqualTo(1L);
        assertThat(logCaptor.getValue().getLoginIp()).isEqualTo("127.0.0.1");
    }

    @Test
    void login_altchaFailed_throwsForbiddenAndWritesLog() {
        when(altchaService.verify("bad")).thenReturn(false);

        assertThatThrownBy(() -> authService.login("root", "123456", "bad", meta))
                .isInstanceOf(AuthException.class)
                .extracting("code")
                .isEqualTo(2004);

        verify(sysUserRepository, never()).findByUsername(ArgumentMatchers.any());
        verify(sysLoginLogRepository)
                .insert(ArgumentMatchers.argThat(log -> log.getSuccess() == 0
                        && log.getStatusCode() == 403
                        && log.getReason().contains("ALTCHA")));
    }

    @Test
    void login_withWrongPassword_throwsAuthInvalidCredentialsAndWritesLog() {
        SysUser user = fixture("root", SEED_HASH_123456, "Root", 1);
        when(sysUserRepository.findByUsername("root")).thenReturn(user);

        assertThatThrownBy(() -> authService.login("root", "wrong", "ok", meta))
                .isInstanceOf(AuthException.class)
                .extracting("code")
                .isEqualTo(2002);

        verify(sysLoginLogRepository).insert(ArgumentMatchers.argThat(log -> log.getSuccess() == 0 && log.getStatusCode() == 401));
    }

    @Test
    void login_userNotFound_throwsAuthInvalidCredentials() {
        when(sysUserRepository.findByUsername("nobody")).thenReturn(null);

        assertThatThrownBy(() -> authService.login("nobody", "any", "ok", meta))
                .isInstanceOf(AuthException.class)
                .extracting("code")
                .isEqualTo(2002);

        verify(sysLoginLogRepository).insert(ArgumentMatchers.any(SysLoginLog.class));
    }

    @Test
    void login_userDisabled_throwsAuthForbidden() {
        SysUser disabled = fixture("root", SEED_HASH_123456, "Root", 0);
        when(sysUserRepository.findByUsername("root")).thenReturn(disabled);

        assertThatThrownBy(() -> authService.login("root", "123456", "ok", meta))
                .isInstanceOf(AuthException.class)
                .extracting("code")
                .isEqualTo(2004);

        verify(sysLoginLogRepository).insert(ArgumentMatchers.argThat(log -> log.getSuccess() == 0 && log.getStatusCode() == 403));
    }

    @Test
    void login_blankUsername_throwsAuthInvalidCredentialsWithoutRepoCall() {
        assertThatThrownBy(() -> authService.login("", "any", "ok", meta))
                .isInstanceOf(AuthException.class)
                .extracting("code")
                .isEqualTo(2002);

        verify(sysUserRepository, never()).findByUsername(ArgumentMatchers.any());
    }

    @Test
    void login_blankPassword_throwsAuthInvalidCredentialsWithoutRepoCall() {
        assertThatThrownBy(() -> authService.login("root", "", "ok", meta))
                .isInstanceOf(AuthException.class)
                .extracting("code")
                .isEqualTo(2002);

        verify(sysUserRepository, never()).findByUsername(ArgumentMatchers.any());
    }

    @Test
    void listAccessCodes_delegatesToRepository() {
        when(authQueryRepository.findAccessCodesByUserId(1L)).thenReturn(List.of("system:user:list"));

        assertThat(authService.listAccessCodes(1L)).containsExactly("system:user:list");
    }

    private static SysUser fixture(String username, String passwordHash, String nickname, int isEnabled) {
        SysUser user = new SysUser();
        user.setId(1L);
        user.setUsername(username);
        user.setPasswordHash(passwordHash);
        user.setNickname(nickname);
        user.setIsEnabled(isEnabled);
        user.setDeletedAt(0L);
        user.setCreatedAt(LocalDateTime.now(ZoneOffset.UTC));
        user.setUpdatedAt(LocalDateTime.now(ZoneOffset.UTC));
        user.setCreatedBy(0L);
        user.setUpdatedBy(0L);
        return user;
    }
}
