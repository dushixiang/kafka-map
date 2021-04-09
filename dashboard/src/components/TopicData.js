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
                    <Col span={8} key='1'>

                        <Form.Item
                            name={''}
                            label={'读取位置'}
                        >
                            <Select defaultValue="Newest" style={{width: 120}} onChange={() => {

                            }}>
                                <Select.Option value="Oldest">Oldest</Select.Option>
                                <Select.Option value="Newest">Newest</Select.Option>
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={8} >

                    </Col>
                    <Col span={8} style={{textAlign: 'right'}}>
                        <Button type="primary" htmlType="submit">
                            Search
                        </Button>
                    </Col>
                </Row>
            </div>
        );
    }
}

export default TopicData;