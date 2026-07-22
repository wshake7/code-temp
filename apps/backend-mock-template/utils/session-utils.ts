import type { EventHandlerRequest, H3Event } from "h3";

import type { UserInfo } from "./mock-data";

import { getHeader } from "h3";
import { randomUUID } from "node:crypto";

import { ensureUserSeeds, getMockSysUserList } from "./mock-data";

/** 默认 30 天（秒），对齐 java-admin sa-token.timeout */
const DEFAULT_TIMEOUT_SECONDS = 2592000;

interface SessionRecord {
  userId: number;
  username: string;
  expiresAt: number;
}

/** token → 会话 */
const sessions = new Map<string, SessionRecord>();

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

/**
 * 校验 Bearer token，成功则滑动续期并返回用户信息（不含 password）。
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

  const sysUser = findSysUserById(record.userId) ?? findSysUserByUsername(record.username);
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
