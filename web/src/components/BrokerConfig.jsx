import React, {useState} from 'react';
import {Form, Space, Table, Tag, Tooltip, Typography} from "antd";
import request from "../common/request.js";
import {FormattedMessage} from "react-intl";
import {Input} from "antd/lib";
import {useQuery} from "react-query";

const EditableCell = ({
                          editing, dataIndex, title, inputType, record, index, children, ...restProps
                      }) => {
    const inputNode = <Input/>;
    return (<td {...restProps}>
        {editing ? (<Form.Item
            name={dataIndex}
            style={{
                margin: 0,
            }}
            rules={[{
                required: true, message: `Please Input ${title}!`,
            },]}
        >
            {inputNode}
        </Form.Item>) : (children)}
    </td>);
};

const BrokerConfig = ({clusterId, brokerId}) => {
    const [form] = Form.useForm();
    const [editingName, setEditingName] = useState('');

    const isEditing = (record) => record.name === editingName;

    let queryBrokerConfig = useQuery('get-broker-config',
        () => {
            return request.get(`/brokers/${brokerId}/configs?clusterId=${clusterId}`)
        }, {
            enabled: brokerId !== undefined && brokerId !== ''
        });

    const edit = (record) => {
        form.setFieldsValue({
            ...record,
        });
        setEditingName(record.name);
    };

    const cancel = () => {
        setEditingName('');
    };

    const save = async (key) => {
        try {
            const row = await form.validateFields();
            let params = {};
            params[key] = row['value'];

            await request.put(`/brokers/${brokerId}/configs?clusterId=${clusterId}`, params);
            queryBrokerConfig.refetch();
        } finally {
            setEditingName('');
        }
    };

    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            ellipsis: true,
            render: (value) => {
                return <Tooltip title={value}>
                    <span>{value}</span>
                </Tooltip>
            }
        },
        {
            title: 'Value',
            dataIndex: 'value',
            editable: true,
            ellipsis: true,
            render: (value, record) => {
                if (record['_default'] === true) {
                    return <>
                        <Tag color="default">default</Tag>
                        <Tooltip title={value}>
                            <span>{value}</span>
                        </Tooltip>
                    </>;
                } else {
                    return <Tooltip title={value}>
                        <span>{value}</span>
                    </Tooltip>;
                }
            }
        },
        {
            title: <FormattedMessage id="operate"/>, dataIndex: 'operation', render: (_, record) => {
                const editable = isEditing(record);
                if (editable) {
                    return <Space>
                        <Typography.Link onClick={() => save(record.name)}>
                            <FormattedMessage id="save"/>
                        </Typography.Link>
                        <Typography.Link onClick={cancel}>
                            <FormattedMessage id="cancelText"/>
                        </Typography.Link>
                    </Space>
                } else {
                    return <Typography.Link disabled={editingName !== '' || record['readonly']}
                                            onClick={() => edit(record)}>
                        <FormattedMessage id="edit"/>
                    </Typography.Link>
                }
            },
        },];
    const mergedColumns = columns.map((col) => {
        if (!col.editable) {
            return col;
        }

        return {
            ...col, onCell: (record) => ({
                record,
                inputType: 'text',
                dataIndex: col.dataIndex,
                title: col.title,
                editing: isEditing(record),
            }),
        };
    });

    return (<div>
        <Form form={form} component={false}>
            <Table
                components={{
                    body: {
                        cell: EditableCell,
                    },
                }}
                rowKey='name'
                loading={queryBrokerConfig.isLoading}
                bordered
                dataSource={queryBrokerConfig.data}
                columns={mergedColumns}
                rowClassName="editable-row"
                pagination={false}
            />
        </Form>
    </div>);
};

export default BrokerConfig;