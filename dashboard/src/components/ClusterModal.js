import React, {useState} from 'react';
import {Form, Input, Modal, Select} from "antd/lib/index";

const {TextArea} = Input;

const ClusterModal = ({title, handleOk, handleCancel, confirmLoading, model}) => {

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

                <Form.Item label="集群名称" name='name' rules={[{required: true, message: '请输入集群名称'}]}>
                    <Input placeholder="请输入集群名称"/>
                </Form.Item>

                {
                    model['id'] === undefined ?
                        <Form.Item label="broker地址" name='servers' rules={[{required: true, message: '请输入broker地址'}]}>
                            <TextArea rows={4}
                                      placeholder="请输入broker地址，例如 172.18.0.1:9092,172.18.0.2:9092,172.18.0.3:9092"/>
                        </Form.Item> : undefined
                }


            </Form>
        </Modal>
    )
};

export default ClusterModal;