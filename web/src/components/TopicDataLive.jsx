import React, {Component} from 'react';
import {
    Row,
    Select,
    Form,
    Button,
    Typography,
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
import {server} from "../common/env";
import {getToken} from "../utils/utils.jsx";
import withRouter from "../hook/withRouter.jsx";
import {PageHeader} from "@ant-design/pro-components";

const {Text} = Typography;


class TopicDataLive extends Component {

    form = React.createRef();

    state = {
        topic: undefined,
        clusterId: undefined,
        loading: false,
        items: [],
        topicInfo: undefined,
        offset: 0,
        partition: 0,
        eventSource: undefined
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
        });
    }

    handleReset = () => {
        this.setState({
            items: []
        })
    }

    handleStopPull = () => {
        if (this.state.eventSource) {
            this.state.eventSource.close();
        }
        this.setState({
            eventSource: undefined,
            loading: false,
        })
    }

    pullMessage = async (queryParams) => {
        this.setState({
            loading: true
        })
        queryParams['clusterId'] = this.state.clusterId;
        queryParams['X-Auth-Token'] = getToken();
        let paramsStr = qs.stringify(queryParams);

        const eventSource = new EventSource(
            `${server}/topics/${this.state.topic}/data/live?${paramsStr}`,
            {
                withCredentials: false,
            }
        );

        eventSource.onopen = (e) => {
            console.log("SSE connected!");
        };

        eventSource.addEventListener("topic-message-event", (event) => {
            let liveMessage = JSON.parse(event.data);
            let items = this.state.items;
            items.push(...liveMessage['messages']);
            if (items.length > 100) {
                items = items.slice(-100);
            }

            let topicInfo = this.state.topicInfo;
            topicInfo['partitions'][liveMessage['partition']]['beginningOffset'] = liveMessage['beginningOffset'];
            topicInfo['partitions'][liveMessage['partition']]['endOffset'] = liveMessage['endOffset'];

            this.setState({
                items: items,
                topicInfo: topicInfo
            })

            let listEle = document.getElementById('list');
            if (listEle.scrollHeight) {
                listEle.scrollTop = listEle.scrollHeight;
            }
        });

        eventSource.onerror = (error) => {
            console.log("SSE error", error);
            eventSource.close();
        };

        this.setState({
            eventSource: eventSource
        })

    }

    render() {

        return (
            <div>
                <div className='kd-page-header'>
                    <PageHeader
                        className="site-page-header"
                        onBack={() => {
                            this.props.navigate(-1);
                        }}
                        subTitle={<FormattedMessage id="consume-message-live"/>}
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
                              partition: this.state.partition,
                          }}>
                        <Row gutter={24}>
                            <Col span={6}>
                                <Form.Item
                                    name={'partition'}
                                    label={'Partition'}
                                >
                                    <Select onChange={(value) => {
                                        this.setState({
                                            partition: value
                                        }, this.handlePartitionChange);
                                    }}>
                                        {
                                            this.state.topicInfo ?
                                                this.state.topicInfo['partitions'].map(item => {
                                                    return <Select.Option key={'p' + item['partition']}
                                                                          value={item['partition']}>{item['partition']}</Select.Option>
                                                }) : undefined
                                        }
                                    </Select>
                                </Form.Item>
                            </Col>

                            <Col span={6} key='keyFilter'>
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
                            <Col span={6} style={{textAlign: 'right'}}>
                                <Space>
                                    <Button type="primary" htmlType="submit" loading={this.state.loading}>
                                        <FormattedMessage id="pull"/>
                                    </Button>

                                    <Button type="default" onClick={this.handleStopPull} disabled={!this.state.loading}>
                                        <FormattedMessage id="stop"/>
                                    </Button>

                                    <Button type="default" danger onClick={this.handleReset}>
                                        <FormattedMessage id="reset"/>
                                    </Button>
                                </Space>
                            </Col>
                        </Row>

                    </Form>
                </div>

                <div className='kd-content'>
                    <List
                        id='list'
                        style={{
                            height: 480,
                            overflow: 'auto',
                        }}
                        itemLayout="horizontal"
                        dataSource={this.state.items}
                        renderItem={(item, index) => {
                            const title = <>
                                <Space>
                                    <Text code>partition:</Text>
                                    <Text>{item['partition']}</Text>
                                    <Text code>key:</Text>
                                    <Text>{item['key']}</Text>
                                    <Text code>offset:</Text>
                                    <Text>{item['offset']}</Text>
                                    <Text code>timestamp:</Text>:
                                    <Text>{dayjs(item['timestamp']).format("YYYY-MM-DD HH:mm:ss")}</Text>
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

export default withRouter(TopicDataLive);