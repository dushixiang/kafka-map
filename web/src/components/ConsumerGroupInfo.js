import React, {Component} from 'react';
import {PageHeader, Tabs, Row, Space} from "antd";
import request from "../common/request";
import TopicConsumerGroupOffset from "./TopicConsumerGroupOffset";

const {TabPane} = Tabs;

class ConsumerGroupInfo extends Component {

    state = {
        clusterId: undefined,
        groupId: undefined,
        item: undefined
    }

    componentDidMount() {
        let urlParams = new URLSearchParams(this.props.location.search);
        let clusterId = urlParams.get('clusterId');
        let groupId = urlParams.get('groupId');
        this.setState({
            clusterId: clusterId,
            groupId: groupId,
        })
        this.loadTopicInfo(clusterId, groupId);
    }

    handleTabChange(key) {

    }

    loadTopicInfo = async (clusterId, groupId) => {
        let result = await request.get(`/consumerGroups/${groupId}?clusterId=${clusterId}`);
        this.setState({
            item: result
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
                        title={this.state.groupId}
                        subTitle="消费组详情"
                    >
                        <Row>
                            <Space size='large'>

                            </Space>
                        </Row>
                    </PageHeader>
                </div>

                <div className='kd-content'>
                    <Tabs defaultActiveKey='0' onChange={this.handleTabChange}>
                        {
                            this.state.item ?
                                this.state.item['topics'].map(topic => {
                                    return <TabPane tab={topic} key={topic}>
                                        <TopicConsumerGroupOffset
                                            clusterId={this.state.clusterId}
                                            topic={topic}
                                            groupId={this.state.groupId}
                                        />
                                    </TabPane>
                                })
                                : undefined
                        }
                    </Tabs>
                </div>
            </div>
        );
    }
}

export default ConsumerGroupInfo;