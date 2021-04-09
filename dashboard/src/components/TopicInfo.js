import React, {Component} from 'react';
import {Button, Drawer, PageHeader, Tabs, Tag, Tooltip} from "antd";
import TopicPartition from "./TopicPartition";
import TopicBroker from "./TopicBroker";
import TopicConsumerGroup from "./TopicConsumerGroup";
import TopicData from "./TopicData";
import TopicConsumerGroupOffset from "./TopicConsumerGroupOffset";

const {TabPane} = Tabs;

class TopicInfo extends Component {

    state = {
        clusterId: undefined,
        topic: undefined,
        topicDataVisible: false
    }

    componentDidMount() {
        let urlParams = new URLSearchParams(this.props.location.search);
        let clusterId = urlParams.get('clusterId');
        let topic = urlParams.get('topic');
        this.setState({
            clusterId: clusterId,
            topic: topic,
        })
    }

    handleTabChange(key) {

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
                        subTitle=""
                        extra={[
                            <Button key="2">导入数据</Button>,
                            <Button key="1" type="primary" onClick={() => {
                                this.setState({
                                    topicDataVisible: true
                                })
                            }}>
                                拉取数据
                            </Button>,
                        ]}
                    />
                </div>

                <div className='kd-content'>
                    <Tabs defaultActiveKey='0' onChange={this.handleTabChange}>
                        <TabPane tab="分区信息" key="partition">
                            <TopicPartition
                                clusterId={this.state.clusterId}
                                topic={this.state.topic}>

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

                <Drawer
                    title={'Topic：' + this.state.topic}
                    width={window.innerWidth * 0.8}
                    placement="right"
                    closable={true}
                    onClose={() => {
                        this.setState({
                            topicDataVisible: false
                        })
                    }}
                    visible={this.state.topicDataVisible}
                >
                    {
                        this.state.topicDataVisible ?
                            <TopicData
                                clusterId={this.state.clusterId}
                                topic={this.state.topic}
                            /> : undefined
                    }

                </Drawer>
            </div>
        );
    }
}

export default TopicInfo;