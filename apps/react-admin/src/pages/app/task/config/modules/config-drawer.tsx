import { useEffect, useMemo } from 'react';
import {
  Button,
  Drawer,
  Form,
  Input,
  InputNumber,
  Select,
  Space,
  Switch,
  message,
} from 'antd';
import { useTranslation } from 'react-i18next';
import {
  useCreateTaskConfig,
  useListTaskQueues,
  useListTaskWorkflowTypes,
  useUpdateTaskConfig,
} from '@/api/hooks/task-config';
import type { CreateTaskConfigRequest, TaskConfig, TaskSelectOption } from '@/api/rest/types';
import { getApiErrorMessage } from '../../modules/error-message';

/** 编辑时若当前值不在选项中，合并进去以保证回显 */
function mergeCurrentOption(
  options: TaskSelectOption[] | undefined,
  current: string | undefined | null,
): TaskSelectOption[] {
  const base = options ?? [];
  const v = (current ?? '').trim();
  if (!v) return base;
  if (base.some((o) => o.value === v)) return base;
  return [{ label: v, value: v }, ...base];
}

const CODE_PATTERN = /^[a-z][a-z0-9_]{0,63}$/;

interface Props {
  open: boolean;
  row: TaskConfig | null;
  onClose: () => void;
  onSaved: () => void;
}

interface FormValues {
  code: string;
  name: string;
  workflowType: string;
  taskQueue: string;
  cronExpr?: string;
  timeoutSeconds?: number | null;
  retryPolicyText?: string;
  remark?: string;
  isEnabled?: boolean;
}

function formatRetryPolicy(policy: Record<string, unknown> | null | undefined): string {
  if (!policy) return '';
  try {
    return JSON.stringify(policy, null, 2);
  } catch {
    return '';
  }
}

function parseRetryPolicy(
  text: string | undefined,
): { ok: true; value: Record<string, unknown> | null } | { ok: false; message: string } {
  const raw = (text ?? '').trim();
  if (!raw) return { ok: true, value: null };
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return { ok: false, message: 'object' };
    }
    return { ok: true, value: parsed as Record<string, unknown> };
  } catch {
    return { ok: false, message: 'json' };
  }
}

const TaskConfigDrawer = ({ open, row, onClose, onSaved }: Props) => {
  const { t } = useTranslation('task');
  const [form] = Form.useForm<FormValues>();
  const { data: workflowTypeOptions, isLoading: workflowTypesLoading } =
    useListTaskWorkflowTypes({ enabled: open });
  const { data: taskQueueOptions, isLoading: taskQueuesLoading } = useListTaskQueues({
    enabled: open,
  });
  const workflowSelectOptions = useMemo(
    () => mergeCurrentOption(workflowTypeOptions, row?.workflowType),
    [workflowTypeOptions, row?.workflowType],
  );
  const queueSelectOptions = useMemo(
    () => mergeCurrentOption(taskQueueOptions, row?.taskQueue),
    [taskQueueOptions, row?.taskQueue],
  );
  const createMut = useCreateTaskConfig({
    onSuccess: () => {
      message.success(t('createSuccess'));
      onSaved();
      onClose();
    },
    onError: (err) => {
      message.error(`${t('createFailed')}：${getApiErrorMessage(err, t('unknownError'))}`);
    },
  });
  const updateMut = useUpdateTaskConfig({
    onSuccess: () => {
      message.success(t('updateSuccess'));
      onSaved();
      onClose();
    },
    onError: (err) => {
      message.error(`${t('updateFailed')}：${getApiErrorMessage(err, t('unknownError'))}`);
    },
  });
  const isEdit = !!row;
  const submitting = createMut.isPending || updateMut.isPending;

  useEffect(() => {
    if (!open) return;
    form.setFieldsValue(
      row
        ? {
            code: row.code,
            name: row.name,
            workflowType: row.workflowType,
            taskQueue: row.taskQueue,
            cronExpr: row.cronExpr ?? '',
            timeoutSeconds: row.timeoutSeconds,
            retryPolicyText: formatRetryPolicy(row.retryPolicy),
            remark: row.remark,
            isEnabled: row.isEnabled === 1,
          }
        : {
            code: '',
            name: '',
            workflowType: '',
            taskQueue: '',
            cronExpr: '',
            timeoutSeconds: undefined,
            retryPolicyText: '{\n  "maxAttempts": 3\n}',
            remark: '',
            isEnabled: true,
          },
    );
  }, [open, row, form]);

  const handleOk = async () => {
    const values = await form.validateFields();
    const parsed = parseRetryPolicy(values.retryPolicyText);
    if (!parsed.ok) {
      form.setFields([
        {
          name: 'retryPolicyText',
          errors: [t(parsed.message === 'object' ? 'retryPolicyObject' : 'retryPolicyInvalid')],
        },
      ]);
      return;
    }

    const cronRaw = values.cronExpr;
    const cronExpr =
      cronRaw !== undefined && cronRaw !== null && String(cronRaw).trim() !== ''
        ? String(cronRaw).trim()
        : null;
    const timeoutSeconds =
      values.timeoutSeconds === undefined || values.timeoutSeconds === null
        ? null
        : Number(values.timeoutSeconds);
    const isEnabled = values.isEnabled ? (1 as const) : (0 as const);
    const base = {
      name: values.name.trim(),
      workflowType: values.workflowType.trim(),
      taskQueue: values.taskQueue.trim(),
      cronExpr,
      timeoutSeconds,
      retryPolicy: parsed.value,
      remark: values.remark ?? '',
      isEnabled,
    };

    if (isEdit && row) {
      updateMut.mutate({
        id: row.id,
        code: values.code.trim(),
        ...base,
      });
    } else {
      const body: CreateTaskConfigRequest = {
        code: values.code.trim(),
        ...base,
      };
      createMut.mutate(body);
    }
  };

  return (
    <Drawer
      title={isEdit ? t('editConfig') : t('createConfig')}
      open={open}
      onClose={onClose}
      size={560}
      destroyOnClose
      footer={
        <Space style={{ float: 'right' }}>
          <Button onClick={onClose} disabled={submitting}>
            {t('cancel')}
          </Button>
          <Button type="primary" onClick={handleOk} loading={submitting}>
            {t('save')}
          </Button>
        </Space>
      }
    >
      <Form form={form} layout="vertical" preserve={false}>
        <Form.Item
          label={t('code')}
          name="code"
          rules={[
            { required: true, message: t('requiredCode') },
            { pattern: CODE_PATTERN, message: t('codeRule') },
          ]}
        >
          <Input placeholder={t('codePlaceholder')} />
        </Form.Item>
        <Form.Item
          label={t('name')}
          name="name"
          rules={[
            { required: true, message: t('requiredName') },
            { max: 128, message: t('nameMax') },
          ]}
        >
          <Input placeholder={t('namePlaceholder')} />
        </Form.Item>
        <Form.Item
          label={t('workflowType')}
          name="workflowType"
          rules={[{ required: true, message: t('requiredWorkflowType') }]}
        >
          <Select
            showSearch
            optionFilterProp="label"
            loading={workflowTypesLoading}
            options={workflowSelectOptions}
            placeholder={t('workflowTypePlaceholder')}
            allowClear
          />
        </Form.Item>
        <Form.Item
          label={t('taskQueue')}
          name="taskQueue"
          rules={[{ required: true, message: t('requiredTaskQueue') }]}
        >
          <Select
            showSearch
            optionFilterProp="label"
            loading={taskQueuesLoading}
            options={queueSelectOptions}
            placeholder={t('taskQueuePlaceholder')}
            allowClear
          />
        </Form.Item>
        <Form.Item
          label={t('cronExpr')}
          name="cronExpr"
          rules={[{ max: 64, message: t('cronMax') }]}
          extra={t('cronHint')}
        >
          <Input placeholder={t('cronPlaceholder')} allowClear />
        </Form.Item>
        <Form.Item label={t('timeoutSeconds')} name="timeoutSeconds">
          <InputNumber min={0} precision={0} style={{ width: '100%' }} placeholder={t('timeoutPlaceholder')} />
        </Form.Item>
        <Form.Item
          label={t('retryPolicy')}
          name="retryPolicyText"
          extra={t('retryPolicyHint')}
        >
          <Input.TextArea rows={6} placeholder='{"maxAttempts": 3}' style={{ fontFamily: 'monospace' }} />
        </Form.Item>
        <Form.Item label={t('remark')} name="remark">
          <Input.TextArea rows={3} placeholder={t('remarkPlaceholder')} />
        </Form.Item>
        <Form.Item
          label={t('isEnabled')}
          name="isEnabled"
          valuePropName="checked"
          getValueFromEvent={(v) => !!v}
          getValueProps={(v) => ({ checked: v !== false })}
        >
          <Switch checkedChildren={t('enabled')} unCheckedChildren={t('disabled')} />
        </Form.Item>
      </Form>
    </Drawer>
  );
};

export default TaskConfigDrawer;
