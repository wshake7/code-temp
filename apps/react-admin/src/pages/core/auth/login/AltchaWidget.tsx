/**
 * ALTCHA PoW widget 的 React 薄封装。
 *
 * - 挂载 challenge 属性指向后端 `/api/altcha/challenge`（URL 形式，widget 自动 fetch）
 * - 监听 `statechange`，verified 时把隐藏字段 payload（Base64）回传
 * - 受控 `value` / `onChange`，可直接作为 antd Form.Item 的子元素
 * - 通过 ref 暴露 `reset()`：登录失败后清空勾选并重新拉取 challenge
 *
 * 用 document.createElement 挂载自定义元素，避免 JSX 自定义元素类型声明与 ref 规则冲突。
 */
import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';

export interface AltchaWidgetProps {
  /** challenge 拉取地址；走 Vite 代理到 mock 的 /api/altcha/challenge */
  challenge?: string;
  /** 当前 payload 值（Base64），由 Form.Item 注入 */
  value?: string;
  /** payload 变更回调 */
  onChange?: (value: string) => void;
  /** 语言 */
  language?: string;
}

/** 父组件可调用的 imperative API */
export interface AltchaWidgetHandle {
  /** 重置为未验证：清空 payload，widget 重新拉取 challenge */
  reset: () => void;
}

// Web Component 由 `import 'altcha'` 注册，此处只用 DOM API 交互。
type AltchaState =
  | 'code'
  | 'error'
  | 'expired'
  | 'unverified'
  | 'verified'
  | 'verifying';

/** altcha-widget 自定义元素上可用的 reset 方法 */
type AltchaWidgetElement = HTMLElement & {
  reset?: (newState?: string, err?: string | null) => void;
};

const DEFAULT_CHALLENGE_URL = '/api/altcha/challenge';

export const AltchaWidget = forwardRef<AltchaWidgetHandle, AltchaWidgetProps>(
  function AltchaWidget(
    {
      challenge = DEFAULT_CHALLENGE_URL,
      value,
      onChange,
      language = 'zh',
    },
    ref,
  ) {
    const hostRef = useRef<HTMLDivElement>(null);
    const widgetRef = useRef<AltchaWidgetElement | null>(null);
    const onChangeRef = useRef(onChange);
    const valueRef = useRef(value);

    useEffect(() => {
      onChangeRef.current = onChange;
      valueRef.current = value;
    }, [onChange, value]);

    useImperativeHandle(
      ref,
      () => ({
        reset: () => {
          // 先清表单字段，再 reset widget（会触发 statechange → unverified）
          onChangeRef.current?.('');
          widgetRef.current?.reset?.('unverified');
        },
      }),
      [],
    );

    useEffect(() => {
      const host = hostRef.current;
      if (!host) return;

      const widget = document.createElement('altcha-widget') as AltchaWidgetElement;
      widget.setAttribute('challenge', challenge);
      widget.setAttribute('language', language);
      widget.setAttribute('name', 'altcha');
      // hideLogo/hideFooter 不是 HTML 属性，需走 configuration JSON
      // @see altcha create_custom_element props: configuration only
      widget.setAttribute(
        'configuration',
        JSON.stringify({ hideLogo: true, hideFooter: true }),
      );

      const handleStateChange = (ev: Event) => {
        const detail = (ev as CustomEvent<{ payload?: string; state: AltchaState }>).detail;
        // widget 在 verified 状态会把 Base64 payload 写入隐藏 input；从 DOM 取更稳
        const payload =
          detail?.payload ??
          (widget.querySelector('input[type="hidden"]') as HTMLInputElement | null)?.value ??
          '';
        if (detail?.state === 'verified' && payload) {
          onChangeRef.current?.(payload);
        } else if (detail?.state !== 'verified' && valueRef.current !== '') {
          // 重新校验或失败时清空，防止提交旧 payload
          onChangeRef.current?.('');
        }
      };

      widget.addEventListener('statechange', handleStateChange);
      host.append(widget);
      widgetRef.current = widget;

      return () => {
        widget.removeEventListener('statechange', handleStateChange);
        widget.remove();
        widgetRef.current = null;
      };
    }, [challenge, language]);

    // 与上方密码/账号输入框同宽对齐；覆盖 ALTCHA 默认 max-width: 320px
    return (
      <div
        ref={hostRef}
        className="altcha-widget-host w-full"
        style={{ ['--altcha-max-width' as string]: '100%' }}
      />
    );
  },
);

export default AltchaWidget;
