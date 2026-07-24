import { useEffect, useMemo, useRef, useState, useTransition } from 'react';
import { Spin, Tabs } from 'antd';
import { useSearchParams } from 'react-router-dom';
import { useAccess } from '@/core/access';
import ContentContainer from '@/layouts/components/PageContainer/ContentContainer';
import Forbidden from '@/pages/core/error/403';
import { ApiLogPanel } from './api-log';
import { LoginLogPanel } from './login-log';

/** Tab 与 URL query、权限码映射 */
const LOG_TAB_DEFS = [
  {
    key: 'login',
    label: '登录日志',
    permissionCode: 'log:login-log:list',
  },
  {
    key: 'api',
    label: 'API 日志',
    permissionCode: 'log:api-log:list',
  },
] as const;

type LogTabKey = (typeof LOG_TAB_DEFS)[number]['key'];

function isLogTabKey(value: string | null): value is LogTabKey {
  return LOG_TAB_DEFS.some((t) => t.key === value);
}

function renderLogTabPanel(key: LogTabKey) {
  if (key === 'login') return <LoginLogPanel />;
  return <ApiLogPanel />;
}

/**
 * 日志审计统一页：侧栏单菜单进入，页顶 Tab 切换登录日志 / API 日志。
 * URL：/log?tab=login|api
 *
 * 体验：已访问 Tab 缓存不销毁；切换时用 Spin 过渡，避免 destroy 重挂载带来的卡顿感。
 */
const LogAuditPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { hasAccessByCodes } = useAccess();
  const [isPending, startTransition] = useTransition();
  const [panelReady, setPanelReady] = useState(true);
  const readyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [visitedTabs, setVisitedTabs] = useState<Set<LogTabKey>>(() => new Set());

  const allowedTabs = useMemo(
    () => LOG_TAB_DEFS.filter((t) => hasAccessByCodes([t.permissionCode])),
    [hasAccessByCodes],
  );

  const allowedKeys = useMemo(() => allowedTabs.map((t) => t.key), [allowedTabs]);

  const requestedTab = searchParams.get('tab');
  const activeKey: LogTabKey | undefined = useMemo(() => {
    if (allowedKeys.length === 0) return undefined;
    if (isLogTabKey(requestedTab) && allowedKeys.includes(requestedTab)) {
      return requestedTab;
    }
    if (allowedKeys.includes('login')) return 'login';
    return allowedKeys[0];
  }, [allowedKeys, requestedTab]);

  // 渲染期合并当前 Tab，避免首帧 children 为空
  const effectiveVisited = useMemo(() => {
    const next = new Set(visitedTabs);
    if (activeKey) next.add(activeKey);
    return next;
  }, [visitedTabs, activeKey]);

  useEffect(() => {
    if (!activeKey) return;
    setVisitedTabs((prev) => {
      if (prev.has(activeKey)) return prev;
      const next = new Set(prev);
      next.add(activeKey);
      return next;
    });
  }, [activeKey]);

  // 校正非法 / 无权限的 tab 参数
  useEffect(() => {
    if (!activeKey) return;
    if (requestedTab === activeKey) return;
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set('tab', activeKey);
        return next;
      },
      { replace: true },
    );
  }, [activeKey, requestedTab, setSearchParams]);

  // 切换 Tab 时短暂 loading
  useEffect(() => {
    if (!activeKey) return;
    if (readyTimerRef.current) {
      clearTimeout(readyTimerRef.current);
      readyTimerRef.current = null;
    }
    setPanelReady(false);
    readyTimerRef.current = setTimeout(() => {
      setPanelReady(true);
      readyTimerRef.current = null;
    }, 120);
    return () => {
      if (readyTimerRef.current) {
        clearTimeout(readyTimerRef.current);
        readyTimerRef.current = null;
      }
    };
  }, [activeKey]);

  const showLoading = isPending || !panelReady;

  const switchTab = (key: string) => {
    if (!isLogTabKey(key) || key === activeKey) return;
    setPanelReady(false);
    setVisitedTabs((prev) => {
      if (prev.has(key)) return prev;
      const next = new Set(prev);
      next.add(key);
      return next;
    });
    startTransition(() => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.set('tab', key);
          return next;
        },
        { replace: true },
      );
    });
  };

  if (allowedTabs.length === 0 || !activeKey) {
    return <Forbidden />;
  }

  return (
    <ContentContainer>
      <Tabs
        activeKey={activeKey}
        onChange={switchTab}
        items={allowedTabs.map((t) => {
          const mounted = effectiveVisited.has(t.key);
          return {
            key: t.key,
            label: t.label,
            // 已访问强制保留 DOM，二次切换不重挂载
            forceRender: mounted,
            children: mounted ? (
              <div style={{ position: 'relative', minHeight: 240 }}>
                {activeKey === t.key && showLoading ? (
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      zIndex: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'var(--ant-color-bg-container, rgba(255,255,255,0.55))',
                    }}
                  >
                    <Spin tip="加载中..." />
                  </div>
                ) : null}
                <div
                  style={{
                    visibility: activeKey === t.key && showLoading ? 'hidden' : 'visible',
                  }}
                >
                  {renderLogTabPanel(t.key)}
                </div>
              </div>
            ) : null,
          };
        })}
      />
    </ContentContainer>
  );
};

export default LogAuditPage;
