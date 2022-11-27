import React from 'react';
import {Form, Input, Modal, Select} from "antd/lib/index";
import {FormattedMessage} from "react-intl";

const {TextArea} = Input;

const SendMessageModal = ({partitions, handleOk, handleCancel, confirmLoading}) => {

    const [form] = Form.useForm();

    const formItemLayout = {
        labelCol: {span: 6},
        wrapperCol: {span: 14},
    };

    return (

        <Modal
            title={<FormattedMessage id="produce-message"/>}
            width={window.innerWidth * 0.4}
            open={true}
            maskClosable={false}
            onOk={() => {
                form
                    .validateFields()
                    .then(values => {
                        let success = handleOk(values);
                        if (success === true) {
                            form.resetFields();
                        }
                    })
                    .catch(info => {

                    });
            }}
            onCancel={handleCancel}
            confirmLoading={confirmLoading}
            okText={<FormattedMessage id="okText"/>}
            cancelText={<FormattedMessage id="cancelText"/>}
        >

            <Form form={form} {...formItemLayout} initialValues={{partition: 0}}>

                <Form.Item label={'Partition'} name='partition' rules={[{required: true}]}>
                    <Select>
                        {
                            partitions.map(item => {
                                return <Select.Option key={'p' + item['partition']}
                                                      value={item['partition']}>{item['partition']}</Select.Option>
                            })
                        }
                    </Select>
                </Form.Item>

                <Form.Item label={'Key'} name='key'>
                    <Input placeholder=""/>
                </Form.Item>

                <Form.Item label={'Value'} name='value' rules={[{required: true, message: 'Please enter value'}]}>
                    <TextArea rows={6}
                              placeholder=""/>
                </Form.Item>
            </Form>
        </Modal>
    )
};

export default SendMessageModal;