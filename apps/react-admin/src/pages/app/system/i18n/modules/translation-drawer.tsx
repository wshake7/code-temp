import { useEffect, useMemo } from 'react';
import {
  Button,
  Drawer,
  Form,
  Input,
  Select,
  Space,
  Switch,
  message,
} from 'antd';
import {
  useCreateI18nTranslation,
  useListAllI18nLocale,
  useUpdateI18nTranslation,
} from '@/api/hooks/i18n';
import type {
  CreateI18nTranslationRequest,
  I18nTranslation,
} from '@/api/rest/types';

interface Props {
  open: boolean;
  row: I18nTranslation | null;
  /** 抽屉打开时若指定了 localeId，则锁定 localeId 字段不可改（来自双表选中态） */
  defaultLocaleId?: number;
  onClose: () => void;
  onSaved: () => void;
}

interface FormValues {
  localeId: number;
  translationKey: string;
  value: string;
  remark?: string;
  isEnabled?: boolean;
}

const KEY_PATTERN = /^[a-zA-Z][a-zA-Z0-9._-]{0,254}$/;

const I18nTranslationDrawer = ({
  open,
  row,
  defaultLocaleId,
  onClose,
  onSaved,
}: Props) => {
  const [form] = Form.useForm<FormValues>();
  const allLocalesQuery = useListAllI18nLocale(
    { status: 1 },
    { enabled: open },
  );
  const localeOptions = useMemo(
    () =>
      (allLocalesQuery.data ?? []).map((l) => ({
        label: `${l.name}（${l.code}）`,
        value: l.id,
      })),
    [allLocalesQuery.data],
  );

  const createMut = useCreateI18nTranslation({
    onSuccess: () => {
      message.success('创建成功');
      onSaved();
      onClose();
    },
    onError: (err) => {
      message.error(`创建失败：${(err as Error).message ?? '未知错误'}`);
    },
  });
  const updateMut = useUpdateI18nTranslation({
    onSuccess: () => {
      message.success('保存成功');
      onSaved();
      onClose();
    },
    onError: (err) => {
      message.error(`保存失败：${(err as Error).message ?? '未知错误'}`);
    },
  });
  const isEdit = !!row;
  const submitting = createMut.isPending || updateMut.isPending;

  useEffect(() => {
    if (open) {
      form.setFieldsValue(
        row
          ? {
              localeId: row.localeId,
              translationKey: row.translationKey,
              value: row.value,
              remark: row.remark,
              isEnabled: row.isEnabled === 1,
            }
          : {
              localeId: defaultLocaleId,
              translationKey: '',
              value: '',
              remark: '',
              isEnabled: true,
            },
      );
    }
  }, [open, row, defaultLocaleId, form]);

  const handleOk = async () => {
    const values = await form.validateFields();
    const isEnabled = values.isEnabled ? (1 as const) : (0 as const);
    if (isEdit) {
      updateMut.mutate({
        id: row.id,
        translationKey: values.translationKey,
        value: values.value,
        remark: values.remark ?? '',
        isEnabled,
      });
    } else {
      const body: CreateI18nTranslationRequest = {
        localeId: values.localeId,
        translationKey: values.translationKey,
        value: values.value,
        remark: values.remark ?? '',
        isEnabled,
      };
      createMut.mutate(body);
    }
  };

  return (
    <Drawer
      title={isEdit ? '编辑翻译' : '新建翻译'}
      open={open}
      onClose={onClose}
      size={560}
      destroyOnClose
      footer={
        <Space style={{ float: 'right' }}>
          <Button onClick={onClose} disabled={submitting}>
            取消
          </Button>
          <Button type="primary" onClick={handleOk} loading={submitting}>
            保存
          </Button>
        </Space>
      }
    >
      <Form form={form} layout="vertical" preserve={false}>
        <Form.Item
          label="所属语言"
          name="localeId"
          rules={[{ required: true, message: '请选择所属语言' }]}
        >
          <Select
            placeholder="请选择语言"
            options={localeOptions}
            showSearch
            optionFilterProp="label"
            disabled={isEdit}
          />
        </Form.Item>
        <Form.Item
          label="翻译键"
          name="translationKey"
          rules={[
            { required: true, message: '请输入翻译键' },
            { max: 255 },
            {
              pattern: KEY_PATTERN,
              message: '字母开头，仅含字母数字 . _ -',
            },
          ]}
        >
          <Input placeholder="例如 common.confirm" disabled={isEdit} />
        </Form.Item>
        <Form.Item
          label="翻译值"
          name="value"
          rules={[{ required: true, message: '请输入翻译值' }]}
        >
          <Input placeholder="例如 确认" />
        </Form.Item>
        <Form.Item label="备注" name="remark">
          <Input.TextArea rows={3} placeholder="选填" />
        </Form.Item>
        <Form.Item
          label="启用"
          name="isEnabled"
          valuePropName="checked"
          getValueFromEvent={(v) => !!v}
          getValueProps={(v) => ({ checked: v !== false })}
        >
          <Switch checkedChildren="启用" unCheckedChildren="禁用" />
        </Form.Item>
      </Form>
    </Drawer>
  );
};

export default I18nTranslationDrawer;
