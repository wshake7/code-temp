import {
  useMutation,
  type UseMutationOptions,
  useQuery,
  type UseQueryOptions,
} from '@tanstack/react-query';
import {
  batchRolesApi,
  createRoleApi,
  deleteRoleApi,
  getRolePermissionsApi,
  listAllRolesApi,
  listRolesApi,
  setRolePermissionsApi,
  updateRoleApi,
} from '@/api/rest/role';
import type {
  BatchActionRequest,
  BatchActionResult,
  CreateRoleRequest,
  PageResult,
  RoleListItem,
  RoleListQuery,
  RolePermissions,
  UpdateRoleRequest,
} from '@/api/rest/types';

export function useListRoles(
  query: RoleListQuery,
  options?: UseQueryOptions<PageResult<RoleListItem>, Error>,
) {
  return useQuery({
    queryKey: ['listRoles', query],
    queryFn: () => listRolesApi(query),
    ...options,
  });
}

export function useAllRoles(options?: UseQueryOptions<RoleListItem[], Error>) {
  return useQuery({
    queryKey: ['allRoles'],
    queryFn: () => listAllRolesApi(),
    ...options,
  });
}

export function useCreateRole(
  options?: UseMutationOptions<RoleListItem, Error, CreateRoleRequest>,
) {
  return useMutation({
    mutationFn: (data) => createRoleApi(data),
    ...options,
  });
}

export function useUpdateRole(
  options?: UseMutationOptions<RoleListItem, Error, UpdateRoleRequest>,
) {
  return useMutation({
    mutationFn: (req) => updateRoleApi(req),
    ...options,
  });
}

export function useDeleteRole(options?: UseMutationOptions<unknown, Error, number>) {
  return useMutation({
    mutationFn: (id) => deleteRoleApi(id),
    ...options,
  });
}

export function useBatchRoles(
  options?: UseMutationOptions<BatchActionResult, Error, BatchActionRequest>,
) {
  return useMutation({
    mutationFn: (body) => batchRolesApi(body),
    ...options,
  });
}

export function useRolePermissions(
  id: number | null,
  options?: UseQueryOptions<RolePermissions, Error>,
) {
  return useQuery({
    queryKey: ['rolePermissions', id],
    queryFn: () => getRolePermissionsApi(id!),
    enabled: id != null && id > 0,
    ...options,
  });
}

export function useSetRolePermissions(
  options?: UseMutationOptions<
    RolePermissions,
    Error,
    { id: number; menuIds: number[]; apiIds: number[] }
  >,
) {
  return useMutation({
    mutationFn: ({ id, menuIds, apiIds }) => setRolePermissionsApi(id, { menuIds, apiIds }),
    ...options,
  });
}
