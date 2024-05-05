import { useState, useEffect } from 'react';
import { Space, Select } from 'antd';
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
    </div>
  )
};

export default App;
