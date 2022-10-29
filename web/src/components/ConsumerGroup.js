import React, {Component} from 'react';
import {
    Button,
    message,
    Table,
    Tooltip,
    Row,
    Col,
    Typography,
    Space,
    Input,
    Divider,
    Popconfirm, PageHeader, Popover, List
} from "antd";
import request from "../common/request";
import qs from "qs";
import {
    SyncOutlined,
    UndoOutlined
} from '@ant-design/icons';
import {Link} from "react-router-dom";
import {FormattedMessage} from "react-intl";

const {Search} = Input;
const {Title} = Typography;

class ConsumerGroup extends Component {

    inputRefOfName = React.createRef();
    form = React.createRef();

    state = {
        items: [],
        queryParams: {
            pageIndex: 1,
            pageSize: 10
        },
        loading: false,
        clusterId: undefined,
        clusterName: undefined,
    }

    componentDidMount() {
        let urlParams = new URLSearchParams(this.props.location.search);
        let clusterId = urlParams.get('clusterId');
        let clusterName = urlParams.get('clusterName');
        this.setState({
            clusterId: clusterId,
            clusterName: clusterName
        })
        let query = {
            ...this.state.queryParams,
            'clusterId': clusterId,
        }
        this.loadTableData(query);
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
            items = await request.get('/consumerGroups?' + paramsStr);
        } catch (e) {
            console.log(e);
        } finally {
            this.setState({
                items: items,
                queryParams: queryParams,
                loading: false
            });
        }
    }

    async delete(groupId, index) {
        let items = this.state.items;
        items[index]['deleting'] = true;
        this.setState({
            items: items
        })
        try {
            await request.delete(`/consumerGroups/${groupId}?clusterId=${this.state.clusterId}`);
            message.success('删除成功');
        } finally {
            this.loadTableData(this.state.queryParams);
        }
    }

    handleSearchByName = value => {
        let query = {
            ...this.state.queryParams,
            'groupId': value,
        }

        this.loadTableData(query);
    };

    render() {

        const columns = [{
                title: <FormattedMessage id="index"/>,
                dataIndex: 'id',
                key: 'id',
                render: (id, record, index) => {
                    return index + 1;
                }
            }, {
                title: <FormattedMessage id="name"/>,
                dataIndex: 'groupId',
                key: 'groupId',
                defaultSortOrder: 'ascend',
                sorter: (a, b) => a.groupId.localeCompare(b.groupId),
                width: window.innerWidth * 0.3,
                render: (groupId, record, index) => {
                    return <Link to={`/consumer-group-info?clusterId=${this.state.clusterId}&groupId=${groupId}`}>
                        {groupId}
                    </Link>
                }
            }, {
                title: <FormattedMessage id="topic-count"/>,
                dataIndex: 'topicCount',
                key: 'topicCount',
                sorter: (a, b) => a['topics'].length - b['topics'].length,
                render: (topicCount, record, index) => {
                    const content = <List
                        size="small"
                        dataSource={record['topics']}
                        renderItem={item => <List.Item><Link
                            to={`/topic-info?clusterId=${this.state.clusterId}&topic=${item}`}>{item}</Link></List.Item>}
                    />

                    return <Popover content={content} title={<FormattedMessage id="topic-list"/>}>
                        <Button type="link" size='small'>{record['topics'].length}</Button>
                    </Popover>
                }

            },
                {
                    title: <FormattedMessage id="operate"/>,
                    key: 'action',
                    render: (text, record, index) => {
                        return (
                            <div>
                                <Popconfirm
                                    title={<FormattedMessage id="delete-confirm"/>}
                                    onConfirm={() => this.delete(record['groupId'], index)}
                                >
                                    <Button type="text" size='small' danger
                                            loading={this.state.items[index]['deleting']}><FormattedMessage
                                        id="delete"/></Button>
                                </Popconfirm>


                            </div>
                        )
                    },
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
                        subTitle={<FormattedMessage id="consumer-group-management"/>}
                        title={this.state.clusterName}
                    />
                </div>

                <div className='kd-content'>
                    <div style={{marginBottom: 20}}>
                        <Row justify="space-around" align="middle" gutter={24}>
                            <Col span={8} key={1}>
                                <Title level={3}>Consumer Group</Title>
                            </Col>
                            <Col span={16} key={2} style={{textAlign: 'right'}}>
                                <Space>
                                    <Search
                                        ref={this.inputRefOfName}
                                        placeholder="Group ID"
                                        allowClear
                                        onSearch={this.handleSearchByName}
                                    />
                                    <Tooltip title={<FormattedMessage id="reset"/>}>

                                        <Button icon={<UndoOutlined/>} onClick={() => {
                                            this.inputRefOfName.current.setValue('');
                                            this.loadTableData({
                                                pageIndex: 1,
                                                pageSize: 10,
                                                clusterId: this.state.clusterId,
                                                name: ''
                                            })
                                        }}>

                                        </Button>
                                    </Tooltip>

                                    <Divider type="vertical"/>

                                    <Tooltip title={<FormattedMessage id="refresh"/>}>
                                        <Button icon={<SyncOutlined/>} onClick={() => {
                                            this.loadTableData(this.state.queryParams)
                                        }}>

                                        </Button>
                                    </Tooltip>
                                </Space>
                            </Col>
                        </Row>
                    </div>

                    <Table
                        rowKey='groupId'
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

export default ConsumerGroup;