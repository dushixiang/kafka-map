import React, {Component} from 'react';
import {
    Button,
    message,
    Table,
    Tooltip,
    Modal,
    Row,
    Col,
    Typography,
    Space,
    Input,
    Divider,
    Popconfirm,
    Switch, Popover, Alert
} from "antd";
import dayjs from "dayjs";
import request from "../common/request";
import qs from "qs";
import {
    DeleteOutlined,
    ExclamationCircleOutlined,
    PlusOutlined,
    SyncOutlined,
    UndoOutlined
} from '@ant-design/icons';
import ClusterModal from "./ClusterModal";
import {Link} from "react-router-dom";
import {FormattedMessage} from "react-intl";

const confirm = Modal.confirm;
const {Search} = Input;
const {Title, Text} = Typography;

const content = (
    <div>
        <Alert style={{marginTop: 5, marginBottom: 10}} message={<FormattedMessage id="delay-message-information1"/>}
               type="info" showIcon/>
        <p><FormattedMessage id="delay-message-information2"/></p>
        <p><FormattedMessage id="delay-message-information3"/></p>
        <pre>
            {JSON.stringify({
                "level": 0,
                "topic": "target",
                "key": "key",
                "value": "value"
            }, null, 4)}
        </pre>
    </div>
);

class Cluster extends Component {

    state = {
        items: [],
        total: 0,
        selectedRowKeys: [],
        queryParams: {
            pageIndex: 1,
            pageSize: 10,
            name: ''
        },
        loading: false,
        modalVisible: false
    }

    componentDidMount() {
        this.loadTableData();
    }

    async delete(id) {
        await request.delete('/clusters/' + id);
        message.success('success');
        await this.loadTableData(this.state.queryParams);
    }

    async loadTableData(queryParams) {
        this.setState({
            loading: true
        });

        queryParams = queryParams || this.state.queryParams;

        // queryParams
        let paramsStr = qs.stringify(queryParams);

        let data = {
            items: [],
            total: 0
        };

        try {
            data = await request.get('/clusters/paging?' + paramsStr);
        } catch (e) {
            console.log(e);
        } finally {
            const items = data.items;
            this.setState({
                items: items,
                total: data.total,
                queryParams: queryParams,
                loading: false
            });

            for (let i = 0; i < items.length; i++) {
                let item = items[i];
                this.loadClusterDetail(item['id']);
            }
        }
    }

    loadClusterDetail = async (clusterId) => {
        let cluster;
        try {
            cluster = await request.get('/clusters/' + clusterId);
        } catch (e) {
            cluster = {
                topicCount: 0,
                brokerCount: 0,
                consumerCount: 0
            }
        } finally {
            let items = this.state.items;
            for (let i = 0; i < items.length; i++) {
                if (items[i]['id'] === clusterId) {
                    items[i]['topicCount'] = cluster['topicCount'];
                    items[i]['brokerCount'] = cluster['brokerCount'];
                    items[i]['consumerCount'] = cluster['consumerCount'];
                    break;
                }
            }
            this.setState({
                items: items
            })
        }
    }

    handleChangPage = (pageIndex, pageSize) => {
        let queryParams = this.state.queryParams;
        queryParams.pageIndex = pageIndex;
        queryParams.pageSize = pageSize;

        this.setState({
            queryParams: queryParams
        });

        this.loadTableData(queryParams)
    };

    handleSearchByName = name => {
        let query = {
            ...this.state.queryParams,
            'pageIndex': 1,
            'pageSize': this.state.queryParams.pageSize,
            'name': name,
        }

        this.loadTableData(query);
    };

    showModal = async (title, model) => {
        this.setState({
            modalTitle: title,
            modalVisible: true,
            model: model
        });
    };

    handleCancelModal = e => {
        this.setState({
            modalTitle: '',
            modalVisible: false
        });
    };

    handleOk = async (formData) => {
        // 弹窗 form 传来的数据
        this.setState({
            modalConfirmLoading: true
        });

        try {
            if (formData.id) {
                // 向后台提交数据
                await request.put('/clusters/' + formData.id, {'name': formData['name']});
                message.success('success', 3);
                this.setState({
                    modalVisible: false
                });
                await this.loadTableData(this.state.queryParams);
            } else {
                // 向后台提交数据
                await request.post('/clusters', formData);
                message.success('success', 3);
                this.setState({
                    modalVisible: false
                });
                await this.loadTableData(this.state.queryParams);
                return true;
            }
        } finally {
            this.setState({
                modalConfirmLoading: false
            });
        }
    };

    batchDelete = async () => {
        this.setState({
            delBtnLoading: true
        })
        try {
            let result = await request.delete('/clusters/' + this.state.selectedRowKeys.join(','));
            if (result.code === 1) {
                message.success('success', 3);
                this.setState({
                    selectedRowKeys: []
                })
                await this.loadTableData(this.state.queryParams);
            } else {
                message.error(+result.message, 10);
            }
        } finally {
            this.setState({
                delBtnLoading: false
            })
        }
    }

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
            dataIndex: 'name',
            key: 'name',
            render: (name, record) => {
                let short = name;
                if (short && short.length > 30) {
                    short = short.substring(0, 30) + " ...";
                }
                return (
                    <Tooltip placement="topLeft" title={name}>
                        {short}
                    </Tooltip>
                );
            },
            sorter: true,
        }, {
            title: <FormattedMessage id="servers"/>,
            dataIndex: 'servers',
            key: 'servers',
        }, {
            title: <FormattedMessage id="delay-message"/>,
            dataIndex: 'delayMessageStatus',
            key: 'delayMessageStatus',
            render: (delayMessageStatus, record, index) => {
                return <Popover content={content}>
                    <Switch checked={delayMessageStatus === 'enabled'}
                            onChange={async (checked) => {
                                let url = `/clusters/${record['id']}/disableDelayMessage`;
                                if (checked) {
                                    url = `/clusters/${record['id']}/enableDelayMessage`;
                                }
                                await request.post(url);
                                this.loadTableData()
                            }
                            }/>
                </Popover>

            }
        }, {
            title: <FormattedMessage id="topic"/>,
            dataIndex: 'topicCount',
            key: 'topicCount',
            render: (topicCount, record, index) => {
                return <Link
                    to={`/topic?clusterId=${record['id']}&clusterName=${record['name']}&brokerCount=${record['brokerCount']}`}>
                    {topicCount}
                </Link>
            }
        }, {
            title: <FormattedMessage id="broker"/>,
            dataIndex: 'brokerCount',
            key: 'brokerCount',
            render: (brokerCount, record, index) => {
                return <Link to={`/broker?clusterId=${record['id']}&clusterName=${record['name']}`}>
                    {brokerCount}
                </Link>
            }
        }, {
            title: <FormattedMessage id="consumer-group"/>,
            dataIndex: 'consumerCount',
            key: 'consumerCount',
            render: (consumerCount, record, index) => {
                return <Link to={`/consumer-group?clusterId=${record['id']}&clusterName=${record['name']}`}>
                    {consumerCount}
                </Link>
            }
        }, {
            title: <FormattedMessage id="created"/>,
            dataIndex: 'created',
            key: 'created',
            render: (text, record) => {
                return (
                    <Tooltip title={text}>
                        {dayjs(text).fromNow()}
                    </Tooltip>
                )
            },
            sorter: true,
        },
            {
                title: <FormattedMessage id="operate"/>,
                key: 'action',
                render: (text, record, index) => {
                    return (
                        <div>
                            <Button type="link" size='small' onClick={() => {
                                this.showModal(<FormattedMessage id="edit"/>, record)
                            }}><FormattedMessage id="edit"/></Button>
                            <Popconfirm
                                title={<FormattedMessage id="delete-confirm"/>}
                                onConfirm={() => this.delete(record['id'])}
                            >
                                <Button type="text" size='small' danger><FormattedMessage id="delete"/></Button>
                            </Popconfirm>
                        </div>
                    )
                },
            }
        ];

        const selectedRowKeys = this.state.selectedRowKeys;
        const rowSelection = {
            selectedRowKeys: this.state.selectedRowKeys,
            onChange: (selectedRowKeys, selectedRows) => {
                this.setState({selectedRowKeys});
            },
        };
        const hasSelected = selectedRowKeys.length > 0;

        return (
            <div className='kd-content'>
                <div style={{marginBottom: 20}}>

                    <Row justify="space-around" align="middle" gutter={24}>
                        <Col span={12} key={1}>
                            <Title level={3}><FormattedMessage id="cluster"/></Title>
                        </Col>
                        <Col span={12} key={2} style={{textAlign: 'right'}}>
                            <Space>
                                <Search
                                    placeholder={'name'}
                                    allowClear
                                    onSearch={this.handleSearchByName}
                                    onChange={e => {
                                        let queryParams = this.state.queryParams;
                                        this.setState({
                                            queryParams: {
                                                ...queryParams,
                                                name: e.target.value
                                            }
                                        })
                                    }}
                                    value={this.state.queryParams.name}
                                />

                                <Tooltip title={<FormattedMessage id="reset"/>}>

                                    <Button icon={<UndoOutlined/>} onClick={() => {
                                        let queryParams = this.state.queryParams;
                                        this.setState({
                                            queryParams: {
                                                ...queryParams,
                                                name: ''
                                            }
                                        })
                                        this.loadTableData({pageIndex: 1, pageSize: 10, name: ''})
                                    }}>

                                    </Button>
                                </Tooltip>

                                <Divider type="vertical"/>

                                <Tooltip title={<FormattedMessage id="import-cluster"/>}>
                                    <Button type="dashed" icon={<PlusOutlined/>}
                                            onClick={() => this.showModal(<FormattedMessage id="import-cluster"/>)}>

                                    </Button>
                                </Tooltip>

                                <Tooltip title={<FormattedMessage id="refresh"/>}>
                                    <Button icon={<SyncOutlined/>} onClick={() => {
                                        this.loadTableData(this.state.queryParams)
                                    }}>

                                    </Button>
                                </Tooltip>

                                <Tooltip title={<FormattedMessage id="batch-delete"/>}>
                                    <Button type="primary" danger disabled={!hasSelected} icon={<DeleteOutlined/>}
                                            loading={this.state.delBtnLoading}
                                            onClick={() => {
                                                const content = <div>
                                                    Are you sure delete <Text style={{color: '#1890FF'}}
                                                                              strong>{this.state.selectedRowKeys.length}</Text> items?
                                                </div>;
                                                confirm({
                                                    icon: <ExclamationCircleOutlined/>,
                                                    content: content,
                                                    onOk: () => {
                                                        this.batchDelete()
                                                    },
                                                    onCancel() {

                                                    },
                                                });
                                            }}>

                                    </Button>
                                </Tooltip>

                            </Space>
                        </Col>
                    </Row>
                </div>

                <Table
                    rowSelection={rowSelection}
                    rowKey='id'
                    dataSource={this.state.items}
                    columns={columns}
                    position={'both'}
                    pagination={{
                        showSizeChanger: true,
                        current: this.state.queryParams.pageIndex,
                        pageSize: this.state.queryParams.pageSize,
                        onChange: this.handleChangPage,
                        onShowSizeChange: this.handleChangPage,
                        total: this.state.total,
                        showTotal: total => {
                            return <FormattedMessage id="total-items" values={{total: total}}/>
                        }
                    }}
                    loading={this.state.loading}
                />

                {
                    this.state.modalVisible ?
                        <ClusterModal
                            title={this.state.modalTitle}
                            handleOk={this.handleOk}
                            handleCancel={this.handleCancelModal}
                            confirmLoading={this.state.modalConfirmLoading}
                            model={this.state.model}
                        /> : undefined
                }
            </div>
        );
    }
}

export default Cluster;