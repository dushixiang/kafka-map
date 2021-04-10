import React from 'react';
import 'antd/dist/antd.css';
import './App.css';
import {Layout, Menu, Breadcrumb, Row, Col, Space} from 'antd';
import {ClusterOutlined, GroupOutlined, OneToOneOutlined, BorderOutlined} from '@ant-design/icons';
import {Link, Route, Switch} from 'react-router-dom';
import Cluster from "./components/Cluster";
import Topic from "./components/Topic";
import TopicInfo from "./components/TopicInfo";
import TopicData from "./components/TopicData";

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

                            </div>
                        </Header>
                        <Content className='kd-container'>
                            <Layout>
                                <Content>
                                    <Route path="/" exact component={Cluster}/>
                                    <Route path="/topic" component={Topic}/>
                                    <Route path="/topic-info" component={TopicInfo}/>
                                    <Route path="/topic-data" component={TopicData}/>
                                </Content>
                            </Layout>
                        </Content>
                        <Footer style={{textAlign: 'center'}}>________ ©2021 Created by dushixiang</Footer>
                    </Layout>
                </Route>
            </Switch>

        </div>
    );
}

export default App;
