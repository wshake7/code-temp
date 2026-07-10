import { useMemo, useState } from 'react';
import { Button, Popconfirm, Tag, message } from 'antd';
import type { ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import {
  PlusOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { useDeleteMenu, useListMenus } from '@/api/hooks/menu';
import type { MenuType, SysMenu } from '@/api/rest/types';
import ContentContainer from '@/layouts/components/PageContainer/ContentContainer';
import MenuFormDrawer, { type MenuFormKind } from './modules/menu-form-drawer';

/** 扁平菜单按 parentId 组成树，供 ProTable 的 childrenColumnName 渲染 */
function buildTree(list: SysMenu[]): SysMenu[] {
  const byId = new Map<number, SysMenu & { children?: SysMenu[] }>();
  list.forEach((m) => byId.set(m.id, { ...m }));
  const roots: SysMenu[] = [];
  for (const node of byId.values()) {
    if (node.parentId === null || node.parentId === undefined) {
      roots.push(node);
    } else {
      const parent = byId.get(node.parentId);
      if (parent) {
        parent.children = parent.children ?? [];
        parent.children.push(node);
      } else {
        roots.push(node);
      }
    }
  }
  return roots;
}

const TYPE_TAG: Record<MenuType, { color: string; text: string }> = {
  DIR: { color: 'blue', text: 'DIR' },
  MENU: { color: 'green', text: 'MENU' },
  BUTTON: { color: 'orange', text: 'BUTTON' },
};

const STATUS_TAG: Record<0 | 1, { color: string; text: string }> = {
  1: { color: 'success', text: '启用' },
  0: { color: 'default', text: '禁用' },
};

const MenuPage = () => {
  const [search, setSearch] = useState<{
    name?: string;
    type?: MenuType;
    permissionCode?: string;
    status?: 0 | 1;
  }>({});
  const { data, isLoading, refetch } = useListMenus({
    page: 1,
    pageSize: 100,
    ...search,
  });
  const deleteMut = useDeleteMenu({
    onSuccess: () => {
      message.success('删除成功');
      refetch();
    },
    onError: (err) => message.error(`删除失败：${(err as Error).message ?? '未知错误'}`),
  });

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerKind, setDrawerKind] = useState<MenuFormKind>('create');
  const [editing, setEditing] = useState<SysMenu | null>(null);
  const [presetParentId, setPresetParentId] = useState<number | null>(null);

  const treeData = useMemo(() => buildTree(data?.items ?? []), [data]);

  const openCreate = (parentId: number | null = null) => {
    setDrawerKind('create');
    setEditing(null);
    setPresetParentId(parentId);
    setDrawerOpen(true);
  };
  const openEdit = (row: SysMenu) => {
    setDrawerKind('edit');
    setEditing(row);
    setPresetParentId(null);
    setDrawerOpen(true);
  };

  const columns: ProColumns<SysMenu>[] = [
    { title: 'ID', dataIndex: 'id', width: 70, search: false },
    { title: '菜单名', dataIndex: 'name', width: 200, ellipsis: true },
    {
      title: '类型',
      dataIndex: 'type',
      width: 90,
      valueType: 'select',
      valueEnum: {
        DIR: { text: 'DIR' },
        MENU: { text: 'MENU' },
        BUTTON: { text: 'BUTTON' },
      },
      render: (_, r) => {
        const t = TYPE_TAG[r.type];
        return <Tag color={t.color}>{t.text}</Tag>;
      },
    },
    {
      title: '路由路径',
      dataIndex: 'path',
      width: 180,
      ellipsis: true,
      search: false,
      render: (_, r) => r.path || <span style={{ color: '#999' }}>-</span>,
    },
    {
      title: '权限码',
      dataIndex: 'permissionCode',
      width: 180,
      ellipsis: true,
      render: (_, r) =>
        r.permissionCode ? (
          <Tag color="default">{r.permissionCode}</Tag>
        ) : (
          <span style={{ color: '#999' }}>-</span>
        ),
    },
    {
      title: '图标',
      dataIndex: 'icon',
      width: 80,
      search: false,
      render: (_, r) => r.icon || <span style={{ color: '#999' }}>-</span>,
    },
    { title: '排序', dataIndex: 'sort', width: 70, search: false },
    {
      title: '状态',
      dataIndex: 'isEnabled',
      width: 90,
      valueType: 'select',
      valueEnum: { 1: { text: '启用' }, 0: { text: '禁用' } },
      render: (_, r) => {
        const t = STATUS_TAG[r.isEnabled];
        return <Tag color={t.color}>{t.text}</Tag>;
      },
    },
    {
      title: '操作',
      valueType: 'option',
      width: 200,
      fixed: 'right',
      search: false,
      render: (_, r) => {
        const canHaveChild = r.type !== 'BUTTON';
        return [
          <a key="edit" onClick={() => openEdit(r)}>
            编辑
          </a>,
          canHaveChild ? (
            <a key="add" onClick={() => openCreate(r.id)}>
              添加
            </a>
          ) : null,
          <Popconfirm
            key="del"
            title="确认删除"
            description={`确定删除「${r.name}」吗？`}
            onConfirm={() => deleteMut.mutate(r.id)}
          >
            <a style={{ color: '#ff4d4f' }}>
              删除
            </a>
          </Popconfirm>,
        ];
      },
    },
  ];

  return (
    <ContentContainer>
      <ProTable<SysMenu>
        rowKey="id"
        headerTitle="菜单管理"
        loading={isLoading}
        dataSource={treeData}
        columns={columns}
        search={{ labelWidth: 'auto', defaultCollapsed: false }}
        pagination={false}
        scroll={{ x: 1100 }}
        options={{ reload: () => refetch(), density: false, fullScreen: false, setting: false }}
        toolbar={{
          actions: [
            <Button key="reload" icon={<ReloadOutlined />} onClick={() => refetch()}>
              刷新
            </Button>,
            <Button
              key="create"
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => openCreate(null)}
            >
              新增菜单
            </Button>,
          ],
        }}
        expandable={{ defaultExpandAll: true }}
        tableAlertRender={false}
        form={{
          onReset: () => setSearch({}),
          submitButtonProps: { style: { display: 'none' } },
        }}
        onSearch={(values) => {
          setSearch({
            name: values.name as string | undefined,
            type: values.type as MenuType | undefined,
            permissionCode: values.permissionCode as string | undefined,
            status: values.isEnabled as 0 | 1 | undefined,
          });
        }}
      />
      <MenuFormDrawer
        open={drawerOpen}
        kind={drawerKind}
        row={editing}
        presetParentId={presetParentId}
        onClose={() => setDrawerOpen(false)}
        onSaved={() => refetch()}
      />
    </ContentContainer>
  );
};

export default MenuPage;
