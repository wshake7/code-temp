import type { EventHandlerRequest, H3Event } from "h3";

import type { UserInfo } from "./mock-data";

import { getHeader } from "h3";
import { randomUUID } from "node:crypto";

import { ensureUserSeeds, getMockSysUserList } from "./mock-data";

/** 默认 30 天（秒），对齐 java-admin sa-token.timeout */
const DEFAULT_TIMEOUT_SECONDS = 2592000;

/** java 内省 HTTP 超时（毫秒） */
const DEFAULT_JAVA_INTROSPECT_TIMEOUT_MS = 3000;

interface SessionRecord {
  userId: number;
  username: string;
  expiresAt: number;
  /** 是否由 java Sa-Token 内省登记（hybrid 交叉联调） */
  foreign?: boolean;
}

/** token → 会话 */
const sessions = new Map<string, SessionRecord>();

/** 同一 token 并发内省去重 */
const pendingAdopts = new Map<string, Promise<boolean>>();

function parseBoolEnv(name: string, defaultValue: boolean): boolean {
  const raw = process.env[name];
  if (raw === undefined || raw === "") return defaultValue;
  const v = raw.trim().toLowerCase();
  if (["1", "true", "yes", "on"].includes(v)) return true;
  if (["0", "false", "no", "off"].includes(v)) return false;
  return defaultValue;
}

function parseTimeoutSeconds(): number {
  const raw = process.env.AUTH_TOKEN_TIMEOUT_SECONDS;
  if (raw === undefined || raw === "") return DEFAULT_TIMEOUT_SECONDS;
  const n = Number(raw);
  if (!Number.isFinite(n) || n <= 0) return DEFAULT_TIMEOUT_SECONDS;
  return Math.floor(n);
}

function timeoutMs(): number {
  return parseTimeoutSeconds() * 1000;
}

/**
 * hybrid：向 java 内省 token 的完整 URL（如 http://localhost:4080/api/user/info）。
 * 空字符串 = 关闭内省回落（纯 mock）。
 */
export function getJavaIntrospectUrl(): string {
  const raw = process.env.AUTH_JAVA_INTROSPECT_URL;
  if (raw === undefined) return "http://localhost:4080/api/user/info";
  return raw.trim();
}

/** java 用户名在 mock 中不存在时回落到该 mock 用户（默认 vben，覆盖 java 种子 root） */
export function getJavaUserFallback(): string {
  const raw = process.env.AUTH_JAVA_USER_FALLBACK;
  if (raw === undefined || raw.trim() === "") return "vben";
  return raw.trim();
}

function javaIntrospectTimeoutMs(): number {
  const raw = process.env.AUTH_JAVA_INTROSPECT_TIMEOUT_MS;
  if (raw === undefined || raw === "") return DEFAULT_JAVA_INTROSPECT_TIMEOUT_MS;
  const n = Number(raw);
  if (!Number.isFinite(n) || n <= 0) return DEFAULT_JAVA_INTROSPECT_TIMEOUT_MS;
  return Math.floor(n);
}

/** 是否允许多端登录（默认 true） */
export function isConcurrent(): boolean {
  return parseBoolEnv("AUTH_IS_CONCURRENT", true);
}

/** 同账号是否共享同一 token（默认 false） */
export function isShare(): boolean {
  return parseBoolEnv("AUTH_IS_SHARE", false);
}

function now(): number {
  return Date.now();
}

function buildUserInfo(sysUser: {
  id: number;
  username: string;
  nickname: string;
}): Omit<UserInfo, "password"> {
  const roles =
    sysUser.username === "vben" ? ["super"] : sysUser.username === "admin" ? ["admin"] : ["user"];
  const homePath =
    sysUser.username === "vben"
      ? "/analytics"
      : sysUser.username === "admin"
        ? "/system/user"
        : "/analytics";
  return {
    id: sysUser.id,
    username: sysUser.username,
    realName: sysUser.nickname,
    roles,
    homePath,
  };
}

function findSysUserByUsername(username: string) {
  ensureUserSeeds();
  return getMockSysUserList().find((item) => item.username === username && item.deleted_at === 0);
}

function findSysUserById(userId: number) {
  ensureUserSeeds();
  return getMockSysUserList().find((item) => item.id === userId && item.deleted_at === 0);
}

/**
 * 将 java 侧用户名映射到 mock RBAC 用户。
 * 优先同名；否则 AUTH_JAVA_USER_FALLBACK（默认 vben）。
 */
function resolveMockUserForJavaUsername(javaUsername: string) {
  const exact = findSysUserByUsername(javaUsername);
  if (exact) return exact;
  return findSysUserByUsername(getJavaUserFallback());
}

function revokeByUserId(userId: number, exceptToken?: string) {
  for (const [token, record] of sessions) {
    if (record.userId === userId && token !== exceptToken) {
      sessions.delete(token);
    }
  }
}

function findActiveTokenByUserId(userId: number): string | null {
  const t = now();
  for (const [token, record] of sessions) {
    if (record.userId === userId && record.expiresAt > t) {
      return token;
    }
    if (record.userId === userId && record.expiresAt <= t) {
      sessions.delete(token);
    }
  }
  return null;
}

/**
 * 登录创建会话，返回 accessToken。
 * - is-share=true：复用该用户未过期 token
 * - is-concurrent=false：踢掉该用户其它会话
 */
export function createSession(user: Pick<UserInfo, "id" | "username">): string {
  const userId = Number(user.id);
  const username = user.username;

  if (isShare()) {
    const existing = findActiveTokenByUserId(userId);
    if (existing) {
      const record = sessions.get(existing);
      if (record) {
        record.expiresAt = now() + timeoutMs();
        sessions.set(existing, record);
      }
      return existing;
    }
  }

  if (!isConcurrent()) {
    revokeByUserId(userId);
  }

  const token = randomUUID();
  sessions.set(token, {
    userId,
    username,
    expiresAt: now() + timeoutMs(),
  });
  return token;
}

/** 将已校验的外部 token 登记为本地会话（绑定 mock 用户 id/username） */
function registerForeignSession(token: string, user: { id: number; username: string }): void {
  sessions.set(token, {
    userId: Number(user.id),
    username: user.username,
    expiresAt: now() + timeoutMs(),
    foreign: true,
  });
}

export function revokeSession(token: string | null | undefined): void {
  if (!token) return;
  sessions.delete(token);
}

export function extractBearerToken(event: H3Event<EventHandlerRequest>): string | null {
  const authHeader = getHeader(event, "Authorization");
  if (!authHeader?.startsWith("Bearer")) {
    return null;
  }
  const tokenParts = authHeader.split(" ");
  if (tokenParts.length !== 2) {
    return null;
  }
  const token = tokenParts[1];
  return token || null;
}

interface JavaUserInfoBody {
  code?: number;
  data?: {
    id?: number | string;
    username?: string;
    realName?: string;
    roles?: string[];
    homePath?: string;
  } | null;
}

/**
 * 调用 java `GET /api/user/info` 校验 Sa-Token，成功则映射 mock 用户并写入本地 session。
 * @returns 是否登记成功
 */
async function adoptFromJava(token: string, introspectUrl: string): Promise<boolean> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), javaIntrospectTimeoutMs());
  try {
    const res = await fetch(introspectUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      signal: controller.signal,
    });
    if (!res.ok) {
      return false;
    }
    const body = (await res.json()) as JavaUserInfoBody;
    if (body?.code !== 0 || !body.data?.username) {
      return false;
    }
    const mockUser = resolveMockUserForJavaUsername(String(body.data.username));
    if (!mockUser) {
      return false;
    }
    registerForeignSession(token, mockUser);
    return true;
  } catch {
    // java 未起 / 超时 / 网络错误：保持未登记，后续 verify 返回 401
    return false;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * hybrid 桥：本地无会话时尝试用 java 内省登记 token。
 * 由 middleware 在 handler 前调用；`verifyAccessToken` 仍保持同步。
 */
export async function ensureTokenAdopted(token: string | null | undefined): Promise<void> {
  if (!token) return;

  const existing = sessions.get(token);
  if (existing) {
    if (existing.expiresAt > now()) return;
    sessions.delete(token);
  }

  const introspectUrl = getJavaIntrospectUrl();
  if (!introspectUrl) return;

  let pending = pendingAdopts.get(token);
  if (!pending) {
    pending = adoptFromJava(token, introspectUrl).finally(() => {
      pendingAdopts.delete(token);
    });
    pendingAdopts.set(token, pending);
  }
  await pending;
}

/**
 * 校验 Bearer token，成功则滑动续期并返回用户信息（不含 password）。
 * hybrid：请先经 middleware 调用 {@link ensureTokenAdopted}，以便识别 java 签发的 token。
 */
export function verifyAccessToken(
  event: H3Event<EventHandlerRequest>,
): null | Omit<UserInfo, "password"> {
  const token = extractBearerToken(event);
  if (!token) {
    return null;
  }

  const record = sessions.get(token);
  if (!record) {
    return null;
  }

  if (record.expiresAt <= now()) {
    sessions.delete(token);
    return null;
  }

  // 滑动续期
  record.expiresAt = now() + timeoutMs();
  sessions.set(token, record);

  // 优先 username：foreign 会话已绑定 mock 用户名，避免 java id 误命中
  const sysUser = findSysUserByUsername(record.username) ?? findSysUserById(record.userId);
  if (!sysUser) {
    sessions.delete(token);
    return null;
  }

  return buildUserInfo(sysUser);
}

/** 登出：作废当前请求中的 token */
export function revokeAccessToken(event: H3Event<EventHandlerRequest>): void {
  revokeSession(extractBearerToken(event));
}

/** 兼容旧命名：登录签发 token */
export function generateAccessToken(user: UserInfo): string {
  return createSession(user);
}
