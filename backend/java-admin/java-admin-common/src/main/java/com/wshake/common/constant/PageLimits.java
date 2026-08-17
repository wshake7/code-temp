package com.wshake.common.constant;

/**
 * 列表分页默认值与上限（各 ManageModels 共用）。
 *
 * @author wshake
 */
public final class PageLimits {

    public static final int DEFAULT_PAGE = 1;
    public static final int DEFAULT_SIZE = 20;
    public static final int MAX_SIZE = 200;

    private PageLimits() {}

    /** {@code null} 或 &lt; 1 时回落到 {@link #DEFAULT_PAGE}。 */
    public static int page(Integer page) {
        return page == null || page < DEFAULT_PAGE ? DEFAULT_PAGE : page;
    }

    /** {@code null} 或 &lt; 1 时回落到 {@link #DEFAULT_SIZE}，并截到 {@link #MAX_SIZE}。 */
    public static int size(Integer pageSize) {
        return pageSize == null || pageSize < 1 ? DEFAULT_SIZE : Math.min(pageSize, MAX_SIZE);
    }
}
