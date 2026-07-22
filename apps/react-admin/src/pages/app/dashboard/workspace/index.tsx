import { Avatar, Card, Col, List, Progress, Row, Space, Tag, Typography } from 'antd';
import {
  GithubOutlined,
  Html5Outlined,
  CodeOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores';
import ContentContainer from '@/layouts/components/PageContainer/ContentContainer';

const { Text, Title, Link } = Typography;

const projectItems = [
  {
    title: 'Github',
    group: '开源组',
    content: '不要等待机会，而要创造机会。',
    date: '2021-04-01',
    icon: <GithubOutlined />,
    url: 'https://github.com',
  },
  {
    title: 'Vue',
    group: '算法组',
    content: '现在的你决定将来的你。',
    date: '2021-04-01',
    icon: <CodeOutlined style={{ color: '#3fb27f' }} />,
    url: 'https://vuejs.org',
  },
  {
    title: 'Html5',
    group: '上班摸鱼',
    content: '没有什么才能比努力更重要。',
    date: '2021-04-01',
    icon: <Html5Outlined style={{ color: '#e18525' }} />,
    url: 'https://developer.mozilla.org/zh-CN/docs/Web/HTML',
  },
  {
    title: 'React',
    group: '技术牛',
    content: '健康的身体是实现目标的基石。',
    date: '2021-04-01',
    icon: <ThunderboltOutlined style={{ color: '#00d8ff' }} />,
    url: 'https://reactjs.org',
  },
];

const quickNav = [
  { title: '分析页', path: '/analytics', color: '#1677ff' },
  { title: '工作台', path: '/workspace', color: '#52c41a' },
  { title: '用户管理', path: '/system/user', color: '#fa8c16' },
  { title: '角色管理', path: '/system/role', color: '#722ed1' },
  { title: '菜单管理', path: '/system/menu', color: '#13c2c2' },
  { title: '接口管理', path: '/system/api', color: '#eb2f96' },
];

const todoItems = [
  {
    title: '审查前端代码提交',
    content: '审查最近提交到 Git 仓库的前端代码，确保代码质量和规范。',
    completed: false,
  },
  {
    title: '系统性能优化',
    content: '检查并优化系统性能，降低 CPU 使用率。',
    completed: true,
  },
  {
    title: '安全检查',
    content: '进行系统安全检查，确保没有安全漏洞或未授权的访问。',
    completed: false,
  },
  {
    title: '更新项目依赖',
    content: '更新项目中的依赖包，确保使用较新的稳定版本。',
    completed: false,
  },
];

/**
 * 工作台（对齐 Vue dashboard/workspace 信息架构）
 */
const WorkspacePage = () => {
  const navigate = useNavigate();
  const userInfo = useAuthStore((s) => s.userInfo);
  const displayName = userInfo?.realName || userInfo?.username || 'User';

  return (
    <ContentContainer heightMode="auto" scrollable padding="16px">
      <Card style={{ marginBottom: 16 }}>
        <Space size={16} align="center">
          <Avatar size={64} style={{ backgroundColor: '#1677ff' }}>
            {displayName.slice(0, 1).toUpperCase()}
          </Avatar>
          <div>
            <Title level={4} style={{ margin: 0 }}>
              早安，{displayName}，开始您一天的工作吧！
            </Title>
            <Text type="secondary">今日晴，20℃ - 32℃！</Text>
          </div>
        </Space>
      </Card>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card title="项目" style={{ marginBottom: 16 }}>
            <List
              grid={{ gutter: 16, xs: 1, sm: 2 }}
              dataSource={projectItems}
              renderItem={(item) => (
                <List.Item>
                  <Card
                    size="small"
                    hoverable
                    onClick={() => window.open(item.url, '_blank', 'noopener,noreferrer')}
                  >
                    <Space align="start">
                      <Avatar icon={item.icon} />
                      <div>
                        <div>
                          <Text strong>{item.title}</Text>
                          <Tag style={{ marginLeft: 8 }}>{item.group}</Tag>
                        </div>
                        <Text type="secondary">{item.content}</Text>
                        <div>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            {item.date}
                          </Text>
                        </div>
                      </div>
                    </Space>
                  </Card>
                </List.Item>
              )}
            />
          </Card>

          <Card title="待办">
            <List
              dataSource={todoItems}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    title={
                      <Space>
                        <Text delete={item.completed}>{item.title}</Text>
                        <Tag color={item.completed ? 'success' : 'processing'}>
                          {item.completed ? '已完成' : '进行中'}
                        </Tag>
                      </Space>
                    }
                    description={item.content}
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="快捷导航" style={{ marginBottom: 16 }}>
            <Row gutter={[12, 12]}>
              {quickNav.map((item) => (
                <Col span={12} key={item.path}>
                  <Card
                    size="small"
                    hoverable
                    styles={{ body: { textAlign: 'center', padding: 12 } }}
                    onClick={() => navigate(item.path)}
                  >
                    <div
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        background: item.color,
                        margin: '0 auto 8px',
                      }}
                    />
                    <Link>{item.title}</Link>
                  </Card>
                </Col>
              ))}
            </Row>
          </Card>

          <Card title="效率">
            <Text type="secondary">本周完成度</Text>
            <Progress percent={68} status="active" style={{ marginTop: 8 }} />
            <Text type="secondary">代码提交</Text>
            <Progress percent={42} style={{ marginTop: 8 }} />
          </Card>
        </Col>
      </Row>
    </ContentContainer>
  );
};

export default WorkspacePage;
