import axios from 'axios';

import type { MakeErrorMessageFn, ResponseInterceptorConfig } from './types';
import { getDefaultErrorMsg } from './utils';

function getRequestUrl(error: {
  config?: { url?: string };
  response?: { config?: { url?: string } };
}): string {
  const url = error?.config?.url ?? error?.response?.config?.url ?? '';
  return typeof url === 'string' ? url : '';
}

/** 登录等未持 token 的鉴权接口：业务 401 不是会话过期，不应 forceLogout / 吞掉错误提示 */
function isUnauthenticatedAuthRequest(error: {
  config?: { url?: string };
  response?: { config?: { url?: string } };
}): boolean {
  return getRequestUrl(error).includes('/auth/login');
}

/** 公开可选接口（如 /public/i18n）失败：不登出、不 toast */
function isPublicOptionalRequest(error: {
  config?: { url?: string };
  response?: { config?: { url?: string } };
}): boolean {
  return getRequestUrl(error).includes('/public/');
}

/**
 * 认证响应拦截器：处理 401 错误，直接重新认证（sa-token 单 token，无前端 refresh）
 * @param doReAuthenticate 重新认证函数，返回 Promise<void>
 * @returns 响应拦截器配置对象
 */
export const authenticateResponseInterceptor = ({
  doReAuthenticate,
}: {
  doReAuthenticate: () => Promise<void>;
}): ResponseInterceptorConfig => {
  return {
    rejected: async (error) => {
      const { response } = error;

      // 不是 401 → 直接抛错，交给错误拦截器处理
      if (response?.status !== 401) {
        throw error;
      }

      // 登录失败 / 公开可选接口 401：只交给错误消息拦截器，不触发登出
      if (isUnauthenticatedAuthRequest(error) || isPublicOptionalRequest(error)) {
        throw error;
      }

      // 单 token：会话失效即 forceLogout / 重新登录，不做 refresh 队列
      await doReAuthenticate();
      throw Object.assign(error, {
        __handledByAuthInterceptor: true,
      });
    },
  };
};

/**
 * 错误消息拦截器：提取错误文本并回调
 * @param makeErrorMessage 错误消息回调函数
 * @param getErrorMsg 获取错误消息函数，默认为 getDefaultErrorMsg
 * @returns 响应拦截器配置对象
 */
export const errorMessageResponseInterceptor = (
  makeErrorMessage?: MakeErrorMessageFn,
  getErrorMsg: (error: unknown) => string = getDefaultErrorMsg,
): ResponseInterceptorConfig => {
  return {
    rejected: (error: unknown) => {
      // 取消请求不处理
      if (axios.isCancel(error)) {
        return Promise.reject(error);
      }

      // 已由认证拦截器处理的错误，不弹窗
      if (error && typeof error === 'object' && '__handledByAuthInterceptor' in error) {
        return Promise.reject(error);
      }

      // 公开可选接口静默失败（本地 i18n 已兜底）
      if (
        error &&
        typeof error === 'object' &&
        isPublicOptionalRequest(error as { config?: { url?: string } })
      ) {
        return Promise.reject(error);
      }

      // 统一获取错误信息并弹窗
      const msg = getErrorMsg(error);
      makeErrorMessage?.(msg, error);

      return Promise.reject(error);
    },
  };
};
