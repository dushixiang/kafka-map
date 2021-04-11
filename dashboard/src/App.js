import React from 'react';
import 'antd/dist/antd.css';
import './App.css';
import {Layout} from 'antd';
import {Route, Switch} from 'react-router-dom';
import Cluster from "./components/Cluster";
import Topic from "./components/Topic";
import TopicInfo from "./components/TopicInfo";
import TopicData from "./components/TopicData";
import Broker from "./components/Broker";
import ConsumerGroup from "./components/ConsumerGroup";
import ConsumerGroupInfo from "./components/ConsumerGroupInfo";

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
                                    <Route path="/broker" component={Broker}/>
                                    <Route path="/consumer-group" component={ConsumerGroup}/>
                                    <Route path="/consumer-group-info" component={ConsumerGroupInfo}/>
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
