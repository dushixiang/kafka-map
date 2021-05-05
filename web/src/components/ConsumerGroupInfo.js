import React, {Component} from 'react';
import {
    PageHeader,
    Row,
    Space,
    Col,
    Table,
    Typography, Tooltip
} from "antd";
import request from "../common/request";
import {Link} from "react-router-dom";
import qs from "qs";
import {FormattedMessage} from "react-intl";

const {Title} = Typography;

class ConsumerGroupInfo extends Component {

    state = {
        clusterId: undefined,
        groupId: undefined,
        items: [],
        queryParams: {
            pageIndex: 1,
            pageSize: 10
        },
        loading: false
    }

    componentDidMount() {
        let urlParams = new URLSearchParams(this.props.location.search);
        let clusterId = urlParams.get('clusterId');
        let groupId = urlParams.get('groupId');
        this.setState({
            clusterId: clusterId,
            groupId: groupId,
        })
        let query = {
            ...this.state.queryParams,
            'clusterId': clusterId,
            'groupId': groupId
        }
        this.loadTableData(query);
    }

    handleTabChange(key) {

    }

    async loadTableData(queryParams) {
        this.setState({
            loading: true
        });

        queryParams = queryParams || this.state.queryParams;

        // queryParams
        let paramsStr = qs.stringify(queryParams);
        let items = [];
        try {
            items = await request.get(`/consumerGroups/${queryParams['groupId']}/describe?` + paramsStr);
        } catch (e) {
            console.log(e);
        } finally {
            items = items.map(item => {
                return {'key': item['id'], ...item}
            })
            this.setState({
                items: items,
                queryParams: queryParams,
                loading: false
            });
        }
    }

    render() {

        const columns = [{
                title: 'TOPIC',
                dataIndex: 'topic',
                key: 'topic',
                defaultSortOrder: 'ascend',
                sorter: (a, b) => a.groupId.localeCompare(b.groupId),
                render: (topic, record, index) => {
                    return <Link to={`/topic-info?clusterId=${this.state.clusterId}&topic=${topic}`}>
                        {topic}
                    </Link>
                }
            }, {
                title: 'PARTITION',
                dataIndex: 'partition',
                key: 'partition',
                sorter: (a, b) => a['partition'] - b['partition'],
            }, {
                title: 'END-OFFSET',
                dataIndex: 'logEndOffset',
                key: 'logEndOffset',
                sorter: (a, b) => a['logEndOffset'] - b['logEndOffset'],
            }, {
                title: 'CURRENT-OFFSET',
                dataIndex: 'currentOffset',
                key: 'currentOffset',
                sorter: (a, b) => a['currentOffset'] - b['currentOffset'],
            }, {
                title: 'Lag',
                dataIndex: 'lag',
                key: 'lag',
                sorter: (a, b) => a['lag'] - b['lag'],
            }, {
                title: 'CONSUMER-ID',
                dataIndex: 'consumerId',
                key: 'consumerId',
                render: (consumerId) => {
                    let short = consumerId;
                    if (short && short.length > 10) {
                        short = short.substring(0, 10) + " ...";
                    }
                    return (
                        <Tooltip placement="topLeft" title={consumerId}>
                            {short}
                        </Tooltip>
                    );
                }
            }, {
                title: 'HOST',
                dataIndex: 'host',
                key: 'host',
            }, {
                title: 'CLIENT-ID',
                dataIndex: 'clientId',
                key: 'clientId',
            }
            ]
        ;

        return (
            <div>
                <div className='kd-page-header'>
                    <PageHeader
                        className="site-page-header"
                        onBack={() => {
                            this.props.history.goBack();
                        }}
                        title={this.state.groupId}
                        subTitle={<FormattedMessage id="consumer-group-detail" />}
                    >
                        <Row>
                            <Space size='large'>

                            </Space>
                        </Row>
                    </PageHeader>
                </div>

                <div className='kd-content'>
                    <div style={{marginBottom: 20}}>
                        <Row justify="space-around" align="middle" gutter={24}>
                            <Col span={8} key={1}>
                                <Title level={3}><FormattedMessage id="subscribed-topic" /></Title>
                            </Col>
                            <Col span={16} key={2} style={{textAlign: 'right'}}>
                                <Space>

                                </Space>
                            </Col>
                        </Row>
                    </div>

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
                            showTotal: total => <FormattedMessage id="total-items" values={{total}}/>
                        }}
                    />
                </div>
            </div>
        );
    }
}

export default ConsumerGroupInfo;