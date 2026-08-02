/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_API_URL: string
    readonly VITE_SSE_URL: string

    readonly VITE_APP_TITLE: string
    readonly VITE_APP_NAMESPACE: string
    readonly VITE_APP_VERSION: string

    readonly VITE_AES_KEY: string

    readonly VITE_ENV: string

    readonly VITE_MOCK: boolean
    readonly VITE_ANALYZE: boolean

    /** 请求安全：时间戳头（默认 true） */
    readonly VITE_SECURITY_TIMESTAMP_ENABLED?: string
    /** 请求安全：传输加解密（默认 true） */
    readonly VITE_SECURITY_ENCRYPT_ENABLED?: string
    /** 请求安全：X-Request-ID / Nonce（默认 true） */
    readonly VITE_SECURITY_NONCE_ENABLED?: string
    /** 请求安全：Encrypt 关时独立签名（默认 true） */
    readonly VITE_SECURITY_SIGN_ENABLED?: string
    /** 请求安全：X-Language（默认 true） */
    readonly VITE_SECURITY_LANGUAGE_ENABLED?: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}

// React Router handle 类型增强
declare module 'react-router' {
    interface RouteMatch {
        handle: RouteHandle;
    }
}

// 兼容 process.env
declare namespace NodeJS {
    type ProcessEnv = ImportMetaEnv;
}
