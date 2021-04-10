import React, {Component} from 'react';
import {Button, PageHeader, Statistic, Tabs, Row, Tooltip, Space} from "antd";
import TopicPartition from "./TopicPartition";
import TopicBroker from "./TopicBroker";
import TopicConsumerGroup from "./TopicConsumerGroup";
import {Link} from "react-router-dom";
import request from "../common/request";
import {renderSize} from "../utils/utils";

const {TabPane} = Tabs;

class TopicInfo extends Component {

    state = {
        clusterId: undefined,
        topic: undefined,
        topicDataVisible: false,
        topicInfo: {
            'partitions': []
        }
    }

    componentDidMount() {
        let urlParams = new URLSearchParams(this.props.location.search);
        let clusterId = urlParams.get('clusterId');
        let topic = urlParams.get('topic');
        this.setState({
            clusterId: clusterId,
            topic: topic,
        })
        this.loadTopicInfo(clusterId, topic);
    }

    handleTabChange(key) {

    }

    loadTopicInfo = async (clusterId, topic) => {
        let result = await request.get(`/topics/${topic}?clusterId=${clusterId}`);
        this.setState({
            topicInfo: result
        })
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
                        title={this.state.topic}
                        subTitle="详细信息"
                        extra={[
                            <Button key="2">导入数据</Button>,
                            <Link to={`/topic-data?clusterId=${this.state.clusterId}&topic=${this.state.topic}`}>
                                <Button key="1" type="primary">
                                    拉取数据
                                </Button>
                            </Link>,
                        ]}
                    >
                        <Row>
                            <Space size='large'>
                                <Statistic title="分区数量" value={this.state.topicInfo['partitions'].length}/>
                                <Statistic title="副本数量" value={this.state.topicInfo['replicaSize']}/>
                                <Statistic title="数据大小" value={renderSize(this.state.topicInfo['totalLogSize'])}/>
                            </Space>
                        </Row>
                    </PageHeader>
                </div>

                <div className='kd-content'>
                    <Tabs defaultActiveKey='0' onChange={this.handleTabChange}>
                        <TabPane tab="分区信息" key="partition">
                            <TopicPartition
                                clusterId={this.state.clusterId}
                                topic={this.state.topic}>}
                            </TopicPartition>
                        </TabPane>
                        <TabPane tab="Broker信息" key="broker">
                            <TopicBroker
                                clusterId={this.state.clusterId}
                                topic={this.state.topic}>

                            </TopicBroker>
                        </TabPane>
                        <TabPane tab="消费组信息" key="consumer-group">
                            <TopicConsumerGroup
                                clusterId={this.state.clusterId}
                                topic={this.state.topic}>

                            </TopicConsumerGroup>
                        </TabPane>
                    </Tabs>
                </div>
            </div>
        );
    }
}

export default TopicInfo;