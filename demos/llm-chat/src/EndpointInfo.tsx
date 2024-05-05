import { Collapse, Space, Card } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';

const EndpointInfo = ({ currentEndpointInfo }: { currentEndpointInfo: any }) => {

    return (
        <Card
            title={
                <Space>
                    <InfoCircleOutlined />
                    Endpoint Info
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
                        label: 'More details',
                        children: <pre>{JSON.stringify(currentEndpointInfo, null, 4)}</pre>,
                    },
                ]}
            />
        </Card>
    )
};

export default EndpointInfo;
