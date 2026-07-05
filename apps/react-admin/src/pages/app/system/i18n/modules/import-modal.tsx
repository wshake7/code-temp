import { useState } from 'react';
import {
  Button,
  message,
  Modal,
  Radio,
  Select,
  Space,
  Typography,
  Upload,
} from 'antd';
import { DownloadOutlined, InboxOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';
import type { RcCustomRequestOptions } from 'antd/es/upload/interface';
import { useImportI18n, useListAllI18nLocale } from '@/api/hooks/i18n';

const { Text } = Typography;
const { Dragger } = Upload;

interface I18nImportModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface ImportRequestBody {
  data: unknown;
  targetLocaleCode?: string;
}

const I18nImportModal: React.FC<I18nImportModalProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const [importType, setImportType] = useState<'raw' | 'simple'>('simple');
  const [targetLocaleCode, setTargetLocaleCode] = useState<string | undefined>(
    undefined,
  );
  const [uploading, setUploading] = useState(false);

  const { data: locales = [] } = useListAllI18nLocale(
    { status: 1 },
    { enabled: open },
  );

  const importMutation = useImportI18n();

  const localeOptions = locales.map((l) => ({
    label: `${l.name}（${l.code}）`,
    value: l.code,
  }));

  const showTargetLocale = importType === 'simple';

  const downloadTemplate = () => {
    let template: unknown;
    if (importType === 'raw') {
      template = {
        '@type': 'raw',
        locales: [
          {
            code: 'zh-CN',
            name: '简体中文',
            isDefault: 1,
            sort: 0,
            isEnabled: 1,
          },
        ],
        translations: [
          {
            localeCode: 'zh-CN',
            translationKey: 'common.save',
            value: '保存',
            isEnabled: 1,
          },
        ],
      };
    } else {
      template = {
        '@type': 'simple',
        locales: {
          'zh-CN': {
            'common.save': '保存',
            'common.cancel': '取消',
          },
          'en-US': {
            'common.save': 'Save',
            'common.cancel': 'Cancel',
          },
        },
      };
    }

    const blob = new Blob([JSON.stringify(template, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `i18n-${importType}-template.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleUpload: UploadProps['customRequest'] = async (
    options: RcCustomRequestOptions,
  ) => {
    const { file, onSuccess: onUploadSuccess, onError } = options;

    setUploading(true);
    try {
      const text = await (file as File).text();
      let data: unknown;
      try {
        data = JSON.parse(text);
      } catch {
        message.error('文件内容不是合法的 JSON');
        onError?.(new Error('非法 JSON'));
        return;
      }

      const body: ImportRequestBody = { data };

      if (importType === 'simple' && targetLocaleCode) {
        body.targetLocaleCode = targetLocaleCode;
      }

      await importMutation.mutateAsync(body);
      message.success('导入成功');
      onUploadSuccess?.(body);
      onSuccess();
      onClose();
    } catch (error: unknown) {
      message.error(`导入失败：${(error as Error).message ?? '未知错误'}`);
      onError?.(error as Error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Modal
      title="导入 JSON"
      open={open}
      onCancel={onClose}
      footer={null}
      width={560}
      destroyOnClose
    >
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        {/* 导入类型 */}
        <div>
          <Text>导入格式</Text>
          <div style={{ marginTop: 4 }}>
            <Radio.Group
              value={importType}
              onChange={(e) => setImportType(e.target.value)}
              optionType="button"
            >
              <Radio.Button value="simple">
                Simple（纯翻译 key-value）
              </Radio.Button>
              <Radio.Button value="raw">Raw（表格原始数据）</Radio.Button>
            </Radio.Group>
          </div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Simple 适合导入纯翻译文案；Raw 可同时导入语言定义和翻译数据
          </Text>
        </div>

        {/* 目标语言（simple 时显示） */}
        {showTargetLocale && (
          <div>
            <Text>目标语言</Text>
            <Select
              value={targetLocaleCode}
              onChange={setTargetLocaleCode}
              options={localeOptions}
              placeholder="选择要导入到的语言（若 JSON 已按语言分组则无需选择）"
              style={{ width: '100%', marginTop: 4 }}
              allowClear
            />
            <Text type="secondary" style={{ fontSize: 12 }}>
              如果导入的 JSON
              文件已经按语言分组（含 @type），则无需选择，系统会从 JSON 中自动匹配
            </Text>
          </div>
        )}

        {/* 模板下载 */}
        <div>
          <Button icon={<DownloadOutlined />} onClick={downloadTemplate}>
            下载 {importType === 'simple' ? 'Simple' : 'Raw'} 模板
          </Button>
        </div>

        {/* 上传区域 */}
        <div>
          <Text>选择文件</Text>
          <div style={{ marginTop: 4 }}>
            <Dragger
              customRequest={handleUpload}
              accept=".json"
              maxCount={1}
              showUploadList={{ showRemoveIcon: false }}
              disabled={uploading}
            >
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">
                点击或拖拽 JSON 文件到此区域上传
              </p>
              <p className="ant-upload-hint">仅支持 .json 格式文件</p>
            </Dragger>
          </div>
        </div>

        {/* 说明 */}
        <div
          style={{
            padding: '8px 12px',
            fontSize: 12,
            color: '#666',
            background: '#e6f4ff',
            borderLeft: '3px solid #1677ff',
            borderRadius: 4,
            display: 'flex',
            alignItems: 'flex-start',
            gap: 4,
          }}
        >
          <span>
            导入时若键已存在，会将旧记录软删除后插入新记录。选择文件后自动上传。
          </span>
        </div>
      </Space>
    </Modal>
  );
};

export default I18nImportModal;
