import React, {Component} from 'react';
import {Button, message, Table, Tooltip, Modal, Row, Col, Typography, Space, Input, Divider, Popconfirm} from "antd";
import dayjs from "dayjs";
import request from "../common/request";
import qs from "qs";
import {
    DeleteOutlined,
    DownOutlined,
    ExclamationCircleOutlined,
    PlusOutlined,
    SyncOutlined,
    UndoOutlined
} from '@ant-design/icons';
import ClusterModal from "./ClusterModal";
import {Link} from "react-router-dom";

const confirm = Modal.confirm;
const {Search} = Input;
const {Title, Text} = Typography;

class Cluster extends Component {

    inputRefOfName = React.createRef();

    state = {
        items: [],
        total: 0,
        selectedRowKeys: [],
        queryParams: {
            pageIndex: 1,
            pageSize: 10
        },
        loading: false,
        modalVisible: false
    }

    componentDidMount() {
        this.loadTableData();
    }

    async delete(id) {
        await request.delete('/clusters/' + id);
        message.success('删除成功');
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
            const items = data.items.map(item => {
                return {'key': item['id'], ...item}
            })
            this.setState({
                items: items,
                total: data.total,
                queryParams: queryParams,
                loading: false
            });
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
                message.success('修改成功', 3);
                this.setState({
                    modalVisible: false
                });
                await this.loadTableData(this.state.queryParams);
            } else {
                // 向后台提交数据
                await request.post('/clusters', formData);
                message.success('接入成功', 3);
                this.setState({
                    modalVisible: false
                });
                await this.loadTableData(this.state.queryParams);
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
                message.success('操作成功', 3);
                this.setState({
                    selectedRowKeys: []
                })
                await this.loadTableData(this.state.queryParams);
            } else {
                message.error('删除失败 :( ' + result.message, 10);
            }
        } finally {
            this.setState({
                delBtnLoading: false
            })
        }
    }

    render() {

        const columns = [{
            title: '序号',
            dataIndex: 'id',
            key: 'id',
            render: (id, record, index) => {
                return index + 1;
            }
        }, {
            title: '集群名称',
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
            title: '集群地址',
            dataIndex: 'servers',
            key: 'servers',
        }, {
            title: 'Topic数量',
            dataIndex: 'topicCount',
            key: 'topicCount',
            render: (topicCount, record, index) => {
                return <Link to={`/topic?clusterId=${record['id']}&clusterName=${record['name']}`}>
                    {topicCount}
                </Link>
            }
        }, {
            title: 'Broker数量',
            dataIndex: 'brokerCount',
            key: 'brokerCount',
            render: (brokerCount, record, index) => {
                return <Link to={`/broker?clusterId=${record['id']}&clusterName=${record['name']}`}>
                    {brokerCount}
                </Link>
            }
        }, {
            title: '消费组数量',
            dataIndex: 'consumerCount',
            key: 'consumerCount',
            render: (consumerCount, record, index) => {
                return <Link to={`/consumer-group?clusterId=${record['id']}&clusterName=${record['name']}`}>
                    {consumerCount}
                </Link>
            }
        }, {
            title: '创建时间',
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
                title: '操作',
                key: 'action',
                render: (text, record, index) => {
                    return (
                        <div>
                            <Button type="link" size='small' onClick={() => {
                                this.showModal('编辑集群', record)
                            }}>编辑</Button>
                            <Popconfirm
                                title="您确认要移除此集群吗?"
                                onConfirm={() => this.delete(record['id'])}
                            >
                                <Button type="text" size='small' danger>移除</Button>
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
                            <Title level={3}>集群管理</Title>
                        </Col>
                        <Col span={12} key={2} style={{textAlign: 'right'}}>
                            <Space>
                                <Search
                                    ref={this.inputRefOfName}
                                    placeholder="集群名称"
                                    allowClear
                                    onSearch={this.handleSearchByName}
                                />

                                <Tooltip title='重置查询'>

                                    <Button icon={<UndoOutlined/>} onClick={() => {
                                        this.inputRefOfName.current.setValue('');
                                        this.loadTableData({pageIndex: 1, pageSize: 10, name: ''})
                                    }}>

                                    </Button>
                                </Tooltip>

                                <Divider type="vertical"/>

                                <Tooltip title="接入集群">
                                    <Button type="dashed" icon={<PlusOutlined/>}
                                            onClick={() => this.showModal('接入集群')}>

                                    </Button>
                                </Tooltip>

                                <Tooltip title="刷新列表">
                                    <Button icon={<SyncOutlined/>} onClick={() => {
                                        this.loadTableData(this.state.queryParams)
                                    }}>

                                    </Button>
                                </Tooltip>

                                <Tooltip title="批量删除">
                                    <Button type="primary" danger disabled={!hasSelected} icon={<DeleteOutlined/>}
                                            loading={this.state.delBtnLoading}
                                            onClick={() => {
                                                const content = <div>
                                                    您确定要删除选中的<Text style={{color: '#1890FF'}}
                                                                   strong>{this.state.selectedRowKeys.length}</Text>条记录吗？
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
                        showTotal: total => `总计 ${total} 条`
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