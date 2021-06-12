import React from 'react';
import {Form, Input, Modal} from "antd/lib/index";
import {FormattedMessage} from "react-intl";

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
                        let success = handleOk(values);
                        if(success === true){
                            form.resetFields();
                        }
                    })
                    .catch(info => {

                    });
            }}
            onCancel={handleCancel}
            confirmLoading={confirmLoading}
            okText={<FormattedMessage id="okText" />}
            cancelText={<FormattedMessage id="cancelText" />}
        >

            <Form form={form} {...formItemLayout} initialValues={model}>
                <Form.Item name='id' noStyle>
                    <Input hidden={true}/>
                </Form.Item>

                <Form.Item label={<FormattedMessage id="name" />} name='name' rules={[{required: true, message: 'Please enter name'}]}>
                    <Input placeholder="" maxLength={200}/>
                </Form.Item>

                {
                    model['id'] === undefined ?
                        <Form.Item label={<FormattedMessage id="servers" />} name='servers' rules={[{required: true, message: 'Please enter broker servers'}]}>
                            <TextArea rows={4}
                                      maxLength={500}
                                      placeholder="172.18.0.1:9092,172.18.0.2:9092,172.18.0.3:9092"/>
                        </Form.Item> : undefined
                }


            </Form>
        </Modal>
    )
};

export default ClusterModal;