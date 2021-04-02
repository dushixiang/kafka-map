import React, {useState} from 'react';
import {Form, Input, Modal, InputNumber} from "antd/lib/index";

const {TextArea} = Input;

const TopicModal = ({title, handleOk, handleCancel, confirmLoading, model}) => {

    const [form] = Form.useForm();

    const formItemLayout = {
        labelCol: {span: 6},
        wrapperCol: {span: 14},
    };

    if (model === null || model === undefined) {
        model = {}
    }

    return (

        <Modal
            title={title}
            visible={true}
            maskClosable={false}
            onOk={() => {
                form
                    .validateFields()
                    .then(values => {
                        form.resetFields();
                        handleOk(values);
                    })
                    .catch(info => {

                    });
            }}
            onCancel={handleCancel}
            confirmLoading={confirmLoading}
            okText='确定'
            cancelText='取消'
        >

            <Form form={form} {...formItemLayout} initialValues={model}>
                <Form.Item name='id' noStyle>
                    <Input hidden={true}/>
                </Form.Item>

                <Form.Item label="Topic名称" name='name' rules={[{required: true, message: '请输入Topic名称'}]}>
                    <Input placeholder="请输入Topic名称"/>
                </Form.Item>

                <Form.Item label="分区数量" name='numPartitions' rules={[{required: true}]}>
                    <InputNumber min={1}/>
                </Form.Item>

                <Form.Item label="副本数量" name='replicationFactor' rules={[{required: true}]}>
                    <InputNumber min={1}/>
                </Form.Item>

            </Form>
        </Modal>
    )
};

export default TopicModal;