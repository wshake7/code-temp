import {
  useMutation,
  type UseMutationOptions,
  useQuery,
  type UseQueryOptions,
} from '@tanstack/react-query';
import {
  batchI18nLocaleApi,
  batchI18nTranslationApi,
  batchUpsertI18nTranslationByKeyApi,
  createI18nLocaleApi,
  createI18nTranslationApi,
  deleteI18nLocaleApi,
  deleteI18nTranslationApi,
  getI18nLocaleApi,
  getI18nTranslationByKeyApi,
  listAllI18nLocaleApi,
  listI18nLocaleApi,
  listI18nTranslationApi,
  listI18nTranslationByLocaleCodeApi,
  updateI18nLocaleApi,
  updateI18nTranslationApi,
} from '@/api/rest/i18n';
import type {
  CreateI18nLocaleRequest,
  CreateI18nTranslationRequest,
  I18nLocale,
  I18nLocaleQuery,
  I18nTranslation,
  I18nTranslationBatchUpsertByKeyRequest,
  I18nTranslationBatchUpsertByKeyResponse,
  I18nTranslationByKeyResponse,
  I18nTranslationQuery,
  UpdateI18nLocaleRequest,
  UpdateI18nTranslationRequest,
} from '@/api/rest/types';

// =========================================================
// 语言（i18n-locale）
// =========================================================

export function useListI18nLocale(
  query: I18nLocaleQuery = {},
  options?: UseQueryOptions<{ items: I18nLocale[]; total: number }, Error>,
) {
  return useQuery({
    queryKey: ['listI18nLocale', query],
    queryFn: () => listI18nLocaleApi(query),
    ...options,
  });
}

export function useListAllI18nLocale(
  params?: { status?: 0 | 1 },
  options?: UseQueryOptions<I18nLocale[], Error>,
) {
  return useQuery({
    queryKey: ['listAllI18nLocale', params],
    queryFn: () => listAllI18nLocaleApi(params),
    ...options,
  });
}

export function useGetI18nLocale(
  id: number | null | undefined,
  options?: UseQueryOptions<I18nLocale, Error>,
) {
  return useQuery({
    queryKey: ['getI18nLocale', id],
    queryFn: () => getI18nLocaleApi(id as number),
    enabled: typeof id === 'number',
    ...options,
  });
}

export function useCreateI18nLocale(
  options?: UseMutationOptions<I18nLocale, Error, CreateI18nLocaleRequest>,
) {
  return useMutation({
    mutationFn: (body) => createI18nLocaleApi(body),
    ...options,
  });
}

export function useUpdateI18nLocale(
  options?: UseMutationOptions<I18nLocale, Error, UpdateI18nLocaleRequest>,
) {
  return useMutation({
    mutationFn: (req) => updateI18nLocaleApi(req),
    ...options,
  });
}

export function useDeleteI18nLocale(
  options?: UseMutationOptions<unknown, Error, number>,
) {
  return useMutation({
    mutationFn: (id) => deleteI18nLocaleApi(id),
    ...options,
  });
}

// =========================================================
// 翻译（i18n-translation）
// =========================================================

export function useListI18nTranslation(
  query: I18nTranslationQuery = {},
  options?: Omit<
    UseQueryOptions<{ items: I18nTranslation[]; total: number }, Error>,
    'queryKey' | 'queryFn'
  >,
) {
  return useQuery({
    queryKey: ['listI18nTranslation', query],
    queryFn: () => listI18nTranslationApi(query),
    ...options,
  });
}

export function useListI18nTranslationByLocaleCode(
  code: string | null | undefined,
  options?: UseQueryOptions<I18nTranslation[], Error>,
) {
  return useQuery({
    queryKey: ['listI18nTranslationByLocaleCode', code],
    queryFn: () => listI18nTranslationByLocaleCodeApi(code as string),
    enabled: typeof code === 'string' && code.length > 0,
    ...options,
  });
}

export function useCreateI18nTranslation(
  options?: UseMutationOptions<I18nTranslation, Error, CreateI18nTranslationRequest>,
) {
  return useMutation({
    mutationFn: (body) => createI18nTranslationApi(body),
    ...options,
  });
}

export function useUpdateI18nTranslation(
  options?: UseMutationOptions<I18nTranslation, Error, UpdateI18nTranslationRequest>,
) {
  return useMutation({
    mutationFn: (req) => updateI18nTranslationApi(req),
    ...options,
  });
}

export function useDeleteI18nTranslation(
  options?: UseMutationOptions<unknown, Error, number>,
) {
  return useMutation({
    mutationFn: (id) => deleteI18nTranslationApi(id),
    ...options,
  });
}

// =========================================================
// 批量操作
// =========================================================

export function useBatchI18nLocale(
  options?: UseMutationOptions<
    { action: string; affected: number; ids: number[] },
    Error,
    { action: 'enable' | 'disable' | 'delete'; ids: number[] }
  >,
) {
  return useMutation({
    mutationFn: (body) => batchI18nLocaleApi(body),
    ...options,
  });
}

export function useBatchI18nTranslation(
  options?: UseMutationOptions<
    { action: string; affected: number; ids: number[] },
    Error,
    { action: 'enable' | 'disable' | 'delete'; ids: number[] }
  >,
) {
  return useMutation({
    mutationFn: (body) => batchI18nTranslationApi(body),
    ...options,
  });
}

/**
 * 按 translation_key 聚合查询：用于多语言编辑抽屉打开时加载 values。
 * key 为空或 undefined 时禁用查询。
 */
export function useGetI18nTranslationByKey(
  key: string | null | undefined,
  options?: UseQueryOptions<I18nTranslationByKeyResponse, Error>,
) {
  return useQuery({
    queryKey: ['getI18nTranslationByKey', key],
    queryFn: () => getI18nTranslationByKeyApi(key as string),
    enabled: typeof key === 'string' && key.length > 0,
    ...options,
  });
}

/**
 * 单 key 多语言事务化 upsert：用于多语言编辑抽屉保存。
 */
export function useBatchUpsertI18nTranslationByKey(
  options?: UseMutationOptions<
    I18nTranslationBatchUpsertByKeyResponse,
    Error,
    I18nTranslationBatchUpsertByKeyRequest
  >,
) {
  return useMutation({
    mutationFn: (body) => batchUpsertI18nTranslationByKeyApi(body),
    ...options,
  });
}
