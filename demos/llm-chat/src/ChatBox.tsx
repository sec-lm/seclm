import { useState, useRef, useEffect } from 'react';
import { Button, Space, Card, Tag, List, Avatar, Input } from 'antd';
import { UserOutlined, RobotOutlined, MessageOutlined } from '@ant-design/icons';
import OpenAI from 'openai';

const ChatBox = ({ currentEndpoint, currentModel }: { currentEndpoint: string, currentModel: string }) => {
    const inputRef = useRef(null);
    const [prompt, setPrompt] = useState<string>('');
    const [history, setHistory] = useState<Array<{ role: string; content: string }>>([]);
    const [isNewChat, setIsNewChat] = useState<boolean>(true);
    const [pending, setPending] = useState<string>('Waiting for the first message...');
    const [isRunning, setIsRunning] = useState<boolean>(false);

    const sendMsg = async () => {
        setIsRunning(true);
        const messages = history.map((x) => ({ role: x.role, content: x.content }));
        messages.push({ role: 'user', content: prompt });
        setHistory([...history, { role: 'user', content: prompt }]);
        if (isNewChat) {
            setIsNewChat(false);
            setPending('');
        }
        const openai = new OpenAI({
            apiKey: 'EMPTY',
            baseURL: currentEndpoint,
            dangerouslyAllowBrowser: true,
        });
        const stream = await openai.chat.completions.create({
            model: currentModel,
            // @ts-expect-error
            messages: messages,
            stream: true,
        });
        setPrompt('');
        var reply = '';
        for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content;
            if (typeof content == 'string') {
                reply = reply + content;
            }
            setPending(reply);
        }
        setPending('');
        setHistory([
            ...history,
            { role: 'user', content: prompt },
            { role: 'assistant', content: reply },
        ]);
        setIsRunning(false);
    };

    useEffect(() => {
        if (!isNewChat && !isRunning) {
            // @ts-expect-error
            inputRef.current.focus();
        }
    }, [isNewChat, isRunning]);

    return (
        <Card
            title={
                <Space>
                    <MessageOutlined />
                    {/* Endpoint:
                    <Tag color="blue">{currentEndpoint}</Tag> */}
                    Model:
                    <Tag color="blue">{currentModel}</Tag>
                </Space>
            }
            bordered={true}
        >
            <List
                itemLayout="horizontal"
                dataSource={history.concat(pending ? [{ role: 'assistant', content: pending }] : [])}
                renderItem={(item, index) => (
                    <List.Item>
                        <List.Item.Meta
                            avatar={
                                item.role === 'user' ?
                                    <Avatar style={{ backgroundColor: '#1677ff' }} icon={<UserOutlined />} /> :
                                    <Avatar style={{ backgroundColor: '#f56a00' }} icon={<RobotOutlined />} />
                            }
                            title={item.role}
                            description={item.content}
                        />
                    </List.Item>
                )}
            />

            <Space.Compact style={{ width: '100%' }}>
                <Input
                    placeholder="Enter your prompt here..."
                    onChange={(e) => setPrompt(e.target.value)}
                    value={prompt}
                    onPressEnter={(e) => sendMsg()}
                    disabled={isRunning}
                    ref={inputRef}
                />
                <Button type="primary" onClick={(e) => sendMsg()} disabled={isRunning}>
                    Send
                </Button>
            </Space.Compact>
        </Card>
    )
};

export default ChatBox;
