import React, {Component} from 'react';
import {Button, Col, Form, Input, Row, Typography} from "antd";
import {message} from "antd/es";
import request from "../common/request";
const {Title} = Typography;

const formItemLayout = {
    labelCol: {span: 3},
    wrapperCol: {span: 6},
};
const formTailLayout = {
    labelCol: {span: 3},
    wrapperCol: {span: 6, offset: 3},
};

class Info extends Component {

    state = {

    }

    passwordFormRef = React.createRef();

    componentDidMount() {

    }

    onNewPasswordChange(value) {
        this.setState({
            'newPassword': value.target.value
        })
    }

    onNewPassword2Change = (value) => {
        this.setState({
            ...this.validateNewPassword(value.target.value),
            'newPassword2': value.target.value
        })
    }

    validateNewPassword = (newPassword2) => {
        if (newPassword2 === this.state.newPassword) {
            return {
                validateStatus: 'success',
                errorMsg: null,
            };
        }
        return {
            validateStatus: 'error',
            errorMsg: '两次输入的密码不一致',
        };
    }

    changePassword = async (values) => {
        await request.post('/change-password', values);
        message.success('密码修改成功，即将跳转至登录页面');
        window.location.reload();
    }

    render() {
        return (
            <div className='kd-content'>
                <div style={{marginBottom: 20}}>
                    <div style={{marginBottom: 20}}>

                        <Row justify="space-around" align="middle" gutter={24}>
                            <Col span={24} key={1}>
                                <Title level={3}>修改密码</Title>
                            </Col>
                        </Row>
                    </div>
                </div>

                <Form ref={this.passwordFormRef} name="password" onFinish={this.changePassword}>
                    <Form.Item
                        {...formItemLayout}
                        name="oldPassword"
                        label="原始密码"
                        rules={[
                            {
                                required: true,
                                message: '原始密码',
                            },
                        ]}
                    >
                        <Input type='password' placeholder="请输入原始密码"/>
                    </Form.Item>
                    <Form.Item
                        {...formItemLayout}
                        name="newPassword"
                        label="新的密码"
                        rules={[
                            {
                                required: true,
                                message: '请输入新的密码',
                            },
                        ]}
                    >
                        <Input type='password' placeholder="新的密码"
                               onChange={(value) => this.onNewPasswordChange(value)}/>
                    </Form.Item>
                    <Form.Item
                        {...formItemLayout}
                        name="newPassword2"
                        label="确认密码"
                        rules={[
                            {
                                required: true,
                                message: '请和上面输入新的密码保持一致',
                            },
                        ]}
                        validateStatus={this.state.validateStatus}
                        help={this.state.errorMsg || ''}
                    >
                        <Input type='password' placeholder="请和上面输入新的密码保持一致"
                               onChange={(value) => this.onNewPassword2Change(value)}/>
                    </Form.Item>
                    <Form.Item {...formTailLayout}>
                        <Button type="primary" htmlType="submit">
                            提交
                        </Button>
                    </Form.Item>
                </Form>
            </div>
        );
    }
}

export default Info;