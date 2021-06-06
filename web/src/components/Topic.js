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
    Popconfirm, PageHeader, Form, InputNumber
} from "antd";
import request from "../common/request";
import qs from "qs";
import {
    PlusOutlined,
    SyncOutlined,
    UndoOutlined
} from '@ant-design/icons';
import {Link} from "react-router-dom";
import TopicModal from "./TopicModal";
import {renderSize} from "../utils/utils";
import {FormattedMessage} from "react-intl";
const {Search} = Input;
const {Title} = Typography;

const formItemLayout = {
    labelCol: {span: 6},
    wrapperCol: {span: 14},
};

class Topic extends Component {

    inputRefOfName = React.createRef();
    form = React.createRef();

    state = {
        items: [],
        queryParams: {
            pageIndex: 1,
            pageSize: 10
        },
        loading: false,
        modalVisible: false,
        clusterId: undefined,
        clusterName: undefined,
        brokerCount: 1,
        selectedRow: {},
        createPartitionConfirmLoading: false
    }

    componentDidMount() {
        let urlParams = new URLSearchParams(this.props.location.search);
        let clusterId = urlParams.get('clusterId');
        let clusterName = urlParams.get('clusterName');
        let brokerCount = urlParams.get('brokerCount');
        this.setState({
            clusterId: clusterId,
            clusterName: clusterName,
            brokerCount: brokerCount
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

    async delete(name, index) {
        let items = this.state.items;
        items[index]['deleting'] = true;
        this.setState({
            items: items
        })
        try {
            await request.post('/topics/batch-delete?clusterId=' + this.state.clusterId, [name]);
            message.success('success');
        } finally {
            this.loadTableData(this.state.queryParams);
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
                title: <FormattedMessage id="index" />,
                dataIndex: 'index',
                key: 'index',
                render: (id, record, index) => {
                    return index + 1;
                }
            }, {
                title: <FormattedMessage id="name" />,
                dataIndex: 'name',
                key: 'name',
                defaultSortOrder: 'ascend',
                sorter: (a, b) => a.name.localeCompare(b.name),
                width: window.innerWidth * 0.3,
                render: (name, record, index) => {
                    return <Link to={`/topic-info?clusterId=${record['clusterId']}&topic=${name}`}>
                        {name}
                    </Link>
                }
            }, {
                title: <FormattedMessage id="partitions" />,
                dataIndex: 'partitionsCount',
                key: 'partitionsCount',
                sorter: (a, b) => a['partitionsCount'] - b['partitionsCount'],
            }, {
                title: <FormattedMessage id="replicas" />,
                dataIndex: 'replicaCount',
                key: 'replicaCount',
                sorter: (a, b) => a['replicaCount'] - b['replicaCount'],
            }, {
                title: <FormattedMessage id="average-log-size" />,
                dataIndex: 'x',
                key: 'x',
                sorter: (a, b) => a['totalLogSize'] / a['replicaCount'] - b['totalLogSize'] / b['replicaCount'],
                render: (x, record) => {
                    if (record['totalLogSize'] < 0) {
                        return '不支持';
                    }
                    return renderSize(record['totalLogSize'] / record['replicaCount'])
                }
            }, {
                title: <FormattedMessage id="log-size" />,
                dataIndex: 'totalLogSize',
                key: 'totalLogSize',
                sorter: (a, b) => a['totalLogSize'] - b['totalLogSize'],
                render: (totalLogSize) => {
                    if (totalLogSize < 0) {
                        return '不支持';
                    } else {
                        return renderSize(totalLogSize);
                    }
                }
            },
                {
                    title: <FormattedMessage id="operate" />,
                    key: 'action',
                    render: (text, record, index) => {
                        return (
                            <div>

                                <Link to={`/topic-data?clusterId=${this.state.clusterId}&topic=${record['name']}`}>
                                    <Button key="1" type="link" size='small'>
                                        <FormattedMessage id="consume-message" />
                                    </Button>
                                </Link>

                                <Button type="link" size='small' onClick={() => {
                                    this.setState({
                                        createPartitionVisible: true,
                                        selectedRow: record
                                    })
                                }}><FormattedMessage id="topic-alter" /></Button>

                                <Popconfirm
                                    title={<FormattedMessage id="delete-confirm" />}
                                    onConfirm={() => this.delete(record['name'], index)}
                                >
                                    <Button type="text" size='small' danger
                                            loading={this.state.items[index]['deleting']}><FormattedMessage id="delete" /></Button>
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
                        subTitle={<FormattedMessage id="topic-management" />}
                        title={this.state.clusterName}
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
                                        placeholder="topic"
                                        allowClear
                                        onSearch={this.handleSearchByName}
                                    />
                                    <Tooltip title={<FormattedMessage id="reset" />}>

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

                                    <Tooltip title={<FormattedMessage id="create-topic" />}>
                                        <Button type="dashed" icon={<PlusOutlined/>}
                                                onClick={() => this.showModal(<FormattedMessage id="create-topic" />)}>

                                        </Button>
                                    </Tooltip>

                                    <Tooltip title={<FormattedMessage id="refresh" />}>
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

                    {
                        this.state.modalVisible ?
                            <TopicModal
                                title={this.state.modalTitle}
                                handleOk={this.handleOk}
                                handleCancel={this.handleCancelModal}
                                confirmLoading={this.state.modalConfirmLoading}
                                model={this.state.model}
                                brokerCount={this.state.brokerCount}
                            /> : undefined
                    }

                    <Modal title={<FormattedMessage id="topic-alter" />}
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
                            <Form.Item label={<FormattedMessage id="numPartitions" />} name='totalCount' rules={[{required: true}]}>
                                <InputNumber min={this.state.selectedRow['partitionsCount']}
                                             placeholder={"Can't be less than the current: " + this.state.selectedRow["partitionsCount"]}
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