import React, {Component} from 'react';
import {Button, Drawer, Table, Typography} from "antd";
import request from "../common/request";
const { Title } = Typography;

class TopicConsumerGroupOffset extends Component {

    state = {
        loading: false,
        items: [],
        topic: undefined,
        clusterId: undefined,
        groupId: undefined
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
            title: 'Offset',
            dataIndex: 'offset',
            key: 'offset',
            sorter: (a, b) => a['offset'] - b['offset'],
        }, {
            title: 'LogSize',
            dataIndex: 'logSize',
            key: 'logSize',
            sorter: (a, b) => a['logSize'] - b['logSize'],
        }, {
            title: 'Lag',
            dataIndex: 'lag',
            key: 'lag',
            sorter: (a, b) => a['lag'] - b['lag'],
            render: (lag, record, index) => {
                return record['logSize'] - record['offset']
            }
        }];

        return (
            <div>
                <Table key='table'
                       dataSource={this.state.items}
                       columns={columns}
                       position={'both'}
                       pagination={{
                           showSizeChanger: true,
                           total: this.state.items.length,
                           showTotal: total => `总计 ${total} 条`
                       }}
                       loading={this.state.loading}
                />

                <Drawer
                    width={window.innerWidth * 0.7}
                    placement="right"
                    closable={true}
                    onClose={() => {
                        this.setState({
                            consumerDetailVisible: false
                        })
                    }}
                    visible={this.state.consumerDetailVisible}
                >

                </Drawer>
            </div>
        );
    }
}

export default TopicConsumerGroupOffset;