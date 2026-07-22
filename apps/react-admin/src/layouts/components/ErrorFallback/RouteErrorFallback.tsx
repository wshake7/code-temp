import { isRouteErrorResponse, useNavigate, useRouteError } from 'react-router-dom';
import { Button, Result } from 'antd';
import { ErrorFallback } from './index';

/**
 * React Router v6 errorElement 专用适配器
 * 自动规范化错误对象并透传给 ErrorFallback；404 走友好页而非默认白屏
 */
export const RouteErrorFallback = () => {
  const routeError = useRouteError();
  const navigate = useNavigate();

  // RR data router 未匹配子路由时抛出的 404 Response
  if (isRouteErrorResponse(routeError)) {
    const status = routeError.status;
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Result
          status={status === 404 ? '404' : 'error'}
          title={status}
          subTitle={routeError.statusText || routeError.data || '页面出错'}
          extra={
            <Button type="primary" onClick={() => navigate('/auth/login', { replace: true })}>
              返回登录
            </Button>
          }
        />
      </div>
    );
  }

  // 规范化错误对象（React Router 可能返回 string/Response/Error）
  const normalizedError =
    routeError instanceof Error
      ? routeError
      : new Error(typeof routeError === 'string' ? routeError : 'Unexpected Application Error');

  return <ErrorFallback error={normalizedError} />;
};

export default RouteErrorFallback;
