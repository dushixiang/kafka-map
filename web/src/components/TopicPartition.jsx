import React, {Component} from 'react';
import {Button, Space, Table, Tooltip} from "antd";
import {arrayEquals, renderSize} from "../utils/utils.jsx";
import request from "../common/request";
import {FormattedMessage} from "react-intl";

class TopicPartition extends Component {

    state = {
        loading: false,
        items: [],
        clusterId: undefined,
        topic: undefined
    }

    componentDidMount() {
        let clusterId = this.props.clusterId;
        let topic = this.props.topic;
        this.setState({
            clusterId: clusterId,
            topic: topic
        })
        this.props.onRef(this);
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

    refresh() {
        if (this.state.clusterId && this.state.topic) {
            this.loadItems(this.state.clusterId, this.state.topic)
        }
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

                return <Tooltip key={'leader-' + leader['host']} title={leader['host'] + ":" + leader['port']}>
                    <Button key={leader['host']} size='small'>{leader['id']}</Button>
                </Tooltip>
            }
        }, {
            title: 'Beginning Offset',
            dataIndex: 'beginningOffset',
            key: 'beginningOffset',
            sorter: (a, b) => a['beginningOffset'] - b['beginningOffset'],
        }, {
            title: 'End Offset',
            dataIndex: 'endOffset',
            key: 'endOffset',
            sorter: (a, b) => a['endOffset'] - b['endOffset'],
        }, {
            title: 'Log Size',
            dataIndex: 'y',
            key: 'y',
            sorter: (a, b) => a['replicas'].map(item => item['logSize']).reduce((a, b) => a + b, 0) - b['replicas'].map(item => item['logSize']).reduce((a, b) => a + b, 0),
            render: (y, record) => {
                let totalLogSize = record['replicas'].map(item => item['logSize']).reduce((a, b) => a + b, 0);
                if (totalLogSize < 0) {
                    return '不支持';
                }
                return renderSize(totalLogSize)
            }
        }, {
            title: 'Replicas',
            dataIndex: 'replicas',
            key: 'replicas',
            render: (replicas, record, index) => {
                return <Space>
                    {replicas.map(item => {
                        let logSize = ''
                        if (item['logSize'] > 0) {
                            logSize = renderSize(item['logSize']);
                        }
                        return <Tooltip key={'replicas-' + item['host']}
                                        title={item['host'] + ":" + item['port'] + ' ' + logSize}>
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
                        return <Tooltip key={'isr-' + item['host']}
                                        title={item['host'] + ":" + item['port']}>
                            <Button size='small'>{item['id']}</Button>
                        </Tooltip>
                    })}
                </Space>;
            }
        }, {
            title: 'Sync',
            dataIndex: 'partition',
            key: 'partition',
            render: (partition, record, index) => {
                return arrayEquals(record['replicas'], record['isr']).toString();
            }
        }];

        return (
            <div>
                <Table
                    rowKey='partition'
                    dataSource={this.state.items}
                    columns={columns}
                    position={'both'}
                    size={'middle'}
                    loading={this.state.loading}
                    pagination={{
                        showSizeChanger: true,
                        total: this.state.items.length,
                        showTotal: total => <FormattedMessage id="total-items" values={{total}}/>
                    }}
                />
            </div>
        );
    }
}

export default TopicPartition;