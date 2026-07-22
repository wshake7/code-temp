import axios from 'axios';

import type { MakeErrorMessageFn, ResponseInterceptorConfig } from './types';
import { getDefaultErrorMsg } from './utils';

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

      // 统一获取错误信息并弹窗
      const msg = getErrorMsg(error);
      makeErrorMessage?.(msg, error);

      return Promise.reject(error);
    },
  };
};
