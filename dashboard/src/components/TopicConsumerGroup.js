import React, {Component} from 'react';
import request from "../common/request";
import {Button, Drawer, Table} from "antd";
import TopicConsumerGroupOffset from "./TopicConsumerGroupOffset";

class TopicConsumerGroup extends Component {

    state = {
        loading: false,
        items: [],
        consumerDetailVisible: false,
        topic: undefined,
        clusterId: undefined,
        selectedRow: {}
    }

    componentDidMount() {
        let clusterId = this.props.clusterId;
        let topic = this.props.topic;
        this.setState({
            clusterId: clusterId,
            topic: topic
        })
        this.loadItems(clusterId, topic);
    }

    async loadItems(clusterId, topic) {
        this.setState({
            loading: true
        })
        let items = await request.get(`/topics/${topic}/consumerGroups?clusterId=${clusterId}`);
        this.setState({
            items: items,
            loading: false
        })
    }

    render() {

        const columns = [{
            title: '消费组名称',
            dataIndex: 'groupId',
            key: 'groupId',
            render: (groupId, record) => {
                return <Button type='link' onClick={() => {
                    this.setState({
                        consumerDetailVisible: true,
                        selectedRow: record
                    })
                }}>{groupId}</Button>;
            }
        }, {
            title: 'SimpleConsumerGroup',
            dataIndex: 'simpleConsumerGroup',
            key: 'simpleConsumerGroup',
            render: (simpleConsumerGroup) => {
                return simpleConsumerGroup ? '是' : '否';
            }
        }];

        return (
            <div>
                <Table
                    rowKey='id'
                    dataSource={this.state.items}
                    columns={columns}
                    position={'both'}
                    size={'middle'}
                    loading={this.state.loading}
                    pagination={{
                        showSizeChanger: true,
                        total: this.state.items.length,
                        showTotal: total => `总计 ${total} 条`
                    }}
                />

                <Drawer
                    title={'Topic：' + this.state.topic}
                    width={window.innerWidth * 0.8}
                    placement="right"
                    closable={true}
                    onClose={() => {
                        this.setState({
                            consumerDetailVisible: false
                        })
                    }}
                    visible={this.state.consumerDetailVisible}
                >
                    {
                        this.state.consumerDetailVisible ?
                            <TopicConsumerGroupOffset
                                clusterId={this.state.clusterId}
                                topic={this.state.topic}
                                groupId={this.state.selectedRow['groupId']}
                            /> : undefined
                    }

                </Drawer>
            </div>
        );
    }
}

export default TopicConsumerGroup;