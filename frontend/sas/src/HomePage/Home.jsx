import { useState } from 'react';
import {
  DesktopOutlined,
  FileOutlined,
  PieChartOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Breadcrumb, Layout, Menu, theme } from 'antd';
const { Header, Content, Footer, Sider } = Layout;
function getItem(label, key, icon, children) {
  return {
    key,
    icon,
    children,
    label,
  };
}
const items = [
  getItem('Option 1', '1', <PieChartOutlined />),
  getItem('Option 2', '2', <DesktopOutlined />),
  getItem('User', 'sub1', <UserOutlined />, [
    getItem('Tom', '3'),
    getItem('Bill', '4'),
    getItem('Alex', '5'),
  ]),
  getItem('Team', 'sub2', <TeamOutlined />, [getItem('Team 1', '6'), getItem('Team 2', '8')]),
  getItem('Files', '9', <FileOutlined />),
];
const HomePage = () => {
      const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();


//***************************** */


const BACKEND = "https://cheese-cia-base-jean.trycloudflare.com";

async function call(endpoint) {
  try {
    const response = await fetch(BACKEND + endpoint, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      mode: 'cors', // Explicitly set CORS mode
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    document.getElementById("out").textContent = JSON.stringify(data, null, 2);
  } catch (e) {
    document.getElementById("out").textContent = `Error: ${e.message}\n\nTroubleshooting:\n- Is backend running?\n- Is cloudflare tunnel active?\n- Is BACKEND URL correct?`;
    console.error('Fetch error:', e);
  }
}

async function getMetrics() {
  try {
    const response = await fetch(BACKEND + "/metrics", {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      mode: 'cors',
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    document.getElementById("out").textContent =
      "Battery:\n" + data.battery +
      "\n\nCPU:\n" + data.cpu +
      "\n\nMemory:\n" + data.memory;
  } catch (e) {
    document.getElementById("out").textContent = `Error: ${e.message}`;
    console.error('Fetch error:', e);
  }
}

// Test connection on page load
window.addEventListener('load', async () => {
  try {
    const response = await fetch(BACKEND + "/health");
    const data = await response.json();
    document.getElementById("out").textContent = 
      `✅ Connected to backend!\n\n${JSON.stringify(data, null, 2)}`;
  } catch (e) {
    document.getElementById("out").textContent = 
      `❌ Cannot reach backend\n\nPlease update BACKEND URL in index.html\nCurrent: ${BACKEND}`;
  }
});



  return (
     <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed}>
        <div className="demo-logo-vertical" />
        <Menu theme="dark" defaultSelectedKeys={['1']} mode="inline" items={items} />
      </Sider>
      <Layout>
        <Header style={{ padding: 0, background: colorBgContainer }} />
        <Content style={{ margin: '0 16px' }}>
          <Breadcrumb style={{ margin: '16px 0' }} items={[{ title: 'User' }, { title: 'Bill' }]} />
          <div
            style={{
              padding: 24,
              minHeight: 360,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            <>
<h1>📱 Smartphone-as-a-Service Demo</h1>

<button onclick="call('/reserve')">Reserve</button>
<button onclick="call('/run-test')">Run Test</button>
<button onclick="getMetrics()">Metrics</button>
<button onclick="call('/release')">Release</button>

<pre id="out">Waiting...</pre>

</>
          </div>
        </Content>
        <Footer style={{ textAlign: 'center' }}>
          Ant Design ©{new Date().getFullYear()} Created by Ant UED
        </Footer>
      </Layout>
    </Layout>
  )
}

export default HomePage
