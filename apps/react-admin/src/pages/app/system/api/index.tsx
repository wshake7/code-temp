import { useMemo, useRef, useState } from 'react';
import { Button, Popconfirm, Space, Tag, message } from 'antd';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import {
  useApiGroups,
  useDeleteApi,
  useSyncApisApi,
} from '@/api/hooks/api';
import { listApisApi } from '@/api/rest/api';
import type { HttpMethod, SysApi } from '@/api/rest/types';
import ContentContainer from '@/layouts/components/PageContainer/ContentContainer';
import ApiFormDrawer from './modules/api-form-drawer';

const METHOD_COLOR: Record<HttpMethod, string> = {
  GET: 'blue',
  POST: 'green',
  PUT: 'orange',
  DELETE: 'red',
  PATCH: 'purple',
  OPTIONS: 'default',
  HEAD: 'default',
};

const STATUS_TAG: Record<0 | 1, { color: string; text: string }> = {
  1: { color: 'success', text: '启用' },
  0: { color: 'default', text: '禁用' },
};

const ApiPage = () => {
  const actionRef = useRef<ActionType | undefined>(undefined);
  const reload = () => actionRef.current?.reload?.();

  // 接口列表由 ProTable 的 request 直接拉；这里只保留分组下拉（搜索框 valueEnum 用）
  const { data: groups } = useApiGroups();
  const deleteMut = useDeleteApi({
    onSuccess: () => {
      message.success('删除成功');
      reload();
    },
    onError: (err) => message.error(`删除失败：${(err as Error).message ?? '未知错误'}`),
  });
  const syncMut = useSyncApisApi({
    onSuccess: (res) => {
      message.success(`同步成功：新增 ${res.added}，跳过 ${res.skipped}，共 ${res.total}`);
      reload();
    },
    onError: (err) => message.error(`同步失败：${(err as Error).message ?? '未知错误'}`),
  });

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<SysApi | null>(null);
  const openCreate = () => {
    setEditing(null);
    setDrawerOpen(true);
  };
  const openEdit = (row: SysApi) => {
    setEditing(row);
    setDrawerOpen(true);
  };

  const groupEnum = useMemo(() => {
    const out: Record<string, { text: string }> = {};
    (groups ?? []).forEach((g) => {
      out[g] = { text: g };
    });
    return out;
  }, [groups]);

  /* ---------- ProTable request：与字典一致的形态 ---------- */
  async function fetchApiRows(params: {
    current?: number;
    pageSize?: number;
    name?: string;
    path?: string;
    method?: HttpMethod;
    apiGroup?: string;
    isEnabled?: 0 | 1;
  }) {
    const { current = 1, pageSize = 20, name, path, method, apiGroup, isEnabled } = params;
    const res = await listApisApi({
      page: current,
      pageSize,
      name: name || undefined,
      path: path || undefined,
      method,
      group: apiGroup || undefined,
      status: isEnabled,
    });
    return { data: res.items, total: res.total, success: true };
  }

  const columns: ProColumns<SysApi>[] = [
    { title: 'ID', dataIndex: 'id', width: 70, search: false },
    { title: '接口名', dataIndex: 'name', width: 180, ellipsis: true },
    {
      title: '方法',
      dataIndex: 'method',
      width: 90,
      valueType: 'select',
      valueEnum: {
        GET: { text: 'GET' },
        POST: { text: 'POST' },
        PUT: { text: 'PUT' },
        DELETE: { text: 'DELETE' },
        PATCH: { text: 'PATCH' },
        OPTIONS: { text: 'OPTIONS' },
        HEAD: { text: 'HEAD' },
      },
      render: (_, r) => <Tag color={METHOD_COLOR[r.method]}>{r.method}</Tag>,
    },
    {
      title: '路径',
      dataIndex: 'path',
      width: 240,
      ellipsis: true,
      render: (_, r) => <span style={{ fontFamily: 'monospace' }}>{r.path}</span>,
    },
    {
      title: '权限码',
      dataIndex: 'permissionCode',
      width: 180,
      ellipsis: true,
      render: (_, r) => <Tag color="default">{r.permissionCode}</Tag>,
    },
    {
      title: '分组',
      dataIndex: 'apiGroup',
      width: 110,
      valueType: 'select',
      valueEnum: groupEnum,
      render: (_, r) => <Tag color="default">{r.apiGroup}</Tag>,
    },
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
      title: '创建时间',
      dataIndex: 'createdAt',
      width: 170,
      valueType: 'dateTime',
      search: false,
    },
    {
      title: '操作',
      valueType: 'option',
      width: 120,
      fixed: 'right',
      search: false,
      render: (_, r) => [
        <a key="edit" onClick={() => openEdit(r)}>
          <Space size={2}>
            <EditOutlined /> 编辑
          </Space>
        </a>,
        <Popconfirm
          key="del"
          title="确认删除"
          description={`确定删除「${r.name}」吗？`}
          onConfirm={() => deleteMut.mutate(r.id)}
        >
          <a style={{ color: '#ff4d4f' }}>
            <DeleteOutlined /> 删除
          </a>
        </Popconfirm>,
      ],
    },
  ];

  return (
    <ContentContainer>
      <ProTable<SysApi>
        rowKey="id"
        headerTitle="接口管理"
        actionRef={actionRef}
        columns={columns}
        request={fetchApiRows}
        search={{ labelWidth: 'auto' }}
        pagination={{
          // 用 defaultPageSize 代替 pageSize：与字典保持一致，让 antd Table 用内部受控态
          // 维护当前分页大小，避免改变分页大小后视图不更新
          defaultPageSize: 20,
          showSizeChanger: true,
          showTotal: (t) => `共 ${t} 条`,
        }}
        scroll={{ x: 1200 }}
        toolBarRender={() => [
          <Popconfirm
            key="sync"
            title="确认同步"
            description="将从后端路由清单重新扫描并登记接口（命中则跳过）"
            onConfirm={() => syncMut.mutate()}
          >
            <Button icon={<SyncOutlined />} loading={syncMut.isPending}>
              同步接口
            </Button>
          </Popconfirm>,
          <Button
            key="create"
            type="primary"
            icon={<PlusOutlined />}
            onClick={openCreate}
          >
            新增接口
          </Button>,
        ]}
        tableAlertRender={false}
        dateFormatter="string"
      />
      <ApiFormDrawer
        open={drawerOpen}
        row={editing}
        onClose={() => setDrawerOpen(false)}
        onSaved={reload}
      />
    </ContentContainer>
  );
};

export default ApiPage;
