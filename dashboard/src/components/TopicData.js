import React, {Component} from 'react';
import {Col, Row, Select, Form, Button, Table, Tooltip, InputNumber} from "antd";
import request from "../common/request";
import qs from "qs";
import dayjs from "dayjs";

class TopicData extends Component {

    form = React.createRef();

    state = {
        topic: undefined,
        clusterId: undefined,
        loading: false,
        items: []
    }

    componentDidMount() {
        let clusterId = this.props.clusterId;
        let topic = this.props.topic;
        this.setState({
            clusterId: clusterId,
            topic: topic
        })
    }

    pullMessage = async (queryParams) => {
        this.setState({
            loading: true
        })
        try {
            queryParams['clusterId'] = this.state.clusterId;
            let paramsStr = qs.stringify(queryParams);
            let result = await request.get(`/topics/${this.state.topic}/data?${paramsStr}`);
            this.setState({
                items: result
            })
        } finally {
            this.setState({
                loading: false
            })
        }

    }

    render() {

        const columns = [{
            title: 'partition',
            dataIndex: 'partition',
            key: 'partition'
        }, {
            title: 'offset',
            dataIndex: 'offset',
            key: 'offset',
            defaultSortOrder: 'ascend',
        }, {
            title: 'key',
            dataIndex: 'key',
            key: 'key',
        }, {
            title: 'value',
            dataIndex: 'value',
            key: 'value',
            render: (value) => {
                if (value.length > 60) {
                    value = value.substring(0, 57) + '...';
                }
                return value;
            }
        }, {
            title: 'timestamp',
            dataIndex: 'timestamp',
            key: 'timestamp',
            render: (timestamp, record, index) => {
                return (
                    <Tooltip title={dayjs(timestamp).format("YYYY-MM-DD HH:mm:ss")}>
                        {dayjs(timestamp).fromNow()}
                    </Tooltip>
                )
            }
        }];

        return (
            <div>
                <Form ref={this.form} onFinish={this.pullMessage}
                      initialValues={{offsetResetConfig: 'earliest', count: '10'}}>
                    <Row gutter={24}>
                        <Col span={4} key='1'>
                            <Form.Item
                                name={'offsetResetConfig'}
                                label={'拉取位置'}
                            >
                                <Select style={{width: 120}} onChange={() => {

                                }}>
                                    <Select.Option value="earliest">Oldest</Select.Option>
                                    <Select.Option value="latest">Newest</Select.Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={4}>
                            <Form.Item
                                name={'count'}
                                label={'数据量'}
                            >
                                <InputNumber min={1}
                                             style={{width: 120}}/>
                            </Form.Item>
                        </Col>
                        <Col span={8}>

                        </Col>
                        <Col span={8} style={{textAlign: 'right'}}>
                            <Button type="primary" htmlType="submit">
                                拉取
                            </Button>
                        </Col>
                    </Row>
                </Form>

                <Table
                    rowKey='id'
                    dataSource={this.state.items}
                    columns={columns}
                    position={'both'}
                    loading={this.state.loading}
                    size={'middle'}
                    pagination={{
                        showSizeChanger: true,
                        total: this.state.items.length,
                        showTotal: total => `总计 ${total} 条`
                    }}
                />
            </div>
        );
    }
}

export default TopicData;