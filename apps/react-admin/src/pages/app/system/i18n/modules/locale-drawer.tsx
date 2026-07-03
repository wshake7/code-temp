import { useEffect } from 'react';
import {
  Button,
  Drawer,
  Form,
  Input,
  InputNumber,
  Space,
  Switch,
  message,
} from 'antd';
import {
  useCreateI18nLocale,
  useUpdateI18nLocale,
} from '@/api/hooks/i18n';
import type { CreateI18nLocaleRequest, I18nLocale } from '@/api/rest/types';

interface Props {
  open: boolean;
  row: I18nLocale | null;
  onClose: () => void;
  onSaved: () => void;
}

interface FormValues {
  code: string;
  name: string;
  sort?: number;
  remark?: string;
  isDefault?: boolean;
  isEnabled?: boolean;
}

const CODE_PATTERN = /^[A-Za-z]{2,3}(-[A-Za-z]{2,4})?$/;

const I18nLocaleDrawer = ({ open, row, onClose, onSaved }: Props) => {
  const [form] = Form.useForm<FormValues>();
  const createMut = useCreateI18nLocale({
    onSuccess: () => {
      message.success('创建成功');
      onSaved();
      onClose();
    },
    onError: (err) => {
      message.error(`创建失败：${(err as Error).message ?? '未知错误'}`);
    },
  });
  const updateMut = useUpdateI18nLocale({
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
              code: row.code,
              name: row.name,
              sort: row.sort,
              remark: row.remark,
              isDefault: row.isDefault === 1,
              isEnabled: row.isEnabled === 1,
            }
          : {
              code: '',
              name: '',
              sort: 0,
              remark: '',
              isDefault: false,
              isEnabled: true,
            },
      );
    }
  }, [open, row, form]);

  const handleOk = async () => {
    const values = await form.validateFields();
    const isDefault = values.isDefault ? (1 as const) : (0 as const);
    const isEnabled = values.isEnabled ? (1 as const) : (0 as const);
    if (isEdit) {
      updateMut.mutate({
        id: row.id,
        code: values.code,
        name: values.name,
        sort: values.sort ?? 0,
        remark: values.remark ?? '',
        isDefault,
        isEnabled,
      });
    } else {
      const body: CreateI18nLocaleRequest = {
        code: values.code,
        name: values.name,
        sort: values.sort ?? 0,
        remark: values.remark ?? '',
        isDefault,
        isEnabled,
      };
      createMut.mutate(body);
    }
  };

  return (
    <Drawer
      title={isEdit ? '编辑语言' : '新建语言'}
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
          label="语言代码"
          name="code"
          rules={[
            { required: true, message: '请输入语言代码' },
            {
              pattern: CODE_PATTERN,
              message: '形如 zh-CN / en-US / ja-JP（BCP-47 风格）',
            },
          ]}
        >
          <Input placeholder="例如 zh-CN" disabled={isEdit} />
        </Form.Item>
        <Form.Item
          label="语言名称"
          name="name"
          rules={[{ required: true, message: '请输入语言名称' }, { max: 64 }]}
        >
          <Input placeholder="例如 简体中文" />
        </Form.Item>
        <Form.Item label="排序" name="sort" rules={[{ type: 'number' }]}>
          <InputNumber style={{ width: '100%' }} placeholder="升序排序" />
        </Form.Item>
        <Form.Item label="备注" name="remark">
          <Input.TextArea rows={3} placeholder="选填" />
        </Form.Item>
        <Form.Item
          label="设为默认语言"
          name="isDefault"
          valuePropName="checked"
          getValueFromEvent={(v) => !!v}
          getValueProps={(v) => ({ checked: !!v })}
        >
          <Switch checkedChildren="默认" unCheckedChildren="否" />
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

export default I18nLocaleDrawer;
