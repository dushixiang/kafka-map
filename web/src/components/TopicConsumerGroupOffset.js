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
    Typography
} from "antd";
import request from "../common/request";
import {SyncOutlined} from "@ant-design/icons";
import {FormattedMessage} from "react-intl";

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
        resetting: false
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
            title: 'Operate',
            key: 'action',
            render: (text, record, index) => {
                return (
                    <div>
                        <Button type="link" size='small' onClick={() => {
                            this.setState({
                                resetOffsetVisible: true,
                                selectedRow: record
                            })
                        }}>Reset Offset</Button>
                    </div>
                )
            },
        }];

        return (
            <div>
                <div style={{marginBottom: 20}}>
                    <Row justify="space-around" align="middle" gutter={24}>
                        <Col span={20} key={1}>
                            <Title level={3}><FormattedMessage id="consume-detail" /></Title>
                        </Col>
                        <Col span={4} key={2} style={{textAlign: 'right'}}>
                            <Space>
                                <Tooltip title={<FormattedMessage id="refresh" />}>
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
                           showTotal: total => <FormattedMessage id="total-items" values={{total}}/>
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
                    <Alert message={<FormattedMessage id="reset-warning" />} description={<FormattedMessage id="reset-warning-description" />} type="warning" showIcon
                           style={{marginBottom: 16}}/>

                    <Form ref={this.form}>
                        <Form.Item label={<FormattedMessage id="reset-partition" />} name='seek' rules={[{required: true}]}>
                            <Radio.Group onChange={(e) => {
                                let seek = e.target.value;
                                this.setState({
                                    'seek': seek
                                })
                            }}>
                                <Radio value={'end'}><FormattedMessage id="latest" /></Radio>
                                <Radio value={'beginning'}><FormattedMessage id="earliest" /></Radio>
                                <Radio value={'custom'}><FormattedMessage id="customization" /></Radio>
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