package com.wshake.infra.config;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.stream.Collectors;
import javax.sql.DataSource;
import lombok.RequiredArgsConstructor;
import org.casbin.adapter.JDBCAdapter;
import org.casbin.jcasbin.main.Enforcer;
import org.casbin.jcasbin.model.Model;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;

/**
 * jcasbin Enforcer 配置。
 *
 * <p>使用 JDBC Adapter 连接 MySQL {@code casbin_rule} 表，model 从 classpath 加载。
 * 表结构由 Flyway V1 迁移创建，adapter 不自动建表（{@code autoCreateTable=false}）。
 *
 * <p>配置项见 {@link CasbinProperties}（{@code casbin.*} 前缀）。
 *
 * <p>Model 采用 ACL 模型（{@code r = sub, obj, act}），无角色继承。后续如需 RBAC，
 * 可在 model.conf 中加 {@code [role_definition]} 和 {@code g} policy。
 *
 * @author wshake
 */
@Configuration
@RequiredArgsConstructor
public class CasbinConfig {

    private final CasbinProperties casbinProperties;

    /**
     * 创建 jcasbin Enforcer Bean。
     *
     * @param dataSource Spring 管理的 DataSource（HikariCP）
     * @return 已加载 policy 的 Enforcer
     */
    @Bean
    public Enforcer enforcer(DataSource dataSource) {
        try {
            String modelText = loadClasspathResource(casbinProperties.getModel());
            Model model = new Model();
            model.loadModelFromText(modelText);

            // JDBCAdapter(DataSource, removePolicyFailed, tableName, autoCreateTable)
            JDBCAdapter adapter = new JDBCAdapter(
                    dataSource,
                    casbinProperties.isRemovePolicyFailed(),
                    casbinProperties.getTableName(),
                    casbinProperties.isAutoCreateTable());
            Enforcer enforcer = new Enforcer(model, adapter);
            enforcer.loadPolicy();
            return enforcer;
        } catch (Exception e) {
            throw new IllegalStateException("初始化 jcasbin Enforcer 失败: " + e.getMessage(), e);
        }
    }

    /**
     * 从 classpath 读取文件内容为字符串。
     *
     * @param path classpath 路径
     * @return 文件内容
     * @throws Exception 读取失败
     */
    private static String loadClasspathResource(String path) throws Exception {
        try (InputStream is = new ClassPathResource(path).getInputStream();
                BufferedReader reader = new BufferedReader(new InputStreamReader(is, StandardCharsets.UTF_8))) {
            return reader.lines().collect(Collectors.joining("\n"));
        }
    }
}
