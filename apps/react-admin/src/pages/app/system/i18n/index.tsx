import { useRef, useState } from 'react';
import {
  Button,
  Col,
  message,
  Modal,
  Popconfirm,
  Row,
  Space,
  Tag,
  Typography,
} from 'antd';
import {
  DeleteOutlined,
  DownloadOutlined,
  ImportOutlined,
  PlusOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import { ProTable } from '@ant-design/pro-components';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import i18n from 'i18next';
import { useDictLookups } from '@/api/hooks/dict';
import {
  batchI18nLocaleApi,
  batchI18nTranslationApi,
  deleteI18nLocaleApi,
  deleteI18nTranslationApi,
  exportI18nApi,
  listI18nLocaleApi,
  listI18nTranslationApi,
  syncI18nApi,
} from '@/api/rest/i18n';
import type {
  I18nLocale,
  I18nTranslation,
} from '@/api/rest/types';
import ContentContainer from '@/layouts/components/PageContainer/ContentContainer';
import I18nLocaleDrawer from './modules/locale-drawer';
import I18nImportModal from './modules/import-modal';
import I18nTranslationKeyDrawer from './modules/translation-key-drawer';

type BulkAction = 'enable' | 'disable' | 'delete';

const I18nPage = () => {
  const localeActionRef = useRef<ActionType | undefined>(undefined);
  const translationActionRef = useRef<ActionType | undefined>(undefined);

  // 左表选中态
  const [selectedLocaleId, setSelectedLocaleId] = useState<number | null>(null);
  const [selectedLocale, setSelectedLocale] = useState<I18nLocale | null>(null);

  // 右表当前 localeCode（点击行 / 关闭按钮写入；fetchTranslationRows 直接读 ref）
  const entryLocaleCodeRef = useRef<string | undefined>(undefined);
  const entryLocaleIdRef = useRef<number | undefined>(undefined);

  // 多选状态
  const [localeSelectedRowKeys, setLocaleSelectedRowKeys] = useState<
    React.Key[]
  >([]);
  const [translationSelectedRowKeys, setTranslationSelectedRowKeys] = useState<
    React.Key[]
  >([]);
  const [localeBulkLoading, setLocaleBulkLoading] = useState(false);
  const [translationBulkLoading, setTranslationBulkLoading] = useState(false);

  // 导入 / 导出 / 同步
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importModalKey, setImportModalKey] = useState(0);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [exportType, setExportType] = useState<'raw' | 'simple'>('simple');
  const [syncing, setSyncing] = useState(false);

  // 字典驱动：默认列 + 状态列走 useDictLookups，列表 load 后才显示彩色 Tag。
  // useDictLookups 内部走 useListDictData(includeGeneral=true, platform=currentPlatform)，
  // 跨页面与字典页共用同一份字典数据。
  const dictLookups = useDictLookups();

  // 抽屉
  const [localeDrawerOpen, setLocaleDrawerOpen] = useState(false);
  const [editingLocale, setEditingLocale] = useState<I18nLocale | null>(null);
  const [translationDrawerOpen, setTranslationDrawerOpen] = useState(false);
  const [editingTranslation, setEditingTranslation] =
    useState<I18nTranslation | null>(null);
  const [newTranslationKey, setNewTranslationKey] = useState<string>('');

  // 列定义
  const localeColumns: ProColumns<I18nLocale>[] = [
    { title: 'ID', dataIndex: 'id', width: 80, search: false },
    { title: '语言代码', dataIndex: 'code', width: 140, ellipsis: true },
    { title: '语言名称', dataIndex: 'name', width: 140, ellipsis: true },
    {
      title: '默认',
      dataIndex: 'isDefault',
      width: 80,
      search: false,
      render: (_, r) => {
        const tagType = dictLookups.lookupDefaultTagType(r.isDefault);
        return (
          <Tag color={tagType && tagType !== 'default' ? tagType : undefined}>
            {dictLookups.lookupDefaultLabel(r.isDefault)}
          </Tag>
        );
      },
    },
    {
      title: '排序',
      dataIndex: 'sort',
      width: 80,
      search: false,
    },
    {
      title: '状态',
      dataIndex: 'isEnabled',
      width: 90,
      search: false,
      valueType: 'select',
      valueEnum: {
        1: { text: '启用' },
        0: { text: '禁用' },
      },
      render: (_, r) => {
        const tagType = dictLookups.lookupSwitchTagType(r.isEnabled);
        return (
          <Tag color={tagType && tagType !== 'default' ? tagType : undefined}>
            {dictLookups.lookupSwitchLabel(r.isEnabled)}
          </Tag>
        );
      },
    },
    {
      title: '备注',
      dataIndex: 'remark',
      ellipsis: true,
      search: false,
      render: (_, r) =>
        r.remark ? (
          <span title={r.remark}>{r.remark}</span>
        ) : (
          <span style={{ color: '#999' }}>-</span>
        ),
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      width: 170,
      valueType: 'dateTime',
      search: false,
    },
    {
      title: '操作',
      valueType: 'option',
      key: 'option',
      width: 120,
      fixed: 'right',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render: (_: any, record: I18nLocale) => [
        <a
          key="edit"
          onClick={(e) => {
            e.stopPropagation();
            setEditingLocale(record);
            setLocaleDrawerOpen(true);
          }}
        >
          编辑
        </a>,
        <Popconfirm
          key="delete"
          title="确认删除该语言？"
          description="若仍有翻译将无法删除；默认语言禁止删除。"
          okText="删除"
          okButtonProps={{ danger: true }}
          cancelText="取消"
          onConfirm={async () => {
            try {
              await deleteI18nLocaleApi(record.id);
              message.success('删除成功');
              localeActionRef.current?.reload?.();
              if (selectedLocaleId === record.id) {
                clearTranslationSelection();
              }
            } catch (err) {
              message.error(
                `删除失败：${(err as Error).message ?? '未知错误'}`,
              );
            }
          }}
        >
          <a
            key="delete-link"
            style={{ color: '#ff4d4f' }}
            onClick={(e) => e.stopPropagation()}
          >
            删除
          </a>
        </Popconfirm>,
      ],
    },
  ];

  const translationColumns: ProColumns<I18nTranslation>[] = [
    { title: 'ID', dataIndex: 'id', width: 80, search: false },
    {
      title: '翻译键',
      dataIndex: 'translationKey',
      width: 200,
      ellipsis: true,
      search: false,
    },
    {
      title: '翻译值',
      dataIndex: 'value',
      width: 200,
      ellipsis: true,
      search: false,
    },
    {
      title: '状态',
      dataIndex: 'isEnabled',
      width: 90,
      valueType: 'select',
      search: false,
      valueEnum: {
        1: { text: '启用' },
        0: { text: '禁用' },
      },
      render: (_, r) => {
        const tagType = dictLookups.lookupSwitchTagType(r.isEnabled);
        return (
          <Tag color={tagType && tagType !== 'default' ? tagType : undefined}>
            {dictLookups.lookupSwitchLabel(r.isEnabled)}
          </Tag>
        );
      },
    },
    {
      title: '备注',
      dataIndex: 'remark',
      ellipsis: true,
      search: false,
      render: (_, r) =>
        r.remark ? (
          <span title={r.remark}>{r.remark}</span>
        ) : (
          <span style={{ color: '#999' }}>-</span>
        ),
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      width: 170,
      valueType: 'dateTime',
      search: false,
    },
    {
      title: '操作',
      valueType: 'option',
      key: 'option',
      width: 120,
      fixed: 'right',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render: (_: any, record: I18nTranslation) => [
        <a
          key="edit"
          onClick={() => {
            setEditingTranslation(record);
            setTranslationDrawerOpen(true);
          }}
        >
          编辑
        </a>,
        <Popconfirm
          key="delete"
          title="确认删除该翻译？"
          okText="删除"
          okButtonProps={{ danger: true }}
          cancelText="取消"
          onConfirm={async () => {
            try {
              await deleteI18nTranslationApi(record.id);
              message.success('删除成功');
              translationActionRef.current?.reload?.();
            } catch (err) {
              message.error(
                `删除失败：${(err as Error).message ?? '未知错误'}`,
              );
            }
          }}
        >
          <a key="delete-link" style={{ color: '#ff4d4f' }}>
            删除
          </a>
        </Popconfirm>,
      ],
    },
  ];

  // 翻译列：把搜索区 value 字段改为"键或值"模糊搜索（让 value 搜索支持 translation_key）
  const translationSearchColumns: ProColumns<I18nTranslation>[] = [
    ...translationColumns.slice(0, 2),
    {
      title: '键或值',
      dataIndex: 'value',
      hideInTable: true,
    },
    ...translationColumns.slice(2),
  ];

  // 列表请求
  async function fetchLocaleRows(
    params: Record<string, unknown> & {
      current?: number;
      pageSize?: number;
      code?: string;
      name?: string;
      isEnabled?: number | '';
    },
  ) {
    const {
      current = 1,
      pageSize = 10,
      code,
      name,
      isEnabled,
    } = params;
    const status =
      isEnabled === '' || isEnabled === undefined
        ? undefined
        : (Number(isEnabled) as 0 | 1);
    const res = await listI18nLocaleApi({
      page: current,
      pageSize,
      code: code || undefined,
      name: name || undefined,
      status,
    });
    return { data: res.items, total: res.total, success: true };
  }

  async function fetchTranslationRows(
    params: Record<string, unknown> & {
      current?: number;
      pageSize?: number;
      value?: string;
      isEnabled?: number | '';
    },
  ) {
    const {
      current = 1,
      pageSize = 20,
      value,
      isEnabled,
    } = params;
    const status =
      isEnabled === '' || isEnabled === undefined
        ? undefined
        : (Number(isEnabled) as 0 | 1);
    const res = await listI18nTranslationApi({
      page: current,
      pageSize,
      localeCode: entryLocaleCodeRef.current,
      value: value || undefined,
      status,
    });
    return { data: res.items, total: res.total, success: true };
  }

  function clearTranslationSelection() {
    entryLocaleCodeRef.current = undefined;
    entryLocaleIdRef.current = undefined;
    setSelectedLocaleId(null);
    setSelectedLocale(null);
    translationActionRef.current?.reload?.();
  }

  // 保存回调
  function onLocaleSaved() {
    localeActionRef.current?.reload?.();
    if (!editingLocale) {
      // 新建语言时让右表回到「全部」状态
      clearTranslationSelection();
    } else {
      // 编辑后让右表跟随最新 localeCode 刷新
      translationActionRef.current?.reload?.();
    }
  }
  function onTranslationSaved() {
    translationActionRef.current?.reload?.();
  }

  // 批量操作
  async function runBulkLocale(action: BulkAction) {
    if (localeSelectedRowKeys.length === 0) {
      message.warning('请先勾选要操作的语言');
      return;
    }
    setLocaleBulkLoading(true);
    try {
      await batchI18nLocaleApi({
        action,
        ids: localeSelectedRowKeys.map((k) => Number(k)),
      });
      message.success(
        action === 'delete'
          ? '批量删除成功'
          : action === 'enable'
            ? '批量启用成功'
            : '批量禁用成功',
      );
      setLocaleSelectedRowKeys([]);
      localeActionRef.current?.reload?.();
      // 避免引用已删除语言
      if (action === 'delete' && selectedLocaleId !== null) {
        clearTranslationSelection();
      }
    } catch (err) {
      message.error(`批量操作失败：${(err as Error).message ?? '未知错误'}`);
    } finally {
      setLocaleBulkLoading(false);
    }
  }

  async function runBulkTranslation(action: BulkAction) {
    if (translationSelectedRowKeys.length === 0) {
      message.warning('请先勾选要操作的翻译');
      return;
    }
    setTranslationBulkLoading(true);
    try {
      await batchI18nTranslationApi({
        action,
        ids: translationSelectedRowKeys.map((k) => Number(k)),
      });
      message.success(
        action === 'delete'
          ? '批量删除成功'
          : action === 'enable'
            ? '批量启用成功'
            : '批量禁用成功',
      );
      setTranslationSelectedRowKeys([]);
      translationActionRef.current?.reload?.();
    } catch (err) {
      message.error(`批量操作失败：${(err as Error).message ?? '未知错误'}`);
    } finally {
      setTranslationBulkLoading(false);
    }
  }

  // 同步 / 导入 / 导出
  async function handleSync() {
    setSyncing(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const storeData = (i18n.services.resourceStore as any).data ?? {};
      const locales: Record<string, Record<string, string>> = {};

      for (const [lang, nsMap] of Object.entries(storeData)) {
        if (!nsMap || typeof nsMap !== 'object') continue;
        const flat: Record<string, string> = {};
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        for (const [ns, kv] of Object.entries(nsMap as Record<string, any>)) {
          if (!kv || typeof kv !== 'object') continue;
          // eslint-disable-next-line max-depth
          for (const [k, v] of Object.entries(kv)) {
            if (typeof v !== 'string') continue;
            flat[`${ns}.${k}`] = v;
          }
        }
        if (Object.keys(flat).length > 0) {
          locales[lang] = flat;
        }
      }

      if (Object.keys(locales).length === 0) {
        message.warning('未找到可同步的前端翻译数据');
        return;
      }

      await syncI18nApi({ locales });
      message.success('前端翻译已同步到后端');
      translationActionRef.current?.reload?.();
    } catch (error: unknown) {
      message.error(`同步失败：${(error as Error).message ?? '未知错误'}`);
    } finally {
      setSyncing(false);
    }
  }

  function openExportModal() {
    const ids = localeSelectedRowKeys.map((k) => Number(k));
    if (ids.length === 0) {
      message.warning('请先勾选要导出的语言');
      return;
    }
    setExportModalOpen(true);
  }

  async function confirmExport() {
    const ids = localeSelectedRowKeys.map((k) => Number(k));
    try {
      const data = await exportI18nApi({ ids, type: exportType });
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `i18n-export-${exportType}.json`;
      a.click();
      URL.revokeObjectURL(url);
      message.success('导出成功');
      setExportModalOpen(false);
    } catch (error: unknown) {
      message.error(`导出失败：${error.message ?? '未知错误'}`);
    }
  }

  function onImportSuccess() {
    localeActionRef.current?.reload?.();
    translationActionRef.current?.reload?.();
  }

  // 工具栏
  const localeToolbar = () => [
    <Button
      key="sync"
      icon={<SyncOutlined />}
      loading={syncing}
      onClick={handleSync}
    >
      前端同步
    </Button>,
    <Button
      key="import"
      icon={<ImportOutlined />}
      onClick={() => {
            setImportModalOpen(true);
            setImportModalKey((k) => k + 1);
          }}
    >
      导入
    </Button>,
    <Button
      key="export"
      icon={<DownloadOutlined />}
      disabled={localeSelectedRowKeys.length === 0}
      onClick={openExportModal}
    >
      导出
    </Button>,
     <Button
      key="create"
      type="primary"
      icon={<PlusOutlined />}
      onClick={() => {
        setEditingLocale(null);
        setLocaleDrawerOpen(true);
      }}
    >
      新建语言
    </Button>,
  ];
  const translationToolbar = () => [
    <Button
      key="create"
      type="primary"
      icon={<PlusOutlined />}
      onClick={() => {
        setEditingTranslation(null);
        setNewTranslationKey('');
        setTranslationDrawerOpen(true);
      }}
    >
      新建翻译
    </Button>,
  ];

  // 多选
  const localeRowSelection = {
    selectedRowKeys: localeSelectedRowKeys,
    onChange: (keys: React.Key[]) => setLocaleSelectedRowKeys(keys),
    preserveSelectedRowKeys: true,
  };
  const translationRowSelection = {
    selectedRowKeys: translationSelectedRowKeys,
    onChange: (keys: React.Key[]) => setTranslationSelectedRowKeys(keys),
    preserveSelectedRowKeys: true,
  };

  // 选中条
  const renderLocaleAlert = ({
    selectedRowKeys,
    onCleanSelected,
  }: {
    selectedRowKeys: React.Key[];
    onCleanSelected: () => void;
  }) => {
    const count = selectedRowKeys.length;
    return (
      <Space size={8}>
        <Typography.Text>
          已选 <strong>{count}</strong> 条
        </Typography.Text>
        <Button
          size="small"
          loading={localeBulkLoading}
          disabled={count === 0}
          onClick={() => runBulkLocale('enable')}
        >
          批量启用
        </Button>
        <Button
          size="small"
          loading={localeBulkLoading}
          disabled={count === 0}
          onClick={() => runBulkLocale('disable')}
        >
          批量禁用
        </Button>
        <Popconfirm
          title="确认删除选中的语言？"
          description="若仍有翻译将无法删除；默认语言禁止删除。"
          okText="删除"
          okButtonProps={{ danger: true }}
          cancelText="取消"
          disabled={count === 0}
          onConfirm={() => runBulkLocale('delete')}
        >
          <Button
            size="small"
            danger
            ghost
            icon={<DeleteOutlined />}
            loading={localeBulkLoading}
            disabled={count === 0}
          >
            批量删除
          </Button>
        </Popconfirm>
        <Button size="small" type="text" onClick={onCleanSelected}>
          取消选择
        </Button>
      </Space>
    );
  };

  const renderTranslationAlert = ({
    selectedRowKeys,
    onCleanSelected,
  }: {
    selectedRowKeys: React.Key[];
    onCleanSelected: () => void;
  }) => {
    const count = selectedRowKeys.length;
    return (
      <Space size={8}>
        <Typography.Text>
          已选 <strong>{count}</strong> 条
        </Typography.Text>
        <Button
          size="small"
          loading={translationBulkLoading}
          disabled={count === 0}
          onClick={() => runBulkTranslation('enable')}
        >
          批量启用
        </Button>
        <Button
          size="small"
          loading={translationBulkLoading}
          disabled={count === 0}
          onClick={() => runBulkTranslation('disable')}
        >
          批量禁用
        </Button>
        <Popconfirm
          title="确认删除选中的翻译？"
          okText="删除"
          okButtonProps={{ danger: true }}
          cancelText="取消"
          disabled={count === 0}
          onConfirm={() => runBulkTranslation('delete')}
        >
          <Button
            size="small"
            danger
            ghost
            icon={<DeleteOutlined />}
            loading={translationBulkLoading}
            disabled={count === 0}
          >
            批量删除
          </Button>
        </Popconfirm>
        <Button size="small" type="text" onClick={onCleanSelected}>
          取消选择
        </Button>
      </Space>
    );
  };

  return (
    <ContentContainer heightMode="auto" scrollable padding="16px">
      <Row gutter={16}>
        <Col xs={24} md={12}>
          <ProTable<I18nLocale>
            headerTitle="语言"
            cardBordered
            rowKey="id"
            actionRef={localeActionRef}
            columns={localeColumns}
            search={{ labelWidth: 'auto' }}
            request={fetchLocaleRows}
            pagination={{
              defaultPageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `共 ${total} 条`,
            }}
            toolBarRender={localeToolbar}
            options={{
              reload: () => localeActionRef.current?.reload?.(),
              setting: { listsHeight: 400 },
            }}
            dateFormatter="string"
            onRow={(record) => ({
              onClick: () => {
                setSelectedLocaleId(record.id);
                setSelectedLocale(record);
                entryLocaleCodeRef.current = record.code;
                entryLocaleIdRef.current = record.id;
                translationActionRef.current?.reload?.();
              },
              style: {
                cursor: 'pointer',
                background:
                  selectedLocaleId === record.id
                    ? 'rgba(59,130,246,0.08)'
                    : undefined,
              },
            })}
            rowSelection={localeRowSelection}
            tableAlertRender={renderLocaleAlert}
            tableAlertOptionRender={false}
          />
        </Col>

        <Col xs={24} md={12}>
          <ProTable<I18nTranslation>
            headerTitle={
              <Space size={8} align="center" wrap>
                <span>翻译</span>
                {selectedLocale && (
                  <Tag
                    closable
                    onClose={(e) => {
                      e.preventDefault();
                      clearTranslationSelection();
                    }}
                    style={{ margin: 0 }}
                  >
                    {selectedLocale.name}（{selectedLocale.code}）
                  </Tag>
                )}
              </Space>
            }
            cardBordered
            rowKey="id"
            actionRef={translationActionRef}
            columns={translationSearchColumns}
            search={{ labelWidth: 'auto' }}
            request={fetchTranslationRows}
            pagination={{
              defaultPageSize: 20,
              showSizeChanger: true,
              showTotal: (total) => `共 ${total} 条`,
            }}
            scroll={{ x: 'max-content', y: 'calc(100vh - 360px)' }}
            toolBarRender={translationToolbar}
            options={{
              reload: () => translationActionRef.current?.reload?.(),
              setting: { listsHeight: 400 },
            }}
            dateFormatter="string"
            locale={{ emptyText: '暂无数据' }}
            rowSelection={translationRowSelection}
            tableAlertRender={renderTranslationAlert}
            tableAlertOptionRender={false}
          />
        </Col>
      </Row>

      <I18nLocaleDrawer
        open={localeDrawerOpen}
        row={editingLocale}
        onClose={() => setLocaleDrawerOpen(false)}
        onSaved={onLocaleSaved}
      />
      <I18nImportModal
        key={importModalKey}
        open={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        onSuccess={onImportSuccess}
      />
      <Modal
        title="导出 JSON"
        open={exportModalOpen}
        onOk={confirmExport}
        onCancel={() => setExportModalOpen(false)}
        okText="导出"
        cancelText="取消"
        width={400}
        destroyOnClose
      >
        <Space size="middle" align="center">
          <Typography.Text type="secondary">导出格式</Typography.Text>
          <Button
            size="small"
            type={exportType === 'simple' ? 'primary' : 'default'}
            onClick={() => setExportType('simple')}
          >
            Simple
          </Button>
          <Button
            size="small"
            type={exportType === 'raw' ? 'primary' : 'default'}
            onClick={() => setExportType('raw')}
          >
            Raw
          </Button>
        </Space>
      </Modal>
      <I18nTranslationKeyDrawer
        open={translationDrawerOpen}
        sourceRow={editingTranslation}
        defaultLocaleCode={entryLocaleCodeRef.current ?? 'zh-CN'}
        initialKey={newTranslationKey}
        onClose={() => setTranslationDrawerOpen(false)}
        onSaved={onTranslationSaved}
      />
    </ContentContainer>
  );
};

export default I18nPage;
