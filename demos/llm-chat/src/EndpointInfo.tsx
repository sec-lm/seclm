import { useState, useEffect } from 'react';
import { Collapse, Space, Card, Tooltip } from 'antd';
import { InfoCircleOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';

const EndpointInfo = ({ currentEndpointInfo }: { currentEndpointInfo: any }) => {
    const [ctCheckEndpoint, setCtCheckEndpoint] = useState<string>(() => {
        const data = localStorage.getItem("ctCheckEndpoint");
        const res = JSON.parse(data!);
        return res || 'null';
    });
    useEffect(() => {
        localStorage.setItem("ctCheckEndpoint", JSON.stringify(ctCheckEndpoint));
    }, [ctCheckEndpoint]);
    const [ctCheckStatus, setCtCheckStatus] = useState<boolean>(() => {
        const data = localStorage.getItem("ctCheckStatus");
        const res = JSON.parse(data!);
        return res || false;
    });
    useEffect(() => {
        localStorage.setItem("ctCheckStatus", JSON.stringify(ctCheckStatus));
    }, [ctCheckStatus]);
    const [ctCheckTime, setCtCheckTime] = useState<Date>(() => {
        const data = localStorage.getItem("ctCheckTime");
        const res = JSON.parse(data!);
        return res || new Date(0);
    });
    useEffect(() => {
        localStorage.setItem("ctCheckTime", JSON.stringify(ctCheckTime));
    }, [ctCheckTime]);

    var last_check_time = ctCheckTime;
    var last_check_endpoint = ctCheckEndpoint;
    useEffect(() => {
        let interval = setInterval(() => {
            const date = new Date();
            if ((typeof currentEndpointInfo.url !== last_check_endpoint && currentEndpointInfo.url !== last_check_endpoint) || date.getTime() - new Date(last_check_time).getTime() > 600 * 1000) {
                try {
                    const url = new URL(currentEndpointInfo.url);
                    fetch(`https://api.certspotter.com/v1/issuances?domain=${url.hostname}&expand=dns_names&match_wildcards=true`, { cache: "no-cache" })
                        .then((response) => response.json())
                        .then((data) => {
                            var res = true;
                            for (const cert of data) {
                                if (!currentEndpointInfo.pubkey_sha256.includes(cert.pubkey_sha256)) {
                                    res = false;
                                    break;
                                }
                            }
                            last_check_time = date;
                            last_check_endpoint = currentEndpointInfo.url;
                            setCtCheckEndpoint(currentEndpointInfo.url);
                            setCtCheckStatus(res);
                            setCtCheckTime(date);
                        });
                } catch (error) {
                    console.error(error);
                    last_check_time = date;
                    last_check_endpoint = 'undefined';
                    setCtCheckEndpoint('undefined');
                    setCtCheckStatus(false);
                    setCtCheckTime(date);
                }
            }
        }, 1000);
        return () => {
            clearInterval(interval);
        };
    }, [currentEndpointInfo]);

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
            <b>URL:</b> {currentEndpointInfo.url}<br />
            <b>Measurement:</b> {currentEndpointInfo.measurement}
            <Tooltip title="Necessary files are provided in the JSON below">
                <a href="https://github.com/sec-lm/seclm?tab=readme-ov-file#how-to-verify-the-attestation-report-and-the-measurement-result" target="_blank"> How to verify this?</a>
            </Tooltip>
            <br />
            <b>SSL PubKey SHA256:</b> {currentEndpointInfo.pubkey_sha256}
            <Tooltip title={"Last checked: " + new Date(ctCheckTime).toString()}>
                <b> CT Log Check: </b>{ctCheckStatus === true ? <CheckCircleOutlined style={{ color: '#52c41a' }} /> : <CloseCircleOutlined style={{ color: '#ff4d4f' }} />}
            </Tooltip>
            <br />

            <Collapse
                size="small"
                bordered={false}
                items={[
                    {
                        key: '1',
                        label: 'More details (JSON)',
                        children: <pre>{JSON.stringify(currentEndpointInfo, null, 4)}</pre>,
                    },
                ]}
            />
        </Card>
    )
};

export default EndpointInfo;
