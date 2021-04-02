import React, {Component} from 'react';
import {Button, Space, Table, Tooltip} from "antd";
import {arrayEquals} from "../utils/utils";
import request from "../common/request";

class TopicPartition extends Component {

    state = {
        loading: false,
        items: [],
    }

    componentDidMount() {
        let clusterId = this.props.clusterId;
        let topic = this.props.topic;
        this.loadItems(clusterId, topic);
    }

    async loadItems(clusterId, topic) {
        this.setState({
            loading: true
        })
        let items = await request.get(`/topics/${topic}/partitions?clusterId=${clusterId}`);
        this.setState({
            items: items,
            loading: false
        })
    }

    render() {

        const columns = [{
            title: 'Partition',
            dataIndex: 'partition',
            key: 'partition'
        }, {
            title: 'Leader',
            dataIndex: 'leader',
            key: 'leader',
            defaultSortOrder: 'ascend',
            render: (leader, record, index) => {

                return <Tooltip title={leader['host'] + ":" + leader['port']}>
                    <Button size='small'>{leader['id']}</Button>
                </Tooltip>
            }
        }, {
            title: 'Replicas',
            dataIndex: 'replicas',
            key: 'replicas',
            render: (replicas, record, index) => {
                return <Space>
                    {replicas.map(item => {
                        return <Tooltip title={item['host'] + ":" + item['port']}>
                            <Button size='small'>{item['id']}</Button>
                        </Tooltip>
                    })}
                </Space>;
            }
        }, {
            title: 'ISR',
            dataIndex: 'isr',
            key: 'isr',
            render: (isr, record, index) => {
                return <Space>
                    {isr.map(item => {
                        return <Tooltip title={item['host'] + ":" + item['port']}>
                            <Button size='small'>{item['id']}</Button>
                        </Tooltip>
                    })}
                </Space>;
            }
        }, {
            title: '是否同步',
            dataIndex: 'partition',
            key: 'partition',
            render: (partition, record, index) => {
                return arrayEquals(record['replicas'], record['isr']) ? '是' : '否';
            }
        }];

        return (
            <div>
                <Table
                    rowKey='id'
                    dataSource={this.state.items}
                    columns={columns}
                    position={'both'}
                    loading={this.state.loading}
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

export default TopicPartition;