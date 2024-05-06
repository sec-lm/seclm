import { useState, useEffect } from 'react';
import { Space, Select, Card, Collapse } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import ChatBox from './ChatBox';
import EndpointInfo from './EndpointInfo';


const App = () => {
  const chat_endpoints_list = 'https://chat-endpoints.seclm.com/list.json';

  const [chatEndpoints, setChatEndpoints] = useState<any[]>();
  if (!chatEndpoints) {
    fetch(chat_endpoints_list)
      .then((response) => response.json())
      .then((data) => {
        setChatEndpoints(data);
      });
  }
  const chat_endpoints_options = chatEndpoints ? chatEndpoints.map((x) => ({ label: x.url, value: x.url })) : [];
  const [currentEndpoint, setCurrentEndpoint] = useState<string>('');
  const [currentEndpointInfo, setCurrentEndpointInfo] = useState<any>({});
  const [currentModel, setCurrentModel] = useState<string>('');

  useEffect(() => {
    if (chatEndpoints && chatEndpoints.length > 0) {
      setCurrentEndpoint(chatEndpoints[0].url)
    }
  }, [chatEndpoints]);

  useEffect(() => {
    if (chatEndpoints) {
      chatEndpoints.forEach((x) => { if (x.url === currentEndpoint) { setCurrentEndpointInfo(x); setCurrentModel(x.models[0]); } })
    }
  }, [chatEndpoints, currentEndpoint]);

  return (
    <div style={{ width: '75%', margin: 'auto' }}>
      <h1>SecLM Chat</h1>
      <Space>
        <h3>Select an endpoint:</h3>
        <Select
          showSearch
          placeholder="Select an endpoint"
          optionFilterProp="children"
          size="large"
          defaultValue={currentEndpoint}
          value={currentEndpoint}
          options={chat_endpoints_options}
          onChange={(value) => {
            setCurrentEndpoint(value);
          }}
        />
      </Space>
      <br />
      <EndpointInfo currentEndpointInfo={currentEndpointInfo}></EndpointInfo>
      <br />
      <ChatBox currentEndpoint={currentEndpoint} currentModel={currentModel}></ChatBox>
      <br />
      <Card
        title={
          <Space>
            <InfoCircleOutlined />
            Try it in Python
          </Space>
        }
        bordered={true}
      >
        <Collapse
          size="small"
          bordered={false}
          items={[
            {
              key: '1',
              label: 'Expand',
              children: <pre>
                {`\
from seclm.ssl import create_ssl_context
ssl_context = create_ssl_context("`+ currentEndpointInfo.url + `", "` + currentEndpointInfo.pubkey_sha256 + `")

from openai import OpenAI, DefaultHttpxClient
client = OpenAI(
    api_key="EMPTY",
    base_url="`+ currentEndpointInfo.url + `",
    http_client=DefaultHttpxClient(verify=ssl_context)
)
chat_completion = client.chat.completions.create(
    messages=[
        {
            "role": "user",
            "content": "Say this is a test",
        }
    ],
    model="`+ currentModel + `",
)\
                        `}
              </pre>,
            },
          ]}
        />
      </Card>
    </div>
  )
};

export default App;
