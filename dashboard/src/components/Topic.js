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
    Select,
    Popconfirm, PageHeader, Form, Radio, InputNumber
} from "antd";
import request from "../common/request";
import qs from "qs";
import {
    DeleteOutlined,
    ExclamationCircleOutlined,
    PlusOutlined,
    SyncOutlined,
    UndoOutlined
} from '@ant-design/icons';
import {Link} from "react-router-dom";
import TopicModal from "./TopicModal";

const confirm = Modal.confirm;
const {Search} = Input;
const {Title, Text} = Typography;

const formItemLayout = {
    labelCol: {span: 6},
    wrapperCol: {span: 14},
};

class Topic extends Component {

    inputRefOfName = React.createRef();
    form = React.createRef();

    state = {
        items: [],
        clusters: [],
        selectedRowKeys: [],
        queryParams: {
            pageIndex: 1,
            pageSize: 10
        },
        loading: false,
        modalVisible: false,
        clusterId: undefined,
        clusterName: undefined,
        selectedRow: {},
        createPartitionConfirmLoading: false
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
            items = await request.get('/topics?' + paramsStr);
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

    showModal = async (title) => {
        this.setState({
            modalTitle: title,
            modalVisible: true,
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

            } else {
                formData['clusterId'] = this.state.clusterId;
                // 向后台提交数据
                await request.post('/topics', formData);
                message.success('操作成功', 3);
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

    async delete(name, index) {
        let items = this.state.items;
        items[index]['deleting'] = true;
        this.setState({
            items: items
        })
        try {
            await request.post('/topics/batch-delete?clusterId=' + this.state.clusterId, [name]);
            message.success('删除成功');
        } finally {
            this.loadTableData(this.state.queryParams);
        }
    }

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

    handleSearchByName = name => {
        let query = {
            ...this.state.queryParams,
            'name': name,
        }

        this.loadTableData(query);
    };

    render() {

        const columns = [{
                title: '序号',
                dataIndex: 'id',
                key: 'id',
                render: (id, record, index) => {
                    return index + 1;
                }
            }, {
                title: 'Topic名称',
                dataIndex: 'name',
                key: 'name',
                defaultSortOrder: 'ascend',
                sorter: (a, b) => a.name.localeCompare(b.name),
                width: window.innerWidth * 0.4,
                render: (name, record, index) => {
                    return <Link to={`/topic-info?clusterId=${record['clusterId']}&topic=${name}`}>
                        {name}
                    </Link>
                }
            }, {
                title: '分区数量',
                dataIndex: 'partitionsSize',
                key: 'partitionsSize',
                sorter: (a, b) => a['partitionsSize'] - b['partitionsSize'],
            },
                {
                    title: '操作',
                    key: 'action',
                    render: (text, record, index) => {
                        return (
                            <div>
                                <Button type="link" size='small' onClick={() => {
                                    this.setState({
                                        createPartitionVisible: true,
                                        selectedRow: record
                                    })
                                }}>分区扩容</Button>

                                <Popconfirm
                                    title="您确认要删除此Topic吗?"
                                    onConfirm={() => this.delete(record['name'], index)}
                                >
                                    <Button type="text" size='small' danger
                                            loading={this.state.items[index]['deleting']}>删除</Button>
                                </Popconfirm>


                            </div>
                        )
                    },
                }
            ]
        ;

        const selectedRowKeys = this.state.selectedRowKeys;
        const rowSelection = {
            selectedRowKeys: this.state.selectedRowKeys,
            onChange: (selectedRowKeys, selectedRows) => {
                this.setState({selectedRowKeys});
            },
        };
        const hasSelected = selectedRowKeys.length > 0;

        const clusterOptions = this.state.clusters.map(d => <Select.Option key={d.id}
                                                                           value={d.id}>{d.name}</Select.Option>);

        return (
            <div>
                <div className='kd-page-header'>
                    <PageHeader
                        className="site-page-header"
                        onBack={() => {
                            this.props.history.goBack();
                        }}
                        title={'主题管理'}
                        subTitle={this.state.clusterName}
                    />
                </div>

                <div className='kd-content'>
                    <div style={{marginBottom: 20}}>
                        <Row justify="space-around" align="middle" gutter={24}>
                            <Col span={4} key={1}>
                                <Title level={3}>Topic</Title>
                            </Col>
                            <Col span={20} key={2} style={{textAlign: 'right'}}>
                                <Space>
                                    <Search
                                        ref={this.inputRefOfName}
                                        placeholder="Topic名称"
                                        allowClear
                                        onSearch={this.handleSearchByName}
                                    />
                                    <Tooltip title='重置查询'>

                                        <Button icon={<UndoOutlined/>} onClick={() => {
                                            this.inputRefOfName.current.setValue('');
                                            this.loadTableData({pageIndex: 1, pageSize: 10, clusterId: '', name: ''})
                                        }}>

                                        </Button>
                                    </Tooltip>

                                    <Divider type="vertical"/>

                                    <Tooltip title="创建Topic">
                                        <Button type="dashed" icon={<PlusOutlined/>}
                                                onClick={() => this.showModal('创建Topic')}>

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
                        loading={this.state.loading}
                        pagination={{
                            showSizeChanger: true,
                            total: this.state.items.length,
                            showTotal: total => `总计 ${total} 条`
                        }}
                    />

                    {
                        this.state.modalVisible ?
                            <TopicModal
                                title={this.state.modalTitle}
                                handleOk={this.handleOk}
                                handleCancel={this.handleCancelModal}
                                confirmLoading={this.state.modalConfirmLoading}
                                model={this.state.model}
                            /> : undefined
                    }

                    <Modal title="分区扩容"
                           visible={this.state.createPartitionVisible}
                           confirmLoading={this.state.createPartitionConfirmLoading}
                           onOk={() => {
                               this.form.current
                                   .validateFields()
                                   .then(async values => {
                                       this.setState({
                                           createPartitionConfirmLoading: true
                                       })
                                       let topic = this.state.selectedRow['name'];
                                       let clusterId = this.state.clusterId;

                                       await request.post(`/topics/${topic}/partitions?clusterId=${clusterId}&totalCount=${values['totalCount']}`);
                                       this.form.current.resetFields();
                                       this.setState({
                                           createPartitionVisible: false
                                       })
                                       this.loadTableData();
                                   })
                                   .catch(info => {

                                   }).finally(() => this.setState({createPartitionConfirmLoading: false}));
                           }}
                           onCancel={() => {
                               this.setState({
                                   createPartitionVisible: false
                               })
                           }}>
                        <Form ref={this.form} {...formItemLayout}>
                            <Form.Item label="总分区数量" name='totalCount' rules={[{required: true}]}>
                                <InputNumber min={this.state.selectedRow['partitionsSize']}
                                             placeholder={'不能小于当前分区数量：' + this.state.selectedRow["partitionsSize"]}
                                             style={{width: '100%'}}/>
                            </Form.Item>
                        </Form>
                    </Modal>

                </div>
            </div>

        );
    }
}

export default Topic;