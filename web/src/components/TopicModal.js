import React from 'react';
import {Form, Input, Modal, InputNumber} from "antd/lib/index";
import {FormattedMessage} from "react-intl";

const TopicModal = ({title, handleOk, handleCancel, confirmLoading, model, brokerCount}) => {

    const [form] = Form.useForm();

    const formItemLayout = {
        labelCol: {span: 8},
        wrapperCol: {span: 12},
    };

    if (model === null || model === undefined) {
        model = {
            'numPartitions': 1,
            'replicationFactor': 1
        }
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
                        if (success === true) {
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

                <Form.Item label={<FormattedMessage id="name" />} name='name' rules={[{required: true}]}>
                    <Input placeholder=""/>
                </Form.Item>

                <Form.Item label={<FormattedMessage id="numPartitions" />} name='numPartitions' rules={[{required: true}]}>
                    <InputNumber min={1} style={{width: '100%'}} placeholder={'The number of partitions should be consistent with the number of consumer clients'}/>
                </Form.Item>

                <Form.Item label={<FormattedMessage id="replicationFactor" />} name='replicationFactor' rules={[{required: true}]}>
                    <InputNumber min={1} max={brokerCount} style={{width: '100%'}}
                                 placeholder={'The number of copies cannot be greater than the number of cluster Broker: ' + brokerCount}/>
                </Form.Item>

            </Form>
        </Modal>
    )
};

export default TopicModal;