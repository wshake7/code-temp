/**
 * Encrypt / Sign 白名单（客户端跳过 body 加解密），对齐 Java SecurityPathMatcher。
 * 登录 `/api/auth/login` 不在白名单。
 */

const WHITELIST_EXACT = new Set([
  '/api/encrypt/public/key',
  '/encrypt/public/key',
  '/doc.html',
  '/favicon.ico',
  '/error',
]);

const WHITELIST_PREFIX = [
  '/api/altcha/',
  '/altcha/',
  '/doc.html/',
  '/swagger-ui/',
  '/v3/api-docs/',
  '/actuator/',
  '/api/health/',
  '/health/',
];

export function normalizePath(path: string): string {
  if (!path) return '/';
  const q = path.indexOf('?');
  let p = q >= 0 ? path.slice(0, q) : path;
  // 去掉 origin
  if (p.startsWith('http://') || p.startsWith('https://')) {
    try {
      p = new URL(p).pathname;
    } catch {
      // keep
    }
  }
  if (!p.startsWith('/')) p = `/${p}`;
  if (p.length > 1 && p.endsWith('/')) p = p.slice(0, -1);
  return p;
}

/** 将 axios url（可能相对 baseURL）规范为可匹配路径。 */
export function resolveRequestPath(url?: string, baseURL?: string): string {
  if (!url) return '/';
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return normalizePath(url);
  }
  if (url.startsWith('/')) {
    // 若 baseURL 已含 /api，相对路径如 /auth/login → 仍用 url；白名单同时支持带/不带 /api
    return normalizePath(url);
  }
  const base = (baseURL ?? '').replace(/\/$/, '');
  return normalizePath(`${base}/${url}`);
}

export function isSecurityWhitelisted(path: string): boolean {
  const normalized = normalizePath(path);
  if (WHITELIST_EXACT.has(normalized)) return true;

  // 兼容 baseURL=/api 时 url=/encrypt/public/key
  const withApi = normalized.startsWith('/api/') ? normalized : `/api${normalized}`;
  if (WHITELIST_EXACT.has(withApi)) return true;

  const candidates = [normalized, withApi];
  for (const candidate of candidates) {
    if (candidate === '/v3/api-docs' || candidate.startsWith('/v3/api-docs/')) return true;
    if (candidate === '/swagger-ui' || candidate.startsWith('/swagger-ui/')) return true;
    if (candidate === '/api/altcha' || candidate.startsWith('/api/altcha/')) return true;
    if (candidate === '/altcha' || candidate.startsWith('/altcha/')) return true;
    if (candidate === '/api/health' || candidate.startsWith('/api/health/')) return true;
    if (candidate === '/health' || candidate.startsWith('/health/')) return true;
    if (candidate === '/actuator' || candidate.startsWith('/actuator/')) return true;
    for (const prefix of WHITELIST_PREFIX) {
      if (candidate.startsWith(prefix)) return true;
    }
  }
  return false;
}

export function isMultipartContentType(contentType?: string | null): boolean {
  return !!contentType && contentType.toLowerCase().startsWith('multipart/form-data');
}

export function isSsePath(path: string): boolean {
  return normalizePath(path).endsWith('/events');
}
