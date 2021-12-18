import React, {Component} from 'react';
import request from "../common/request";
import {Button, Col, PageHeader, Row, Table, Tooltip, Typography} from "antd";
import {FormattedMessage} from "react-intl";

const {Title} = Typography;

class Broker extends Component {

    state = {
        loading: false,
        items: [],
    }

    componentDidMount() {
        let urlParams = new URLSearchParams(this.props.location.search);
        let clusterId = urlParams.get('clusterId');
        let clusterName = urlParams.get('clusterName');
        this.setState({
            clusterName: clusterName
        })
        this.loadItems(clusterId);
    }

    async loadItems(clusterId) {
        this.setState({
            loading: true
        })
        let items = await request.get(`/brokers?clusterId=${clusterId}`);
        this.setState({
            items: items,
            loading: false
        })
    }

    render() {

        const columns = [{
            title: 'ID',
            dataIndex: 'id',
            key: 'id'
        }, {
            title: 'Host',
            dataIndex: 'host',
            key: 'host',
            defaultSortOrder: 'ascend',
        }, {
            title: 'Port',
            dataIndex: 'port',
            key: 'port',
        }, {
            title: 'Partitions as Leader',
            dataIndex: 'leaderPartitions',
            key: 'leaderPartitions',
            render: (leaderPartitions, record, index) => {
                return <Tooltip title={leaderPartitions.join('、')}>
                    <Button type="link" size='small'>{leaderPartitions.length}</Button>
                </Tooltip>;
            }
        }, {
            title: 'Partitions as Follower',
            dataIndex: 'followerPartitions',
            key: 'followerPartitions',
            render: (followerPartitions, record, index) => {
                return <Tooltip title={followerPartitions.join('、')}>
                    <Button type="link" size='small'>{followerPartitions.length}</Button>
                </Tooltip>;
            }
        }];

        return (
            <div>
                <div className='kd-page-header'>
                    <PageHeader
                        className="site-page-header"
                        onBack={() => {
                            this.props.history.goBack();
                        }}
                        title={this.state.clusterName}
                        subTitle={<FormattedMessage id="broker-management" />}
                    />
                </div>

                <div className='kd-content'>
                    <div style={{marginBottom: 20}}>
                        <Row justify="space-around" align="middle" gutter={24}>
                            <Col span={8} key={1}>
                                <Title level={3}>Broker</Title>
                            </Col>
                            <Col span={16} key={2} style={{textAlign: 'right'}}>

                            </Col>
                        </Row>
                    </div>
                    <Table
                        rowKey='id'
                        dataSource={this.state.items}
                        columns={columns}
                        position={'both'}
                        size={'small'}
                        loading={this.state.loading}
                        pagination={{
                            showSizeChanger: true,
                            total: this.state.items.length,
                            showTotal: total => <FormattedMessage id="total-items" values={{total}}/>
                        }}
                    />
                </div>

            </div>
        );
    }
}

export default Broker;