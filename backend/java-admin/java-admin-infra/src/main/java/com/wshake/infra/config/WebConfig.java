package com.wshake.infra.config;

import cn.dev33.satoken.interceptor.SaInterceptor;
import cn.dev33.satoken.stp.StpUtil;
import com.wshake.infra.security.CasbinInterceptor;
import org.casbin.jcasbin.main.Enforcer;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Web MVC 配置：注册 Sa-Token 拦截器 + jcasbin 鉴权拦截器 + CORS。
 *
 * <p>拦截器顺序：SaInterceptor（认证）→ CasbinInterceptor（授权）。
 * CasbinInterceptor 仅拦截 {@code /api/**}，排除登录接口和文档路径。
 *
 * @author wshake
 */
// final + 无 @Bean 互调：必须用 lite 模式，否则 CGLIB 无法增强 final 类
@Configuration(proxyBeanMethods = false)
public final class WebConfig implements WebMvcConfigurer {

    private final Enforcer casbinEnforcer;

    public WebConfig(Enforcer casbinEnforcer) {
        this.casbinEnforcer = casbinEnforcer;
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        // 1. Sa-Token 认证拦截器：非排除路径强制登录
        registry.addInterceptor(new SaInterceptor(handle -> StpUtil.checkLogin()))
                .addPathPatterns("/api/**")
                .excludePathPatterns("/api/auth/login", "/api/altcha/challenge");

        // 2. jcasbin 授权拦截器（deny-by-default；需先加 policy 才能访问）
        registry.addInterceptor(new CasbinInterceptor(casbinEnforcer))
                .addPathPatterns("/api/**")
                .excludePathPatterns(
                        "/api/auth/login",
                        "/api/altcha/challenge",
                        "/doc.html",
                        "/doc.html/**",
                        "/swagger-ui/**",
                        "/v3/api-docs/**",
                        "/favicon.ico",
                        "/error");
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        // dev 期 CORS 全放开；prod 应收紧
        registry.addMapping("/**")
                .allowedOriginPatterns("*")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }
}
