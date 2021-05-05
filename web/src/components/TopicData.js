import React, {Component} from 'react';
import {
    Row,
    Select,
    Form,
    Button,
    Typography,
    Tooltip,
    InputNumber,
    PageHeader,
    List,
    Space,
    Statistic, Col
} from "antd";
import request from "../common/request";
import qs from "qs";
import dayjs from "dayjs";

import {
    RightCircleTwoTone,
    DownCircleTwoTone
} from '@ant-design/icons';
import {Input} from "antd/lib/index";
import {FormattedMessage} from "react-intl";

const {Text} = Typography;

class TopicData extends Component {

    form = React.createRef();

    state = {
        topic: undefined,
        clusterId: undefined,
        loading: false,
        items: [],
        topicInfo: undefined,
        partition: 0
    }

    componentDidMount() {
        let urlParams = new URLSearchParams(this.props.location.search);
        let clusterId = urlParams.get('clusterId');
        let topic = urlParams.get('topic');
        this.setState({
            clusterId: clusterId,
            topic: topic
        })
        this.loadTopicInfo(clusterId, topic);
    }

    loadTopicInfo = async (clusterId, topic) => {
        let result = await request.get(`/topics/${topic}?clusterId=${clusterId}`);
        this.setState({
            topicInfo: result
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

        return (
            <div>
                <div className='kd-page-header'>
                    <PageHeader
                        className="site-page-header"
                        onBack={() => {
                            this.props.history.goBack();
                        }}
                        subTitle={<FormattedMessage id="consume-message" />}
                        title={this.state.topic}
                    >
                        <Row>
                            <Space size='large'>
                                {
                                    this.state.topicInfo ?
                                        <>
                                            <Statistic title="Beginning Offset"
                                                       value={this.state.topicInfo['partitions'][this.state.partition]['beginningOffset']}/>
                                            <Statistic title="End Offset"
                                                       value={this.state.topicInfo['partitions'][this.state.partition]['endOffset']}/>
                                            <Statistic title="Size"
                                                       value={this.state.topicInfo['partitions'][this.state.partition]['endOffset'] - this.state.topicInfo['partitions'][this.state.partition]['beginningOffset']}/>
                                        </>
                                        : undefined
                                }

                            </Space>
                        </Row>
                    </PageHeader>
                </div>

                <div className='kd-page-header' style={{padding: 20}}>
                    <Form ref={this.form} onFinish={this.pullMessage}
                          initialValues={{
                              offset: 0,
                              count: 10,
                              partition: 0
                          }}>
                        <Row>
                            <Col span={4}>
                                <Form.Item
                                    name={'partition'}
                                    label={'Partition'}
                                >
                                    <Select style={{width: 100}} onChange={(value) => {
                                        this.setState({
                                            partition: value
                                        })
                                    }}>
                                        {
                                            this.state.topicInfo ?
                                                this.state.topicInfo['partitions'].map(item => {
                                                    return <Select.Option
                                                        value={item['partition']}>{item['partition']}</Select.Option>
                                                }) : undefined
                                        }
                                    </Select>
                                </Form.Item>
                            </Col>
                            <Col span={4}>
                                <Form.Item
                                    name={'offset'}
                                    label={'Offset'}
                                >
                                    {
                                        this.state.topicInfo ?
                                            <InputNumber min={this.state.topicInfo['partitions'][this.state.partition]['beginningOffset']}
                                                         max={this.state.topicInfo['partitions'][this.state.partition]['endOffset']}
                                                         defaultValue={this.state.topicInfo['partitions'][this.state.partition]['beginningOffset']}
                                                         style={{width: 120}}/>
                                            : undefined
                                    }

                                </Form.Item>
                            </Col>
                            <Col span={4}>
                                <Form.Item
                                    name={'count'}
                                    label={'Count'}
                                >
                                    <InputNumber min={1} style={{width: 100}}/>
                                </Form.Item>
                            </Col>

                            <Col span={6} key='keyFilter' style={{paddingRight: 8}}>
                                <Form.Item
                                    name={'keyFilter'}
                                    label={'key'}
                                >
                                    <Input allowClear placeholder="filter key"/>
                                </Form.Item>

                            </Col>

                            <Col span={6} key='valueFilter'>
                                <Form.Item
                                    name={'valueFilter'}
                                    label={'value'}
                                >
                                    <Input allowClear placeholder="filter value"/>
                                </Form.Item>
                            </Col>
                        </Row>

                        <Row>
                            <Col span={24} style={{ textAlign: 'right' }}>
                                <Button type="primary" htmlType="submit" loading={this.state.loading} style={{ margin: '0 8px' }}>
                                    <FormattedMessage id="pull" />
                                </Button>

                                <Button type="default" danger onClick={() => {
                                    this.setState({
                                        items: []
                                    })
                                }}>
                                    <FormattedMessage id="reset" />
                                </Button>
                            </Col>
                        </Row>

                    </Form>
                </div>

                <div className='kd-content'>
                    <List
                        itemLayout="horizontal"
                        dataSource={this.state.items}
                        loading={this.state.loading}
                        renderItem={(item, index) => {
                            const title = <>
                                <Space>
                                    <Text code>partition:</Text>
                                    <Text>{item['partition']}</Text>
                                    <Text code>offset:</Text>
                                    <Text>{item['offset']}</Text>
                                    <Text code>timestamp:</Text>:
                                    <Tooltip
                                        title={dayjs(item['timestamp']).format("YYYY-MM-DD HH:mm:ss")}>
                                        <Text>{dayjs(item['timestamp']).fromNow()}</Text>
                                    </Tooltip>
                                </Space>
                            </>;

                            const description = <Row wrap={false}>
                                <Col flex="none">
                                    <div style={{padding: '0 5px'}}>
                                        {
                                            item['format'] ?
                                                <DownCircleTwoTone onClick={() => {
                                                    let items = this.state.items;
                                                    items[index]['format'] = undefined;
                                                    this.setState({
                                                        items: items
                                                    })
                                                }}/> :
                                                <RightCircleTwoTone onClick={() => {
                                                    let items = this.state.items;
                                                    try {
                                                        let obj = JSON.parse(items[index]['value']);
                                                        items[index]['format'] = JSON.stringify(obj, null, 4);
                                                        this.setState({
                                                            items: items
                                                        })
                                                    } catch (e) {

                                                    }
                                                }}/>
                                        }
                                    </div>
                                </Col>
                                <Col flex="auto">
                                    <pre>{item['format'] ? item['format'] : item['value']}</pre>
                                </Col>
                            </Row>;


                            return <List.Item>
                                <List.Item.Meta
                                    title={title}
                                    description={description}
                                />
                            </List.Item>;
                        }}
                    />
                </div>
            </div>
        );
    }

}

export default TopicData;