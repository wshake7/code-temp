package com.wshake.service.user;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.wshake.common.exception.AuthException;
import com.wshake.service.entity.SysUser;
import com.wshake.service.repository.SysUserRepository;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

/**
 * {@link AuthService} 单元测试。
 *
 * <p>用 Mockito 隔离 {@link SysUserRepository}，不连真实 DB。
 *
 * @author wshake
 */
@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private SysUserRepository sysUserRepository;

    @InjectMocks
    private AuthService authService;

    @Test
    void login_withCorrectCredentials_returnsUser() {
        SysUser userWithValidHash = fixture("root", cn.dev33.satoken.secure.BCrypt.hashpw("123456"), "Root", 1);
        when(sysUserRepository.findByUsername("root")).thenReturn(userWithValidHash);

        SysUser result = authService.login("root", "123456");

        assertThat(result).isNotNull();
        assertThat(result.getUsername()).isEqualTo("root");
        verify(sysUserRepository).findByUsername("root");
    }

    @Test
    void login_withWrongPassword_throwsAuthInvalidCredentials() {
        SysUser user = fixture("root", cn.dev33.satoken.secure.BCrypt.hashpw("123456"), "Root", 1);
        when(sysUserRepository.findByUsername("root")).thenReturn(user);

        assertThatThrownBy(() -> authService.login("root", "wrong"))
                .isInstanceOf(AuthException.class)
                .extracting("code")
                .isEqualTo(2002);
    }

    @Test
    void login_userNotFound_throwsAuthInvalidCredentials() {
        when(sysUserRepository.findByUsername("nobody")).thenReturn(null);

        assertThatThrownBy(() -> authService.login("nobody", "any"))
                .isInstanceOf(AuthException.class)
                .extracting("code")
                .isEqualTo(2002);

        verify(sysUserRepository).findByUsername("nobody");
    }

    @Test
    void login_userDisabled_throwsAuthForbidden() {
        SysUser disabled = fixture("root", cn.dev33.satoken.secure.BCrypt.hashpw("123456"), "Root", 0);
        when(sysUserRepository.findByUsername("root")).thenReturn(disabled);

        assertThatThrownBy(() -> authService.login("root", "123456"))
                .isInstanceOf(AuthException.class)
                .extracting("code")
                .isEqualTo(2004);
    }

    @Test
    void login_blankUsername_throwsAuthInvalidCredentialsWithoutRepoCall() {
        assertThatThrownBy(() -> authService.login("", "any"))
                .isInstanceOf(AuthException.class)
                .extracting("code")
                .isEqualTo(2002);

        verify(sysUserRepository, never()).findByUsername(any());
    }

    @Test
    void login_blankPassword_throwsAuthInvalidCredentialsWithoutRepoCall() {
        assertThatThrownBy(() -> authService.login("root", ""))
                .isInstanceOf(AuthException.class)
                .extracting("code")
                .isEqualTo(2002);

        verify(sysUserRepository, never()).findByUsername(any());
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
