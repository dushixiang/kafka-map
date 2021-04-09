import React, {Component} from 'react';
import {Col, Row, Select, Form, Button} from "antd";
import {DownOutlined, UpOutlined} from '@ant-design/icons';

class TopicData extends Component {

    state = {
        expand: false
    }

    render() {
        return (
            <div>
                <Row gutter={24}>
                    <Col span={4} key='1'>
                        <Form.Item
                            name={''}
                            label={'拉取位置'}
                        >
                            <Select defaultValue="Newest" style={{width: 120}} onChange={() => {

                            }}>
                                <Select.Option value="Oldest">Oldest</Select.Option>
                                <Select.Option value="Newest">Newest</Select.Option>
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={4}>
                        <Form.Item
                            name={'count'}
                            label={'数据量'}
                        >
                            <Select defaultValue="100" style={{width: 120}} onChange={() => {

                            }}>
                                <Select.Option value="100">100</Select.Option>
                                <Select.Option value="200">200</Select.Option>
                                <Select.Option value="500">500</Select.Option>
                                <Select.Option value="1000">1000</Select.Option>
                                <Select.Option value="2000">2000</Select.Option>
                            </Select>
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
            </div>
        );
    }
}

export default TopicData;