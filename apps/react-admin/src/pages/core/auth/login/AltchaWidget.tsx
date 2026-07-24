/**
 * ALTCHA PoW widget 的 React 薄封装。
 *
 * - 挂载 challenge 属性指向后端 `/api/altcha/challenge`（URL 形式，widget 自动 fetch）
 * - 监听 `statechange`，verified 时把隐藏字段 payload（Base64）回传
 * - 受控 `value` / `onChange`，可直接作为 antd Form.Item 的子元素
 *
 * 用 document.createElement 挂载自定义元素，避免 JSX 自定义元素类型声明与 ref 规则冲突。
 */
import { useEffect, useRef } from 'react';

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

// Web Component 由 `import 'altcha'` 注册，此处只用 DOM API 交互。
type AltchaState =
  | 'code'
  | 'error'
  | 'expired'
  | 'unverified'
  | 'verified'
  | 'verifying';

const DEFAULT_CHALLENGE_URL = '/api/altcha/challenge';

export function AltchaWidget({
  challenge = DEFAULT_CHALLENGE_URL,
  value,
  onChange,
  language = 'zh',
}: AltchaWidgetProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const onChangeRef = useRef(onChange);
  const valueRef = useRef(value);

  useEffect(() => {
    onChangeRef.current = onChange;
    valueRef.current = value;
  }, [onChange, value]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const widget = document.createElement('altcha-widget');
    widget.setAttribute('challenge', challenge);
    widget.setAttribute('language', language);
    widget.setAttribute('name', 'altcha');

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

    return () => {
      widget.removeEventListener('statechange', handleStateChange);
      widget.remove();
    };
  }, [challenge, language]);

  return <div ref={hostRef} className="w-full" />;
}

export default AltchaWidget;
