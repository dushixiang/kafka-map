import React, {useEffect, useState} from 'react';
import request from "../common/request";
import {Form, message, Space, Table, Tag, Typography} from "antd";
import {Input} from "antd/lib/index";
import {FormattedMessage} from "react-intl";

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

const TopicConfig = (props) => {

    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);
    const [form] = Form.useForm();
    const [editingName, setEditingName] = useState('');
    const [topic, setTopic] = useState('');
    const [clusterId, setClusterId] = useState('');

    const isEditing = (record) => record.name === editingName;

    useEffect(() => {
        let clusterId = props.clusterId;
        let topic = props.topic;
        setTopic(topic);
        setClusterId(clusterId);
        loadItems(clusterId, topic);
    }, []);

    const loadItems = async (clusterId, topic) => {
        setLoading(true);
        let items = await request.get(`/topics/${topic}/configs?clusterId=${clusterId}`);
        setData(items);
        setLoading(false);
    }

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

            await request.put(`/topics/${topic}/configs?clusterId=${clusterId}`, params);
            await loadItems(clusterId, topic);
        }finally {
            setEditingName('');
        }
    };

    const columns = [
        {title: 'Name', dataIndex: 'name',},
        {
            title: 'Value', dataIndex: 'value', editable: true, render: (value, record) => {
                if (record['_default'] === true) {
                    return <><Tag color="default">default</Tag> {value} </> ;
                } else {
                    return value;
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
                loadding={loading}
                bordered
                dataSource={data}
                columns={mergedColumns}
                rowClassName="editable-row"
                pagination={false}
            />
        </Form>
    </div>);
}

export default TopicConfig;