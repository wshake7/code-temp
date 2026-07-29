package com.wshake.infra.config;

import com.easy.query.core.basic.extension.interceptor.EntityInterceptor;
import com.easy.query.core.basic.extension.interceptor.UpdateSetInterceptor;
import com.easy.query.core.expression.parser.core.base.ColumnSetter;
import com.easy.query.core.expression.segment.index.EntitySegmentComparer;
import com.easy.query.core.expression.sql.builder.EntityInsertExpressionBuilder;
import com.easy.query.core.expression.sql.builder.EntityUpdateExpressionBuilder;
import com.wshake.infra.security.SaTokenConfigure;
import com.wshake.service.entity.BaseEntity;
import java.time.LocalDateTime;
import org.jetbrains.annotations.NotNull;
import org.springframework.stereotype.Component;

/**
 * 审计字段自动填充拦截器。
 *
 * <p>作用于所有继承 {@link BaseEntity} 的实体：
 * <ul>
 *     <li>插入：补齐 {@code createdAt}/{@code updatedAt}/{@code createdBy}/{@code updatedBy}/{@code deletedAt}</li>
 *     <li>实体更新：刷新 {@code updatedAt}/{@code updatedBy}</li>
 *     <li>表达式更新：若 SET 未含上述列则追加</li>
 * </ul>
 *
 * <p>无登录上下文时操作人写 {@code 0}（系统操作，见 db-conventions）。
 *
 * @author wshake
 */
@Component
public class AuditEntityInterceptor implements EntityInterceptor, UpdateSetInterceptor {

    public static final String NAME = "AUDIT_ENTITY_INTERCEPTOR";

    @Override
    public String name() {
        return NAME;
    }

    @Override
    public boolean apply(@NotNull Class<?> entityClass) {
        return BaseEntity.class.isAssignableFrom(entityClass);
    }

    @Override
    public void configureInsert(
            Class<?> entityClass, EntityInsertExpressionBuilder entityInsertExpressionBuilder, Object entity) {
        BaseEntity e = (BaseEntity) entity;
        LocalDateTime now = LocalDateTime.now();
        Long operatorId = currentOperatorId();

        if (e.getDeletedAt() == null) {
            e.setDeletedAt(0L);
        }
        if (e.getCreatedAt() == null) {
            e.setCreatedAt(now);
        }
        if (e.getUpdatedAt() == null) {
            e.setUpdatedAt(now);
        }
        if (e.getCreatedBy() == null) {
            e.setCreatedBy(operatorId);
        }
        if (e.getUpdatedBy() == null) {
            e.setUpdatedBy(operatorId);
        }
    }

    @Override
    public void configureUpdate(
            Class<?> entityClass, EntityUpdateExpressionBuilder entityUpdateExpressionBuilder, Object entity) {
        BaseEntity e = (BaseEntity) entity;
        e.setUpdatedAt(LocalDateTime.now());
        e.setUpdatedBy(currentOperatorId());
    }

    @Override
    public void configure(
            Class<?> entityClass,
            EntityUpdateExpressionBuilder entityUpdateExpressionBuilder,
            ColumnSetter<Object> columnSetter) {
        EntitySegmentComparer updatedAt = new EntitySegmentComparer(entityClass, "updatedAt");
        EntitySegmentComparer updatedBy = new EntitySegmentComparer(entityClass, "updatedBy");
        columnSetter.getSQLBuilderSegment().forEach(segment -> {
            updatedAt.visit(segment);
            updatedBy.visit(segment);
            return updatedAt.isInSegment() && updatedBy.isInSegment();
        });
        if (!updatedAt.isInSegment()) {
            columnSetter.set("updatedAt", LocalDateTime.now());
        }
        if (!updatedBy.isInSegment()) {
            columnSetter.set("updatedBy", currentOperatorId());
        }
    }

    /** 当前操作人；未登录返回 0。 */
    private static Long currentOperatorId() {
        Long userId = SaTokenConfigure.currentUserIdOrNull();
        return userId == null ? 0L : userId;
    }
}
