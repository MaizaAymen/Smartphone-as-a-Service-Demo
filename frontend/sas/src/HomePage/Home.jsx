import React, { useState, useEffect } from 'react';
import {
  Layout,
  Typography,
  Button,
  Card,
  Space,
  Alert,
  Spin,
  Row,
  Col,
  notification,
  Menu,
  Breadcrumb,
  theme
} from 'antd';
import {
  CloudUploadOutlined,
  PlayCircleOutlined,
  AlertOutlined,
  DashboardOutlined,
  StopOutlined,
  CameraOutlined,
  LoadingOutlined,
  LaptopOutlined,
  NotificationOutlined,
  UserOutlined
} from '@ant-design/icons';
import './Dashboard.css';

const { Header, Content, Footer, Sider } = Layout;
const { Title, Text, Paragraph } = Typography;

const BACKEND = "http://127.0.0.1:8000";

// Menu items for top navigation
const items1 = ['1', '2', '3'].map(key => ({
  key,
  label: `nav ${key}`,
}));

// Sidebar menu items
const items2 = [UserOutlined, LaptopOutlined, NotificationOutlined].map((icon, index) => {
  const key = String(index + 1);
  return {
    key: `sub${key}`,
    icon: React.createElement(icon),
    label: `subnav ${key}`,
    children: Array.from({ length: 4 }).map((_, j) => {
      const subKey = index * 4 + j + 1;
      return {
        key: subKey,
        label: `option${subKey}`,
      };
    }),
  };
});

const Dashboard = () => {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  const [output, setOutput] = useState("Connecting to backend...");
  const [screenshot, setScreenshot] = useState(null);
  const [loadingTest, setLoadingTest] = useState(false);
  const [loadingScreenshot, setLoadingScreenshot] = useState(false);
  const [loadingActions, setLoadingActions] = useState({});
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [stats, setStats] = useState(null);
  const [batteryLevel, setBatteryLevel] = useState(null);
  const [cpuInfo, setCpuInfo] = useState("");
  const [memoryInfo, setMemoryInfo] = useState("");
  const [launchTime, setLaunchTime] = useState(null);
  const [hardwareDelta, setHardwareDelta] = useState(null);
  const [loadingDelta, setLoadingDelta] = useState(false);

  // Check backend health on load
  useEffect(() => {
    checkBackendHealth();
  }, []);

  const checkBackendHealth = async () => {
    try {
      const response = await fetch(BACKEND + "/health");
      const data = await response.json();
      setOutput(`✅ Backend Connected\n\n${JSON.stringify(data, null, 2)}`);
      setConnectionStatus('connected');
    } catch (error) {
      setOutput("❌ Cannot reach backend. Please ensure the backend server is running.");
      setConnectionStatus('disconnected');
    }
  };

  // Call JSON endpoints
  const callJSON = async (endpoint, actionName) => {
    setLoadingActions(prev => ({ ...prev, [actionName]: true }));
    
    try {
      const response = await fetch(BACKEND + endpoint, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        mode: "cors",
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      setOutput(JSON.stringify(data, null, 2));
      
      notification.success({
        message: `${actionName} Successful`,
        description: 'Request completed successfully',
      });
    } catch (err) {
      setOutput(`Error: ${err.message}`);
      notification.error({
        message: `${actionName} Failed`,
        description: err.message,
      });
    } finally {
      setLoadingActions(prev => ({ ...prev, [actionName]: false }));
    }
  };

  // Run test and capture screenshot
  const runTestAndShowScreenshot = async () => {
    setLoadingTest(true);
    setLoadingScreenshot(true);
    setLoadingDelta(true);

    try {
      setOutput("Running performance test...");

      // 1️⃣ Fetch hardware delta
      const response = await fetch(BACKEND + "/hardware-delta");
      if (!response.ok) throw new Error("Test failed");

      const data = await response.json();

      // Save stats
      setStats(data);
      setLaunchTime(data.launch_time_ms || 0);
      setCpuInfo(data.cpu_after || "No data available");
      setMemoryInfo(data.ram_after_MB ? `${data.ram_after_MB} MB` : "No data available");
      setBatteryLevel(data.battery_after || "N/A");
      setHardwareDelta(data);

      // 2️⃣ Fetch screenshot
      const screenshotResponse = await fetch(BACKEND + "/screenshot");
      const blob = await screenshotResponse.blob();
      setScreenshot(URL.createObjectURL(blob));

      setOutput("✅ Test & metrics collected successfully");

      notification.success({
        message: "Test Completed",
        description: "Performance metrics collected",
      });

    } catch (err) {
      setOutput(`Error: ${err.message}`);
      notification.error({
        message: "Test Failed",
        description: err.message,
      });
    } finally {
      setLoadingTest(false);
      setLoadingScreenshot(false);
      setLoadingDelta(false);
    }
  };

  // Check if any action is loading
  const isAnyLoading = loadingTest || Object.values(loadingActions).some(Boolean);

  return (
    <Layout>
      <Header style={{ display: 'flex', alignItems: 'center' }}>
        <div className="demo-logo" />
        <Menu
          theme="dark"
          mode="horizontal"
          defaultSelectedKeys={['2']}
          items={items1}
          style={{ flex: 1, minWidth: 0 }}
        />
      </Header>
      
      <div style={{ padding: '0 48px' }}>
        <Breadcrumb
          style={{ margin: '16px 0' }}
          items={[{ title: 'Home' }, { title: 'Dashboard' }, { title: 'Device Control' }]}
        />
        
        <Layout
          style={{ padding: '24px 0', background: colorBgContainer, borderRadius: borderRadiusLG }}
        >
          <Sider style={{ background: colorBgContainer }} width={200}>
            <Menu
              mode="inline"
              defaultSelectedKeys={['1']}
              defaultOpenKeys={['sub1']}
              style={{ height: '100%' }}
              items={items2}
            />
          </Sider>
          
          <Content style={{ padding: '0 24px', minHeight: 280 }}>
            {/* Original Dashboard Content */}
            <div className="dashboard-container">
              {/* Control Panel */}
              <Card 
                title="Device Control Panel" 
                style={{ marginBottom: 24 }}
                bordered={false}
              >
                <div className="buttons-container">
                  <Space wrap>
                    <Button
                      type="default"
                      icon={<CloudUploadOutlined />}
                      size="large"
                      onClick={() => callJSON("/reserve", "reserve")}
                      loading={loadingActions.reserve}
                      disabled={isAnyLoading || connectionStatus === 'disconnected'}
                    >
                      Reserve Device
                    </Button>
                    
                    <Button
                      type="primary"
                      icon={loadingTest ? <LoadingOutlined /> : <PlayCircleOutlined />}
                      size="large"
                      onClick={runTestAndShowScreenshot}
                      loading={loadingTest}
                      disabled={isAnyLoading || connectionStatus === 'disconnected'}
                    >
                      Run Test
                    </Button>
                    
                    <Button
                      type="default"
                      icon={<AlertOutlined />}
                      size="large"
                      onClick={() => callJSON("/run-alert-test", "alertTest")}
                      loading={loadingActions.alertTest}
                      disabled={isAnyLoading || connectionStatus === 'disconnected'}
                    >
                      Run Alert Test
                    </Button>
                    
                    <Button
                      type="default"
                      icon={<DashboardOutlined />}
                      size="large"
                      onClick={() => callJSON("/metrics", "metrics")}
                      loading={loadingActions.metrics}
                      disabled={isAnyLoading || connectionStatus === 'disconnected'}
                    >
                      View Metrics
                    </Button>
                    
                    <Button
                      type="danger"
                      icon={<StopOutlined />}
                      size="large"
                      onClick={() => callJSON("/release", "release")}
                      loading={loadingActions.release}
                      disabled={isAnyLoading || connectionStatus === 'disconnected'}
                    >
                      Release Device
                    </Button>
                  </Space>
                </div>
                
                {connectionStatus === 'disconnected' && (
                  <Alert
                    message="Backend Connection Error"
                    description="Unable to connect to the backend server. Please ensure it's running on http://127.0.0.1:8000"
                    type="error"
                    showIcon
                    style={{ marginTop: 16 }}
                  />
                )}
              </Card>

              {/* Screenshot Display */}
              <Row gutter={[24, 24]}>
                <Col xs={24} lg={screenshot ? 6 : 4}>
                  <Card
                    className="screenshot-card"
                    title={
                      <Space>
                        <CameraOutlined />
                        <span>Live Device Screenshot</span>
                        {loadingScreenshot && <Spin size="small" />}
                      </Space>
                    }
                    style={{ height: '100%' }}
                  >
                    {loadingScreenshot ? (
                      <div className="loading-overlay">
                        <Spin size="large" />
                        <Text>Capturing screenshot...</Text>
                      </div>
                    ) : screenshot ? (
                      <img
                        src={screenshot}
                        alt="Device Screenshot"
                        className="screenshot-image"
                      />
                    ) : (
                      <div className="screenshot-placeholder">
                        <CameraOutlined style={{ fontSize: 48, marginBottom: 16, color: '#d9d9d9' }} />
                        <Paragraph type="secondary">
                          No screenshot available. Run a test to capture device screenshot.
                        </Paragraph>
                      </div>
                    )}
                  </Card>
                </Col>

                {/* Output/Logs */}
                {screenshot && (
                  <Col xs={24} lg={8}>
                    <Card
                      title="Test Status"
                      style={{ height: '100%' }}
                    >
                      <Paragraph type="secondary" style={{ marginBottom: 8 }}>
                        Last operation result:
                      </Paragraph>
                      <div className="logs-content">
                        {output}
                      </div>
                    </Card>
                  </Col>
                )}
              </Row>

              {/* Full-width logs when no screenshot */}
              {!screenshot && (
                <Card
                  title="System Logs & Output"
                  style={{ marginTop: 24 }}
                  className="logs-container"
                >
                  <div className="logs-content">
                    {output}
                  </div>
                </Card>
              )}

              {/* Hardware Delta Metrics Display */}
              {hardwareDelta && (
                <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
                  <Col xs={24} md={6}>
                    <Card>
                      <Title level={5}>🚀 Launch Time</Title>
                      <Text strong style={{ fontSize: '18px' }}>
                        {hardwareDelta.launch_time_ms ? `${hardwareDelta.launch_time_ms} ms` : "N/A"}
                      </Text>
                    </Card>
                  </Col>

                  <Col xs={24} md={6}>
                    <Card>
                      <Title level={5}>🧠 CPU Usage</Title>
                      <Paragraph className="metric-text">
                        <Text strong>Before:</Text> {hardwareDelta.cpu_before || "N/A"} <br />
                        <Text strong>After:</Text> {hardwareDelta.cpu_after || "N/A"}
                      </Paragraph>
                    </Card>
                  </Col>

                  <Col xs={24} md={6}>
                    <Card>
                      <Title level={5}>💾 Memory (RAM)</Title>
                      <Paragraph className="metric-text">
                        <Text strong>Before:</Text> {hardwareDelta.ram_before_MB ? `${hardwareDelta.ram_before_MB} MB` : "N/A"} <br />
                        <Text strong>After:</Text> {hardwareDelta.ram_after_MB ? `${hardwareDelta.ram_after_MB} MB` : "N/A"} <br />
                        <Text strong>Δ:</Text> {hardwareDelta.ram_diff_MB ? `${hardwareDelta.ram_diff_MB} MB` : "N/A"}
                      </Paragraph>
                    </Card>
                  </Col>

                  <Col xs={24} md={6}>
                    <Card>
                      <Title level={5}>🔋 Battery Drain</Title>
                      <Text strong style={{ fontSize: '18px' }}>
                        {hardwareDelta?.battery_drain_mAh != null 
                          ? `${hardwareDelta.battery_drain_mAh.toFixed(6)} mAh`
                          : "N/A"}
                      </Text>
                    </Card>
                  </Col>
                </Row>
              )}

              {/* Status Bar */}
              <Card style={{ marginTop: 24 }} size="small">
                <Row justify="space-between" align="middle">
                  <Col>
                    <Space>
                      <Spin size="small" spinning={isAnyLoading} />
                      <Text type="secondary">
                        {isAnyLoading ? 'Processing request...' : 'Ready'}
                      </Text>
                    </Space>
                  </Col>
                  <Col>
                    <Space>
                      <div style={{
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        backgroundColor: connectionStatus === 'connected' ? '#52c41a' : '#ff4d4f'
                      }} />
                      <Text type="secondary">
                        Backend: {connectionStatus === 'connected' ? 'Connected' : 'Disconnected'}
                      </Text>
                    </Space>
                  </Col>
                </Row>
              </Card>
            </div>
          </Content>
        </Layout>
      </div>
      
      <Footer style={{ textAlign: 'center' }}>
        Ant Design ©{new Date().getFullYear()} Created by Ant UED
      </Footer>
    </Layout>
  );
};

export default Dashboard;