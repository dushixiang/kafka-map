import React from 'react';
import 'antd/dist/antd.css';
import './App.css';
import {Layout, Menu, Breadcrumb, Row, Col, Space} from 'antd';
import {ClusterOutlined, GroupOutlined, OneToOneOutlined, BorderOutlined} from '@ant-design/icons';
import {Link, Route, Switch} from 'react-router-dom';
import Cluster from "./components/Cluster";

const {Header, Content, Footer, Sider} = Layout;

function App() {
    return (
        <div className="App">
            <Switch>
                <Route>
                    <Layout style={{minHeight: '100vh'}}>
                        <Header className="header">
                            <div className='kd-header'>
                                <div className="logo"/>
                                <Menu
                                    theme="dark"
                                    mode="horizontal"
                                    defaultSelectedKeys={[]}
                                    defaultOpenKeys={[]}
                                >
                                    <Menu.Item icon={<ClusterOutlined/>}>
                                        <Link to={'/cluster'}>
                                            集群
                                        </Link>
                                    </Menu.Item>
                                    <Menu.Item icon={<BorderOutlined/>}>
                                        <Link to={'/brokers'}>
                                            Brokers
                                        </Link>
                                    </Menu.Item>
                                    <Menu.Item icon={<OneToOneOutlined/>}>
                                        <Link to={'/topic'}>
                                            Topic
                                        </Link>
                                    </Menu.Item>
                                    <Menu.Item icon={<GroupOutlined/>}>
                                        <Link to={'/consumer'}>
                                            消费组
                                        </Link>
                                    </Menu.Item>
                                </Menu>
                            </div>
                        </Header>
                        <Content className='kd-container'>
                            <Layout className="kd-layout">
                                <Content className='kd-content'>
                                    <Route path="/cluster" exact component={Cluster}/>
                                    {/*<Route path="/deploy/:id"/>*/}
                                </Content>
                            </Layout>
                        </Content>
                        <Footer style={{textAlign: 'center'}}>kafka dashboard ©2021 Created by dushixiang</Footer>
                    </Layout>
                </Route>
            </Switch>

        </div>
    );
}

export default App;
