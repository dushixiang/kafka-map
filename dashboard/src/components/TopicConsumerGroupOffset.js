import React, {Component} from 'react';
import {
    Alert,
    Button,
    Col,
    Drawer,
    Form,
    InputNumber,
    Radio,
    Row,
    Space,
    Table,
    Tooltip,
    Typography,
    Modal
} from "antd";
import request from "../common/request";
import {SyncOutlined} from "@ant-design/icons";

const {Title} = Typography;

class TopicConsumerGroupOffset extends Component {

    form = React.createRef();

    state = {
        loading: false,
        items: [],
        topic: undefined,
        clusterId: undefined,
        groupId: undefined,
        resetOffsetVisible: false,
        selectedRow: {},
        seek: 'end',
        resetting: false,
        createPartitionVisible: false
    }

    componentDidMount() {
        let topic = this.props.topic;
        let clusterId = this.props.clusterId;
        let groupId = this.props.groupId;
        this.setState({
            groupId: groupId,
            clusterId: clusterId,
            topic: topic
        });
        this.loadItems(clusterId, topic, groupId);
    }

    async loadItems(clusterId, topic, groupId) {
        this.setState({
            loading: true
        })
        let items = await request.get(`/topics/${topic}/consumerGroups/${groupId}/offset?clusterId=${clusterId}`);
        this.setState({
            items: items,
            loading: false
        })
    }

    render() {

        const columns = [{
            title: 'Partition',
            dataIndex: 'partition',
            key: 'partition',
            defaultSortOrder: 'ascend',
            sorter: (a, b) => a['partition'] - b['partition'],
        }, {
            title: 'Beginning Offset',
            dataIndex: 'beginningOffset',
            key: 'beginningOffset',
            sorter: (a, b) => a['beginningOffset'] - b['beginningOffset'],
        }, {
            title: 'End Offset',
            dataIndex: 'endOffset',
            key: 'endOffset',
            sorter: (a, b) => a['endOffset'] - b['endOffset'],
        }, {
            title: 'Consumer Offset',
            dataIndex: 'consumerOffset',
            key: 'consumerOffset',
            sorter: (a, b) => a['consumerOffset'] - b['consumerOffset'],
        }, {
            title: 'Lag',
            dataIndex: 'lag',
            key: 'lag',
            sorter: (a, b) => a['lag'] - b['lag'],
            render: (lag, record, index) => {
                return record['endOffset'] - record['consumerOffset']
            }
        }, {
            title: '操作',
            key: 'action',
            render: (text, record, index) => {
                return (
                    <div>
                        <Button type="link" size='small' onClick={() => {
                            this.setState({
                                resetOffsetVisible: true,
                                selectedRow: record
                            })
                        }}>重置offset</Button>
                    </div>
                )
            },
        }];

        return (
            <div>
                <div style={{marginBottom: 20}}>
                    <Row justify="space-around" align="middle" gutter={24}>
                        <Col span={20} key={1}>
                            <Title level={3}>消费详情</Title>
                        </Col>
                        <Col span={4} key={2} style={{textAlign: 'right'}}>
                            <Space>
                                <Tooltip title="刷新列表">
                                    <Button icon={<SyncOutlined/>} onClick={() => {
                                        let clusterId = this.state.clusterId;
                                        let topic = this.state.topic;
                                        let groupId = this.state.groupId;
                                        this.loadItems(clusterId, topic, groupId);
                                    }}>

                                    </Button>
                                </Tooltip>
                            </Space>
                        </Col>
                    </Row>
                </div>

                <Table key='table'
                       dataSource={this.state.items}
                       columns={columns}
                       position={'both'}
                       pagination={{
                           showSizeChanger: true,
                           total: this.state.items.length,
                           showTotal: total => `总计 ${total} 条`
                       }}
                       loading={this.state.loading}
                />

                <Drawer
                    title={'Partition: ' + this.state.selectedRow['partition']}
                    width={window.innerWidth * 0.3}
                    closable={true}
                    onClose={() => {
                        this.setState({
                            resetOffsetVisible: false
                        })
                    }}
                    visible={this.state.resetOffsetVisible}
                    footer={
                        <div
                            style={{
                                textAlign: 'right',
                            }}
                        >
                            <Button
                                loading={this.state.resetting}
                                onClick={() => {
                                    this.form.current
                                        .validateFields()
                                        .then(async values => {
                                            this.setState({
                                                resetting: true
                                            })
                                            let topic = this.state.topic;
                                            let groupId = this.state.groupId;
                                            let clusterId = this.state.clusterId;

                                            await request.put(`/topics/${topic}/consumerGroups/${groupId}/offset?clusterId=${clusterId}`, values);
                                            this.form.current.resetFields();
                                            this.setState({
                                                resetOffsetVisible: false
                                            })
                                            this.loadItems(clusterId, topic, groupId);
                                        })
                                        .catch(info => {

                                        }).finally(() => this.setState({resetting: false}));
                                }} type="primary">
                                重置
                            </Button>
                        </div>
                    }
                >
                    <Alert message="请注意" description="重置前需关闭消费者客户端。" type="warning" showIcon
                           style={{marginBottom: 16}}/>

                    <Form ref={this.form}>
                        <Form.Item label="重置位置" name='seek' rules={[{required: true}]}>
                            <Radio.Group onChange={(e) => {
                                let seek = e.target.value;
                                this.setState({
                                    'seek': seek
                                })
                            }}>
                                <Radio value={'end'}>最新</Radio>
                                <Radio value={'beginning'}>最早</Radio>
                                <Radio value={'custom'}>自定义</Radio>
                            </Radio.Group>
                        </Form.Item>

                        {
                            this.state.seek === 'custom' ?
                                <Form.Item label="offset" name='offset' rules={[{required: true}]}>
                                    <InputNumber min={0}/>
                                </Form.Item> : undefined
                        }
                    </Form>
                </Drawer>
            </div>
        );
    }
}

export default TopicConsumerGroupOffset;