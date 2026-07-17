/* eslint-disable react-hooks/set-state-in-effect --
 * useEffect 同步服务端数据(boundMenus/boundApis)与受控 open prop 到本地 state 是合法用例;
 * Drawer destroyOnClose 已在父层设,关闭/重开会重新挂载本组件,useState 不会残留 */
import { useEffect, useMemo, useState } from 'react';
import {
  Button,
  Checkbox,
  Collapse,
  Drawer,
  Input,
  Space,
  Tabs,
  Tag,
  Tree,
  message,
} from 'antd';
import type { CheckboxChangeEvent } from 'antd';
import type { DataNode } from 'antd/es/tree';
import {
  useRoleApis,
  useRoleMenus,
  useSetRoleApis,
  useSetRoleMenus,
} from '@/api/hooks/role';
import type {
  RoleApiBindItem,
  RoleMenuBindItem,
} from '@/api/rest/types';

interface Props {
  open: boolean;
  roleId: number | null;
  onClose: () => void;
}

/** 把带 bound 的扁平菜单组成 antd Tree DataNode；checkedKeys 取 bound=true 的 id */
function buildMenuTree(list: RoleMenuBindItem[]): {
  treeData: DataNode[];
  checkedKeys: number[];
} {
  const byId = new Map<number, RoleMenuBindItem & { children: DataNode[] }>();
  list.forEach((m) => byId.set(m.id, { ...m, children: [] }));
  const checked: number[] = [];
  const roots: DataNode[] = [];
  for (const node of byId.values()) {
    const dataNode: DataNode = {
      key: node.id,
      title: (
        <span>
          {node.name}
          {node.type === 'BUTTON' && (
            <Tag color="orange" style={{ marginLeft: 6 }}>
              BTN
            </Tag>
          )}
        </span>
      ),
      children: node.children,
    };
    if (node.bound) checked.push(node.id);
    if (node.parentId === null || node.parentId === undefined) {
      roots.push(dataNode);
    } else {
      const parent = byId.get(node.parentId);
      if (parent) parent.children.push(dataNode);
      else roots.push(dataNode);
    }
  }
  return { treeData: roots, checkedKeys: checked };
}

const RolePermissionDrawer = ({ open, roleId, onClose }: Props) => {
  const [activeTab, setActiveTab] = useState('menu');
  const [menuChecked, setMenuChecked] = useState<Set<number>>(new Set());
  const [apiSearch, setApiSearch] = useState('');

  // 菜单授权
  const { data: boundMenus } = useRoleMenus(roleId, { enabled: open && roleId !== null });
  const setMenusMut = useSetRoleMenus({
    onSuccess: () => message.success('菜单授权已保存'),
    onError: (err) => message.error(`保存失败：${(err as Error).message ?? '未知错误'}`),
  });

  // 接口授权
  const { data: boundApis, refetch: refetchApis } = useRoleApis(roleId, {
    enabled: open && roleId !== null,
  });
  const setApisMut = useSetRoleApis({
    onSuccess: () => message.success('接口授权已保存'),
    onError: (err) => message.error(`保存失败：${(err as Error).message ?? '未知错误'}`),
  });

  // 菜单树 + 初始选中
  const { treeData, checkedKeys: initialMenuKeys } = useMemo(
    () => buildMenuTree(boundMenus ?? []),
    [boundMenus],
  );
  useEffect(() => {
    setMenuChecked(new Set(initialMenuKeys));
  }, [initialMenuKeys]);

  // 接口分组 + 搜索
  const [apiChecked, setApiChecked] = useState<Set<number>>(new Set());
  useEffect(() => {
    const initial = new Set<number>();
    if (boundApis) {
      boundApis.forEach((a) => {
        if (a.bound) initial.add(a.id);
      });
    }
    setApiChecked(initial);
  }, [boundApis]);

  const groupedApis = useMemo(() => {
    const groups = new Map<string, RoleApiBindItem[]>();
    const source: RoleApiBindItem[] = (boundApis ?? []).map((a) => ({
      ...a,
      bound: apiChecked.has(a.id),
    }));
    const kw = apiSearch.trim().toLowerCase();
    source.forEach((a) => {
      if (kw) {
        const hit =
          a.name.toLowerCase().includes(kw) ||
          a.path.toLowerCase().includes(kw) ||
          a.permissionCode.toLowerCase().includes(kw);
        if (!hit) return;
      }
      const arr = groups.get(a.apiGroup) ?? [];
      arr.push(a);
      groups.set(a.apiGroup, arr);
    });
    return [...groups.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [boundApis, apiChecked, apiSearch]);

  const toggleApi = (id: number, checked: boolean) => {
    setApiChecked((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const toggleGroup = (apis: RoleApiBindItem[], checked: boolean) => {
    setApiChecked((prev) => {
      const next = new Set(prev);
      apis.forEach((a) => {
        if (checked) next.add(a.id);
        else next.delete(a.id);
      });
      return next;
    });
  };

  const handleSaveMenu = () => {
    if (roleId === null) return;
    setMenusMut.mutate({ id: roleId, menuIds: [...menuChecked] });
  };

  const handleSaveApi = () => {
    if (roleId === null) return;
    setApisMut.mutate({ id: roleId, apiIds: [...apiChecked] });
    refetchApis();
  };

  const submitting = setMenusMut.isPending || setApisMut.isPending;

  return (
    <Drawer
      title="分配权限"
      open={open}
      onClose={onClose}
      width={720}
      destroyOnClose
      footer={
        <Space style={{ float: 'right' }}>
          <Button onClick={onClose} disabled={submitting}>
            取消
          </Button>
          {activeTab === 'menu' && (
            <Button type="primary" onClick={handleSaveMenu} loading={submitting}>
              保存菜单授权
            </Button>
          )}
          {activeTab === 'api' && (
            <Button type="primary" onClick={handleSaveApi} loading={submitting}>
              保存接口授权
            </Button>
          )}
        </Space>
      }
    >
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          { key: 'menu', label: `菜单权限（${menuChecked.size}）` },
          { key: 'api', label: `接口权限（${apiChecked.size}）` },
          { key: 'data', label: '数据权限', disabled: false },
        ]}
      />

      {activeTab === 'menu' && (
        <div>
          <div style={{ marginBottom: 8, color: '#666' }}>
            勾选菜单及其下的按钮权限点，保存后全量替换该角色的菜单授权。
          </div>
          <Tree
            checkable
            defaultExpandAll
            treeData={treeData}
            checkedKeys={[...menuChecked]}
            onCheck={(checked) => {
              const keys = Array.isArray(checked) ? checked : checked.checked;
              setMenuChecked(new Set(keys as number[]));
            }}
          />
        </div>
      )}

      {activeTab === 'api' && (
        <div>
          <Input.Search
            placeholder="按路径或名称搜索接口..."
            allowClear
            value={apiSearch}
            onChange={(e) => setApiSearch(e.target.value)}
            style={{ marginBottom: 12 }}
          />
          <div style={{ marginBottom: 8, color: '#666' }}>
            已选 <strong>{apiChecked.size}</strong> 个接口
          </div>
          <Collapse
            defaultActiveKey={[]}
            items={groupedApis.map(([group, apis]) => {
              const allSelected =
                apis.length > 0 && apis.every((a) => apiChecked.has(a.id));
              return {
                key: group,
                label: (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span>
                      {group} · {apis.length} 个
                    </span>
                    <Checkbox
                      checked={allSelected}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e: CheckboxChangeEvent) =>
                        toggleGroup(apis, e.target.checked)
                      }
                    >
                      全选
                    </Checkbox>
                  </div>
                ),
                children: (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {apis.map((a) => (
                      <Checkbox
                        key={a.id}
                        checked={apiChecked.has(a.id)}
                        onChange={(e: CheckboxChangeEvent) =>
                          toggleApi(a.id, e.target.checked)
                        }
                      >
                        <span style={{ fontFamily: 'monospace', fontSize: 12 }}>
                          <Tag color="blue" style={{ marginRight: 6 }}>
                            {a.method}
                          </Tag>
                          {a.path}
                        </span>
                        <span style={{ fontSize: 12, color: '#999', marginLeft: 8 }}>
                          {a.name}
                        </span>
                      </Checkbox>
                    ))}
                  </div>
                ),
              };
            })}
          />
        </div>
      )}

      {activeTab === 'data' && (
        <div
          style={{
            padding: '40px 0',
            textAlign: 'center',
            color: '#999',
          }}
        >
          开发中
        </div>
      )}
    </Drawer>
  );
};

export default RolePermissionDrawer;