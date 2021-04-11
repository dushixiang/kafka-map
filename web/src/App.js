import React, {Component} from 'react';
import 'antd/dist/antd.css';
import './App.css';
import {Layout} from 'antd';
import {Link, Route, Switch} from 'react-router-dom';
import Cluster from "./components/Cluster";
import Topic from "./components/Topic";
import TopicInfo from "./components/TopicInfo";
import TopicData from "./components/TopicData";
import Broker from "./components/Broker";
import ConsumerGroup from "./components/ConsumerGroup";
import ConsumerGroupInfo from "./components/ConsumerGroupInfo";
import {NT_PACKAGE} from "./utils/utils";

const {Header, Content, Footer} = Layout;

class App extends Component {

    state = {
        package: NT_PACKAGE(),
    }

    render() {
        return (
            <div className="App">
                <Switch>
                    <Route>
                        <Layout style={{minHeight: '100vh'}}>
                            <Header className="header">
                                <div className='km-header'>
                                    <Link to={'/'}>
                                        <span className='ka-header-logo'>Kafka Map</span>
                                    </Link>
                                </div>
                            </Header>
                            <Content className='km-container'>
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
                            <Footer style={{textAlign: 'center'}}>kafka map ©2021 Created by dushixiang
                                Version:{this.state.package['version']}</Footer>
                        </Layout>
                    </Route>
                </Switch>

            </div>
        );
    }

}

export default App;
